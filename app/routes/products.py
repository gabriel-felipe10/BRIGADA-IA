from flask import Blueprint, request, jsonify
from app.utils.supabase_client import supabase
from app.logging_config import logger

products_bp = Blueprint("products_api", __name__, url_prefix="/api/products")


@products_bp.route("", methods=["GET"])
def get_products():
    """Retorna todos os produtos do Supabase, mapeando para o formato camelCase do front-end."""
    try:
        logger.debug("Buscando produtos no Supabase")
        response = supabase.table("produtos").select("*").execute()
        
        products = []
        for p in response.data:
            products.append({
                "id": p.get("id"),
                "plu": p.get("plu"),
                "barcode": p.get("barcode"),
                "name": p.get("name"),
                "category": p.get("category"),
                "startDate": p.get("start_date"),
                "endDate": p.get("end_date"),
                "unit": p.get("unit"),
                "supplier": p.get("supplier"),
                "location": p.get("location"),
                "quantity": p.get("quantity", 0),
                "column": p.get("column"),
                "columnNumber": p.get("column_number"),
                "isAwaitingReduction": bool(p.get("is_awaiting_reduction", False)),
                "rebaixaStatus": p.get("rebaixa_status", "aguardando"),
                "expiredAction": p.get("expired_action"),
                "signature": p.get("signature"),
                "leaderSignature": p.get("leader_signature"),
                "responsibleName": p.get("responsible_name"),
                "leaderName": p.get("leader_name"),
                "createdAt": p.get("created_at") or p.get("createdAt")
            })
        
        logger.info("Produtos carregados do Supabase | count={}", len(products))
        return jsonify(products)
    except Exception as e:
        logger.exception("Erro ao buscar produtos no Supabase")
        return jsonify({"error": "Erro ao buscar produtos", "details": str(e)}), 500


@products_bp.route("", methods=["POST"])
def create_product():
    """Insere um novo produto no Supabase."""
    try:
        data = request.get_json(force=True)
        logger.debug("Criando produto | data={}", data)
        
        required = ["plu", "name", "category", "endDate"]
        for field in required:
            if not data.get(field):
                return jsonify({"error": f"Campo '{field}' é obrigatório"}), 400
        
        plu = data.get("plu").strip()
        end_date = data.get("endDate")
        
        # Mapeia camelCase para o snake_case do banco
        db_data = {
            "plu": plu,
            "barcode": data.get("barcode") if data.get("barcode") else None,
            "name": data.get("name").strip().upper(),
            "category": data.get("category"),
            "start_date": data.get("startDate") if data.get("startDate") else None,
            "end_date": data.get("endDate"),
            "unit": data.get("unit", "kg"),
            "supplier": data.get("supplier"),
            "location": data.get("location"),
            "quantity": float(data.get("quantity", 0)) if data.get("quantity") is not None else 0.0,
            "column": data.get("column"),
            "column_number": data.get("columnNumber"),
            "is_awaiting_reduction": bool(data.get("isAwaitingReduction", False)),
            "expired_action": data.get("expiredAction"),
            "signature": data.get("signature"),
            "leader_signature": data.get("leaderSignature"),
            "responsible_name": data.get("responsibleName"),
            "leader_name": data.get("leaderName")
        }
        
        try:
            response = supabase.table("produtos").insert(db_data).execute()
        except Exception as e:
            logger.warning("Erro ao salvar produto com campos extras, tentando sem eles: {}", e)
            db_data.pop("column", None)
            db_data.pop("column_number", None)
            db_data.pop("is_awaiting_reduction", None)
            db_data.pop("expired_action", None)
            db_data.pop("signature", None)
            db_data.pop("leader_signature", None)
            db_data.pop("responsible_name", None)
            db_data.pop("leader_name", None)
            response = supabase.table("produtos").insert(db_data).execute()
            
        if not response.data:
            return jsonify({"error": "Erro ao salvar produto no Supabase"}), 500
        
        p = response.data[0]
        created = {
            "id": p.get("id"),
            "plu": p.get("plu"),
            "barcode": p.get("barcode"),
            "name": p.get("name"),
            "category": p.get("category"),
            "startDate": p.get("start_date"),
            "endDate": p.get("end_date"),
            "unit": p.get("unit"),
            "supplier": p.get("supplier"),
            "location": p.get("location"),
            "quantity": p.get("quantity", 0),
            "column": p.get("column"),
            "columnNumber": p.get("column_number"),
            "isAwaitingReduction": bool(p.get("is_awaiting_reduction", False)),
            "expiredAction": p.get("expired_action"),
            "signature": p.get("signature"),
            "leaderSignature": p.get("leader_signature"),
            "responsibleName": p.get("responsible_name"),
            "leaderName": p.get("leader_name"),
            "createdAt": p.get("created_at") or p.get("createdAt")
        }
        
        logger.info("Produto criado no Supabase | id={} plu={}", created["id"], created["plu"])
        return jsonify(created), 201
    except Exception as e:
        logger.exception("Erro ao criar produto no Supabase")
        return jsonify({"error": "Erro ao criar produto", "details": str(e)}), 500


@products_bp.route("/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    """Atualiza um produto existente no Supabase."""
    try:
        data = request.get_json(force=True)
        logger.debug("Atualizando produto | id={} data={}", product_id, data)
        
        # Obter produto atual para auditoria
        curr = supabase.table("produtos").select("plu, name, quantity, unit").eq("id", product_id).execute()
        if not curr.data:
            return jsonify({"error": "Produto não encontrado"}), 404
        old_qty = float(curr.data[0].get("quantity") or 0.0)
        plu_val = curr.data[0].get("plu")
        name_val = curr.data[0].get("name")
        unit_val = curr.data[0].get("unit") or "kg"

        # Validar se a quantidade está sendo reduzida e se há anotação justificando
        if "quantity" in data:
            new_qty = float(data["quantity"]) if data.get("quantity") is not None else 0.0
            if new_qty < old_qty:
                annotation = data.get("annotation", "").strip()
                if not annotation:
                    return jsonify({"error": "Uma justificativa/anotação é necessária para reduzir a quantidade do produto."}), 400

        # Mapeia campos do front-end para o banco
        db_data = {}
        if "plu" in data: db_data["plu"] = data["plu"].strip()
        if "barcode" in data: db_data["barcode"] = data["barcode"].strip() if data["barcode"] else None
        if "name" in data: db_data["name"] = data["name"].strip().upper()
        if "category" in data: db_data["category"] = data["category"]
        if "startDate" in data: db_data["start_date"] = data["startDate"] if data["startDate"] else None
        if "endDate" in data: db_data["end_date"] = data["endDate"]
        if "unit" in data: db_data["unit"] = data["unit"]
        if "supplier" in data: db_data["supplier"] = data["supplier"]
        if "location" in data: db_data["location"] = data["location"]
        if "quantity" in data: db_data["quantity"] = float(data["quantity"]) if data["quantity"] is not None else 0.0
        if "column" in data: db_data["column"] = data["column"]
        if "columnNumber" in data: db_data["column_number"] = data["columnNumber"]
        if "isAwaitingReduction" in data: db_data["is_awaiting_reduction"] = bool(data["isAwaitingReduction"])
        if "expiredAction" in data: db_data["expired_action"] = data["expiredAction"]
        if "signature" in data: db_data["signature"] = data["signature"]
        if "leaderSignature" in data: db_data["leader_signature"] = data["leaderSignature"]
        if "responsibleName" in data: db_data["responsible_name"] = data["responsibleName"]
        if "leaderName" in data: db_data["leader_name"] = data["leaderName"]
        
        try:
            response = supabase.table("produtos").update(db_data).eq("id", product_id).execute()
        except Exception as e:
            logger.warning("Erro ao atualizar produto com campos extras, tentando sem eles: {}", e)
            db_data.pop("column", None)
            db_data.pop("column_number", None)
            db_data.pop("is_awaiting_reduction", None)
            db_data.pop("expired_action", None)
            db_data.pop("signature", None)
            db_data.pop("leader_signature", None)
            db_data.pop("responsible_name", None)
            db_data.pop("leader_name", None)
            response = supabase.table("produtos").update(db_data).eq("id", product_id).execute()
            
        if not response.data:
            return jsonify({"error": "Produto não encontrado ou erro ao atualizar"}), 404
        
        p = response.data[0]
        updated = {
            "id": p.get("id"),
            "plu": p.get("plu"),
            "barcode": p.get("barcode"),
            "name": p.get("name"),
            "category": p.get("category"),
            "startDate": p.get("start_date"),
            "endDate": p.get("end_date"),
            "unit": p.get("unit"),
            "supplier": p.get("supplier"),
            "location": p.get("location"),
            "quantity": p.get("quantity", 0),
            "column": p.get("column"),
            "columnNumber": p.get("column_number"),
            "isAwaitingReduction": bool(p.get("is_awaiting_reduction", False)),
            "expiredAction": p.get("expired_action"),
            "signature": p.get("signature"),
            "leaderSignature": p.get("leader_signature"),
            "responsibleName": p.get("responsible_name"),
            "leaderName": p.get("leader_name"),
            "createdAt": p.get("created_at") or p.get("createdAt")
        }
        
        # Registrar auditoria da edição no SQLite
        if "quantity" in data:
            import uuid
            from datetime import datetime
            from app.services.log_service import save_log
            
            new_qty = updated["quantity"]
            annotation_val = data.get("annotation", "").strip() if new_qty < old_qty else ""
            
            # Pegar criador e editor do payload, com fallbacks adequados
            creator_val = data.get("creator", "").strip()
            editor_val = data.get("editor", "").strip()
            
            if not creator_val:
                # Tentar extrair do supplier do Supabase se disponível
                supplier_field = data.get("supplier", "")
                if "[Criado por: " in supplier_field:
                    try:
                        creator_val = supplier_field.split("[Criado por: ")[1].split("]")[0]
                    except Exception:
                        pass
            
            if not creator_val:
                creator_val = "Jefferson"  # Fallback padrão
            if not editor_val:
                editor_val = "Sistema"
            
            # Limpar domínios de email para exibição mais limpa
            if "@" in creator_val:
                creator_val = creator_val.split("@")[0]
            if "@" in editor_val:
                editor_val = editor_val.split("@")[0]
            
            creator_val = creator_val.capitalize()
            editor_val = editor_val.capitalize()
            
            details_str = f"Produto PLU {plu_val} ({name_val}) cadastrado por {creator_val} e editado por {editor_val}. Quantidade alterada de {old_qty} para {new_qty} {unit_val}."
            if annotation_val:
                details_str += f" Motivo/Anotação: {annotation_val}."
            
            payload_log = {
                "product_id": product_id,
                "plu": plu_val,
                "name": name_val,
                "old_quantity": old_qty,
                "new_quantity": new_qty,
                "unit": unit_val,
                "annotation": annotation_val,
                "creator": creator_val,
                "editor": editor_val
            }
            
            try:
                save_log(
                    request_id=str(uuid.uuid4()),
                    timestamp=datetime.now().isoformat(),
                    payload_type="product_edit",
                    status="success",
                    payload=payload_log,
                    result={"status": "success"},
                    details=details_str,
                    duration_ms=0.0
                )
            except Exception as log_err:
                logger.error("Erro ao salvar log de auditoria no SQLite: {}", log_err)

        logger.info("Produto atualizado no Supabase | id={}", updated["id"])
        return jsonify(updated)
    except Exception as e:
        logger.exception("Erro ao atualizar produto no Supabase")
        return jsonify({"error": "Erro ao atualizar produto", "details": str(e)}), 500


@products_bp.route("/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    """Exclui um produto do Supabase e registra o log."""
    try:
        logger.debug("Removendo produto | id={}", product_id)
        
        # Obter dados do produto original antes de excluir para o log
        original = None
        try:
            get_resp = supabase.table("produtos").select("*").eq("id", product_id).execute()
            if get_resp.data:
                original = get_resp.data[0]
        except Exception as get_err:
            logger.error("Erro ao buscar produto original para exclusão: {}", get_err)

        response = supabase.table("produtos").delete().eq("id", product_id).execute()
        
        if not response.data:
            return jsonify({"error": "Produto não encontrado ou erro ao excluir"}), 404
            
        # Registrar log de exclusão no SQLite
        if original:
            import uuid
            from datetime import datetime
            from app.services.log_service import save_log
            
            data = request.get_json(silent=True) or {}
            annotation_val = data.get("annotation", "").strip() or "Excluir o item"
            creator_val = data.get("creator", "").strip()
            editor_val = data.get("editor", "").strip()
            
            if not creator_val:
                supplier_field = original.get("supplier", "")
                if "[Criado por: " in supplier_field:
                    try:
                        creator_val = supplier_field.split("[Criado por: ")[1].split("]")[0]
                    except Exception:
                        pass
            
            if not creator_val:
                creator_val = "Jefferson"
            if not editor_val:
                editor_val = "Sistema"
                
            if "@" in creator_val:
                creator_val = creator_val.split("@")[0]
            if "@" in editor_val:
                editor_val = editor_val.split("@")[0]
                
            creator_val = creator_val.capitalize()
            editor_val = editor_val.capitalize()
            
            plu_val = original.get("plu", "")
            name_val = original.get("name", "")
            qty_val = original.get("quantity", 0)
            unit_val = original.get("unit", "")
            
            details_str = f"Produto PLU {plu_val} ({name_val}) cadastrado por {creator_val} foi EXCLUÍDO por {editor_val}. Motivo/Anotação: {annotation_val}."
            
            payload_log = {
                "product_id": product_id,
                "plu": plu_val,
                "name": name_val,
                "old_quantity": qty_val,
                "new_quantity": 0,
                "unit": unit_val,
                "annotation": annotation_val,
                "creator": creator_val,
                "editor": editor_val,
                "action": "delete"
            }
            
            try:
                save_log(
                    request_id=str(uuid.uuid4()),
                    timestamp=datetime.now().isoformat(),
                    payload_type="product_edit",
                    status="success",
                    payload=payload_log,
                    result={"status": "success"},
                    details=details_str,
                    duration_ms=0.0
                )
            except Exception as log_err:
                logger.error("Erro ao salvar log de exclusão no SQLite: {}", log_err)

        logger.info("Produto removido do Supabase | id={}", product_id)
        return jsonify({"success": True})
    except Exception as e:
        logger.exception("Erro ao excluir produto no Supabase")
        return jsonify({"error": "Erro ao excluir produto", "details": str(e)}), 500


@products_bp.route("/rebaixa", methods=["PATCH"])
def toggle_rebaixa():
    """Marca/desmarca produtos como aguardando rebaixa no Supabase."""
    try:
        data = request.get_json(force=True)
        ids = data.get("ids", [])
        status = bool(data.get("status", True))
        rebaixa_status = data.get("rebaixaStatus", "aguardando")
        
        if not ids:
            return jsonify({"error": "Nenhum ID fornecido"}), 400
        
        logger.debug("Atualizando rebaixa | ids={} status={} rebaixaStatus={}", ids, status, rebaixa_status)
        
        # Atualiza no Supabase usando in_ filter
        try:
            # Tenta atualizar incluindo a nova coluna (pode falhar se não existir no banco)
            response = supabase.table("produtos").update(
                {"is_awaiting_reduction": status, "rebaixa_status": rebaixa_status}
            ).in_("id", ids).execute()
        except Exception as e:
            logger.warning(f"Falha ao atualizar rebaixa_status (coluna pode não existir), fazendo fallback: {e}")
            response = supabase.table("produtos").update(
                {"is_awaiting_reduction": status}
            ).in_("id", ids).execute()
        
        updated_count = len(response.data) if hasattr(response, 'data') and response.data else 0
        logger.info("Rebaixa atualizada | count={} status={}", updated_count, status)
        
        return jsonify({"success": True, "updated": updated_count})
    except Exception as e:
        logger.exception("Erro ao atualizar status de rebaixa")
        return jsonify({"error": "Erro ao atualizar rebaixa", "details": str(e)}), 500


@products_bp.route("/catalog", methods=["GET"])
def get_catalog():
    """Retorna o catálogo base de produtos (sem datas de validade)."""
    try:
        logger.debug("Buscando catálogo no Supabase")
        response = supabase.table("catalogo_produtos").select("*").execute()
        
        # Mapa de normalização para garantir que as categorias do Supabase
        # correspondam aos valores esperados pelo front-end (select options)
        category_normalize = {
            "aves": "aves",
            "bovino": "bovino",
            "bovinos": "bovino",
            "suino": "suino",
            "suínos": "suino",
            "suinos": "suino",
            "pescado": "pescado",
            "pescados": "pescado",
            "frios": "frios",
            "laticinios": "laticinios",
            "laticínios": "laticinios",
            "iogurtes": "iogurtes",
            "pereciveis": "pereciveis",
            "perecíveis": "pereciveis",
        }
        
        catalog = []
        for p in response.data:
            raw_cat = (p.get("category") or "").strip()
            normalized_cat = category_normalize.get(raw_cat.lower(), raw_cat.lower())
            catalog.append({
                "id": p.get("id"),
                "plu": p.get("plu"),
                "barcode": p.get("barcode"),
                "name": p.get("name"),
                "category": normalized_cat,
                "createdAt": p.get("created_at")
            })
            
        logger.info("Catálogo carregado | count={}", len(catalog))
        return jsonify(catalog)
    except Exception as e:
        logger.exception("Erro ao buscar catálogo no Supabase")
        return jsonify({"error": "Erro ao buscar catálogo", "details": str(e)}), 500

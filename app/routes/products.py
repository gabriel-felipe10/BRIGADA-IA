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
                "expiredAction": p.get("expired_action")
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
        
        # Verifica se já existe um produto com o mesmo PLU
        plu = data.get("plu").strip()
        existing = supabase.table("produtos").select("id, name").eq("plu", plu).execute()
        if existing.data:
            logger.warning("Tentativa de cadastrar PLU duplicado | plu={}", plu)
            return jsonify({"error": f"Já existe um produto cadastrado com o PLU '{plu}' ({existing.data[0]['name']})."}), 409
        
        # Mapeia camelCase para o snake_case do banco
        db_data = {
            "plu": plu,
            "barcode": data.get("barcode") if data.get("barcode") else None,
            "name": data.get("name").strip(),
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
            "expired_action": data.get("expiredAction")
        }
        
        try:
            response = supabase.table("produtos").insert(db_data).execute()
        except Exception as e:
            logger.warning("Erro ao salvar produto com campos extras, tentando sem eles: {}", e)
            db_data.pop("column", None)
            db_data.pop("column_number", None)
            db_data.pop("is_awaiting_reduction", None)
            db_data.pop("expired_action", None)
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
            "expiredAction": p.get("expired_action")
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
        
        # Se alterou o PLU, verifica se não vai duplicar outro produto
        if "plu" in data:
            plu = data["plu"].strip()
            existing = supabase.table("produtos").select("id, name").eq("plu", plu).neq("id", product_id).execute()
            if existing.data:
                logger.warning("Tentativa de atualizar PLU para duplicado | id={} plu={}", product_id, plu)
                return jsonify({"error": f"Já existe outro produto cadastrado com o PLU '{plu}' ({existing.data[0]['name']})."}), 409

        # Mapeia campos do front-end para o banco
        db_data = {}
        if "plu" in data: db_data["plu"] = data["plu"].strip()
        if "barcode" in data: db_data["barcode"] = data["barcode"].strip() if data["barcode"] else None
        if "name" in data: db_data["name"] = data["name"].strip()
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
        
        try:
            response = supabase.table("produtos").update(db_data).eq("id", product_id).execute()
        except Exception as e:
            logger.warning("Erro ao atualizar produto com campos extras, tentando sem eles: {}", e)
            db_data.pop("column", None)
            db_data.pop("column_number", None)
            db_data.pop("is_awaiting_reduction", None)
            db_data.pop("expired_action", None)
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
            "expiredAction": p.get("expired_action")
        }
        
        logger.info("Produto atualizado no Supabase | id={}", updated["id"])
        return jsonify(updated)
    except Exception as e:
        logger.exception("Erro ao atualizar produto no Supabase")
        return jsonify({"error": "Erro ao atualizar produto", "details": str(e)}), 500


@products_bp.route("/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    """Exclui um produto do Supabase."""
    try:
        logger.debug("Removendo produto | id={}", product_id)
        response = supabase.table("produtos").delete().eq("id", product_id).execute()
        
        if not response.data:
            return jsonify({"error": "Produto não encontrado ou erro ao excluir"}), 404
            
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
        
        catalog = []
        for p in response.data:
            catalog.append({
                "id": p.get("id"),
                "plu": p.get("plu"),
                "barcode": p.get("barcode"),
                "name": p.get("name"),
                "category": p.get("category"),
                "createdAt": p.get("created_at")
            })
            
        logger.info("Catálogo carregado | count={}", len(catalog))
        return jsonify(catalog)
    except Exception as e:
        logger.exception("Erro ao buscar catálogo no Supabase")
        return jsonify({"error": "Erro ao buscar catálogo", "details": str(e)}), 500

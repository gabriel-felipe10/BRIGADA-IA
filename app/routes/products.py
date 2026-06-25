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
                "name": p.get("name"),
                "category": p.get("category"),
                "startDate": p.get("start_date"),
                "endDate": p.get("end_date"),
                "unit": p.get("unit"),
                "supplier": p.get("supplier"),
                "location": p.get("location"),
                "quantity": p.get("quantity", 0)
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
        
        # Mapeia camelCase para o snake_case do banco
        db_data = {
            "plu": data.get("plu"),
            "name": data.get("name"),
            "category": data.get("category"),
            "start_date": data.get("startDate") if data.get("startDate") else None,
            "end_date": data.get("endDate"),
            "unit": data.get("unit", "kg"),
            "supplier": data.get("supplier"),
            "location": data.get("location"),
            "quantity": float(data.get("quantity", 0)) if data.get("quantity") is not None else 0.0
        }
        
        response = supabase.table("produtos").insert(db_data).execute()
        if not response.data:
            return jsonify({"error": "Erro ao salvar produto no Supabase"}), 500
        
        p = response.data[0]
        created = {
            "id": p.get("id"),
            "plu": p.get("plu"),
            "name": p.get("name"),
            "category": p.get("category"),
            "startDate": p.get("start_date"),
            "endDate": p.get("end_date"),
            "unit": p.get("unit"),
            "supplier": p.get("supplier"),
            "location": p.get("location"),
            "quantity": p.get("quantity", 0)
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
        
        # Mapeia campos do front-end para o banco
        db_data = {}
        if "plu" in data: db_data["plu"] = data["plu"]
        if "name" in data: db_data["name"] = data["name"]
        if "category" in data: db_data["category"] = data["category"]
        if "startDate" in data: db_data["start_date"] = data["startDate"] if data["startDate"] else None
        if "endDate" in data: db_data["end_date"] = data["endDate"]
        if "unit" in data: db_data["unit"] = data["unit"]
        if "supplier" in data: db_data["supplier"] = data["supplier"]
        if "location" in data: db_data["location"] = data["location"]
        if "quantity" in data: db_data["quantity"] = float(data["quantity"]) if data["quantity"] is not None else 0.0
        
        response = supabase.table("produtos").update(db_data).eq("id", product_id).execute()
        if not response.data:
            return jsonify({"error": "Produto não encontrado ou erro ao atualizar"}), 404
        
        p = response.data[0]
        updated = {
            "id": p.get("id"),
            "plu": p.get("plu"),
            "name": p.get("name"),
            "category": p.get("category"),
            "startDate": p.get("start_date"),
            "endDate": p.get("end_date"),
            "unit": p.get("unit"),
            "supplier": p.get("supplier"),
            "location": p.get("location"),
            "quantity": p.get("quantity", 0)
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

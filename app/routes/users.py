from flask import Blueprint, request, jsonify
from app.utils.supabase_client import supabase
from app.logging_config import logger

users_bp = Blueprint("users_api", __name__, url_prefix="/api/users")


@users_bp.route("", methods=["GET"])
def get_users():
    """Retorna todos os usuários do Supabase, mapeando para camelCase."""
    try:
        logger.debug("Buscando usuários no Supabase")
        response = supabase.table("usuarios").select("*").execute()
        
        users = []
        for u in response.data:
            users.append({
                "id": u.get("id"),
                "name": u.get("name"),
                "email": u.get("email"),
                "password": u.get("password"),
                "role": u.get("role"),
                "avatar": u.get("avatar"),
                "status": u.get("status"),
                "createdAt": u.get("created_at"),
                "lastLogin": u.get("last_login")
            })
        
        logger.info("Usuários carregados do Supabase | count={}", len(users))
        return jsonify(users)
    except Exception as e:
        logger.exception("Erro ao buscar usuários no Supabase")
        return jsonify({"error": "Erro ao buscar usuários", "details": str(e)}), 500


@users_bp.route("", methods=["POST"])
def create_user():
    """Insere um novo usuário no Supabase."""
    try:
        data = request.get_json(force=True)
        logger.debug("Criando usuário | data={}", data)
        
        required = ["name", "email", "password"]
        for field in required:
            if not data.get(field):
                return jsonify({"error": f"Campo '{field}' é obrigatório"}), 400
        
        db_data = {
            "name": data.get("name"),
            "email": data.get("email"),
            "password": data.get("password"),
            "role": data.get("role", "user"),
            "avatar": data.get("avatar", "US"),
            "status": data.get("status", "active")
        }
        
        response = supabase.table("usuarios").insert(db_data).execute()
        if not response.data:
            return jsonify({"error": "Erro ao criar usuário no Supabase"}), 500
        
        u = response.data[0]
        created = {
            "id": u.get("id"),
            "name": u.get("name"),
            "email": u.get("email"),
            "password": u.get("password"),
            "role": u.get("role"),
            "avatar": u.get("avatar"),
            "status": u.get("status"),
            "createdAt": u.get("created_at"),
            "lastLogin": u.get("last_login")
        }
        
        logger.info("Usuário criado no Supabase | id={} email={}", created["id"], created["email"])
        return jsonify(created), 201
    except Exception as e:
        logger.exception("Erro ao criar usuário no Supabase")
        return jsonify({"error": "Erro ao criar usuário", "details": str(e)}), 500


@users_bp.route("/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    """Atualiza um usuário existente no Supabase."""
    try:
        data = request.get_json(force=True)
        logger.debug("Atualizando usuário | id={} data={}", user_id, data)
        
        db_data = {}
        if "name" in data: db_data["name"] = data["name"]
        if "email" in data: db_data["email"] = data["email"]
        if "password" in data: db_data["password"] = data["password"]
        if "role" in data: db_data["role"] = data["role"]
        if "avatar" in data: db_data["avatar"] = data["avatar"]
        if "status" in data: db_data["status"] = data["status"]
        if "lastLogin" in data: db_data["last_login"] = data["lastLogin"]
        
        response = supabase.table("usuarios").update(db_data).eq("id", user_id).execute()
        if not response.data:
            return jsonify({"error": "Usuário não encontrado ou erro ao atualizar"}), 404
        
        u = response.data[0]
        updated = {
            "id": u.get("id"),
            "name": u.get("name"),
            "email": u.get("email"),
            "password": u.get("password"),
            "role": u.get("role"),
            "avatar": u.get("avatar"),
            "status": u.get("status"),
            "createdAt": u.get("created_at"),
            "lastLogin": u.get("last_login")
        }
        
        logger.info("Usuário atualizado no Supabase | id={}", updated["id"])
        return jsonify(updated)
    except Exception as e:
        logger.exception("Erro ao atualizar usuário no Supabase")
        return jsonify({"error": "Erro ao atualizar usuário", "details": str(e)}), 500


@users_bp.route("/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    """Exclui um usuário do Supabase."""
    try:
        logger.debug("Removendo usuário | id={}", user_id)
        response = supabase.table("usuarios").delete().eq("id", user_id).execute()
        
        if not response.data:
            return jsonify({"error": "Usuário não encontrado ou erro ao excluir"}), 404
            
        logger.info("Usuário removido do Supabase | id={}", user_id)
        return jsonify({"success": True})
    except Exception as e:
        logger.exception("Erro ao excluir usuário no Supabase")
        return jsonify({"error": "Erro ao excluir usuário", "details": str(e)}), 500

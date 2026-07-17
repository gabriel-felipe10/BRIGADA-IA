"""
BRIGADA-IA — Rotas da API para produtos sem nota fiscal.
"""

from flask import Blueprint, request, jsonify
from app.models.database import get_db_connection
from app.logging_config import logger

produtos_sem_nota_bp = Blueprint("produtos_sem_nota_api", __name__, url_prefix="/api/produtos-sem-nota")


@produtos_sem_nota_bp.route("", methods=["GET"])
def get_produtos_sem_nota():
    """Retorna todos os produtos sem nota cadastrados."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM produtos_sem_nota ORDER BY created_at DESC")
        rows = cursor.fetchall()
        conn.close()

        result = []
        for r in rows:
            result.append({
                "id": r["id"],
                "plu": r["plu"],
                "name": r["name"],
                "quantity": r["quantity"],
                "arrivalDate": r["arrival_date"],
                "createdBy": r["created_by"],
                "signature": r["signature"],
                "responsibleName": r["responsible_name"] if "responsible_name" in r.keys() else None,
                "createdAt": r["created_at"]
            })

        return jsonify(result)
    except Exception as e:
        logger.exception("Erro ao buscar produtos sem nota")
        return jsonify({"error": "Erro ao buscar registros", "details": str(e)}), 500


@produtos_sem_nota_bp.route("", methods=["POST"])
def create_produto_sem_nota():
    """Cria um novo registro de produto sem nota."""
    try:
        data = request.get_json(force=True)
        plu = data.get("plu")
        name = data.get("name", "").strip().upper()
        quantity = data.get("quantity")
        arrival_date = data.get("arrivalDate")
        created_by = data.get("createdBy", "sistema")
        signature = data.get("signature")
        responsible_name = data.get("responsibleName")

        if not plu or not quantity or not arrival_date:
            return jsonify({"error": "Campos 'plu', 'quantity' e 'arrivalDate' são obrigatórios"}), 400

        try:
            qty_str = str(quantity).split(" ")[0]
            quantity_val = float(qty_str)
        except ValueError:
            return jsonify({"error": "Quantidade deve ser um valor numérico"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO produtos_sem_nota (plu, name, quantity, arrival_date, created_by, signature, responsible_name)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (plu, name, quantity_val, arrival_date, created_by, signature, responsible_name)
        )
        new_id = cursor.lastrowid
        conn.commit()
        conn.close()

        logger.info("Produto sem nota registrado | id={} plu={} qty={}", new_id, plu, quantity_val)
        return jsonify({
            "id": new_id,
            "plu": plu,
            "name": name,
            "quantity": quantity,
            "arrivalDate": arrival_date,
            "createdBy": created_by,
            "signature": signature,
            "responsibleName": responsible_name
        }), 201

    except Exception as e:
        logger.exception("Erro ao criar produto sem nota")
        return jsonify({"error": "Erro ao salvar registro", "details": str(e)}), 500


@produtos_sem_nota_bp.route("/<int:item_id>", methods=["DELETE"])
def delete_produto_sem_nota(item_id):
    """Exclui um registro de produto sem nota."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM produtos_sem_nota WHERE id = ?", (item_id,))
        rows_affected = cursor.rowcount
        conn.commit()
        conn.close()

        if rows_affected == 0:
            return jsonify({"error": "Registro não encontrado"}), 404

        logger.info("Produto sem nota removido | id={}", item_id)
        return jsonify({"success": True})
    except Exception as e:
        logger.exception("Erro ao excluir produto sem nota")
        return jsonify({"error": "Erro ao excluir registro", "details": str(e)}), 500

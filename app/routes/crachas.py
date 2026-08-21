"""
BRIGADA-IA — Rotas da API para Geração e Gestão de Crachás (Etiquetas de Produto).
"""

from flask import Blueprint, request, jsonify
from app.models.database import get_db_connection
from app.logging_config import logger

crachas_bp = Blueprint("crachas_api", __name__, url_prefix="/api/crachas")


@crachas_bp.route("", methods=["GET"])
def get_crachas():
    """Retorna todos os registros de crachás cadastrados."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM crachas ORDER BY created_at DESC, id DESC")
        rows = cursor.fetchall()
        conn.close()

        result = []
        for r in rows:
            result.append({
                "id": r["id"],
                "productName": r["product_name"],
                "quantity": r["quantity"],
                "consincoCode": r["consinco_code"],
                "expiryDate": r["expiry_date"],
                "barcode": r["barcode"],
                "createdBy": r["created_by"],
                "notes": r["notes"],
                "createdAt": r["created_at"]
            })

        return jsonify(result)
    except Exception as e:
        logger.exception("Erro ao buscar registros de crachás")
        return jsonify({"error": "Erro ao buscar registros", "details": str(e)}), 500


@crachas_bp.route("", methods=["POST"])
def create_cracha():
    """Cria um novo registro de crachá."""
    try:
        data = request.get_json(force=True)
        product_name = data.get("productName", "").strip().upper()
        quantity = data.get("quantity")
        consinco_code = data.get("consincoCode", "").strip()
        expiry_date = data.get("expiryDate", "").strip()
        barcode = data.get("barcode", "").strip()
        created_by = data.get("createdBy", "sistema")
        notes = data.get("notes", "").strip()

        if not product_name or not quantity or not expiry_date:
            return jsonify({"error": "Campos 'productName', 'quantity' e 'expiryDate' são obrigatórios"}), 400

        try:
            quantity_val = float(quantity)
        except ValueError:
            return jsonify({"error": "Quantidade deve ser numérica"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO crachas (
                product_name, quantity, consinco_code, expiry_date,
                barcode, created_by, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                product_name, quantity_val, consinco_code, expiry_date,
                barcode, created_by, notes
            )
        )
        new_id = cursor.lastrowid
        conn.commit()
        conn.close()

        logger.info("Crachá gerado | id={} produto={} qty={} validade={}", new_id, product_name, quantity_val, expiry_date)

        return jsonify({
            "id": new_id,
            "productName": product_name,
            "quantity": quantity_val,
            "consincoCode": consinco_code,
            "expiryDate": expiry_date,
            "barcode": barcode,
            "createdBy": created_by,
            "notes": notes
        }), 201

    except Exception as e:
        logger.exception("Erro ao criar registro de crachá")
        return jsonify({"error": "Erro ao salvar registro", "details": str(e)}), 500


@crachas_bp.route("/<int:item_id>", methods=["DELETE"])
def delete_cracha(item_id):
    """Exclui um registro de crachá."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM crachas WHERE id = ?", (item_id,))
        rows_affected = cursor.rowcount
        conn.commit()
        conn.close()

        if rows_affected == 0:
            return jsonify({"error": "Registro não encontrado"}), 404

        logger.info("Registro de crachá removido | id={}", item_id)
        return jsonify({"success": True})
    except Exception as e:
        logger.exception("Erro ao excluir registro de crachá")
        return jsonify({"error": "Erro ao excluir registro", "details": str(e)}), 500

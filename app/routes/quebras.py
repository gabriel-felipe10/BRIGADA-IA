"""
BRIGADA-IA — Rotas da API para Registro e Gestão de Formulário de Avaria / Quebras.
"""

from flask import Blueprint, request, jsonify
from app.models.database import get_db_connection
from app.logging_config import logger

quebras_bp = Blueprint("quebras_api", __name__, url_prefix="/api/quebras")


@quebras_bp.route("", methods=["GET"])
def get_quebras():
    """Retorna todos os registros de quebras / avarias cadastrados."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM quebras ORDER BY occurrence_date DESC, id DESC")
        rows = cursor.fetchall()
        conn.close()

        result = []
        for r in rows:
            keys = r.keys()
            result.append({
                "id": r["id"],
                "plu": r["plu"],
                "productName": r["product_name"],
                "quantity": r["quantity"],
                "unit": r["unit"] or "kg",
                "supplier": r["supplier"] if "supplier" in keys else "",
                "origin": r["origin"] if "origin" in keys else "Salão de Vendas",
                "occurrence": r["occurrence"] if "occurrence" in keys else "Vencimento",
                "reason": r["reason"],
                "sector": r["sector"] if "sector" in keys else "Açougue",
                "occurrenceDate": r["occurrence_date"],
                "responsibleName": r["responsible_name"],
                "createdBy": r["created_by"],
                "notes": r["notes"],
                "signature": r["signature"],
                "createdAt": r["created_at"]
            })

        return jsonify(result)
    except Exception as e:
        logger.exception("Erro ao buscar registros de quebras")
        return jsonify({"error": "Erro ao buscar registros", "details": str(e)}), 500


@quebras_bp.route("", methods=["POST"])
def create_quebra():
    """Cria um novo registro de quebra / avaria."""
    try:
        data = request.get_json(force=True)
        plu = data.get("plu", "").strip()
        product_name = data.get("productName", "").strip().upper()
        quantity = data.get("quantity")
        unit = data.get("unit", "kg").strip().lower()
        supplier = data.get("supplier", "").strip()
        origin = data.get("origin", "Salão de Vendas").strip()
        occurrence = data.get("occurrence", "Vencimento").strip()
        reason = data.get("reason", "Qualidade do Produto").strip()
        sector = data.get("sector", "Açougue").strip()
        occurrence_date = data.get("occurrenceDate")
        responsible_name = data.get("responsibleName", "").strip()
        created_by = data.get("createdBy", "sistema")
        notes = data.get("notes", "").strip()
        signature = data.get("signature")

        if not product_name or not quantity or not occurrence_date:
            return jsonify({"error": "Campos 'productName', 'quantity' e 'occurrenceDate' são obrigatórios"}), 400

        try:
            quantity_val = float(quantity)
        except ValueError:
            return jsonify({"error": "Quantidade deve ser numérica"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO quebras (
                plu, product_name, quantity, unit, supplier, origin, occurrence,
                reason, sector, occurrence_date, responsible_name, created_by, notes, signature
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                plu, product_name, quantity_val, unit, supplier, origin, occurrence,
                reason, sector, occurrence_date, responsible_name, created_by, notes, signature
            )
        )
        new_id = cursor.lastrowid
        conn.commit()
        conn.close()

        logger.info("Quebra/Avaria registrada | id={} produto={} qty={} origem={} ocorrência={}", new_id, product_name, quantity_val, origin, occurrence)

        return jsonify({
            "id": new_id,
            "plu": plu,
            "productName": product_name,
            "quantity": quantity_val,
            "unit": unit,
            "supplier": supplier,
            "origin": origin,
            "occurrence": occurrence,
            "reason": reason,
            "sector": sector,
            "occurrenceDate": occurrence_date,
            "responsibleName": responsible_name,
            "createdBy": created_by,
            "notes": notes,
            "signature": signature
        }), 201

    except Exception as e:
        logger.exception("Erro ao criar registro de quebra")
        return jsonify({"error": "Erro ao salvar registro", "details": str(e)}), 500


@quebras_bp.route("/<int:item_id>", methods=["DELETE"])
def delete_quebra(item_id):
    """Exclui um registro de quebra."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM quebras WHERE id = ?", (item_id,))
        rows_affected = cursor.rowcount
        conn.commit()
        conn.close()

        if rows_affected == 0:
            return jsonify({"error": "Registro não encontrado"}), 404

        logger.info("Registro de quebra removido | id={}", item_id)
        return jsonify({"success": True})
    except Exception as e:
        logger.exception("Erro ao excluir registro de quebra")
        return jsonify({"error": "Erro ao excluir registro", "details": str(e)}), 500

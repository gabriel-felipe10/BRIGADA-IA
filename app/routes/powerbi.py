"""
BRIGADA-IA — Endpoints dedicados ao Power BI.

Todos os endpoints retornam JSON "achatado" (flat), sem paginação,
prontos para serem consumidos pelo conector Web do Power BI.

Base URL: /api/powerbi/
"""

from flask import Blueprint, jsonify
from app.models.database import get_db_connection
from app.logging_config import logger

powerbi_bp = Blueprint("powerbi", __name__, url_prefix="/api/powerbi")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _rows_to_list(rows):
    """Converte sqlite3.Row em lista de dicionários simples."""
    return [dict(r) for r in rows]


# ---------------------------------------------------------------------------
# 1. Quebras / Avarias
# ---------------------------------------------------------------------------

@powerbi_bp.route("/quebras", methods=["GET"])
def pbi_quebras():
    """
    GET /api/powerbi/quebras
    Retorna todos os registros de quebras/avarias.

    Campos:
        id, plu, product_name, quantity, unit, supplier, origin,
        occurrence, reason, sector, occurrence_date, responsible_name,
        created_by, notes, created_at
    """
    try:
        conn = get_db_connection()
        rows = conn.execute("""
            SELECT
                id,
                plu,
                product_name,
                quantity,
                unit,
                supplier,
                origin,
                occurrence,
                reason,
                sector,
                occurrence_date,
                responsible_name,
                created_by,
                notes,
                created_at
            FROM quebras
            ORDER BY occurrence_date DESC, id DESC
        """).fetchall()
        conn.close()
        logger.debug("PowerBI /quebras | {} registros", len(rows))
        return jsonify(_rows_to_list(rows))
    except Exception as e:
        logger.exception("PowerBI /quebras — erro")
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# 2. Produtos Sem Nota
# ---------------------------------------------------------------------------

@powerbi_bp.route("/produtos-sem-nota", methods=["GET"])
def pbi_produtos_sem_nota():
    """
    GET /api/powerbi/produtos-sem-nota
    Retorna todos os produtos recebidos sem nota fiscal.

    Campos:
        id, plu, name, quantity, arrival_date, created_by,
        responsible_name, created_at
    """
    try:
        conn = get_db_connection()
        rows = conn.execute("""
            SELECT
                id,
                plu,
                name,
                quantity,
                arrival_date,
                created_by,
                responsible_name,
                created_at
            FROM produtos_sem_nota
            ORDER BY arrival_date DESC, id DESC
        """).fetchall()
        conn.close()
        logger.debug("PowerBI /produtos-sem-nota | {} registros", len(rows))
        return jsonify(_rows_to_list(rows))
    except Exception as e:
        logger.exception("PowerBI /produtos-sem-nota — erro")
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# 3. Crachás / Etiquetas
# ---------------------------------------------------------------------------

@powerbi_bp.route("/crachas", methods=["GET"])
def pbi_crachas():
    """
    GET /api/powerbi/crachas
    Retorna todos os crachás/etiquetas gerados.

    Campos:
        id, product_name, quantity, consinco_code, expiry_date,
        barcode, created_by, notes, created_at
    """
    try:
        conn = get_db_connection()
        rows = conn.execute("""
            SELECT
                id,
                product_name,
                quantity,
                consinco_code,
                expiry_date,
                barcode,
                created_by,
                notes,
                created_at
            FROM crachas
            ORDER BY expiry_date ASC, id DESC
        """).fetchall()
        conn.close()
        logger.debug("PowerBI /crachas | {} registros", len(rows))
        return jsonify(_rows_to_list(rows))
    except Exception as e:
        logger.exception("PowerBI /crachas — erro")
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# 4. Logs de Validação
# ---------------------------------------------------------------------------

@powerbi_bp.route("/logs", methods=["GET"])
def pbi_logs():
    """
    GET /api/powerbi/logs
    Retorna todos os logs de validação (sem o campo payload/result completo).

    Campos:
        id, request_id, timestamp, type, status, duration_ms, details
    """
    try:
        conn = get_db_connection()
        rows = conn.execute("""
            SELECT
                id,
                request_id,
                timestamp,
                type,
                status,
                duration_ms,
                details
            FROM validation_logs
            ORDER BY timestamp DESC
        """).fetchall()
        conn.close()
        logger.debug("PowerBI /logs | {} registros", len(rows))
        return jsonify(_rows_to_list(rows))
    except Exception as e:
        logger.exception("PowerBI /logs — erro")
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# 5. Resumo / KPIs (endpoint principal para cards do dashboard)
# ---------------------------------------------------------------------------

@powerbi_bp.route("/resumo", methods=["GET"])
def pbi_resumo():
    """
    GET /api/powerbi/resumo
    Retorna KPIs consolidados prontos para cards no Power BI.

    Campos retornados:
        total_quebras, quantidade_total_quebras_kg,
        total_produtos_sem_nota, quantidade_total_sem_nota,
        total_crachas, total_logs, logs_sucesso, logs_erro,
        percentual_sucesso
    """
    try:
        conn = get_db_connection()

        # Quebras
        q_count = conn.execute("SELECT COUNT(*) FROM quebras").fetchone()[0]
        q_qty   = conn.execute("SELECT COALESCE(SUM(quantity), 0) FROM quebras").fetchone()[0]

        # Produtos sem nota
        psn_count = conn.execute("SELECT COUNT(*) FROM produtos_sem_nota").fetchone()[0]
        psn_qty   = conn.execute("SELECT COALESCE(SUM(quantity), 0) FROM produtos_sem_nota").fetchone()[0]

        # Crachás
        c_count = conn.execute("SELECT COUNT(*) FROM crachas").fetchone()[0]

        # Logs
        l_total   = conn.execute("SELECT COUNT(*) FROM validation_logs").fetchone()[0]
        l_sucesso = conn.execute("SELECT COUNT(*) FROM validation_logs WHERE status = 'success'").fetchone()[0]
        l_erro    = conn.execute("SELECT COUNT(*) FROM validation_logs WHERE status != 'success'").fetchone()[0]

        conn.close()

        perc = round((l_sucesso / l_total * 100), 2) if l_total > 0 else 0.0

        resumo = {
            "total_quebras":               q_count,
            "quantidade_total_quebras_kg": round(q_qty, 3),
            "total_produtos_sem_nota":     psn_count,
            "quantidade_total_sem_nota":   round(psn_qty, 3),
            "total_crachas":               c_count,
            "total_logs":                  l_total,
            "logs_sucesso":                l_sucesso,
            "logs_erro":                   l_erro,
            "percentual_sucesso":          perc,
        }

        logger.debug("PowerBI /resumo entregue")
        return jsonify(resumo)
    except Exception as e:
        logger.exception("PowerBI /resumo — erro")
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# 6. Quebras agrupadas por setor (para gráficos de barras/pizza)
# ---------------------------------------------------------------------------

@powerbi_bp.route("/quebras-por-setor", methods=["GET"])
def pbi_quebras_por_setor():
    """
    GET /api/powerbi/quebras-por-setor
    Agrupa quebras por setor com total de quantidade e contagem.

    Campos:
        sector, total_registros, total_quantidade_kg
    """
    try:
        conn = get_db_connection()
        rows = conn.execute("""
            SELECT
                sector,
                COUNT(*)        AS total_registros,
                SUM(quantity)   AS total_quantidade_kg
            FROM quebras
            GROUP BY sector
            ORDER BY total_quantidade_kg DESC
        """).fetchall()
        conn.close()
        logger.debug("PowerBI /quebras-por-setor | {} setores", len(rows))
        return jsonify(_rows_to_list(rows))
    except Exception as e:
        logger.exception("PowerBI /quebras-por-setor — erro")
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# 7. Quebras agrupadas por mês (para gráficos de linha/tendência)
# ---------------------------------------------------------------------------

@powerbi_bp.route("/quebras-por-mes", methods=["GET"])
def pbi_quebras_por_mes():
    """
    GET /api/powerbi/quebras-por-mes
    Agrupa quebras por ano-mês com total de quantidade e contagem.

    Campos:
        ano_mes (YYYY-MM), total_registros, total_quantidade_kg
    """
    try:
        conn = get_db_connection()
        rows = conn.execute("""
            SELECT
                strftime('%Y-%m', occurrence_date)  AS ano_mes,
                COUNT(*)                             AS total_registros,
                SUM(quantity)                        AS total_quantidade_kg
            FROM quebras
            WHERE occurrence_date IS NOT NULL
            GROUP BY ano_mes
            ORDER BY ano_mes ASC
        """).fetchall()
        conn.close()
        logger.debug("PowerBI /quebras-por-mes | {} meses", len(rows))
        return jsonify(_rows_to_list(rows))
    except Exception as e:
        logger.exception("PowerBI /quebras-por-mes — erro")
        return jsonify({"error": str(e)}), 500

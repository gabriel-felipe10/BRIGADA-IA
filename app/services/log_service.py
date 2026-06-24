"""
BRIGADA-IA — Serviço de Log / Auditoria.
Persiste e consulta logs de validação no SQLite.
"""

import json
from app.models.database import get_db_connection
from app.logging_config import logger


def save_log(request_id, timestamp, payload_type, status, payload, result, details, duration_ms):
    """Salva um registro de log de validação no banco."""
    conn = get_db_connection()
    try:
        conn.execute(
            """
            INSERT INTO validation_logs
                (request_id, timestamp, type, status, payload, result, details, duration_ms)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                request_id,
                timestamp,
                payload_type,
                status,
                json.dumps(payload, ensure_ascii=False),
                json.dumps(result, ensure_ascii=False),
                json.dumps(details, ensure_ascii=False),
                duration_ms,
            ),
        )
        conn.commit()
        logger.debug("Log salvo no SQLite | request_id={} status={}", request_id, status)
    except Exception:
        logger.exception("Erro ao salvar log | request_id={}", request_id)
        raise
    finally:
        conn.close()


def get_logs(page=1, per_page=20, status=None, payload_type=None):
    """
    Retorna logs paginados com filtros opcionais.
    Retorna: (logs_list, total_count)
    """
    logger.debug("Consultando logs | page={} per_page={} status={} type={}", page, per_page, status, payload_type)
    conn = get_db_connection()
    try:
        where_clauses = []
        params = []

        if status:
            where_clauses.append("status = ?")
            params.append(status)
        if payload_type:
            where_clauses.append("type = ?")
            params.append(payload_type)

        where_sql = ""
        if where_clauses:
            where_sql = "WHERE " + " AND ".join(where_clauses)

        # Total count
        count_row = conn.execute(
            f"SELECT COUNT(*) as total FROM validation_logs {where_sql}",
            params,
        ).fetchone()
        total = count_row["total"]

        # Paginated results
        offset = (page - 1) * per_page
        rows = conn.execute(
            f"""
            SELECT * FROM validation_logs
            {where_sql}
            ORDER BY timestamp DESC
            LIMIT ? OFFSET ?
            """,
            params + [per_page, offset],
        ).fetchall()

        logs = []
        for row in rows:
            logs.append({
                "id": row["id"],
                "request_id": row["request_id"],
                "timestamp": row["timestamp"],
                "type": row["type"],
                "status": row["status"],
                "payload": json.loads(row["payload"]),
                "result": json.loads(row["result"]),
                "details": json.loads(row["details"]),
                "duration_ms": row["duration_ms"],
            })

        return logs, total
    finally:
        conn.close()


def get_stats():
    """Retorna estatísticas gerais das validações."""
    logger.debug("Calculando estatísticas de validação")
    conn = get_db_connection()
    try:
        total = conn.execute(
            "SELECT COUNT(*) as c FROM validation_logs"
        ).fetchone()["c"]

        success = conn.execute(
            "SELECT COUNT(*) as c FROM validation_logs WHERE status = 'success'"
        ).fetchone()["c"]

        error = conn.execute(
            "SELECT COUNT(*) as c FROM validation_logs WHERE status = 'error'"
        ).fetchone()["c"]

        # Contagem por tipo
        type_rows = conn.execute(
            "SELECT type, COUNT(*) as c FROM validation_logs GROUP BY type"
        ).fetchall()
        by_type = {row["type"]: row["c"] for row in type_rows}

        # Últimas 5 validações
        recent_rows = conn.execute(
            """
            SELECT request_id, timestamp, type, status, duration_ms
            FROM validation_logs
            ORDER BY timestamp DESC
            LIMIT 5
            """
        ).fetchall()
        recent = [dict(row) for row in recent_rows]

        return {
            "total": total,
            "success": success,
            "error": error,
            "success_rate": round((success / total * 100), 1) if total > 0 else 0,
            "by_type": by_type,
            "recent": recent,
        }
    finally:
        conn.close()

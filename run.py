#!/usr/bin/env python3
"""
BRIGADA-IA — Servidor principal.
Executa a aplicação web Flask.

Uso:
    python run.py
    Acesse: http://localhost:5000
"""

from app import create_app
from app.logging_config import logger

app = create_app()

if __name__ == "__main__":
    logger.info("Servidor iniciando em http://localhost:5000")
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True,
    )

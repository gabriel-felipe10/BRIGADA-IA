"""
BRIGADA-IA — Configuração centralizada de logging com Loguru.

Uso:
    from app.logging_config import logger

O logger é pré-configurado com dois sinks:
  1. Console (stderr) com cores e formatação amigável.
  2. Arquivo rotacionado em logs/brigada.log (10 MB, 7 dias de retenção).
"""

import os
import sys
from loguru import logger

from app.config import Config

# ---------------------------------------------------------------------------
# Remove o handler padrão do loguru (evita duplicação ao reimportar)
# ---------------------------------------------------------------------------
logger.remove()

# ---------------------------------------------------------------------------
# Sink 1 — Console (stderr) com cores
# ---------------------------------------------------------------------------
_console_format = (
    "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
    "<level>{level: <8}</level> | "
    "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> — "
    "<level>{message}</level>"
)

logger.add(
    sys.stderr,
    format=_console_format,
    level="DEBUG" if Config.DEBUG else "INFO",
    colorize=True,
    backtrace=True,
    diagnose=Config.DEBUG,
)

# ---------------------------------------------------------------------------
# Sink 2 — Arquivo rotacionado (logs/brigada.log)
# ---------------------------------------------------------------------------
_log_file = os.path.join(Config.LOG_DIR, "brigada.log")

_file_format = (
    "{time:YYYY-MM-DD HH:mm:ss.SSS} | "
    "{level: <8} | "
    "{name}:{function}:{line} — {message}"
)

logger.add(
    _log_file,
    format=_file_format,
    level="DEBUG",
    rotation="10 MB",
    retention="7 days",
    compression="zip",
    encoding="utf-8",
    enqueue=True,  # Thread-safe
)

logger.info("Logger BRIGADA-IA inicializado com sucesso")

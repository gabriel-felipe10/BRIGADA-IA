#!/usr/bin/env python3
"""
Main entry point for the Python validation agent.
Can be run as a CLI tool or imported as a module.
"""

import json
import sys

from loguru import logger
from validator import run_validation


def main():
    logger.debug("Agente de validação iniciado via CLI")

    if len(sys.argv) > 1:
        # Load JSON payload from file
        logger.info("Lendo payload do arquivo: {}", sys.argv[1])
        with open(sys.argv[1], "r", encoding="utf-8") as f:
            payload = json.load(f)
    else:
        # Expect JSON on stdin
        logger.info("Lendo payload do stdin")
        payload = json.load(sys.stdin)

    result = run_validation(payload)
    logger.info(
        "Resultado: status={} detalhes={}",
        result.get("status"), len(result.get("details", [])),
    )
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

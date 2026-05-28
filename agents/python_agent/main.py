#!/usr/bin/env python3
"""
Main entry point for the Python validation agent.
Can be run as a CLI tool or imported as a module.
"""

import json
import sys

from validator import run_validation


def main():
    if len(sys.argv) > 1:
        # Load JSON payload from file
        with open(sys.argv[1], "r", encoding="utf-8") as f:
            payload = json.load(f)
    else:
        # Expect JSON on stdin
        payload = json.load(sys.stdin)

    result = run_validation(payload)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

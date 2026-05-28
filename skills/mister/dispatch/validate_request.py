#!/usr/bin/env python3
"""
Dispatch script for Mister to run the python validation agent.
This script bridges the Mister agent with the python_agent validator.
"""

import os
import sys
import json
import subprocess


def main():
    # Determine paths relative to this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # The workspace root is 3 levels up from skills/mister/dispatch/
    root_dir = os.path.abspath(os.path.join(script_dir, "..", "..", ".."))
    python_agent_main = os.path.join(root_dir, "agents", "python_agent", "main.py")

    # Read input payload
    if len(sys.argv) > 1:
        arg = sys.argv[1]
        # Check if the argument is a JSON string or file path
        if arg.strip().startswith("{"):
            payload_str = arg
        else:
            if os.path.exists(arg):
                with open(arg, "r", encoding="utf-8") as f:
                    payload_str = f.read()
            else:
                print(
                    json.dumps(
                        {
                            "status": "error",
                            "details": [f"Input file not found: {arg}"],
                        }
                    )
                )
                sys.exit(1)
    else:
        # Read from stdin
        payload_str = sys.stdin.read()

    # Verify we can parse JSON
    try:
        json.loads(payload_str)
    except json.JSONDecodeError as e:
        print(
            json.dumps(
                {
                    "status": "error",
                    "details": [f"Invalid input JSON: {str(e)}"],
                }
            )
        )
        sys.exit(1)

    # Invoke python_agent/main.py using the current python executable
    try:
        proc = subprocess.run(
            [sys.executable, python_agent_main],
            input=payload_str,
            capture_output=True,
            text=True,
            encoding="utf-8",
            check=True,
        )
        # Output result
        print(proc.stdout)
    except subprocess.CalledProcessError as e:
        print(
            json.dumps(
                {
                    "status": "error",
                    "details": [
                        f"Execution failed with return code {e.returncode}",
                        e.stderr.strip(),
                    ],
                }
            )
        )
        sys.exit(1)
    except Exception as e:
        print(
            json.dumps(
                {
                    "status": "error",
                    "details": [f"Unexpected dispatch error: {str(e)}"],
                }
            )
        )
        sys.exit(1)


if __name__ == "__main__":
    main()

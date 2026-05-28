import json


def run_validation(payload):
    """
    Validate the incoming payload.
    Expected payload structure:
    {
        "type": "csv" | "json" | "business_rule",
        "data": {...}
    }
    """
    result = {"status": "error", "details": [], "input": payload}

    if "type" not in payload:
        result["details"].append("Missing 'type' field")
        return result

    payload_type = payload["type"]
    if payload_type == "csv":
        # Simple CSV validation: check that data is a list of lists
        if "data" not in payload or not isinstance(payload["data"], list):
            result["details"].append("Invalid 'data' for CSV: must be a list")
        else:
            for i, row in enumerate(payload["data"]):
                if not isinstance(row, list):
                    result["details"].append(f"Row {i} is not a list")
    elif payload_type == "json":
        # Validate that data is a dict
        if "data" not in payload or not isinstance(payload["data"], dict):
            result["details"].append("Invalid 'data' for JSON: must be an object")
        else:
            # Additional check: ensure keys are strings
            for k, v in payload["data"].items():
                if not isinstance(k, str):
                    result["details"].append(f"Key {k!r} is not a string")
    elif payload_type == "business_rule":
        # Placeholder for business rule validation
        if "data" not in payload:
            result["details"].append("Missing 'data' for business rule")
        else:
            # Example rule: data must contain 'id' and 'value' fields
            data = payload["data"]
            if not isinstance(data, dict):
                result["details"].append(
                    "'data' must be a dictionary for business rule"
                )
            else:
                if "id" not in data:
                    result["details"].append("Missing 'id' in business rule data")
                if "value" not in data:
                    result["details"].append("Missing 'value' in business rule data")
                if not isinstance(data.get("id"), int):
                    result["details"].append("'id' must be an integer")
                if not isinstance(data.get("value"), (int, float)):
                    result["details"].append("'value' must be a number")
    else:
        result["details"].append(f"Unsupported type '{payload_type}'")

    if not result["details"]:
        result["status"] = "success"

    return result

import pytest
import sys
import os

# Adjust path to import from parent directory
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from validator import run_validation

def test_missing_type():
    payload = {"data": {"id": 1}}
    result = run_validation(payload)
    assert result["status"] == "error"
    assert "Missing 'type' field" in result["details"]

def test_unsupported_type():
    payload = {"type": "xml", "data": "<xml></xml>"}
    result = run_validation(payload)
    assert result["status"] == "error"
    assert "Unsupported type 'xml'" in result["details"]

def test_csv_validation_valid():
    payload = {
        "type": "csv",
        "data": [
            ["header1", "header2"],
            ["value1", "value2"]
        ]
    }
    result = run_validation(payload)
    assert result["status"] == "success"
    assert len(result["details"]) == 0

def test_csv_validation_invalid_data_not_list():
    payload = {
        "type": "csv",
        "data": "not a list"
    }
    result = run_validation(payload)
    assert result["status"] == "error"
    assert "Invalid 'data' for CSV: must be a list" in result["details"]

def test_csv_validation_invalid_row_not_list():
    payload = {
        "type": "csv",
        "data": [
            ["header1", "header2"],
            "not a list row"
        ]
    }
    result = run_validation(payload)
    assert result["status"] == "error"
    assert "Row 1 is not a list" in result["details"]

def test_json_validation_valid():
    payload = {
        "type": "json",
        "data": {
            "name": "Mister",
            "role": "Dispatcher"
        }
    }
    result = run_validation(payload)
    assert result["status"] == "success"
    assert len(result["details"]) == 0

def test_json_validation_invalid_data_not_dict():
    payload = {
        "type": "json",
        "data": [1, 2, 3]
    }
    result = run_validation(payload)
    assert result["status"] == "error"
    assert "Invalid 'data' for JSON: must be an object" in result["details"]

def test_business_rule_validation_valid():
    payload = {
        "type": "business_rule",
        "data": {
            "id": 42,
            "value": 150.75
        }
    }
    result = run_validation(payload)
    assert result["status"] == "success"
    assert len(result["details"]) == 0

def test_business_rule_validation_missing_fields():
    payload = {
        "type": "business_rule",
        "data": {}
    }
    result = run_validation(payload)
    assert result["status"] == "error"
    assert "Missing 'id' in business rule data" in result["details"]
    assert "Missing 'value' in business rule data" in result["details"]

def test_business_rule_validation_invalid_types():
    payload = {
        "type": "business_rule",
        "data": {
            "id": "not-an-int",
            "value": "not-a-number"
        }
    }
    result = run_validation(payload)
    assert result["status"] == "error"
    assert "'id' must be an integer" in result["details"]
    assert "'value' must be a number" in result["details"]

def test_business_rule_validation_invalid_data_type():
    payload = {
        "type": "business_rule",
        "data": "should be a dict"
    }
    result = run_validation(payload)
    assert result["status"] == "error"
    assert "'data' must be a dictionary for business rule" in result["details"]

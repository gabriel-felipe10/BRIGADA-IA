import requests

BASE_URL = "http://localhost:5000/api/products"

def run_reconciliation_test():
    print("Testing Conciliação API...")
    
    # 1. Create a conciliação product
    payload = {
        "plu": "20775",
        "name": "Coxão mole", # will be saved in uppercase in db
        "category": "conciliacao",
        "endDate": "2026-07-14",
        "location": "Açougue",
        "quantity": 1500.0,
        "unit": "kg",
        "supplier": "Inventário Físico"
    }
    
    res = requests.post(BASE_URL, json=payload)
    print("Create Status:", res.status_code)
    print("Create Response:", res.text)
    assert res.status_code == 201, f"Failed to create reconciliation: {res.text}"
    data = res.json()
    item_id = data["id"]
    
    # Assert name is in uppercase
    assert data["name"] == "COXÃO MOLE", f"Expected COXÃO MOLE, got: {data['name']}"
    assert data["category"] == "conciliacao"
    assert data["quantity"] == 1500.0
    
    # 2. Get products list and verify it exists
    res_list = requests.get(BASE_URL)
    assert res_list.status_code == 200
    products = res_list.json()
    reconciled_item = next((p for p in products if p["id"] == item_id), None)
    assert reconciled_item is not None, "Created reconciliation item not found in products list"
    print("Found reconciled item in list:", reconciled_item)
    
    # 3. Clean up
    del_res = requests.delete(f"{BASE_URL}/{item_id}")
    print("Delete Status:", del_res.status_code)
    assert del_res.status_code == 200, f"Failed to delete reconciliation item: {del_res.text}"
    
    print("All conciliação API verification tests PASSED!")

if __name__ == "__main__":
    run_reconciliation_test()

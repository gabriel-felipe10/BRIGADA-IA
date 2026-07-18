import requests
import json

BASE_URL = "http://localhost:5000/api/products"

def run_tests():
    print("Starting integration verification tests...")
    
    # 1. Create a product with PLU '88888' and endDate '2026-08-01'
    p1 = {
        "plu": "88888",
        "name": "Integration Test Prod",
        "category": "bovino",
        "endDate": "2026-08-01",
        "location": "resfriado",
        "quantity": 10.0,
        "unit": "kg"
    }
    
    print("Inserting first product (PLU 88888, Expiration 2026-08-01)...")
    res1 = requests.post(BASE_URL, json=p1)
    print(f"Status: {res1.status_code}")
    print(f"Response: {res1.text}\n")
    assert res1.status_code == 201, f"Failed to insert first product: {res1.text}"
    p1_data = res1.json()
    p1_id = p1_data["id"]
    assert p1_data["name"] == "INTEGRATION TEST PROD", f"Name was not uppercase: {p1_data['name']}"
    
    # 2. Try to insert same PLU with a DIFFERENT expiration date ('2026-08-15')
    p2 = {
        "plu": "88888",
        "name": "Integration Test Prod",
        "category": "bovino",
        "endDate": "2026-08-15",
        "location": "resfriado",
        "quantity": 5.0,
        "unit": "kg"
    }
    
    print("Inserting second product (PLU 88888, Expiration 2026-08-15 - Different Date)...")
    res2 = requests.post(BASE_URL, json=p2)
    print(f"Status: {res2.status_code}")
    print(f"Response: {res2.text}\n")
    assert res2.status_code == 201, f"Failed to insert duplicate PLU with different date. Did you run the SQL migration? Response: {res2.text}"
    p2_data = res2.json()
    p2_id = p2_data["id"]
    assert p2_data["name"] == "INTEGRATION TEST PROD", f"Name was not uppercase: {p2_data['name']}"
    
    # 3. Try to insert same PLU with the SAME expiration date ('2026-08-01')
    p3 = {
        "plu": "88888",
        "name": "Integration Test Prod",
        "category": "bovino",
        "endDate": "2026-08-01",
        "location": "resfriado",
        "quantity": 3.0,
        "unit": "kg"
    }
    
    print("Inserting third product (PLU 88888, Expiration 2026-08-01 - Duplicate PLU and Date)...")
    res3 = requests.post(BASE_URL, json=p3)
    print(f"Status: {res3.status_code}")
    print(f"Response: {res3.text}\n")
    assert res3.status_code == 409, f"Expected 409 Conflict, got: {res3.status_code}"
    print("Successfully blocked duplicate PLU + Date combination!\n")
    
    # Clean up both products
    print("Cleaning up created test products...")
    del_res1 = requests.delete(f"{BASE_URL}/{p1_id}")
    del_res2 = requests.delete(f"{BASE_URL}/{p2_id}")
    print(f"Delete 1 status: {del_res1.status_code}")
    print(f"Delete 2 status: {del_res2.status_code}")
    
    print("All backend tests PASSED successfully!")

if __name__ == "__main__":
    try:
        run_tests()
    except Exception as e:
        print(f"ERROR: {e}")

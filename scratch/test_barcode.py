import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

print("Trying to insert test product 1 with barcode...")
try:
    p1 = {
        "plu": "99991",
        "name": "Barcode Test 1",
        "category": "laticinios",
        "end_date": "2026-12-31",
        "barcode": "1234567890123",
        "quantity": 1.0
    }
    res1 = supabase.table("produtos").insert(p1).execute()
    print("Insert 1 successful:", res1.data)
    
    print("Trying to insert test product 2 with same barcode but different PLU and date...")
    p2 = {
        "plu": "99992",
        "name": "Barcode Test 2",
        "category": "laticinios",
        "end_date": "2026-12-30",
        "barcode": "1234567890123",
        "quantity": 1.0
    }
    res2 = supabase.table("produtos").insert(p2).execute()
    print("Insert 2 successful:", res2.data)
    
    # Cleanup both if successful
    inserted_ids = []
    if res1.data: inserted_ids.append(res1.data[0]["id"])
    if res2.data: inserted_ids.append(res2.data[0]["id"])
    for iid in inserted_ids:
        supabase.table("produtos").delete().eq("id", iid).execute()
    print("Cleanup successful.")
except Exception as e:
    print("Failed during barcode test:", e)
    # Try to clean up anyway
    try:
        supabase.table("produtos").delete().eq("plu", "99991").execute()
        supabase.table("produtos").delete().eq("plu", "99992").execute()
    except:
        pass

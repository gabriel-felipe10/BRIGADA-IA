import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

print("Trying to insert test product with category 'conciliacao'...")
try:
    p = {
        "plu": "99999",
        "name": "TEST CONCILIACAO",
        "category": "conciliacao",
        "end_date": "2026-12-31",
        "quantity": 5.0
    }
    res = supabase.table("produtos").insert(p).execute()
    print("Insert successful:", res.data)
    # Clean up
    if res.data:
        inserted_id = res.data[0]["id"]
        supabase.table("produtos").delete().eq("id", inserted_id).execute()
        print("Cleanup successful.")
except Exception as e:
    print("Insert failed:", e)

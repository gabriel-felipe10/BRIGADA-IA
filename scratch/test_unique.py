import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

print("Fetching products...")
res = supabase.table("produtos").select("*").execute()
print(f"Total products: {len(res.data)}")
plus = [p.get("plu") for p in res.data if p.get("plu")]
import collections
counter = collections.Counter(plus)
duplicates = {k: v for k, v in counter.items() if v > 1}
print(f"Duplicate PLUs currently in database: {duplicates}")

# Let's inspect column constraints/info if possible, or try a dry run insert.
# We will insert a test product with a known PLU and a different date, then delete it.
if res.data:
    sample = res.data[0]
    test_plu = sample.get("plu")
    test_name = sample.get("name") + " TEST_DUP"
    test_date = "2099-12-31" # far future
    print(f"Trying to insert duplicate PLU: {test_plu} with end_date: {test_date}")
    try:
        ins_data = {
            "plu": test_plu,
            "name": test_name,
            "category": sample.get("category"),
            "end_date": test_date,
            "quantity": 1.0,
        }
        res_ins = supabase.table("produtos").insert(ins_data).execute()
        print("Insert SUCCESSFUL! Data:", res_ins.data)
        # Clean up
        if res_ins.data:
            inserted_id = res_ins.data[0]["id"]
            supabase.table("produtos").delete().eq("id", inserted_id).execute()
            print("Cleanup successful.")
    except Exception as e:
        print("Insert FAILED! Error details:", e)

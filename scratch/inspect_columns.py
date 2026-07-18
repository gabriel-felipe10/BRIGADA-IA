import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

res = supabase.table("produtos").select("*").limit(1).execute()
if res.data:
    print("Sample product:", res.data[0])
else:
    print("No products found")

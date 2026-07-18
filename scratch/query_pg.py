import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

try:
    print("Trying to query pg_constraint...")
    res = supabase.table("pg_constraint").select("*").execute()
    print("Success:", res.data)
except Exception as e:
    print("Failed to query pg_constraint:", e)

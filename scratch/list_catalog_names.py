import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

res = supabase.table("catalogo_produtos").select("name").execute()
names = sorted(list(set([p["name"] for p in res.data])))
print(f"Total unique catalog names: {len(names)}")
for n in names:
    print(n)

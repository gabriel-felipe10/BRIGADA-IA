import os
import sys

# Add project root to sys.path so we can import app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.utils.supabase_client import supabase

def create_expired_product():
    db_data = {
        "plu": "99999",
        "name": "PRODUTO TESTE VENCIDO (IA)",
        "category": "bovino",
        "start_date": "2026-06-01",
        "end_date": "2026-06-30",  # Expired
        "unit": "kg",
        "supplier": "TESTE AUTO",
        "location": "resfriado",
        "quantity": 5.5
    }

    try:
        # Check if already exists to avoid duplicate PLU issue
        existing = supabase.table("produtos").select("id").eq("plu", "99999").execute()
        if existing.data:
            print("Produto de teste com PLU 99999 já existe. Deletando para recriar...")
            supabase.table("produtos").delete().eq("plu", "99999").execute()

        response = supabase.table("produtos").insert(db_data).execute()
        if response.data:
            print(f"Produto de teste vencido criado com sucesso! ID: {response.data[0]['id']}")
        else:
            print("Erro ao criar produto de teste: Nenhuma data retornada.")
    except Exception as e:
        print(f"Erro ao inserir no Supabase: {e}")

if __name__ == "__main__":
    create_expired_product()

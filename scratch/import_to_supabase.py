import re
import os
import sys

# Ajusta o path para conseguir importar o app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.utils.supabase_client import supabase
from app.logging_config import logger

def get_existing_plus():
    """Busca todos os PLUs já existentes no banco para evitar duplicatas."""
    try:
        response = supabase.table("catalogo_produtos").select("plu").execute()
        return {row["plu"] for row in response.data} if response.data else set()
    except Exception as e:
        print("Erro ao buscar PLUs existentes:", e)
        return set()

def main():
    existing_plus = get_existing_plus()
    print(f"Encontrados {len(existing_plus)} produtos no catálogo atual.")
    
    products_to_insert = []
    current_category = "Geral"
    
    # Vamos ler o sort_products.py para pegar a string original com as categorias
    try:
        with open(os.path.join(os.path.dirname(__file__), "sort_products.py"), "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        print("Erro ao ler sort_products.py:", e)
        return
        
    # Extrai o texto cru que tem os headers
    match = re.search(r'text\s*=\s*"""(.*?)"""', content, re.DOTALL)
    if not match:
        print("Não foi possível encontrar a variável text em sort_products.py")
        return
        
    raw_text = match.group(1)
    
    # Parsing do texto cru
    for line in raw_text.splitlines():
        line = line.strip()
        
        if not line:
            continue
            
        # Detecta categorias
        if "1. AVES" in line:
            current_category = "Aves"
        elif "2. PESCADOS" in line:
            current_category = "Pescados"
        elif "3. SUÍNOS" in line:
            current_category = "Suínos"
            
        # Detecta itens
        if line.startswith("* Código:"):
            # Exemplo: * Código: 19666  | ALCATRA SUINA CG SADIA KG (Cód. Interno: 1805)
            # Remove o "não informado" para limpar o nome
            line = line.replace(" (Cód. Interno: não informado)", "")
            
            # Pega PLU e resto
            m = re.search(r'\* Código: \s*(\d+)\s*\|\s*(.*)', line)
            if m:
                plu = m.group(1).strip()
                desc = m.group(2).strip()
                
                # Vamos remover a parte do código de balança do nome (Cód. Interno: ...) se houver
                name = desc.split("(Cód. Interno:")[0].strip()
                
                # Evitar duplicatas
                if plu in existing_plus:
                    continue
                    
                products_to_insert.append({
                    "plu": plu,
                    "name": name,
                    "category": current_category
                })
                
                existing_plus.add(plu) # Para não adicionar duas vezes se houver duplo na própria lista
    
    print(f"Total de {len(products_to_insert)} novos produtos para inserir no catálogo.")
    
    if products_to_insert:
        try:
            # O Supabase permite inserção em massa. Podemos dividir em lotes se necessário, mas 277 deve passar tranquilamente.
            response = supabase.table("catalogo_produtos").insert(products_to_insert).execute()
            if response.data:
                print(f"Sucesso! {len(response.data)} produtos foram inseridos no catálogo da BRIGADA-IA.")
            else:
                print("A importação parece ter funcionado, mas nenhuma resposta de dados foi retornada.")
        except Exception as e:
            print("Erro durante a inserção no banco:", e)
    else:
        print("Nenhum produto novo para inserir.")

if __name__ == "__main__":
    main()

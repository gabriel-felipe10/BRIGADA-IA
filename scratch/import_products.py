import os
from dotenv import load_dotenv
from supabase import create_client, Client
import re

load_dotenv()
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

# Get existing PLUs
res = supabase.table('catalogo_produtos').select('plu').execute()
existing_plus = {r['plu'] for r in res.data if r['plu']}

def categorize(name):
    name = name.upper()
    
    # Suínos
    if re.search(r'\b(SUINA|SUINO|SUINCO|SUI\b|PORC|BACON|PANCETA|SARAPATEL|LOMBO SUI|BISTECA SUINA|COSTELINHA)\b', name):
        return 'Suínos'
    
    # Pescados
    if re.search(r'\b(FISH|PESC|TILAPIA|SALMAO|CAMAR|CAMARAO|BACALH|BACALHAU|MERLUZA|CORVINA|ATUM|POLACA|PIRAMUTAB|PIRAMUTABA|KANI|DOURADO|ESPADA|SARDINHA|PEIXE)\b', name):
        return 'Pescados'
    
    # Aves
    if re.search(r'\b(FGO|FRANGO|GALINHA|PERU|AVE\b|CANCAO|MAURICEA)\b', name) or 'ASA DE FGO' in name or 'COXINHA ASA' in name or 'SOBCOX' in name:
        if not re.search(r'\b(BOV|SUIN|FISH)\b', name):
            return 'Aves'
            
    # Bovinos
    if re.search(r'\b(BOV|BOVINO|BABY BEEF|MAMINHA|LAGARTO|MOCOTO|CUPIM|FRALDINHA|BUCHO|RABO|RIM|PICANHA|ALCATRA|COXAO|CONTRA FILE|CARNE SOL|PATINHO|FILE MIGNON)\b', name):
        return 'Bovinos'
        
    # Fallback to Aves if it has COXA or PEITO and not Bovino/Suino/Pescado
    if re.search(r'\b(COXA|PEITO)\b', name):
        return 'Aves'
        
    # Check TOST/LING (Toscana/Linguica)
    if re.search(r'\b(LING|TOSC|LINGUICA)\b', name):
        if 'FGO' in name or 'FRANGO' in name or 'AURORA' in name:
            return 'Aves'
        return 'Suínos'
        
    # Fallback default
    if 'TRIPA' in name and 'SUINA' not in name:
        return 'Bovinos'
        
    return 'Geral'

new_items = []
with open('c:\\Users\\Felipe Gabriel\\BRIGADA-IA\\scratch\\products.txt', 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        # Format: 19666 ALCATRA SUINA CG SADIA KG Cod.Interno: 1805
        match = re.match(r'^(\d+)\s+(.+?)\s+Cod\.Interno:', line)
        if match:
            plu = match.group(1)
            name = match.group(2).strip()
            
            if plu not in existing_plus:
                cat = categorize(name)
                new_items.append({
                    'plu': plu,
                    'name': name,
                    'category': cat
                })

print(f"Encontrados {len(new_items)} itens novos para inserir.")

if new_items:
    # Insert in batches of 50
    for i in range(0, len(new_items), 50):
        batch = new_items[i:i+50]
        supabase.table('catalogo_produtos').insert(batch).execute()
    print("Inserção concluída!")
else:
    print("Nenhum item novo para inserir.")

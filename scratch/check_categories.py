import re

with open('app/static/js/data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract PRODUCTS_DB items
categories = {}
products = []

# Match objects in PRODUCTS_DB
pattern = re.compile(r'{\s*id:\s*(\d+),\s*plu:\s*\'([^\']+)\',\s*name:\s*\'([^\']+)\',\s*category:\s*\'([^\']+)\'', re.MULTILINE)
matches = pattern.findall(content)

print(f"Total products matched in data.js: {len(matches)}")
for m in matches:
    p_id, plu, name, cat = m
    cat = cat.lower()
    categories[cat] = categories.get(cat, 0) + 1
    products.append({"id": p_id, "plu": plu, "name": name, "category": cat})

print("\nCategory counts:")
for cat, count in categories.items():
    print(f"  - {cat}: {count}")

print("\nChecking for meat/açougue terms in non-meat categories:")
meat_keywords = ['frango', 'coxa', 'sobrecoxa', 'asa', 'peito de fgo', 'alcatra', 'picanha', 'bif', 'bisteca', 'suino', 'suíno', 'bovino', 'peixe', 'tilapia', 'merluza', 'camarao', 'camarão', 'salmao', 'linguiça', 'linguiça', 'ling suina', 'ling fgo']

for p in products:
    cat = p["category"]
    name_l = p["name"].lower()
    if cat in ['laticinios', 'frios', 'pereciveis', 'perecíveis']:
        # Check if it sounds like meat / açougue
        if any(kw in name_l for kw in ['frango', 'suino', 'bovino', 'alcatra', 'picanha', 'bisteca', 'carne sol', 'carne moida', 'coxao mole', 'file mignon', 'pescado', 'tilapia', 'merluza', 'corvina']):
            print(f"  [AÇOUGUE ITEM IN PERECIVEIS] ID: {p['id']} | PLU: {p['plu']} | Name: {p['name']} | Cat: {cat}")

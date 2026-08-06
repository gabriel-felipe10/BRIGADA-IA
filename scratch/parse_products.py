import sys

with open('scratch/products.txt', 'r', encoding='utf-8') as f:
    products_txt = f.readlines()

with open('lista_ordenada.md', 'r', encoding='utf-8') as f:
    lista_md = f.readlines()

print(f"Total lines in products.txt: {len(products_txt)}")
print(f"Total lines in lista_ordenada.md: {len(lista_md)}")

# Parse products from products.txt
# Format: 19666 ALCATRA SUINA CG SADIA KG Cod.Interno: 1805
items = []
for line in products_txt:
    line = line.strip()
    if not line:
        continue
    parts = line.split(maxsplit=1)
    if len(parts) == 2 and parts[0].isdigit():
        plu = parts[0]
        rest = parts[1]
        name = rest.split("Cod.Interno:")[0].strip()
        cod_int = rest.split("Cod.Interno:")[1].strip() if "Cod.Interno:" in rest else ""
        items.append({"plu": plu, "name": name, "cod_int": cod_int})

print(f"Parsed {len(items)} items from products.txt")
print("\nSample items:")
for it in items[:15]:
    print(it)

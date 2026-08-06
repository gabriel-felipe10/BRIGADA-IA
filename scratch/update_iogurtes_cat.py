import re

with open('app/static/js/data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace category: 'laticinios' for the 304 items in data.js block
if "// ── LATICÍNIOS (CADASTRADOS VIA ANÁLISE DE ESTOQUE) ──" in content:
    parts = content.split("// ── LATICÍNIOS (CADASTRADOS VIA ANÁLISE DE ESTOQUE) ──")
    before = parts[0]
    after = parts[1]
    
    # Replace category: 'laticinios' with category: 'iogurtes' in the after part
    updated_after = after.replace("category: 'laticinios'", "category: 'iogurtes'")
    updated_header = "// ── IOGURTES & BEBIDAS LÁCTEAS (CADASTRADOS VIA ANÁLISE DE ESTOQUE) ──"
    
    new_content = before + updated_header + updated_after
    
    with open('app/static/js/data.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully updated category in app/static/js/data.js to 'iogurtes'!")
else:
    print("Header block not found in data.js")

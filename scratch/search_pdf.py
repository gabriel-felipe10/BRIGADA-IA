import pypdf, re

reader = pypdf.PdfReader('Documentação da API - Pastorini API.pdf')
print(f"Num pages: {len(reader.pages)}")

found_lines = []
for i, p in enumerate(reader.pages):
    txt = p.extract_text()
    for line in txt.split('\n'):
        # Check if line contains digits that could be PLUs or product names
        if re.search(r'\b\d{4,6}\b', line) or any(w in line.lower() for w in ['queijo', 'presunto', 'manteiga', 'iogurte', 'leite', 'requeijao', 'mortadela', 'salame', 'linguiça', 'linguica', 'bacon', 'peito', 'pernil', 'frango', 'carne', 'plu', 'código', 'codigo']):
            found_lines.append(f"Page {i+1}: {line.strip()}")

print(f"Found {len(found_lines)} matching lines across PDF:")
for fl in found_lines[:50]:
    print(" ", fl[:120])

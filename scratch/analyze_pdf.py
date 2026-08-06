import re

with open('scratch/pdf_extracted.txt', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.split('\n')
print(f'Total lines extracted: {len(lines)}')

keywords = ['PLU', 'queijo', 'presunto', 'manteiga', 'requeijao', 'iogurte', 'leite', 'pereciveis', 'frios', 'laticinios', 'balanca', 'balança', 'codigo', 'código']
for kw in keywords:
    matches = [l for l in lines if kw.lower() in l.lower()]
    print(f'Matches for "{kw}": {len(matches)}')
    if matches and len(matches) < 15:
        for m in matches[:5]:
            print('  -', m.strip()[:100])

print("\n--- SAMPLE LINES WITH NUMBERS & TEXT ---")
code_pattern = re.compile(r'^\s*\d{3,6}\b')
code_matches = [l.strip() for l in lines if code_pattern.search(l)]
print(f'Lines starting with 3-6 digit code: {len(code_matches)}')
for l in code_matches[:30]:
    print('  ', l[:100])

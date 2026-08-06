import re

with open('app/static/js/pereciveis.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Check for window.BrigadaPereciveis definition
print("Starts with window.BrigadaPereciveis:", code.strip().startswith("/**") or "window.BrigadaPereciveis" in code)
print("Length of pereciveis.js:", len(code))

# Check for template string backticks mismatch
backticks = code.count('`')
print(f"Number of backticks: {backticks} (Even: {backticks % 2 == 0})")

# Let's inspect all matches of window.Brigada
for m in re.finditer(r'window\.Brigada\w+', code):
    print("Reference:", m.group(0))

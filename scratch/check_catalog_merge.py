import re

with open('app/static/js/data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Check how catalog is constructed in data.js
print("Checking catalog merge logic in data.js...")
matches = re.findall(r'this\.catalog\.push\(', content)
print(f"Number of catalog.push calls in data.js: {len(matches)}")

# Let's inspect lines around line 715 to 745
lines = content.split('\n')[710:750]
for i, line in enumerate(lines, 711):
    print(f"{i}: {line}")

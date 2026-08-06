import glob

files = [
    'app/static/js/data.js',
    'app/static/js/pereciveis.js',
    'app/static/js/product_list.js',
    'app/static/js/app.js'
]

for fname in files:
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check bracket balance
    stack = []
    brackets = {'{': '}', '[': ']', '(': ')'}
    errors = []
    in_string = None
    escape = False
    
    # Simple lexical scan
    lines = content.split('\n')
    for l_num, line in enumerate(lines, 1):
        for char in line:
            if escape:
                escape = False
                continue
            if char == '\\':
                escape = True
                continue
            if char in ('"', "'", '`'):
                if in_string == char:
                    in_string = None
                elif in_string is None:
                    in_string = char
                continue
            if in_string is not None:
                continue
            
            if char in brackets:
                stack.append((char, l_num))
            elif char in brackets.values():
                if not stack:
                    errors.append(f"Unmatched closing '{char}' at line {l_num}")
                else:
                    top_char, top_line = stack.pop()
                    if brackets[top_char] != char:
                        errors.append(f"Mismatched '{top_char}' (line {top_line}) with '{char}' at line {l_num}")

    if stack:
        for char, l_num in stack:
            errors.append(f"Unclosed '{char}' from line {l_num}")
            
    print(f"File: {fname} -> {len(errors)} errors")
    for err in errors[:10]:
        print("  -", err)

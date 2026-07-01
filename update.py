import re

files = [
    'app/static/js/dashboard.js',
    'app/static/js/hortifruti.js',
    'app/static/js/mercearia.js',
    'app/static/js/padaria.js',
    'app/static/js/pereciveis.js',
    'app/static/js/products.js'
]

options = ''.join([f'\\n                    <option value="{i}">{i}</option>' for i in range(1, 21)])

def replace_block(text, id_suffix):
    pattern = re.compile(
        r'<div class="form-group">\s*<label class="form-label">Coluna</label>\s*<input type="text" id="field-column' + id_suffix + r'" class="form-input" placeholder="ex: A">\s*</div>\s*<div class="form-group">\s*<label class="form-label">Número da Coluna</label>\s*<input type="number" id="field-column-number' + id_suffix + r'" class="form-input" placeholder="ex: 3" min="1">\s*</div>'
    )
    replacement = f'''<div class="form-group">
                  <label class="form-label">Coluna</label>
                  <select id="field-column{id_suffix}" class="form-input">
                    <option value="">Selecione...</option>
                    <option value="Aéreo">Aéreo</option>
                    <option value="Piso">Piso</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Número da Coluna</label>
                  <select id="field-column-number{id_suffix}" class="form-input">
                    <option value="">Selecione...</option>{options}
                  </select>
                </div>'''
    return pattern.sub(replacement, text)

for file in files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        suffix = ''
        if 'hortifruti' in file: suffix = '-hortifruti'
        elif 'mercearia' in file: suffix = '-mercearia'
        elif 'padaria' in file: suffix = '-padaria'
        elif 'pereciveis' in file: suffix = '-pereciveis'
        
        new_content = replace_block(content, suffix)
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file}")
    except Exception as e:
        print(f"Error processing {file}: {e}")

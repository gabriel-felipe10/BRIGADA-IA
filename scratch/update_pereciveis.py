import json, re

# The 61 items extracted from Page 1 of PDF OCR
items = [
  {"plu": "271", "name": "BEB LACT BAT GUT BETANIA SCH 900G AMEIXA", "category": "laticinios", "barcode": "7898403781014"},
  {"plu": "46173", "name": "BEB LACT BAT GUT BETANIA SCH 900G GRAVIOLA", "category": "laticinios", "barcode": "7898403781021"},
  {"plu": "49777", "name": "BEB LACT BAT GUT BETANIA SCH 900G MAC CEREJAS", "category": "laticinios", "barcode": "7898064011826"},
  {"plu": "270", "name": "BEB LACT BAT GUT BETANIA SCH 900G MORANGO", "category": "laticinios", "barcode": "7898403780451"},
  {"plu": "46180", "name": "BEB LACT BETANIA BD540G COCO", "category": "laticinios", "barcode": "7898403782196"},
  {"plu": "269", "name": "BEB LACT BETANIA BD540G MOR AMEIXA", "category": "laticinios", "barcode": "7898403780970"},
  {"plu": "268", "name": "BEB LACT BETANIA BD540G MOR", "category": "laticinios", "barcode": "7898403780574"},
  {"plu": "5880", "name": "BEB LACT CHAMYTO 130G MOR CER CHOC", "category": "laticinios", "barcode": "7891000260166"},
  {"plu": "5881", "name": "BEB LACT CHAMYTO 130G MOR CER COLOR", "category": "laticinios", "barcode": "7891000261460"},
  {"plu": "25289", "name": "BEB LACT ELEGE BJ 510G MOR AMEIXA", "category": "laticinios", "barcode": "7891097101748"},
  {"plu": "46148", "name": "BEB LACT FERM BETANIA BD680G MOR", "category": "laticinios", "barcode": "7898950516084"},
  {"plu": "33335", "name": "BEB LACT FERM DANONE BD 510G MORANGO", "category": "laticinios", "barcode": "7891025121626"},
  {"plu": "33332", "name": "BEB LACT FERM DANONE KIDS BD 510G MORANGO", "category": "laticinios", "barcode": "7891025121640"},
  {"plu": "25262", "name": "BEB LACT FERM ELEGE 1150G MOR", "category": "laticinios", "barcode": "7891097103223"},
  {"plu": "25264", "name": "BEB LACT FERM ELEGE 1150G SALADA FRUTAS", "category": "laticinios", "barcode": "7891097103230"},
  {"plu": "3237", "name": "BEB LACT FERM LETA 540G MORANGO", "category": "laticinios", "barcode": "7898144260472"},
  {"plu": "3238", "name": "BEB LACT FERM LETA BICAMADA 120G MORANGO", "category": "laticinios", "barcode": "7898144260243"},
  {"plu": "50827", "name": "BEB LACT FERM LETA GF 850G FRUTAS CEREAIS", "category": "laticinios", "barcode": "7898144260199"},
  {"plu": "50829", "name": "BEB LACT FERM LETA GF 850G LIGHT MORANGO", "category": "laticinios", "barcode": "7898144260373"},
  {"plu": "3200", "name": "BEB LACT FERM LETA SCH 150G MORANGO", "category": "laticinios", "barcode": "7898144260342"},
  {"plu": "50818", "name": "BEB LACT FERM LETA SCH 900G ACAI BANANA", "category": "laticinios", "barcode": "7898144261233"},
  {"plu": "3250", "name": "BEB LACT FERM LETA SCH 900G AMEIXA", "category": "laticinios", "barcode": "7898144260441"},
  {"plu": "3253", "name": "BEB LACT FERM LETA SCH 900G CAJA", "category": "laticinios", "barcode": "7898144260724"},
  {"plu": "3248", "name": "BEB LACT FERM LETA SCH 900G FR CER", "category": "laticinios", "barcode": "7898144260496"},
  {"plu": "3252", "name": "BEB LACT FERM LETA SCH 900G GRAV", "category": "laticinios", "barcode": "7898144260229"},
  {"plu": "3241", "name": "BEB LACT FERM LETA SCH 900G MORANGO", "category": "laticinios", "barcode": "7898144260489"},
  {"plu": "13774", "name": "BEB LACT FERM POLPA BATAVO 540G MOR COCO", "category": "laticinios", "barcode": "7891097101854"},
  {"plu": "22908", "name": "BEB LACT IPOJUCA GF 170G AMEIXA", "category": "laticinios", "barcode": "7898925984382"},
  {"plu": "22907", "name": "BEB LACT IPOJUCA GF 170G SALADA FRUTAS", "category": "laticinios", "barcode": "7898925984375"},
  {"plu": "22914", "name": "BEB LACT IPOJUCA GF 850G MOR", "category": "laticinios", "barcode": "7898925984443"},
  {"plu": "22915", "name": "BEB LACT IPOJUCA GF 850G SALADA FRUTAS", "category": "laticinios", "barcode": "7898925984474"},
  {"plu": "22904", "name": "BEB LACT IPOJUCA SCH 900G ACAI C BANANA", "category": "laticinios", "barcode": "7898925984528"},
  {"plu": "22905", "name": "BEB LACT IPOJUCA SCH 900G AMEIXA", "category": "laticinios", "barcode": "7898925984283"},
  {"plu": "22903", "name": "BEB LACT IPOJUCA SCH 900G SALADA FRUTAS", "category": "laticinios", "barcode": "7898925984276"},
  {"plu": "46260", "name": "BEB LACT ISINHO SCH 70G MORANGO", "category": "laticinios", "barcode": "7898034920899"},
  {"plu": "46261", "name": "BEB LACT ISINHO SCH 70G TUTTI FRUT", "category": "laticinios", "barcode": "7898034920264"},
  {"plu": "472", "name": "BEB LACT ISIS 150G MOR", "category": "laticinios", "barcode": "7898037640121"},
  {"plu": "473", "name": "BEB LACT ISIS 150G SALADA FR", "category": "laticinios", "barcode": "7898037640381"},
  {"plu": "35061", "name": "BEB LACT ISIS BD 540G BANANA C MACA", "category": "laticinios", "barcode": "7898037640978"},
  {"plu": "489", "name": "BEB LACT ISIS BD 540G MOR", "category": "laticinios", "barcode": "7898037640930"},
  {"plu": "35060", "name": "BEB LACT ISIS BD 540G SALADA FRUTAS", "category": "laticinios", "barcode": "7898037640947"},
  {"plu": "474", "name": "BEB LACT ISIS SCH 900G AMEIXA", "category": "laticinios", "barcode": "7898037640633"},
  {"plu": "22972", "name": "BEB LACT ISIS SCH 900G BANANA MACA", "category": "laticinios", "barcode": "7898037640411"},
  {"plu": "475", "name": "BEB LACT ISIS SCH 900G GRAV", "category": "laticinios", "barcode": "7898037640244"},
  {"plu": "476", "name": "BEB LACT ISIS SCH 900G MOR", "category": "laticinios", "barcode": "7898037640138"},
  {"plu": "478", "name": "BEB LACT ISIS SCH 900G SALADA FR", "category": "laticinios", "barcode": "7898037640404"},
  {"plu": "20235", "name": "BEB LACT NESTLE NESTON GFA 850G MACA E BANANA", "category": "laticinios", "barcode": "7891000260623"},
  {"plu": "13785", "name": "BEB LACT POLPA ELEGE BOB MOR BD510G", "category": "laticinios", "barcode": "7891097101465"},
  {"plu": "102910", "name": "BEB LACT POLPA VIGOR ZR MOR 480G", "category": "laticinios", "barcode": "7896625213436"},
  {"plu": "287", "name": "COALHADA BETANIA 140G ADOC INT", "category": "laticinios", "barcode": "7898403780277"},
  {"plu": "286", "name": "COALHADA BETANIA 140G LIGHT", "category": "laticinios", "barcode": "7898403780284"},
  {"plu": "481", "name": "COALHADA ISIS COPO 150G DESN", "category": "laticinios", "barcode": "7898037640176"},
  {"plu": "482", "name": "COALHADA ISIS COPO 150G INT", "category": "laticinios", "barcode": "7898037640183"},
  {"plu": "50812", "name": "COALHADA LETA 140G AMEIXA", "category": "laticinios", "barcode": "7898144260717"},
  {"plu": "50813", "name": "COALHADA LETA 140G INTEGRAL", "category": "laticinios", "barcode": "7898144260731"},
  {"plu": "50811", "name": "COALHADA LETA 140G LIGHT DESN", "category": "laticinios", "barcode": "7898144260748"},
  {"plu": "50810", "name": "COALHADA LETA 140G MORANGO", "category": "laticinios", "barcode": "7898144260700"},
  {"plu": "25840", "name": "IOG ACTIVIA CAFE DA MANHA 170G AMARANTO MAMAO", "category": "laticinios", "barcode": "7891025117797"},
  {"plu": "25841", "name": "IOG ACTIVIA CAFE DA MANHA 170G LINH MOR", "category": "laticinios", "barcode": "7891025117742"},
  {"plu": "33340", "name": "IOG ACTIVIA POLPA BD680G MAMAO E CEREAIS", "category": "laticinios", "barcode": "7891025123248"},
  {"plu": "33341", "name": "IOG ACTIVIA POLPA BD680G MOR", "category": "laticinios", "barcode": "7891025123231"}
]

print(f"Total new pereciveis items: {len(items)}")

# Update data.js
with open('app/static/js/data.js', 'r', encoding='utf-8') as f:
    data_content = f.read()

# Generate JS objects for new items
start_id = 5000
js_items = []
for idx, item in enumerate(items):
    supplier = "Betânia" if "BETANIA" in item["name"] else "Danone" if "DANONE" in item["name"] or "ACTIVIA" in item["name"] else "Isis" if "ISIS" in item["name"] else "Leta" if "LETA" in item["name"] else "Ipojuca" if "IPOJUCA" in item["name"] else "Nestlé" if "NESTLE" in item["name"] or "CHAMYTO" in item["name"] else "Elegê" if "ELEGE" in item["name"] else "Outros Laticínios"
    obj = f"""  {{
    id: {start_id + idx},
    plu: '{item["plu"]}',
    name: '{item["name"]}',
    category: 'laticinios',
    startDate: daysAgo(5),
    endDate: daysFromNow(15),
    unit: 'un',
    supplier: '{supplier}',
    location: 'Gôndola Laticínios',
    quantity: 20,
    barcode: '{item["barcode"]}'
  }},"""
    js_items.append(obj)

new_js_block = "\n".join(js_items)

# Find PRODUCTS_DB end array bracket and insert items before it
if "const PRODUCTS_DB = [" in data_content:
    # Insert at end of array
    idx = data_content.rfind("];")
    if idx != -1:
        updated_data = data_content[:idx] + "  // ── LATICÍNIOS (CADASTRADOS VIA ANÁLISE DE ESTOQUE) ──\n" + new_js_block + "\n" + data_content[idx:]
        with open('app/static/js/data.js', 'w', encoding='utf-8') as f:
            f.write(updated_data)
        print("Updated app/static/js/data.js successfully!")

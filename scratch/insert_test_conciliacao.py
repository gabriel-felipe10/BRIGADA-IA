import os, json, requests
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "http://localhost:5000/api/products"
today = "2026-07-14"

test_items = [
    {
        "plu": "34272",
        "name": "ASA FGO RESF MAURICEA KG",
        "category": "conciliacao",
        "endDate": today,
        "startDate": today,
        "location": "Câmara Resfriada",
        "unit": "kg",
        "quantity": 12.5,
        "supplier": "Inventário Físico [Criado por: felipe@brigada.com]"
    },
    {
        "plu": "10008",
        "name": "ASA FGO RESF NATTO BD700G",
        "category": "conciliacao",
        "endDate": today,
        "startDate": today,
        "location": "Câmara Resfriada",
        "unit": "kg",
        "quantity": 8.0,
        "supplier": "Inventário Físico [Criado por: felipe@brigada.com]"
    },
    {
        "plu": "63298",
        "name": "COXA C SOB DORSAL CANCAO ENV KG",
        "category": "conciliacao",
        "endDate": today,
        "startDate": today,
        "location": "Congelado",
        "unit": "kg",
        "quantity": 25.0,
        "supplier": "Inventário Físico [Criado por: felipe@brigada.com]"
    },
    {
        "plu": "20723",
        "name": "FILE PEITO FGO C ASSA F SEARA 800G",
        "category": "conciliacao",
        "endDate": today,
        "startDate": today,
        "location": "Congelado",
        "unit": "kg",
        "quantity": 15.3,
        "supplier": "Inventário Físico [Criado por: felipe@brigada.com]"
    },
    {
        "plu": "102159",
        "name": "MEIO DA ASA TULIPA NABRASA 800GR",
        "category": "conciliacao",
        "endDate": today,
        "startDate": today,
        "location": "Antecâmara",
        "unit": "kg",
        "quantity": 6.0,
        "supplier": "Inventário Físico [Criado por: felipe@brigada.com]"
    }
]

for item in test_items:
    r = requests.post(BASE_URL, json=item)
    if r.ok:
        data = r.json()
        print(f"OK Criado: {item['plu']} - {item['name']} (id={data.get('id')})")
    else:
        print(f"ERRO {item['plu']}: {r.status_code} - {r.text}")

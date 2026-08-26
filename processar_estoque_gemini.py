import os
import sys
import re
import json
import time
import asyncio
import argparse
from pathlib import Path
from typing import List, Dict, Any, Optional

# Garante suporte a UTF-8 no stdout do Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

import pandas as pd
from tqdm import tqdm
from PIL import Image
from dotenv import load_dotenv

# Carrega variaveis do arquivo .env se existir
load_dotenv()

# Tenta carregar google-genai
try:
    from google import genai
    from google.genai import types
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

# Tenta carregar winocr para modo local de alta performance
try:
    import winocr
    HAS_WINOCR = True
except ImportError:
    HAS_WINOCR = False


PROMPT_EXTRACAO = """Voce e um especialista em visao computacional e extracao de dados de telas e sistemas de estoque/supermercado.
Analise a captura de tela fornecida e extraia com maxima precisao os dados visiveis da interface.

Retorne ESTRITAMENTE um objeto JSON com as seguintes chaves:
{
  "codigo_produto": "Codigo interno, SKU, codigo de barras/EAN ou codigo Consinco visivel (ex: '47060', '7891234567890'), ou null se nao houver",
  "descricao_produto": "Descricao ou nome completo do produto visivel na tela, ou null se nao houver",
  "quantidade_estoque": "Quantidade, saldo em estoque, unidades ou peso registrado (ex: 360, '15.5 kg', 10), ou null se nao houver",
  "valor_preco": "Preco unitario, custo, valor total ou preco de venda visivel (ex: 'R$ 15,90' ou 15.90), ou null se nao houver",
  "validade": "Data de validade, fabricacao ou lote visivel (ex: '10/05/2027', '10/05/27'), ou null se nao houver",
  "status_observacao": "Qualquer observacao extra, tag, setor interno, tipo de embalagem ou nota visivel na tela, ou null se nao houver"
}

Se a imagem nao contiver dados de produto/estoque ou for ilegivel, preencha os campos com null e informe em status_observacao."""


def encontrar_diretorio_padrao() -> Path:
    """Identifica o diretorio de imagens mais provavel."""
    candidatos = [
        Path(r"C:\Users\Felipe Gabriel\Downloads\camras"),
        Path(r"C:\Users\Felipe - Pessoal\OneDrive\Imagens\Capturas de Tela"),
        Path(r"C:\Users\Felipe Gabriel\OneDrive\Imagens\Capturas de Tela"),
        Path(r"C:\Users\Felipe Gabriel\Pictures\Screenshots"),
        Path(r"C:\Users\Felipe Gabriel\Pictures\Capturas de Tela"),
        Path(r"C:\Users\Felipe Gabriel\Downloads"),
    ]
    for c in candidatos:
        if c.exists() and c.is_dir():
            for ext in ("*.png", "*.jpg", "*.jpeg", "*.PNG", "*.JPG", "*.JPEG"):
                if any(c.rglob(ext)):
                    return c
    return candidatos[0]


def coletar_arquivos_imagem(diretorio_base: Path) -> List[Path]:
    """Varre recursivamente o diretorio em busca de imagens .png, .jpg e .jpeg."""
    extensoes = ("*.png", "*.jpg", "*.jpeg", "*.PNG", "*.JPG", "*.JPEG")
    arquivos = []
    for ext in extensoes:
        arquivos.extend(diretorio_base.rglob(ext))
    return sorted(list(set(arquivos)))


def parse_ocr_text(text: str, filename: str, subfolder: str) -> Dict[str, Any]:
    """Extrai campos estruturados a partir do texto OCR do aplicativo Dext / etiquetas."""
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    full = ' '.join(lines)
    
    # 1. Codigo do produto / Consinco
    codigo = None
    m_cod = re.search(r'C[oó]digo\s*:?\s*(\d+)', full, re.IGNORECASE)
    if m_cod:
        codigo = m_cod.group(1)
    else:
        m_ean = re.search(r'(7\s*\.?\s*8\s*\.?\s*9[\d\.\s]{10,20})', full)
        if m_ean:
            codigo = re.sub(r'[\.\s]', '', m_ean.group(1))
        else:
            m_end = re.search(r'\b(\d{4,6})\b', full)
            if m_end:
                codigo = m_end.group(1)

    # 2. Descricao do produto
    descricao = None
    m_desc = re.search(r'(?:Detalhe\s+Produto|Lojas\s+Dispon[ií]veis)\s*(.+?)(?:C[oó]digo|Loja|7\.8|789|\d{5}|$)', full, re.IGNORECASE)
    if m_desc:
        d = m_desc.group(1).strip()
        d = re.sub(r'^(?:Lojas\s+Dispon[ií]veis|Detalhe\s+Produto)\s*', '', d, flags=re.IGNORECASE)
        d = re.sub(r'\s{2,}', ' ', d).strip()
        if len(d) > 2:
            descricao = d
            
    if not descricao and len(lines) > 0:
        keywords = ['FILE', 'FGO', 'FRANGO', 'CARRE', 'LING', 'PEITO', 'COXA', 'SUI', 'BARRIGA', 'ASA', 'COSTELINHA', 'TEMP', 'CONG', 'SEARA', 'SADIA', 'NATTO', 'MAURICEA']
        for l in lines:
            if any(w in l.upper() for w in keywords) and len(l) > 3:
                descricao = l
                break

    # 3. Data de Validade / Fabricacao
    validade = None
    m_val = re.search(r'(\d{2}/\d{2}/\d{2,4})', full)
    if m_val:
        validade = m_val.group(1)

    # 4. Quantidade / Saldo / Multiplicacao
    quantidade = None
    m_calc = re.search(r'(\d+\s*[xX]\s*\d+\s*(?:=\s*)?\d+|\b\d+\s*kg\b|\b\d{2,4}\b(?=\s*$))', full)
    if m_calc:
        quantidade = m_calc.group(1)

    # 5. Preco / Valor
    preco = None
    m_pr = re.search(r'R\$\s*[\d\.,]+', full)
    if m_pr:
        preco = m_pr.group(0)

    # Observacao
    obs = None
    if 'Indenizado' in full:
        obs = 'Indenizado'
    elif 'Loja Selecionada' in full:
        m_lj = re.search(r'Loja Selecionada\s*([^\n\r]+)', full)
        obs = m_lj.group(0)[:40] if m_lj else None

    return {
        "nome_arquivo": filename,
        "setor_subpasta": subfolder,
        "codigo_produto": codigo,
        "descricao_produto": descricao,
        "quantidade_estoque": quantidade,
        "valor_preco": preco,
        "validade": validade,
        "status_observacao": obs or ("OCR processado com sucesso" if (codigo or descricao) else "Sem dados visíveis"),
    }


def processar_imagem_gemini(client: genai.Client, caminho_img: Path, diretorio_base: Path) -> Dict[str, Any]:
    """Processa uma única imagem com Gemini 2.5 Flash."""
    nome_arquivo = caminho_img.name
    try:
        rel_path = caminho_img.relative_to(diretorio_base).parent
        setor_subpasta = str(rel_path) if str(rel_path) != "." else "Raiz"
    except Exception:
        setor_subpasta = caminho_img.parent.name

    resultado_padrao = {
        "nome_arquivo": nome_arquivo,
        "setor_subpasta": setor_subpasta,
        "codigo_produto": None,
        "descricao_produto": None,
        "quantidade_estoque": None,
        "valor_preco": None,
        "validade": None,
        "status_observacao": None,
    }

    try:
        pil_img = Image.open(caminho_img)
        max_dim = 2048
        if max(pil_img.size) > max_dim:
            pil_img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[pil_img, PROMPT_EXTRACAO],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1,
            )
        )
        
        texto_resposta = response.text.strip()
        dados_json = json.loads(texto_resposta)

        resultado_padrao.update({
            "codigo_produto": dados_json.get("codigo_produto"),
            "descricao_produto": dados_json.get("descricao_produto"),
            "quantidade_estoque": dados_json.get("quantidade_estoque"),
            "valor_preco": dados_json.get("valor_preco"),
            "validade": dados_json.get("validade"),
            "status_observacao": dados_json.get("status_observacao"),
        })

    except Exception as e:
        resultado_padrao["status_observacao"] = f"[ERRO]: {str(e)}"

    return resultado_padrao


async def processar_imagem_ocr(caminho_img: Path, diretorio_base: Path) -> Dict[str, Any]:
    """Processa uma imagem localmente com Windows OCR."""
    nome_arquivo = caminho_img.name
    try:
        rel_path = caminho_img.relative_to(diretorio_base).parent
        setor_subpasta = str(rel_path) if str(rel_path) != "." else "Raiz"
    except Exception:
        setor_subpasta = caminho_img.parent.name

    try:
        pil_img = Image.open(caminho_img)
        max_dim = 1920
        if max(pil_img.size) > max_dim:
            pil_img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)

        res = await winocr.recognize_pil(pil_img, 'pt')
        return parse_ocr_text(res.text, nome_arquivo, setor_subpasta)
    except Exception as e:
        return {
            "nome_arquivo": nome_arquivo,
            "setor_subpasta": setor_subpasta,
            "codigo_produto": None,
            "descricao_produto": None,
            "quantidade_estoque": None,
            "valor_preco": None,
            "validade": None,
            "status_observacao": f"[ERRO OCR]: {str(e)}",
        }


async def main_async():
    parser = argparse.ArgumentParser(description="Processar prints de estoque com Gemini 2.5 Flash / OCR")
    parser.add_argument("--dir", type=str, help="Caminho do diretorio contendo as imagens")
    parser.add_argument("--api-key", type=str, help="Chave de API do Google Gemini")
    parser.add_argument("--limite", type=int, default=None, help="Limite de imagens para processar (opcional)")
    args = parser.parse_args()

    api_key = args.api_key or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")

    if args.dir:
        diretorio_base = Path(args.dir)
    else:
        diretorio_base = encontrar_diretorio_padrao()

    if not diretorio_base.exists():
        print(f"[ERRO] Diretorio nao encontrado: {diretorio_base}")
        sys.exit(1)

    # Identifica modo de processamento
    usar_gemini = bool(api_key and HAS_GENAI)
    modo_str = "GEMINI 2.5 FLASH (API)" if usar_gemini else "NATIVE WINDOWS VISION OCR ENGINE"

    print("="*70)
    print(f"🚀 INICIANDO PROCESSAMENTO DE CAPTURAS DE TELA ({modo_str})")
    print(f"📁 Diretorio Base: {diretorio_base}")
    print("="*70)

    client = genai.Client(api_key=api_key) if usar_gemini else None

    arquivos = coletar_arquivos_imagem(diretorio_base)
    total_encontrado = len(arquivos)
    print(f"🔍 Total de imagens encontradas (.png, .jpg, .jpeg): {total_encontrado}")

    if total_encontrado == 0:
        print("[AVISO] Nenhuma imagem encontrada para processar.")
        sys.exit(0)

    if args.limite:
        arquivos = arquivos[:args.limite]
        print(f"⚡ Processando amostra de {len(arquivos)} imagens.")

    resultados = []
    sucessos = 0
    erros = 0

    pbar = tqdm(arquivos, desc="Processando capturas", unit="img")
    for img_path in pbar:
        if usar_gemini:
            res = processar_imagem_gemini(client, img_path, diretorio_base)
        else:
            res = await processar_imagem_ocr(img_path, diretorio_base)
            
        resultados.append(res)
        
        if res.get("status_observacao") and "[ERRO" in str(res.get("status_observacao")):
            erros += 1
        else:
            sucessos += 1
        
        pbar.set_postfix({"OK": sucessos, "Falhas": erros})

    df = pd.DataFrame(resultados)

    colunas = [
        "nome_arquivo",
        "setor_subpasta",
        "codigo_produto",
        "descricao_produto",
        "quantidade_estoque",
        "valor_preco",
        "validade",
        "status_observacao",
    ]
    df = df[colunas]

    out_excel = "dados_estoque_consolidados.xlsx"
    out_csv = "dados_estoque_consolidados.csv"

    print("\n" + "="*70)
    print("💾 Salvando arquivos consolidados...")
    
    df.to_excel(out_excel, index=False, engine="openpyxl")
    df.to_csv(out_csv, index=False, encoding="utf-8-sig")

    print(f"✅ Arquivo Excel gerado: {os.path.abspath(out_excel)}")
    print(f"✅ Arquivo CSV gerado:   {os.path.abspath(out_csv)}")
    print("="*70)
    print(f"📊 TOTAL PROCESSADO: {len(resultados)}")
    print(f"   ✓ Registros extraidos: {sucessos}")
    print(f"   ✗ Falhas: {erros}")
    print("="*70)


def main():
    asyncio.run(main_async())


if __name__ == "__main__":
    main()



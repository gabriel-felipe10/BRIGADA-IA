import os
import subprocess
import shutil

# ==============================================================================
# BRIGADA-IA — Açougue & Perecíveis
# Gerador Oficial de Documentos e Folhas Diárias de Auditoria de Validade
# Gera o Caderno Semanal Completo (8 páginas) e as 7 Folhas Diárias Individuais
# ==============================================================================

DAYS_DATA = [
    {
        "dayKey": "domingo",
        "dayName": "Domingo",
        "dayShort": "Dom",
        "badgeBg": "#e0f2fe",
        "badgeColor": "#0284c7",
        "columns": [1, 2, 3],
        "palletsCount": 24,
        "freezers": [42, 43, 44, 45, 46],
        "freezersCategory": "🐟 Pescados (Filés, Postas, Frutos do Mar, Camarão, Salmão)",
        "freezerDetails": [
            {"id": "F42", "desc": "Pescados — Filés Nobres (Tilápia, Panga, Merluza)", "temp": "-18°C a -22°C"},
            {"id": "F43", "desc": "Pescados — Postas (Cação, Salmão, Corvina)", "temp": "-18°C a -22°C"},
            {"id": "F44", "desc": "Pescados — Frutos do Mar & Camarão (Cinza, Rosa)", "temp": "-18°C a -22°C"},
            {"id": "F45", "desc": "Pescados — Empanados & Bacalhau Dessalgado", "temp": "-18°C a -22°C"},
            {"id": "F46", "desc": "Pescados — Peixes Inteiros Congelados & Especiais", "temp": "-18°C a -22°C"},
        ]
    },
    {
        "dayKey": "segunda",
        "dayName": "Segunda-feira",
        "dayShort": "Seg",
        "badgeBg": "#f3e8ff",
        "badgeColor": "#7e22ce",
        "columns": [4, 5, 6],
        "palletsCount": 24,
        "freezers": [47, 48, 34, 35],
        "freezersCategory": "🐟 Pescados (F47, F48) + 🐷 Suínos & Embutidos (F34, F35)",
        "freezerDetails": [
            {"id": "F47", "desc": "Pescados — Cortes Congelados & Promoções do Dia", "temp": "-18°C a -22°C"},
            {"id": "F48", "desc": "Pescados — Polvos, Lulas & Iguarias do Mar", "temp": "-18°C a -22°C"},
            {"id": "F34", "desc": "Suínos — Costela, Lombo, Bisteca & Carnes Nobres", "temp": "-18°C a -22°C"},
            {"id": "F35", "desc": "Suínos — Embutidos Congelados, Pernil & Panceta", "temp": "-18°C a -22°C"},
        ]
    },
    {
        "dayKey": "terca",
        "dayName": "Terça-feira",
        "dayShort": "Ter",
        "badgeBg": "#ffedd5",
        "badgeColor": "#c2410c",
        "columns": [7, 8, 9],
        "palletsCount": 24,
        "freezers": [36, 37, 38, 39, 40],
        "freezersCategory": "🍱 Misto Bovino/Suíno/Aves (F36–F39) + 🐮 Bovino (F40)",
        "freezerDetails": [
            {"id": "F36", "desc": "Misto — Hambúrgueres Bovinos, Suínos & Aves", "temp": "-18°C a -22°C"},
            {"id": "F37", "desc": "Misto — Almôndegas, Kaftas & Pratos Prontos", "temp": "-18°C a -22°C"},
            {"id": "F38", "desc": "Misto — Embutidos Especiais & Linguiças Mistas", "temp": "-18°C a -22°C"},
            {"id": "F39", "desc": "Misto — Cortes Fracionados Congelados Congênitos", "temp": "-18°C a -22°C"},
            {"id": "F40", "desc": "Bovinos — Cortes Congelados Porcionados & Bifes", "temp": "-18°C a -22°C"},
        ]
    },
    {
        "dayKey": "quarta",
        "dayName": "Quarta-feira",
        "dayShort": "Qua",
        "badgeBg": "#fef3c7",
        "badgeColor": "#b45309",
        "columns": [10, 11],
        "palletsCount": 16,
        "freezers": [41, 17, 18, 19],
        "freezersCategory": "🐮 Bovino (F41) + 🐔 Aves Congeladas (F17, F18, F19)",
        "freezerDetails": [
            {"id": "F41", "desc": "Bovinos — Peças Inteiras a Vácuo & Costelas", "temp": "-18°C a -22°C"},
            {"id": "F17", "desc": "Aves — Coxas & Sobrecoxas Pacote Congelado", "temp": "-18°C a -22°C"},
            {"id": "F18", "desc": "Aves — Peito de Frango Congelado (Com/Sem Osso)", "temp": "-18°C a -22°C"},
            {"id": "F19", "desc": "Aves — Asas, Meio da Asa & Coxinhas da Asa", "temp": "-18°C a -22°C"},
        ]
    },
    {
        "dayKey": "quinta",
        "dayName": "Quinta-feira",
        "dayShort": "Qui",
        "badgeBg": "#d1fae5",
        "badgeColor": "#047857",
        "columns": [12, 13],
        "palletsCount": 16,
        "freezers": [20, 21, 22, 23, 24],
        "freezersCategory": "🐔 Aves (Cortes Nobres, Frango a Passarinho, Peito & Miúdos)",
        "freezerDetails": [
            {"id": "F20", "desc": "Aves — Frango a Passarinho (Temperado e Natural)", "temp": "-18°C a -22°C"},
            {"id": "F21", "desc": "Aves — Filezinho Sassami & Peito Fatiado", "temp": "-18°C a -22°C"},
            {"id": "F22", "desc": "Aves — Frango Inteiro Congelado & Galetos", "temp": "-18°C a -22°C"},
            {"id": "F23", "desc": "Aves — Miúdos Congelados (Moela, Fígado, Coração)", "temp": "-18°C a -22°C"},
            {"id": "F24", "desc": "Aves — Cortes Nobres Congelados em Bandeja", "temp": "-18°C a -22°C"},
        ]
    },
    {
        "dayKey": "sexta",
        "dayName": "Sexta-feira",
        "dayShort": "Sex",
        "badgeBg": "#fce7f3",
        "badgeColor": "#be185d",
        "columns": [14, 15],
        "palletsCount": 16,
        "freezers": [25, 26, 27, 28],
        "freezersCategory": "🐔 Aves (F25) + 🐮 Bovino Congelado (F26, F27, F28)",
        "freezerDetails": [
            {"id": "F25", "desc": "Aves — Embutidos de Frango & Cortes Desossados", "temp": "-18°C a -22°C"},
            {"id": "F26", "desc": "Bovinos — Cortes Traseiros Congelados Nobres", "temp": "-18°C a -22°C"},
            {"id": "F27", "desc": "Bovinos — Cortes Dianteiros Congelados & Moída", "temp": "-18°C a -22°C"},
            {"id": "F28", "desc": "Bovinos — Carnes de Segunda & Miúdos Bovinos", "temp": "-18°C a -22°C"},
        ]
    },
    {
        "dayKey": "sabado",
        "dayName": "Sábado",
        "dayShort": "Sáb",
        "badgeBg": "#e0e7ff",
        "badgeColor": "#4338ca",
        "columns": [16],
        "palletsCount": 8,
        "freezers": [29, 30, 31, 32],
        "freezersCategory": "🐔 Aves Congeladas (Coxas, Sobrecoxas, Asas Especiais)",
        "freezerDetails": [
            {"id": "F29", "desc": "Aves — Cortes em Caixas Fechadas / Volume Atacado", "temp": "-18°C a -22°C"},
            {"id": "F30", "desc": "Aves — Linha Fácil Congelada & Temperados Sadia/Perdigão", "temp": "-18°C a -22°C"},
            {"id": "F31", "desc": "Aves — Empanados, Nuggets & Linha Prática", "temp": "-18°C a -22°C"},
            {"id": "F32", "desc": "Aves — Reposição Intensiva de Fim de Semana", "temp": "-18°C a -22°C"},
        ]
    }
]

CSS_STYLES = """
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  @page {
    size: A4 portrait;
    margin: 6mm 7mm 7mm 7mm;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #0f172a;
    background: #ffffff;
    font-size: 8pt;
    line-height: 1.25;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .page {
    width: 100%;
    height: 100%;
    min-height: 280mm;
    max-height: 283mm;
    page-break-after: always;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
  }

  .page:last-child {
    page-break-after: avoid;
  }

  /* Header */
  .doc-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #0284c7;
    padding-bottom: 5px;
    margin-bottom: 6px;
  }

  .logo-block {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .logo-badge {
    background: linear-gradient(135deg, #0284c7, #2563eb);
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 13pt;
  }

  .title-group h1 {
    font-size: 12pt;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.2px;
    line-height: 1.1;
  }

  .title-group .subtitle {
    font-size: 7.2pt;
    color: #475569;
    font-weight: 600;
  }

  .meta-right {
    text-align: right;
    font-size: 7pt;
    color: #475569;
    line-height: 1.3;
  }

  .day-pill {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 12px;
    font-weight: 800;
    font-size: 8.5pt;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  /* Preenchimento / Meta auditoria */
  .audit-meta-bar {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 5px;
    padding: 4px 8px;
    margin-bottom: 6px;
    display: grid;
    grid-template-columns: 1.2fr 1fr 1.6fr 1.1fr 1.1fr;
    gap: 8px;
    font-size: 7.2pt;
    align-items: center;
  }

  .audit-field strong {
    color: #334155;
  }

  .fill-line {
    display: inline-block;
    border-bottom: 1px dashed #64748b;
    min-width: 60px;
    height: 12px;
    vertical-align: middle;
  }

  /* Section Titles */
  .section-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #f1f5f9;
    border-left: 3.5px solid #0284c7;
    padding: 3px 6px;
    border-radius: 0 4px 4px 0;
    margin-bottom: 4px;
    margin-top: 2px;
  }

  .section-bar h2 {
    font-size: 8.2pt;
    font-weight: 700;
    color: #0f172a;
    text-transform: uppercase;
    letter-spacing: 0.2px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .section-bar .sub-badge {
    font-size: 6.8pt;
    background: #e2e8f0;
    color: #334155;
    padding: 1px 6px;
    border-radius: 10px;
    font-weight: 600;
  }

  /* Grids and Tables */
  .col-grid {
    display: grid;
    gap: 6px;
    margin-bottom: 6px;
  }

  .col-card {
    border: 1px solid #cbd5e1;
    border-radius: 5px;
    background: #ffffff;
    overflow: hidden;
  }

  .col-card-header {
    background: #1e293b;
    color: #ffffff;
    padding: 3px 6px;
    font-size: 7.2pt;
    font-weight: 700;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  table.compact-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 6.8pt;
  }

  table.compact-table th {
    background: #f1f5f9;
    color: #334155;
    padding: 2.5px 4px;
    font-weight: 700;
    border-bottom: 1px solid #cbd5e1;
    text-align: left;
  }

  table.compact-table td {
    padding: 2.5px 4px;
    border-bottom: 1px solid #e2e8f0;
    color: #1e293b;
    vertical-align: middle;
  }

  table.compact-table tr:last-child td {
    border-bottom: none;
  }

  .checkbox-square {
    width: 11px;
    height: 11px;
    border: 1px solid #64748b;
    border-radius: 2px;
    display: inline-block;
    vertical-align: middle;
  }

  /* Piso de Loja Table */
  table.piso-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 7pt;
    margin-bottom: 6px;
  }

  table.piso-table th {
    background: #0f172a;
    color: #ffffff;
    padding: 3px 5px;
    font-weight: 600;
    text-align: left;
    font-size: 6.8pt;
  }

  table.piso-table td {
    padding: 3px 5px;
    border-bottom: 1px solid #e2e8f0;
  }

  table.piso-table tr:nth-child(even) td {
    background: #f8fafc;
  }

  .fz-badge {
    background: #e0f2fe;
    color: #0369a1;
    font-weight: 800;
    padding: 1px 5px;
    border-radius: 3px;
    display: inline-block;
    font-size: 7.2pt;
  }

  /* Divergencias Table */
  table.anomaly-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 6.8pt;
    margin-bottom: 6px;
  }

  table.anomaly-table th {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    padding: 2.5px 4px;
    font-weight: 700;
    color: #334155;
    text-align: left;
  }

  table.anomaly-table td {
    border: 1px solid #cbd5e1;
    height: 16px;
    padding: 1px 4px;
    background: #ffffff;
  }

  /* POP Box */
  .pop-strip {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-left: 3px solid #0284c7;
    border-radius: 4px;
    padding: 3px 6px;
    margin-bottom: 6px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
    font-size: 6.5pt;
    color: #334155;
  }

  .pop-strip strong {
    color: #0284c7;
    display: block;
    font-size: 6.8pt;
  }

  /* Signatures */
  .signatures-bar {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    padding-top: 2px;
    margin-bottom: 3px;
  }

  .sig-item {
    text-align: center;
  }

  .sig-line {
    border-bottom: 1px solid #64748b;
    height: 18px;
    margin-bottom: 2px;
  }

  .sig-role {
    font-size: 6.8pt;
    font-weight: 700;
    color: #0f172a;
  }

  .sig-desc {
    font-size: 6pt;
    color: #64748b;
  }

  .footer-strip {
    font-size: 6.2pt;
    color: #64748b;
    display: flex;
    justify-content: space-between;
    border-top: 1px solid #cbd5e1;
    padding-top: 2px;
  }
"""

def generate_cover_page_html():
    """Gera a página 1 (Capa / Resumo Executivo Semanal)."""
    return f"""
    <!-- PÁGINA 1: RESUMO EXECUTIVO SEMANAL -->
    <div class="page" style="justify-content: flex-start; gap: 8px;">
      <div class="doc-header" style="border-bottom: 3px solid #0284c7; padding-bottom: 8px;">
        <div class="logo-block">
          <div class="logo-badge" style="width: 40px; height: 40px; font-size: 16pt;">🛡️</div>
          <div class="title-group">
            <h1 style="font-size: 15pt;">BRIGADA-IA — Gestão & Auditoria de Validade</h1>
            <div class="subtitle" style="font-size: 8.5pt;">Setor: <strong>AÇOUGUE & PERECÍVEIS</strong> • Caderno Semanal Oficial de Auditoria</div>
          </div>
        </div>
        <div class="meta-right">
          <span style="background: #0284c7; color: white; padding: 3px 8px; border-radius: 4px; font-weight: 800; font-size: 7.5pt;">CADERNO SEMANAL</span><br>
          <strong>Ciclo Completo:</strong> Domingo a Sábado<br>
          <strong>Emissão:</strong> 21/09/2026 • Versão Oficial 2.0
        </div>
      </div>

      <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 8px 12px; font-size: 7.8pt; color: #0369a1; line-height: 1.4;">
        🎯 <strong>DIRETRIZ OPERACIONAL SEMANAL:</strong> Este documento compõe o dossiê oficial de auditoria preventiva de validade do Açougue. Cada dia da semana possui sua <strong>Folha Própria e Exclusiva de Auditoria</strong> (Páginas 2 a 8). Os auditores devem preencher a folha do respectivo dia, conferindo 100% dos paletes das colunas programadas da câmara congelada e 100% dos freezers do piso de loja.
      </div>

      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 4px 0;">
        <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 16pt; font-weight: 800; color: #0284c7;">31</div>
          <div style="font-size: 6.8pt; font-weight: 700; color: #64748b; text-transform: uppercase;">Freezers Piso de Loja</div>
        </div>
        <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 16pt; font-weight: 800; color: #6366f1;">16</div>
          <div style="font-size: 6.8pt; font-weight: 700; color: #64748b; text-transform: uppercase;">Colunas Câmara Cong.</div>
        </div>
        <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 16pt; font-weight: 800; color: #10b981;">128</div>
          <div style="font-size: 6.8pt; font-weight: 700; color: #64748b; text-transform: uppercase;">Paletes Auditados</div>
        </div>
        <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 16pt; font-weight: 800; color: #f59e0b;">7 Dias</div>
          <div style="font-size: 6.8pt; font-weight: 700; color: #64748b; text-transform: uppercase;">1 Folha por Dia</div>
        </div>
      </div>

      <!-- TABELA CRONOGRAMA UNIFICADO -->
      <div class="section-bar" style="margin-top: 6px;">
        <h2>🗓️ Cronograma Semanal Sincronizado — Piso de Loja & Câmara Fria</h2>
        <span class="sub-badge">Ciclo Único sem Repetição</span>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 7.2pt; border: 1px solid #cbd5e1;">
        <thead>
          <tr style="background: #1e293b; color: white;">
            <th style="padding: 5px; text-align: left; width: 14%;">Dia da Semana</th>
            <th style="padding: 5px; text-align: left; width: 22%;">Câmara Congelada (Racks)</th>
            <th style="padding: 5px; text-align: center; width: 10%;">Paletes</th>
            <th style="padding: 5px; text-align: left; width: 26%;">Piso de Loja (Freezers)</th>
            <th style="padding: 5px; text-align: left; width: 28%;">Categorias / Produtos</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 4.5px 5px; border-bottom: 1px solid #e2e8f0;"><strong style="color: #0284c7;">DOMINGO</strong></td>
            <td style="padding: 4.5px 5px; border-bottom: 1px solid #e2e8f0;">Colunas 01, 02, 03 (3 colunas)</td>
            <td style="padding: 4.5px 5px; text-align: center; border-bottom: 1px solid #e2e8f0; font-weight: 700;">24</td>
            <td style="padding: 4.5px 5px; border-bottom: 1px solid #e2e8f0;">F42, F43, F44, F45, F46 (5 un)</td>
            <td style="padding: 4.5px 5px; border-bottom: 1px solid #e2e8f0;">🐟 Pescados (Filés, Postas, Frutos do Mar)</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 4.5px 5px; border-bottom: 1px solid #e2e8f0;"><strong style="color: #7e22ce;">SEGUNDA-FEIRA</strong></td>
            <td style="padding: 4.5px 5px; border-bottom: 1px solid #e2e8f0;">Colunas 04, 05, 06 (3 colunas)</td>
            <td style="padding: 4.5px 5px; text-align: center; border-bottom: 1px solid #e2e8f0; font-weight: 700;">24</td>
            <td style="padding: 4.5px 5px; border-bottom: 1px solid #e2e8f0;">F47, F48, F34, F35 (4 un)</td>
            <td style="padding: 4.5px 5px; border-bottom: 1px solid #e2e8f0;">🐟 Pescados (47,48) + 🐷 Suínos (34,35)</td>
          </tr>
          <tr>
            <td style="padding: 4.5px 5px; border-bottom: 1px solid #e2e8f0;"><strong style="color: #c2410c;">TERÇA-FEIRA</strong></td>
            <td style="padding: 4.5px 5px; border-bottom: 1px solid #e2e8f0;">Colunas 07, 08, 09 (3 colunas)</td>
            <td style="padding: 4.5px 5px; text-align: center; border-bottom: 1px solid #e2e8f0; font-weight: 700;">24</td>
            <td style="padding: 4.5px 5px; border-bottom: 1px solid #e2e8f0;">F36, F37, F38, F39, F40 (5 un)</td>
            <td style="padding: 4.5px 5px; border-bottom: 1px solid #e2e8f0;">🍱 Misto Bov/Suíno/Aves (36–39) + 🐮 Bovino (40)</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 4.5px 5px; border-bottom: 1px solid #e2e8f0;"><strong style="color: #b45309;">QUARTA-FEIRA</strong></td>
            <td style="padding: 4.5px 5px; border-bottom: 1px solid #e2e8f0;">Colunas 10, 11 (2 colunas)</td>
            <td style="padding: 4.5px 5px; text-align: center; border-bottom: 1px solid #e2e8f0; font-weight: 700;">16</td>
            <td style="padding: 4.5px 5px; border-bottom: 1px solid #e2e8f0;">F41, F17, F18, F19 (4 un)</td>
            <td style="padding: 4.5px 5px; border-bottom: 1px solid #e2e8f0;">🐮 Bovino (41) + 🐔 Aves (17, 18, 19)</td>
          </tr>
          <tr>
            <td style="padding: 4.5px 5px; border-bottom: 1px solid #e2e8f0;"><strong style="color: #047857;">QUINTA-FEIRA</strong></td>
            <td style="padding: 4.5px 5px; border-bottom: 1px solid #e2e8f0;">Colunas 12, 13 (2 colunas)</td>
            <td style="padding: 4.5px 5px; text-align: center; border-bottom: 1px solid #e2e8f0; font-weight: 700;">16</td>
            <td style="padding: 4.5px 5px; border-bottom: 1px solid #e2e8f0;">F20, F21, F22, F23, F24 (5 un)</td>
            <td style="padding: 4.5px 5px; border-bottom: 1px solid #e2e8f0;">🐔 Aves (Cortes Nobres, Peito, Passarinho)</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 4.5px 5px; border-bottom: 1px solid #e2e8f0;"><strong style="color: #be185d;">SEXTA-FEIRA</strong></td>
            <td style="padding: 4.5px 5px; border-bottom: 1px solid #e2e8f0;">Colunas 14, 15 (2 colunas)</td>
            <td style="padding: 4.5px 5px; text-align: center; border-bottom: 1px solid #e2e8f0; font-weight: 700;">16</td>
            <td style="padding: 4.5px 5px; border-bottom: 1px solid #e2e8f0;">F25, F26, F27, F28 (4 un)</td>
            <td style="padding: 4.5px 5px; border-bottom: 1px solid #e2e8f0;">🐔 Aves (25) + 🐮 Bovino Congelado (26–28)</td>
          </tr>
          <tr>
            <td style="padding: 4.5px 5px; border-bottom: 1px solid #e2e8f0;"><strong style="color: #4338ca;">SÁBADO</strong></td>
            <td style="padding: 4.5px 5px; border-bottom: 1px solid #e2e8f0;">Coluna 16 (1 coluna)</td>
            <td style="padding: 4.5px 5px; text-align: center; border-bottom: 1px solid #e2e8f0; font-weight: 700;">8</td>
            <td style="padding: 4.5px 5px; border-bottom: 1px solid #e2e8f0;">F29, F30, F31, F32 (4 un)</td>
            <td style="padding: 4.5px 5px; border-bottom: 1px solid #e2e8f0;">🐔 Aves Congeladas (Coxas, Asas, Atacado)</td>
          </tr>
          <tr style="background: #e2e8f0; font-weight: 800;">
            <td style="padding: 5px;">TOTAL SEMANAL</td>
            <td style="padding: 5px;">16 Colunas / Racks</td>
            <td style="padding: 5px; text-align: center; color: #0284c7;">128</td>
            <td style="padding: 5px;">31 Freezers Auditados</td>
            <td style="padding: 5px; color: #047857;">✔ 100% de Cobertura Sem Repetição</td>
          </tr>
        </tbody>
      </table>

      <!-- INSTRUÇÕES OPERACIONAIS -->
      <div class="section-bar" style="margin-top: 6px;">
        <h2>📋 Procedimento Padrão de Auditoria — Instruções aos Auditores</h2>
        <span class="sub-badge">POP de Validade</span>
      </div>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 7.2pt; color: #334155;">
        <div style="border: 1px solid #cbd5e1; border-radius: 5px; padding: 6px 8px; background: #ffffff;">
          <strong style="color: #0284c7; display: block; margin-bottom: 2px;">1. Uso Diário da Folha de Verificação</strong>
          Cada dia da semana tem sua folha específica anexada a este caderno (páginas 2 a 8). O auditor deve destacar ou imprimir a folha do dia e preenchê-la à caneta no momento da auditoria.
        </div>
        <div style="border: 1px solid #cbd5e1; border-radius: 5px; padding: 6px 8px; background: #ffffff;">
          <strong style="color: #0284c7; display: block; margin-bottom: 2px;">2. Rigor Absoluto na Regra PVPS (FIFO)</strong>
          Primeiro que vence é o primeiro que sai. No piso de loja, os produtos com menor prazo SEMPRE devem ficar na frente/topo. Na câmara, o palete com validade mais curta deve ficar na posição de saída.
        </div>
        <div style="border: 1px solid #cbd5e1; border-radius: 5px; padding: 6px 8px; background: #ffffff;">
          <strong style="color: #0284c7; display: block; margin-bottom: 2px;">3. Sinalização & Ação Imediata (Zona Amarela)</strong>
          Itens com validade igual ou inferior a 10 dias devem ser obrigatoriamente anotados na folha do dia para acionamento imediato de degrau de preço (rebaixa comercial) ou reposição rápida.
        </div>
        <div style="border: 1px solid #cbd5e1; border-radius: 5px; padding: 6px 8px; background: #ffffff;">
          <strong style="color: #0284c7; display: block; margin-bottom: 2px;">4. Auditoria de Temperatura & Assinaturas</strong>
          Aferir a temperatura da câmara congelada (padrão -18,5°C) e de cada freezer do piso (-18°C a -22°C). Ao término da ronda, colher assinatura do Líder do Açougue e Fiscal de Prevenção.
        </div>
      </div>

      <!-- ASSINATURAS DO CADERNO -->
      <div class="signatures-bar" style="margin-top: 15px;">
        <div class="sig-item">
          <div class="sig-line"></div>
          <div class="sig-role">Auditor Responsável</div>
          <div class="sig-desc">Setor Açougue / Perecíveis</div>
        </div>
        <div class="sig-item">
          <div class="sig-line"></div>
          <div class="sig-role">Líder do Açougue</div>
          <div class="sig-desc">Felipe Gabriel — BRIGADA-IA</div>
        </div>
        <div class="sig-item">
          <div class="sig-line"></div>
          <div class="sig-role">Prevenção de Perdas / Gerência</div>
          <div class="sig-desc">Validação do Ciclo Semanal</div>
        </div>
      </div>

      <div class="footer-strip" style="margin-top: 8px;">
        <span>BRIGADA-IA • Sistema de Gestão de Validade & Auditoria</span>
        <span>Página 1 de 8 — Resumo Executivo Semanal</span>
        <span>Documento Oficial de Uso Obrigatório</span>
      </div>
    </div>
    """

def generate_daily_page_html(day_data, page_num=2, total_pages=8):
    """Gera o HTML de 1 página A4 dedicada para um dia específico da semana."""
    day_key = day_data["dayKey"]
    day_name = day_data["dayName"].upper()
    badge_bg = day_data["badgeBg"]
    badge_color = day_data["badgeColor"]
    columns = day_data["columns"]
    pallets = day_data["palletsCount"]
    freezer_details = day_data["freezerDetails"]

    # Monta os cards das colunas da câmara
    col_grid_cols = len(columns)
    col_cards_html = ""
    for col_num in columns:
        col_str = f"Coluna {col_num:02d}"
        col_cards_html += f"""
        <div class="col-card">
          <div class="col-card-header">
            <span>❄️ {col_str} (Rack {col_num:02d})</span>
            <span style="background: rgba(255,255,255,0.2); padding: 0 4px; border-radius: 3px; font-size: 6.2pt;">8 Paletes</span>
          </div>
          <table class="compact-table">
            <thead>
              <tr>
                <th style="width: 18%;">Pos.</th>
                <th style="width: 48%;">Cód / Produto / Lote</th>
                <th style="width: 22%;">Validade</th>
                <th style="width: 12%; text-align: center;">OK</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>N4-E</strong> <span style="font-size: 5.5pt; color:#64748b;">(Topo)</span></td>
                <td>___________________</td>
                <td>___/___/___</td>
                <td style="text-align: center;"><span class="checkbox-square"></span></td>
              </tr>
              <tr>
                <td><strong>N4-D</strong> <span style="font-size: 5.5pt; color:#64748b;">(Topo)</span></td>
                <td>___________________</td>
                <td>___/___/___</td>
                <td style="text-align: center;"><span class="checkbox-square"></span></td>
              </tr>
              <tr>
                <td><strong>N3-E</strong> <span style="font-size: 5.5pt; color:#64748b;">(Alto)</span></td>
                <td>___________________</td>
                <td>___/___/___</td>
                <td style="text-align: center;"><span class="checkbox-square"></span></td>
              </tr>
              <tr>
                <td><strong>N3-D</strong> <span style="font-size: 5.5pt; color:#64748b;">(Alto)</span></td>
                <td>___________________</td>
                <td>___/___/___</td>
                <td style="text-align: center;"><span class="checkbox-square"></span></td>
              </tr>
              <tr>
                <td><strong>N2-E</strong> <span style="font-size: 5.5pt; color:#64748b;">(Méd)</span></td>
                <td>___________________</td>
                <td>___/___/___</td>
                <td style="text-align: center;"><span class="checkbox-square"></span></td>
              </tr>
              <tr>
                <td><strong>N2-D</strong> <span style="font-size: 5.5pt; color:#64748b;">(Méd)</span></td>
                <td>___________________</td>
                <td>___/___/___</td>
                <td style="text-align: center;"><span class="checkbox-square"></span></td>
              </tr>
              <tr>
                <td><strong>N1-E</strong> <span style="font-size: 5.5pt; color:#64748b;">(Chão)</span></td>
                <td>___________________</td>
                <td>___/___/___</td>
                <td style="text-align: center;"><span class="checkbox-square"></span></td>
              </tr>
              <tr>
                <td><strong>N1-D</strong> <span style="font-size: 5.5pt; color:#64748b;">(Chão)</span></td>
                <td>___________________</td>
                <td>___/___/___</td>
                <td style="text-align: center;"><span class="checkbox-square"></span></td>
              </tr>
            </tbody>
          </table>
        </div>
        """

    # Monta a tabela do Piso de Loja
    piso_rows_html = ""
    for fz in freezer_details:
        piso_rows_html += f"""
        <tr>
          <td><span class="fz-badge">{fz["id"]}</span></td>
          <td><strong>{fz["desc"]}</strong></td>
          <td style="text-align: center; color: #475569;">[ _____ °C ]</td>
          <td style="text-align: center;"><span class="checkbox-square"></span> Sim &nbsp; <span class="checkbox-square"></span> Ajustado</td>
          <td style="text-align: center;"><span class="checkbox-square"></span> OK</td>
          <td style="text-align: center; color: #475569;">___/___/___</td>
          <td style="text-align: center; color: #475569;">[ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ]</td>
        </tr>
        """

    # Linhas de anomalia / produtos com validade curta
    anomaly_rows_html = """
      <tr><td></td><td></td><td></td><td></td><td></td><td></td><td>[ ] Degrau &nbsp; [ ] Troca &nbsp; [ ] Quebra</td><td></td></tr>
      <tr><td></td><td></td><td></td><td></td><td></td><td></td><td>[ ] Degrau &nbsp; [ ] Troca &nbsp; [ ] Quebra</td><td></td></tr>
      <tr><td></td><td></td><td></td><td></td><td></td><td></td><td>[ ] Degrau &nbsp; [ ] Troca &nbsp; [ ] Quebra</td><td></td></tr>
    """

    cols_desc = ", ".join([f"Coluna {c:02d}" for c in columns])
    freezers_desc = ", ".join([f["id"] for f in freezer_details])

    return f"""
    <!-- PÁGINA: FOLHA DE AUDITORIA DIÁRIA — {day_name} -->
    <div class="page">
      <!-- HEADER -->
      <div class="doc-header">
        <div class="logo-block">
          <div class="logo-badge">🛡️</div>
          <div class="title-group">
            <h1>BRIGADA-IA — Folha de Auditoria Diária</h1>
            <div class="subtitle">Setor: <strong>AÇOUGUE & PERECÍVEIS</strong> • Controle Rigoroso de Validade & Giro PVPS</div>
          </div>
        </div>
        <div class="meta-right">
          <span class="day-pill" style="background: {badge_bg}; color: {badge_color};">🗓️ {day_name}</span><br>
          <span style="font-size: 6.5pt; color: #64748b;">Protocolo Operacional • Ciclo Único Semanal</span>
        </div>
      </div>

      <!-- BARRA DE PREENCHIMENTO DO AUDITOR -->
      <div class="audit-meta-bar">
        <div class="audit-field">
          <strong>Data:</strong> <span class="fill-line" style="min-width: 75px;">___/___/______</span>
        </div>
        <div class="audit-field">
          <strong>Turno:</strong> <span class="checkbox-square"></span> 1º &nbsp; <span class="checkbox-square"></span> 2º
        </div>
        <div class="audit-field">
          <strong>Auditor:</strong> <span class="fill-line" style="min-width: 110px;"></span>
        </div>
        <div class="audit-field">
          <strong>Horário:</strong> <span class="fill-line" style="min-width: 45px;">___:___</span> às <span class="fill-line" style="min-width: 45px;">___:___</span>
        </div>
        <div class="audit-field">
          <strong>Temp. Câmara:</strong> <span class="fill-line" style="min-width: 45px;">____°C</span>
        </div>
      </div>

      <!-- SEÇÃO 1: CÂMARA CONGELADA (-18,5°C) -->
      <div class="section-bar" style="border-left-color: #6366f1;">
        <h2>❄️ 1. Câmara Congelada (-18,5°C) — Escala do Dia: {cols_desc}</h2>
        <span class="sub-badge" style="background: #e0e7ff; color: #4338ca;">{pallets} Posições de Paletes ({len(columns)} Colunas)</span>
      </div>

      <div class="col-grid" style="grid-template-columns: repeat({col_grid_cols}, 1fr);">
        {col_cards_html}
      </div>

      <!-- SEÇÃO 2: PISO DE LOJA (-18°C a -22°C) -->
      <div class="section-bar" style="border-left-color: #0284c7;">
        <h2>🛒 2. Piso de Loja — Freezers do Dia: {freezers_desc}</h2>
        <span class="sub-badge" style="background: #e0f2fe; color: #0284c7;">{len(freezer_details)} Equipamentos • {day_data['freezersCategory']}</span>
      </div>

      <table class="piso-table">
        <thead>
          <tr>
            <th style="width: 8%;">Freezer</th>
            <th style="width: 32%;">Categoria / Cortes em Exposição</th>
            <th style="width: 13%; text-align: center;">Temp. (°C)</th>
            <th style="width: 17%; text-align: center;">Giro PVPS</th>
            <th style="width: 10%; text-align: center;">Etiquetas</th>
            <th style="width: 10%; text-align: center;">Val. + Curta</th>
            <th style="width: 10%; text-align: center;">Visto</th>
          </tr>
        </thead>
        <tbody>
          {piso_rows_html}
        </tbody>
      </table>

      <!-- SEÇÃO 3: ANOMALIAS E PRODUTOS EM RISCO -->
      <div class="section-bar" style="border-left-color: #f59e0b;">
        <h2>⚠️ 3. Apontamento de Produtos Críticos / Validade Curta (&le; 10 Dias) / Avarias</h2>
        <span class="sub-badge" style="background: #fef3c7; color: #b45309;">Ação Preventiva Imediata</span>
      </div>

      <table class="anomaly-table">
        <thead>
          <tr style="background: #f8fafc;">
            <th style="width: 10%;">PLU / Cód</th>
            <th style="width: 28%;">Descrição do Produto</th>
            <th style="width: 10%;">Freezer/Col</th>
            <th style="width: 10%;">Lote</th>
            <th style="width: 10%;">Val. Física</th>
            <th style="width: 7%;">Qtd (kg)</th>
            <th style="width: 18%;">Ação Tomada</th>
            <th style="width: 7%; text-align: center;">Visto</th>
          </tr>
        </thead>
        <tbody>
          {anomaly_rows_html}
        </tbody>
      </table>

      <!-- SEÇÃO 4: REGRAS POP RÁPIDAS -->
      <div class="pop-strip">
        <div><strong>1. PVPS Obrigatório</strong> Primeiro que vence é o primeiro que sai. Menor validade sempre à frente no freezer.</div>
        <div><strong>2. Alerta de Vencimento</strong> Produtos com &le;10 dias devem receber degrau de preço ou transferência imediata.</div>
        <div><strong>3. Cadeia de Frio</strong> Temperatura da câmara &le; -18,5°C e freezers entre -18°C e -22°C. Não tapar fluxo de ar.</div>
        <div><strong>4. Validação & Registro</strong> Todos os itens identificados devem ser atualizados imediatamente no BRIGADA-IA.</div>
      </div>

      <!-- ASSINATURAS E RESPONSABILIDADES -->
      <div class="signatures-bar">
        <div class="sig-item">
          <div class="sig-line"></div>
          <div class="sig-role">Auditor Responsável</div>
          <div class="sig-desc">Setor Açougue / Perecíveis</div>
        </div>
        <div class="sig-item">
          <div class="sig-line"></div>
          <div class="sig-role">Líder do Açougue</div>
          <div class="sig-desc">Felipe Gabriel — BRIGADA-IA</div>
        </div>
        <div class="sig-item">
          <div class="sig-line"></div>
          <div class="sig-role">Prevenção de Perdas / Gerência</div>
          <div class="sig-desc">Auditoria Diária Concluída</div>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="footer-strip">
        <span>BRIGADA-IA • Folha Diária de Verificação ({day_name})</span>
        <span>Página {page_num} de {total_pages}</span>
        <span>Auditoria Operacional de Validade • Açougue</span>
      </div>
    </div>
    """

def generate_full_caderno_html():
    """Monta o documento completo com Capa (Resumo) + 7 Folhas Diárias (1 para cada dia)."""
    pages_html = [generate_cover_page_html()]
    for idx, day_data in enumerate(DAYS_DATA):
        page_num = idx + 2
        pages_html.append(generate_daily_page_html(day_data, page_num=page_num, total_pages=8))

    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Caderno de Verificação de Validade — BRIGADA-IA</title>
<style>
{CSS_STYLES}
</style>
</head>
<body>
{"".join(pages_html)}
</body>
</html>
"""

def generate_single_day_html(day_data):
    """Monta o HTML de folha única (1 página) para um dia avulso."""
    page_html = generate_daily_page_html(day_data, page_num=1, total_pages=1)
    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Folha de Verificação — {day_data['dayName']} — BRIGADA-IA</title>
<style>
{CSS_STYLES}
</style>
</head>
<body>
{page_html}
</body>
</html>
"""

def generate_freezer_sheet_html():
    """Monta a Folha Operacional A4 de Auditoria de Freezer Individual (com espaço em branco para o número do freezer)."""
    rows_html = ""
    for i in range(1, 21):
        bg = "#ffffff" if i % 2 != 0 else "#f8fafc"
        rows_html += f"""
        <tr style="background: {bg}; height: 21px;">
          <td style="text-align: center; font-weight: 700; color: #64748b;">{i:02d}</td>
          <td style="border-bottom: 1px solid #e2e8f0;"></td>
          <td style="border-bottom: 1px solid #e2e8f0; text-align: center;"></td>
          <td style="border-bottom: 1px solid #e2e8f0; text-align: center;"></td>
          <td style="border-bottom: 1px solid #e2e8f0; text-align: center;"></td>
          <td style="border-bottom: 1px solid #e2e8f0; text-align: center;"></td>
          <td style="border-bottom: 1px solid #e2e8f0; text-align: center;"></td>
          <td style="border-bottom: 1px solid #e2e8f0; font-size: 6.2pt; color: #475569;">[ ] OK &nbsp; [ ] Reb &nbsp; [ ] Queb</td>
        </tr>
        """

    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Folha de Auditoria de Freezer — BRIGADA-IA</title>
<style>
{CSS_STYLES}
</style>
</head>
<body>
  <div class="page" style="justify-content: flex-start; gap: 6px;">
    <!-- HEADER -->
    <div class="doc-header">
      <div class="logo-block">
        <div class="logo-badge" style="background: linear-gradient(135deg, #0ea5e9, #0284c7);">🧊</div>
        <div class="title-group">
          <h1>BRIGADA-IA — Folha de Auditoria de Freezer</h1>
          <div class="subtitle">Setor: <strong>AÇOUGUE & PERECÍVEIS</strong> • Controle Individual de Equipamento (Piso de Loja)</div>
        </div>
      </div>
      <div class="meta-right">
        <span class="day-pill" style="background: #e0f2fe; color: #0284c7;">AUDITORIA DE EQUIPAMENTO</span><br>
        <span style="font-size: 6.5pt; color: #64748b;">Giro PVPS • Validade • Zero Vencidos</span>
      </div>
    </div>

    <!-- CAIXA DE IDENTIFICAÇÃO DO FREEZER COM ESPAÇO EM BRANCO -->
    <div style="background: #f8fafc; border: 1.5px solid #0284c7; border-radius: 6px; padding: 6px 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 1.6rem;">🛒</span>
        <div>
          <span style="font-size: 7pt; font-weight: 700; color: #475569; text-transform: uppercase;">Identificação do Equipamento:</span>
          <div style="font-size: 13pt; font-weight: 800; color: #0f172a; display: flex; align-items: baseline; gap: 6px;">
            FREEZER Nº: <span style="display: inline-block; border-bottom: 2px solid #0284c7; min-width: 140px; height: 22px; text-align: center; color: #0284c7;">&nbsp;</span>
          </div>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(3, auto); gap: 10px; font-size: 7.2pt;">
        <div><strong>Data:</strong> <span class="fill-line" style="min-width: 65px;">___/___/______</span></div>
        <div><strong>Turno:</strong> <span class="checkbox-square"></span> 1º &nbsp; <span class="checkbox-square"></span> 2º</div>
        <div><strong>Auditor:</strong> <span class="fill-line" style="min-width: 90px;"></span></div>
        <div><strong>Horário:</strong> ___:___ às ___:___</div>
        <div><strong>Temp. Aferida:</strong> <span class="fill-line" style="min-width: 45px;">____°C</span></div>
        <div><strong>Meta:</strong> -18°C a -22°C <span class="checkbox-square"></span> OK</div>
      </div>
    </div>

    <!-- TABELA PRINCIPAL SOLICITADA -->
    <div class="section-bar" style="border-left-color: #0ea5e9; margin-top: 2px;">
      <h2>📋 Itens em Exposição no Freezer</h2>
      <span class="sub-badge" style="background: #e0f2fe; color: #0369a1;">Conferência de Estoque Físico & Datas</span>
    </div>

    <table style="width: 100%; border-collapse: collapse; font-size: 7pt; border: 1px solid #cbd5e1; margin-bottom: 4px;">
      <thead>
        <tr style="background: #0f172a; color: white;">
          <th style="padding: 4px; width: 4%; text-align: center;">Item</th>
          <th style="padding: 4px; width: 34%; text-align: left;">Nome do Produto</th>
          <th style="padding: 4px; width: 11%; text-align: center;">PLU / Cód</th>
          <th style="padding: 4px; width: 9%; text-align: center;">Lote</th>
          <th style="padding: 4px; width: 11%; text-align: center;">Data Validade</th>
          <th style="padding: 4px; width: 10%; text-align: center; background: #0284c7;">Total Itens</th>
          <th style="padding: 4px; width: 11%; text-align: center; background: #ea580c;">Qtd Próx. Vencer</th>
          <th style="padding: 4px; width: 10%; text-align: left;">Ação Imediata</th>
        </tr>
      </thead>
      <tbody>
        {rows_html}
      </tbody>
    </table>

    <!-- TOTAIS CONSOLIDADOS E CHECKLIST DO FREEZER -->
    <div style="display: grid; grid-template-columns: 1.4fr 1.6fr; gap: 8px; margin-top: 2px;">
      <!-- Totais -->
      <div style="border: 1px solid #cbd5e1; border-radius: 5px; padding: 5px 8px; background: #ffffff;">
        <div style="font-size: 7.2pt; font-weight: 700; color: #0f172a; margin-bottom: 4px; text-transform: uppercase;">
          📊 Resumo Quantitativo do Freezer
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 6.8pt;">
          <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 4px; padding: 4px; text-align: center;">
            <div style="font-size: 6.2pt; color: #0369a1; font-weight: 700; text-transform: uppercase;">Total de Itens Contados</div>
            <div style="font-size: 11pt; font-weight: 800; color: #0284c7; height: 16px;">&nbsp;</div>
          </div>
          <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 4px; padding: 4px; text-align: center;">
            <div style="font-size: 6.2pt; color: #c2410c; font-weight: 700; text-transform: uppercase;">Qtd Próxima de Vencer</div>
            <div style="font-size: 11pt; font-weight: 800; color: #ea580c; height: 16px;">&nbsp;</div>
          </div>
        </div>
      </div>

      <!-- Checklist de Boas Práticas -->
      <div style="border: 1px solid #cbd5e1; border-radius: 5px; padding: 5px 8px; background: #ffffff;">
        <div style="font-size: 7.2pt; font-weight: 700; color: #0f172a; margin-bottom: 3px; text-transform: uppercase;">
          ✅ Checklist Operacional do Equipamento
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3px 6px; font-size: 6.5pt; color: #334155;">
          <div><span class="checkbox-square"></span> Regra PVPS aplicada (frente/topo)</div>
          <div><span class="checkbox-square"></span> Sem produtos vencidos</div>
          <div><span class="checkbox-square"></span> Etiquetas e preços legíveis</div>
          <div><span class="checkbox-square"></span> Paredes limpas / sem gelo excessivo</div>
        </div>
      </div>
    </div>

    <!-- ASSINATURAS -->
    <div class="signatures-bar" style="margin-top: 4px;">
      <div class="sig-item">
        <div class="sig-line"></div>
        <div class="sig-role">Auditor Responsável</div>
        <div class="sig-desc">Conferência Física do Freezer</div>
      </div>
      <div class="sig-item">
        <div class="sig-line"></div>
        <div class="sig-role">Líder do Açougue</div>
        <div class="sig-desc">Felipe Gabriel — BRIGADA-IA</div>
      </div>
      <div class="sig-item">
        <div class="sig-line"></div>
        <div class="sig-role">Prevenção de Perdas / Gerência</div>
        <div class="sig-desc">Validação e Visto Operacional</div>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="footer-strip">
      <span>BRIGADA-IA • Folha de Auditoria Individual de Freezer</span>
      <span>Documento Operacional de Uso Diário</span>
      <span>Açougue & Perecíveis</span>
    </div>
  </div>
</body>
</html>
"""

def compile_pdf_with_edge(html_file, output_pdf):
    """Invoca o Microsoft Edge headless para compilar o HTML em PDF com fidelidade máxima."""
    edge_bin = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    if not os.path.exists(edge_bin):
        edge_bin = r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"
    if not os.path.exists(edge_bin):
        raise FileNotFoundError(f"Executável do Edge não encontrado em: {edge_bin}")

    cmd = [
        edge_bin,
        "--headless",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={output_pdf}",
        "file:///" + os.path.abspath(html_file).replace("\\", "/")
    ]
    subprocess.run(cmd, check=True)

def generate_all_pdfs():
    workspace_dir = os.path.abspath(os.path.dirname(__file__))
    static_dir = os.path.join(workspace_dir, "app", "static")
    os.makedirs(static_dir, exist_ok=True)

    print("=" * 70)
    print("BRIGADA-IA: Gerando Caderno Semanal, Folhas Diárias e Folha de Freezer...")
    print("=" * 70)

    # 1. Gerar Caderno Semanal Completo (8 Páginas: Capa + 7 Folhas)
    full_html_path = os.path.join(workspace_dir, "esquema_verificacao.html")
    full_pdf_root = os.path.join(workspace_dir, "Esquema_Verificacao_Validade_BRIGADA_IA.pdf")
    full_pdf_static = os.path.join(static_dir, "Esquema_Verificacao_Validade_BRIGADA_IA.pdf")

    with open(full_html_path, "w", encoding="utf-8") as f:
        f.write(generate_full_caderno_html())

    print("\n[1/9] Compilando Caderno Semanal Completo (8 páginas)...")
    compile_pdf_with_edge(full_html_path, full_pdf_root)
    shutil.copyfile(full_pdf_root, full_pdf_static)
    size_kb = os.path.getsize(full_pdf_root) / 1024
    print(f" -> Gerado: Esquema_Verificacao_Validade_BRIGADA_IA.pdf ({size_kb:.1f} KB)")

    # 2. Gerar cada Folha Diária Individual (1 página por dia da semana)
    for idx, day_data in enumerate(DAYS_DATA):
        day_key = day_data["dayKey"]
        day_name = day_data["dayName"]
        single_html_name = f"folha_verificacao_{day_key}.html"
        single_pdf_name = f"Folha_Verificacao_{day_key}.pdf"

        single_html_path = os.path.join(workspace_dir, single_html_name)
        single_pdf_root = os.path.join(workspace_dir, single_pdf_name)
        single_pdf_static = os.path.join(static_dir, single_pdf_name)

        with open(single_html_path, "w", encoding="utf-8") as f:
            f.write(generate_single_day_html(day_data))

        print(f"[{idx+2}/9] Compilando Folha Individual de {day_name} (1 página)...")
        compile_pdf_with_edge(single_html_path, single_pdf_root)
        shutil.copyfile(single_pdf_root, single_pdf_static)
        day_size_kb = os.path.getsize(single_pdf_root) / 1024
        print(f" -> Gerado: {single_pdf_name} ({day_size_kb:.1f} KB)")

    # 3. Gerar Folha Individual de Freezer em Branco
    freezer_html_path = os.path.join(workspace_dir, "folha_auditoria_freezer.html")
    freezer_pdf_root = os.path.join(workspace_dir, "Folha_Auditoria_Freezer.pdf")
    freezer_pdf_static = os.path.join(static_dir, "Folha_Auditoria_Freezer.pdf")

    with open(freezer_html_path, "w", encoding="utf-8") as f:
        f.write(generate_freezer_sheet_html())

    print("\n[9/9] Compilando Folha de Auditoria de Freezer Individual (1 página)...")
    compile_pdf_with_edge(freezer_html_path, freezer_pdf_root)
    shutil.copyfile(freezer_pdf_root, freezer_pdf_static)
    fz_size_kb = os.path.getsize(freezer_pdf_root) / 1024
    print(f" -> Gerado: Folha_Auditoria_Freezer.pdf ({fz_size_kb:.1f} KB)")

    print("\n" + "=" * 70)
    print("CONCLUÍDO COM SUCESSO!")
    print(f"Caderno Semanal: {full_pdf_static}")
    print(f"Folha para Freezer: {freezer_pdf_static}")
    print(f"Total de Folhas Salvas em: {static_dir}")
    print("=" * 70)

if __name__ == "__main__":
    generate_all_pdfs()

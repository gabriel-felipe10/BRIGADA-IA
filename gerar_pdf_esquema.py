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
    """Gera a Folha Única de Cronograma Semanal de Auditoria dos Freezers (Piso de Loja), preenchendo toda a folha A4."""
    return f"""
    <!-- PÁGINA 1: CRONOGRAMA OPERACIONAL SEMANAL DOS FREEZERS (FOLHA CHEIA) -->
    <div class="page" style="justify-content: space-between; min-height: 280mm; max-height: 283mm; padding: 2mm 0;">
      <!-- CABEÇALHO -->
      <div class="doc-header" style="border-bottom: 3px solid #0284c7; padding-bottom: 10px; margin-bottom: 2px;">
        <div class="logo-block" style="gap: 12px;">
          <div class="logo-badge" style="width: 44px; height: 44px; font-size: 18pt; border-radius: 8px;">🛡️</div>
          <div class="title-group">
            <h1 style="font-size: 15.5pt; letter-spacing: -0.3px;">BRIGADA-IA — Gestão & Auditoria de Validade</h1>
            <div class="subtitle" style="font-size: 8.8pt; margin-top: 2px;">Setor: <strong>AÇOUGUE & PERECÍVEIS</strong> • Cronograma Semanal Oficial dos Freezers (Piso de Loja)</div>
          </div>
        </div>
        <div class="meta-right" style="font-size: 7.8pt; line-height: 1.4;">
          <span style="background: #0284c7; color: white; padding: 4px 10px; border-radius: 4px; font-weight: 800; font-size: 8.5pt; display: inline-block; margin-bottom: 3px;">CRONOGRAMA SEMANAL</span><br>
          <strong>Ciclo Operacional:</strong> Domingo a Sábado<br>
          <span style="color: #64748b;">Emissão: 21/09/2026 • Versão Oficial 2.0</span>
        </div>
      </div>

      <!-- DIRETRIZ OPERACIONAL -->
      <div style="background: #f0f9ff; border: 1.5px solid #bae6fd; border-radius: 8px; padding: 10px 14px; font-size: 8.2pt; color: #0369a1; line-height: 1.45;">
        🎯 <strong>DIRETRIZ OPERACIONAL SEMANAL:</strong> Este documento estabelece o cronograma oficial de auditoria preventiva de validade do Açougue. Os auditores devem conferir diariamente 100% dos equipamentos escalados para o piso de loja, utilizando a <strong>Folha de Auditoria de Freezer</strong> para o registro físico detalhado de validades, lotes e aplicação rigorosa do giro PVPS.
      </div>

      <!-- CARDS DE DESTAQUE -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
        <div style="background: #ffffff; border: 2px solid #0284c7; border-radius: 8px; padding: 12px 8px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <div style="font-size: 26pt; font-weight: 800; color: #0284c7; line-height: 1;">31</div>
          <div style="font-size: 7.8pt; font-weight: 700; color: #475569; text-transform: uppercase; margin-top: 4px;">Freezers Piso de Loja</div>
        </div>
        <div style="background: #ffffff; border: 2px solid #10b981; border-radius: 8px; padding: 12px 8px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <div style="font-size: 26pt; font-weight: 800; color: #10b981; line-height: 1;">100%</div>
          <div style="font-size: 7.8pt; font-weight: 700; color: #475569; text-transform: uppercase; margin-top: 4px;">Cobertura Semanal Sem Repetição</div>
        </div>
        <div style="background: #ffffff; border: 2px solid #f59e0b; border-radius: 8px; padding: 12px 8px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <div style="font-size: 26pt; font-weight: 800; color: #f59e0b; line-height: 1;">7 Dias</div>
          <div style="font-size: 7.8pt; font-weight: 700; color: #475569; text-transform: uppercase; margin-top: 4px;">Ciclo Completo (Domingo a Sábado)</div>
        </div>
      </div>

      <!-- TABELA CRONOGRAMA UNIFICADO -->
      <div>
        <div class="section-bar" style="margin-bottom: 5px; padding: 5px 8px;">
          <h2 style="font-size: 9pt;">🗓️ Cronograma Semanal de Auditoria — Freezers do Piso de Loja</h2>
          <span class="sub-badge" style="font-size: 7.5pt; padding: 2px 8px;">Ciclo Único sem Repetição • 31 Equipamentos</span>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 8.2pt; border: 1.5px solid #94a3b8;">
          <thead>
            <tr style="background: #0f172a; color: white;">
              <th style="padding: 8px 10px; text-align: left; width: 17%; border: 1px solid #334155; font-weight: 700;">Dia da Semana</th>
              <th style="padding: 8px 10px; text-align: left; width: 33%; border: 1px solid #334155; font-weight: 700;">Piso de Loja (Freezers)</th>
              <th style="padding: 8px 10px; text-align: left; width: 36%; border: 1px solid #334155; font-weight: 700;">Categorias / Cortes em Exposição</th>
              <th style="padding: 8px 10px; text-align: center; width: 14%; border: 1px solid #334155; font-weight: 700;">Meta Temp.</th>
            </tr>
          </thead>
          <tbody>
            <tr style="height: 30px;">
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1;"><strong style="color: #0284c7; font-size: 8.5pt;">DOMINGO</strong></td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b;">F42, F43, F44, F45, F46 <span style="color: #64748b; font-weight: 500;">(5 un)</span></td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; color: #334155;">🐟 Pescados (Filés, Postas, Frutos do Mar)</td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: 700; color: #0284c7;">-18°C a -22°C</td>
            </tr>
            <tr style="background: #f8fafc; height: 30px;">
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1;"><strong style="color: #7e22ce; font-size: 8.5pt;">SEGUNDA-FEIRA</strong></td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b;">F47, F48, F34, F35 <span style="color: #64748b; font-weight: 500;">(4 un)</span></td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; color: #334155;">🐟 Pescados (47,48) + 🐷 Suínos (34,35)</td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: 700; color: #0284c7;">-18°C a -22°C</td>
            </tr>
            <tr style="height: 30px;">
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1;"><strong style="color: #c2410c; font-size: 8.5pt;">TERÇA-FEIRA</strong></td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b;">F36, F37, F38, F39, F40 <span style="color: #64748b; font-weight: 500;">(5 un)</span></td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; color: #334155;">🍱 Misto Bov/Suíno/Aves (36–39) + 🐮 Bovino (40)</td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: 700; color: #0284c7;">-18°C a -22°C</td>
            </tr>
            <tr style="background: #f8fafc; height: 30px;">
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1;"><strong style="color: #b45309; font-size: 8.5pt;">QUARTA-FEIRA</strong></td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b;">F41, F17, F18, F19 <span style="color: #64748b; font-weight: 500;">(4 un)</span></td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; color: #334155;">🐮 Bovino (41) + 🐔 Aves (17, 18, 19)</td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: 700; color: #0284c7;">-18°C a -22°C</td>
            </tr>
            <tr style="height: 30px;">
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1;"><strong style="color: #047857; font-size: 8.5pt;">QUINTA-FEIRA</strong></td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b;">F20, F21, F22, F23, F24 <span style="color: #64748b; font-weight: 500;">(5 un)</span></td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; color: #334155;">🐔 Aves (Cortes Nobres, Peito, Passarinho)</td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: 700; color: #0284c7;">-18°C a -22°C</td>
            </tr>
            <tr style="background: #f8fafc; height: 30px;">
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1;"><strong style="color: #be185d; font-size: 8.5pt;">SEXTA-FEIRA</strong></td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b;">F25, F26, F27, F28 <span style="color: #64748b; font-weight: 500;">(4 un)</span></td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; color: #334155;">🐔 Aves (25) + 🐮 Bovino Congelado (26–28)</td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: 700; color: #0284c7;">-18°C a -22°C</td>
            </tr>
            <tr style="height: 30px;">
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1;"><strong style="color: #4338ca; font-size: 8.5pt;">SÁBADO</strong></td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; font-weight: 700; color: #1e293b;">F29, F30, F31, F32 <span style="color: #64748b; font-weight: 500;">(4 un)</span></td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; color: #334155;">🐔 Aves Congeladas (Coxas, Asas, Atacado)</td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: 700; color: #0284c7;">-18°C a -22°C</td>
            </tr>
            <tr style="background: #e2e8f0; font-weight: 800; height: 32px;">
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; font-size: 8.5pt;">TOTAL SEMANAL</td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; color: #0284c7; font-size: 9pt;">31 Freezers Auditados</td>
              <td style="padding: 8px 10px; border: 1px solid #cbd5e1; color: #047857; font-size: 8.8pt;" colspan="2">✔ 100% de Cobertura Semanal Sem Repetição</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- INSTRUÇÕES OPERACIONAIS POP -->
      <div>
        <div class="section-bar" style="margin-bottom: 5px; padding: 5px 8px;">
          <h2 style="font-size: 9pt;">📋 Procedimento Padrão de Auditoria — Instruções aos Auditores</h2>
          <span class="sub-badge" style="font-size: 7.5pt; padding: 2px 8px;">POP de Validade</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 7.8pt; color: #334155;">
          <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 9px 12px; background: #ffffff; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            <strong style="color: #0284c7; font-size: 8.2pt; display: block; margin-bottom: 3px;">1. Execução Diária da Auditoria</strong>
            Seguir rigorosamente a escala de freezers definida para cada dia da semana acima, utilizando a Folha de Auditoria de Freezer para conferência física detalhada e preenchimento à caneta.
          </div>
          <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 9px 12px; background: #ffffff; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            <strong style="color: #0284c7; font-size: 8.2pt; display: block; margin-bottom: 3px;">2. Rigor Absoluto na Regra PVPS (FIFO)</strong>
            Primeiro que vence é o primeiro que sai. No piso de loja, os produtos com menor prazo SEMPRE devem ficar na frente e no topo de cada freezer para garantir o giro de estoque.
          </div>
          <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 9px 12px; background: #ffffff; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            <strong style="color: #0284c7; font-size: 8.2pt; display: block; margin-bottom: 3px;">3. Sinalização & Ação Imediata (Zona Amarela)</strong>
            Itens com validade igual ou inferior a 10 dias devem ser obrigatoriamente sinalizados para acionamento de degrau de preço (rebaixa comercial imediata) ou reposição rápida.
          </div>
          <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 9px 12px; background: #ffffff; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            <strong style="color: #0284c7; font-size: 8.2pt; display: block; margin-bottom: 3px;">4. Auditoria de Temperatura & Assinaturas</strong>
            Aferir a temperatura de cada freezer do piso (meta: -18°C a -22°C). Ao término da ronda diária, colher visto do Líder do Açougue e Fiscal de Prevenção de Perdas.
          </div>
        </div>
      </div>

      <!-- ASSINATURAS DO CADERNO -->
      <div class="signatures-bar" style="margin-top: 6px; padding-top: 6px;">
        <div class="sig-item">
          <div class="sig-line" style="height: 32px; border-bottom: 1.5px solid #64748b; margin-bottom: 4px;"></div>
          <div class="sig-role" style="font-size: 7.8pt;">Auditor Responsável</div>
          <div class="sig-desc" style="font-size: 6.8pt;">Setor Açougue / Perecíveis</div>
        </div>
        <div class="sig-item">
          <div class="sig-line" style="height: 32px; border-bottom: 1.5px solid #64748b; margin-bottom: 4px;"></div>
          <div class="sig-role" style="font-size: 7.8pt;">Líder do Açougue</div>
          <div class="sig-desc" style="font-size: 6.8pt;">Visto / Validação Operacional</div>
        </div>
        <div class="sig-item">
          <div class="sig-line" style="height: 32px; border-bottom: 1.5px solid #64748b; margin-bottom: 4px;"></div>
          <div class="sig-role" style="font-size: 7.8pt;">Prevenção de Perdas / Gerência</div>
          <div class="sig-desc" style="font-size: 6.8pt;">Validação do Ciclo Semanal</div>
        </div>
      </div>

      <!-- RODAPÉ -->
      <div class="footer-strip" style="margin-top: 4px; padding-top: 4px; font-size: 6.8pt; border-top: 1px solid #e2e8f0;">
        <span>BRIGADA-IA • Sistema de Gestão de Validade & Auditoria</span>
        <span>Página 1 de 1 — Cronograma Operacional Semanal</span>
        <span>Açougue & Perecíveis • Documento Oficial</span>
      </div>
    </div>
    """

def generate_full_caderno_html():
    """Monta o documento com Folha Única (1 página): Cronograma Semanal de Auditoria dos Freezers."""
    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Cronograma Semanal de Auditoria dos Freezers — BRIGADA-IA</title>
<style>
{CSS_STYLES}
</style>
</head>
<body>
{generate_cover_page_html()}
</body>
</html>
"""


def generate_freezer_sheet_html():
    """Monta a Folha Operacional A4 de Auditoria de Freezer Individual (com espaço em branco para o número do freezer)."""
    rows_html = ""
    for i in range(1, 31):
        bg = "#ffffff" if i % 2 != 0 else "#f8fafc"
        rows_html += f"""
        <tr style="background: {bg}; height: 16.5px;">
          <td style="border: 1px solid #cbd5e1; text-align: center; font-weight: 700; color: #64748b; padding: 1.5px 2px;">{i:02d}</td>
          <td style="border: 1px solid #cbd5e1; padding: 1.5px 6px;"></td>
          <td style="border: 1px solid #cbd5e1; text-align: center; padding: 1.5px 2px;"></td>
          <td style="border: 1px solid #cbd5e1; text-align: center; padding: 1.5px 2px;"></td>
          <td style="border: 1px solid #cbd5e1; text-align: center; padding: 1.5px 2px;"></td>
          <td style="border: 1px solid #cbd5e1; text-align: center; padding: 1.5px 2px;"></td>
          <td style="border: 1px solid #cbd5e1; text-align: center; padding: 1.5px 2px;"></td>
        </tr>"""

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
  <div class="page" style="justify-content: flex-start; gap: 4px;">
    <!-- HEADER -->
    <div class="doc-header" style="margin-bottom: 4px; padding-bottom: 4px;">
      <div class="logo-block">
        <div class="logo-badge" style="background: linear-gradient(135deg, #0ea5e9, #0284c7); width: 28px; height: 28px; font-size: 11pt;">🧊</div>
        <div class="title-group">
          <h1 style="font-size: 11pt;">BRIGADA-IA — Folha de Auditoria de Freezer</h1>
          <div class="subtitle" style="font-size: 6.8pt;">Setor: <strong>AÇOUGUE & PERECÍVEIS</strong> • Controle Individual de Equipamento (Piso de Loja)</div>
        </div>
      </div>
      <div class="meta-right">
        <span class="day-pill" style="background: #e0f2fe; color: #0284c7; padding: 2px 8px; font-size: 7.5pt;">AUDITORIA DE EQUIPAMENTO</span><br>
        <span style="font-size: 6.2pt; color: #64748b;">Giro PVPS • Validade • Zero Vencidos</span>
      </div>
    </div>

    <!-- CAIXA DE IDENTIFICAÇÃO DO FREEZER COM ESPAÇO EM BRANCO -->
    <div style="background: #f8fafc; border: 1.5px solid #0284c7; border-radius: 6px; padding: 4px 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 1.4rem;">🛒</span>
        <div>
          <span style="font-size: 6.8pt; font-weight: 700; color: #475569; text-transform: uppercase;">Identificação do Equipamento:</span>
          <div style="font-size: 12pt; font-weight: 800; color: #0f172a; display: flex; align-items: baseline; gap: 6px;">
            FREEZER Nº: <span style="display: inline-block; border-bottom: 2px solid #0284c7; min-width: 140px; height: 20px; text-align: center; color: #0284c7;">&nbsp;</span>
          </div>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(3, auto); gap: 4px 10px; font-size: 7pt;">
        <div><strong>Data:</strong> <span class="fill-line" style="min-width: 65px;">___/___/______</span></div>
        <div><strong>Turno:</strong> <span class="checkbox-square"></span> 1º &nbsp; <span class="checkbox-square"></span> 2º</div>
        <div><strong>Auditor:</strong> <span class="fill-line" style="min-width: 90px;"></span></div>
        <div><strong>Horário:</strong> ___:___ às ___:___</div>
        <div><strong>Temp. Aferida:</strong> <span class="fill-line" style="min-width: 45px;">____°C</span></div>
        <div><strong>Meta:</strong> -18°C a -22°C <span class="checkbox-square"></span> OK</div>
      </div>
    </div>

    <!-- TABELA PRINCIPAL SOLICITADA -->
    <div class="section-bar" style="border-left-color: #0ea5e9; margin-top: 2px; margin-bottom: 2px; padding: 2px 6px;">
      <h2 style="font-size: 7.8pt;">📋 Itens em Exposição no Freezer</h2>
      <span class="sub-badge" style="background: #e0f2fe; color: #0369a1; font-size: 6.5pt;">Conferência de Estoque Físico & Datas</span>
    </div>

    <table style="width: 100%; border-collapse: collapse; font-size: 6.8pt; border: 1.5px solid #94a3b8; margin-bottom: 3px;">
      <thead>
        <tr style="background: #0f172a; color: white;">
          <th style="padding: 3px 2px; width: 4.5%; text-align: center; border: 1px solid #334155; font-weight: 700;">Item</th>
          <th style="padding: 3px 6px; width: 45.5%; text-align: left; border: 1px solid #334155; font-weight: 700;">Nome do Produto</th>
          <th style="padding: 3px 2px; width: 12%; text-align: center; border: 1px solid #334155; font-weight: 700;">PLU / Cód</th>
          <th style="padding: 3px 2px; width: 10%; text-align: center; border: 1px solid #334155; font-weight: 700;">Lote</th>
          <th style="padding: 3px 2px; width: 12%; text-align: center; border: 1px solid #334155; font-weight: 700;">Data Validade</th>
          <th style="padding: 3px 2px; width: 8%; text-align: center; background: #0284c7; border: 1px solid #0369a1; font-weight: 700;">Total Itens</th>
          <th style="padding: 3px 2px; width: 8%; text-align: center; background: #ea580c; border: 1px solid #c2410c; font-weight: 700;">Qtd Próx. Vencer</th>
        </tr>
      </thead>
      <tbody>
        {rows_html}
      </tbody>
    </table>

    <!-- TOTAIS CONSOLIDADOS E CHECKLIST DO FREEZER -->
    <div style="display: grid; grid-template-columns: 1.4fr 1.6fr; gap: 8px; margin-top: 2px;">
      <!-- Totais -->
      <div style="border: 1px solid #cbd5e1; border-radius: 5px; padding: 4px 8px; background: #ffffff;">
        <div style="font-size: 7pt; font-weight: 700; color: #0f172a; margin-bottom: 3px; text-transform: uppercase;">
          📊 Resumo Quantitativo do Freezer
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 6.5pt;">
          <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 4px; padding: 3px; text-align: center;">
            <div style="font-size: 6pt; color: #0369a1; font-weight: 700; text-transform: uppercase;">Total de Itens Contados</div>
            <div style="font-size: 10pt; font-weight: 800; color: #0284c7; height: 14px;">&nbsp;</div>
          </div>
          <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 4px; padding: 3px; text-align: center;">
            <div style="font-size: 6pt; color: #c2410c; font-weight: 700; text-transform: uppercase;">Qtd Próxima de Vencer</div>
            <div style="font-size: 10pt; font-weight: 800; color: #ea580c; height: 14px;">&nbsp;</div>
          </div>
        </div>
      </div>

      <!-- Checklist de Boas Práticas -->
      <div style="border: 1px solid #cbd5e1; border-radius: 5px; padding: 4px 8px; background: #ffffff;">
        <div style="font-size: 7pt; font-weight: 700; color: #0f172a; margin-bottom: 3px; text-transform: uppercase;">
          ✅ Checklist Operacional do Equipamento
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2px 6px; font-size: 6.4pt; color: #334155;">
          <div><span class="checkbox-square"></span> Regra PVPS aplicada (frente/topo)</div>
          <div><span class="checkbox-square"></span> Sem produtos vencidos</div>
          <div><span class="checkbox-square"></span> Etiquetas e preços legíveis</div>
          <div><span class="checkbox-square"></span> Paredes limpas / sem gelo excessivo</div>
        </div>
      </div>
    </div>

    <!-- ASSINATURAS -->
    <div class="signatures-bar" style="margin-top: 2px; padding-top: 1px; margin-bottom: 2px;">
      <div class="sig-item">
        <div class="sig-line" style="height: 14px; margin-bottom: 2px;"></div>
        <div class="sig-role">Auditor Responsável</div>
        <div class="sig-desc">Conferência Física do Freezer</div>
      </div>
      <div class="sig-item">
        <div class="sig-line" style="height: 14px; margin-bottom: 2px;"></div>
        <div class="sig-role">Líder do Açougue</div>
        <div class="sig-desc">Visto / Validação Operacional</div>
      </div>
      <div class="sig-item">
        <div class="sig-line" style="height: 14px; margin-bottom: 2px;"></div>
        <div class="sig-role">Prevenção de Perdas / Gerência</div>
        <div class="sig-desc">Validação e Visto Operacional</div>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="footer-strip" style="margin-top: 1px;">
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

def generate_esquema_only():
    workspace_dir = os.path.abspath(os.path.dirname(__file__))
    static_dir = os.path.join(workspace_dir, "app", "static")
    os.makedirs(static_dir, exist_ok=True)

    full_html_path = os.path.join(workspace_dir, "esquema_verificacao.html")
    full_pdf_root = os.path.join(workspace_dir, "Esquema_Verificacao_Validade_BRIGADA_IA.pdf")
    full_pdf_static = os.path.join(static_dir, "Esquema_Verificacao_Validade_BRIGADA_IA.pdf")

    with open(full_html_path, "w", encoding="utf-8") as f:
        f.write(generate_full_caderno_html())

    print("Compilando Caderno Semanal de Freezers (8 páginas)...")
    compile_pdf_with_edge(full_html_path, full_pdf_root)
    shutil.copyfile(full_pdf_root, full_pdf_static)
    size_kb = os.path.getsize(full_pdf_root) / 1024
    print(f" -> Gerado: Esquema_Verificacao_Validade_BRIGADA_IA.pdf ({size_kb:.1f} KB)")

def generate_all_pdfs():
    workspace_dir = os.path.abspath(os.path.dirname(__file__))
    static_dir = os.path.join(workspace_dir, "app", "static")
    os.makedirs(static_dir, exist_ok=True)

    print("=" * 70)
    print("BRIGADA-IA: Gerando Cronograma Semanal (1 Página) e Folha de Freezer (1 Página)...")
    print("=" * 70)

    # 1. Cronograma Semanal dos Freezers (Folha Única - 1 Página)
    generate_esquema_only()

    # 2. Folha Individual de Freezer em Branco (30 Itens - 1 Página)
    generate_freezer_only()

    print("\n" + "=" * 70)
    print("CONCLUÍDO COM SUCESSO! Folhas geradas em 1 página cada.")
    print("=" * 70)

def generate_freezer_only():
    workspace_dir = os.path.abspath(os.path.dirname(__file__))
    static_dir = os.path.join(workspace_dir, "app", "static")
    os.makedirs(static_dir, exist_ok=True)

    freezer_html_path = os.path.join(workspace_dir, "folha_auditoria_freezer.html")
    freezer_pdf_root = os.path.join(workspace_dir, "Folha_Auditoria_Freezer.pdf")
    freezer_pdf_static = os.path.join(static_dir, "Folha_Auditoria_Freezer.pdf")

    with open(freezer_html_path, "w", encoding="utf-8") as f:
        f.write(generate_freezer_sheet_html())

    print("Compilando Folha de Auditoria de Freezer Individual (1 página)...")
    compile_pdf_with_edge(freezer_html_path, freezer_pdf_root)
    shutil.copyfile(freezer_pdf_root, freezer_pdf_static)
    fz_size_kb = os.path.getsize(freezer_pdf_root) / 1024
    print(f" -> Gerado: Folha_Auditoria_Freezer.pdf ({fz_size_kb:.1f} KB)")

if __name__ == "__main__":
    import sys
    if "--freezer" in sys.argv:
        generate_freezer_only()
    elif "--esquema" in sys.argv:
        generate_esquema_only()
    else:
        generate_all_pdfs()

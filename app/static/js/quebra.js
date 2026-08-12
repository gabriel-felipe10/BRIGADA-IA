/**
 * BRIGADA-IA — Quebra / Formulário de Avaria Module
 * Gestão de registro de avarias, perdas e descartes conforme modelo padronizado.
 */

window.BrigadaQuebra = {
  isLoading: false,
  canvasInstance: null,
  ctxInstance: null,
  hasSigned: false,
  currentSector: 'all',
  currentReason: 'all',
  currentDay: 'all',
  currentMonth: 'all',
  currentYear: 'all',
  searchQuery: '',

  // Definições Oficiais das Legendas (Formulário de Avaria)
  ORIGENS: [
    { id: 1, name: 'DEPÓSITO' },
    { id: 2, name: 'SALÃO DE VENDAS' },
    { id: 3, name: 'FRENTE DE CAIXA' },
    { id: 4, name: 'SAC' }
  ],

  OCORRENCIAS: [
    { id: 1, name: 'VIOLADO' },
    { id: 2, name: 'DEGUSTAÇÃO' },
    { id: 3, name: 'DETERIORAÇÃO NATURAL' },
    { id: 4, name: 'VENCIMENTO' },
    { id: 5, name: 'FURTO' },
    { id: 6, name: 'RASGADO' },
    { id: 7, name: 'SUJO' },
    { id: 8, name: 'FURADO' },
    { id: 9, name: 'DESCOLADO' },
    { id: 10, name: 'AMASSADO' },
    { id: 11, name: 'QUEBRADO' },
    { id: 12, name: 'SEM VÁCUO/GÁS' },
    { id: 13, name: 'FRAUDE' },
    { id: 14, name: 'DESCONGELADO' },
    { id: 15, name: 'SEM RÓTULO' },
    { id: 16, name: 'ENFERRUJADO' }
  ],

  MOTIVOS: [
    { id: 1, name: 'INTENCIONAL POR CLIENTE' },
    { id: 2, name: 'INTENCIONAL POR FUNCIONÁRIO' },
    { id: 3, name: 'ACIDENTE POR CLIENTE' },
    { id: 4, name: 'ACIDENTE POR FUNCIONÁRIO' },
    { id: 5, name: 'TRANSPORTE INADEQUADO' },
    { id: 6, name: 'ARMAZENAGEM INADEQUADA' },
    { id: 7, name: 'QUALIDADE DO PRODUTO' },
    { id: 8, name: 'FALHA NA EXPOSIÇÃO' },
    { id: 9, name: 'FALHA DE FÁBRICA' },
    { id: 10, name: 'AGENTES DA NATUREZA' },
    { id: 11, name: 'PVPS LOJA' },
    { id: 12, name: 'PVPS DEPÓSITO' },
    { id: 13, name: 'CÂMARA QUEBRADA' },
    { id: 14, name: 'DE OLHO NA VALIDADE' },
    { id: 15, name: 'REBAIXA NÃO REALIZADA' }
  ],

  async render(container) {
    if (window.BrigadaData.loadQuebras) {
      await window.BrigadaData.loadQuebras();
    }

    container.innerHTML = this.buildHTML();
    this.initCanvas();
    this.bindEvents(container);
    this.renderHistory(container);
  },

  buildHTML() {
    const todayStr = new Date().toISOString().split('T')[0];
    const user = window.BrigadaAuth.currentUser || {};
    const defaultRespName = user.name || 'Felipe Santos';

    // Opções de Mês
    const months = [
      { val: '01', name: 'Janeiro' },
      { val: '02', name: 'Fevereiro' },
      { val: '03', name: 'Março' },
      { val: '04', name: 'Abril' },
      { val: '05', name: 'Maio' },
      { val: '06', name: 'Junho' },
      { val: '07', name: 'Julho' },
      { val: '08', name: 'Agosto' },
      { val: '09', name: 'Setembro' },
      { val: '10', name: 'Outubro' },
      { val: '11', name: 'Novembro' },
      { val: '12', name: 'Dezembro' }
    ];
    let monthOptions = '<option value="all">Mês (Todos)</option>';
    months.forEach(m => {
      const selected = this.currentMonth === m.val ? 'selected' : '';
      monthOptions += `<option value="${m.val}" ${selected}>${m.name}</option>`;
    });

    const years = ['2025', '2026', '2027', '2028'];
    let yearOptions = '<option value="all">Ano (Todos)</option>';
    years.forEach(y => {
      const selected = this.currentYear === y ? 'selected' : '';
      yearOptions += `<option value="${y}" ${selected}>${y}</option>`;
    });

    // Datalist de Produtos do Sistema
    const allProducts = [...(window.BrigadaData.products || []), ...(window.BrigadaData.catalog || [])];
    const uniqueProductsMap = new Map();
    allProducts.forEach(p => {
      if (p.name && !uniqueProductsMap.has(p.name)) {
        uniqueProductsMap.set(p.name, p);
      }
    });

    let datalistOptions = '';
    uniqueProductsMap.forEach(p => {
      datalistOptions += `<option value="${p.name}">${p.plu ? `PLU: ${p.plu}` : ''}</option>`;
    });

    // Opções dos selects
    const origensOptions = this.ORIGENS.map(o => `<option value="${o.name}">${o.id}. ${o.name}</option>`).join('');
    const ocorrenciasOptions = this.OCORRENCIAS.map(o => `<option value="${o.name}">${o.id}. ${o.name}</option>`).join('');
    const motivosOptions = this.MOTIVOS.map(m => `<option value="${m.name}">${m.id}. ${m.name}</option>`).join('');

    return `
      <style>
        .quebra-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          margin-top: 1rem;
        }

        .quebra-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .metric-card-q {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 1.2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: transform 0.2s, border-color 0.2s;
        }

        .metric-card-q:hover {
          transform: translateY(-2px);
          border-color: rgba(250, 204, 21, 0.4);
        }

        .metric-icon-q {
          font-size: 2.2rem;
          width: 52px;
          height: 52px;
          border-radius: 12px;
          background: rgba(250, 204, 21, 0.15);
          color: #facc15;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .metric-info-q h4 {
          margin: 0;
          font-size: 0.85rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .metric-info-q p {
          margin: 0.25rem 0 0 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-row-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1rem;
        }

        @media (max-width: 768px) {
          .form-row-2, .form-row-3 {
            grid-template-columns: 1fr;
          }
        }
      </style>

      <div class="panel-header animate-slide-in">
        <div class="panel-header__left">
          <h2 class="panel-title" style="color: #facc15;">📋 FORMULÁRIO DE AVARIA</h2>
          <p class="panel-subtitle">Sistema de Controle de Avarias, Origem, Ocorrência e Motivos</p>
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button type="button" class="btn btn--primary" id="btn-export-pdf-quebra" style="background: #facc15; color: #000; font-weight: bold; border: none;">
            <span>🖨️ Imprimir / PDF (Modelo Oficial)</span>
          </button>
        </div>
      </div>

      <!-- Métricas Rápidas -->
      <div class="quebra-metrics animate-slide-in" id="quebra-metrics-container">
        <!-- Renderizado dinamicamente -->
      </div>

      <div class="quebra-grid animate-slide-in">
        
        <!-- Formulário de Registro de Avaria -->
        <div class="card card--glass" style="padding: 1.5rem; border-top: 3px solid #facc15;">
          <h3 class="card-title" style="margin-bottom: 1.2rem; display: flex; align-items: center; gap: 8px; color: #facc15;">
            📝 Registrar Nova Avaria
          </h3>
          
          <form id="quebra-form" style="display: grid; gap: 1.2rem;">
            
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label" for="q-supplier">Nome do Fornecedor</label>
                <input type="text" id="q-supplier" class="form-input" placeholder="Ex: Seara / Friboi / Sadia">
              </div>

              <div class="form-group">
                <label class="form-label" for="q-occurrence-date">Data da Avaria *</label>
                <input type="date" id="q-occurrence-date" class="form-input" value="${todayStr}" required>
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-group" style="position: relative;">
                <label class="form-label" for="q-product-name">Descrição do Produto *</label>
                <input type="text" id="q-product-name" list="q-catalog-list" class="form-input" placeholder="Digite a descrição do produto..." required autocomplete="off">
                <datalist id="q-catalog-list">
                  ${datalistOptions}
                </datalist>
                <span id="q-product-preview" style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px; display: block;">—</span>
              </div>

              <div class="form-group">
                <label class="form-label" for="q-plu">Código PLU / EAN</label>
                <input type="text" id="q-plu" class="form-input" placeholder="Ex: 1001">
              </div>
            </div>

            <div class="form-row-3">
              <div class="form-group">
                <label class="form-label" for="q-quantity">Quantidade / Peso *</label>
                <input type="number" id="q-quantity" class="form-input" placeholder="0.000" step="0.001" min="0.001" required>
              </div>

              <div class="form-group">
                <label class="form-label" for="q-unit">Unidade *</label>
                <select id="q-unit" class="form-input" required style="cursor: pointer; background-color: var(--surface);">
                  <option value="kg">Kg (Quilos)</option>
                  <option value="un">Unidade</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="q-origin">Origem *</label>
                <select id="q-origin" class="form-input" required style="cursor: pointer; background-color: var(--surface);">
                  ${origensOptions}
                </select>
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label" for="q-occurrence">Ocorrência *</label>
                <select id="q-occurrence" class="form-input" required style="cursor: pointer; background-color: var(--surface);">
                  ${ocorrenciasOptions}
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="q-reason">Motivo *</label>
                <select id="q-reason" class="form-input" required style="cursor: pointer; background-color: var(--surface);">
                  ${motivosOptions}
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="q-responsible-name">Nome do Responsável *</label>
              <input type="text" id="q-responsible-name" class="form-input" value="${defaultRespName}" placeholder="Digite o nome..." required>
            </div>

            <div class="form-group">
              <label class="form-label" for="q-notes">Observações</label>
              <textarea id="q-notes" class="form-input" rows="2" placeholder="Observações adicionais..."></textarea>
            </div>

            <!-- Canvas de Assinatura -->
            <div class="form-group">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <label class="form-label" style="font-weight: 600; margin-bottom: 0; color: var(--text-primary);">✍️ Assinatura do Responsável</label>
                <button type="button" class="btn btn--sm btn--ghost" id="clear-q-sig-btn" style="padding: 2px 8px; font-size: 0.8rem; height: auto;">Limpar Assinatura</button>
              </div>
              <div style="background: #ffffff; border-radius: 6px; border: 1px solid #cbd5e1; height: 110px; overflow: hidden; position: relative;">
                <canvas id="q-sig-canvas" width="600" height="110" style="width: 100%; height: 100%; cursor: crosshair; display: block; touch-action: none;"></canvas>
              </div>
            </div>

            <div class="form-group" style="margin-top: 0.5rem;">
              <button type="submit" class="btn btn--primary" id="btn-submit-quebra" style="width: 100%; display: flex; justify-content: center; align-items: center; gap: 8px; background: #facc15; color: #000; padding: 0.9rem; font-weight: bold; border: none;">
                <span>💾 Salvar Avaria</span>
              </button>
            </div>

          </form>
        </div>

        <!-- Tabela / Histórico de Avarias -->
        <div class="card card--glass" style="padding: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
            <h3 class="card-title" style="margin: 0;">📋 Lançamentos Cadastrados</h3>
            <span class="badge" id="q-count-badge" style="background: rgba(250, 204, 21, 0.2); color: #facc15; padding: 0.4rem 0.8rem; border-radius: 20px;">0 registros</span>
          </div>

          <!-- Barra de Filtros -->
          <div class="toolbar" style="margin-bottom: 1.2rem; display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 12px; border: 1px solid var(--glass-border);">
            
            <div class="search-box" style="flex: 1; min-width: 200px;">
              <span class="search-icon">🔍</span>
              <input type="text" id="q-search-input" class="search-input" placeholder="Buscar por código, produto ou responsável...">
            </div>

            <select id="q-filter-month" class="select-control" style="height: 38px;">
              ${monthOptions}
            </select>

            <select id="q-filter-year" class="select-control" style="height: 38px;">
              ${yearOptions}
            </select>

            <button id="btn-clear-q-filters" class="btn btn--ghost" style="height: 38px; padding: 0 0.75rem; font-size: 0.85rem; border-radius: 20px;">
              🧹 Limpar
            </button>
          </div>

          <!-- Tabela -->
          <div class="responsive-table-container">
            <table class="responsive-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descrição do Produto</th>
                  <th>Qtd / Peso</th>
                  <th>Origem</th>
                  <th>Ocorrência</th>
                  <th>Motivo</th>
                  <th>Responsável</th>
                  <th style="text-align: right;">Ações</th>
                </tr>
              </thead>
              <tbody id="quebras-table-body">
                <!-- Injetado por JS -->
              </tbody>
            </table>
          </div>

        </div>

      </div>
    `;
  },

  initCanvas() {
    setTimeout(() => {
      const canvas = document.getElementById('q-sig-canvas');
      if (!canvas) return;

      this.canvasInstance = canvas;
      this.ctxInstance = canvas.getContext('2d');
      this.hasSigned = false;

      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width || 600;
      canvas.height = rect.height || 110;

      const ctx = this.ctxInstance;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#0f172a';

      let isDrawing = false;
      let lastX = 0;
      let lastY = 0;

      const getPos = (e) => {
        const cRect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
          x: clientX - cRect.left,
          y: clientY - cRect.top
        };
      };

      const startDrawing = (e) => {
        isDrawing = true;
        const pos = getPos(e);
        lastX = pos.x;
        lastY = pos.y;
      };

      const draw = (e) => {
        if (!isDrawing) return;
        e.preventDefault();
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        lastX = pos.x;
        lastY = pos.y;
        this.hasSigned = true;
      };

      const stopDrawing = () => {
        isDrawing = false;
      };

      canvas.addEventListener('mousedown', startDrawing);
      canvas.addEventListener('mousemove', draw);
      canvas.addEventListener('mouseup', stopDrawing);
      canvas.addEventListener('mouseleave', stopDrawing);

      canvas.addEventListener('touchstart', startDrawing, { passive: false });
      canvas.addEventListener('touchmove', draw, { passive: false });
      canvas.addEventListener('touchend', stopDrawing);
    }, 100);
  },

  clearSignature() {
    if (this.canvasInstance && this.ctxInstance) {
      this.ctxInstance.clearRect(0, 0, this.canvasInstance.width, this.canvasInstance.height);
      this.hasSigned = false;
    }
  },

  bindEvents(container) {
    const productNameInput = container.querySelector('#q-product-name');
    const pluInput = container.querySelector('#q-plu');
    const previewSpan = container.querySelector('#q-product-preview');

    productNameInput?.addEventListener('change', () => {
      const nameVal = productNameInput.value.trim();
      const allProducts = [...(window.BrigadaData.products || []), ...(window.BrigadaData.catalog || [])];
      const match = allProducts.find(p => p.name && p.name.toLowerCase() === nameVal.toLowerCase());
      if (match) {
        if (pluInput && match.plu) pluInput.value = match.plu;
        if (previewSpan) previewSpan.textContent = `✅ Produto localizado (PLU: ${match.plu || 'S/N'})`;
      } else {
        if (previewSpan) previewSpan.textContent = '—';
      }
    });

    container.querySelector('#clear-q-sig-btn')?.addEventListener('click', () => {
      this.clearSignature();
    });

    const form = container.querySelector('#quebra-form');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();

      const supplier = container.querySelector('#q-supplier').value.trim();
      const occurrenceDate = container.querySelector('#q-occurrence-date').value;
      const productName = productNameInput.value.trim();
      const plu = pluInput.value.trim();
      const quantity = parseFloat(container.querySelector('#q-quantity').value);
      const unit = container.querySelector('#q-unit').value;
      const origin = container.querySelector('#q-origin').value;
      const occurrence = container.querySelector('#q-occurrence').value;
      const reason = container.querySelector('#q-reason').value;
      const responsibleName = container.querySelector('#q-responsible-name').value.trim();
      const notes = container.querySelector('#q-notes').value.trim();

      if (!productName || !quantity || !occurrenceDate) {
        alert('Por favor, preencha todos os campos obrigatórios!');
        return;
      }

      let signatureData = null;
      if (this.hasSigned && this.canvasInstance) {
        signatureData = this.canvasInstance.toDataURL('image/png');
      }

      const user = window.BrigadaAuth.currentUser || {};
      const payload = {
        supplier,
        plu,
        productName,
        origin,
        occurrence,
        reason,
        sector: 'Açougue',
        quantity,
        unit,
        occurrenceDate,
        responsibleName,
        createdBy: user.name || 'Usuário',
        notes,
        signature: signatureData
      };

      const btnSubmit = container.querySelector('#btn-submit-quebra');
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<span>Salvando...</span>';
      }

      try {
        await window.BrigadaData.createQuebra(payload);
        alert('Avaria salva com sucesso!');

        form.reset();
        this.clearSignature();
        const todayStr = new Date().toISOString().split('T')[0];
        if (container.querySelector('#q-occurrence-date')) {
          container.querySelector('#q-occurrence-date').value = todayStr;
        }

        this.renderHistory(container);
      } catch (err) {
        console.error('Erro ao salvar avaria:', err);
        alert('Erro ao registrar avaria: ' + err.message);
      } finally {
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = '<span>💾 Salvar Avaria</span>';
        }
      }
    });

    const searchInput = container.querySelector('#q-search-input');
    const filterMonth = container.querySelector('#q-filter-month');
    const filterYear = container.querySelector('#q-filter-year');
    const btnClearFilters = container.querySelector('#btn-clear-q-filters');

    searchInput?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.renderHistory(container);
    });

    filterMonth?.addEventListener('change', (e) => {
      this.currentMonth = e.target.value;
      this.renderHistory(container);
    });

    filterYear?.addEventListener('change', (e) => {
      this.currentYear = e.target.value;
      this.renderHistory(container);
    });

    btnClearFilters?.addEventListener('click', () => {
      this.searchQuery = '';
      this.currentMonth = 'all';
      this.currentYear = 'all';

      if (searchInput) searchInput.value = '';
      if (filterMonth) filterMonth.value = 'all';
      if (filterYear) filterYear.value = 'all';

      this.renderHistory(container);
    });

    container.querySelector('#btn-export-pdf-quebra')?.addEventListener('click', () => {
      this.exportPDF();
    });
  },

  getFilteredList() {
    let list = window.BrigadaData.quebras || [];

    if (this.currentMonth !== 'all') {
      list = list.filter(q => {
        if (!q.occurrenceDate) return false;
        const m = q.occurrenceDate.split('-')[1];
        return m === this.currentMonth;
      });
    }

    if (this.currentYear !== 'all') {
      list = list.filter(q => {
        if (!q.occurrenceDate) return false;
        const y = q.occurrenceDate.split('-')[0];
        return y === this.currentYear;
      });
    }

    if (this.searchQuery) {
      const qLower = this.searchQuery.toLowerCase();
      list = list.filter(q =>
        (q.productName && q.productName.toLowerCase().includes(qLower)) ||
        (q.plu && q.plu.toLowerCase().includes(qLower)) ||
        (q.responsibleName && q.responsibleName.toLowerCase().includes(qLower)) ||
        (q.origin && q.origin.toLowerCase().includes(qLower)) ||
        (q.occurrence && q.occurrence.toLowerCase().includes(qLower)) ||
        (q.reason && q.reason.toLowerCase().includes(qLower))
      );
    }

    return list;
  },

  renderHistory(container) {
    const list = this.getFilteredList();

    const metricsContainer = container.querySelector('#quebra-metrics-container');
    if (metricsContainer) {
      const totalCount = list.length;
      const totalVolume = list.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);

      const occurrenceCounts = {};
      list.forEach(i => {
        const key = i.occurrence || i.reason || 'Vencimento';
        occurrenceCounts[key] = (occurrenceCounts[key] || 0) + 1;
      });
      let topOccurrence = 'Nenhum';
      let maxCount = 0;
      Object.entries(occurrenceCounts).forEach(([k, count]) => {
        if (count > maxCount) {
          maxCount = count;
          topOccurrence = k;
        }
      });

      metricsContainer.innerHTML = `
        <div class="metric-card-q">
          <div class="metric-icon-q">📄</div>
          <div class="metric-info-q">
            <h4>Total de Lançamentos</h4>
            <p>${totalCount} <span style="font-size: 0.9rem; font-weight: normal; color: var(--text-secondary);">itens</span></p>
          </div>
        </div>

        <div class="metric-card-q">
          <div class="metric-icon-q" style="background: rgba(239, 68, 68, 0.15); color: #ef4444;">⚖️</div>
          <div class="metric-info-q">
            <h4>Volume Total em Avaria</h4>
            <p style="color: #ef4444;">${totalVolume.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 3 })} <span style="font-size: 0.9rem; font-weight: normal; color: var(--text-secondary);">Kg/Un</span></p>
          </div>
        </div>

        <div class="metric-card-q">
          <div class="metric-icon-q" style="background: rgba(250, 204, 21, 0.15); color: #facc15;">⚠️</div>
          <div class="metric-info-q">
            <h4>Ocorrência Principal</h4>
            <p style="font-size: 1.1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #facc15;" title="${topOccurrence}">${topOccurrence}</p>
          </div>
        </div>
      `;
    }

    const badge = container.querySelector('#q-count-badge');
    if (badge) badge.textContent = `${list.length} registro(s)`;

    const tbody = container.querySelector('#quebras-table-body');
    if (!tbody) return;

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 3rem 1rem; color: var(--text-secondary);">
            <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📋</div>
            <p style="margin: 0; font-size: 1rem;">Nenhum lançamento de avaria encontrado.</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(item => {
      const unitStr = item.unit || 'kg';
      const qtyStr = `${parseFloat(item.quantity || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ${unitStr}`;

      return `
        <tr>
          <td><strong>${item.plu || 'S/N'}</strong></td>
          <td><strong>${item.productName}</strong></td>
          <td><strong style="color: #facc15;">${qtyStr}</strong></td>
          <td><span class="badge" style="background: rgba(255,255,255,0.06);">${item.origin || 'Salão de Vendas'}</span></td>
          <td><span class="badge badge--expired">${item.occurrence || 'Vencimento'}</span></td>
          <td><span class="badge" style="background: rgba(250, 204, 21, 0.12); color: #facc15;">${item.reason || 'Qualidade'}</span></td>
          <td>${item.responsibleName || '—'}</td>
          <td style="text-align: right;">
            <button class="btn btn--sm btn--ghost btn-delete-quebra" data-id="${item.id}" title="Excluir Registro" style="color: #ef4444;">
              🗑️
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.btn-delete-quebra').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'));
        if (confirm('Tem certeza que deseja excluir este registro de avaria?')) {
          await window.BrigadaData.deleteQuebra(id);
          this.renderHistory(container);
        }
      });
    });
  },

  exportPDF() {
    const list = this.getFilteredList();
    if (list.length === 0) {
      alert('Nenhum registro para exportar.');
      return;
    }

    const todayStr = new Date().toLocaleDateString('pt-BR');
    const firstSupplier = list[0]?.supplier || '';

    // Garante no mínimo 20 linhas como na planilha original do Excel
    const rowsCount = Math.max(list.length, 18);
    const tableRows = [];

    for (let i = 0; i < rowsCount; i++) {
      const item = list[i];
      if (item) {
        tableRows.push(`
          <tr style="height: 22px;">
            <td style="border: 1px solid #000; text-align: center; font-size: 10px;">${item.plu || ''}</td>
            <td style="border: 1px solid #000; font-size: 10px; font-weight: bold; padding-left: 4px;">${item.productName || ''}</td>
            <td style="border: 1px solid #000; text-align: center; font-size: 10px; font-weight: bold;">${item.quantity ? `${item.quantity} ${item.unit || 'kg'}` : ''}</td>
            <td style="border: 1px solid #000; text-align: center; font-size: 10px;">${item.origin || ''}</td>
            <td style="border: 1px solid #000; text-align: center; font-size: 10px;">${item.occurrence || ''}</td>
            <td style="border: 1px solid #000; text-align: center; font-size: 10px;">${item.reason || ''}</td>
            <td style="border: 1px solid #000; text-align: center; font-size: 10px;">${item.responsibleName || ''}</td>
          </tr>
        `);
      } else {
        // Linhas em branco para manter a estrutura idêntica ao modelo impresso
        tableRows.push(`
          <tr style="height: 22px;">
            <td style="border: 1px solid #000;"></td>
            <td style="border: 1px solid #000;"></td>
            <td style="border: 1px solid #000;"></td>
            <td style="border: 1px solid #000;"></td>
            <td style="border: 1px solid #000;"></td>
            <td style="border: 1px solid #000;"></td>
            <td style="border: 1px solid #000;"></td>
          </tr>
        `);
      }
    }

    const printHTML = `
      <div class="formulario-avaria-document" style="font-family: Arial, sans-serif; color: #000; padding: 10px; background: #ffffff; max-width: 1050px; margin: 0 auto;">
        <style>
          @page { size: A4 landscape; margin: 6mm; }
          body { font-family: Arial, sans-serif; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .yellow-bar { background-color: #ffff00 !important; border: 1px solid #000; font-size: 11px; font-weight: bold; padding: 4px 8px; }
          .legend-table { width: 100%; border-collapse: collapse; margin-bottom: 6px; font-size: 8px; }
          .legend-table th { border: 1px solid #000; background: #fff; text-align: center; font-weight: bold; font-size: 9px; padding: 2px; }
          .legend-table td { border: 1px solid #000; padding: 1px 3px; }
          .main-avaria-table { width: 100%; border-collapse: collapse; }
          .main-avaria-table th { background-color: #ffff00 !important; border: 1px solid #000; font-size: 10px; font-weight: bold; text-align: center; padding: 4px; }
          .main-avaria-table td { border: 1px solid #000; }
        </style>

        <!-- Titulo / Barra Amarela de Fornecedor e Data -->
        <div style="text-align: center; font-size: 14px; font-weight: bold; margin-bottom: 4px; text-transform: uppercase;">
          FORMULARIO DE AVARIA
        </div>

        <div class="yellow-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <div><strong>Nome do Fornecedor:</strong> ${firstSupplier ? firstSupplier : '________________________________________________'}</div>
          <div><strong>Data:</strong> ${todayStr}</div>
        </div>

        <!-- Layout em 2 colunas: Legendas na esquerda + Tabela Principal na direita -->
        <div style="display: flex; gap: 8px; align-items: start;">
          
          <!-- Coluna Esquerda: Legendas (Origem, Ocorrência, Motivo) -->
          <div style="width: 220px; flex-shrink: 0;">
            
            <!-- ORIGEM -->
            <table class="legend-table">
              <thead>
                <tr>
                  <th style="width: 20px;"></th>
                  <th>ORIGEM:</th>
                </tr>
              </thead>
              <tbody>
                ${this.ORIGENS.map(o => `
                  <tr>
                    <td style="text-align: center; font-weight: bold;">${o.id}</td>
                    <td>${o.name}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <!-- OCORRÊNCIA -->
            <table class="legend-table">
              <thead>
                <tr>
                  <th style="width: 20px;"></th>
                  <th>OCORRÊNCIA</th>
                </tr>
              </thead>
              <tbody>
                ${this.OCORRENCIAS.map(o => `
                  <tr>
                    <td style="text-align: center; font-weight: bold;">${o.id}</td>
                    <td>${o.name}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <!-- MOTIVO -->
            <table class="legend-table">
              <thead>
                <tr>
                  <th style="width: 20px;"></th>
                  <th>MOTIVO</th>
                </tr>
              </thead>
              <tbody>
                ${this.MOTIVOS.map(m => `
                  <tr>
                    <td style="text-align: center; font-weight: bold;">${m.id}</td>
                    <td>${m.name}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

          </div>

          <!-- Coluna Direita: Tabela de Dados da Avaria -->
          <div style="flex: 1;">
            <table class="main-avaria-table">
              <thead>
                <tr>
                  <th style="width: 11%;">CÓDIGO</th>
                  <th style="width: 37%;">DESCRIÇÃO</th>
                  <th style="width: 14%;">QUANTIDADE PESO</th>
                  <th style="width: 10%;">ORIGEM</th>
                  <th style="width: 10%;">OCORRÊNCIA</th>
                  <th style="width: 9%;">MOTIVO</th>
                  <th style="width: 9%;">RESPONSÁVEL</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows.join('')}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    `;

    if (window.BrigadaUI && window.BrigadaUI.printContent) {
      window.BrigadaUI.printContent(printHTML);
    } else {
      window.print();
    }
  }
};

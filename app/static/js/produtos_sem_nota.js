/**
 * BRIGADA-IA — Produtos Sem Nota Module
 * Gestão de produtos recebidos sem nota fiscal com visual mobile aprimorado
 */

window.BrigadaProdutosSemNota = {
  isLoading: false,
  hasSigned: false,
  canvasInstance: null,
  ctxInstance: null,
  currentDay: 'all',
  currentMonth: 'all',
  currentYear: 'all',

  render(container) {
    // Opções de Dia
    let dayOptions = '<option value="all">Dia (Todos)</option>';
    for (let i = 1; i <= 31; i++) {
      const d = String(i).padStart(2, '0');
      const selected = this.currentDay === d ? 'selected' : '';
      dayOptions += `<option value="${d}" ${selected}>${d}</option>`;
    }

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

    // Opções de Ano
    const years = ['2025', '2026', '2027', '2028'];
    let yearOptions = '<option value="all">Ano (Todos)</option>';
    years.forEach(y => {
      const selected = this.currentYear === y ? 'selected' : '';
      yearOptions += `<option value="${y}" ${selected}>${y}</option>`;
    });

    container.innerHTML = `
      <style>
        /* Estilos e responsividade aprimorados para Mobile */
        .sn-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          margin-top: 1rem;
        }

        .sn-qty-group {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 0.75rem;
          align-items: end;
        }

        /* Transformação da tabela em lista de cartões no mobile */
        @media (max-width: 768px) {
          #sem-nota-form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .card {
            padding: 1.2rem !important;
          }

          /* Forçar elementos da tabela a se comportarem como blocos */
          .responsive-table, 
          .responsive-table thead, 
          .responsive-table tbody, 
          .responsive-table th, 
          .responsive-table td, 
          .responsive-table tr {
            display: block;
          }

          /* Ocultar cabeçalho da tabela */
          .responsive-table thead {
            display: none;
          }

          /* Espaçamento e bordas nos cartões gerados das linhas */
          .responsive-table tr {
            margin-bottom: 1rem;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 12px;
          }

          .responsive-table tr:last-child {
            margin-bottom: 0;
          }

          /* Cada célula se comporta como uma linha de dados chave-valor */
          .responsive-table td {
            border: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.04);
            position: relative;
            padding: 8px 0 8px 45% !important;
            text-align: right !important;
            font-size: 0.85rem !important;
          }

          .responsive-table td:last-child {
            border-bottom: none;
            padding-left: 0 !important;
            text-align: center !important;
            display: flex;
            justify-content: center;
            gap: 12px;
            margin-top: 8px;
          }

          /* Inserir rótulos nas células usando pseudo-elementos */
          .responsive-table td::before {
            content: attr(data-label);
            position: absolute;
            top: 8px;
            left: 0;
            width: 40%;
            text-align: left;
            font-weight: 700;
            color: var(--text-secondary);
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 0.03em;
          }

          .responsive-table td:last-child::before {
            display: none;
          }

          .hide-mobile {
            display: none !important;
          }
        }
      </style>

      <div class="panel-header animate-slide-in">
        <div class="panel-header__left">
          <h2 class="panel-title">📄 Produtos Sem Nota</h2>
          <p class="panel-subtitle">Controle de mercadorias recebidas sem nota fiscal correspondente</p>
        </div>
      </div>

      <div class="sn-grid animate-slide-in">
        
        <!-- Formulário de Cadastro -->
        <div class="card card--glass" style="padding: 1.5rem;">
          <h3 class="card-title" style="margin-bottom: 1.2rem; display: flex; align-items: center; gap: 8px;">
            📥 Registrar Entrada Sem Nota
          </h3>
          <form id="sem-nota-form" style="display: grid; gap: 1.2rem; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); align-items: start;">
            
            <div class="form-group" style="position: relative; margin-bottom: 1.2rem;">
              <label class="form-label" for="sn-plu">Código PLU *</label>
              <input type="text" id="sn-plu" list="sn-catalog-list" class="form-input" placeholder="Digite o PLU..." required autocomplete="off">
              <datalist id="sn-catalog-list"></datalist>
              <span id="sn-product-name-preview" style="position: absolute; left: 0; bottom: -1.4rem; font-size: 0.8rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">—</span>
            </div>

            <!-- Grupo de Quantidade e Unidade Alinhados -->
            <div class="sn-qty-group">
              <div class="form-group" style="margin: 0;">
                <label class="form-label" for="sn-quantity">Quantidade *</label>
                <input type="number" id="sn-quantity" class="form-input" placeholder="0.00" step="0.01" min="0.01" required>
              </div>
              <div class="form-group" style="margin: 0;">
                <label class="form-label" for="sn-unit">Unidade *</label>
                <select id="sn-unit" class="form-input" required style="cursor: pointer; background-color: var(--surface);">
                  <option value="kg">kg</option>
                  <option value="un">un</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="sn-arrival-date">Data de Chegada (DD/MM/AAAA) *</label>
              <input type="text" id="sn-arrival-date" class="form-input" placeholder="DD/MM/AAAA" inputmode="numeric" maxlength="10" required>
            </div>

            <!-- Nome Completo do Responsável -->
            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label" for="sn-responsible-name">Nome Completo do Responsável *</label>
              <input type="text" id="sn-responsible-name" class="form-input" placeholder="Digite o nome completo de quem está recebendo..." required>
            </div>

            <!-- Canvas de Assinatura -->
            <div class="form-group" style="grid-column: 1 / -1;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <label class="form-label" style="font-weight: 600; margin-bottom: 0; color: var(--text-primary);">✍️ Assinatura do Responsável *</label>
                <button type="button" class="btn btn--sm btn--ghost" id="clear-sn-sig-btn" style="padding: 2px 8px; font-size: 0.8rem; height: auto;">Limpar</button>
              </div>
              <div style="background: #ffffff; border-radius: 6px; border: 1px solid #cbd5e1; height: 120px; overflow: hidden; position: relative;">
                <canvas id="sn-sig-canvas" width="600" height="120" style="width: 100%; height: 100%; cursor: crosshair; display: block; touch-action: none;"></canvas>
              </div>
            </div>

            <div class="form-group" style="display: flex; align-items: flex-end; grid-column: 1 / -1;">
              <button type="submit" class="btn btn--primary" id="btn-submit-sn" style="width: 100%; display: flex; justify-content: center; align-items: center; gap: 8px;">
                <span>Salvar Registro</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Tabela/Listagem de Registros -->
        <div class="card card--glass" style="padding: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
            <h3 class="card-title" style="margin: 0;">📋 Registros Recentes</h3>
            <span class="badge" id="sn-count-badge" style="background: rgba(255,255,255,0.06); padding: 0.3rem 0.6rem; border-radius: 20px;">0 registros</span>
          </div>

          <!-- Barra de Filtros por Data de Validade -->
          <div class="toolbar" style="margin-bottom: 1.5rem; display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 12px; border: 1px solid var(--glass-border);">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1.2rem;">🔍</span>
              <span style="font-weight: 500; font-size: 0.95rem; color: var(--text-secondary);">Filtrar Validade:</span>
            </div>
            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center;">
              <select id="sn-filter-day" class="select-control" style="padding: 0.4rem 2rem 0.4rem 1rem; min-width: 90px; height: 38px; background-color: var(--surface);">
                ${dayOptions}
              </select>
              <select id="sn-filter-month" class="select-control" style="padding: 0.4rem 2rem 0.4rem 1rem; min-width: 130px; height: 38px; background-color: var(--surface);">
                ${monthOptions}
              </select>
              <select id="sn-filter-year" class="select-control" style="padding: 0.4rem 2rem 0.4rem 1rem; min-width: 110px; height: 38px; background-color: var(--surface);">
                ${yearOptions}
              </select>
              <button id="btn-clear-sn-filters" class="btn btn--ghost" style="padding: 0 1rem; height: 38px; font-size: 0.85rem; display: flex; align-items: center; gap: 0.25rem; border-radius: 20px;">
                <span>🧹</span> Limpar
              </button>
            </div>
          </div>

          <div style="background: rgba(0,0,0,0.1); border-radius: 8px; border: 1px solid var(--border); overflow: hidden;">
            <table class="table responsive-table" style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr style="border-bottom: 1px solid var(--border); background: rgba(255,255,255,0.02);">
                  <th style="padding: 12px 16px; color: var(--text-secondary); font-size: 0.85rem;">PLU</th>
                  <th style="padding: 12px 16px; color: var(--text-secondary); font-size: 0.85rem;">Produto</th>
                  <th style="padding: 12px 16px; color: var(--text-secondary); font-size: 0.85rem; text-align: right;">Quantidade</th>
                  <th style="padding: 12px 16px; color: var(--text-secondary); font-size: 0.85rem;">Chegada</th>
                  <th style="padding: 12px 16px; color: var(--text-secondary); font-size: 0.85rem;">Responsável</th>
                  <th class="hide-mobile" style="padding: 12px 16px; color: var(--text-secondary); font-size: 0.85rem;">Assinatura</th>
                  <th class="hide-mobile" style="padding: 12px 16px; color: var(--text-secondary); font-size: 0.85rem;">Registrado Por</th>
                  <th style="padding: 12px 16px; color: var(--text-secondary); font-size: 0.85rem; text-align: center; width: 150px;">Ações</th>
                </tr>
              </thead>
              <tbody id="sem-nota-table-body">
                <tr>
                  <td colspan="8" style="padding: 2rem; text-align: center; color: var(--text-secondary);">
                    Carregando registros...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    // Inicializar data padrão no input para hoje
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('sn-arrival-date').value = today;

    // Configurar filtros de validade (data de chegada)
    const selectDay = document.getElementById('sn-filter-day');
    const selectMonth = document.getElementById('sn-filter-month');
    const selectYear = document.getElementById('sn-filter-year');
    const btnClear = document.getElementById('btn-clear-sn-filters');

    const handleFilterChange = () => {
      this.currentDay = selectDay ? selectDay.value : 'all';
      this.currentMonth = selectMonth ? selectMonth.value : 'all';
      this.currentYear = selectYear ? selectYear.value : 'all';
      this.renderTable();
    };

    if (selectDay) selectDay.addEventListener('change', handleFilterChange);
    if (selectMonth) selectMonth.addEventListener('change', handleFilterChange);
    if (selectYear) selectYear.addEventListener('change', handleFilterChange);

    if (btnClear) {
      btnClear.addEventListener('click', () => {
        this.currentDay = 'all';
        this.currentMonth = 'all';
        this.currentYear = 'all';
        if (selectDay) selectDay.value = 'all';
        if (selectMonth) selectMonth.value = 'all';
        if (selectYear) selectYear.value = 'all';
        this.renderTable();
      });
    }

    this.setupCatalogAutocomplete();
    this.initSignatureDrawing();
    this.setupFormSubmit();

    const arrivalDateInput = document.getElementById('sn-arrival-date');
    if (arrivalDateInput) {
      arrivalDateInput.value = window.BrigadaData ? window.BrigadaData.getTodayFormatted() : '';
      if (window.BrigadaData?.applyDateMask) {
        window.BrigadaData.applyDateMask(arrivalDateInput);
      }
    }

    this.loadData();
  },

  setupCatalogAutocomplete() {
    const pluInput = document.getElementById('sn-plu');
    const namePreview = document.getElementById('sn-product-name-preview');
    const datalist = document.getElementById('sn-catalog-list');

    datalist.innerHTML = '';
    const catalog = window.BrigadaData.catalog || [];
    catalog.forEach(item => {
      const option = document.createElement('option');
      option.value = item.plu;
      option.textContent = item.name;
      datalist.appendChild(option);
    });

    pluInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      const matched = catalog.find(item => item.plu === val);
      if (matched) {
        namePreview.textContent = matched.name;
        namePreview.style.color = 'var(--text-primary)';
      } else {
        namePreview.textContent = val ? 'Produto não cadastrado no catálogo base' : '—';
        namePreview.style.color = val ? '#f59e0b' : 'var(--text-secondary)';
      }
    });
  },

  initSignatureDrawing() {
    const canvas = document.getElementById('sn-sig-canvas');
    const clearBtn = document.getElementById('clear-sn-sig-btn');
    if (!canvas) return;

    this.canvasInstance = canvas;
    this.ctxInstance = canvas.getContext('2d');
    this.hasSigned = false;

    this.ctxInstance.strokeStyle = '#0f172a';
    this.ctxInstance.lineWidth = 3;
    this.ctxInstance.lineCap = 'round';
    this.ctxInstance.lineJoin = 'round';

    const getMousePos = (canvasEl, evt) => {
      const rect = canvasEl.getBoundingClientRect();
      const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
      const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
      return {
        x: (clientX - rect.left) * (canvasEl.width / rect.width),
        y: (clientY - rect.top) * (canvasEl.height / rect.height)
      };
    };

    let drawing = false;
    let lastPos = { x: 0, y: 0 };

    const startDrawing = (e) => {
      if (e.cancelable) e.preventDefault();
      drawing = true;
      lastPos = getMousePos(canvas, e);
      this.ctxInstance.beginPath();
      this.ctxInstance.moveTo(lastPos.x, lastPos.y);
      this.hasSigned = true;
    };

    const draw = (e) => {
      if (!drawing) return;
      if (e.cancelable) e.preventDefault();
      const currentPos = getMousePos(canvas, e);
      this.ctxInstance.lineTo(currentPos.x, currentPos.y);
      this.ctxInstance.stroke();
      lastPos = currentPos;
    };

    const stopDrawing = () => {
      drawing = false;
    };

    // Mouse Events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    // Touch Events
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    window.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clearCanvas();
      });
    }
  },

  clearCanvas() {
    if (this.canvasInstance && this.ctxInstance) {
      this.ctxInstance.clearRect(0, 0, this.canvasInstance.width, this.canvasInstance.height);
      this.hasSigned = false;
    }
  },

  setupFormSubmit() {
    const form = document.getElementById('sem-nota-form');
    const btnSubmit = document.getElementById('btn-submit-sn');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (this.isLoading) return;

      const plu = document.getElementById('sn-plu').value.trim();
      const quantity = document.getElementById('sn-quantity').value;
      const unit = document.getElementById('sn-unit').value;
      const rawArrivalDate = document.getElementById('sn-arrival-date').value.trim();
      const responsibleName = document.getElementById('sn-responsible-name').value.trim();

      const arrivalDate = window.BrigadaData.parseDateInput(rawArrivalDate);
      if (!arrivalDate) {
        window.BrigadaUI.showToast('Data de chegada inválida. Digite no formato DD/MM/AAAA (ex: 25/12/2026).', 'error');
        return;
      }

      if (!plu || !quantity || !responsibleName) {
        window.BrigadaUI.showToast('Preencha todos os campos obrigatórios.', 'error');
        return;
      }

      if (!this.hasSigned) {
        window.BrigadaUI.showToast('A assinatura do responsável é obrigatória para salvar.', 'error');
        return;
      }

      this.isLoading = true;
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<span>Salvando...</span>';

      try {
        const fullQty = `${quantity} ${unit}`;
        const signatureBase64 = this.canvasInstance.toDataURL('image/png');

        await window.BrigadaData.addProdutoSemNota(plu, fullQty, arrivalDate, signatureBase64, responsibleName);
        window.BrigadaUI.showToast('Registro de recebimento salvo com sucesso!', 'success');
        
        // Reset form
        form.reset();
        document.getElementById('sn-arrival-date').value = window.BrigadaData ? window.BrigadaData.getTodayFormatted() : '';
        document.getElementById('sn-product-name-preview').textContent = '—';
        this.clearCanvas();
        
        this.renderTable();
      } catch (err) {
        console.error(err);
        window.BrigadaUI.showToast(err.message || 'Erro ao salvar o registro.', 'error');
      } finally {
        this.isLoading = false;
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<span>Salvar Registro</span>';
      }
    });
  },

  async loadData() {
    const tbody = document.getElementById('sem-nota-table-body');
    try {
      await window.BrigadaData.loadProdutosSemNota();
      this.renderTable();
    } catch (err) {
      console.error(err);
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="padding: 2rem; text-align: center; color: #ef4444;">
            Erro ao carregar dados: ${err.message}
          </td>
        </tr>
      `;
    }
  },

  renderTable() {
    const tbody = document.getElementById('sem-nota-table-body');
    const countBadge = document.getElementById('sn-count-badge');
    let list = window.BrigadaData.produtosSemNota || [];

    // Aplicar filtros por data de chegada
    if (this.currentYear !== 'all') {
      list = list.filter(item => {
        if (!item.arrivalDate) return false;
        const [y] = item.arrivalDate.split('-');
        return y === this.currentYear;
      });
    }
    if (this.currentMonth !== 'all') {
      list = list.filter(item => {
        if (!item.arrivalDate) return false;
        const [, m] = item.arrivalDate.split('-');
        return m === this.currentMonth;
      });
    }
    if (this.currentDay !== 'all') {
      list = list.filter(item => {
        if (!item.arrivalDate) return false;
        const [, , d] = item.arrivalDate.split('-');
        return d === this.currentDay;
      });
    }

    countBadge.textContent = `${list.length} registro${list.length === 1 ? '' : 's'}`;

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="padding: 2rem; text-align: center; color: var(--text-secondary);">
            Nenhum produto sem nota registrado no momento.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = '';
    list.forEach(item => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
      tr.className = 'table-row-hover';

      let formattedDate = item.arrivalDate;
      if (item.arrivalDate) {
        const parts = item.arrivalDate.split('-');
        if (parts.length === 3) {
          formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
      }

      const sigIndicator = item.signature 
        ? `<span style="color:#22c55e; font-weight:600; display:flex; align-items:center; gap:4px; justify-content: flex-end;">✅ ✍️ Sim</span>`
        : `<span style="color:#ef4444; font-weight:600;">❌ Não</span>`;

      tr.innerHTML = `
        <td data-label="PLU" style="padding: 12px 16px; font-weight: 600; color: #a5b4fc;">${item.plu}</td>
        <td data-label="Produto" style="padding: 12px 16px; color: var(--text-primary); font-weight: 500;">${item.name}</td>
        <td data-label="Quantidade" style="padding: 12px 16px; color: var(--text-primary); text-align: right; font-weight: 600;">${item.quantity}</td>
        <td data-label="Chegada" style="padding: 12px 16px; color: var(--text-secondary); font-size: 0.9rem;">${formattedDate}</td>
        <td data-label="Responsável" style="padding: 12px 16px; color: var(--text-primary); font-weight: 500;">${item.responsibleName || '—'}</td>
        <td data-label="Assinatura" class="hide-mobile" style="padding: 12px 16px; font-size: 0.9rem;">${sigIndicator}</td>
        <td data-label="Registrado Por" class="hide-mobile" style="padding: 12px 16px; color: var(--text-secondary); font-size: 0.9rem;">${window.BrigadaData.getUserNameByEmail(item.createdBy)}</td>
        <td style="padding: 6px 12px; text-align: center;">
          <div style="display: inline-flex; gap: 6px; align-items: center; justify-content: center;">
            <button class="btn-icon btn-print-sn" data-id="${item.id}" title="Imprimir Comprovante">🖨️<span class="btn-label">Imprimir</span></button>
            <button class="btn-icon btn-icon--delete btn-delete-sn" data-id="${item.id}" title="Excluir Registro">🗑️<span class="btn-label">Excluir</span></button>
          </div>
        </td>
      `;

      // Event listener for print button
      tr.querySelector('.btn-print-sn').addEventListener('click', () => {
        const timestamp = new Date(item.createdAt || Date.now()).toLocaleString('pt-BR');
        const printContent = `
          <div class="print-container">
            <style>
              .print-container { font-family: 'Segoe UI', Arial, sans-serif; color:#1e293b; padding:24px; font-size:12px; background:#ffffff; max-width: 400px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; }
              .print-container .header { text-align:center; margin-bottom:16px; padding-bottom:12px; border-bottom:2px solid #6366f1; }
              .print-container .header h1 { font-size:18px; color:#6366f1; margin:0 0 4px 0; }
              .print-container .header p { color:#64748b; font-size:11px; margin:0; }
              .print-container .item-detail { margin-bottom:12px; border-bottom:1px dashed #e2e8f0; padding-bottom:8px; }
              .print-container .item-detail:last-child { border-bottom: none; }
              .print-container .label { font-weight: bold; color: #64748b; font-size: 10px; text-transform: uppercase; margin-bottom: 2px; }
              .print-container .value { font-size: 14px; color: #0f172a; font-weight: 500; }
              .print-container .value-large { font-size: 20px; color: #6366f1; font-weight: 800; }
              .print-container .signature-box { text-align: center; margin-top: 16px; padding-top: 8px; border-top: 1px solid #e2e8f0; }
              .print-container .signature-img { max-height: 80px; max-width: 100%; border: 1px solid #e2e8f0; border-radius: 4px; display: inline-block; background: #fff; padding: 4px; }
              .print-container .footer { margin-top:20px; text-align:center; color:#94a3b8; font-size:9px; border-top:1px solid #e2e8f0; padding-top:12px; }
            </style>
            <div class="header">
              <h1>📄 RECEBIMENTO SEM NOTA</h1>
              <p>BRIGADA-IA · Controle de Estoque</p>
            </div>
            <div class="item-detail">
              <div class="label">Código PLU</div>
              <div class="value-large">${item.plu}</div>
            </div>
            <div class="item-detail">
              <div class="label">Produto</div>
              <div class="value">${item.name}</div>
            </div>
            <div class="item-detail">
              <div class="label">Quantidade Recebida</div>
              <div class="value" style="font-weight:bold; font-size:16px;">${item.quantity}</div>
            </div>
            <div class="item-detail">
              <div class="label">Data de Chegada</div>
              <div class="value">${formattedDate}</div>
            </div>
            <div class="item-detail">
              <div class="label">Nome do Responsável</div>
              <div class="value" style="font-weight:bold;">${item.responsibleName || '—'}</div>
            </div>
            <div class="item-detail">
              <div class="label">Registrado Por</div>
              <div class="value">${window.BrigadaData.getUserNameByEmail(item.createdBy)}</div>
            </div>
            <div class="item-detail">
              <div class="label">Data do Registro</div>
              <div class="value">${timestamp}</div>
            </div>
            
            ${item.signature ? `
            <div class="signature-box">
              <div class="label" style="margin-bottom: 6px;">Assinatura do Responsável</div>
              <img src="${item.signature}" class="signature-img" alt="Assinatura">
            </div>
            ` : ''}

            <div class="footer">
              BRIGADA-IA v1.0.0
            </div>
          </div>
        `;
        window.BrigadaUI.printContent(printContent);
        window.BrigadaUI.showToast('Visualização de impressão aberta!', 'success');
      });

      // Event listener for delete button
      tr.querySelector('.btn-delete-sn').addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        if (confirm('Deseja realmente excluir este registro?')) {
          try {
            await window.BrigadaData.deleteProdutoSemNota(id);
            window.BrigadaUI.showToast('Registro excluído com sucesso.', 'success');
            this.renderTable();
          } catch (err) {
            console.error(err);
            window.BrigadaUI.showToast('Erro ao excluir o registro.', 'error');
          }
        }
      });

      tbody.appendChild(tr);
    });
  }
};

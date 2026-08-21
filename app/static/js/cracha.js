/**
 * BRIGADA-IA — Crachá / Etiqueta de Produto Module
 * Geração de etiquetas padronizadas com dados do produto, código e Observações.
 * Layout replica o crachá físico usado na loja.
 * Suporte completo para Imprimir, Compartilhar (Web Share / WhatsApp) e Baixar Imagem.
 */

window.BrigadaCracha = {
  isLoading: false,
  searchQuery: '',
  currentMonth: 'all',
  currentYear: 'all',

  async render(container) {
    if (window.BrigadaData.loadCrachas) {
      await window.BrigadaData.loadCrachas();
    }

    container.innerHTML = this.buildHTML();
    this.bindEvents(container);
    this.renderHistory(container);
  },

  buildHTML() {
    const user = window.BrigadaAuth.currentUser || {};
    const defaultCreatedBy = user.name || 'Felipe';

    // Datalist de Produtos do Sistema
    const allProducts = [...(window.BrigadaData.products || []), ...(window.BrigadaData.catalog || [])];
    const uniqueProductsMap = new Map();
    allProducts.forEach(p => {
      if (!p.name) return;
      if (!uniqueProductsMap.has(p.name)) {
        uniqueProductsMap.set(p.name, p);
      }
    });

    let datalistOptions = '';
    uniqueProductsMap.forEach(p => {
      datalistOptions += `<option value="${p.name}">${p.plu ? `PLU: ${p.plu}` : ''}</option>`;
    });

    // Opções de Mês
    const months = [
      { val: '01', name: 'Janeiro' }, { val: '02', name: 'Fevereiro' },
      { val: '03', name: 'Março' }, { val: '04', name: 'Abril' },
      { val: '05', name: 'Maio' }, { val: '06', name: 'Junho' },
      { val: '07', name: 'Julho' }, { val: '08', name: 'Agosto' },
      { val: '09', name: 'Setembro' }, { val: '10', name: 'Outubro' },
      { val: '11', name: 'Novembro' }, { val: '12', name: 'Dezembro' }
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

    return `
      <style>
        .cracha-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          margin-top: 1rem;
        }

        .cracha-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .metric-card-cr {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 1.2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: transform 0.2s, border-color 0.2s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .metric-card-cr:hover {
          transform: translateY(-2px);
          border-color: rgba(99, 102, 241, 0.4);
        }

        .metric-icon-cr {
          font-size: 2rem;
          width: 48px;
          height: 48px;
          border-radius: 10px;
          background: rgba(99, 102, 241, 0.15);
          color: #6366f1;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .metric-info-cr h4 {
          margin: 0;
          font-size: 0.85rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .metric-info-cr p {
          margin: 0.2rem 0 0 0;
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-row-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        /* ── Preview do Crachá ────────────────────────────── */
        .cracha-preview-container {
          display: flex;
          justify-content: center;
          margin: 1.2rem 0;
        }

        .cracha-preview {
          background: #ffffff;
          color: #000000;
          border: 3px solid #000;
          width: 420px;
          padding: 0;
          font-family: 'Arial Black', 'Arial', sans-serif;
          position: relative;
          border-radius: 4px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }

        .cracha-row {
          display: flex;
          border-bottom: 2px solid #000;
        }

        .cracha-row:last-child {
          border-bottom: none;
        }

        .cracha-cell {
          padding: 8px 10px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          position: relative;
        }

        .cracha-cell + .cracha-cell {
          border-left: 2px solid #000;
        }

        .cracha-cell-label {
          font-size: 8px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #333;
          margin-bottom: 2px;
        }

        .cracha-cell-value {
          font-size: 24px;
          font-weight: 900;
          line-height: 1.1;
          color: #000;
          word-break: break-all;
        }

        .cracha-cell-value.xsmall {
          font-size: 12px;
          font-weight: 700;
          line-height: 1.3;
          word-break: break-word;
          max-height: 85px;
          overflow: hidden;
          white-space: pre-wrap;
        }

        .cracha-product-name {
          font-size: 15px;
          font-weight: 900;
          line-height: 1.2;
          color: #000;
          text-align: center;
          padding: 10px 12px;
          word-break: break-word;
        }

        .cracha-footer {
          font-size: 7.5px;
          color: #555;
          padding: 4px 8px;
          display: flex;
          justify-content: space-between;
          border-top: 1px solid #ccc;
          background: #fafafa;
        }

        /* ── Mobile ────────────────────────────────────────── */
        @media (max-width: 768px) {
          .panel-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .panel-header button {
            width: 100%;
            justify-content: center;
            min-height: 48px;
            font-size: 0.95rem;
          }

          .cracha-metrics {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }

          .form-row-2, .form-row-actions {
            grid-template-columns: 1fr;
            gap: 0.85rem;
          }

          .form-input, .select-control, select, input[type="text"], input[type="number"], input[type="date"], textarea {
            font-size: 16px !important;
            min-height: 46px;
            padding: 0.6rem 0.9rem;
          }

          .toolbar {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }

          .toolbar .search-box,
          .toolbar select,
          .toolbar button {
            width: 100% !important;
            min-width: 100% !important;
            min-height: 44px;
          }

          .cracha-preview {
            width: 100%;
            max-width: 380px;
          }

          .cracha-cell-value {
            font-size: 20px;
          }

          .responsive-table,
          .responsive-table thead,
          .responsive-table tbody,
          .responsive-table th,
          .responsive-table td,
          .responsive-table tr {
            display: block;
          }

          .responsive-table thead {
            display: none;
          }

          .responsive-table tbody tr {
            margin-bottom: 1rem;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid var(--glass-border);
            border-radius: 12px;
            padding: 1.1rem;
            position: relative;
          }

          .responsive-table td {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.55rem 0;
            border-bottom: 1px dashed rgba(255, 255, 255, 0.06);
            text-align: right;
            font-size: 0.9rem;
          }

          .responsive-table td:last-child {
            border-bottom: none;
            padding-top: 0.75rem;
            justify-content: flex-end;
          }

          .responsive-table td::before {
            content: attr(data-label);
            font-weight: 600;
            color: var(--text-secondary);
            font-size: 0.82rem;
            text-transform: uppercase;
            text-align: left;
            margin-right: 1rem;
            padding-right: 1rem;
            letter-spacing: 0.3px;
          }
        }
      </style>

      <div class="panel-header animate-fade-in">
        <div class="panel-header__left">
          <h2 class="panel-title">🏷️ Crachá — Etiqueta de Produto</h2>
          <p class="panel-subtitle">Geração, Impressão e Compartilhamento de Crachás de Validade</p>
        </div>
      </div>

      <!-- Métricas Resumidas -->
      <div class="cracha-metrics animate-slide-in" id="cracha-metrics-container">
        <!-- Renderizado dinamicamente -->
      </div>

      <div class="cracha-grid animate-slide-in">

        <!-- Formulário de Geração de Crachá -->
        <div class="card card--glass" style="padding: 1.5rem; border-top: 3px solid #6366f1;">
          <h3 class="card-title" style="margin-bottom: 1.2rem; display: flex; align-items: center; gap: 8px; color: #6366f1;">
            🏷️ Gerar Novo Crachá
          </h3>

          <form id="cracha-form" style="display: grid; gap: 1.2rem;">

            <div class="form-row-2">
              <div class="form-group" style="position: relative;">
                <label class="form-label" for="cr-product-name">Descrição do Produto *</label>
                <input type="text" id="cr-product-name" list="cr-catalog-list" class="form-input" placeholder="Digite a descrição do produto..." required autocomplete="off">
                <datalist id="cr-catalog-list">
                  ${datalistOptions}
                </datalist>
                <span id="cr-product-preview" style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px; display: block;">—</span>
              </div>

              <div class="form-group">
                <label class="form-label" for="cr-consinco-code">Código do Consinco (PLU)</label>
                <input type="text" id="cr-consinco-code" class="form-input" placeholder="Ex: 38173">
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label" for="cr-quantity">Quantidade *</label>
                <input type="number" id="cr-quantity" class="form-input" placeholder="Ex: 315" step="1" min="1" required>
              </div>

              <div class="form-group">
                <label class="form-label" for="cr-expiry-date">Data de Validade (DD/MM/AA) *</label>
                <input type="text" id="cr-expiry-date" class="form-input" placeholder="DD/MM/AA" inputmode="numeric" maxlength="8" required>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="cr-notes">Observações</label>
              <textarea id="cr-notes" class="form-input" rows="2" placeholder="Observações adicionais (ex: coluna 14, lote especial)..."></textarea>
            </div>

            <!-- Preview do Crachá -->
            <div class="form-group">
              <label class="form-label" style="font-weight: 600; color: var(--text-primary);">👁️ Pré-visualização do Crachá</label>
              <div class="cracha-preview-container">
                <div class="cracha-preview" id="cracha-preview-box">
                  <div class="cracha-row">
                    <div class="cracha-cell" style="flex: 2;">
                      <div class="cracha-product-name" id="preview-product-name">NOME DO PRODUTO</div>
                    </div>
                  </div>
                  <div class="cracha-row">
                    <div class="cracha-cell" style="flex: 1;">
                      <div class="cracha-cell-label">VALIDADE</div>
                      <div class="cracha-cell-value" id="preview-expiry">--/--/--</div>
                    </div>
                    <div class="cracha-cell" style="flex: 1;">
                      <div class="cracha-cell-label">QUANTIDADE</div>
                      <div class="cracha-cell-value" id="preview-quantity">0</div>
                    </div>
                  </div>
                  <div class="cracha-row">
                    <div class="cracha-cell" style="flex: 1;">
                      <div class="cracha-cell-label">CÓDIGO DO CONSINCO</div>
                      <div class="cracha-cell-value" id="preview-consinco">-----</div>
                    </div>
                    <div class="cracha-cell" style="flex: 1;">
                      <div class="cracha-cell-label">OBSERVAÇÕES</div>
                      <div class="cracha-cell-value xsmall" id="preview-notes">—</div>
                    </div>
                  </div>
                  <div class="cracha-footer">
                    <span>Conferido por: <span id="preview-created-by">${defaultCreatedBy}</span></span>
                    <span>Emissão: <span id="preview-emission-date">${new Date().toLocaleDateString('pt-BR')}</span></span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Botões de Ação do Formulário -->
            <div class="form-row-actions">
              <button type="submit" class="btn btn--primary" id="btn-submit-cracha" style="display: flex; justify-content: center; align-items: center; gap: 8px; padding: 0.85rem; font-weight: bold;">
                <span>💾 Salvar Crachá</span>
              </button>

              <button type="button" class="btn btn--outline" id="btn-print-cracha" style="display: flex; justify-content: center; align-items: center; gap: 8px; padding: 0.85rem; font-weight: bold;">
                <span>🖨️ Imprimir</span>
              </button>

              <button type="button" class="btn btn--outline" id="btn-share-cracha" style="display: flex; justify-content: center; align-items: center; gap: 8px; padding: 0.85rem; font-weight: bold; border-color: rgba(34, 197, 94, 0.5); color: #4ade80;">
                <span>📲 Compartilhar</span>
              </button>

              <button type="button" class="btn btn--ghost" id="btn-download-cracha-img" style="display: flex; justify-content: center; align-items: center; gap: 8px; padding: 0.85rem; font-weight: bold;">
                <span>📥 Baixar Imagem</span>
              </button>
            </div>

          </form>
        </div>

        <!-- Tabela / Histórico de Crachás -->
        <div class="card card--glass" style="padding: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
            <h3 class="card-title" style="margin: 0;">📋 Crachás Gerados</h3>
            <span class="badge" id="cr-count-badge" style="background: rgba(255, 255, 255, 0.06); padding: 0.4rem 0.8rem; border-radius: 20px;">0 registros</span>
          </div>

          <!-- Barra de Filtros -->
          <div class="toolbar" style="margin-bottom: 1.2rem; display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 12px; border: 1px solid var(--glass-border);">

            <div class="search-box" style="flex: 1; min-width: 200px;">
              <span class="search-icon">🔍</span>
              <input type="text" id="cr-search-input" class="search-input" placeholder="Buscar por produto, código ou responsável...">
            </div>

            <select id="cr-filter-month" class="select-control" style="height: 38px;">
              ${monthOptions}
            </select>

            <select id="cr-filter-year" class="select-control" style="height: 38px;">
              ${yearOptions}
            </select>

            <button id="btn-clear-cr-filters" class="btn btn--ghost" style="height: 38px; padding: 0 0.75rem; font-size: 0.85rem; border-radius: 20px;">
              🧹 Limpar
            </button>
          </div>

          <!-- Barra de Ações em Lote (Compartilhar/Imprimir todos) -->
          <div id="batch-cracha-bar" style="display: none; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; padding: 0.75rem 1.2rem; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.4); border-radius: 10px; flex-wrap: wrap;" class="animate-fade-in">
            <span id="batch-cracha-count" style="font-weight: 600; color: #a5b4fc;">0 crachás selecionados</span>
            <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
              <button type="button" class="btn btn--primary btn--sm" id="btn-batch-share-crachas" style="background: #10b981; border: none; font-weight: bold;">
                <span>📲 Compartilhar Selecionados</span>
              </button>
              <button type="button" class="btn btn--primary btn--sm" id="btn-batch-print-crachas" style="font-weight: bold;">
                <span>🖨️ Imprimir Selecionados</span>
              </button>
              <button type="button" class="btn btn--ghost btn--sm" id="btn-batch-delete-crachas" style="color: #ef4444;">
                <span>🗑️ Excluir</span>
              </button>
            </div>
          </div>

          <!-- Tabela -->
          <div class="responsive-table-container">
            <table class="responsive-table">
              <thead>
                <tr>
                  <th style="width: 40px; text-align: center;">
                    <input type="checkbox" id="select-all-crachas" style="cursor:pointer; width:16px; height:16px;" title="Selecionar Todos">
                  </th>
                  <th>Produto</th>
                  <th>Quantidade</th>
                  <th>Código Consinco</th>
                  <th>Validade</th>
                  <th>Observações</th>
                  <th>Gerado por</th>
                  <th style="text-align: right; min-width: 140px;">Ações</th>
                </tr>
              </thead>
              <tbody id="crachas-table-body">
                <!-- Injetado por JS -->
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  },

  bindEvents(container) {
    const productNameInput = container.querySelector('#cr-product-name');
    const consincoInput = container.querySelector('#cr-consinco-code');
    const quantityInput = container.querySelector('#cr-quantity');
    const expiryInput = container.querySelector('#cr-expiry-date');
    const notesInput = container.querySelector('#cr-notes');
    const previewSpan = container.querySelector('#cr-product-preview');

    // Máscara de data DD/MM/AA
    if (expiryInput) {
      expiryInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 6) val = val.slice(0, 6);
        if (val.length >= 5) {
          val = val.slice(0, 2) + '/' + val.slice(2, 4) + '/' + val.slice(4);
        } else if (val.length >= 3) {
          val = val.slice(0, 2) + '/' + val.slice(2);
        }
        e.target.value = val;
        this.updatePreview(container);
      });
    }

    // Autocomplete de produto
    productNameInput?.addEventListener('input', () => {
      const nameVal = productNameInput.value.trim().toLowerCase();
      if (!nameVal) {
        if (previewSpan) previewSpan.textContent = '—';
        this.updatePreview(container);
        return;
      }
      const allProducts = [...(window.BrigadaData.products || []), ...(window.BrigadaData.catalog || [])];
      const match = allProducts.find(p => p.name && p.name.toLowerCase() === nameVal);

      if (match) {
        if (consincoInput && match.plu) consincoInput.value = match.plu;
        if (previewSpan) previewSpan.textContent = `✅ Produto localizado (PLU: ${match.plu || 'S/N'})`;
      } else {
        if (previewSpan) previewSpan.textContent = '—';
      }
      this.updatePreview(container);
    });

    // PLU lookup reverso
    consincoInput?.addEventListener('input', () => {
      const pluVal = consincoInput.value.trim();
      if (!pluVal) { this.updatePreview(container); return; }
      const allProducts = [...(window.BrigadaData.products || []), ...(window.BrigadaData.catalog || [])];
      const match = allProducts.find(p => p.plu && String(p.plu) === String(pluVal));

      if (match) {
        if (productNameInput) productNameInput.value = match.name;
        if (previewSpan) previewSpan.textContent = `✅ Produto localizado: ${match.name}`;
      }
      this.updatePreview(container);
    });

    // Atualiza preview em tempo real com quantidade e observações
    quantityInput?.addEventListener('input', () => this.updatePreview(container));
    notesInput?.addEventListener('input', () => this.updatePreview(container));

    // Submit form
    const form = container.querySelector('#cracha-form');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();

      const productName = productNameInput.value.trim();
      const consincoCode = consincoInput.value.trim();
      const quantity = parseFloat(quantityInput.value);
      const expiryDate = expiryInput.value.trim();
      const notes = notesInput ? notesInput.value.trim() : '';

      if (!productName || !quantity || !expiryDate) {
        alert('Por favor, preencha todos os campos obrigatórios!');
        return;
      }

      if (!/^\d{2}\/\d{2}\/\d{2}$/.test(expiryDate)) {
        alert('Por favor, informe a validade no formato DD/MM/AA!');
        return;
      }

      const user = window.BrigadaAuth.currentUser || {};
      const payload = {
        productName: productName.toUpperCase(),
        quantity,
        consincoCode,
        expiryDate,
        createdBy: user.name || 'Felipe',
        notes
      };

      const btnSubmit = container.querySelector('#btn-submit-cracha');
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<span>Salvando...</span>';
      }

      try {
        await window.BrigadaData.createCracha(payload);
        if (window.BrigadaUI?.showToast) {
          window.BrigadaUI.showToast('Crachá salvo com sucesso!', 'success');
        } else {
          alert('Crachá salvo com sucesso!');
        }

        form.reset();
        this.updatePreview(container);
        this.renderHistory(container);
      } catch (err) {
        console.error('Erro ao salvar crachá:', err);
        alert('Erro ao registrar crachá: ' + err.message);
      } finally {
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = '<span>💾 Salvar Crachá</span>';
        }
      }
    });

    // Imprimir crachá atual
    container.querySelector('#btn-print-cracha')?.addEventListener('click', () => {
      const data = this.getCurrentFormData(container);
      if (!data.productName) {
        alert('Preencha ao menos a descrição do produto para imprimir.');
        return;
      }
      this.printCracha(data);
    });

    // Compartilhar crachá atual
    container.querySelector('#btn-share-cracha')?.addEventListener('click', () => {
      const data = this.getCurrentFormData(container);
      if (!data.productName) {
        alert('Preencha ao menos a descrição do produto para compartilhar.');
        return;
      }
      this.shareCracha(data);
    });

    // Baixar imagem do crachá atual
    container.querySelector('#btn-download-cracha-img')?.addEventListener('click', () => {
      const data = this.getCurrentFormData(container);
      if (!data.productName) {
        alert('Preencha ao menos a descrição do produto para baixar a imagem.');
        return;
      }
      this.downloadCrachaImage(data);
    });

    // Filtros
    const searchInput = container.querySelector('#cr-search-input');
    const filterMonth = container.querySelector('#cr-filter-month');
    const filterYear = container.querySelector('#cr-filter-year');
    const btnClearFilters = container.querySelector('#btn-clear-cr-filters');

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
  },

  getCurrentFormData(container) {
    const user = window.BrigadaAuth.currentUser || {};
    return {
      productName: (container.querySelector('#cr-product-name')?.value || '').trim().toUpperCase(),
      quantity: container.querySelector('#cr-quantity')?.value || '0',
      consincoCode: container.querySelector('#cr-consinco-code')?.value || '-----',
      expiryDate: container.querySelector('#cr-expiry-date')?.value || '--/--/--',
      notes: container.querySelector('#cr-notes')?.value || '',
      createdBy: user.name || 'Felipe',
      emissionDate: new Date().toLocaleDateString('pt-BR')
    };
  },

  updatePreview(container) {
    const data = this.getCurrentFormData(container);

    const previewName = container.querySelector('#preview-product-name');
    const previewQty = container.querySelector('#preview-quantity');
    const previewConsinco = container.querySelector('#preview-consinco');
    const previewExpiry = container.querySelector('#preview-expiry');
    const previewNotes = container.querySelector('#preview-notes');

    if (previewName) previewName.textContent = data.productName || 'NOME DO PRODUTO';
    if (previewQty) previewQty.textContent = data.quantity || '0';
    if (previewConsinco) previewConsinco.textContent = data.consincoCode || '-----';
    if (previewExpiry) previewExpiry.textContent = data.expiryDate || '--/--/--';
    if (previewNotes) previewNotes.textContent = data.notes ? data.notes : '—';
  },

  buildCrachaHTML(data) {
    const productName = data.productName || 'NOME DO PRODUTO';
    const expiry = data.expiryDate || '--/--/--';
    const quantity = data.quantity || '0';
    const consinco = data.consincoCode || '-----';
    const notes = data.notes || '—';
    const createdBy = data.createdBy || 'Felipe';
    const emissionDate = data.emissionDate || (data.createdAt ? new Date(data.createdAt).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'));

    return `
      <div class="cracha-preview">
        <div class="cracha-row">
          <div class="cracha-cell" style="flex: 2;">
            <div class="cracha-product-name">${productName}</div>
          </div>
        </div>
        <div class="cracha-row">
          <div class="cracha-cell" style="flex: 1;">
            <div class="cracha-cell-label">VALIDADE</div>
            <div class="cracha-cell-value">${expiry}</div>
          </div>
          <div class="cracha-cell" style="flex: 1;">
            <div class="cracha-cell-label">QUANTIDADE</div>
            <div class="cracha-cell-value">${quantity}</div>
          </div>
        </div>
        <div class="cracha-row">
          <div class="cracha-cell" style="flex: 1;">
            <div class="cracha-cell-label">CÓDIGO DO CONSINCO</div>
            <div class="cracha-cell-value">${consinco}</div>
          </div>
          <div class="cracha-cell" style="flex: 1;">
            <div class="cracha-cell-label">OBSERVAÇÕES</div>
            <div class="cracha-cell-value xsmall">${notes}</div>
          </div>
        </div>
        <div class="cracha-footer">
          <span>Conferido por: ${createdBy}</span>
          <span>Emissão: ${emissionDate}</span>
        </div>
      </div>
    `;
  },

  printCracha(data) {
    if (!data) return;
    const doc = this.generateCrachasPDF([data]);
    if (doc) {
      doc.autoPrint();
      window.open(doc.output('bloburl'), '_blank');
      return;
    }
  },

  /**
   * Gera um Canvas em alta resolução desenhando o crachá fielmente.
   */
  generateCrachaCanvas(data) {
    const canvas = document.createElement('canvas');
    const width = 880;
    const height = 560;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Fundo branco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Borda preta externa
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, width - 6, height - 6);

    // Helper para desenhar linhas horizontais
    const drawHLine = (y) => {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#000000';
      ctx.stroke();
    };

    // Helper para desenhar linhas verticais
    const drawVLine = (x, y1, y2) => {
      ctx.beginPath();
      ctx.moveTo(x, y1);
      ctx.lineTo(x, y2);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#000000';
      ctx.stroke();
    };

    // 1. Linha Produto (Y: 0 a 110)
    ctx.fillStyle = '#000000';
    ctx.font = '900 26px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const pName = data.productName || 'NOME DO PRODUTO';
    // Se o nome for muito longo, quebra em 2 linhas
    if (pName.length > 38) {
      const mid = Math.floor(pName.length / 2);
      const splitIdx = pName.lastIndexOf(' ', mid) !== -1 ? pName.lastIndexOf(' ', mid) : mid;
      const l1 = pName.slice(0, splitIdx);
      const l2 = pName.slice(splitIdx).trim();
      ctx.fillText(l1, width / 2, 45);
      ctx.fillText(l2, width / 2, 80);
    } else {
      ctx.fillText(pName, width / 2, 58);
    }

    drawHLine(115);

    // 2. Linha Validade & Quantidade (Y: 115 a 290)
    drawVLine(width / 2, 115, 290);

    // Coluna Validade
    ctx.fillStyle = '#444444';
    ctx.font = 'bold 15px Arial, sans-serif';
    ctx.fillText('VALIDADE', width / 4, 150);

    ctx.fillStyle = '#000000';
    ctx.font = '900 48px Arial, sans-serif';
    ctx.fillText(data.expiryDate || '--/--/--', width / 4, 215);

    // Coluna Quantidade
    ctx.fillStyle = '#444444';
    ctx.font = 'bold 15px Arial, sans-serif';
    ctx.fillText('QUANTIDADE', (width / 4) * 3, 150);

    ctx.fillStyle = '#000000';
    ctx.font = '900 48px Arial, sans-serif';
    ctx.fillText(String(data.quantity || '0'), (width / 4) * 3, 215);

    drawHLine(290);

    // 3. Linha Código Consinco & Observações (Y: 290 a 510)
    drawVLine(width / 2, 290, 510);

    // Coluna Código Consinco
    ctx.fillStyle = '#444444';
    ctx.font = 'bold 15px Arial, sans-serif';
    ctx.fillText('CÓDIGO DO CONSINCO', width / 4, 330);

    ctx.fillStyle = '#000000';
    ctx.font = '900 48px Arial, sans-serif';
    ctx.fillText(String(data.consincoCode || '-----'), width / 4, 410);

    // Coluna Observações
    ctx.fillStyle = '#444444';
    ctx.font = 'bold 15px Arial, sans-serif';
    ctx.fillText('OBSERVAÇÕES', (width / 4) * 3, 330);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 22px Arial, sans-serif';
    const notes = data.notes || '—';
    if (notes.length > 25) {
      const mid = Math.floor(notes.length / 2);
      const splitIdx = notes.lastIndexOf(' ', mid) !== -1 ? notes.lastIndexOf(' ', mid) : mid;
      const n1 = notes.slice(0, splitIdx);
      const n2 = notes.slice(splitIdx).trim();
      ctx.fillText(n1, (width / 4) * 3, 385);
      ctx.fillText(n2, (width / 4) * 3, 420);
    } else {
      ctx.fillText(notes, (width / 4) * 3, 400);
    }

    drawHLine(510);

    // 4. Rodapé (Y: 510 a 560)
    ctx.fillStyle = '#666666';
    ctx.font = '14px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Conferido por: ${data.createdBy || 'Felipe'}`, 20, 538);

    ctx.textAlign = 'right';
    const emission = data.emissionDate || (data.createdAt ? new Date(data.createdAt).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'));
    ctx.fillText(`Emissão: ${emission}`, width - 20, 538);

    return canvas;
  },

  async downloadCrachaImage(data) {
    const canvas = this.generateCrachaCanvas(data);
    const link = document.createElement('a');
    const cleanName = (data.productName || 'cracha').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const cleanExpiry = (data.expiryDate || '').replace(/\//g, '-');
    link.download = `cracha_${cleanName}_${cleanExpiry}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    if (window.BrigadaUI?.showToast) {
      window.BrigadaUI.showToast('Imagem do crachá baixada com sucesso!', 'success');
    }
  },

  generateCrachasPDF(items) {
    if (!window.jspdf || !window.jspdf.jsPDF) return null;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const crachaWidth = 90;
    const crachaHeight = 72;
    const marginX = 11;
    const marginY = 15;
    const gapX = 8;
    const gapY = 12;

    items.forEach((item, index) => {
      const posOnPage = index % 4;

      if (index > 0 && posOnPage === 0) {
        doc.addPage();
      }

      const col = posOnPage % 2;
      const row = Math.floor(posOnPage / 2);
      const x = marginX + col * (crachaWidth + gapX);
      const y = marginY + row * (crachaHeight + gapY);

      // Borda exterior preta grossa
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.8);
      doc.rect(x, y, crachaWidth, crachaHeight);

      // 1. Topo: NOME DO PRODUTO (Altura: 16mm)
      doc.setLineWidth(0.5);
      doc.line(x, y + 16, x + crachaWidth, y + 16);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(0, 0, 0);
      const prodName = (item.productName || 'PRODUTO').toUpperCase();
      doc.text(prodName, x + crachaWidth / 2, y + 9.5, { align: 'center', maxWidth: crachaWidth - 4 });

      // 2. Linha do meio: VALIDADE (Esquerda) | QUANTIDADE (Direita) (y+16 até y+40)
      doc.line(x + crachaWidth / 2, y + 16, x + crachaWidth / 2, y + 40);
      doc.line(x, y + 40, x + crachaWidth, y + 40);

      // Validade (Esquerda)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(60, 60, 60);
      doc.text('VALIDADE', x + crachaWidth / 4, y + 21, { align: 'center' });
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(String(item.expiryDate || '—'), x + crachaWidth / 4, y + 33, { align: 'center' });

      // Quantidade (Direita)
      doc.setFontSize(6);
      doc.setTextColor(60, 60, 60);
      doc.text('QUANTIDADE', x + (3 * crachaWidth) / 4, y + 21, { align: 'center' });
      doc.setFontSize(15);
      doc.setTextColor(0, 0, 0);
      doc.text(String(item.quantity || 0), x + (3 * crachaWidth) / 4, y + 33, { align: 'center' });

      // 3. Linha inferior: CÓDIGO DO CONSINCO (Esquerda) | OBSERVAÇÕES (Direita) (y+40 até y+64)
      doc.line(x + crachaWidth / 2, y + 40, x + crachaWidth / 2, y + 64);
      doc.line(x, y + 64, x + crachaWidth, y + 64);

      // Código Consinco
      doc.setFontSize(6);
      doc.setTextColor(60, 60, 60);
      doc.text('CÓDIGO DO CONSINCO', x + crachaWidth / 4, y + 46, { align: 'center' });
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      doc.text(String(item.consincoCode || '—'), x + crachaWidth / 4, y + 56, { align: 'center' });

      // Observações
      doc.setFontSize(6);
      doc.setTextColor(60, 60, 60);
      doc.text('OBSERVAÇÕES', x + (3 * crachaWidth) / 4, y + 46, { align: 'center' });
      doc.setFontSize(7.5);
      doc.setTextColor(0, 0, 0);
      doc.text(String(item.notes || '—'), x + (3 * crachaWidth) / 4, y + 55, { align: 'center', maxWidth: (crachaWidth / 2) - 4 });

      // 4. Rodapé (y+64 até y+72)
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5);
      doc.setTextColor(100, 100, 100);
      doc.text(`Conferido por: ${item.createdBy || 'Felipe'}`, x + 3, y + 69);
      const emission = item.emissionDate || (item.createdAt ? new Date(item.createdAt).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'));
      doc.text(`Emissão: ${emission}`, x + crachaWidth - 3, y + 69, { align: 'right' });
    });

    return doc;
  },

  shareCracha(data) {
    if (!data) return;
    const doc = this.generateCrachasPDF([data]);
    if (doc) {
      const fileName = `cracha_${(data.consincoCode || 'produto')}.pdf`;
      window.BrigadaUI.shareDocPDF(doc, fileName, `Crachá — ${data.productName || ''}`);
    } else {
      this.downloadCrachaImage(data);
    }
  },

  getFilteredList() {
    let list = window.BrigadaData.crachas || [];

    if (this.currentMonth !== 'all') {
      list = list.filter(c => {
        if (!c.expiryDate) return false;
        const parts = c.expiryDate.split('/');
        return parts.length >= 2 && parts[1] === this.currentMonth;
      });
    }

    if (this.currentYear !== 'all') {
      list = list.filter(c => {
        if (!c.createdAt) return false;
        const y = c.createdAt.split('-')[0];
        return y === this.currentYear;
      });
    }

    if (this.searchQuery) {
      const qLower = this.searchQuery.toLowerCase();
      list = list.filter(c =>
        (c.productName && c.productName.toLowerCase().includes(qLower)) ||
        (c.consincoCode && c.consincoCode.toLowerCase().includes(qLower)) ||
        (c.notes && c.notes.toLowerCase().includes(qLower)) ||
        (c.createdBy && c.createdBy.toLowerCase().includes(qLower))
      );
    }

    return list;
  },

  renderHistory(container) {
    const list = this.getFilteredList();

    // Métricas
    const metricsContainer = container.querySelector('#cracha-metrics-container');
    if (metricsContainer) {
      const totalCount = list.length;
      const totalQty = list.reduce((sum, c) => sum + (c.quantity || 0), 0);
      const todayStr = new Date().toLocaleDateString('pt-BR');
      const todayCount = (window.BrigadaData.crachas || []).filter(c => {
        if (!c.createdAt) return false;
        const d = new Date(c.createdAt);
        return d.toLocaleDateString('pt-BR') === todayStr;
      }).length;

      metricsContainer.innerHTML = `
        <div class="metric-card-cr">
          <div class="metric-icon-cr">🏷️</div>
          <div class="metric-info-cr">
            <h4>Total de Crachás</h4>
            <p>${totalCount}</p>
          </div>
        </div>
        <div class="metric-card-cr">
          <div class="metric-icon-cr">📦</div>
          <div class="metric-info-cr">
            <h4>Quantidade Total</h4>
            <p>${totalQty.toLocaleString('pt-BR')}</p>
          </div>
        </div>
        <div class="metric-card-cr">
          <div class="metric-icon-cr">📅</div>
          <div class="metric-info-cr">
            <h4>Gerados Hoje</h4>
            <p>${todayCount}</p>
          </div>
        </div>
      `;
    }

    // Tabela
    const tbody = container.querySelector('#crachas-table-body');
    const badge = container.querySelector('#cr-count-badge');
    const batchBar = container.querySelector('#batch-cracha-bar');
    const batchCount = container.querySelector('#batch-cracha-count');
    const selectAllCb = container.querySelector('#select-all-crachas');

    if (batchBar) batchBar.style.display = 'none';
    if (selectAllCb) selectAllCb.checked = false;

    if (badge) badge.textContent = `${list.length} registro${list.length !== 1 ? 's' : ''}`;

    if (!tbody) return;

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
            Nenhum crachá encontrado.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(c => `
      <tr data-id="${c.id}">
        <td style="text-align: center; width: 40px;">
          <input type="checkbox" class="select-cracha-row" value="${c.id}" style="cursor:pointer; width:16px; height:16px;">
        </td>
        <td data-label="Produto" style="font-weight: 600;">${c.productName || '—'}</td>
        <td data-label="Quantidade">${c.quantity || 0}</td>
        <td data-label="Cód. Consinco">${c.consincoCode || '—'}</td>
        <td data-label="Validade">${c.expiryDate || '—'}</td>
        <td data-label="Observações" style="font-size: 0.85rem; max-width: 150px; word-break: break-word;">${c.notes || '—'}</td>
        <td data-label="Gerado por">${c.createdBy || '—'}</td>
        <td data-label="Ações" style="text-align: right; white-space: nowrap;">
          <button class="btn btn--sm btn--ghost btn-print-row-cracha" data-id="${c.id}" title="Imprimir Crachá"
            style="color: #6366f1; padding: 4px 8px; font-size: 0.9rem; margin-right: 2px;">
            🖨️
          </button>
          <button class="btn btn--sm btn--ghost btn-share-row-cracha" data-id="${c.id}" title="Compartilhar Crachá"
            style="color: #10b981; padding: 4px 8px; font-size: 0.9rem; margin-right: 2px;">
            📲
          </button>
          <button class="btn btn--sm btn--ghost btn-download-row-cracha" data-id="${c.id}" title="Baixar Imagem"
            style="color: #38bdf8; padding: 4px 8px; font-size: 0.9rem; margin-right: 2px;">
            📥
          </button>
          <button class="btn btn--sm btn--ghost btn-delete-cracha" data-id="${c.id}" title="Excluir"
            style="color: #ef4444; padding: 4px 8px; font-size: 0.9rem;">
            🗑️
          </button>
        </td>
      </tr>
    `).join('');

    // Atualiza barra de ações em lote
    const updateBatchBar = () => {
      const selected = Array.from(tbody.querySelectorAll('.select-cracha-row:checked')).map(cb => parseInt(cb.value));
      if (batchBar && batchCount) {
        if (selected.length > 0) {
          batchCount.textContent = `${selected.length} crachá${selected.length > 1 ? 's' : ''} selecionado${selected.length > 1 ? 's' : ''}`;
          batchBar.style.display = 'flex';
        } else {
          batchBar.style.display = 'none';
        }
      }
    };

    // Bind Select All
    selectAllCb?.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      tbody.querySelectorAll('.select-cracha-row').forEach(cb => {
        cb.checked = isChecked;
      });
      updateBatchBar();
    });

    tbody.querySelectorAll('.select-cracha-row').forEach(cb => {
      cb.addEventListener('change', updateBatchBar);
    });

    // Botão Compartilhar Selecionados
    container.querySelector('#btn-batch-share-crachas')?.addEventListener('click', () => {
      const selectedIds = Array.from(tbody.querySelectorAll('.select-cracha-row:checked')).map(cb => parseInt(cb.value));
      const selectedItems = (window.BrigadaData.crachas || []).filter(c => selectedIds.includes(c.id));
      if (!selectedItems.length) return;
      this.shareMultipleCrachas(selectedItems);
    });

    // Botão Imprimir Selecionados
    container.querySelector('#btn-batch-print-crachas')?.addEventListener('click', () => {
      const selectedIds = Array.from(tbody.querySelectorAll('.select-cracha-row:checked')).map(cb => parseInt(cb.value));
      const selectedItems = (window.BrigadaData.crachas || []).filter(c => selectedIds.includes(c.id));
      if (!selectedItems.length) return;
      this.printMultipleCrachas(selectedItems);
    });

    // Botão Excluir Selecionados
    container.querySelector('#btn-batch-delete-crachas')?.addEventListener('click', async () => {
      const selectedIds = Array.from(tbody.querySelectorAll('.select-cracha-row:checked')).map(cb => parseInt(cb.value));
      if (!selectedIds.length) return;
      if (confirm(`Tem certeza que deseja excluir os ${selectedIds.length} crachás selecionados?`)) {
        for (const id of selectedIds) {
          await window.BrigadaData.deleteCracha(id);
        }
        this.renderHistory(container);
      }
    });

    // Bind botões individuais da tabela
    tbody.querySelectorAll('.btn-print-row-cracha').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const item = (window.BrigadaData.crachas || []).find(c => c.id === id);
        if (item) this.printCracha(item);
      });
    });

    tbody.querySelectorAll('.btn-share-row-cracha').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const item = (window.BrigadaData.crachas || []).find(c => c.id === id);
        if (item) this.shareCracha(item);
      });
    });

    tbody.querySelectorAll('.btn-download-row-cracha').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const item = (window.BrigadaData.crachas || []).find(c => c.id === id);
        if (item) this.downloadCrachaImage(item);
      });
    });

    tbody.querySelectorAll('.btn-delete-cracha').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = parseInt(btn.dataset.id);
        if (!confirm('Deseja excluir este crachá?')) return;
        try {
          await window.BrigadaData.deleteCracha(id);
          this.renderHistory(container);
        } catch (err) {
          console.error('Erro ao excluir crachá:', err);
          alert('Erro ao excluir: ' + err.message);
        }
      });
    });
  },

  shareMultipleCrachas(items) {
    if (!items || !items.length) return;
    const doc = this.generateCrachasPDF(items);
    if (doc) {
      window.BrigadaUI.shareDocPDF(doc, `crachas_lote_${items.length}.pdf`, `Lote de Crachás (${items.length} itens)`);
    } else {
      this.printMultipleCrachas(items);
    }
  },

  printMultipleCrachas(items) {
    if (!items || !items.length) return;
    const doc = this.generateCrachasPDF(items);
    if (doc) {
      doc.autoPrint();
      window.open(doc.output('bloburl'), '_blank');
      return;
    }
  }
};


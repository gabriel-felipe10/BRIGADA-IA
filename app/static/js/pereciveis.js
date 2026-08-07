/**
 * BRIGADA-IA — Perecíveis Module (Completamente equivalente ao módulo de Açougue)
 */

window.BrigadaPereciveis = {
  currentFilter: 'all',
  currentSearch: '',
  editingId: null,
  originalQuantity: 0,

  render(container) {
    container.innerHTML = this.buildHTML();
    this.bindEvents(container);
    this.renderTable(container);
  },

  buildHTML() {
    const canAddProduct = window.BrigadaAuth.canAddProduct();
    const isSuperAdmin = window.BrigadaAuth.isSuperAdmin();
    return `
      <div class="panel-header">
        <div class="panel-header__left">
          <h2 class="panel-title">🍎 Gestão de Perecíveis</h2>
          <p class="panel-subtitle">Controle completo do estoque de perecíveis por categoria</p>
        </div>
        <div class="glass-actions-card" style="display:flex; gap:var(--sp-sm); flex-wrap:wrap; align-items:center;">
          ${isSuperAdmin ? `
          <button class="btn btn--primary" id="btn-import-csv-pereciveis" title="Importar produtos via CSV">
            <span>📥</span> Importar
          </button>
          ` : ''}
          <button class="btn btn--primary" id="btn-request-reduction-pereciveis" title="Mover selecionados para Aguardando Rebaixa">
            <span>📉</span> Rebaixar
          </button>
          <button class="btn btn--primary" id="btn-export-excel-pereciveis" title="Exportar para Excel">
            <span>📗</span> Excel
          </button>
          <button class="btn btn--primary" id="btn-export-pdf-pereciveis" title="Exportar para PDF">
            <span>📄</span> PDF
          </button>
          ${canAddProduct ? `
          <button class="btn btn--primary" id="btn-add-product-pereciveis">
            <span>＋</span> Novo Produto
          </button>
          ` : ''}
        </div>
      </div>

      <!-- Hidden file input for CSV import -->
      <input type="file" id="import-file-input-pereciveis" accept=".csv" style="display:none;">

      <div class="glass-panel" style="padding: 1.5rem; margin-top: 1rem;">
        <div class="category-tabs" id="category-tabs-pereciveis">
          <button class="cat-tab cat-tab--active" data-cat="all">🏪 Todos</button>
          <button class="cat-tab" data-cat="iogurtes">🍦 Iogurtes</button>
          <button class="cat-tab" data-cat="laticinios">🧀 Laticínios</button>
          <button class="cat-tab" data-cat="frios">🥓 Frios</button>
          <button class="cat-tab" data-cat="pereciveis">🍎 Perecíveis</button>
        </div>

        <div class="toolbar">
          <div class="search-box" style="display: flex; gap: 0.5rem; flex: 1;">
            <div style="position: relative; flex: 1; display: flex; align-items: center;">
              <span class="search-icon" style="position: absolute; left: 1rem;">🔍</span>
              <input type="text" id="search-products-pereciveis" class="search-input" placeholder="Buscar por nome, PLU ou código..." style="width: 100%; padding-left: 2.5rem;">
            </div>
            <button id="btn-scan-products-pereciveis" class="btn btn--outline" style="padding: 0 1rem;" title="Escanear Código">📷</button>
          </div>
          <div class="toolbar-right">
            <select id="filter-status-pereciveis" class="select-control">
              <option value="all">Todos os status</option>
              <option value="ok">✅ OK</option>
              <option value="warning">⚠️ Atenção</option>
              <option value="today">🟠 Vence Hoje</option>
              <option value="expired">🔴 Vencido</option>
              <option value="rebaixa">📉 Aguardando Rebaixa</option>
              <option value="tratado">✔️ Tratado com Sucesso</option>
            </select>
          </div>
        </div>

        <div class="table-wrapper" id="products-table-wrapper-pereciveis">
          <!-- tabela renderizada dinamicamente -->
        </div>
      </div>

      <!-- Modal de produto -->
      <div class="modal-overlay" id="product-modal-pereciveis" style="display:none;">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title" id="modal-title-pereciveis">Novo Produto Perecível</h3>
            <button class="modal-close" id="modal-close-pereciveis">✕</button>
          </div>
          <div class="modal-body">
            <form id="product-form-pereciveis">
              <input type="hidden" id="field-id-pereciveis">
              <div class="form-row">
                <div class="form-group" style="position: relative;">
                  <label class="form-label">PLU *</label>
                  <input type="text" id="field-plu-pereciveis" class="form-input" placeholder="ex: PE001" autocomplete="off" required>
                  <div id="plu-suggestions-pereciveis" class="autocomplete-suggestions"></div>
                </div>
                <div class="form-group">
                  <label class="form-label">Categoria *</label>
                  <select id="field-category-pereciveis" class="form-input" required>
                    <option value="">Selecione...</option>
                    <option value="iogurtes">🍦 Iogurtes</option>
                    <option value="laticinios">🧀 Laticínios</option>
                    <option value="frios">🥓 Frios</option>
                    <option value="pereciveis">🍎 Perecíveis</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group" style="position: relative;">
                  <label class="form-label">Nome do Produto *</label>
                  <input type="text" id="field-name-pereciveis" class="form-input" placeholder="Nome do produto" autocomplete="off" required>
                  <div id="name-suggestions-pereciveis" class="autocomplete-suggestions"></div>
                </div>
                <div class="form-group">
                  <label class="form-label">Cód. Barras (Fábrica)</label>
                  <div style="display: flex; gap: 0.5rem;">
                    <input type="text" id="field-barcode-pereciveis" class="form-input" placeholder="Opcional">
                    <button type="button" id="btn-scan-form-pereciveis" class="btn btn--outline" style="padding: 0 0.8rem;" title="Escanear">📷</button>
                  </div>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Data de Cadastro</label>
                  <input type="date" id="field-startDate-pereciveis" class="form-input">
                </div>
                <div class="form-group">
                  <label class="form-label">Data Final (Validade) *</label>
                  <input type="date" id="field-endDate-pereciveis" class="form-input" required>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Fornecedor</label>
                  <input type="text" id="field-supplier-pereciveis" class="form-input" placeholder="Nome do fornecedor">
                </div>
                <div class="form-group">
                  <label class="form-label">Localização *</label>
                  <select id="field-location-pereciveis" class="form-input" required>
                    <option value="">Selecione...</option>
                    <option value="resfriado">❄️ Resfriado</option>
                    <option value="congelado">🥶 Congelado</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Coluna</label>
                  <select id="field-column-pereciveis" class="form-input">
                    <option value="">Selecione...</option>
                    <option value="Aéreo">Aéreo</option>
                    <option value="Piso">Piso</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Número da Coluna</label>
                  <select id="field-column-number-pereciveis" class="form-input">
                    <option value="">Selecione...</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                    <option value="11">11</option>
                    <option value="12">12</option>
                    <option value="13">13</option>
                    <option value="14">14</option>
                    <option value="15">15</option>
                    <option value="16">16</option>
                    <option value="17">17</option>
                    <option value="18">18</option>
                    <option value="19">19</option>
                    <option value="20">20</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Quantidade</label>
                  <input type="number" id="field-quantity-pereciveis" class="form-input" placeholder="ex: 10" step="any" min="0">
                </div>
                <div class="form-group">
                  <label class="form-label">Unidade</label>
                  <select id="field-unit-pereciveis" class="form-input">
                    <option value="kg">kg</option>
                    <option value="un">un</option>
                  </select>
                </div>
              </div>
              <div class="form-row" id="annotation-info-banner-pereciveis" style="display: none; margin-top: 1rem; width: 100%;">
                <div style="background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 6px; padding: 8px 12px; width: 100%; display: flex; justify-content: space-between; font-size: 0.85rem; color: #f8fafc;">
                  <div><strong>Quantidade Anterior:</strong> <span id="info-original-quantity-pereciveis">0</span></div>
                  <div><strong>Data da Alteração:</strong> <span id="info-change-date-pereciveis">--/--/----</span></div>
                </div>
              </div>
              <div class="form-row" id="group-annotation-pereciveis" style="display: none; margin-top: 1rem; flex-direction: column; gap: 0.8rem;">
                <div class="form-group" style="width: 100%;">
                  <label class="form-label" style="color: #f8fafc; font-weight: 600;">O que aconteceu com o restante do produto? *</label>
                  <div class="annotation-buttons-container-pereciveis" style="display: flex; gap: 0.5rem; flex-wrap: wrap; width: 100%;">
                    <button type="button" class="btn btn--outline annotation-btn-pereciveis" data-value="quebra" style="flex: 1; min-width: 80px;">Quebra</button>
                    <button type="button" class="btn btn--outline annotation-btn-pereciveis" data-value="troca" style="flex: 1; min-width: 80px;">Troca</button>
                    <button type="button" class="btn btn--outline annotation-btn-pereciveis" data-value="rebaixa" style="flex: 1; min-width: 80px;">Rebaixa</button>
                    <button type="button" class="btn btn--outline annotation-btn-pereciveis" data-value="vendido" style="flex: 1; min-width: 80px;">Vendido</button>
                    <button type="button" class="btn btn--outline annotation-btn-pereciveis btn--danger-outline" data-value="excluir" style="flex: 1.2; min-width: 110px;">Excluir o item</button>
                  </div>
                  <input type="hidden" id="field-annotation-pereciveis" value="">
                </div>
                <div class="form-group" id="subgroup-annotation-text-pereciveis" style="display: none; width: 100%;">
                  <label class="form-label" style="color: #cbd5e1; font-size: 0.85rem; font-weight: 500;">Explicação/Detalhes *</label>
                  <input type="text" id="field-annotation-text-pereciveis" class="form-input" maxlength="100" placeholder="Descreva os detalhes (Máx. 100 caracteres)...">
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn--ghost" id="btn-cancel-modal-pereciveis">Cancelar</button>
            <button class="btn btn--primary" id="btn-save-product-pereciveis">Salvar Produto</button>
          </div>
        </div>
      </div>

      <!-- Modal de confirmação de exclusão -->
      <div class="modal-overlay" id="delete-modal-pereciveis" style="display:none;">
        <div class="modal modal--sm">
          <div class="modal-header">
            <h3 class="modal-title">⚠️ Confirmar Exclusão</h3>
            <button class="modal-close" id="delete-modal-close-pereciveis">✕</button>
          </div>
          <div class="modal-body">
            <p style="color:var(--text-secondary);">Tem certeza que deseja remover o produto <strong id="delete-product-name-pereciveis" style="color:var(--text-primary);"></strong>?</p>
            <p style="color:var(--error);font-size:0.85rem;margin-top:0.5rem;">Esta ação não pode ser desfeita.</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn--ghost" id="btn-cancel-delete-pereciveis">Cancelar</button>
            <button class="btn btn--danger" id="btn-confirm-delete-pereciveis">Excluir</button>
          </div>
        </div>
      </div>
    `;
  },

  getFilteredProducts() {
    let products = window.BrigadaData.products.filter(p => 
      p.category && ['iogurtes', 'laticinios', 'frios', 'pereciveis', 'perecíveis'].includes(p.category.toLowerCase())
    );

    if (this.currentFilter !== 'all') {
      products = products.filter(p => p.category && p.category.toLowerCase() === this.currentFilter.toLowerCase());
    }

    if (this.currentSearch) {
      const q = this.currentSearch.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.plu.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.toLowerCase().includes(q))
      );
    }

    const statusFilter = document.getElementById('filter-status-pereciveis')?.value || 'all';
    if (statusFilter !== 'all') {
      products = products.filter(p => {
        const s = window.BrigadaData.getProductStatus(p);
        if (statusFilter === 'rebaixa') return p.isAwaitingReduction === true;
        if (statusFilter === 'expired') return s.days < 0 && !p.expiredAction;
        if (statusFilter === 'today') return s.days === 0 && !p.expiredAction;
        if (statusFilter === 'warning') return s.days > 0 && s.days <= 3 && !p.expiredAction;
        if (statusFilter === 'ok') return s.days > 3 && !p.expiredAction;
        if (statusFilter === 'tratado') return p.expiredAction === 'tratado';
        return true;
      });
    }

    products.sort((a, b) => {
      const statusA = window.BrigadaData.getProductStatus(a);
      const statusB = window.BrigadaData.getProductStatus(b);
      return statusA.days - statusB.days;
    });

    return products;
  },

  renderTable(container) {
    const wrapper = container.querySelector('#products-table-wrapper-pereciveis');
    if (!wrapper) return;

    const products = this.getFilteredProducts();
    const catMap = { iogurtes: '🍦 Iogurtes', laticinios: '🧀 Laticínios', frios: '🥓 Frios', pereciveis: '🍎 Perecíveis', 'perecíveis': '🍎 Perecíveis' };

    if (products.length === 0) {
      wrapper.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">🍎</div>
          <p class="empty-state__text">Nenhum produto perecível encontrado</p>
        </div>`;
      return;
    }

    const showActions = products.some(p => window.BrigadaAuth.canEditProduct(p) || window.BrigadaAuth.canDeleteProduct(p));
    const rows = products.map(p => {
      const status = window.BrigadaData.getProductStatus(p);
      const baseStatus = window.BrigadaData.getProductStatus(p, true);
      const qty = p.quantity !== undefined ? p.quantity : 0;
      const unit = p.unit || 'kg';
      const canEditThis = window.BrigadaAuth.canEditProduct(p);
      const canDeleteThis = window.BrigadaAuth.canDeleteProduct(p);
      return `
        <tr data-id="${p.id}">
          <td style="text-align: center;"><input type="checkbox" class="select-product-checkbox" data-id="${p.id}" style="cursor:pointer; width:16px; height:16px;"></td>
          <td data-label="PLU"><span class="plu-badge">${p.plu}</span></td>
          <td data-label="Produto" class="product-name" onclick="window.BrigadaUI.showProductView('${p.id}')" style="cursor: pointer; text-decoration: underline; color: var(--primary);" title="Ver detalhes">${p.name}</td>
          <td data-label="Qtd"><strong style="color:var(--primary); font-size: 0.95rem;">${qty}</strong> <span style="font-size:0.75rem; color:var(--text-secondary);">${unit}</span></td>
          <td data-label="Categoria"><span class="cat-pill cat-pill--${p.category}">${catMap[p.category] || p.category}</span></td>
          <td data-label="Data de Cadastro">${window.BrigadaData.formatDate(p.startDate)}</td>
          <td data-label="Validade">${window.BrigadaData.formatDate(p.endDate)}</td>
          <td data-label="Fornecedor">
            <div>${p.supplier || '—'}</div>
            ${p.createdBy ? `<div style="font-size:0.7rem; color:#a78bfa; margin-top:2px; font-weight: 500;" title="${p.createdBy}">👤 ${window.BrigadaData.getUserNameByEmail(p.createdBy)}</div>` : ''}
          </td>
          <td data-label="Localização">
            ${window.BrigadaData.formatLocationFriendly(p)}
          </td>
        </tr>
        ${showActions ? `
        <tr class="actions-row">
          <td colspan="9" style="padding: 6px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.01);">
            <div class="actions-cell" style="display: flex; gap: 16px; align-items: center; justify-content: flex-start;">
              <span style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 600; margin-right: 8px;">Ações:</span>
              <span class="badge ${baseStatus.class}" style="font-size: 0.7rem; padding: 4px 10px;">${baseStatus.icon} ${baseStatus.label}</span>
              ${p.expiredAction && status ? `<span class="badge ${status.class}" style="font-size: 0.7rem; padding: 4px 10px;">${status.icon} ${status.label}</span>` : ''}
              ${p.isAwaitingReduction ? `<span class="badge" style="background:${p.rebaixaStatus === 'ok' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)'}; color:${p.rebaixaStatus === 'ok' ? '#34d399' : '#fbbf24'}; border:1px solid ${p.rebaixaStatus === 'ok' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}; font-size:0.7rem; padding: 4px 10px;">${p.rebaixaStatus === 'ok' ? '🟢 Rebaixa OK' : '🟡 Aguardando'}</span>` : ''}
              ${p.isAwaitingReduction && canEditThis ? `<button class="btn-icon" data-action="toggle-rebaixa" data-id="${p.id}" title="${p.rebaixaStatus === 'ok' ? 'Voltar para Aguardando' : 'Marcar Rebaixa OK'}">${p.rebaixaStatus === 'ok' ? '↩️' : '✅'}<span class="btn-label">${p.rebaixaStatus === 'ok' ? 'Voltar' : 'Rebaixa'}</span></button>` : ''}
              ${status.days <= 3 && canEditThis ? `
                ${p.expiredAction !== 'quebra' ? `<button class="btn-icon" data-action="set-quebra" data-id="${p.id}" title="Marcar como Quebra">🗑️<span class="btn-label">Quebra</span></button>` : ''}
                ${p.expiredAction !== 'troca' ? `<button class="btn-icon" data-action="set-troca" data-id="${p.id}" title="Marcar como Troca">🔄<span class="btn-label">Troca</span></button>` : ''}
                ${p.expiredAction !== 'tratado' ? `<button class="btn-icon" data-action="set-tratado" data-id="${p.id}" title="Tratado com Sucesso">✔️<span class="btn-label">Tratado</span></button>` : ''}
                ${p.expiredAction ? `<button class="btn-icon" data-action="clear-expired" data-id="${p.id}" title="Desfazer Ação">↩️<span class="btn-label">Desfazer</span></button>` : ''}
              ` : ''}
              ${canEditThis ? `<button class="btn-icon btn-icon--edit" data-action="edit" data-id="${p.id}" title="Editar">✏️<span class="btn-label">Editar</span></button>` : ''}
              ${canDeleteThis ? `<button class="btn-icon btn-icon--delete" data-action="delete" data-id="${p.id}" title="Excluir">🗑️<span class="btn-label">Excluir</span></button>` : ''}
            </div>
          </td>
        </tr>` : ''}`;
    }).join('');

    wrapper.innerHTML = `
      <div class="results-info">
        ${products.length} produto${products.length !== 1 ? 's' : ''} encontrado${products.length !== 1 ? 's' : ''}
      </div>
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;"><input type="checkbox" id="select-all-products-pereciveis" style="cursor:pointer; width:16px; height:16px;"></th>
              <th>PLU</th>
              <th>Produto</th>
              <th>Qtd</th>
              <th>Categoria</th>
              <th>Data de Cadastro</th>
              <th>Data Final</th>
              <th>Fornecedor</th>
              <th>Localização</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;

    // Bind select all checkbox
    const selectAllCb = container.querySelector('#select-all-products-pereciveis');
    selectAllCb?.addEventListener('change', (e) => {
      const checked = e.target.checked;
      container.querySelectorAll('.select-product-checkbox').forEach(cb => {
        cb.checked = checked;
      });
    });

    // Bind action buttons inside table
    wrapper.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const id = parseInt(btn.dataset.id);
        if (action === 'edit') this.openEditModal(id, container);
        if (action === 'delete') this.openDeleteModal(id, container);
        if (action === 'toggle-rebaixa') {
          const product = window.BrigadaData.products.find(x => x.id === id);
          const newStatus = product.rebaixaStatus === 'ok' ? 'aguardando' : 'ok';
          window.BrigadaData.setAwaitingReduction([id], true, newStatus).then(() => {
            this.renderTable(container);
          });
        }
        if (action === 'set-quebra') {
          window.BrigadaData.setExpiredAction(id, 'quebra').then(() => this.renderTable(container));
        }
        if (action === 'set-troca') {
          window.BrigadaData.setExpiredAction(id, 'troca').then(() => this.renderTable(container));
        }
        if (action === 'set-tratado') {
          window.BrigadaData.setExpiredAction(id, 'tratado').then(() => this.renderTable(container));
        }
        if (action === 'clear-expired') {
          window.BrigadaData.setExpiredAction(id, null).then(() => this.renderTable(container));
        }
      });
    });
  },

  bindEvents(container) {
    // Category tabs
    container.querySelectorAll('.cat-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        container.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('cat-tab--active'));
        tab.classList.add('cat-tab--active');
        this.currentFilter = tab.dataset.cat;
        this.renderTable(container);
      });
    });

    // Search
    const searchInput = container.querySelector('#search-products-pereciveis');
    searchInput?.addEventListener('input', (e) => {
      this.currentSearch = e.target.value;
      this.renderTable(container);
    });

    // Status filter
    const statusFilter = container.querySelector('#filter-status-pereciveis');
    statusFilter?.addEventListener('change', () => this.renderTable(container));

    // Scanner
    const scanBtn = container.querySelector('#btn-scan-products-pereciveis');
    scanBtn?.addEventListener('click', () => {
      window.BrigadaUI.openScanner((result) => {
        if (result.isScaleCode) {
          searchInput.value = result.plu;
        } else {
          searchInput.value = result.barcode;
        }
        this.currentSearch = searchInput.value;
        this.renderTable(container);
      });
    });

    const formScanBtn = container.querySelector('#btn-scan-form-pereciveis');
    formScanBtn?.addEventListener('click', () => {
      window.BrigadaUI.openScanner((result) => {
        const barcodeInput = container.querySelector('#field-barcode-pereciveis');
        if (barcodeInput) barcodeInput.value = result.barcode;
      });
    });

    // Add product button
    container.querySelector('#btn-add-product-pereciveis')?.addEventListener('click', () => {
      this.openAddModal(container);
    });

    // Export / Import / Rebaixar buttons
    container.querySelector('#btn-request-reduction-pereciveis')?.addEventListener('click', () => this.requestReduction(container));
    container.querySelector('#btn-export-excel-pereciveis')?.addEventListener('click', () => this.exportExcel());
    container.querySelector('#btn-export-pdf-pereciveis')?.addEventListener('click', () => this.exportPDF());
    container.querySelector('#btn-import-csv-pereciveis')?.addEventListener('click', () => {
      container.querySelector('#import-file-input-pereciveis')?.click();
    });
    container.querySelector('#import-file-input-pereciveis')?.addEventListener('change', (e) => {
      this.importCSV(e, container);
    });

    // Modal close
    container.querySelector('#modal-close-pereciveis')?.addEventListener('click', () => this.closeModal(container));
    container.querySelector('#btn-cancel-modal-pereciveis')?.addEventListener('click', () => this.closeModal(container));

    // Save product
    container.querySelector('#btn-save-product-pereciveis')?.addEventListener('click', () => this.saveProduct(container));

    // Delete modal
    container.querySelector('#delete-modal-close-pereciveis')?.addEventListener('click', () => this.closeDeleteModal(container));
    container.querySelector('#btn-cancel-delete-pereciveis')?.addEventListener('click', () => this.closeDeleteModal(container));
    container.querySelector('#btn-confirm-delete-pereciveis')?.addEventListener('click', () => this.confirmDelete(container));

    // Close modal on overlay click
    container.querySelector('#product-modal-pereciveis')?.addEventListener('click', (e) => {
      if (e.target.id === 'product-modal-pereciveis') this.closeModal(container);
    });
    container.querySelector('#delete-modal-pereciveis')?.addEventListener('click', (e) => {
      if (e.target.id === 'delete-modal-pereciveis') this.closeDeleteModal(container);
    });

    // Initialize Autocomplete (PLU e Nome)
    window.BrigadaUI.setupPluAutocomplete(container, '#field-plu-pereciveis', '#plu-suggestions-pereciveis', {
      name: '#field-name-pereciveis',
      category: '#field-category-pereciveis',
      barcode: '#field-barcode-pereciveis',
      unit: '#field-unit-pereciveis'
    }, ['iogurtes', 'laticinios', 'frios', 'pereciveis', 'perecíveis'], 'plu');

    window.BrigadaUI.setupPluAutocomplete(container, '#field-name-pereciveis', '#name-suggestions-pereciveis', {
      plu: '#field-plu-pereciveis',
      category: '#field-category-pereciveis',
      barcode: '#field-barcode-pereciveis',
      unit: '#field-unit-pereciveis'
    }, ['iogurtes', 'laticinios', 'frios', 'pereciveis', 'perecíveis'], 'name');

    // Listener para o campo de quantidade exibir/ocultar anotação
    const qtyInput = container.querySelector('#field-quantity-pereciveis');
    const annotationGroup = container.querySelector('#group-annotation-pereciveis');
    const annotationInput = container.querySelector('#field-annotation-pereciveis');
    const subGroup = container.querySelector('#subgroup-annotation-text-pereciveis');
    const subInput = container.querySelector('#field-annotation-text-pereciveis');
    
    qtyInput?.addEventListener('input', () => {
      if (this.editingId) {
        const newVal = parseFloat(qtyInput.value) || 0;
        const infoBanner = container.querySelector('#annotation-info-banner-pereciveis');
        if (newVal < this.originalQuantity) {
          annotationGroup.style.display = 'flex';
          annotationInput.required = true;
          if (infoBanner) {
            container.querySelector('#info-original-quantity-pereciveis').textContent = this.originalQuantity + ' ' + (container.querySelector('#field-unit-pereciveis').value || '');
            const today = new Date();
            const dd = String(today.getDate()).padStart(2, '0');
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const yyyy = today.getFullYear();
            container.querySelector('#info-change-date-pereciveis').textContent = dd + '/' + mm + '/' + yyyy;
            infoBanner.style.display = 'flex';
          }
        } else {
          annotationGroup.style.display = 'none';
          annotationInput.required = false;
          annotationInput.value = '';
          subGroup.style.display = 'none';
          subInput.required = false;
          subInput.value = '';
          if (infoBanner) infoBanner.style.display = 'none';
        }
      }
    });

    const annotationBtns = container.querySelectorAll('.annotation-btn-pereciveis');
    annotationBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        annotationBtns.forEach(b => {
          if (b.dataset.value === 'excluir') {
            b.classList.remove('btn--danger');
            b.classList.add('btn--outline', 'btn--danger-outline');
          } else {
            b.classList.remove('btn--primary');
            b.classList.add('btn--outline');
          }
        });
        if (btn.dataset.value === 'excluir') {
          btn.classList.remove('btn--outline', 'btn--danger-outline');
          btn.classList.add('btn--danger');
        } else {
          btn.classList.remove('btn--outline');
          btn.classList.add('btn--primary');
        }
        annotationInput.value = btn.dataset.value;
        subGroup.style.display = 'block';
        subInput.required = true;
      });
    });
  },

  openAddModal(container) {
    if (!window.BrigadaAuth.canAddProduct()) return;
    this.editingId = null;
    this.originalQuantity = 0;
    container.querySelector('#modal-title-pereciveis').textContent = 'Novo Produto Perecível';
    
    const form = container.querySelector('#product-form-pereciveis');
    form.reset();
    form.querySelectorAll('.form-input, select').forEach(el => {
      el.disabled = false;
      el.readOnly = false;
    });

    container.querySelector('#field-id-pereciveis').value = '';
    container.querySelector('#field-plu-pereciveis').value = '';
    container.querySelector('#field-barcode-pereciveis').value = '';
    container.querySelector('#field-startDate-pereciveis').value = '';
    container.querySelector('#field-quantity-pereciveis').value = '';
    container.querySelector('#field-column-pereciveis').value = '';
    container.querySelector('#field-column-number-pereciveis').value = '';
    
    // Reset annotation
    container.querySelector('#group-annotation-pereciveis').style.display = 'none';
    container.querySelector('#field-annotation-pereciveis').required = false;
    const infoBanner = container.querySelector('#annotation-info-banner-pereciveis');
    if (infoBanner) infoBanner.style.display = 'none';
    container.querySelectorAll('.annotation-btn-pereciveis').forEach(b => {
      if (b.dataset.value === 'excluir') {
        b.classList.remove('btn--danger');
        b.classList.add('btn--outline', 'btn--danger-outline');
      } else {
        b.classList.remove('btn--primary');
        b.classList.add('btn--outline');
      }
    });
    container.querySelector('#field-annotation-pereciveis').value = '';
    container.querySelector('#subgroup-annotation-text-pereciveis').style.display = 'none';
    container.querySelector('#field-annotation-text-pereciveis').required = false;
    container.querySelector('#field-annotation-text-pereciveis').value = '';

    this.showModal(container);
  },

  openEditModal(id, container) {
    const product = window.BrigadaData.products.find(p => p.id === id);
    if (!product || !window.BrigadaAuth.canEditProduct(product)) return;
    this.editingId = id;
    this.originalQuantity = product.quantity !== undefined ? product.quantity : 0;
    container.querySelector('#modal-title-pereciveis').textContent = 'Editar Produto Perecível';
    container.querySelector('#field-id-pereciveis').value = product.id;
    container.querySelector('#field-plu-pereciveis').value = product.plu;
    container.querySelector('#field-barcode-pereciveis').value = product.barcode || '';
    container.querySelector('#field-name-pereciveis').value = product.name;
    container.querySelector('#field-category-pereciveis').value = product.category;
    container.querySelector('#field-startDate-pereciveis').value = product.startDate || '';
    container.querySelector('#field-endDate-pereciveis').value = product.endDate;
    container.querySelector('#field-supplier-pereciveis').value = product.supplier || '';
    container.querySelector('#field-location-pereciveis').value = product.location || '';
    container.querySelector('#field-column-pereciveis').value = product.column || '';
    container.querySelector('#field-column-number-pereciveis').value = product.columnNumber || '';
    container.querySelector('#field-unit-pereciveis').value = product.unit || 'kg';
    container.querySelector('#field-quantity-pereciveis').value = product.quantity !== undefined ? product.quantity : '';
    
    // Reset annotation
    container.querySelector('#group-annotation-pereciveis').style.display = 'none';
    container.querySelector('#field-annotation-pereciveis').required = false;
    const infoBanner = container.querySelector('#annotation-info-banner-pereciveis');
    if (infoBanner) infoBanner.style.display = 'none';
    container.querySelectorAll('.annotation-btn-pereciveis').forEach(b => {
      if (b.dataset.value === 'excluir') {
        b.classList.remove('btn--danger');
        b.classList.add('btn--outline', 'btn--danger-outline');
      } else {
        b.classList.remove('btn--primary');
        b.classList.add('btn--outline');
      }
    });
    container.querySelector('#field-annotation-pereciveis').value = '';
    container.querySelector('#subgroup-annotation-text-pereciveis').style.display = 'none';
    container.querySelector('#field-annotation-text-pereciveis').required = false;
    container.querySelector('#field-annotation-text-pereciveis').value = '';

    // Disable all fields except quantity, annotation and sub-annotation details
    const form = container.querySelector('#product-form-pereciveis');
    form.querySelectorAll('.form-input, select, textarea').forEach(el => {
      if (el.id !== 'field-quantity-pereciveis' && el.id !== 'field-annotation-pereciveis' && el.id !== 'field-annotation-text-pereciveis') {
        el.disabled = true;
      } else {
        el.disabled = false;
      }
    });

    this.showModal(container);
  },

  showModal(container) {
    const modal = container.querySelector('#product-modal-pereciveis');
    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('modal-overlay--visible'));
  },

  closeModal(container) {
    const modal = container.querySelector('#product-modal-pereciveis');
    modal.classList.remove('modal-overlay--visible');
    setTimeout(() => modal.style.display = 'none', 250);
  },

  openDeleteModal(id, container) {
    const product = window.BrigadaData.products.find(p => p.id === id);
    if (!product || !window.BrigadaAuth.canDeleteProduct(product)) return;
    this.deletingId = id;
    container.querySelector('#delete-product-name-pereciveis').textContent = product.name;
    const modal = container.querySelector('#delete-modal-pereciveis');
    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('modal-overlay--visible'));
  },

  closeDeleteModal(container) {
    const modal = container.querySelector('#delete-modal-pereciveis');
    modal.classList.remove('modal-overlay--visible');
    setTimeout(() => modal.style.display = 'none', 250);
  },

  async saveProduct(container) {
    const isEditing = !!this.editingId;
    if (isEditing) {
      const product = window.BrigadaData.products.find(p => p.id === this.editingId);
      if (!product || !window.BrigadaAuth.canEditProduct(product)) {
        window.BrigadaUI.showToast('Permissão negada. Você não tem permissão para editar este produto.', 'error');
        return;
      }
    } else {
      if (!window.BrigadaAuth.canAddProduct()) {
        window.BrigadaUI.showToast('Permissão negada. Apenas Super Administradores e Usuários comuns podem adicionar produtos.', 'error');
        return;
      }
    }
    const plu = container.querySelector('#field-plu-pereciveis').value.trim();
    const barcode = container.querySelector('#field-barcode-pereciveis').value.trim();
    const name = container.querySelector('#field-name-pereciveis').value.trim();
    const category = container.querySelector('#field-category-pereciveis').value;
    const startDate = container.querySelector('#field-startDate-pereciveis').value;
    const endDate = container.querySelector('#field-endDate-pereciveis').value;
    const supplier = container.querySelector('#field-supplier-pereciveis').value.trim();
    const location = container.querySelector('#field-location-pereciveis').value;
    const unit = container.querySelector('#field-unit-pereciveis').value;
    const qtyVal = container.querySelector('#field-quantity-pereciveis').value;
    const quantity = qtyVal !== '' ? parseFloat(qtyVal) : 0;
    const column = container.querySelector('#field-column-pereciveis').value.trim() || null;
    const colNumVal = container.querySelector('#field-column-number-pereciveis').value;
    const columnNumber = colNumVal !== '' ? parseInt(colNumVal) : null;

    const selectVal = container.querySelector('#field-annotation-pereciveis').value;
    const textVal = container.querySelector('#field-annotation-text-pereciveis').value.trim();

    if (this.editingId && quantity < this.originalQuantity) {
      if (!selectVal) {
        window.BrigadaUI.showToast('Por favor, selecione o motivo da redução da quantidade.', 'error');
        return;
      }
      if (!textVal) {
        window.BrigadaUI.showToast('Por favor, digite os detalhes do motivo da redução.', 'error');
        return;
      }
    }

    const annotation = selectVal ? `${selectVal} - ${textVal}` : '';

    if (!plu || !name || !category || !endDate || !location) {
      window.BrigadaUI.showToast('Preencha todos os campos obrigatórios (incluindo Localização).', 'error');
      return;
    }

    if (startDate && endDate < startDate) {
      window.BrigadaUI.showToast('A data final não pode ser anterior à data de cadastro.', 'error');
      return;
    }

    // Validação local de PLU duplicado com a mesma data de validade
    const duplicate = window.BrigadaData.products.find(
      p => p.plu.trim().toLowerCase() === plu.toLowerCase() && p.endDate === endDate && p.id !== this.editingId
    );
    if (duplicate) {
      window.BrigadaUI.showToast(`Não é permitido cadastrar o mesmo PLU com a mesma data de validade. O PLU "${plu}" com vencimento em ${endDate} já existe.`, 'error');
      return;
    }

    const product = window.BrigadaData.products.find(p => p.id === this.editingId);
    const creator = (this.editingId && product && product.createdBy) ? product.createdBy : 'Jefferson';
    const editor = window.BrigadaAuth.currentUser?.name || window.BrigadaAuth.currentUser?.email || 'Sistema';

    if (selectVal === 'excluir') {
      try {
        await window.BrigadaData.deleteProduct(this.editingId, { annotation, creator, editor });
        window.BrigadaUI.showToast('Produto excluído com sucesso!', 'success');
        this.closeModal(container);
        this.renderTable(container);
      } catch (err) {
        window.BrigadaUI.showToast(err.message || 'Erro ao excluir o produto.', 'error');
      }
      return;
    }

    const payload = { plu, barcode, name, category, startDate, endDate, supplier, location, unit, quantity, column, columnNumber, annotation, creator, editor };

    try {
      if (this.editingId) {
        await window.BrigadaData.updateProduct(this.editingId, payload);
        window.BrigadaUI.showToast('Produto atualizado com sucesso!', 'success');
      } else {
        await window.BrigadaData.addProduct(payload);
        window.BrigadaUI.showToast('Produto cadastrado com sucesso!', 'success');
      }
      this.closeModal(container);
      this.renderTable(container);
    } catch (err) {
      window.BrigadaUI.showToast(err.message || 'Erro ao salvar o produto.', 'error');
    }
  },

  async confirmDelete(container) {
    const product = window.BrigadaData.products.find(p => p.id === this.deletingId);
    if (!product || !window.BrigadaAuth.canDeleteProduct(product)) {
      window.BrigadaUI.showToast('Permissão negada. Apenas Super Administradores podem excluir produtos.', 'error');
      return;
    }
    await window.BrigadaData.deleteProduct(this.deletingId);
    window.BrigadaUI.showToast('Produto removido.', 'success');
    this.closeDeleteModal(container);
    this.renderTable(container);
  },

  // ── Solicitar Rebaixa ──────────────────────────────────────────────────────
  requestReduction(container) {
    const checkboxes = container.querySelectorAll('.select-product-checkbox:checked');
    const ids = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
    if (ids.length === 0) {
      window.BrigadaUI.showToast('Selecione pelo menos um produto para solicitar rebaixa.', 'error');
      return;
    }
    window.BrigadaData.setAwaitingReduction(ids, true);
    window.BrigadaUI.showToast(`${ids.length} produto(s) movido(s) para Aguardando Rebaixa!`, 'success');
    
    const selectAll = container.querySelector('#select-all-products-pereciveis');
    if (selectAll) selectAll.checked = false;
    this.renderTable(container);
  },

  // ── Export Excel (CSV com BOM UTF-8) ──────────────────────────────────────
  exportExcel() {
    const checkboxes = document.querySelectorAll('.select-product-checkbox:checked');
    const ids = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
    let products = this.getFilteredProducts();
    if (ids.length > 0) {
      products = products.filter(p => ids.includes(p.id));
    }
    if (products.length === 0) {
      window.BrigadaUI.showToast('Nenhum produto selecionado ou filtrado para exportar.', 'error');
      return;
    }

    const catMap = { iogurtes: 'Iogurtes', laticinios: 'Laticínios', frios: 'Frios', pereciveis: 'Perecíveis', 'perecíveis': 'Perecíveis' };
    const header = ['PLU', 'Produto', 'Quantidade', 'Unidade', 'Categoria', 'Data de Cadastro', 'Validade', 'Status', 'Fornecedor', 'Localização'];

    const rows = products.map(p => {
      const s = window.BrigadaData.getProductStatus(p);
      return [
        p.plu,
        p.name,
        p.quantity !== undefined ? p.quantity : 0,
        p.unit || 'kg',
        catMap[p.category] || p.category,
        p.startDate || '',
        p.endDate,
        s.label,
        p.supplier || '',
        window.BrigadaData.formatLocationFriendly(p)
      ];
    });

    const csvContent = [header, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
      .join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `produtos_pereciveis_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    window.BrigadaUI.showToast(`${products.length} produtos exportados para Excel!`, 'success');
  },

  // ── Export PDF ────────────────────────────────────────────────────────────
  exportPDF() {
    const checkboxes = document.querySelectorAll('.select-product-checkbox:checked');
    const ids = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
    let products = this.getFilteredProducts();
    if (ids.length > 0) {
      products = products.filter(p => ids.includes(p.id));
    }
    if (products.length === 0) {
      window.BrigadaUI.showToast('Nenhum produto selecionado ou filtrado para exportar.', 'error');
      return;
    }

    const catMap = { iogurtes: 'Iogurtes', laticinios: 'Laticínios', frios: 'Frios', pereciveis: 'Perecíveis', 'perecíveis': 'Perecíveis' };
    const now = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const stats = {
      total: products.length,
      ok: 0,
      expiresSoon: 0,
      expired: 0
    };

    const rows = products.map(p => {
      const s = window.BrigadaData.getProductStatus(p);
      const statusColor = s.days < 0 ? '#ef4444' : s.days === 0 ? '#f97316' : s.days <= 3 ? '#f59e0b' : '#22c55e';
      
      if (s.days < 0) stats.expired++;
      else if (s.days <= 3) stats.expiresSoon++;
      else stats.ok++;

      return `
        <tr>
          <td style="font-family:monospace;color:#6366f1;font-weight:600;">${p.plu}</td>
          <td>${p.name}</td>
          <td>${p.quantity || 0} ${p.unit || 'kg'}</td>
          <td>${catMap[p.category] || p.category}</td>
          <td>${window.BrigadaData.formatDate ? window.BrigadaData.formatDate(p.endDate) : p.endDate}</td>
          <td><span style="color:${statusColor}">${s.label || s.text || ''}</span></td>
          <td>${p.location || '—'}</td>
        </tr>
      `;
    }).join('');

    const printContent = `
      <div class="print-container">
        <style>
          .print-container { font-family: 'Segoe UI', Arial, sans-serif; color:#1e293b; padding:24px; font-size:11px; background:#ffffff; }
          .print-container .header { text-align:center; margin-bottom:20px; padding-bottom:16px; border-bottom:2px solid #6366f1; }
          .print-container .header h1 { font-size:20px; color:#6366f1; margin-bottom:4px; }
          .print-container .header p { color:#64748b; font-size:12px; }
          .print-container .summary { display:flex; gap:12px; margin-bottom:16px; justify-content:center; flex-wrap:wrap; }
          .print-container .summary-item { background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:8px 16px; text-align:center; }
          .print-container .summary-item .num { font-size:18px; font-weight:800; }
          .print-container .summary-item .label { font-size:9px; color:#64748b; text-transform:uppercase; letter-spacing:0.05em; }
          .print-container .num-total { color:#6366f1; }
          .print-container .num-ok { color:#22c55e; }
          .print-container .num-warn { color:#f59e0b; }
          .print-container .num-exp { color:#ef4444; }
          .print-container table { width:100%; border-collapse:collapse; margin-top:8px; }
          .print-container th { background:#6366f1; color:#fff; padding:8px 6px; text-align:left; font-size:10px; text-transform:uppercase; letter-spacing:0.05em; }
          .print-container td { padding:6px; border-bottom:1px solid #e2e8f0; font-size:11px; color:#1e293b; }
          .print-container tr:nth-child(even) td { background:#f8fafc; }
          .print-container .footer { margin-top:20px; text-align:center; color:#94a3b8; font-size:9px; border-top:1px solid #e2e8f0; padding-top:12px; }
        </style>
        <div class="header">
          <h1>🛡️ BRIGADA-IA — Relatório de Produtos</h1>
          <p>Gerado em ${now} · Setor de Perecíveis</p>
        </div>
        <div class="summary">
          <div class="summary-item"><div class="num num-total">${stats.total}</div><div class="label">Total</div></div>
          <div class="summary-item"><div class="num num-ok">${stats.ok}</div><div class="label">OK</div></div>
          <div class="summary-item"><div class="num num-warn">${stats.expiresSoon}</div><div class="label">Atenção</div></div>
          <div class="summary-item"><div class="num num-exp">${stats.expired}</div><div class="label">Vencidos</div></div>
        </div>
        <table>
          <thead>
            <tr><th>PLU</th><th>Produto</th><th>Qtd</th><th>Categoria</th><th>Validade</th><th>Status</th><th>Local</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="footer">BRIGADA-IA v1.0 · Brigada de Validade · ${products.length} produtos listados</div>
      </div>`;

    window.BrigadaUI.printContent(printContent);
    window.BrigadaUI.showToast('Visualização de impressão aberta! Use "Salvar como PDF" se desejar.', 'success');
  },

  // ── Import CSV ────────────────────────────────────────────────────────────
  async importCSV(event, container) {
    const file = event.target.files[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(l => l.trim());

    if (lines.length < 2) {
      window.BrigadaUI.showToast('Arquivo CSV vazio ou sem dados.', 'error');
      event.target.value = '';
      return;
    }

    const sep = lines[0].includes(';') ? ';' : ',';
    const parseRow = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
          else { inQuotes = !inQuotes; }
        } else if (ch === sep && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += ch;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseRow(lines[0]).map(h => h.toLowerCase().replace(/[^a-záéíóúãõâêôç]/g, ''));

    const findCol = (...names) => headers.findIndex(h => names.some(n => h.includes(n)));
    const colPlu = findCol('plu', 'codigo', 'cdigo');
    const colName = findCol('produto', 'nome', 'name');
    const colCategory = findCol('categoria', 'category');
    const colEndDate = findCol('validade', 'datafinal', 'enddate', 'vencimento');
    const colStartDate = findCol('datainicial', 'startdate', 'inicio');
    const colSupplier = findCol('fornecedor', 'supplier');
    const colLocation = findCol('localizao', 'localizacao', 'location', 'local');
    const colQty = findCol('quantidade', 'qtd', 'qty', 'quantity');
    const colUnit = findCol('unidade', 'unit');

    if (colPlu === -1 || colName === -1 || colEndDate === -1) {
      window.BrigadaUI.showToast('CSV deve ter colunas: PLU, Produto/Nome e Validade/DataFinal.', 'error');
      event.target.value = '';
      return;
    }

    const catMap = { 
      iogurtes: 'iogurtes', 
      laticinios: 'laticinios', 
      frios: 'frios', 
      pereciveis: 'pereciveis', 
      perecveis: 'pereciveis',
      perecíveis: 'pereciveis'
    };
    let imported = 0;
    let skipped = 0;

    for (let i = 1; i < lines.length; i++) {
      const cols = parseRow(lines[i]);
      const plu = cols[colPlu] || '';
      const name = cols[colName] || '';
      const endDate = cols[colEndDate] || '';

      if (!plu || !name || !endDate) { skipped++; continue; }

      if (window.BrigadaData.products.find(p => p.plu.trim().toLowerCase() === plu.toLowerCase() && p.endDate === endDate)) {
        skipped++;
        continue;
      }

      const rawCat = colCategory !== -1 ? (cols[colCategory] || '').toLowerCase().replace(/[^a-z]/g, '') : '';
      const category = catMap[rawCat] || 'pereciveis';

      const rawLoc = colLocation !== -1 ? (cols[colLocation] || '').toLowerCase() : '';
      let location = 'resfriado';
      if (rawLoc.includes('congelado')) {
        location = 'congelado';
      }

      const payload = {
        plu,
        name,
        category,
        endDate,
        startDate: colStartDate !== -1 ? (cols[colStartDate] || '') : '',
        supplier: colSupplier !== -1 ? (cols[colSupplier] || '') : '',
        location,
        quantity: colQty !== -1 ? (parseFloat(cols[colQty]) || 0) : 0,
        unit: colUnit !== -1 ? (cols[colUnit] || 'kg') : 'kg',
      };

      try {
        await window.BrigadaData.addProduct(payload);
        imported++;
      } catch {
        skipped++;
      }
    }

    event.target.value = '';
    this.renderTable(container);
    window.BrigadaUI.showToast(`Importação concluída: ${imported} adicionados, ${skipped} ignorados.`, imported > 0 ? 'success' : 'error');
  },
};

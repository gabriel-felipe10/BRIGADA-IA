/**
 * BRIGADA-IA — Perecíveis Module
 */

window.BrigadaPereciveis = {
  currentFilter: 'all',
  currentSearch: '',
  editingId: null,

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
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input type="text" id="search-products-pereciveis" class="search-input" placeholder="Buscar por nome, PLU ou código de balança...">
          </div>
          <div class="toolbar-right">
            <select id="filter-status-pereciveis" class="select-control">
              <option value="all">Todos os status</option>
              <option value="ok">✅ OK</option>
              <option value="warning">⚠️ Atenção</option>
              <option value="today">🟠 Vence Hoje</option>
              <option value="expired">🔴 Vencido</option>
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
              <div class="form-group" style="position: relative;">
                <label class="form-label">Nome do Produto *</label>
                <input type="text" id="field-name-pereciveis" class="form-input" placeholder="Nome do produto" autocomplete="off" required>
                <div id="name-suggestions-pereciveis" class="autocomplete-suggestions"></div>
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
                    <option value="cx">cx</option>
                  </select>
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
        p.plu.toLowerCase().includes(q)
      );
    }

    const statusFilter = document.getElementById('filter-status-pereciveis')?.value || 'all';
    if (statusFilter !== 'all') {
      products = products.filter(p => {
        const s = window.BrigadaData.getProductStatus(p);
        if (statusFilter === 'expired') return s.days < 0 && !p.expiredAction;
        if (statusFilter === 'today') return s.days === 0 && !p.expiredAction;
        if (statusFilter === 'warning') return s.days > 0 && s.days <= 3 && !p.expiredAction;
        if (statusFilter === 'ok') return s.days > 3 && !p.expiredAction;
        if (statusFilter === 'tratado') return p.expiredAction === 'tratado';
        return true;
      });
    }

    // Sort products by urgency (days remaining) ascending
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
    const catMap = { iogurtes: '🍦 Iogurtes', laticinios: '🧀 Laticínios', frios: '🥓 Frios', pereciveis: '🍎 Perecíveis', perecíveis: '🍎 Perecíveis' };
    const locMap = { 
      gondola_fria: '❄️ Gôndola Fria', 
      expositor: '🍎 Expositor', 
      camara_fria: '🥶 Câmara Fria', 
      camara_resfriada: '❄️ Câmara (Resfriados)', 
      camara_congelada: '🥶 Câmara (Congelados)', 
      prateleira: '📦 Prateleira' 
    };

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
          <td data-label="Status"><span class="badge ${status.class}">${status.icon} ${status.label}</span></td>
          <td data-label="Fornecedor">
            <div>${p.supplier || '—'}</div>
            ${p.createdBy ? `<div style="font-size:0.7rem; color:#a78bfa; margin-top:2px; font-weight: 500;" title="${p.createdBy}">👤 ${window.BrigadaData.getUserNameByEmail(p.createdBy)}</div>` : ''}
          </td>
          <td data-label="Localização">
            ${window.BrigadaData.formatLocationFriendly(p)}
          </td>
          ${showActions ? `
          <td data-label="Ações" class="actions-cell">
            ${status.days <= 3 && canEditThis ? `
              ${p.expiredAction !== 'quebra' ? `<button class="btn-icon" data-action="set-quebra" data-id="${p.id}" title="Marcar como Quebra">🗑️<span class="btn-label">Quebra</span></button>` : ''}
              ${p.expiredAction !== 'troca' ? `<button class="btn-icon" data-action="set-troca" data-id="${p.id}" title="Marcar como Troca">🔄<span class="btn-label">Troca</span></button>` : ''}
              ${p.expiredAction !== 'tratado' ? `<button class="btn-icon" data-action="set-tratado" data-id="${p.id}" title="Tratado com Sucesso">✔️<span class="btn-label">Tratado</span></button>` : ''}
              ${p.expiredAction ? `<button class="btn-icon" data-action="clear-expired" data-id="${p.id}" title="Desfazer Ação">↩️<span class="btn-label">Desfazer</span></button>` : ''}
            ` : ''}
            ${canEditThis ? `<button class="btn-icon btn-icon--edit" data-action="edit" data-id="${p.id}" title="Editar">✏️<span class="btn-label">Editar</span></button>` : ''}
            ${canDeleteThis ? `<button class="btn-icon btn-icon--delete" data-action="delete" data-id="${p.id}" title="Excluir">🗑️<span class="btn-label">Excluir</span></button>` : ''}
          </td>` : ''}
        </tr>`;
    }).join('');

    wrapper.innerHTML = `
      <div class="results-info">
        ${products.length} produto${products.length !== 1 ? 's' : ''} encontrado${products.length !== 1 ? 's' : ''}
      </div>
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;"><input type="checkbox" id="select-all-products" style="cursor:pointer; width:16px; height:16px;"></th>
              <th>PLU</th>
              <th>Nome do Produto</th>
              <th>Qtd</th>
              <th>Categoria</th>
              <th>Data Fab.</th>
              <th>Vencimento</th>
              <th>Status</th>
              <th>Fornecedor</th>
              <th>Localização</th>
              ${showActions ? '<th>Ações</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;

    // Bind select all checkbox
    const selectAllCb = container.querySelector('#select-all-products');
    selectAllCb?.addEventListener('change', (e) => {
      const checked = e.target.checked;
      container.querySelectorAll('.select-product-checkbox').forEach(cb => {
        cb.checked = checked;
      });
    });
  },

  bindEvents(container) {
    // Category Tabs
    const tabs = container.querySelectorAll('#category-tabs-pereciveis .cat-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('cat-tab--active'));
        tab.classList.add('cat-tab--active');
        this.currentFilter = tab.dataset.cat;
        this.renderTable(container);
      });
    });

    // Search Input
    const searchInput = container.querySelector('#search-products-pereciveis');
    searchInput?.addEventListener('input', (e) => {
      this.currentSearch = e.target.value.trim();
      this.renderTable(container);
    });

    // Status Filter
    const statusFilter = container.querySelector('#filter-status-pereciveis');
    statusFilter?.addEventListener('change', () => {
      this.renderTable(container);
    });

    // Add Product Modal
    const btnAdd = container.querySelector('#btn-add-product-pereciveis');
    btnAdd?.addEventListener('click', () => this.openModal(container));

    // Modal Action Buttons
    const btnCancel = container.querySelector('#btn-cancel-modal-pereciveis');
    btnCancel?.addEventListener('click', () => this.closeModal(container));
    const btnClose = container.querySelector('#modal-close-pereciveis');
    btnClose?.addEventListener('click', () => this.closeModal(container));

    const btnSave = container.querySelector('#btn-save-product-pereciveis');
    btnSave?.addEventListener('click', () => this.saveProduct(container));

    // Table Actions (Edit / Delete)
    const tableWrapper = container.querySelector('#products-table-wrapper-pereciveis');
    tableWrapper?.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;

      const action = btn.dataset.action;
      const id = parseInt(btn.dataset.id, 10);

      if (action === 'edit') {
        this.openModal(container, id);
      } else if (action === 'delete') {
        this.openDeleteModal(container, id);
      } else if (action === 'set-quebra') {
        window.BrigadaData.setExpiredAction(id, 'quebra').then(() => this.renderTable(container));
      } else if (action === 'set-troca') {
        window.BrigadaData.setExpiredAction(id, 'troca').then(() => this.renderTable(container));
      } else if (action === 'set-tratado') {
        window.BrigadaData.setExpiredAction(id, 'tratado').then(() => this.renderTable(container));
      } else if (action === 'clear-expired') {
        window.BrigadaData.setExpiredAction(id, null).then(() => this.renderTable(container));
      }
    });

    // CSV Import
    const btnImport = container.querySelector('#btn-import-csv-pereciveis');
    const fileInput = container.querySelector('#import-file-input-pereciveis');
    btnImport?.addEventListener('click', () => fileInput.click());
    fileInput?.addEventListener('change', (e) => this.handleCSVImport(e, container));

    // Excel Export
    const btnExcel = container.querySelector('#btn-export-excel-pereciveis');
    btnExcel?.addEventListener('click', () => this.exportExcel());

    // PDF Export
    const btnPdf = container.querySelector('#btn-export-pdf-pereciveis');
    btnPdf?.addEventListener('click', () => this.exportPDF());

    // Auto-complete inteligente do Catalogo (PLU e Nome)
    window.BrigadaUI.setupPluAutocomplete(container, '#field-plu-pereciveis', '#plu-suggestions-pereciveis', {
      name: '#field-name-pereciveis',
      category: '#field-category-pereciveis',
      unit: '#field-unit-pereciveis'
    }, ['iogurtes', 'laticinios', 'frios', 'pereciveis', 'perecíveis'], 'plu');

    window.BrigadaUI.setupPluAutocomplete(container, '#field-name-pereciveis', '#name-suggestions-pereciveis', {
      plu: '#field-plu-pereciveis',
      category: '#field-category-pereciveis',
      unit: '#field-unit-pereciveis'
    }, ['iogurtes', 'laticinios', 'frios', 'pereciveis', 'perecíveis'], 'name');
  },

  openModal(container, id = null) {
    this.editingId = id;
    const modal = container.querySelector('#product-modal-pereciveis');
    const title = container.querySelector('#modal-title-pereciveis');
    const form = container.querySelector('#product-form-pereciveis');

    form.reset();
    container.querySelector('#field-id-pereciveis').value = id || '';
    container.querySelector('#field-column-pereciveis').value = '';
    container.querySelector('#field-column-number-pereciveis').value = '';

    if (id) {
      const p = window.BrigadaData.products.find(x => x.id === id);
      if (!p || !window.BrigadaAuth.canEditProduct(p)) return;
      title.textContent = 'Editar Produto Perecível';
      if (p) {
        container.querySelector('#field-plu-pereciveis').value = p.plu;
        container.querySelector('#field-category-pereciveis').value = p.category;
        container.querySelector('#field-name-pereciveis').value = p.name;
        container.querySelector('#field-startDate-pereciveis').value = p.startDate || '';
        container.querySelector('#field-endDate-pereciveis').value = p.endDate;
        container.querySelector('#field-supplier-pereciveis').value = p.supplier || '';
        container.querySelector('#field-location-pereciveis').value = p.location || '';
        container.querySelector('#field-column-pereciveis').value = p.column || '';
        container.querySelector('#field-column-number-pereciveis').value = p.columnNumber || '';
        container.querySelector('#field-quantity-pereciveis').value = p.quantity !== undefined ? p.quantity : '';
        container.querySelector('#field-unit-pereciveis').value = p.unit || 'kg';
      }
    } else {
      title.textContent = 'Novo Produto Perecível';
      container.querySelector('#field-startDate-pereciveis').value = new Date().toISOString().split('T')[0];
    }

    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('modal-overlay--visible'));
  },

  closeModal(container) {
    const modal = container.querySelector('#product-modal-pereciveis');
    if (!modal) return;
    modal.classList.remove('modal-overlay--visible');
    setTimeout(() => {
      modal.style.display = 'none';
      this.editingId = null;
    }, 250);
  },

  async saveProduct(container) {
    const form = container.querySelector('#product-form-pereciveis');
    if (!form.reportValidity()) return;

    const id = this.editingId;
    const payload = {
      plu: container.querySelector('#field-plu-pereciveis').value.trim(),
      category: container.querySelector('#field-category-pereciveis').value,
      name: container.querySelector('#field-name-pereciveis').value.trim(),
      startDate: container.querySelector('#field-startDate-pereciveis').value || null,
      endDate: container.querySelector('#field-endDate-pereciveis').value,
      supplier: container.querySelector('#field-supplier-pereciveis').value.trim() || null,
      location: container.querySelector('#field-location-pereciveis').value,
      quantity: container.querySelector('#field-quantity-pereciveis').value !== '' ? parseFloat(container.querySelector('#field-quantity-pereciveis').value) : 0,
      unit: container.querySelector('#field-unit-pereciveis').value || 'kg',
      column: container.querySelector('#field-column-pereciveis').value.trim() || null,
      columnNumber: container.querySelector('#field-column-number-pereciveis').value !== '' ? parseInt(container.querySelector('#field-column-number-pereciveis').value) : null
    };

    try {
      if (id) {
        const product = window.BrigadaData.products.find(x => x.id === id);
        if (!product || !window.BrigadaAuth.canEditProduct(product)) {
          window.BrigadaUI.showToast('Permissão negada. Você não tem permissão para editar este produto.', 'error');
          return;
        }
        await window.BrigadaData.updateProduct(id, payload);
        window.BrigadaUI.showToast('Produto perecível atualizado!', 'success');
      } else {
        await window.BrigadaData.addProduct(payload);
        window.BrigadaUI.showToast('Produto perecível cadastrado!', 'success');
      }
      this.closeModal(container);
      this.renderTable(container);
    } catch (err) {
      window.BrigadaUI.showToast(err.message || 'Erro ao salvar produto.', 'error');
    }
  },

  openDeleteModal(container, id) {
    const p = window.BrigadaData.products.find(x => x.id === id);
    if (!p || !window.BrigadaAuth.canDeleteProduct(p)) return;

    const modal = container.querySelector('#delete-modal-pereciveis');
    container.querySelector('#delete-product-name-pereciveis').textContent = p.name;
    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('modal-overlay--visible'));

    const btnConfirm = container.querySelector('#btn-confirm-delete-pereciveis');
    const btnCancel = container.querySelector('#btn-cancel-delete-pereciveis');
    const btnClose = container.querySelector('#delete-modal-close-pereciveis');

    const cleanUp = () => {
      modal.classList.remove('modal-overlay--visible');
      setTimeout(() => modal.style.display = 'none', 250);
    };

    btnConfirm.onclick = async () => {
      try {
        await window.BrigadaData.deleteProduct(id);
        window.BrigadaUI.showToast('Produto removido com sucesso!', 'success');
        cleanUp();
        this.renderTable(container);
      } catch (err) {
        window.BrigadaUI.showToast('Erro ao excluir produto.', 'error');
      }
    };

    btnCancel.onclick = cleanUp;
    btnClose.onclick = cleanUp;
  },

  handleCSVImport(e, container) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target.result;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

      if (lines.length <= 1) {
        window.BrigadaUI.showToast('Arquivo CSV vazio ou sem cabeçalho.', 'error');
        return;
      }

      let count = 0;
      let skipped = 0;

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim());
        if (parts.length < 4) {
          skipped++;
          continue;
        }

        const [plu, name, category, endDate, quantity, unit, location, supplier] = parts;
        if (!['laticinios', 'frios', 'iogurtes', 'pereciveis', 'perecíveis'].includes(category.toLowerCase())) {
          skipped++;
          continue;
        }

        try {
          await window.BrigadaData.addProduct({
            plu,
            name,
            category,
            endDate,
            startDate: new Date().toISOString().split('T')[0],
            quantity: quantity ? parseFloat(quantity) : 0,
            unit: unit || 'kg',
            location: location || 'gondola_fria',
            supplier: supplier || null
          });
          count++;
        } catch (err) {
          skipped++;
        }
      }

      window.BrigadaUI.showToast(`Importação finalizada! Sucesso: ${count}, Ignorados: ${skipped}`, count > 0 ? 'success' : 'error');
      this.renderTable(container);
      e.target.value = '';
    };
    reader.readAsText(file);
  },

  exportExcel() {
    const checkboxes = document.querySelectorAll('.select-product-checkbox:checked');
    const ids = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
    let products = this.getFilteredProducts();
    if (ids.length > 0) {
      products = products.filter(p => ids.includes(p.id));
    }
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'PLU,Nome,Categoria,Data Fabricação,Vencimento,Quantidade,Unidade,Localização,Fornecedor\n';

    products.forEach(p => {
      csvContent += `"${p.plu}","${p.name}","${p.category}","${p.startDate || ''}","${p.endDate}",${p.quantity || 0},"${p.unit || 'kg'}","${p.location || ''}","${p.supplier || ''}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `produtos_pereciveis_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  exportPDF() {
    const checkboxes = document.querySelectorAll('.select-product-checkbox:checked');
    const ids = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
    let products = this.getFilteredProducts();
    if (ids.length > 0) {
      products = products.filter(p => ids.includes(p.id));
    }
    const now = new Date().toLocaleString('pt-BR');
    
    let htmlContent = `
      <div class="print-container">
        <style>
          .print-container { font-family: sans-serif; padding: 20px; background-color: #ffffff; color: #333333; }
          .print-container h1 { color: #0f172a; border-bottom: 2px solid #334155; padding-bottom: 8px; font-size: 1.5rem; }
          .print-container p { font-size: 0.8rem; color: #64748b; }
          .print-container table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .print-container th, .print-container td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; font-size: 0.85rem; color: #333333; }
          .print-container th { background-color: #f1f5f9; }
          .print-container .expired { color: #ef4444; font-weight: bold; }
          .print-container .today { color: #f97316; font-weight: bold; }
          .print-container .warning { color: #eab308; }
          .print-container .ok { color: #22c55e; }
        </style>
        <h1>🛡️ Relatório de Validades — Setor de Perecíveis</h1>
        <p>Gerado em ${now} · BRIGADA-IA</p>
        <table>
          <thead>
            <tr>
              <th>PLU</th>
              <th>Produto</th>
              <th>Categoria</th>
              <th>Validade</th>
              <th>Status</th>
              <th>Localização</th>
            </tr>
          </thead>
          <tbody>
            ${products.map(p => {
              const s = window.BrigadaData.getProductStatus(p);
              const statusClass = s.days < 0 ? 'expired' : s.days === 0 ? 'today' : s.days <= 3 ? 'warning' : 'ok';
              return `
                <tr>
                  <td>${p.plu}</td>
                  <td>${p.name}</td>
                  <td>${p.category}</td>
                  <td>${window.BrigadaData.formatDate(p.endDate)}</td>
                  <td class="${statusClass}">${s.label}</td>
                  <td>${p.location || '—'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    window.BrigadaUI.printContent(htmlContent);
  }
};

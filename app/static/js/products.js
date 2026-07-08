/**
 * BRIGADA-IA — Products Module
 */

window.BrigadaProducts = {
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
          <h2 class="panel-title">📦 Gestão de Produtos</h2>
          <p class="panel-subtitle">Controle completo do estoque por categoria</p>
        </div>
        <div class="glass-actions-card" style="display:flex; gap:var(--sp-sm); flex-wrap:wrap; align-items:center;">
          ${isSuperAdmin ? `
          <button class="btn btn--primary" id="btn-import-csv" title="Importar produtos via CSV">
            <span>📥</span> Importar
          </button>
          ` : ''}
          <button class="btn btn--primary" id="btn-request-reduction" title="Mover selecionados para Aguardando Rebaixa">
            <span>📉</span> Rebaixar
          </button>
          <button class="btn btn--primary" id="btn-export-excel" title="Exportar para Excel">
            <span>📗</span> Excel
          </button>
          <button class="btn btn--primary" id="btn-export-pdf" title="Exportar para PDF">
            <span>📄</span> PDF
          </button>
          ${canAddProduct ? `
          <button class="btn btn--primary" id="btn-add-product">
            <span>＋</span> Novo Produto
          </button>
          ` : ''}
        </div>
      </div>

      <!-- Hidden file input for CSV import -->
      <input type="file" id="import-file-input" accept=".csv" style="display:none;">

      <div class="glass-panel" style="padding: 1.5rem; margin-top: 1rem;">
  <div class="category-tabs" id="category-tabs">
          <button class="cat-tab cat-tab--active" data-cat="all">🏪 Todos</button>
          <button class="cat-tab" data-cat="aves">🐔 Aves</button>
          <button class="cat-tab" data-cat="suino">🐷 Suíno</button>
          <button class="cat-tab" data-cat="bovino">🐮 Bovino</button>
          <button class="cat-tab" data-cat="pescado">🐟 Pescado</button>
        </div>

        <div class="toolbar">
          <div class="search-box" style="display: flex; gap: 0.5rem; flex: 1;">
            <div style="position: relative; flex: 1; display: flex; align-items: center;">
              <span class="search-icon" style="position: absolute; left: 1rem;">🔍</span>
              <input type="text" id="search-products" class="search-input" placeholder="Buscar por nome, PLU ou código..." style="width: 100%; padding-left: 2.5rem;">
            </div>
            <button id="btn-scan-products" class="btn btn--outline" style="padding: 0 1rem;" title="Escanear Código">📷</button>
          </div>
          <div class="toolbar-right">
            <select id="filter-status" class="select-control">
              <option value="all">Todos os status</option>
              <option value="ok">✅ OK</option>
              <option value="warning">⚠️ Atenção</option>
              <option value="today">🟠 Vence Hoje</option>
              <option value="expired">🔴 Vencido</option>
              <option value="rebaixa">📉 Aguardando Rebaixa</option>
            </select>
          </div>
        </div>

        <div class="table-wrapper" id="products-table-wrapper">
          <!-- tabela renderizada dinamicamente -->
        </div>
      </div>

      <!-- Modal de produto -->
      <div class="modal-overlay" id="product-modal" style="display:none;">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title" id="modal-title">Novo Produto</h3>
            <button class="modal-close" id="modal-close">✕</button>
          </div>
          <div class="modal-body">
            <form id="product-form">
              <input type="hidden" id="field-id">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">PLU *</label>
                  <input type="text" id="field-plu" class="form-input" placeholder="ex: AV001" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Categoria *</label>
                  <select id="field-category" class="form-input" required>
                    <option value="">Selecione...</option>
                    <option value="aves">🐔 Aves</option>
                    <option value="suino">🐷 Suíno</option>
                    <option value="bovino">🐮 Bovino</option>
                    <option value="pescado">🐟 Pescado</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Nome do Produto *</label>
                  <input type="text" id="field-name" class="form-input" placeholder="Nome do produto" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Cód. Barras (Fábrica)</label>
                  <div style="display: flex; gap: 0.5rem;">
                    <input type="text" id="field-barcode" class="form-input" placeholder="Opcional">
                    <button type="button" id="btn-scan-form" class="btn btn--outline" style="padding: 0 0.8rem;" title="Escanear">📷</button>
                  </div>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Data Inicial</label>
                  <input type="date" id="field-startDate" class="form-input">
                </div>
                <div class="form-group">
                  <label class="form-label">Data Final (Validade) *</label>
                  <input type="date" id="field-endDate" class="form-input" required>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Fornecedor</label>
                  <input type="text" id="field-supplier" class="form-input" placeholder="Nome do fornecedor">
                </div>
                <div class="form-group">
                  <label class="form-label">Localização *</label>
                  <select id="field-location" class="form-input" required>
                    <option value="">Selecione...</option>
                    <option value="resfriado">❄️ Resfriado</option>
                    <option value="congelado">🥶 Congelado</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Coluna</label>
                  <select id="field-column" class="form-input">
                    <option value="">Selecione...</option>
                    <option value="Aéreo">Aéreo</option>
                    <option value="Piso">Piso</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Número da Coluna</label>
                  <select id="field-column-number" class="form-input">
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
                  <input type="number" id="field-quantity" class="form-input" placeholder="ex: 10.5" step="any" min="0">
                </div>
                <div class="form-group">
                  <label class="form-label">Unidade</label>
                  <select id="field-unit" class="form-input">
                    <option value="kg">kg</option>
                    <option value="un">un</option>
                    <option value="cx">cx</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn--ghost" id="btn-cancel-modal">Cancelar</button>
            <button class="btn btn--primary" id="btn-save-product">Salvar Produto</button>
          </div>
        </div>
      </div>

      <!-- Modal de confirmação de exclusão -->
      <div class="modal-overlay" id="delete-modal" style="display:none;">
        <div class="modal modal--sm">
          <div class="modal-header">
            <h3 class="modal-title">⚠️ Confirmar Exclusão</h3>
            <button class="modal-close" id="delete-modal-close">✕</button>
          </div>
          <div class="modal-body">
            <p style="color:var(--text-secondary);">Tem certeza que deseja remover o produto <strong id="delete-product-name" style="color:var(--text-primary);"></strong>?</p>
            <p style="color:var(--error);font-size:0.85rem;margin-top:0.5rem;">Esta ação não pode ser desfeita.</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn--ghost" id="btn-cancel-delete">Cancelar</button>
            <button class="btn btn--danger" id="btn-confirm-delete">Excluir</button>
          </div>
        </div>
      </div>
    `;
  },

  getFilteredProducts() {
    let products = window.BrigadaData.products.filter(p => ['aves', 'suino', 'bovino', 'pescado'].includes(p.category));

    if (this.currentFilter !== 'all') {
      products = products.filter(p => p.category === this.currentFilter);
    }

    if (this.currentSearch) {
      const q = this.currentSearch.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.plu.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.toLowerCase().includes(q))
      );
    }

    const statusFilter = document.getElementById('filter-status')?.value || 'all';
    if (statusFilter !== 'all') {
      products = products.filter(p => {
        const s = window.BrigadaData.getProductStatus(p);
        if (statusFilter === 'rebaixa') return p.isAwaitingReduction === true;
        if (statusFilter === 'expired') return s.days < 0;
        if (statusFilter === 'today') return s.days === 0;
        if (statusFilter === 'warning') return s.days > 0 && s.days <= 3;
        if (statusFilter === 'ok') return s.days > 3;
        return true;
      });
    }

    return products;
  },

  renderTable(container) {
    const wrapper = container.querySelector('#products-table-wrapper');
    if (!wrapper) return;

    const products = this.getFilteredProducts();
    const catMap = { aves: '🐔 Aves', suino: '🐷 Suíno', bovino: '🐮 Bovino', pescado: '🐟 Pescado' };

    if (products.length === 0) {
      wrapper.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">📦</div>
          <p class="empty-state__text">Nenhum produto encontrado</p>
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
          <td data-label="Produto" class="product-name">${p.name}</td>
          <td data-label="Qtd"><strong style="color:var(--primary); font-size: 0.95rem;">${qty}</strong> <span style="font-size:0.75rem; color:var(--text-secondary);">${unit}</span></td>
          <td data-label="Categoria"><span class="cat-pill cat-pill--${p.category}">${catMap[p.category]}</span></td>
          <td data-label="Data Inicial">${window.BrigadaData.formatDate(p.startDate)}</td>
          <td data-label="Validade">${window.BrigadaData.formatDate(p.endDate)}</td>
          <td data-label="Status">
            <div style="display:flex; flex-direction:column; gap:4px; align-items:flex-start;">
              <span class="badge ${status.class}">${status.icon} ${status.label}</span>
              ${p.isAwaitingReduction ? `<span class="badge" style="background:${p.rebaixaStatus === 'ok' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)'}; color:${p.rebaixaStatus === 'ok' ? '#34d399' : '#fbbf24'}; border:1px solid ${p.rebaixaStatus === 'ok' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}; font-size:0.65rem;">${p.rebaixaStatus === 'ok' ? '🟢 Rebaixa OK' : '🟡 Aguardando'}</span>` : ''}
            </div>
          </td>
          <td data-label="Fornecedor">
            <div>${p.supplier || '—'}</div>
            ${p.createdBy ? `<div style="font-size:0.7rem; color:#a78bfa; margin-top:2px; font-weight: 500;" title="${p.createdBy}">👤 ${window.BrigadaData.getUserNameByEmail(p.createdBy)}</div>` : ''}
          </td>
          <td data-label="Localização">
            ${window.BrigadaData.formatLocationFriendly(p)}
          </td>
          ${showActions ? `
          <td data-label="Ações" class="actions-cell">
            ${p.isAwaitingReduction && canEditThis ? `<button class="btn-icon" data-action="toggle-rebaixa" data-id="${p.id}" title="${p.rebaixaStatus === 'ok' ? 'Voltar para Aguardando' : 'Marcar Rebaixa OK'}">${p.rebaixaStatus === 'ok' ? '↩️' : '✅'}<span class="btn-label">${p.rebaixaStatus === 'ok' ? 'Voltar' : 'Rebaixa'}</span></button>` : ''}
            ${status.days < 0 && canEditThis ? `
              ${p.expiredAction !== 'quebra' ? `<button class="btn-icon" data-action="set-quebra" data-id="${p.id}" title="Marcar como Quebra">🗑️<span class="btn-label">Quebra</span></button>` : ''}
              ${p.expiredAction !== 'troca' ? `<button class="btn-icon" data-action="set-troca" data-id="${p.id}" title="Marcar como Troca">🔄<span class="btn-label">Troca</span></button>` : ''}
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
              <th>Produto</th>
              <th>Qtd</th>
              <th>Categoria</th>
              <th>Data Inicial</th>
              <th>Data Final</th>
              <th>Status</th>
              <th>Fornecedor</th>
              <th>Localização</th>
              ${showActions ? '<th>Ações</th>' : ''}
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;

    // Bind select all checkbox
    const selectAllCb = container.querySelector('#select-all-products');
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
    const searchInput = container.querySelector('#search-products');
    searchInput?.addEventListener('input', (e) => {
      this.currentSearch = e.target.value;
      this.renderTable(container);
    });

    // Status filter
    const statusFilter = container.querySelector('#filter-status');
    statusFilter?.addEventListener('change', () => this.renderTable(container));

    // Scanner
    const scanBtn = container.querySelector('#btn-scan-products');
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

    const formScanBtn = container.querySelector('#btn-scan-form');
    formScanBtn?.addEventListener('click', () => {
      window.BrigadaUI.openScanner((result) => {
        const barcodeInput = container.querySelector('#field-barcode');
        if (barcodeInput) barcodeInput.value = result.barcode;
      });
    });

    // Add product button
    container.querySelector('#btn-add-product')?.addEventListener('click', () => {
      this.openAddModal(container);
    });

    // Export / Import buttons
    container.querySelector('#btn-request-reduction')?.addEventListener('click', () => this.requestReduction(container));
    container.querySelector('#btn-export-excel')?.addEventListener('click', () => this.exportExcel());
    container.querySelector('#btn-export-pdf')?.addEventListener('click', () => this.exportPDF());
    container.querySelector('#btn-import-csv')?.addEventListener('click', () => {
      container.querySelector('#import-file-input')?.click();
    });
    container.querySelector('#import-file-input')?.addEventListener('change', (e) => {
      this.importCSV(e, container);
    });

    // Modal close
    container.querySelector('#modal-close')?.addEventListener('click', () => this.closeModal(container));
    container.querySelector('#btn-cancel-modal')?.addEventListener('click', () => this.closeModal(container));

    // Save product
    container.querySelector('#btn-save-product')?.addEventListener('click', () => this.saveProduct(container));

    // Delete modal
    container.querySelector('#delete-modal-close')?.addEventListener('click', () => this.closeDeleteModal(container));
    container.querySelector('#btn-cancel-delete')?.addEventListener('click', () => this.closeDeleteModal(container));
    container.querySelector('#btn-confirm-delete')?.addEventListener('click', () => this.confirmDelete(container));

    // Close modal on overlay click
    container.querySelector('#product-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'product-modal') this.closeModal(container);
    });
    container.querySelector('#delete-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'delete-modal') this.closeDeleteModal(container);
    });
  },

  openAddModal(container) {
    if (!window.BrigadaAuth.canAddProduct()) return;
    this.editingId = null;
    container.querySelector('#modal-title').textContent = 'Novo Produto';
    container.querySelector('#product-form').reset();
    container.querySelector('#field-id').value = '';
    container.querySelector('#field-plu').value = '';
    container.querySelector('#field-barcode').value = '';
    container.querySelector('#field-startDate').value = '';
    container.querySelector('#field-quantity').value = '';
    container.querySelector('#field-column').value = '';
    container.querySelector('#field-column-number').value = '';
    this.showModal(container);
  },

  openEditModal(id, container) {
    const product = window.BrigadaData.products.find(p => p.id === id);
    if (!product || !window.BrigadaAuth.canEditProduct(product)) return;
    this.editingId = id;
    container.querySelector('#modal-title').textContent = 'Editar Produto';
    container.querySelector('#field-id').value = product.id;
    container.querySelector('#field-plu').value = product.plu;
    container.querySelector('#field-barcode').value = product.barcode || '';
    container.querySelector('#field-name').value = product.name;
    container.querySelector('#field-category').value = product.category;
    container.querySelector('#field-startDate').value = product.startDate || '';
    container.querySelector('#field-endDate').value = product.endDate;
    container.querySelector('#field-supplier').value = product.supplier || '';
    container.querySelector('#field-location').value = product.location || '';
    container.querySelector('#field-column').value = product.column || '';
    container.querySelector('#field-column-number').value = product.columnNumber || '';
    container.querySelector('#field-unit').value = product.unit || 'kg';
    container.querySelector('#field-quantity').value = product.quantity !== undefined ? product.quantity : '';
    this.showModal(container);
  },

  showModal(container) {
    const modal = container.querySelector('#product-modal');
    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('modal-overlay--visible'));
  },

  closeModal(container) {
    const modal = container.querySelector('#product-modal');
    modal.classList.remove('modal-overlay--visible');
    setTimeout(() => modal.style.display = 'none', 250);
  },

  openDeleteModal(id, container) {
    const product = window.BrigadaData.products.find(p => p.id === id);
    if (!product || !window.BrigadaAuth.canDeleteProduct(product)) return;
    this.deletingId = id;
    container.querySelector('#delete-product-name').textContent = product.name;
    const modal = container.querySelector('#delete-modal');
    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('modal-overlay--visible'));
  },

  closeDeleteModal(container) {
    const modal = container.querySelector('#delete-modal');
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
    const plu = container.querySelector('#field-plu').value.trim();
    const barcode = container.querySelector('#field-barcode').value.trim();
    const name = container.querySelector('#field-name').value.trim();
    const category = container.querySelector('#field-category').value;
    const startDate = container.querySelector('#field-startDate').value;
    const endDate = container.querySelector('#field-endDate').value;
    const supplier = container.querySelector('#field-supplier').value.trim();
    const location = container.querySelector('#field-location').value;
    const unit = container.querySelector('#field-unit').value;
    const qtyVal = container.querySelector('#field-quantity').value;
    const quantity = qtyVal !== '' ? parseFloat(qtyVal) : 0;
    const column = container.querySelector('#field-column').value.trim() || null;
    const colNumVal = container.querySelector('#field-column-number').value;
    const columnNumber = colNumVal !== '' ? parseInt(colNumVal) : null;

    if (!plu || !name || !category || !endDate || !location) {
      window.BrigadaUI.showToast('Preencha todos os campos obrigatórios (incluindo Localização).', 'error');
      return;
    }

    if (startDate && endDate < startDate) {
      window.BrigadaUI.showToast('A data final não pode ser anterior à data inicial.', 'error');
      return;
    }

    // Validação local de PLU duplicado (independente do nível de usuário)
    const duplicate = window.BrigadaData.products.find(
      p => p.plu.trim().toLowerCase() === plu.toLowerCase() && p.id !== this.editingId
    );
    if (duplicate) {
      window.BrigadaUI.showToast(`Não é permitido cadastrar produtos com o mesmo PLU. O PLU "${plu}" já pertence a: ${duplicate.name}.`, 'error');
      return;
    }

    const payload = { plu, barcode, name, category, startDate, endDate, supplier, location, unit, quantity, column, columnNumber };

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
    
    // Desmarcar tudo e re-renderizar
    const selectAll = container.querySelector('#select-all-products');
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

    const catMap = { aves: 'Aves', suino: 'Suíno', bovino: 'Bovino', pescado: 'Pescado' };
    const header = ['PLU', 'Produto', 'Quantidade', 'Unidade', 'Categoria', 'Data Inicial', 'Validade', 'Status', 'Fornecedor', 'Localização'];

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
    a.download = `produtos_brigada_${new Date().toISOString().split('T')[0]}.csv`;
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

    const catMap = { aves: 'Aves', suino: 'Suíno', bovino: 'Bovino', pescado: 'Pescado' };
    const now = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const rows = products.map(p => {
      const s = window.BrigadaData.getProductStatus(p);
      const statusColor = s.days < 0 ? '#ef4444' : s.days === 0 ? '#f97316' : s.days <= 3 ? '#f59e0b' : '#22c55e';
      return `
        <tr>
          <td style="font-family:monospace;color:#6366f1;font-weight:600;">${p.plu}</td>
          <td style="font-weight:500;">${p.name}</td>
          <td style="text-align:center;">${p.quantity !== undefined ? p.quantity : 0} ${p.unit || 'kg'}</td>
          <td>${catMap[p.category] || p.category}</td>
          <td>${window.BrigadaData.formatDate(p.endDate)}</td>
          <td style="color:${statusColor};font-weight:700;">${s.label}</td>
          <td>${window.BrigadaData.formatLocationFriendly(p)}</td>
        </tr>`;
    }).join('');

    const stats = window.BrigadaData.getStats();

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Produtos — BRIGADA-IA</title>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color:#1e293b; padding:24px; font-size:11px; }
          .header { text-align:center; margin-bottom:20px; padding-bottom:16px; border-bottom:2px solid #6366f1; }
          .header h1 { font-size:20px; color:#6366f1; margin-bottom:4px; }
          .header p { color:#64748b; font-size:12px; }
          .summary { display:flex; gap:12px; margin-bottom:16px; justify-content:center; flex-wrap:wrap; }
          .summary-item { background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:8px 16px; text-align:center; }
          .summary-item .num { font-size:18px; font-weight:800; }
          .summary-item .label { font-size:9px; color:#64748b; text-transform:uppercase; letter-spacing:0.05em; }
          .num-total { color:#6366f1; }
          .num-ok { color:#22c55e; }
          .num-warn { color:#f59e0b; }
          .num-exp { color:#ef4444; }
          table { width:100%; border-collapse:collapse; margin-top:8px; }
          th { background:#6366f1; color:#fff; padding:8px 6px; text-align:left; font-size:10px; text-transform:uppercase; letter-spacing:0.05em; }
          td { padding:6px; border-bottom:1px solid #e2e8f0; font-size:11px; }
          tr:nth-child(even) td { background:#f8fafc; }
          .footer { margin-top:20px; text-align:center; color:#94a3b8; font-size:9px; border-top:1px solid #e2e8f0; padding-top:12px; }
          @media print { body { padding:12px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🛡️ BRIGADA-IA — Relatório de Produtos</h1>
          <p>Gerado em ${now} · Açougue Varejo</p>
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
      </body>
      </html>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
    window.BrigadaUI.showToast('PDF gerado! Use "Salvar como PDF" na janela de impressão.', 'success');
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

    // Detect separator
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

    // Map header names
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

    const catMap = { aves: 'aves', suino: 'suino', suno: 'suino', bovino: 'bovino', pescado: 'pescado' };
    let imported = 0;
    let skipped = 0;

    for (let i = 1; i < lines.length; i++) {
      const cols = parseRow(lines[i]);
      const plu = cols[colPlu] || '';
      const name = cols[colName] || '';
      const endDate = cols[colEndDate] || '';

      if (!plu || !name || !endDate) { skipped++; continue; }

      // Check duplicate PLU
      if (window.BrigadaData.products.find(p => p.plu.trim().toLowerCase() === plu.toLowerCase())) {
        skipped++;
        continue;
      }

      const rawCat = colCategory !== -1 ? (cols[colCategory] || '').toLowerCase().replace(/[^a-z]/g, '') : '';
      const category = catMap[rawCat] || 'aves';

      const rawLoc = colLocation !== -1 ? (cols[colLocation] || '').toLowerCase() : '';
      const location = rawLoc.includes('congelado') ? 'congelado' : 'resfriado';

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

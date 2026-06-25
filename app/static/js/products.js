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
    return `
      <div class="panel-header">
        <div class="panel-header__left">
          <h2 class="panel-title">📦 Gestão de Produtos</h2>
          <p class="panel-subtitle">Controle completo do estoque por categoria</p>
        </div>
        <button class="btn btn--primary" id="btn-add-product">
          <span>＋</span> Novo Produto
        </button>
      </div>

      <div class="category-tabs" id="category-tabs">
        <button class="cat-tab cat-tab--active" data-cat="all">🏪 Todos</button>
        <button class="cat-tab" data-cat="aves">🐔 Aves</button>
        <button class="cat-tab" data-cat="suino">🐷 Suíno</button>
        <button class="cat-tab" data-cat="pescado">🐟 Pescado</button>
      </div>

      <div class="toolbar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" id="search-products" class="search-input" placeholder="Buscar por nome ou PLU...">
        </div>
        <div class="toolbar-right">
          <select id="filter-status" class="select-control">
            <option value="all">Todos os status</option>
            <option value="ok">✅ OK</option>
            <option value="warning">⚠️ Atenção</option>
            <option value="today">🟠 Vence Hoje</option>
            <option value="expired">🔴 Vencido</option>
          </select>
        </div>
      </div>

      <div class="table-wrapper" id="products-table-wrapper">
        <!-- tabela renderizada dinamicamente -->
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
                    <option value="pescado">🐟 Pescado</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Nome do Produto *</label>
                <input type="text" id="field-name" class="form-input" placeholder="Nome do produto" required>
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
                  <label class="form-label">Localização</label>
                  <input type="text" id="field-location" class="form-input" placeholder="ex: Câmara Fria A1">
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
                    <option value="pct">pct</option>
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
    let products = window.BrigadaData.products;

    if (this.currentFilter !== 'all') {
      products = products.filter(p => p.category === this.currentFilter);
    }

    if (this.currentSearch) {
      const q = this.currentSearch.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.plu.toLowerCase().includes(q)
      );
    }

    const statusFilter = document.getElementById('filter-status')?.value || 'all';
    if (statusFilter !== 'all') {
      products = products.filter(p => {
        const s = window.BrigadaData.getProductStatus(p);
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
    const catMap = { aves: '🐔 Aves', suino: '🐷 Suíno', pescado: '🐟 Pescado' };

    if (products.length === 0) {
      wrapper.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">📦</div>
          <p class="empty-state__text">Nenhum produto encontrado</p>
        </div>`;
      return;
    }

    const rows = products.map(p => {
      const status = window.BrigadaData.getProductStatus(p);
      const qty = p.quantity !== undefined ? p.quantity : 0;
      const unit = p.unit || 'kg';
      return `
        <tr data-id="${p.id}">
          <td><span class="plu-badge">${p.plu}</span></td>
          <td class="product-name">${p.name}</td>
          <td><strong style="color:var(--primary); font-size: 0.95rem;">${qty}</strong> <span style="font-size:0.75rem; color:var(--text-secondary);">${unit}</span></td>
          <td><span class="cat-pill cat-pill--${p.category}">${catMap[p.category]}</span></td>
          <td>${window.BrigadaData.formatDate(p.startDate)}</td>
          <td>${window.BrigadaData.formatDate(p.endDate)}</td>
          <td><span class="badge ${status.class}">${status.icon} ${status.label}</span></td>
          <td>${p.supplier || '—'}</td>
          <td>${p.location || '—'}</td>
          <td class="actions-cell">
            <button class="btn-icon btn-icon--edit" data-action="edit" data-id="${p.id}" title="Editar">✏️</button>
            <button class="btn-icon btn-icon--delete" data-action="delete" data-id="${p.id}" title="Excluir">🗑️</button>
          </td>
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
              <th>PLU</th>
              <th>Produto</th>
              <th>Qtd</th>
              <th>Categoria</th>
              <th>Data Inicial</th>
              <th>Data Final</th>
              <th>Status</th>
              <th>Fornecedor</th>
              <th>Localização</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;

    // Bind action buttons inside table
    wrapper.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const id = parseInt(btn.dataset.id);
        if (action === 'edit') this.openEditModal(id, container);
        if (action === 'delete') this.openDeleteModal(id, container);
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

    // Add product button
    container.querySelector('#btn-add-product')?.addEventListener('click', () => {
      this.openAddModal(container);
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
    this.editingId = null;
    container.querySelector('#modal-title').textContent = 'Novo Produto';
    container.querySelector('#product-form').reset();
    container.querySelector('#field-id').value = '';
    container.querySelector('#field-startDate').value = '';
    container.querySelector('#field-quantity').value = '';
    this.showModal(container);
  },

  openEditModal(id, container) {
    const product = window.BrigadaData.products.find(p => p.id === id);
    if (!product) return;
    this.editingId = id;
    container.querySelector('#modal-title').textContent = 'Editar Produto';
    container.querySelector('#field-id').value = product.id;
    container.querySelector('#field-plu').value = product.plu;
    container.querySelector('#field-name').value = product.name;
    container.querySelector('#field-category').value = product.category;
    container.querySelector('#field-startDate').value = product.startDate || '';
    container.querySelector('#field-endDate').value = product.endDate;
    container.querySelector('#field-supplier').value = product.supplier || '';
    container.querySelector('#field-location').value = product.location || '';
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
    if (!product) return;
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
    const plu = container.querySelector('#field-plu').value.trim();
    const name = container.querySelector('#field-name').value.trim();
    const category = container.querySelector('#field-category').value;
    const startDate = container.querySelector('#field-startDate').value;
    const endDate = container.querySelector('#field-endDate').value;
    const supplier = container.querySelector('#field-supplier').value.trim();
    const location = container.querySelector('#field-location').value.trim();
    const unit = container.querySelector('#field-unit').value;
    const qtyVal = container.querySelector('#field-quantity').value;
    const quantity = qtyVal !== '' ? parseFloat(qtyVal) : 0;

    if (!plu || !name || !category || !endDate) {
      window.BrigadaUI.showToast('Preencha todos os campos obrigatórios.', 'error');
      return;
    }

    if (startDate && endDate < startDate) {
      window.BrigadaUI.showToast('A data final não pode ser anterior à data inicial.', 'error');
      return;
    }

    const payload = { plu, name, category, startDate, endDate, supplier, location, unit, quantity };

    if (this.editingId) {
      await window.BrigadaData.updateProduct(this.editingId, payload);
      window.BrigadaUI.showToast('Produto atualizado com sucesso!', 'success');
    } else {
      await window.BrigadaData.addProduct(payload);
      window.BrigadaUI.showToast('Produto cadastrado com sucesso!', 'success');
    }

    this.closeModal(container);
    this.renderTable(container);
  },

  async confirmDelete(container) {
    await window.BrigadaData.deleteProduct(this.deletingId);
    window.BrigadaUI.showToast('Produto removido.', 'success');
    this.closeDeleteModal(container);
    this.renderTable(container);
  },
};

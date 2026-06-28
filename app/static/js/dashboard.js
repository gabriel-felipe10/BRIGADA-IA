/**
 * BRIGADA-IA — Dashboard Brigada de Validade
 */

window.BrigadaDashboard = {
  currentFilter: 'all',
  currentStatusFilter: 'all',
  editingId: null,
  deletingId: null,

  getAllowedProducts() {
    let products = window.BrigadaData.products;
    if (window.BrigadaAuth.currentUser) {
      const email = window.BrigadaAuth.currentUser.email.toLowerCase();
      const isRestricted = !(email === 'admin@brigada.com' || email === 'marcos@brigada.com' || window.BrigadaAuth.isSuperAdmin());
      if (isRestricted) {
        const sector = window.BrigadaAuth.currentUser.sector;
        if (sector === 'açougue') {
          products = products.filter(p => ['aves', 'suino', 'bovino', 'pescado'].includes(p.category));
        } else if (sector === 'pereciveis') {
          products = products.filter(p => ['laticinios', 'frios', 'padaria', 'hortifruti'].includes(p.category));
        }
      }
    }
    return products;
  },

  render(container, role) {
    this.currentFilter = 'all';
    this.currentStatusFilter = 'all';
    const isSuperAdmin = role === 'superadmin';
    container.innerHTML = this.buildHTML(isSuperAdmin);
    this.bindEvents(container);
    this.renderStats(container);
    this.renderAlertsTimeline(container);
    this.renderCategoryChart(container);
  },

  buildHTML(isSuperAdmin) {
    const adminSection = isSuperAdmin ? `
      <div class="dashboard-grid dashboard-grid--4 stagger">
        <div class="metric-card" id="stat-total">
          <div class="metric-card__icon">📦</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Total Produtos</p>
            <p class="metric-card__value" id="stat-total-val">—</p>
          </div>
        </div>
        <div class="metric-card metric-card--danger" id="stat-expired">
          <div class="metric-card__icon">🔴</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Vencidos</p>
            <p class="metric-card__value" id="stat-expired-val">—</p>
          </div>
        </div>
        <div class="metric-card metric-card--warning" id="stat-soon">
          <div class="metric-card__icon">⚠️</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Vencendo em Breve</p>
            <p class="metric-card__value" id="stat-soon-val">—</p>
          </div>
        </div>
        <div class="metric-card metric-card--success" id="stat-ok">
          <div class="metric-card__icon">✅</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Produtos OK</p>
            <p class="metric-card__value" id="stat-ok-val">—</p>
          </div>
        </div>
      </div>
      <div class="dashboard-grid dashboard-grid--3" style="margin-bottom:2rem;">
        <div class="metric-card" id="stat-users">
          <div class="metric-card__icon">👥</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Total Usuários</p>
            <p class="metric-card__value" id="stat-users-val">—</p>
          </div>
        </div>
        <div class="metric-card metric-card--success" id="stat-active-users">
          <div class="metric-card__icon">🟢</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Usuários Ativos</p>
            <p class="metric-card__value" id="stat-active-users-val">—</p>
          </div>
        </div>
        <div class="metric-card metric-card--orange" id="stat-today">
          <div class="metric-card__icon">🟠</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Vence Hoje</p>
            <p class="metric-card__value" id="stat-today-val">—</p>
          </div>
        </div>
      </div>
    ` : `
      <div class="dashboard-grid dashboard-grid--4 stagger" style="margin-bottom:2rem;">
        <div class="metric-card" id="stat-total">
          <div class="metric-card__icon">📦</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Total Produtos</p>
            <p class="metric-card__value" id="stat-total-val">—</p>
          </div>
        </div>
        <div class="metric-card metric-card--danger" id="stat-expired">
          <div class="metric-card__icon">🔴</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Vencidos</p>
            <p class="metric-card__value" id="stat-expired-val">—</p>
          </div>
        </div>
        <div class="metric-card metric-card--warning" id="stat-soon">
          <div class="metric-card__icon">⚠️</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Atenção (1-3d)</p>
            <p class="metric-card__value" id="stat-soon-val">—</p>
          </div>
        </div>
        <div class="metric-card metric-card--success" id="stat-ok">
          <div class="metric-card__icon">✅</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Produtos OK</p>
            <p class="metric-card__value" id="stat-ok-val">—</p>
          </div>
        </div>
      </div>
    `;

    return `
      <div class="panel-header">
        <div class="panel-header__left">
          <h2 class="panel-title">📊 Dashboard Brigada de Validade</h2>
          <p class="panel-subtitle">Monitoramento em tempo real — Açougue Varejo</p>
        </div>
        <div class="date-badge">
          <span>📅</span>
          <span id="current-date-badge"></span>
        </div>
      </div>

      ${adminSection}

      <div class="dashboard-grid dashboard-grid--2" style="margin-bottom:2rem;">
        <!-- Gráfico de categorias -->
        <div class="glass-panel">
          <h3 class="glass-panel__title">📊 Produtos por Categoria</h3>
          <div id="category-chart" class="category-chart"></div>
        </div>
        <!-- Timeline de alertas -->
        <div class="glass-panel">
          <h3 class="glass-panel__title">🚨 Alertas de Validade</h3>
          <div id="alerts-timeline" class="alerts-timeline"></div>
        </div>
      </div>

      <!-- Tabela rápida por categoria -->
      <div class="glass-panel" style="margin-bottom:2rem;">
        <div class="glass-panel__header">
          <div style="display:flex; flex-direction:column; gap:4px;">
            <h3 class="glass-panel__title">🏪 Visão por Categoria</h3>
            <p id="dash-table-subtitle" style="font-size:0.75rem; color:var(--text-tertiary);">Visualizando: Todos os produtos</p>
          </div>
          <div class="cat-quick-tabs" id="dash-cat-tabs">
            <button class="cat-tab cat-tab--sm cat-tab--active" data-cat="all">Todos</button>
            ${window.BrigadaAuth.hasSectorAccess('açougue') ? `
            <button class="cat-tab cat-tab--sm" data-cat="aves">🐔 Aves</button>
            <button class="cat-tab cat-tab--sm" data-cat="suino">🐷 Suíno</button>
            <button class="cat-tab cat-tab--sm" data-cat="bovino">🐮 Bovino</button>
            <button class="cat-tab cat-tab--sm" data-cat="pescado">🐟 Pescado</button>
            ` : ''}
            ${window.BrigadaAuth.hasSectorAccess('pereciveis') ? `
            <button class="cat-tab cat-tab--sm" data-cat="laticinios">🧀 Laticínios</button>
            <button class="cat-tab cat-tab--sm" data-cat="frios">🥓 Frios</button>
            <button class="cat-tab cat-tab--sm" data-cat="padaria">🍞 Padaria</button>
            <button class="cat-tab cat-tab--sm" data-cat="hortifruti">🥦 Hortifruti</button>
            ` : ''}
          </div>
        </div>
        <div id="dash-products-table" class="table-scroll"></div>
      </div>

      <!-- Modal de produto -->
      <div class="modal-overlay" id="product-modal" style="display:none;">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title" id="modal-title">Editar Produto</h3>
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
                  <input type="text" id="field-column" class="form-input" placeholder="ex: A">
                </div>
                <div class="form-group">
                  <label class="form-label">Número da Coluna</label>
                  <input type="number" id="field-column-number" class="form-input" placeholder="ex: 3" min="1">
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

  bindEvents(container) {
    // Update date badge
    const badge = container.querySelector('#current-date-badge');
    if (badge) {
      badge.textContent = new Date().toLocaleDateString('pt-BR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    }

    // Category tabs
    container.querySelectorAll('#dash-cat-tabs .cat-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        container.querySelectorAll('#dash-cat-tabs .cat-tab').forEach(t => t.classList.remove('cat-tab--active'));
        tab.classList.add('cat-tab--active');
        this.renderDashProducts(container, tab.dataset.cat);
      });
    });

    // Metric cards click to filter
    const setStatusFilter = (status) => {
      this.currentStatusFilter = status;
      const subtitleEl = container.querySelector('#dash-table-subtitle');
      if (subtitleEl) {
        const labels = {
          all: 'Todos os produtos',
          expired: 'Produtos Vencidos',
          today: 'Produtos Vencendo Hoje',
          soon: 'Produtos em Atenção (1-3 dias)',
          ok: 'Produtos em dia (OK)'
        };
        subtitleEl.textContent = `Visualizando: ${labels[status] || labels.all}`;
      }
      this.renderDashProducts(container, this.currentFilter);
    };

    container.querySelector('#stat-total')?.addEventListener('click', () => setStatusFilter('all'));
    container.querySelector('#stat-expired')?.addEventListener('click', () => setStatusFilter('expired'));
    container.querySelector('#stat-soon')?.addEventListener('click', () => setStatusFilter('soon'));
    container.querySelector('#stat-ok')?.addEventListener('click', () => setStatusFilter('ok'));
    container.querySelector('#stat-today')?.addEventListener('click', () => setStatusFilter('today'));

    // Users metrics redirect
    container.querySelector('#stat-users')?.addEventListener('click', () => {
      window.BrigadaRouter.navigate('users');
    });
    container.querySelector('#stat-active-users')?.addEventListener('click', () => {
      window.BrigadaRouter.navigate('users');
    });

    // Cursor pointer on metrics
    container.querySelectorAll('.metric-card').forEach(card => {
      card.style.cursor = 'pointer';
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

    this.renderDashProducts(container, 'all');
  },

  renderStats(container) {
    const stats = window.BrigadaData.getStats();
    const set = (id, val) => {
      const el = container.querySelector(`#${id}`);
      if (el) el.textContent = val;
    };
    set('stat-total-val', stats.total);
    set('stat-expired-val', stats.expired);
    set('stat-soon-val', stats.expiresSoon);
    set('stat-ok-val', stats.ok);
    set('stat-today-val', stats.expiresToday);
    set('stat-users-val', stats.totalUsers);
    set('stat-active-users-val', stats.activeUsers);
  },

  renderAlertsTimeline(container) {
    const timeline = container.querySelector('#alerts-timeline');
    if (!timeline) return;

    const products = this.getAllowedProducts()
      .map(p => ({ ...p, status: window.BrigadaData.getProductStatus(p) }))
      .filter(p => p.status.days <= 3)
      .sort((a, b) => a.status.days - b.status.days)
      .slice(0, 10);

    if (products.length === 0) {
      timeline.innerHTML = `<div class="empty-state" style="padding:2rem"><div class="empty-state__icon">✅</div><p>Nenhum alerta crítico!</p></div>`;
      return;
    }

    const catIcon = { aves: '🐔', suino: '🐷', bovino: '🐮', pescado: '🐟' };

    timeline.innerHTML = products.map(p => `
      <div class="alert-item alert-item--${p.status.days < 0 ? 'expired' : p.status.days === 0 ? 'today' : 'warning'}">
        <div class="alert-item__icon">${catIcon[p.category]}</div>
        <div class="alert-item__body">
          <p class="alert-item__name">${p.name}</p>
          <p class="alert-item__meta">PLU: ${p.plu} · ${p.location === 'resfriado' ? '❄️ Resfriado' : '🥶 Congelado'}${p.column ? ` (Col. ${p.column}${p.columnNumber ? ` - Nº ${p.columnNumber}` : ''})` : ''}</p>
        </div>
        <div class="alert-item__status">
          <span class="badge ${p.status.class}">${p.status.icon} ${p.status.label}</span>
          <span class="alert-date">${window.BrigadaData.formatDate(p.endDate)}</span>
        </div>
      </div>
    `).join('');
  },

  renderCategoryChart(container) {
    const chart = container.querySelector('#category-chart');
    if (!chart) return;

    let categories = [];
    const labels = { 
      aves: '🐔 Aves', suino: '🐷 Suíno', bovino: '🐮 Bovino', pescado: '🐟 Pescado',
      laticinios: '🧀 Laticínios', frios: '🥓 Frios', padaria: '🍞 Padaria', hortifruti: '🥦 Hortifruti'
    };
    const colors = { 
      aves: '#f59e0b', suino: '#ef4444', bovino: '#a855f7', pescado: '#3b82f6',
      laticinios: '#10b981', frios: '#f59e0b', padaria: '#d97706', hortifruti: '#84cc16'
    };

    if (window.BrigadaAuth.hasSectorAccess('açougue')) {
      categories.push('aves', 'suino', 'bovino', 'pescado');
    }
    if (window.BrigadaAuth.hasSectorAccess('pereciveis')) {
      categories.push('laticinios', 'frios', 'padaria', 'hortifruti');
    }

    const data = categories.map(cat => {
      const products = this.getAllowedProducts().filter(p => p.category === cat);
      const expired = products.filter(p => window.BrigadaData.getProductStatus(p).days < 0).length;
      const warning = products.filter(p => {
        const s = window.BrigadaData.getProductStatus(p);
        return s.days >= 0 && s.days <= 3;
      }).length;
      const ok = products.filter(p => window.BrigadaData.getProductStatus(p).days > 3).length;
      return { cat, label: labels[cat], total: products.length, expired, warning, ok, color: colors[cat] };
    });

    const maxVal = Math.max(...data.map(d => d.total), 1);

    chart.innerHTML = data.map(d => `
      <div class="chart-bar-group">
        <div class="chart-bar-label">${d.label}</div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill" style="width: ${(d.total / maxVal) * 100}%; background: ${d.color}20; border-left: 3px solid ${d.color};">
            <div class="chart-bar-ok" style="width: ${d.total ? (d.ok / d.total) * 100 : 0}%; background: var(--success);"></div>
            <div class="chart-bar-warn" style="width: ${d.total ? (d.warning / d.total) * 100 : 0}%; background: var(--warning);"></div>
            <div class="chart-bar-exp" style="width: ${d.total ? (d.expired / d.total) * 100 : 0}%; background: var(--error);"></div>
          </div>
        </div>
        <div class="chart-bar-stats">
          <span class="chart-stat chart-stat--total">${d.total} total</span>
          <span class="chart-stat chart-stat--ok">${d.ok} OK</span>
          ${d.warning ? `<span class="chart-stat chart-stat--warn">${d.warning} atenção</span>` : ''}
          ${d.expired ? `<span class="chart-stat chart-stat--exp">${d.expired} vencido${d.expired !== 1 ? 's' : ''}</span>` : ''}
        </div>
      </div>
    `).join('');
  },

  renderDashProducts(container, cat) {
    const tableDiv = container.querySelector('#dash-products-table');
    if (!tableDiv) return;

    this.currentFilter = cat;

    let products = this.getAllowedProducts();
    if (cat !== 'all') products = products.filter(p => p.category === cat);

    if (this.currentStatusFilter && this.currentStatusFilter !== 'all') {
      products = products.filter(p => {
        const s = window.BrigadaData.getProductStatus(p);
        if (this.currentStatusFilter === 'expired') return s.days < 0;
        if (this.currentStatusFilter === 'today') return s.days === 0;
        if (this.currentStatusFilter === 'soon') return s.days > 0 && s.days <= 3;
        if (this.currentStatusFilter === 'ok') return s.days > 3;
        return true;
      });
    }

    // Sort: expired first, then by days remaining
    products = products
      .map(p => ({ ...p, _status: window.BrigadaData.getProductStatus(p) }))
      .sort((a, b) => a._status.days - b._status.days);

    const catMap = { 
      aves: '🐔 Aves', suino: '🐷 Suíno', bovino: '🐮 Bovino', pescado: '🐟 Pescado',
      laticinios: '🧀 Laticínios', frios: '🥓 Frios', padaria: '🍞 Padaria', hortifruti: '🥦 Hortifruti'
    };
    const canEditOrDelete = window.BrigadaAuth.canEditOrDeleteProduct();

    tableDiv.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>PLU</th>
            <th>Produto</th>
            <th>Qtd</th>
            <th>Categoria</th>
            <th>Data Inicial</th>
            <th>Validade</th>
            <th>Status</th>
            <th>Localização</th>
            ${canEditOrDelete ? '<th>Ações</th>' : ''}
          </tr>
        </thead>
        <tbody>
          ${products.map(p => `
            <tr>
              <td data-label="PLU"><span class="plu-badge">${p.plu}</span></td>
              <td data-label="Produto" class="product-name">${p.name}</td>
              <td data-label="Qtd"><strong style="color:var(--primary); font-size: 0.95rem;">${p.quantity !== undefined ? p.quantity : 0}</strong> <span style="font-size:0.75rem; color:var(--text-secondary);">${p.unit || 'kg'}</span></td>
              <td data-label="Categoria"><span class="cat-pill cat-pill--${p.category}">${catMap[p.category]}</span></td>
              <td data-label="Data Inicial">${window.BrigadaData.formatDate(p.startDate)}</td>
              <td data-label="Validade">${window.BrigadaData.formatDate(p.endDate)}</td>
              <td data-label="Status"><span class="badge ${p._status.class}">${p._status.icon} ${p._status.label}</span></td>
              <td data-label="Localização">
                ${p.location === 'resfriado' ? '❄️ Resfriado' : '🥶 Congelado'}${p.column ? ` (Col. ${p.column}${p.columnNumber ? ` - Nº ${p.columnNumber}` : ''})` : ''}
              </td>
              ${canEditOrDelete ? `
              <td data-label="Ações" class="actions-cell">
                <button class="btn-icon btn-icon--edit" data-action="edit" data-id="${p.id}" title="Editar">✏️</button>
                <button class="btn-icon btn-icon--delete" data-action="delete" data-id="${p.id}" title="Excluir">🗑️</button>
              </td>` : ''}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    // Bind actions
    tableDiv.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const id = parseInt(btn.dataset.id);
        if (action === 'edit') this.openEditModal(id, container);
        if (action === 'delete') this.openDeleteModal(id, container);
      });
    });
  },

  openEditModal(id, container) {
    if (!window.BrigadaAuth.canEditOrDeleteProduct()) return;
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
    if (!window.BrigadaAuth.canEditOrDeleteProduct()) return;
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
    if (!window.BrigadaAuth.canEditOrDeleteProduct()) {
      window.BrigadaUI.showToast('Permissão negada. Apenas Super Administradores podem salvar produtos.', 'error');
      return;
    }
    const plu = container.querySelector('#field-plu').value.trim();
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

    // Validação local de PLU duplicado
    const duplicate = window.BrigadaData.products.find(
      p => p.plu.trim().toLowerCase() === plu.toLowerCase() && p.id !== this.editingId
    );
    if (duplicate) {
      window.BrigadaUI.showToast(`Não é permitido cadastrar produtos com o mesmo PLU. O PLU "${plu}" já pertence a: ${duplicate.name}.`, 'error');
      return;
    }

    const payload = { plu, name, category, startDate, endDate, supplier, location, unit, quantity, column, columnNumber };

    try {
      if (this.editingId) {
        await window.BrigadaData.updateProduct(this.editingId, payload);
        window.BrigadaUI.showToast('Produto atualizado com sucesso!', 'success');
      }
      this.closeModal(container);
      this.renderStats(container); // Atualiza os contadores do dashboard
      this.renderAlertsTimeline(container); // Atualiza a timeline
      this.renderCategoryChart(container); // Atualiza o gráfico
      this.renderDashProducts(container, this.currentFilter); // Recarrega a tabela do dashboard
    } catch (err) {
      window.BrigadaUI.showToast(err.message || 'Erro ao salvar o produto.', 'error');
    }
  },

  async confirmDelete(container) {
    if (!window.BrigadaAuth.canEditOrDeleteProduct()) {
      window.BrigadaUI.showToast('Permissão negada. Apenas Super Administradores podem excluir produtos.', 'error');
      return;
    }
    await window.BrigadaData.deleteProduct(this.deletingId);
    window.BrigadaUI.showToast('Produto removido.', 'success');
    this.closeDeleteModal(container);
    this.renderStats(container);
    this.renderAlertsTimeline(container);
    this.renderCategoryChart(container);
    this.renderDashProducts(container, this.currentFilter);
  },
};

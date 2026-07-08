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
      <div class="dashboard-grid dashboard-grid--5 stagger">
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
        <div class="metric-card metric-card--info" id="stat-rebaixa">
          <div class="metric-card__icon">📉</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Aguardando Rebaixa</p>
            <p class="metric-card__value" id="stat-rebaixa-val">—</p>
          </div>
        </div>
      </div>
      <div class="dashboard-grid dashboard-grid--2" style="margin-bottom:1rem;">
        <div class="metric-card" id="stat-quebra" style="border-left: 3px solid #ef4444; cursor:pointer;">
          <div class="metric-card__icon">🗑️</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Quebra</p>
            <p class="metric-card__value" id="stat-quebra-val">—</p>
          </div>
        </div>
        <div class="metric-card" id="stat-troca" style="border-left: 3px solid #3b82f6; cursor:pointer;">
          <div class="metric-card__icon">🔄</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Troca</p>
            <p class="metric-card__value" id="stat-troca-val">—</p>
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
      <div class="dashboard-grid dashboard-grid--5 stagger" style="margin-bottom:2rem;">
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
        <div class="metric-card metric-card--info" id="stat-rebaixa">
          <div class="metric-card__icon">📉</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Aguardando Rebaixa</p>
            <p class="metric-card__value" id="stat-rebaixa-val">—</p>
          </div>
        </div>
      </div>
      <div class="dashboard-grid dashboard-grid--2" style="margin-bottom:1rem;">
        <div class="metric-card" id="stat-quebra" style="border-left: 3px solid #ef4444; cursor:pointer;">
          <div class="metric-card__icon">🗑️</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Quebra</p>
            <p class="metric-card__value" id="stat-quebra-val">—</p>
          </div>
        </div>
        <div class="metric-card" id="stat-troca" style="border-left: 3px solid #3b82f6; cursor:pointer;">
          <div class="metric-card__icon">🔄</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Troca</p>
            <p class="metric-card__value" id="stat-troca-val">—</p>
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

      <!-- Top Quebras Widget -->
      <div class="dashboard-grid dashboard-grid--2" style="margin-bottom:1.5rem;">
        <div class="glass-panel" style="display:flex; flex-direction:column; justify-content:center; padding: 1.5rem;">
          <h3 class="glass-panel__title" style="margin-bottom:1rem;">🏆 Top Quebras (Nesta Semana)</h3>
          <div style="display:flex; align-items:center; gap: 1rem;">
            <div style="font-size:2.5rem; background:rgba(239,68,68,0.1); border-radius:50%; padding:0.5rem; width:60px; height:60px; display:flex; align-items:center; justify-content:center;">🗑️</div>
            <div>
              <p style="font-size:1.1rem; font-weight:bold; color:var(--text-primary);" id="top-quebra-week-name">Calculando...</p>
              <p style="font-size:0.9rem; color:var(--error);" id="top-quebra-week-count">...</p>
            </div>
          </div>
        </div>
        <div class="glass-panel" style="display:flex; flex-direction:column; justify-content:center; padding: 1.5rem;">
          <h3 class="glass-panel__title" style="margin-bottom:1rem;">🏆 Top Quebras (Neste Mês)</h3>
          <div style="display:flex; align-items:center; gap: 1rem;">
            <div style="font-size:2.5rem; background:rgba(239,68,68,0.1); border-radius:50%; padding:0.5rem; width:60px; height:60px; display:flex; align-items:center; justify-content:center;">📅</div>
            <div>
              <p style="font-size:1.1rem; font-weight:bold; color:var(--text-primary);" id="top-quebra-month-name">Calculando...</p>
              <p style="font-size:0.9rem; color:var(--error);" id="top-quebra-month-count">...</p>
            </div>
          </div>
        </div>
      </div>

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
            <p id="dash-table-subtitle" style="font-size:0.95rem; font-weight:600; color:var(--text-secondary);">Visualizando: Todos os produtos</p>
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
    const setStatusFilter = (status, clickedCard) => {
      // Toggle: clicking same card again clears filter
      if (this.currentStatusFilter === status && status !== 'all') {
        status = 'all';
        clickedCard = container.querySelector('#stat-total');
      }
      this.currentStatusFilter = status;

      // Visual feedback — highlight active card
      container.querySelectorAll('.metric-card').forEach(c => c.classList.remove('metric-card--active'));
      if (clickedCard) clickedCard.classList.add('metric-card--active');

      const subtitleEl = container.querySelector('#dash-table-subtitle');
      if (subtitleEl) {
        const labels = {
          all: 'Todos os produtos',
          expired: 'Produtos Vencidos',
          today: 'Produtos Vencendo Hoje',
          soon: 'Produtos em Atenção (1-3 dias)',
          ok: 'Produtos em dia (OK)',
          rebaixa: 'Produtos Aguardando Rebaixa',
          quebra: '🗑️ Produtos em Quebra',
          troca: '🔄 Produtos em Troca'
        };
        subtitleEl.textContent = `Visualizando: ${labels[status] || labels.all}`;
      }
      this.renderDashProducts(container, this.currentFilter);

      // Scroll suave para a tabela de produtos
      const tableSection = container.querySelector('#dash-products-table');
      if (tableSection) {
        tableSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    };

    container.querySelector('#stat-total')?.addEventListener('click', (e) => setStatusFilter('all', e.currentTarget));
    container.querySelector('#stat-expired')?.addEventListener('click', (e) => setStatusFilter('expired', e.currentTarget));
    container.querySelector('#stat-soon')?.addEventListener('click', (e) => setStatusFilter('soon', e.currentTarget));
    container.querySelector('#stat-ok')?.addEventListener('click', (e) => setStatusFilter('ok', e.currentTarget));
    container.querySelector('#stat-today')?.addEventListener('click', (e) => setStatusFilter('today', e.currentTarget));
    container.querySelector('#stat-rebaixa')?.addEventListener('click', (e) => setStatusFilter('rebaixa', e.currentTarget));
    container.querySelector('#stat-quebra')?.addEventListener('click', (e) => setStatusFilter('quebra', e.currentTarget));
    container.querySelector('#stat-troca')?.addEventListener('click', (e) => setStatusFilter('troca', e.currentTarget));

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
    set('stat-rebaixa-val', stats.awaitingReduction);
    set('stat-quebra-val', stats.quebra);
    set('stat-troca-val', stats.troca);

    // Cálculo do Top Quebras
    const quebraProducts = window.BrigadaData.products.filter(p => p.expiredAction === 'quebra');
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const calcTop = (items) => {
      if (items.length === 0) return { name: 'Nenhuma quebra registrada', count: '-' };
      const counts = {};
      items.forEach(i => counts[i.plu] = (counts[i.plu] || 0) + (i.quantity ? parseFloat(i.quantity) : 1));
      
      let topPlu = null;
      let maxCount = -1;
      for (const plu in counts) {
        if (counts[plu] > maxCount) {
          maxCount = counts[plu];
          topPlu = plu;
        }
      }
      const topItem = items.find(i => i.plu === topPlu);
      return { name: topItem.name, count: maxCount };
    };

    const weekItems = quebraProducts.filter(p => new Date(p.endDate) >= oneWeekAgo);
    const monthItems = quebraProducts.filter(p => new Date(p.endDate) >= oneMonthAgo);

    const topWeek = calcTop(weekItems);
    const topMonth = calcTop(monthItems);

    set('top-quebra-week-name', topWeek.name);
    set('top-quebra-week-count', topWeek.count !== '-' ? `Quantidade: ${topWeek.count}` : '');
    set('top-quebra-month-name', topMonth.name);
    set('top-quebra-month-count', topMonth.count !== '-' ? `Quantidade: ${topMonth.count}` : '');
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
          <p class="alert-item__meta">PLU: ${p.plu} · ${window.BrigadaData.formatLocationFriendly(p)}</p>
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
        if (this.currentStatusFilter === 'rebaixa') return !!p.isAwaitingReduction;
        if (this.currentStatusFilter === 'quebra') return p.expiredAction === 'quebra';
        if (this.currentStatusFilter === 'troca') return p.expiredAction === 'troca';
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
    const showActions = products.some(p => window.BrigadaAuth.canEditProduct(p) || window.BrigadaAuth.canDeleteProduct(p));

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
            ${showActions ? '<th>Ações</th>' : ''}
          </tr>
        </thead>
        <tbody>
          ${products.map(p => {
            const canEditThis = window.BrigadaAuth.canEditProduct(p);
            const canDeleteThis = window.BrigadaAuth.canDeleteProduct(p);
            return `
            <tr>
              <td data-label="PLU"><span class="plu-badge">${p.plu}</span></td>
              <td data-label="Produto" class="product-name">
                <div>${p.name}</div>
                ${p.createdBy ? `<div style="font-size:0.7rem; color:#a78bfa; margin-top:2px; font-weight: 500;" title="${p.createdBy}">👤 ${window.BrigadaData.getUserNameByEmail(p.createdBy)}</div>` : ''}
              </td>
              <td data-label="Qtd"><strong style="color:var(--primary); font-size: 0.95rem;">${p.quantity !== undefined ? p.quantity : 0}</strong> <span style="font-size:0.75rem; color:var(--text-secondary);">${p.unit || 'kg'}</span></td>
              <td data-label="Categoria"><span class="cat-pill cat-pill--${p.category}">${catMap[p.category]}</span></td>
              <td data-label="Data Inicial">${window.BrigadaData.formatDate(p.startDate)}</td>
              <td data-label="Validade">${window.BrigadaData.formatDate(p.endDate)}</td>
              <td data-label="Status">
                <div style="display:flex; flex-direction:column; gap:4px;">
                  <span class="badge ${p._status.class}">${p._status.icon} ${p._status.label}</span>
                  ${p.isAwaitingReduction ? `
                    <span class="badge" style="background:${p.rebaixaStatus === 'ok' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)'}; color:${p.rebaixaStatus === 'ok' ? '#34d399' : '#fbbf24'}; border:1px solid ${p.rebaixaStatus === 'ok' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}; font-size:0.65rem;">
                      ${p.rebaixaStatus === 'ok' ? '🟢 Rebaixa OK' : '🟡 Aguardando'}
                    </span>
                  ` : ''}
                </div>
              </td>
              <td data-label="Localização">
                ${window.BrigadaData.formatLocationFriendly(p)}
              </td>
              ${showActions ? `
              <td data-label="Ações" class="actions-cell">
                ${p.isAwaitingReduction && canEditThis ? `<button class="btn-icon" data-action="toggle-rebaixa" data-id="${p.id}" title="${p.rebaixaStatus === 'ok' ? 'Voltar para Aguardando' : 'Marcar Rebaixa OK'}">${p.rebaixaStatus === 'ok' ? '↩️' : '✅'}<span class="btn-label">${p.rebaixaStatus === 'ok' ? 'Voltar' : 'Rebaixa'}</span></button>` : ''}
                ${p._status.days < 0 && canEditThis ? `
                  ${p.expiredAction !== 'quebra' ? `<button class="btn-icon" data-action="set-quebra" data-id="${p.id}" title="Marcar como Quebra">🗑️<span class="btn-label">Quebra</span></button>` : ''}
                  ${p.expiredAction !== 'troca' ? `<button class="btn-icon" data-action="set-troca" data-id="${p.id}" title="Marcar como Troca">🔄<span class="btn-label">Troca</span></button>` : ''}
                  ${p.expiredAction ? `<button class="btn-icon" data-action="clear-expired" data-id="${p.id}" title="Desfazer Ação">↩️<span class="btn-label">Desfazer</span></button>` : ''}
                ` : ''}
                ${canEditThis ? `<button class="btn-icon btn-icon--edit" data-action="edit" data-id="${p.id}" title="Editar">✏️<span class="btn-label">Editar</span></button>` : ''}
                ${canDeleteThis ? `<button class="btn-icon btn-icon--delete" data-action="delete" data-id="${p.id}" title="Excluir">🗑️<span class="btn-label">Excluir</span></button>` : ''}
              </td>` : ''}
            </tr>`;
          }).join('')}
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
        if (action === 'toggle-rebaixa') {
          const product = window.BrigadaData.products.find(x => x.id === id);
          const newStatus = product.rebaixaStatus === 'ok' ? 'aguardando' : 'ok';
          window.BrigadaData.setAwaitingReduction([id], true, newStatus).then(() => {
            this.renderDashProducts(container, this.currentFilter);
            this.renderStats(container);
          });
        }
        if (action === 'set-quebra') {
          window.BrigadaData.setExpiredAction(id, 'quebra').then(() => {
            this.renderDashProducts(container, this.currentFilter);
            this.renderStats(container);
          });
        }
        if (action === 'set-troca') {
          window.BrigadaData.setExpiredAction(id, 'troca').then(() => {
            this.renderDashProducts(container, this.currentFilter);
            this.renderStats(container);
          });
        }
        if (action === 'clear-expired') {
          window.BrigadaData.setExpiredAction(id, null).then(() => {
            this.renderDashProducts(container, this.currentFilter);
            this.renderStats(container);
          });
        }
      });
    });
  },

  openEditModal(id, container) {
    const product = window.BrigadaData.products.find(p => p.id === id);
    if (!product || !window.BrigadaAuth.canEditProduct(product)) return;
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
        window.BrigadaUI.showToast('Permissão negada. Você não tem permissão para salvar este produto.', 'error');
        return;
      }
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
    const product = window.BrigadaData.products.find(p => p.id === this.deletingId);
    if (!product || !window.BrigadaAuth.canDeleteProduct(product)) {
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

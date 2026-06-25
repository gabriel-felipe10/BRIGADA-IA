/**
 * BRIGADA-IA — Dashboard Brigada de Validade
 */

window.BrigadaDashboard = {
  render(container, role) {
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
        <div class="metric-card">
          <div class="metric-card__icon">👥</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Total Usuários</p>
            <p class="metric-card__value" id="stat-users-val">—</p>
          </div>
        </div>
        <div class="metric-card metric-card--success">
          <div class="metric-card__icon">🟢</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Usuários Ativos</p>
            <p class="metric-card__value" id="stat-active-users-val">—</p>
          </div>
        </div>
        <div class="metric-card metric-card--orange">
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
        <div class="metric-card metric-card--danger">
          <div class="metric-card__icon">🔴</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Vencidos</p>
            <p class="metric-card__value" id="stat-expired-val">—</p>
          </div>
        </div>
        <div class="metric-card metric-card--warning">
          <div class="metric-card__icon">⚠️</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Atenção (1-3d)</p>
            <p class="metric-card__value" id="stat-soon-val">—</p>
          </div>
        </div>
        <div class="metric-card metric-card--success">
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
          <h3 class="glass-panel__title">🏪 Visão por Categoria</h3>
          <div class="cat-quick-tabs" id="dash-cat-tabs">
            <button class="cat-tab cat-tab--sm cat-tab--active" data-cat="all">Todos</button>
            <button class="cat-tab cat-tab--sm" data-cat="aves">🐔 Aves</button>
            <button class="cat-tab cat-tab--sm" data-cat="suino">🐷 Suíno</button>
            <button class="cat-tab cat-tab--sm" data-cat="pescado">🐟 Pescado</button>
          </div>
        </div>
        <div id="dash-products-table" class="table-scroll"></div>
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

    const products = window.BrigadaData.products
      .map(p => ({ ...p, status: window.BrigadaData.getProductStatus(p) }))
      .filter(p => p.status.days <= 3)
      .sort((a, b) => a.status.days - b.status.days)
      .slice(0, 10);

    if (products.length === 0) {
      timeline.innerHTML = `<div class="empty-state" style="padding:2rem"><div class="empty-state__icon">✅</div><p>Nenhum alerta crítico!</p></div>`;
      return;
    }

    const catIcon = { aves: '🐔', suino: '🐷', pescado: '🐟' };

    timeline.innerHTML = products.map(p => `
      <div class="alert-item alert-item--${p.status.days < 0 ? 'expired' : p.status.days === 0 ? 'today' : 'warning'}">
        <div class="alert-item__icon">${catIcon[p.category]}</div>
        <div class="alert-item__body">
          <p class="alert-item__name">${p.name}</p>
          <p class="alert-item__meta">PLU: ${p.plu} · ${p.location === 'resfriado' ? '❄️ Resfriado' : p.location === 'congelado' ? '🥶 Congelado' : p.location || '—'}</p>
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

    const categories = ['aves', 'suino', 'pescado'];
    const labels = { aves: '🐔 Aves', suino: '🐷 Suíno', pescado: '🐟 Pescado' };
    const colors = { aves: '#f59e0b', suino: '#ef4444', pescado: '#3b82f6' };

    const data = categories.map(cat => {
      const products = window.BrigadaData.products.filter(p => p.category === cat);
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

    let products = window.BrigadaData.products;
    if (cat !== 'all') products = products.filter(p => p.category === cat);

    // Sort: expired first, then by days remaining
    products = products
      .map(p => ({ ...p, _status: window.BrigadaData.getProductStatus(p) }))
      .sort((a, b) => a._status.days - b._status.days);

    const catMap = { aves: '🐔 Aves', suino: '🐷 Suíno', pescado: '🐟 Pescado' };

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
          </tr>
        </thead>
        <tbody>
          ${products.map(p => `
            <tr>
              <td><span class="plu-badge">${p.plu}</span></td>
              <td class="product-name">${p.name}</td>
              <td><strong style="color:var(--primary); font-size: 0.95rem;">${p.quantity !== undefined ? p.quantity : 0}</strong> <span style="font-size:0.75rem; color:var(--text-secondary);">${p.unit || 'kg'}</span></td>
              <td><span class="cat-pill cat-pill--${p.category}">${catMap[p.category]}</span></td>
              <td>${window.BrigadaData.formatDate(p.startDate)}</td>
              <td>${window.BrigadaData.formatDate(p.endDate)}</td>
              <td><span class="badge ${p._status.class}">${p._status.icon} ${p._status.label}</span></td>
              <td>
                ${p.location === 'resfriado' ? '<span class="badge" style="background:rgba(96,165,250,0.1); color:#60a5fa; border:1px solid rgba(96,165,250,0.2);">❄️ Resfriado</span>' : 
                  p.location === 'congelado' ? '<span class="badge" style="background:rgba(139,92,246,0.1); color:#a78bfa; border:1px solid rgba(139,92,246,0.2);">🥶 Congelado</span>' : 
                  p.location || '—'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  },
};

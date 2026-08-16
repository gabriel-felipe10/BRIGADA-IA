/**
 * BRIGADA-IA — Dashboard Brigada de Validade
 */
window.BrigadaDashboard = {
  currentFilter: 'all',
  currentStatusFilter: 'all',
  editingId: null,
  deletingId: null,
  currentYear: 'all',
  currentMonth: 'all',
  currentDay: 'all',

  getAllowedProducts() {
    let products = window.BrigadaData.products;
    if (window.BrigadaAuth.currentUser) {
      const sector = window.BrigadaAuth.currentUser.sector;
      if (sector === 'açougue') {
        products = products.filter(p => ['aves', 'suino', 'bovino', 'pescado'].includes(p.category));
      } else if (sector === 'pereciveis') {
        products = products.filter(p => ['iogurtes', 'laticinios', 'frios', 'pereciveis', 'perecíveis'].includes(p.category));
      } else if (sector === 'padaria') {
        products = products.filter(p => p.category === 'padaria');
      } else if (sector === 'hortifruti') {
        products = products.filter(p => p.category === 'hortifruti');
      } else if (sector === 'mercearia') {
        products = products.filter(p => p.category === 'mercearia');
      }
    }
    return products;
  },

  getFilteredProducts() {
    let list = this.getAllowedProducts();

    if (this.currentYear !== 'all') {
      list = list.filter(p => {
        if (!p.endDate) return false;
        const [y] = p.endDate.split('-');
        return y === this.currentYear;
      });
    }

    if (this.currentMonth !== 'all') {
      list = list.filter(p => {
        if (!p.endDate) return false;
        const [, m] = p.endDate.split('-');
        return m === this.currentMonth;
      });
    }

    if (this.currentDay !== 'all') {
      list = list.filter(p => {
        if (!p.endDate) return false;
        const [, , d] = p.endDate.split('-');
        return d === this.currentDay;
      });
    }

    return list;
  },

  render(container, role) {
    this.currentFilter = 'all';
    this.currentStatusFilter = 'all';
    this.currentYear = 'all';
    this.currentMonth = 'all';
    this.currentDay = 'all';
    
    if (window.BrigadaAuth.isPromotor()) {
      container.innerHTML = this.buildPromotorHTML();
      this.bindPromotorEvents(container);
      return;
    }

    const isSuperAdmin = role === 'superadmin';
    container.innerHTML = this.buildHTML(isSuperAdmin);
    this.bindEvents(container);
    this.refreshData(container);
  },

  refreshData(container) {
    this.renderStats(container);
    this.renderAlertsTimeline(container);
    this.renderDashProducts(container, this.currentFilter || 'all');
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
            <p class="metric-card__label">Atenção (1-3 Dias)</p>
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
      <div class="dashboard-grid dashboard-grid--6" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--sp-lg); margin-bottom: 1rem;">
        <div class="metric-card" id="stat-resfriado15" style="border-left: 3px solid #0ea5e9; cursor:pointer;" title="Filtrar Alerta Resfriados (≤ 15 dias)">
          <div class="metric-card__icon">❄️</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Alerta 15 Dias (Resfriados)</p>
            <p class="metric-card__value" id="stat-resfriado15-val" style="color: #38bdf8;">—</p>
          </div>
        </div>
        <div class="metric-card" id="stat-congelado30" style="border-left: 3px solid #6366f1; cursor:pointer;" title="Filtrar Alerta Congelados (≤ 30 dias)">
          <div class="metric-card__icon">🥶</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Alerta 30 Dias (Congelados)</p>
            <p class="metric-card__value" id="stat-congelado30-val" style="color: #818cf8;">—</p>
          </div>
        </div>
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
        <div class="metric-card" id="stat-tratado" style="border-left: 3px solid #10b981; cursor:pointer;">
          <div class="metric-card__icon">✔️</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Tratados com Sucesso</p>
            <p class="metric-card__value" id="stat-tratado-val">—</p>
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
            <p class="metric-card__label">Atenção (1-3 Dias)</p>
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
      <div class="dashboard-grid dashboard-grid--6" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--sp-lg); margin-bottom: 1.5rem;">
        <div class="metric-card" id="stat-resfriado15" style="border-left: 3px solid #0ea5e9; cursor:pointer;" title="Filtrar Alerta Resfriados (≤ 15 dias)">
          <div class="metric-card__icon">❄️</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Alerta 15 Dias (Resfriados)</p>
            <p class="metric-card__value" id="stat-resfriado15-val" style="color: #38bdf8;">—</p>
          </div>
        </div>
        <div class="metric-card" id="stat-congelado30" style="border-left: 3px solid #6366f1; cursor:pointer;" title="Filtrar Alerta Congelados (≤ 30 dias)">
          <div class="metric-card__icon">🥶</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Alerta 30 Dias (Congelados)</p>
            <p class="metric-card__value" id="stat-congelado30-val" style="color: #818cf8;">—</p>
          </div>
        </div>
        <div class="metric-card metric-card--orange" id="stat-today">
          <div class="metric-card__icon">🟠</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Vence Hoje</p>
            <p class="metric-card__value" id="stat-today-val">—</p>
          </div>
        </div>
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
        <div class="metric-card" id="stat-tratado" style="border-left: 3px solid #10b981; cursor:pointer;">
          <div class="metric-card__icon">✔️</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Tratados com Sucesso</p>
            <p class="metric-card__value" id="stat-tratado-val">—</p>
          </div>
        </div>
      </div>
    `;

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

      <!-- Barra de Filtros por Data de Vencimento -->
      <div class="toolbar" style="margin-bottom: 1.5rem; display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 12px; border: 1px solid var(--glass-border);">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.2rem;">🔍</span>
          <span style="font-weight: 500; font-size: 0.95rem; color: var(--text-secondary);">Filtrar Validade:</span>
        </div>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center;">
          <select id="dash-filter-day" class="select-control" style="padding: 0.4rem 2rem 0.4rem 1rem; min-width: 90px; height: 38px;">
            ${dayOptions}
          </select>
          <select id="dash-filter-month" class="select-control" style="padding: 0.4rem 2rem 0.4rem 1rem; min-width: 130px; height: 38px;">
            ${monthOptions}
          </select>
          <select id="dash-filter-year" class="select-control" style="padding: 0.4rem 2rem 0.4rem 1rem; min-width: 110px; height: 38px;">
            ${yearOptions}
          </select>
          <button id="btn-clear-dash-filters" class="btn btn--ghost" style="padding: 0 1rem; height: 38px; font-size: 0.85rem; display: flex; align-items: center; gap: 0.25rem; border-radius: var(--r-full);">
            <span>🧹</span> Limpar
          </button>
        </div>
      </div>

      ${adminSection}

      <div style="margin-bottom:2rem;">
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
            ${window.BrigadaAuth.hasSectorAccess('padaria') ? `
            <button class="cat-tab cat-tab--sm" data-cat="padaria">🍞 Padaria</button>
            ` : ''}
            ${window.BrigadaAuth.hasSectorAccess('hortifruti') ? `
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
                <div class="form-group" style="position: relative;">
                  <label class="form-label">PLU *</label>
                  <input type="text" id="field-plu" class="form-input" placeholder="ex: AV001" autocomplete="off" required>
                  <div id="plu-suggestions" class="autocomplete-suggestions"></div>
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
                  <label class="form-label">Data de Cadastro</label>
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
                    <option value="resfriado">❄️ Câmara Resfriada</option>
                    <option value="congelado">🥶 Câmara Congelada</option>
                    <option value="piso_loja">🏪 Piso de Loja</option>
                  </select>
                </div>
              </div>
              <!-- Seletor de Posição da Câmara Fria -->
              <div class="form-row" id="row-chamber-slots" style="display: none; background: rgba(56,189,248,0.06); padding: 10px; border-radius: 8px; border: 1px solid rgba(56,189,248,0.2); margin-bottom: 1rem;">
                <div class="form-group">
                  <label class="form-label" style="color: #38bdf8;">Coluna *</label>
                  <select id="field-chamber-col" class="form-input">
                    <option value="">Selecione a coluna...</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" style="color: #38bdf8;">Nível *</label>
                  <select id="field-chamber-level" class="form-input">
                    <option value="">Selecione o nível...</option>
                    <option value="1">📦 Nível 1 — Piso (Chão)</option>
                    <option value="2">🏗️ Nível 2 — Aéreo</option>
                    <option value="3">🏗️ Nível 3 — Aéreo</option>
                    <option value="4">🏗️ Nível 4 — Aéreo (Topo)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" style="color: #38bdf8;">Posição *</label>
                  <select id="field-chamber-pos" class="form-input">
                    <option value="">Selecione o lado...</option>
                    <option value="E">⬅️ Esquerda (E)</option>
                    <option value="D">➡️ Direita (D)</option>
                  </select>
                </div>
              </div>
              <!-- Seletor de Freezer do Piso de Loja -->
              <div class="form-row" id="row-freezer-slots" style="display: none; background: rgba(16,185,129,0.06); padding: 10px; border-radius: 8px; border: 1px solid rgba(16,185,129,0.2); margin-bottom: 1rem;">
                <div class="form-group">
                  <label class="form-label" style="color: #34d399;">Freezer do Piso de Loja</label>
                  <select id="field-freezer-num" class="form-input">
                    <option value="">Geral / Sem freezer específico</option>
                    <optgroup label="🐔 Aves">
                      <option value="FZ17">Freezer 17</option>
                      <option value="FZ18">Freezer 18</option>
                      <option value="FZ19">Freezer 19</option>
                      <option value="FZ20">Freezer 20</option>
                      <option value="FZ21">Freezer 21</option>
                      <option value="FZ22">Freezer 22</option>
                      <option value="FZ23">Freezer 23</option>
                      <option value="FZ24">Freezer 24</option>
                      <option value="FZ25">Freezer 25</option>
                      <option value="FZ29">Freezer 29</option>
                      <option value="FZ30">Freezer 30</option>
                      <option value="FZ31">Freezer 31</option>
                      <option value="FZ32">Freezer 32</option>
                    </optgroup>
                    <optgroup label="🐮 Bovino">
                      <option value="FZ26">Freezer 26</option>
                      <option value="FZ27">Freezer 27</option>
                      <option value="FZ28">Freezer 28</option>
                      <option value="FZ40">Freezer 40</option>
                      <option value="FZ41">Freezer 41</option>
                    </optgroup>
                    <optgroup label="🐷 Suínos">
                      <option value="FZ34">Freezer 34</option>
                      <option value="FZ35">Freezer 35</option>
                    </optgroup>
                    <optgroup label="🥩 Bovino / Suíno / Aves">
                      <option value="FZ36">Freezer 36</option>
                      <option value="FZ37">Freezer 37</option>
                      <option value="FZ38">Freezer 38</option>
                      <option value="FZ39">Freezer 39</option>
                    </optgroup>
                    <optgroup label="🐟 Pescado">
                      <option value="FZ42">Freezer 42</option>
                      <option value="FZ43">Freezer 43</option>
                      <option value="FZ44">Freezer 44</option>
                      <option value="FZ45">Freezer 45</option>
                      <option value="FZ46">Freezer 46</option>
                      <option value="FZ47">Freezer 47</option>
                      <option value="FZ48">Freezer 48</option>
                    </optgroup>
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
                  </select>
                </div>
              </div>
              <div class="form-row" id="annotation-info-banner" style="display: none; margin-top: 1rem; width: 100%;">
                <div style="background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 6px; padding: 8px 12px; width: 100%; display: flex; justify-content: space-between; font-size: 0.85rem; color: #f8fafc;">
                  <div><strong>Quantidade Anterior:</strong> <span id="info-original-quantity">0</span></div>
                  <div><strong>Data da Alteração:</strong> <span id="info-change-date">--/--/----</span></div>
                </div>
              </div>
              <div class="form-row" id="group-annotation" style="display: none; margin-top: 1rem;">
                <div class="form-group" style="width: 100%;">
                  <label class="form-label" style="color: #f8fafc; font-weight: 600;">O que aconteceu com o restante do produto? *</label>
                  <div style="display: flex; gap: 0.5rem;">
                    <div class="annotation-buttons-container" style="display: flex; gap: 0.5rem; flex-wrap: wrap; width: 100%;">
                    <button type="button" class="btn btn--outline annotation-btn" data-value="quebra" style="flex: 1; min-width: 80px;">Quebra</button>
                    <button type="button" class="btn btn--outline annotation-btn" data-value="troca" style="flex: 1; min-width: 80px;">Troca</button>
                    <button type="button" class="btn btn--outline annotation-btn" data-value="rebaixa" style="flex: 1; min-width: 80px;">Rebaixa</button>
                    <button type="button" class="btn btn--outline annotation-btn" data-value="vendido" style="flex: 1; min-width: 80px;">Vendido</button>
                    <button type="button" class="btn btn--outline annotation-btn btn--danger-outline" data-value="excluir" style="flex: 1.2; min-width: 110px;">Excluir o item</button>
                  </div>
                  <input type="hidden" id="field-annotation" value="">
                    <input type="text" id="field-annotation-text" class="form-input" style="flex: 2; display: none;" placeholder="Detalhes (obrigatório)" maxlength="100">
                  </div>
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

      <!-- Modal Top 10 -->
      <div class="modal-overlay" id="top10-modal" style="display:none; z-index: 2000;">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title" id="top10-modal-title">🏆 Top 10</h3>
            <button class="modal-close" id="top10-modal-close">✕</button>
          </div>
          <div class="modal-body">
            <div id="top10-list" class="table-scroll"></div>
          </div>
          <div class="modal-footer">
            <button class="btn btn--ghost" id="btn-cancel-top10">Fechar</button>
            <button class="btn btn--primary" id="btn-print-top10">🖨️ Imprimir</button>
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

      <!-- Status Panel Overlay -->
      <div class="status-panel-overlay" id="status-panel-overlay">
        <div class="status-panel">
          <div class="status-panel__header">
            <div class="status-panel__title">
              <span id="status-panel-title-text">Produtos</span>
              <span class="status-panel__count" id="status-panel-count">0</span>
            </div>
            <button class="status-panel__close" id="status-panel-close">✕</button>
          </div>
          <div class="status-panel__filters" id="status-panel-cat-tabs" style="padding: 0.75rem 1.25rem; background: rgba(255,255,255,0.03); border-bottom: 1px solid var(--glass-border); display: flex; gap: 0.5rem; overflow-x: auto; align-items: center; white-space: nowrap;">
            <button class="cat-tab cat-tab--sm cat-tab--active" data-panel-cat="all">Todos</button>
            ${window.BrigadaAuth.hasSectorAccess('açougue') ? `
            <button class="cat-tab cat-tab--sm" data-panel-cat="aves">🐔 Aves</button>
            <button class="cat-tab cat-tab--sm" data-panel-cat="suino">🐷 Suíno</button>
            <button class="cat-tab cat-tab--sm" data-panel-cat="bovino">🐮 Bovino</button>
            <button class="cat-tab cat-tab--sm" data-panel-cat="pescado">🐟 Pescado</button>
            ` : ''}
            ${window.BrigadaAuth.hasSectorAccess('padaria') ? `
            <button class="cat-tab cat-tab--sm" data-panel-cat="padaria">🍞 Padaria</button>
            ` : ''}
            ${window.BrigadaAuth.hasSectorAccess('hortifruti') ? `
            <button class="cat-tab cat-tab--sm" data-panel-cat="hortifruti">🥦 Hortifruti</button>
            ` : ''}
          </div>
          <div class="status-panel__body" id="status-panel-body"></div>
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

    // Set up filter change listeners
    const selectDay = container.querySelector('#dash-filter-day');
    const selectMonth = container.querySelector('#dash-filter-month');
    const selectYear = container.querySelector('#dash-filter-year');
    const btnClear = container.querySelector('#btn-clear-dash-filters');

    const handleFilterChange = () => {
      this.currentDay = selectDay ? selectDay.value : 'all';
      this.currentMonth = selectMonth ? selectMonth.value : 'all';
      this.currentYear = selectYear ? selectYear.value : 'all';
      this.refreshData(container);
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
        this.refreshData(container);
      });
    }

    // Category tabs
    container.querySelectorAll('#dash-cat-tabs .cat-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        container.querySelectorAll('#dash-cat-tabs .cat-tab').forEach(t => t.classList.remove('cat-tab--active'));
        tab.classList.add('cat-tab--active');
        this.currentFilter = tab.dataset.cat;
        this.renderDashProducts(container, this.currentFilter);
      });
    });

    // Metric cards click to filter — opens custom status panel
    const setStatusFilter = (status, clickedCard) => {
      const isPanelOpen = container.querySelector('#status-panel-overlay')?.classList.contains('status-panel-overlay--visible');
      // Toggle: clicking same card again closes the panel
      if (this.currentStatusFilter === status && isPanelOpen) {
        this.closeStatusPanel(container);
        return;
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
          troca: '🔄 Produtos em Troca',
          tratado: '✔️ Produtos Tratados com Sucesso'
        };
        subtitleEl.textContent = `Visualizando: ${labels[status] || labels.all}`;
      }
      this.renderDashProducts(container, this.currentFilter);

      // Open the custom status panel (including for 'all')
      this.openStatusPanel(container, status);
    };

    container.querySelector('#stat-total')?.addEventListener('click', (e) => setStatusFilter('all', e.currentTarget));
    container.querySelector('#stat-expired')?.addEventListener('click', (e) => setStatusFilter('expired', e.currentTarget));
    container.querySelector('#stat-soon')?.addEventListener('click', (e) => setStatusFilter('soon', e.currentTarget));
    container.querySelector('#stat-resfriado15')?.addEventListener('click', (e) => setStatusFilter('resfriado15', e.currentTarget));
    container.querySelector('#stat-congelado30')?.addEventListener('click', (e) => setStatusFilter('congelado30', e.currentTarget));
    container.querySelector('#stat-ok')?.addEventListener('click', (e) => setStatusFilter('ok', e.currentTarget));
    container.querySelector('#stat-today')?.addEventListener('click', (e) => setStatusFilter('today', e.currentTarget));
    container.querySelector('#stat-rebaixa')?.addEventListener('click', (e) => setStatusFilter('rebaixa', e.currentTarget));
    container.querySelector('#stat-quebra')?.addEventListener('click', (e) => setStatusFilter('quebra', e.currentTarget));
    container.querySelector('#stat-troca')?.addEventListener('click', (e) => setStatusFilter('troca', e.currentTarget));
    container.querySelector('#stat-tratado')?.addEventListener('click', (e) => setStatusFilter('tratado', e.currentTarget));

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
    
    // Print button
    container.querySelector('#btn-print-top10')?.addEventListener('click', () => {
      this.printTop10(container.querySelector('#top10-modal-title').textContent, this.currentTop10Data);
    });
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

    // Initialize PLU catalog autocomplete
    window.BrigadaUI.setupPluAutocomplete(container, '#field-plu', '#plu-suggestions', {
      name: '#field-name',
      category: '#field-category',
      unit: '#field-unit'
    });

    // Listener para o campo de localização alternar seletores de Câmara e Freezer
    const locSelect = container.querySelector('#field-location');
    const chamberSlotsRow = container.querySelector('#row-chamber-slots');
    const freezerSlotsRow = container.querySelector('#row-freezer-slots');
    const chamberColSelect = container.querySelector('#field-chamber-col');

    const updateLocationSlots = (locVal) => {
      if (locVal === 'resfriado' || locVal === 'congelado') {
        if (chamberSlotsRow) chamberSlotsRow.style.display = 'flex';
        if (freezerSlotsRow) freezerSlotsRow.style.display = 'none';
        
        const count = locVal === 'resfriado' ? 4 : 16;
        const currentSelected = chamberColSelect ? chamberColSelect.value : '';
        if (chamberColSelect) {
          chamberColSelect.innerHTML = '<option value="">Selecione a coluna...</option>' + 
            Array.from({ length: count }, (_, i) => {
              const col = i + 1;
              const pad = col.toString().padStart(2, '0');
              return `<option value="${col}">Coluna ${pad}</option>`;
            }).join('');
          if (currentSelected && parseInt(currentSelected, 10) <= count) {
            chamberColSelect.value = currentSelected;
          }
        }
      } else if (locVal === 'piso_loja') {
        if (chamberSlotsRow) chamberSlotsRow.style.display = 'none';
        if (freezerSlotsRow) freezerSlotsRow.style.display = 'flex';
      } else {
        if (chamberSlotsRow) chamberSlotsRow.style.display = 'none';
        if (freezerSlotsRow) freezerSlotsRow.style.display = 'none';
      }
    };

    locSelect?.addEventListener('change', (e) => {
      updateLocationSlots(e.target.value);
    });

    // Listener para o campo de quantidade exibir/ocultar anotação
    const qtyInput = container.querySelector('#field-quantity');
    const annotationGroup = container.querySelector('#group-annotation');
    const annotationInput = container.querySelector('#field-annotation');
    const annotationTextInput = container.querySelector('#field-annotation-text');
    
    qtyInput?.addEventListener('input', () => {
      if (this.editingId) {
        const newVal = parseFloat(qtyInput.value) || 0;
        const infoBanner = container.querySelector('#annotation-info-banner');
        if (newVal < this.originalQuantity) {
          annotationGroup.style.display = 'block';
          annotationInput.required = true;
          if (infoBanner) {
            container.querySelector('#info-original-quantity').textContent = this.originalQuantity + ' ' + (container.querySelector('#field-unit').value || '');
            const today = new Date();
            const dd = String(today.getDate()).padStart(2, '0');
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const yyyy = today.getFullYear();
            container.querySelector('#info-change-date').textContent = dd + '/' + mm + '/' + yyyy;
            infoBanner.style.display = 'flex';
          }
        } else {
          annotationGroup.style.display = 'none';
          annotationInput.required = false;
          annotationInput.value = '';
          if (annotationTextInput) {
            annotationTextInput.style.display = 'none';
            annotationTextInput.required = false;
            annotationTextInput.value = '';
          }
          if (infoBanner) infoBanner.style.display = 'none';
        }
      }
    });

    const annotationBtns = container.querySelectorAll('.annotation-btn');
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
        if(annotationInput) annotationInput.value = btn.dataset.value;
        if(annotationTextInput) {
          annotationTextInput.style.display = 'block';
          annotationTextInput.required = true;
        }
      });
    });

    // Status panel events
    this.bindStatusPanel(container);

    this.renderDashProducts(container, 'all');
  },

  renderStats(container) {
    const filteredProducts = this.getFilteredProducts();
    const stats = window.BrigadaData.getStats(filteredProducts);
    const set = (id, val) => {
      const el = container.querySelector(`#${id}`);
      if (el) el.textContent = val;
    };
    set('stat-total-val', stats.total);
    set('stat-expired-val', stats.expired);
    set('stat-soon-val', stats.expiresSoon);
    set('stat-resfriado15-val', stats.resfriado15 || 0);
    set('stat-congelado30-val', stats.congelado30 || 0);
    set('stat-ok-val', stats.ok);
    set('stat-today-val', stats.expiresToday);
    set('stat-users-val', stats.totalUsers);
    set('stat-active-users-val', stats.activeUsers);
    set('stat-rebaixa-val', stats.awaitingReduction);
    set('stat-quebra-val', stats.quebra);
    set('stat-troca-val', stats.troca);
    set('stat-tratado-val', stats.tratado);

    const soonCard = container.querySelector('#stat-soon');
    if (soonCard) {
      if (stats.expiresSoon > 0) soonCard.classList.add('card-blink-warning');
      else soonCard.classList.remove('card-blink-warning');
    }

    const todayCard = container.querySelector('#stat-today');
    if (todayCard) {
      if (stats.expiresToday > 0) todayCard.classList.add('card-blink-orange');
      else todayCard.classList.remove('card-blink-orange');
    }


  },

  renderAlertsTimeline(container) {
    const timeline = container.querySelector('#alerts-timeline');
    if (!timeline) return;

    const products = this.getFilteredProducts()
      .map(p => ({ ...p, status: window.BrigadaData.getProductStatus(p) }))
      .filter(p => p.status.days <= 3 && !p.expiredAction)
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


  renderDashProducts(container, cat) {
    const tableDiv = container.querySelector('#dash-products-table');
    if (!tableDiv) return;

    this.currentFilter = cat;

    let products = this.getFilteredProducts();
    if (cat !== 'all') products = products.filter(p => p.category === cat);

    if (this.currentStatusFilter && this.currentStatusFilter !== 'all') {
      products = products.filter(p => {
        const s = window.BrigadaData.getProductStatus(p);
        if (this.currentStatusFilter === 'tratado') return p.expiredAction === 'tratado';
        if (this.currentStatusFilter === 'quebra') return p.expiredAction === 'quebra';
        if (this.currentStatusFilter === 'troca') return p.expiredAction === 'troca';

        if (p.expiredAction) return false;

        if (this.currentStatusFilter === 'expired') return s.days < 0;
        if (this.currentStatusFilter === 'today') return s.days === 0;
        if (this.currentStatusFilter === 'soon') return s.days > 0 && s.days <= 3;
        if (this.currentStatusFilter === 'congelado30') return window.BrigadaData.isCongelado(p) && s.days >= 0 && s.days <= 30;
        if (this.currentStatusFilter === 'resfriado15') return window.BrigadaData.isResfriado(p) && s.days >= 0 && s.days <= 15;
        if (this.currentStatusFilter === 'ok') return s.days > 3;
        if (this.currentStatusFilter === 'rebaixa') return !!p.isAwaitingReduction;
        return true;
      });
    } else {
      products = products.filter(p => !p.expiredAction);
    }

    // Sort: expired first, then by days remaining
    products = products
      .map(p => ({ 
        ...p, 
        _status: window.BrigadaData.getProductStatus(p),
        _baseStatus: window.BrigadaData.getProductStatus(p, true)
      }))
      .sort((a, b) => a._status.days - b._status.days);

    const catMap = { 
      aves: '🐔 Aves', suino: '🐷 Suíno', bovino: '🐮 Bovino', pescado: '🐟 Pescado', padaria: '🍞 Padaria', hortifruti: '🥦 Hortifruti'
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
            <th>Data de Cadastro</th>
            <th>Validade</th>
            <th>Localização</th>
          </tr>
        </thead>
        <tbody>
          ${products.length === 0 ? `
            <tr>
              <td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                Nenhum produto encontrado para o filtro selecionado.
              </td>
            </tr>
          ` : products.map(p => {
            const canEditThis = window.BrigadaAuth.canEditProduct(p);
            const canDeleteThis = window.BrigadaAuth.canDeleteProduct(p);
            return `
            <tr>
              <td data-label="PLU"><span class="plu-badge">${p.plu}</span></td>
              <td data-label="Produto" class="product-name" onclick="window.BrigadaUI.showProductView('${p.id}')" style="cursor: pointer; text-decoration: underline; color: var(--primary);" title="Ver detalhes">
                <div>${p.name}</div>
                ${p.createdBy ? `<div style="font-size:0.7rem; color:#a78bfa; margin-top:2px; font-weight: 500; text-decoration: none;" title="${p.createdBy}">👤 ${window.BrigadaData.getUserNameByEmail(p.createdBy)}</div>` : ''}
              </td>
              <td data-label="Qtd"><strong style="color:var(--primary); font-size: 0.95rem;">${p.quantity !== undefined ? p.quantity : 0}</strong> <span style="font-size:0.75rem; color:var(--text-secondary);">${p.unit || 'kg'}</span></td>
              <td data-label="Categoria"><span class="cat-pill cat-pill--${p.category}">${catMap[p.category]}</span></td>
              <td data-label="Data de Cadastro">${window.BrigadaData.formatDate(p.startDate)}</td>
              <td data-label="Validade">${window.BrigadaData.formatDate(p.endDate)}</td>
              <td data-label="Localização">
                ${window.BrigadaData.formatLocationFriendly(p)}
              </td>
            </tr>
            ${showActions ? `
            <tr class="actions-row">
              <td colspan="7" style="padding: 6px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.01);">
                <div class="actions-cell" style="display: flex; gap: 16px; align-items: center; justify-content: flex-start;">
                  <span style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 600; margin-right: 8px;">Ações:</span>
                  <span class="badge ${p._baseStatus.class}" style="font-size: 0.7rem; padding: 4px 10px;">${p._baseStatus.icon} ${p._baseStatus.label}</span>
                  ${p.expiredAction && p._status ? `<span class="badge ${p._status.class}" style="font-size: 0.7rem; padding: 4px 10px;">${p._status.icon} ${p._status.label}</span>` : ''}
                  ${p.isAwaitingReduction ? `
                    <span class="badge" style="background:${p.rebaixaStatus === 'ok' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)'}; color:${p.rebaixaStatus === 'ok' ? '#34d399' : '#fbbf24'}; border:1px solid ${p.rebaixaStatus === 'ok' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}; font-size:0.7rem; padding: 4px 10px;">
                      ${p.rebaixaStatus === 'ok' ? '🟢 Rebaixa OK' : '🟡 Aguardando'}
                    </span>
                  ` : ''}
                  ${p.isAwaitingReduction && canEditThis ? `<button class="btn-icon" data-action="toggle-rebaixa" data-id="${p.id}" title="${p.rebaixaStatus === 'ok' ? 'Voltar para Aguardando' : 'Marcar Rebaixa OK'}">${p.rebaixaStatus === 'ok' ? '↩️' : '✅'}<span class="btn-label">${p.rebaixaStatus === 'ok' ? 'Voltar' : 'Rebaixa'}</span></button>` : ''}
                  ${canEditThis ? `
                    ${p.expiredAction !== 'quebra' ? `<button class="btn-icon btn-icon--quebra" data-action="set-quebra" data-id="${p.id}" title="Registrar Quebra">🗑️<span class="btn-label">Quebra</span></button>` : ''}
                    ${p.expiredAction !== 'troca' ? `<button class="btn-icon btn-icon--troca" data-action="set-troca" data-id="${p.id}" title="Marcar como Troca">🔄<span class="btn-label">Troca</span></button>` : ''}
                    ${p.expiredAction !== 'tratado' ? `<button class="btn-icon btn-icon--tratado" data-action="set-tratado" data-id="${p.id}" title="Tratado com Sucesso">✔️<span class="btn-label">Tratado</span></button>` : ''}
                    ${p.expiredAction ? `<button class="btn-icon" data-action="clear-expired" data-id="${p.id}" title="Desfazer Ação">↩️<span class="btn-label">Desfazer</span></button>` : ''}
                    <button class="btn-icon btn-icon--edit" data-action="edit" data-id="${p.id}" title="Editar">✏️<span class="btn-label">Editar</span></button>
                  ` : ''}
                  ${canDeleteThis ? `<button class="btn-icon btn-icon--delete" data-action="delete" data-id="${p.id}" title="Excluir">🗑️<span class="btn-label">Excluir</span></button>` : ''}
                </div>
              </td>
            </tr>` : ''}`;
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
          window.BrigadaUI.showQuebraModal(id, () => {
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
        if (action === 'set-tratado') {
          window.BrigadaData.setExpiredAction(id, 'tratado').then(() => {
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

  // ── Status Panel Methods ──────────────────────────────────────────────────
  bindStatusPanel(container) {
    const overlay = container.querySelector('#status-panel-overlay');
    const closeBtn = container.querySelector('#status-panel-close');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeStatusPanel(container));
    }
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.closeStatusPanel(container);
      });
    }

    // Category tabs inside status panel
    container.querySelectorAll('#status-panel-cat-tabs .cat-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        container.querySelectorAll('#status-panel-cat-tabs .cat-tab').forEach(t => t.classList.remove('cat-tab--active'));
        tab.classList.add('cat-tab--active');
        this.currentPanelCategoryFilter = tab.dataset.panelCat;
        if (this.currentStatusFilter) {
          this.renderStatusPanelProducts(container, this.currentStatusFilter);
        }
      });
    });

    // Close on Escape key
    this._statusPanelEscHandler = (e) => {
      if (e.key === 'Escape') this.closeStatusPanel(container);
    };
    document.addEventListener('keydown', this._statusPanelEscHandler);
  },

  openStatusPanel(container, status) {
    const overlay = container.querySelector('#status-panel-overlay');
    if (!overlay) return;

    // Reset panel category filter to 'all' or active global filter
    this.currentPanelCategoryFilter = this.currentFilter || 'all';
    container.querySelectorAll('#status-panel-cat-tabs .cat-tab').forEach(tab => {
      if (tab.dataset.panelCat === this.currentPanelCategoryFilter) {
        tab.classList.add('cat-tab--active');
      } else {
        tab.classList.remove('cat-tab--active');
      }
    });

    const labels = {
      all: '📦 Todos os Produtos Ativos',
      expired: '🔴 Produtos Vencidos',
      today: '🟠 Vencendo Hoje',
      soon: '⚠️ Atenção (1-3 Dias)',
      congelado30: '🥶 Alerta 30 Dias (Congelados)',
      resfriado15: '❄️ Alerta 15 Dias (Resfriados)',
      ok: '✅ Produtos OK',
      rebaixa: '📉 Aguardando Rebaixa',
      quebra: '🗑️ Produtos em Quebra',
      troca: '🔄 Produtos em Troca',
      tratado: '✔️ Tratados com Sucesso'
    };

    const titleEl = container.querySelector('#status-panel-title-text');
    if (titleEl) titleEl.textContent = labels[status] || 'Produtos';

    this.renderStatusPanelProducts(container, status);

    requestAnimationFrame(() => {
      overlay.classList.add('status-panel-overlay--visible');
    });
  },

  closeStatusPanel(container) {
    const overlay = container.querySelector('#status-panel-overlay');
    if (!overlay) return;

    overlay.classList.remove('status-panel-overlay--visible');

    // Reset filter
    this.currentStatusFilter = 'all';
    this.currentPanelCategoryFilter = 'all';
    container.querySelectorAll('.metric-card').forEach(c => c.classList.remove('metric-card--active'));
    const subtitleEl = container.querySelector('#dash-table-subtitle');
    if (subtitleEl) subtitleEl.textContent = 'Visualizando: Todos os produtos';
    this.renderDashProducts(container, this.currentFilter);
  },

  renderStatusPanelProducts(container, status) {
    const bodyEl = container.querySelector('#status-panel-body');
    const countEl = container.querySelector('#status-panel-count');
    if (!bodyEl) return;

    let products = this.getFilteredProducts();
    
    // Filter by panel category filter if selected
    const panelCat = this.currentPanelCategoryFilter || 'all';
    if (panelCat !== 'all') {
      products = products.filter(p => p.category === panelCat);
    } else if (this.currentFilter && this.currentFilter !== 'all') {
      products = products.filter(p => p.category === this.currentFilter);
    }

    // Filter by status
    products = products.filter(p => {
      const s = window.BrigadaData.getProductStatus(p);
      if (status === 'tratado') return p.expiredAction === 'tratado';
      if (status === 'quebra') return p.expiredAction === 'quebra';
      if (status === 'troca') return p.expiredAction === 'troca';

      // Se já foi tratado/quebra/troca, NÃO deve aparecer em outros filtros ou na lista geral
      if (p.expiredAction) return false;

      if (status === 'all') return true;
      if (status === 'expired') return s.days < 0;
      if (status === 'today') return s.days === 0;
      if (status === 'soon') return s.days > 0 && s.days <= 3;
      if (status === 'congelado30') return window.BrigadaData.isCongelado(p) && s.days >= 0 && s.days <= 30;
      if (status === 'resfriado15') return window.BrigadaData.isResfriado(p) && s.days >= 0 && s.days <= 15;
      if (status === 'ok') return s.days > 3;
      if (status === 'rebaixa') return !!p.isAwaitingReduction;
      return true;
    });

    // Sort: most critical first
    products = products
      .map(p => ({ ...p, _status: window.BrigadaData.getProductStatus(p) }))
      .sort((a, b) => a._status.days - b._status.days);

    if (countEl) countEl.textContent = products.length;

    if (products.length === 0) {
      bodyEl.innerHTML = `
        <div class="status-panel__empty">
          <div class="status-panel__empty-icon">📭</div>
          <div class="status-panel__empty-text">Nenhum produto encontrado<br>para este filtro.</div>
        </div>
      `;
      return;
    }

    const catMap = {
      aves: '🐔', suino: '🐷', bovino: '🐮', pescado: '🐟', padaria: '🍞', hortifruti: '🥦'
    };
    const catNameMap = {
      aves: 'Aves', suino: 'Suíno', bovino: 'Bovino', pescado: 'Pescado', padaria: 'Padaria', hortifruti: 'Hortifruti'
    };

    bodyEl.innerHTML = products.map((p, idx) => {
      const canEditThis = window.BrigadaAuth.canEditProduct(p);
      const icon = catMap[p.category] || '📦';

      let actionsHtml = '';
      if (canEditThis) {
        if (p.expiredAction !== 'quebra') actionsHtml += `<button class="btn-icon btn-icon--quebra" data-panel-action="set-quebra" data-id="${p.id}" title="Quebra">🗑️<span class="btn-label">Quebra</span></button>`;
        if (p.expiredAction !== 'troca') actionsHtml += `<button class="btn-icon btn-icon--troca" data-panel-action="set-troca" data-id="${p.id}" title="Troca">🔄<span class="btn-label">Troca</span></button>`;
        if (p.expiredAction !== 'tratado') actionsHtml += `<button class="btn-icon btn-icon--tratado" data-panel-action="set-tratado" data-id="${p.id}" title="Tratado">✔️<span class="btn-label">Tratado</span></button>`;
        if (p.expiredAction) actionsHtml += `<button class="btn-icon" data-panel-action="clear-expired" data-id="${p.id}" title="Desfazer">↩️<span class="btn-label">Desfazer</span></button>`;
      }

      return `
        <div class="status-product-card" style="animation-delay: ${idx * 0.04}s;" data-product-id="${p.id}">
          <div class="status-product-card__header">
            <div class="status-product-card__icon">${icon}</div>
            <div class="status-product-card__name" title="${p.name}">${p.name}</div>
            <span class="badge ${p._status.class} status-product-card__badge" style="font-size:0.6rem;">${p._status.icon} ${p._status.label}</span>
          </div>
          <div class="status-product-card__content">
            <div class="status-product-card__meta">
              <span class="status-product-card__meta-tag">🏷️ ${p.plu}</span>
              <span class="status-product-card__meta-tag">${catMap[p.category] || ''} ${catNameMap[p.category] || p.category}</span>
              <span class="status-product-card__meta-tag">📦 ${p.quantity !== undefined ? p.quantity : 0} ${p.unit || 'kg'}</span>
            </div>
            <div class="status-product-card__meta">
              <span class="status-product-card__meta-tag">📅 ${window.BrigadaData.formatDate(p.endDate)}</span>
              <span class="status-product-card__meta-tag">📍 ${window.BrigadaData.formatLocationFriendly(p)}</span>
            </div>
            ${p.createdBy ? `<div style="font-size:0.68rem; color:#a78bfa; margin-top:2px;">👤 ${window.BrigadaData.getUserNameByEmail(p.createdBy)}</div>` : ''}
            ${actionsHtml ? `<div class="status-product-card__actions">${actionsHtml}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Bind card click to open product detail view
    bodyEl.querySelectorAll('.status-product-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // Don't open product view if they clicked an action button
        if (e.target.closest('[data-panel-action]')) return;
        const id = card.dataset.productId;
        if (id) window.BrigadaUI.showProductView(id);
      });
    });

    // Bind action buttons inside the panel
    bodyEl.querySelectorAll('[data-panel-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.panelAction;
        const id = parseInt(btn.dataset.id);

        if (action === 'set-quebra') {
          window.BrigadaUI.showQuebraModal(id, () => {
            this.renderStatusPanelProducts(container, status);
            this.renderDashProducts(container, this.currentFilter);
            this.renderStats(container);
          });
          return;
        }

        const doAction = (actionType) => {
          const promise = actionType === 'clear-expired'
            ? window.BrigadaData.setExpiredAction(id, null)
            : window.BrigadaData.setExpiredAction(id, actionType.replace('set-', ''));

          promise.then(() => {
            this.renderStatusPanelProducts(container, status);
            this.renderDashProducts(container, this.currentFilter);
            this.renderStats(container);
          });
        };

        doAction(action);
      });
    });
  },

  openEditModal(id, container) {
    const product = window.BrigadaData.products.find(p => p.id === id);
    if (!product || !window.BrigadaAuth.canEditProduct(product)) return;
    this.editingId = id;
    this.originalQuantity = product.quantity !== undefined ? product.quantity : 0;
    container.querySelector('#modal-title').textContent = 'Editar Produto';
    container.querySelector('#field-id').value = product.id;
    container.querySelector('#field-plu').value = product.plu;
    container.querySelector('#field-name').value = product.name;
    container.querySelector('#field-category').value = product.category;
    container.querySelector('#field-startDate').value = product.startDate || '';
    container.querySelector('#field-endDate').value = product.endDate;
    container.querySelector('#field-supplier').value = product.supplier || '';
    
    // Parse location format
    const loc = product.location || '';
    const chamberMatch = loc.match(/^(resfriado|congelado):C(\d+)-N(\d+)-([ED])$/);
    const freezerMatch = loc.match(/^piso_loja:(FZ\d+)$/);

    if (chamberMatch) {
      container.querySelector('#field-location').value = chamberMatch[1];
      const count = chamberMatch[1] === 'resfriado' ? 4 : 16;
      const colSelect = container.querySelector('#field-chamber-col');
      if (colSelect) {
        colSelect.innerHTML = '<option value="">Selecione a coluna...</option>' + 
          Array.from({ length: count }, (_, i) => {
            const col = i + 1;
            const pad = col.toString().padStart(2, '0');
            return `<option value="${col}">Coluna ${pad}</option>`;
          }).join('');
        colSelect.value = chamberMatch[2];
      }
      if (container.querySelector('#field-chamber-level')) container.querySelector('#field-chamber-level').value = chamberMatch[3];
      if (container.querySelector('#field-chamber-pos')) container.querySelector('#field-chamber-pos').value = chamberMatch[4];
      if (container.querySelector('#row-chamber-slots')) container.querySelector('#row-chamber-slots').style.display = 'flex';
      if (container.querySelector('#row-freezer-slots')) container.querySelector('#row-freezer-slots').style.display = 'none';
    } else if (freezerMatch) {
      container.querySelector('#field-location').value = 'piso_loja';
      if (container.querySelector('#field-freezer-num')) container.querySelector('#field-freezer-num').value = freezerMatch[1];
      if (container.querySelector('#row-chamber-slots')) container.querySelector('#row-chamber-slots').style.display = 'none';
      if (container.querySelector('#row-freezer-slots')) container.querySelector('#row-freezer-slots').style.display = 'flex';
    } else {
      container.querySelector('#field-location').value = loc;
      if (loc === 'resfriado' || loc === 'congelado') {
        const count = loc === 'resfriado' ? 4 : 16;
        const colSelect = container.querySelector('#field-chamber-col');
        if (colSelect) {
          colSelect.innerHTML = '<option value="">Selecione a coluna...</option>' + 
            Array.from({ length: count }, (_, i) => {
              const col = i + 1;
              const pad = col.toString().padStart(2, '0');
              return `<option value="${col}">Coluna ${pad}</option>`;
            }).join('');
        }
        if (container.querySelector('#row-chamber-slots')) container.querySelector('#row-chamber-slots').style.display = 'flex';
        if (container.querySelector('#row-freezer-slots')) container.querySelector('#row-freezer-slots').style.display = 'none';
      } else if (loc === 'piso_loja') {
        if (container.querySelector('#row-chamber-slots')) container.querySelector('#row-chamber-slots').style.display = 'none';
        if (container.querySelector('#row-freezer-slots')) container.querySelector('#row-freezer-slots').style.display = 'flex';
      } else {
        if (container.querySelector('#row-chamber-slots')) container.querySelector('#row-chamber-slots').style.display = 'none';
        if (container.querySelector('#row-freezer-slots')) container.querySelector('#row-freezer-slots').style.display = 'none';
      }
    }

    container.querySelector('#field-unit').value = product.unit || 'kg';
    container.querySelector('#field-quantity').value = product.quantity !== undefined ? product.quantity : '';
    
    // Reset annotation
    container.querySelector('#group-annotation').style.display = 'none';
    container.querySelector('#field-annotation').required = false;
    const infoBanner = container.querySelector('#annotation-info-banner');
    if (infoBanner) infoBanner.style.display = 'none';
    container.querySelectorAll('.annotation-btn').forEach(b => {
      if (b.dataset.value === 'excluir') {
        b.classList.remove('btn--danger');
        b.classList.add('btn--outline', 'btn--danger-outline');
      } else {
        b.classList.remove('btn--primary');
        b.classList.add('btn--outline');
      }
    });
    container.querySelector('#field-annotation').value = '';
    const annText = container.querySelector('#field-annotation-text');
    if (annText) {
      annText.style.display = 'none';
      annText.required = false;
      annText.value = '';
    }

    // Disable all fields except quantity and annotation
    const form = container.querySelector('#product-form');
    form.querySelectorAll('.form-input, select, textarea').forEach(el => {
      if (el.id !== 'field-quantity' && el.id !== 'field-annotation' && el.id !== 'field-annotation-text') {
        el.disabled = true;
      } else {
        el.disabled = false;
      }
    });

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
    const locationType = container.querySelector('#field-location').value;
    const unit = container.querySelector('#field-unit').value;
    const qtyVal = container.querySelector('#field-quantity').value;
    const quantity = qtyVal !== '' ? parseFloat(qtyVal) : 0;
    
    let location = locationType;
    let column = null;
    let columnNumber = null;

    if (locationType === 'resfriado' || locationType === 'congelado') {
      const col = container.querySelector('#field-chamber-col')?.value;
      const level = container.querySelector('#field-chamber-level')?.value;
      const pos = container.querySelector('#field-chamber-pos')?.value;

      if (col && level && pos) {
        location = `${locationType}:C${col}-N${level}-${pos}`;
        column = level === '1' ? 'Piso' : 'Aéreo';
        columnNumber = parseInt(col, 10);
      }
    } else if (locationType === 'piso_loja') {
      const fz = container.querySelector('#field-freezer-num')?.value;
      if (fz) {
        location = `piso_loja:${fz}`;
      }
    }

    const selectVal = container.querySelector('#field-annotation').value;
    const textVal = container.querySelector('#field-annotation-text')?.value.trim() || '';

    if (this.editingId && quantity < this.originalQuantity) {
      if (!selectVal || !textVal) {
        window.BrigadaUI.showToast('Por favor, selecione um motivo e informe os detalhes da redução da quantidade.', 'error');
        return;
      }
    }

    const annotation = (selectVal && textVal) ? `${selectVal} - ${textVal}` : '';

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

    const payload = { plu, name, category, startDate, endDate, supplier, location, unit, quantity, column, columnNumber, annotation, creator, editor };

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

  openTop10Modal(container, dataList, title) {
    this.currentTop10Data = dataList;
    container.querySelector('#top10-modal-title').textContent = title;
    const listContainer = container.querySelector('#top10-list');
    
    if (!dataList || dataList.length === 0) {
      listContainer.innerHTML = '<div class="empty-state" style="padding:2rem;"><p>Nenhum dado encontrado.</p></div>';
    } else {
      listContainer.innerHTML = `
        <table class="data-table">
          <thead>
            <tr>
              <th>Posição</th>
              <th>PLU</th>
              <th>Produto</th>
              <th>Ação</th>
              <th>Qtd. Total</th>
            </tr>
          </thead>
          <tbody>
            ${dataList.map((item, index) => `
              <tr>
                <td style="font-weight:bold; color:var(--primary);">${index + 1}º</td>
                <td><span class="plu-badge">${item.plu}</span></td>
                <td>${item.name}</td>
                <td><span class="badge ${item.action === 'quebra' ? 'badge--expired' : 'badge--info'}">${item.action === 'quebra' ? '🗑️ Quebra' : '🔄 Troca'}</span></td>
                <td style="font-weight:bold; font-size:1.1rem;">${item.count}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }
    
    const modal = container.querySelector('#top10-modal');
    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('modal-overlay--visible'));
  },

  closeTop10Modal(container) {
    const modal = container.querySelector('#top10-modal');
    if (modal) {
      modal.classList.remove('modal-overlay--visible');
      setTimeout(() => modal.style.display = 'none', 250);
    }
  },

  printTop10(title, dataList) {
    if (!dataList || dataList.length === 0) return window.BrigadaUI.showToast('Nada para imprimir.', 'error');
    
    const dateStr = new Date().toLocaleString('pt-BR');
    
    const printContent = `
      <div class="print-container">
        <style>
          .print-container { font-family: system-ui, -apple-system, sans-serif; color: #111; padding: 20px; background: #ffffff; }
          .print-container h1 { font-size: 1.5rem; margin-bottom: 5px; border-bottom: 2px solid #ccc; padding-bottom: 10px; color: #111; }
          .print-container p { color: #555; margin-bottom: 20px; }
          .print-container table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .print-container th, .print-container td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; color: #111; }
          .print-container th { background-color: #f4f4f5; font-weight: 600; color: #333; }
          .print-container td { font-size: 0.95rem; }
          .print-container .pos { font-weight: bold; }
        </style>
        <h1>${title}</h1>
        <p>Gerado em: ${dateStr}</p>
        <table>
          <thead>
            <tr>
              <th>Posição</th>
              <th>PLU</th>
              <th>Produto</th>
              <th>Ação</th>
              <th>Qtd. Total</th>
            </tr>
          </thead>
          <tbody>
            ${dataList.map((item, index) => `
              <tr>
                <td class="pos">${index + 1}º</td>
                <td>${item.plu}</td>
                <td>${item.name}</td>
                <td>${item.action === 'quebra' ? 'Quebra' : 'Troca'}</td>
                <td><strong>${item.count}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    window.BrigadaUI.printContent(printContent);
  },

  buildPromotorHTML() {
    const today = new Date().toLocaleDateString('pt-BR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    return `
      <div class="panel-header">
        <div class="panel-header__left">
          <h2 class="panel-title">📊 Dashboard Brigada de Validade</h2>
          <p class="panel-subtitle">Monitoramento em tempo real — Açougue Varejo</p>
        </div>
        <div class="date-badge">
          <span>📅</span>
          <span>${today}</span>
        </div>
      </div>

      <!-- Atalho de navegação rápida para voltar para Conciliação -->
      <div class="glass-panel" style="padding: 1.5rem; margin-bottom: 2rem; display: flex; align-items: center; justify-content: space-between; border-left: 4px solid var(--primary); background: linear-gradient(90deg, rgba(99,102,241,0.05) 0%, rgba(255,255,255,0.02) 100%);">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <span style="font-size: 2.2rem;">⚖️</span>
          <div>
            <h3 style="font-size: 1.1rem; font-weight: 600; color: var(--text-primary); margin: 0 0 4px 0;">Controle de Inventário</h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">Você possui acesso total para cadastrar e gerenciar a Conciliação de Estoque.</p>
          </div>
        </div>
        <button id="btn-goto-conciliacao" class="btn btn--primary" style="display: flex; align-items: center; gap: 8px;">
          <span>⚖️</span> Ir para Conciliação
        </button>
      </div>

      <!-- Barra de Filtros por Data de Vencimento (Desabilitada) -->
      <div class="toolbar" style="margin-bottom: 1.5rem; display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 12px; border: 1px solid var(--glass-border); opacity: 0.7;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.2rem;">🔍</span>
          <span style="font-weight: 500; font-size: 0.95rem; color: var(--text-secondary);">Filtrar Validade:</span>
        </div>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center;">
          <select class="select-control" style="padding: 0.4rem 2rem 0.4rem 1rem; min-width: 90px; height: 38px;" disabled>
            <option>Dia (Todos)</option>
          </select>
          <select class="select-control" style="padding: 0.4rem 2rem 0.4rem 1rem; min-width: 130px; height: 38px;" disabled>
            <option>Mês (Todos)</option>
          </select>
          <select class="select-control" style="padding: 0.4rem 2rem 0.4rem 1rem; min-width: 110px; height: 38px;" disabled>
            <option>Ano (Todos)</option>
          </select>
          <button class="btn btn--ghost" style="padding: 0 1rem; height: 38px; font-size: 0.85rem; display: flex; align-items: center; gap: 0.25rem; border-radius: var(--r-full);" disabled>
            <span>🧹</span> Limpar
          </button>
        </div>
      </div>

      <!-- Métricas Principais -->
      <div class="dashboard-grid dashboard-grid--5 stagger" style="margin-bottom:2rem;">
        <div class="metric-card">
          <div class="metric-card__icon">📦</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Total Produtos</p>
            <p class="metric-card__value" style="font-size: 0.85rem; color: var(--error); font-weight: 600; white-space: nowrap; margin-top: 5px;">⚠️ Informação não autorizada</p>
          </div>
        </div>
        <div class="metric-card metric-card--danger">
          <div class="metric-card__icon">🔴</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Vencidos</p>
            <p class="metric-card__value" style="font-size: 0.85rem; color: var(--error); font-weight: 600; white-space: nowrap; margin-top: 5px;">⚠️ Informação não autorizada</p>
          </div>
        </div>
        <div class="metric-card metric-card--warning">
          <div class="metric-card__icon">⚠️</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Atenção (1-3d)</p>
            <p class="metric-card__value" style="font-size: 0.85rem; color: var(--error); font-weight: 600; white-space: nowrap; margin-top: 5px;">⚠️ Informação não autorizada</p>
          </div>
        </div>
        <div class="metric-card metric-card--success">
          <div class="metric-card__icon">✅</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Produtos OK</p>
            <p class="metric-card__value" style="font-size: 0.85rem; color: var(--error); font-weight: 600; white-space: nowrap; margin-top: 5px;">⚠️ Informação não autorizada</p>
          </div>
        </div>
        <div class="metric-card metric-card--info">
          <div class="metric-card__icon">📉</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Aguardando Rebaixa</p>
            <p class="metric-card__value" style="font-size: 0.85rem; color: var(--error); font-weight: 600; white-space: nowrap; margin-top: 5px;">⚠️ Informação não autorizada</p>
          </div>
        </div>
      </div>

      <!-- Outras métricas -->
      <div class="dashboard-grid dashboard-grid--3" style="margin-bottom:1rem;">
        <div class="metric-card" style="border-left: 3px solid #ef4444;">
          <div class="metric-card__icon">🗑️</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Quebra</p>
            <p class="metric-card__value" style="font-size: 0.85rem; color: var(--error); font-weight: 600; white-space: nowrap; margin-top: 5px;">⚠️ Informação não autorizada</p>
          </div>
        </div>
        <div class="metric-card" style="border-left: 3px solid #3b82f6;">
          <div class="metric-card__icon">🔄</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Troca</p>
            <p class="metric-card__value" style="font-size: 0.85rem; color: var(--error); font-weight: 600; white-space: nowrap; margin-top: 5px;">⚠️ Informação não autorizada</p>
          </div>
        </div>
        <div class="metric-card metric-card--orange">
          <div class="metric-card__icon">🟠</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Vence Hoje</p>
            <p class="metric-card__value" style="font-size: 0.85rem; color: var(--error); font-weight: 600; white-space: nowrap; margin-top: 5px;">⚠️ Informação não autorizada</p>
          </div>
        </div>
      </div>

      <!-- Timeline de alertas -->
      <div style="margin-bottom:2rem;">
        <div class="glass-panel">
          <h3 class="glass-panel__title">🚨 Alertas de Validade</h3>
          <div style="padding: 1.5rem; text-align: center; color: var(--error); font-weight: 500;">
            ⚠️ Informação não autorizada
          </div>
        </div>
      </div>

      <!-- Tabela rápida por categoria -->
      <div class="glass-panel" style="margin-bottom:2rem;">
        <div class="glass-panel__header">
          <div style="display:flex; flex-direction:column; gap:4px;">
            <h3 class="glass-panel__title">🏪 Visão por Categoria</h3>
            <p style="font-size:0.95rem; font-weight:600; color:var(--text-secondary);">Visualizando: Todos os produtos</p>
          </div>
        </div>
        <div style="padding: 2rem; text-align: center; color: var(--error); font-weight: 500; border-top: 1px solid var(--glass-border);">
          ⚠️ Informação não autorizada
        </div>
      </div>
    `;
  },

  bindPromotorEvents(container) {
    container.querySelector('#btn-goto-conciliacao')?.addEventListener('click', () => {
      window.BrigadaRouter.navigate('conciliacao');
    });
  }
};

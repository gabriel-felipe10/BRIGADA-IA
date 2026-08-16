/**
 * BRIGADA-IA — Piso de Loja Module
 * Visualização e alocação de produtos nos freezers do piso de loja
 */

window.BrigadaPisoLoja = {
  selectedFreezer: null,  // null = overview, number = freezer detail
  searchQuery: '',
  filterCategory: 'all',
  
  allocatingFreezer: null,
  allocatingSearch: '',
  allocatingCategory: 'all',
  
  // Configuração dos freezers com categorias
  FREEZERS: [
    { num: 17, category: 'aves' },
    { num: 18, category: 'aves' },
    { num: 19, category: 'aves' },
    { num: 20, category: 'aves' },
    { num: 21, category: 'aves' },
    { num: 22, category: 'aves' },
    { num: 23, category: 'aves' },
    { num: 24, category: 'aves' },
    { num: 25, category: 'aves' },
    { num: 26, category: 'bovino' },
    { num: 27, category: 'bovino' },
    { num: 28, category: 'bovino' },
    { num: 29, category: 'aves' },
    { num: 30, category: 'aves' },
    { num: 31, category: 'aves' },
    { num: 32, category: 'aves' },
    { num: 34, category: 'suino' },
    { num: 35, category: 'suino' },
    { num: 36, category: 'misto' },
    { num: 37, category: 'misto' },
    { num: 38, category: 'misto' },
    { num: 39, category: 'misto' },
    { num: 40, category: 'bovino' },
    { num: 41, category: 'bovino' },
    { num: 42, category: 'pescado' },
    { num: 43, category: 'pescado' },
    { num: 44, category: 'pescado' },
    { num: 45, category: 'pescado' },
    { num: 46, category: 'pescado' },
    { num: 47, category: 'pescado' },
    { num: 48, category: 'pescado' },
  ],

  FREEZER_CATEGORY_LABELS: {
    aves: '🐔 Aves',
    bovino: '🐮 Bovino',
    suino: '🐷 Suínos',
    misto: '🥩 Bovino / Suíno / Aves',
    pescado: '🐟 Pescado',
  },

  // Simple inline icons matching the emoji/SVG pattern
  icons: {
    ArrowLeft: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`,
    Search: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
    Thermometer: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"></path></svg>`,
    Trash2: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`,
    ChevronRight: `<svg class="icon chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`,
    Plus: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`
  },

  catMap: { 
    aves: '🐔 Aves', 
    suino: '🐷 Suíno', 
    bovino: '🐮 Bovino', 
    pescado: '🐟 Pescado', 
    laticinios: '🧀 Laticínios', 
    frios: '🥓 Frios', 
    iogurtes: '🍦 Iogurtes', 
    pereciveis: '🍎 Perecíveis',
    padaria: '🥖 Padaria',
    hortifruti: '🥬 Hortifrúti',
    mercearia: '🥫 Mercearia'
  },

  sectorCategories: {
    'açougue': ['aves', 'suino', 'bovino', 'pescado'],
    'acougue': ['aves', 'suino', 'bovino', 'pescado'],
    'pereciveis': ['iogurtes', 'laticinios', 'frios', 'pereciveis'],
    'padaria': ['padaria'],
    'hortifruti': ['hortifruti'],
    'mercearia': ['mercearia']
  },

  // Check if current user is SuperAdmin or has full access
  isSuperAdminUser() {
    const user = window.BrigadaAuth?.currentUser;
    if (!user) return false;
    const email = (user.email || '').toLowerCase();
    return window.BrigadaAuth.isSuperAdmin() || 
           user.sector === 'todos' || 
           email === 'admin@brigada.com' || 
           email === 'marcos@brigada.com';
  },

  // Get allowed categories for current user's sector
  getAllowedCategories() {
    if (window.BrigadaAuth?.getAllowedCategoriesForUser) {
      return window.BrigadaAuth.getAllowedCategoriesForUser();
    }
    return ['aves', 'suino', 'bovino', 'pescado'];
  },

  // Helper to render category quick tabs
  renderCategoryTabsHTML(activeCat, isModal = false) {
    const allowedCats = this.getAllowedCategories();
    const dataAttr = isModal ? 'data-mcat' : 'data-dir-cat';
    
    let html = `<button class="cat-tab cat-tab--sm ${activeCat === 'all' ? 'cat-tab--active' : ''}" ${dataAttr}="all">Todos</button>`;
    
    allowedCats.forEach(cat => {
      const label = this.catMap[cat] || cat;
      const isActive = activeCat === cat ? 'cat-tab--active' : '';
      html += `<button class="cat-tab cat-tab--sm ${isActive}" ${dataAttr}="${cat}">${label}</button>`;
    });
    
    return html;
  },

  // Parse location: piso_loja:FZ{number}
  parseLocation(locationStr) {
    if (!locationStr) return null;
    const match = locationStr.match(/^piso_loja:FZ(\d+)$/);
    if (match) {
      return {
        freezer: parseInt(match[1], 10)
      };
    }
    return null;
  },

  // Format location
  formatLocation(freezerNum) {
    return `piso_loja:FZ${freezerNum.toString().padStart(2, '0')}`;
  },

  render(container) {
    this.container = container;
    
    // Ensure active category is valid for user
    const allowed = this.getAllowedCategories();
    if (this.filterCategory !== 'all' && !allowed.includes(this.filterCategory)) {
      this.filterCategory = 'all';
    }

    container.innerHTML = this.buildHTML();
    this.bindEvents();
  },

  getAllProducts() {
    const all = window.BrigadaData.products || [];
    if (this.isSuperAdminUser()) {
      return all;
    }
    const allowedCats = this.getAllowedCategories();
    return all.filter(p => {
      if (!p.category) return true;
      const cat = (p.category || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      return allowedCats.includes(cat) || allowedCats.includes(p.category);
    });
  },

  getFreezerAlerts(freezerNum) {
    const products = this.getProductsInFreezer(freezerNum);
    const expired = [];
    const today = [];
    const atencao = [];
    const resfriado15 = [];
    const congelado30 = [];

    products.forEach(p => {
      const s = window.BrigadaData.getProductStatus(p);
      if (s.days < 0 || s.class === 'badge--expired') {
        expired.push({ product: p, status: s });
      } else if (s.days === 0 || s.class === 'badge--today') {
        today.push({ product: p, status: s });
      } else if (s.days >= 1 && s.days <= 3) {
        atencao.push({ product: p, status: s });
      } else if (window.BrigadaData.isResfriado && window.BrigadaData.isResfriado(p) && s.days <= 15) {
        resfriado15.push({ product: p, status: s });
      } else if (window.BrigadaData.isCongelado && window.BrigadaData.isCongelado(p) && s.days <= 30) {
        congelado30.push({ product: p, status: s });
      }
    });

    const totalAlerts = expired.length + today.length + atencao.length + resfriado15.length + congelado30.length;

    return {
      totalAlerts,
      expired,
      today,
      atencao,
      resfriado15,
      congelado30,
      hasExpired: expired.length > 0,
      hasToday: today.length > 0,
      hasAtencao: atencao.length > 0,
      hasResfriado15: resfriado15.length > 0,
      hasCongelado30: congelado30.length > 0,
      hasCritical: expired.length > 0 || today.length > 0,
      hasAny: totalAlerts > 0
    };
  },

  getProductsInPisoLoja() {
    return this.getAllProducts().filter(p => this.parseLocation(p.location) !== null);
  },

  getProductsInFreezer(freezerNum) {
    return this.getAllProducts().filter(p => {
      const parsed = this.parseLocation(p.location);
      return parsed && parsed.freezer === freezerNum;
    });
  },

  getUnallocatedProducts() {
    return this.getAllProducts().filter(p => {
      // Unallocated if location is 'piso_loja' or missing/empty, meaning it's not specifically in a freezer
      return !p.location || p.location === 'piso_loja' || p.location === '';
    });
  },

  buildDirectoryHTML(products) {
    const filteredProducts = products.filter(p => {
      // Filter by category
      if (this.filterCategory !== 'all' && p.category !== this.filterCategory) return false;
      
      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase().trim();
        const parsed = this.parseLocation(p.location);
        const freezerStr = parsed ? `FZ${parsed.freezer.toString().padStart(2, '0')}` : '';
        return p.name.toLowerCase().includes(query) || 
               p.plu.toLowerCase().includes(query) || 
               freezerStr.toLowerCase().includes(query);
      }
      return true;
    });

    const rowsHTML = filteredProducts.length === 0 ? `
      <tr>
        <td colspan="7" class="empty-state" style="padding: 2.5rem; text-align: center;">
          <div class="empty-state__icon" style="font-size: 2rem; margin-bottom: 8px;">📭</div>
          <p class="empty-state__text" style="color: var(--text-secondary); margin: 0;">Nenhum produto alocado correspondente aos filtros.</p>
        </td>
      </tr>
    ` : filteredProducts.map(p => {
      const status = window.BrigadaData.getProductStatus(p);
      const parsed = this.parseLocation(p.location);
      const freezerStr = parsed ? `FZ${parsed.freezer.toString().padStart(2, '0')}` : '—';
      const stockDist = window.BrigadaData.getProductStockDistribution(p);
      const otherLots = stockDist.filter(d => d.id !== p.id);

      const isCritical = status.days <= 0 || status.class === 'badge--expired' || status.class === 'badge--today';
      const isWarning = status.days > 0 && status.days <= 3;
      const isAlert = isCritical || isWarning || status.isResfriadoAlert || status.isCongeladoAlert;
      const rowStyle = isCritical ? 'background: rgba(239, 68, 68, 0.08);' : isWarning ? 'background: rgba(245, 158, 11, 0.08);' : '';
      const blinkBadgeClass = isAlert ? 'badge--blinking-alert' : '';

      return `
        <tr style="${rowStyle}">
          <td data-label="Freezer #"><strong style="color:#10b981; font-family:monospace; font-size:1rem;">${freezerStr}</strong></td>
          <td data-label="Produto" class="product-name">
            <div onclick="window.BrigadaUI.showProductView('${p.id}')" style="cursor: pointer; font-weight: 600; color: var(--text-primary);" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='var(--text-primary)'" title="Ver detalhes">${p.name}</div>
            <div style="font-size:0.7rem; color:var(--text-tertiary); margin-top: 1px;">${this.catMap[p.category] || p.category}</div>
            ${otherLots.length > 0 ? `
              <div onclick="window.BrigadaUI.showProductView('${p.id}')" style="cursor: pointer; font-size: 0.68rem; color: #38bdf8; background: rgba(56,189,248,0.1); border: 1px solid rgba(56,189,248,0.25); border-radius: 4px; padding: 1px 5px; width: fit-content; margin-top: 3px; display: inline-flex; align-items: center; gap: 3px;" title="Clique para ver todos os lotes">
                🔀 Também em: ${otherLots.map(d => `${d.quantity}${d.unit} ${d.shortLoc}`).join(', ')}
              </div>
            ` : ''}
          </td>
          <td data-label="PLU"><span class="plu-badge">${p.plu}</span></td>
          <td data-label="Estoque"><strong>${p.quantity}</strong> <span style="font-size:0.75rem; color:var(--text-secondary);">${p.unit || 'kg'}</span></td>
          <td data-label="Validade"><strong>${window.BrigadaData.formatDate(p.endDate)}</strong></td>
          <td data-label="Status"><span class="badge ${status.class} ${blinkBadgeClass}">${status.icon} ${status.label}</span></td>
          <td data-label="Ações" class="actions-cell">
            <button class="btn btn-danger btn-sm" data-action="deallocate" data-id="${p.id}" style="padding: 4px 8px; font-size: 0.8rem; cursor: pointer;">
              🗑️ Desalocar
            </button>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="glass-panel" style="margin-top: 2rem; margin-bottom: 2rem;">
        <div class="glass-panel__header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div style="display:flex; flex-direction:column; gap:4px;">
            <h3 class="glass-panel__title" style="font-size: 1.4rem; font-weight: 700; margin: 0; color: var(--text-primary);">📋 Diretório de Produtos no Piso</h3>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin: 0;">Consulta e rastreamento de produtos nos freezers da loja</p>
          </div>
          
          <div class="cat-quick-tabs" id="dir-cat-tabs" style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${this.renderCategoryTabsHTML(this.filterCategory, false)}
          </div>
        </div>

        <div class="toolbar" style="margin-bottom: 1.5rem;">
          <div class="search-box" style="flex: 1; max-width: 100%;">
            <span class="search-icon">🔍</span>
            <input type="text" id="dir-search-input" class="search-input" placeholder="Buscar por produto, PLU ou freezer (ex: FZ01)..." value="${this.searchQuery}">
          </div>
        </div>

        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>Freezer #</th>
                <th>Produto</th>
                <th>PLU</th>
                <th>Estoque</th>
                <th>Validade</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody id="dir-tbody">
              ${rowsHTML}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  buildHTML() {
    if (this.selectedFreezer === null) {
      // ── Main Overview Page ──
      const productsInPiso = this.getProductsInPisoLoja();
      
      // Group freezers by category
      const freezersByCategory = {};
      this.FREEZERS.forEach(fz => {
        if (!freezersByCategory[fz.category]) freezersByCategory[fz.category] = [];
        freezersByCategory[fz.category].push(fz);
      });

      let freezerSectionsHTML = '';
      let displayCounter = 0;
      Object.entries(freezersByCategory).forEach(([cat, freezers]) => {
        const catLabel = this.FREEZER_CATEGORY_LABELS[cat] || cat;
        const sectionCards = freezers.map(fz => {
          displayCounter++;
          const freezerNum = fz.num;
          const displayNum = displayCounter;
        const productsInThisFreezer = this.getProductsInFreezer(freezerNum).length;
        const hasProducts = productsInThisFreezer > 0;
        const catColor = {pescado:'#38bdf8',aves:'#f59e0b',bovino:'#ef4444',suino:'#a855f7',misto:'#f97316'}[cat] || '#10b981';
        
          const alerts = this.getFreezerAlerts(freezerNum);
          let alertClass = '';
          const alertBadges = [];

          if (alerts.hasExpired) {
            alertClass = 'freezer-card--critical';
            alertBadges.push(`
              <div class="badge--blinking-alert" style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 7px 12px; border-radius: 10px; font-size: 0.83rem; font-weight: 800; box-shadow: 0 4px 12px rgba(239,68,68,0.45); letter-spacing: 0.2px; width: 100%; box-sizing: border-box; display: flex; align-items: center; justify-content: center; gap: 6px;">
                <span style="font-size: 1rem;">🔴</span> <span>VENCIDOS: ${alerts.expired.length} ${alerts.expired.length === 1 ? 'item' : 'itens'}</span>
              </div>
            `);
          }
          if (alerts.hasToday) {
            if (!alertClass) alertClass = 'freezer-card--critical';
            alertBadges.push(`
              <div class="badge--blinking-alert" style="background: linear-gradient(135deg, #ea580c, #c2410c); color: white; padding: 7px 12px; border-radius: 10px; font-size: 0.83rem; font-weight: 800; box-shadow: 0 4px 12px rgba(234,88,12,0.45); letter-spacing: 0.2px; width: 100%; box-sizing: border-box; display: flex; align-items: center; justify-content: center; gap: 6px;">
                <span style="font-size: 1rem;">🟠</span> <span>VENCE HOJE: ${alerts.today.length} ${alerts.today.length === 1 ? 'item' : 'itens'}</span>
              </div>
            `);
          }
          if (alerts.hasAtencao) {
            if (!alertClass) alertClass = 'freezer-card--warning';
            alertBadges.push(`
              <div class="badge--blinking-alert" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 7px 12px; border-radius: 10px; font-size: 0.83rem; font-weight: 800; box-shadow: 0 4px 12px rgba(245,158,11,0.45); letter-spacing: 0.2px; width: 100%; box-sizing: border-box; display: flex; align-items: center; justify-content: center; gap: 6px;">
                <span style="font-size: 1rem;">⚠️</span> <span>ATENÇÃO (1 A 3 DIAS): ${alerts.atencao.length} ${alerts.atencao.length === 1 ? 'item' : 'itens'}</span>
              </div>
            `);
          }
          if (alerts.hasResfriado15) {
            if (!alertClass) alertClass = 'freezer-card--resfriado15';
            alertBadges.push(`
              <div class="badge--blinking-alert" style="background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; padding: 7px 12px; border-radius: 10px; font-size: 0.82rem; font-weight: 800; box-shadow: 0 4px 12px rgba(6,182,212,0.45); letter-spacing: 0.2px; width: 100%; box-sizing: border-box; display: flex; align-items: center; justify-content: center; gap: 6px;">
                <span style="font-size: 1rem;">❄️</span> <span>ALERTA 15 DIAS (RESFRIADOS): ${alerts.resfriado15.length}</span>
              </div>
            `);
          }
          if (alerts.hasCongelado30) {
            if (!alertClass) alertClass = 'freezer-card--congelado30';
            alertBadges.push(`
              <div class="badge--blinking-alert" style="background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; padding: 7px 12px; border-radius: 10px; font-size: 0.82rem; font-weight: 800; box-shadow: 0 4px 12px rgba(99,102,241,0.45); letter-spacing: 0.2px; width: 100%; box-sizing: border-box; display: flex; align-items: center; justify-content: center; gap: 6px;">
                <span style="font-size: 1rem;">🥶</span> <span>ALERTA 30 DIAS (CONGELADOS): ${alerts.congelado30.length}</span>
              </div>
            `);
          }

          const alertBadgesHTML = alertBadges.length > 0 ? `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; margin: 0.6rem 0 0.9rem 0; width: 100%;">
              ${alertBadges.join('')}
            </div>
          ` : '';

          const glowColor = alerts.hasExpired || alerts.hasToday ? '#ef4444' : alerts.hasAtencao ? '#f59e0b' : alerts.hasResfriado15 ? '#06b6d4' : alerts.hasCongelado30 ? '#6366f1' : catColor;
          
          return `
            <div class="chamber-card-outer ${alertClass}" data-action="view-freezer" data-num="${freezerNum}" style="cursor: pointer; position: relative;">
              <div class="chamber-card-header-glow" style="background: ${glowColor};"></div>
              <div class="chamber-card-body" style="padding: 1.2rem; text-align: center;">
                <h2 class="chamber-card-name" style="font-size: 1.35rem; font-weight: 800; color: ${catColor}; margin-bottom: 0.35rem; letter-spacing: -0.3px;">Freezer ${freezerNum.toString().padStart(2, '0')}</h2>
                <div style="font-size: 0.78rem; color: var(--text-tertiary); margin-bottom: 0.5rem; font-family: monospace; background: rgba(128,128,128,0.1); display: inline-block; padding: 2px 8px; border-radius: 4px;">Freezer ${displayNum.toString().padStart(2, '0')} de 31</div>
                
                ${alertBadgesHTML}
                
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 1rem;">
                  <span class="status-dot" style="width: 10px; height: 10px; border-radius: 50%; background-color: ${glowColor};"></span>
                  <span style="font-size: 0.9rem; color: var(--text-secondary);">${productsInThisFreezer} produtos</span>
                </div>
                
                <div class="chamber-card-footer" style="justify-content: center;">
                  <span class="enter-text">Acessar</span>
                  ${this.icons.ChevronRight}
                </div>
              </div>
            </div>
          `;
        }).join('');

        freezerSectionsHTML += `
          <div style="margin-bottom: 2rem;">
            <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid ${{pescado:'rgba(56,189,248,0.3)',aves:'rgba(245,158,11,0.3)',bovino:'rgba(239,68,68,0.3)',suino:'rgba(168,85,247,0.3)',misto:'rgba(249,115,22,0.3)'}[cat] || 'rgba(16,185,129,0.3)'};"> 
              ${catLabel}
            </h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(235px, 1fr)); gap: 1.5rem;">
              ${sectionCards}
            </div>
          </div>
        `;
      });

      const animationStyles = `
        <style>
          @keyframes pulseAlertCard {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7), 0 8px 24px rgba(239, 68, 68, 0.25);
              border-color: rgba(239, 68, 68, 0.9);
            }
            50% {
              box-shadow: 0 0 0 10px rgba(239, 68, 68, 0), 0 12px 32px rgba(239, 68, 68, 0.5);
              border-color: #ef4444;
            }
          }
          @keyframes pulseWarningCard {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7), 0 8px 24px rgba(245, 158, 11, 0.25);
              border-color: rgba(245, 158, 11, 0.9);
            }
            50% {
              box-shadow: 0 0 0 10px rgba(245, 158, 11, 0), 0 12px 32px rgba(245, 158, 11, 0.5);
              border-color: #f59e0b;
            }
          }
          @keyframes pulseCyanCard {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.7), 0 8px 24px rgba(6, 182, 212, 0.25);
              border-color: rgba(6, 182, 212, 0.9);
            }
            50% {
              box-shadow: 0 0 0 10px rgba(6, 182, 212, 0), 0 12px 32px rgba(6, 182, 212, 0.5);
              border-color: #06b6d4;
            }
          }
          @keyframes pulseBlueCard {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7), 0 8px 24px rgba(99, 102, 241, 0.25);
              border-color: rgba(99, 102, 241, 0.9);
            }
            50% {
              box-shadow: 0 0 0 10px rgba(99, 102, 241, 0), 0 12px 32px rgba(99, 102, 241, 0.5);
              border-color: #6366f1;
            }
          }
          @keyframes blinkAlertBadge {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.6;
              transform: scale(1.04);
            }
          }
          .freezer-card--critical {
            animation: pulseAlertCard 1.8s infinite ease-in-out !important;
            border: 2px solid #ef4444 !important;
          }
          .freezer-card--warning {
            animation: pulseWarningCard 2s infinite ease-in-out !important;
            border: 2px solid #f59e0b !important;
          }
          .freezer-card--resfriado15 {
            animation: pulseCyanCard 2.2s infinite ease-in-out !important;
            border: 2px solid #06b6d4 !important;
          }
          .freezer-card--congelado30 {
            animation: pulseBlueCard 2.4s infinite ease-in-out !important;
            border: 2px solid #6366f1 !important;
          }
          .badge--blinking-alert {
            animation: blinkAlertBadge 1.2s infinite ease-in-out;
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }
        </style>
      `;

      return `
        <div class="chambers-page">
          ${animationStyles}
          <div class="panel-header">
            <div class="panel-header__left">
              <h2 class="panel-title">🏪 Piso de Loja</h2>
              <p class="panel-subtitle">Mapa dos freezers do piso de loja — ${this.FREEZERS.length} unidades</p>
            </div>
          </div>

          ${freezerSectionsHTML}

          ${this.buildDirectoryHTML(productsInPiso)}
        </div>
      `;
    } else {
      // ── Freezer Detail Page ──
      const products = this.getProductsInFreezer(this.selectedFreezer);
      const alerts = this.getFreezerAlerts(this.selectedFreezer);
      const freezerStr = `Freezer ${this.selectedFreezer.toString().padStart(2, '0')}`;

      const alertBannerHTML = alerts.hasAny ? `
        <div class="badge--blinking-alert" style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.4); border-left: 5px solid #ef4444; border-radius: 8px; padding: 12px 16px; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.6rem;">🚨</span>
            <div>
              <div style="font-weight: 700; color: #ef4444; font-size: 0.98rem;">ALERTA DE VALIDADE ATIVO NESTE FREEZER!</div>
              <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 2px;">
                Existem <strong>${alerts.totalAlerts} produto(s)</strong> exigindo atenção de validade (vencidos, vencendo hoje ou nos próximos dias).
              </div>
            </div>
          </div>
          <div style="font-size: 0.8rem; font-weight: 600; color: #ef4444; background: rgba(239,68,68,0.15); padding: 4px 10px; border-radius: 6px; white-space: nowrap;">
            ⚠️ Atenção Prioritária
          </div>
        </div>
      ` : '';

      return `
        <div class="chambers-page animate-fade-in">
          <div class="chamber-action-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
            <button class="btn btn-outline btn-sm" id="btn-back-to-overview" style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
              ${this.icons.ArrowLeft}
              Voltar aos Freezers
            </button>
            <div class="chamber-active-info" style="display: flex; align-items: center; gap: 8px;">
              <span class="status-dot" style="width:10px; height:10px; border-radius:50%; background-color:${alerts.hasCritical ? '#ef4444' : alerts.hasWarning ? '#f59e0b' : '#10b981'}; display:inline-block;"></span>
              <h2 class="chamber-title" style="margin: 0; font-size: 1.5rem; font-weight: 700;">${freezerStr}</h2>
            </div>
          </div>

          ${alertBannerHTML}

          <div class="glass-panel" style="padding: 1.5rem;">
            <div class="panel-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
              <div style="display:flex; flex-direction:column; gap:4px;">
                <h3 style="font-size: 1.2rem; font-weight: 600; margin: 0;">Produtos Alocados neste Freezer</h3>
                <p style="font-size:0.85rem; color:var(--text-secondary); margin: 0;">Total: ${products.length} itens armazenados no ${freezerStr}</p>
              </div>
              <button class="btn btn-primary" id="btn-open-allocation" style="display: flex; align-items: center; gap: 6px; background-color: #10b981; border-color: #10b981; color: white; cursor: pointer;">
                ${this.icons.Plus}
                Alocar Produto
              </button>
            </div>

            <div class="table-scroll">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>PLU</th>
                    <th>Produto</th>
                    <th>Estoque</th>
                    <th>Validade</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  ${products.length === 0 ? `
                    <tr>
                      <td colspan="6" class="empty-state" style="padding: 2.5rem; text-align: center; color: var(--text-secondary);">
                        <div style="font-size: 2rem; margin-bottom: 8px;">🧊</div>
                        Nenhum produto alocado neste freezer ainda.<br>
                        <small style="color: var(--text-tertiary); margin-top: 4px; display: inline-block;">Clique em "+ Alocar Produto" para adicionar itens a este freezer.</small>
                      </td>
                    </tr>
                  ` : products.map(p => {
                    const status = window.BrigadaData.getProductStatus(p);
                    const isCritical = status.days <= 0 || status.class === 'badge--expired' || status.class === 'badge--today';
                    const isWarning = status.days > 0 && status.days <= 3;
                    const isAlert = isCritical || isWarning || status.isResfriadoAlert || status.isCongeladoAlert;
                    const rowStyle = isCritical ? 'background: rgba(239, 68, 68, 0.08);' : isWarning ? 'background: rgba(245, 158, 11, 0.08);' : '';
                    const blinkBadgeClass = isAlert ? 'badge--blinking-alert' : '';

                    return `
                      <tr style="${rowStyle}">
                        <td><span class="plu-badge">${p.plu}</span></td>
                        <td style="font-weight: 500;">
                          <div>${p.name}</div>
                          <div style="font-size:0.7rem; color:var(--text-tertiary);">${this.catMap[p.category] || p.category || ''}</div>
                        </td>
                        <td><strong>${p.quantity}</strong> ${p.unit || 'kg'}</td>
                        <td><strong>${window.BrigadaData.formatDate(p.endDate)}</strong></td>
                        <td><span class="badge ${status.class} ${blinkBadgeClass}">${status.icon} ${status.label}</span></td>
                        <td>
                          <button class="btn btn-danger btn-sm" data-action="deallocate" data-id="${p.id}" style="cursor: pointer;">
                            🗑️ Desalocar
                          </button>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }
  },

  // ── Allocation Modal Attached to document.body ──
  openAllocationModal(freezerNum) {
    this.closeAllocationModal();

    this.allocatingFreezer = freezerNum;
    this.allocatingSearch = '';
    this.allocatingCategory = 'all';

    const freezerStr = `Freezer ${freezerNum.toString().padStart(2, '0')}`;
    const categoryTabsHTML = this.renderCategoryTabsHTML('all', true);

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'piso-alloc-modal-overlay';
    overlay.style.display = 'flex';

    overlay.innerHTML = `
      <div class="modal" id="piso-alloc-modal-card" style="width: 100%; max-width: 680px; max-height: min(90vh, 620px); display: flex; flex-direction: column; padding: 0;">
        <!-- Modal Header -->
        <div class="modal-header" style="padding: 1.1rem 1.5rem; border-bottom: 1px solid var(--glass-border);">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.4rem;">📦</span>
            <div>
              <h2 class="modal-title" style="margin: 0; font-size: 1.15rem; font-weight: 700;">Alocar Produto no ${freezerStr}</h2>
              <p style="margin: 0; font-size: 0.75rem; color: var(--text-secondary);">Selecione o produto abaixo para transferir ao freezer</p>
            </div>
          </div>
          <button class="modal-close" id="btn-modal-x-close" title="Fechar">✕</button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body" style="padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 0.85rem; overflow-y: auto; flex: 1 1 auto; min-height: 0;">
          <!-- Search Box -->
          <div class="search-box" style="width: 100%; margin: 0;">
            <span class="search-icon">🔍</span>
            <input type="text" id="modal-alloc-search" class="search-input" placeholder="Buscar por produto ou PLU..." autocomplete="off">
          </div>

          <!-- Category filter tabs -->
          <div class="cat-quick-tabs" id="modal-alloc-cat-tabs" style="display: flex; gap: 6px; flex-wrap: wrap; padding-bottom: 2px;">
            ${categoryTabsHTML}
          </div>

          <!-- Products Table -->
          <div class="table-scroll" style="max-height: 280px; overflow-y: auto; border-radius: 8px; border: 1px solid var(--glass-border);">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 80px;">PLU</th>
                  <th>Produto</th>
                  <th style="width: 90px;">Estoque</th>
                  <th style="text-align: right; width: 100px;">Ação</th>
                </tr>
              </thead>
              <tbody id="modal-alloc-tbody">
              </tbody>
            </table>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer" style="padding: 0.85rem 1.5rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--glass-border);">
          <div id="modal-alloc-count" style="font-size: 0.82rem; color: var(--text-secondary); font-weight: 500;">
            0 produtos disponíveis
          </div>
          <button type="button" class="btn btn--ghost" id="btn-modal-footer-close" style="display: flex; align-items: center; gap: 6px;">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:16px; height:16px;"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            <span>Fechar / Voltar</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('modal-overlay--visible'));

    // Initial render of product rows inside modal
    this.refreshModalProducts();

    // Search input listener
    const searchInp = document.getElementById('modal-alloc-search');
    if (searchInp) {
      searchInp.addEventListener('input', (e) => {
        this.allocatingSearch = e.target.value;
        this.refreshModalProducts();
      });
    }

    // Category tabs click listener
    overlay.querySelectorAll('.cat-tab[data-mcat]').forEach(tab => {
      tab.addEventListener('click', (e) => {
        overlay.querySelectorAll('.cat-tab[data-mcat]').forEach(t => t.classList.remove('cat-tab--active'));
        e.currentTarget.classList.add('cat-tab--active');
        this.allocatingCategory = e.currentTarget.dataset.mcat;
        this.refreshModalProducts();
      });
    });

    // Close buttons
    const closeBtnX = document.getElementById('btn-modal-x-close');
    if (closeBtnX) {
      closeBtnX.addEventListener('click', () => this.closeAllocationModal());
    }

    const closeBtnFooter = document.getElementById('btn-modal-footer-close');
    if (closeBtnFooter) {
      closeBtnFooter.addEventListener('click', () => this.closeAllocationModal());
    }

    // Click outside modal card to close
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.closeAllocationModal();
      }
    });

    // Escape key to close
    const handleKeydown = (e) => {
      if (e.key === 'Escape') {
        this.closeAllocationModal();
        document.removeEventListener('keydown', handleKeydown);
      }
    };
    document.addEventListener('keydown', handleKeydown);
  },

  refreshModalProducts() {
    const tbody = document.getElementById('modal-alloc-tbody');
    const countEl = document.getElementById('modal-alloc-count');
    if (!tbody) return;

    let unallocated = this.getUnallocatedProducts();

    if (this.allocatingCategory && this.allocatingCategory !== 'all') {
      unallocated = unallocated.filter(p => p.category === this.allocatingCategory);
    }

    if (this.allocatingSearch) {
      const q = this.allocatingSearch.toLowerCase().trim();
      unallocated = unallocated.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) || 
        (p.plu && p.plu.toLowerCase().includes(q))
      );
    }

    if (countEl) {
      countEl.textContent = `${unallocated.length} produto${unallocated.length === 1 ? '' : 's'} disponível${unallocated.length === 1 ? '' : 'is'}`;
    }

    if (unallocated.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="empty-state" style="padding: 2.5rem 1rem; text-align: center; color: var(--text-secondary);">
            <div style="font-size: 1.8rem; margin-bottom: 6px;">📭</div>
            <div>Nenhum produto disponível com os filtros atuais.</div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = unallocated.map(p => `
      <tr class="allocation-row">
        <td style="width: 80px;"><span class="plu-badge">${p.plu}</span></td>
        <td>
          <div class="product-name" style="font-weight: 600;">${p.name}</div>
          <div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 2px;">${this.catMap[p.category] || p.category || 'Geral'}</div>
        </td>
        <td style="white-space: nowrap; color: var(--text-secondary); font-weight: 500;">${p.quantity} ${p.unit || 'kg'}</td>
        <td style="text-align: right; width: 100px;">
          <button class="btn btn--primary btn--sm" data-action="confirm-alloc-modal" data-id="${p.id}" style="padding: 4px 12px; font-weight: 600;">
            Alocar
          </button>
        </td>
      </tr>
    `).join('');

    // Bind allocate buttons
    tbody.querySelectorAll('[data-action="confirm-alloc-modal"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = parseInt(e.currentTarget.dataset.id, 10);
        const newLocation = this.formatLocation(this.allocatingFreezer);
        if (window.BrigadaData && window.BrigadaData.updateProduct) {
          try {
            await window.BrigadaData.updateProduct(id, { location: newLocation });
            if (window.BrigadaUI && window.BrigadaUI.toast) {
              window.BrigadaUI.toast('Produto alocado com sucesso no freezer!', 'success');
            }
          } catch (err) {
            console.error('Erro ao alocar produto:', err);
          }
        }
        this.closeAllocationModal();
        this.render(this.container);
      });
    });
  },

  closeAllocationModal() {
    const existing = document.getElementById('piso-alloc-modal-overlay');
    if (existing) {
      existing.remove();
    }
    this.allocatingFreezer = null;
    this.allocatingSearch = '';
    this.allocatingCategory = 'all';
  },

  bindEvents() {
    if (!this.container) return;

    // Overview Events
    this.container.querySelectorAll('[data-action="view-freezer"]').forEach(el => {
      el.addEventListener('click', () => {
        this.selectedFreezer = parseInt(el.dataset.num, 10);
        this.closeAllocationModal();
        this.render(this.container);
      });
    });

    const dirSearchInput = this.container.querySelector('#dir-search-input');
    if (dirSearchInput) {
      dirSearchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.render(this.container);
        const newInp = this.container.querySelector('#dir-search-input');
        if (newInp) {
          newInp.focus();
          newInp.setSelectionRange(newInp.value.length, newInp.value.length);
        }
      });
    }

    this.container.querySelectorAll('.cat-tab[data-dir-cat]').forEach(el => {
      el.addEventListener('click', (e) => {
        this.filterCategory = e.currentTarget.dataset.dirCat;
        this.render(this.container);
      });
    });

    // Back to overview
    const backBtn = this.container.querySelector('#btn-back-to-overview');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.selectedFreezer = null;
        this.closeAllocationModal();
        this.render(this.container);
      });
    }

    // Open Allocation Modal
    const openAllocBtn = this.container.querySelector('#btn-open-allocation');
    if (openAllocBtn) {
      openAllocBtn.addEventListener('click', () => {
        this.openAllocationModal(this.selectedFreezer);
      });
    }

    // Deallocate
    this.container.querySelectorAll('[data-action="deallocate"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (confirm("Tem certeza que deseja desalocar este produto do freezer?")) {
          const id = parseInt(e.currentTarget.dataset.id, 10);
          if (window.BrigadaData && window.BrigadaData.updateProduct) {
            try {
              await window.BrigadaData.updateProduct(id, { location: 'piso_loja' });
              if (window.BrigadaUI && window.BrigadaUI.toast) {
                window.BrigadaUI.toast('Produto desalocado do freezer.', 'info');
              }
            } catch (err) {
              console.error('Erro ao desalocar produto:', err);
            }
          }
          this.render(this.container);
        }
      });
    });
  }
};

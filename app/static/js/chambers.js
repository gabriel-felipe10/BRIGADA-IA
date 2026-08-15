/**
 * BRIGADA-IA — Cold Chambers Map Module
 * Visualização e alocação de paletes em tempo real
 * Suporte a múltiplos itens por palete (paletes mistos/compostos),
 * grid de colunas moderno e acesso universal para todos os setores e usuários.
 */

window.BrigadaChambers = {
  selectedChamber: null, // null | 'Câmara Resfriada' | 'Câmara Congelada'
  selectedColumn: null,  // null = grid de colunas da câmara, number (1..16) = rack da coluna
  allocatingSlot: null,  // { level, position }
  searchAvailable: '',
  selectedCategoryFilter: null,
  allocationTab: 'manual', // 'manual' | 'scanner'
  scanStep: 'idle',        // 'idle' | 'scanning' | 'done'
  scannedResult: null,     // { product, expiryDate, photo }
  viewingSlot: null,       // { column, level, position }
  isListening: false,
  directorySearch: '',
  directoryFilter: 'all',

  CHAMBER_CONFIGS: {
    'Câmara Resfriada': {
      columnsCount: 4,
      capacity: 32, // 4 * 4 * 2
      temp: '2.5 °C',
      color: '#3b82f6',
      desc: 'Destinada a carnes resfriadas, laticínios, embutidos e perecíveis.'
    },
    'Câmara Congelada': {
      columnsCount: 16,
      capacity: 128, // 16 * 4 * 2
      temp: '-18.5 °C',
      color: '#6366f1',
      desc: 'Destinada a carnes congeladas, aves, pescados e congelados em geral.'
    }
  },

  catMap: {
    aves: '🐔 Aves',
    suino: '🐷 Suíno',
    bovino: '🐮 Bovino',
    pescado: '🐟 Pescado',
    frios: '🥓 Frios/Embutidos',
    laticinios: '🧀 Laticínios',
    iogurtes: '🥛 Iogurtes',
    pereciveis: '🥗 Perecíveis'
  },

  // SVGs for Icons
  icons: {
    Snowflake: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="12" x2="22" y2="12"></line><line x1="12" y1="2" x2="12" y2="22"></line><path d="m20 16-4-4 4-4"></path><path d="m4 8 4 4-4 4"></path><path d="m16 4-4 4-4-4"></path><path d="m8 20 4-4 4 4"></path></svg>`,
    Warehouse: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 22H2"></path><path d="M10 22V12H14V22"></path><path d="M18 22V10"></path><path d="M14 10V6H10V10"></path><path d="M6 22V14"></path><path d="M14 14V18H10V14"></path></svg>`,
    Thermometer: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"></path></svg>`,
    ArrowLeft: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`,
    Plus: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    Trash2: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`,
    Search: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
    Box: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`,
    Info: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
    Layers: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polygon points="2 17 12 22 22 17"></polygon><polygon points="2 12 12 17 22 12"></polygon></svg>`,
    ChevronRight: `<svg class="icon chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`,
    AlertCircle: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
    Camera: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>`,
    Calendar: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
    Scan: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path></svg>`,
    Printer: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>`,
    Mic: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>`,
  },

  // Parse location coordinates
  parseLocation(locationStr) {
    if (!locationStr) return null;
    const match = locationStr.match(/^(resfriado|congelado):C(\d+)-N(\d+)-([ED])$/);
    if (match) {
      return {
        chamber: match[1] === 'resfriado' ? 'Câmara Resfriada' : 'Câmara Congelada',
        column: parseInt(match[2], 10),
        level: parseInt(match[3], 10),
        position: match[4] === 'E' ? 'esquerda' : 'direita'
      };
    }
    return null;
  },

  // Format coordinates to location string
  formatLocation(chamberId, column, level, position) {
    const posCode = position === 'esquerda' ? 'E' : 'D';
    return `${chamberId}:C${column}-N${level}-${posCode}`;
  },

  // Dynamic canvas mock photo generator
  generatePalletPhoto(titleText, subtitleText, countText) {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(0, 0, 400, 300);
    
    // Wooden pallet base
    ctx.fillStyle = '#78350F';
    ctx.fillRect(20, 260, 360, 20);
    ctx.fillRect(40, 240, 40, 20);
    ctx.fillRect(180, 240, 40, 20);
    ctx.fillRect(320, 240, 40, 20);
    
    // Box structure
    ctx.fillStyle = '#b45309';
    ctx.fillRect(40, 40, 320, 200);
    
    // Plastic wrap sheen
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.moveTo(40, 40);
    ctx.lineTo(200, 40);
    ctx.lineTo(100, 240);
    ctx.lineTo(40, 240);
    ctx.fill();
    
    // Pallet Label
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(70, 65, 260, 150);
    ctx.strokeStyle = '#6366F1';
    ctx.lineWidth = 2;
    ctx.strokeRect(70, 65, 260, 150);
    
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('ETIQUETA DE PALETE - WMS', 85, 85);
    
    ctx.fillStyle = '#000000';
    for (let i = 0; i < 32; i++) {
      const width = Math.random() > 0.5 ? 4 : 2;
      ctx.fillRect(85 + (i * 7), 98, width, 25);
    }
    
    ctx.fillStyle = '#334155';
    ctx.font = '10px monospace';
    ctx.fillText(`PALETE: ${(titleText || '').slice(0, 24).toUpperCase()}`, 85, 145);
    ctx.fillText(`ITENS: ${countText || ''}`, 85, 162);
    ctx.fillText(`DATA/INFO: ${subtitleText || ''}`, 85, 179);
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('STATUS: QUALIFICADO', 85, 198);
    
    return canvas.toDataURL('image/jpeg');
  },

  render(container) {
    this.container = container;
    container.innerHTML = this.buildHTML();
    this.bindEvents();
  },

  // Retorna apenas os produtos das categorias permitidas para o setor do usuário logado
  getAllChamberProducts() {
    const all = window.BrigadaData.products || [];
    const allowed = window.BrigadaAuth.getAllowedCategoriesForUser(this.selectedChamber);
    const normalize = str => (str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    return all.filter(p => {
      if (!p.category) return true;
      const pCat = normalize(p.category);
      return allowed.some(ac => pCat.includes(normalize(ac)) || normalize(ac).includes(pCat));
    });
  },

  // Retorna todos os produtos alocados em uma coordenada de palete específica (array de itens)
  getProductAt(column, level, position) {
    if (!this.selectedChamber) return [];
    const allProducts = this.getAllChamberProducts();
    return allProducts.filter(p => {
      const parsed = this.parseLocation(p.location);
      return parsed &&
        parsed.chamber === this.selectedChamber &&
        parsed.column === column &&
        parsed.level === level &&
        parsed.position === position;
    });
  },

  // Calculate occupied slots across chambers
  getChamberStats() {
    const stats = {
      'Câmara Resfriada': { occupied: 0, uniqueSlots: new Set(), items: [] },
      'Câmara Congelada': { occupied: 0, uniqueSlots: new Set(), items: [] }
    };

    const allProducts = this.getAllChamberProducts();
    allProducts.forEach(p => {
      const parsed = this.parseLocation(p.location);
      if (parsed && stats[parsed.chamber]) {
        const slotKey = `C${parsed.column}-N${parsed.level}-${parsed.position}`;
        stats[parsed.chamber].uniqueSlots.add(slotKey);
        stats[parsed.chamber].items.push(p);
      }
    });

    stats['Câmara Resfriada'].occupied = stats['Câmara Resfriada'].uniqueSlots.size;
    stats['Câmara Congelada'].occupied = stats['Câmara Congelada'].uniqueSlots.size;

    return stats;
  },

  renderDirCategoryTabsHTML() {
    const allowed = window.BrigadaAuth.getAllowedCategoriesForUser(this.selectedChamber);
    const catLabels = {
      aves: '🐔 Aves',
      suino: '🐷 Suíno',
      bovino: '🐮 Bovino',
      pescado: '🐟 Pescado',
      frios: '🥓 Frios',
      laticinios: '🧀 Laticínios',
      iogurtes: '🥛 Iogurtes',
      pereciveis: '🥗 Perecíveis'
    };

    const tabs = [{ id: 'all', label: 'Todos' }];
    allowed.forEach(c => {
      if (catLabels[c]) {
        tabs.push({ id: c, label: catLabels[c] });
      }
    });

    return tabs.map(c => `
      <button class="cat-tab cat-tab--sm ${this.directoryFilter === c.id ? 'cat-tab--active' : ''}" data-dir-cat="${c.id}">
        ${c.label}
      </button>
    `).join('');
  },

  buildDirectoryHTML(productsList) {
    const allocatedProducts = productsList.filter(p => {
      const parsed = this.parseLocation(p.location);
      if (!parsed) return false;
      
      if (this.directoryFilter !== 'all') {
        const pCat = (p.category || '').toLowerCase();
        if (pCat !== this.directoryFilter) return false;
      }
      
      if (this.directorySearch) {
        const query = this.directorySearch.toLowerCase().trim();
        const address = `${parsed.chamber} C${parsed.column} N${parsed.level} ${parsed.position}`.toLowerCase();
        const shortAddress = `${parsed.chamber === 'Câmara Resfriada' ? 'resf' : 'cong'}:c${parsed.column}n${parsed.level}${parsed.position[0]}`.toLowerCase();
        return (p.name || '').toLowerCase().includes(query) || 
               String(p.plu || '').toLowerCase().includes(query) || 
               address.includes(query) ||
               shortAddress.includes(query);
      }
      return true;
    });

    const rowsHTML = allocatedProducts.length === 0 ? `
      <tr>
        <td colspan="8" class="empty-state" style="padding: 2.5rem; text-align: center;">
          <div class="empty-state__icon" style="font-size: 2rem; margin-bottom: 8px;">📭</div>
          <p class="empty-state__text" style="color: var(--text-secondary); margin: 0;">Nenhum palete alocado correspondente aos filtros.</p>
        </td>
      </tr>
    ` : allocatedProducts.map(p => {
      const parsed = this.parseLocation(p.location);
      const status = window.BrigadaData.getProductStatus(p);
      const isResf = parsed.chamber === 'Câmara Resfriada';
      const chamberLabel = isResf ? 'Resfriada' : 'Congelada';
      const addressLabel = `C${parsed.column.toString().padStart(2, '0')}-N${parsed.level}-${parsed.position === 'esquerda' ? 'E' : 'D'}`;
      
      const stockDist = window.BrigadaData.getProductStockDistribution(p);
      const sameDateOtherLocs = stockDist.sameDate.filter(d => d.id !== p.id);

      return `
        <tr>
          <td data-label="Endereço WMS"><strong style="color: ${isResf ? '#3b82f6' : '#818cf8'}; font-family: monospace; font-size: 0.95rem;">${addressLabel}</strong></td>
          <td data-label="Câmara"><span class="badge ${isResf ? 'badge--info' : 'badge--primary'}" style="font-size: 0.75rem; padding: 2px 8px;">${chamberLabel}</span></td>
          <td data-label="PLU"><span class="plu-badge">${p.plu}</span></td>
          <td data-label="Produto" class="product-name">
            <div onclick="window.BrigadaUI.showProductView('${p.id}')" style="cursor: pointer; font-weight: 600; color: var(--text-primary);" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='var(--text-primary)'" title="Ver detalhes">${p.name}</div>
            <div style="font-size: 0.72rem; color: var(--text-tertiary); margin-top: 1px;">${this.catMap[p.category] || p.category || 'Geral'}</div>
            ${sameDateOtherLocs.length > 0 ? `
              <div onclick="window.BrigadaUI.showProductView('${p.id}')" style="cursor: pointer; font-size: 0.68rem; color: #38bdf8; background: rgba(56,189,248,0.12); border: 1px solid rgba(56,189,248,0.3); border-radius: 4px; padding: 1px 6px; width: fit-content; margin-top: 3px; display: inline-flex; align-items: center; gap: 3px; font-weight: 600;" title="Mesma data também em outro local!">
                ⚡ Mesma data: ${sameDateOtherLocs.map(d => `${d.quantity}${d.unit} no ${d.shortLoc}`).join(', ')}
              </div>
            ` : ''}
          </td>
          <td data-label="Estoque"><strong>${p.quantity}</strong> <span style="font-size: 0.75rem; color: var(--text-secondary);">${p.unit || 'kg'}</span></td>
          <td data-label="Validade" style="white-space: nowrap;">${window.BrigadaData.formatDate(p.endDate)}</td>
          <td data-label="Status"><span class="badge ${status.class}">${status.icon} ${status.label}</span></td>
          <td data-label="Ações" class="actions-cell" style="white-space: nowrap;">
            <button class="btn btn-primary btn-sm" data-dir-action="zoom" data-chamber="${parsed.chamber}" data-col="${parsed.column}" style="padding: 4px 8px; font-size: 0.8rem; cursor: pointer;">
              👁️ Ver Rack
            </button>
            <button class="btn btn-danger btn-sm" data-dir-action="deallocate" data-id="${p.id}" style="padding: 4px 8px; font-size: 0.8rem; cursor: pointer; margin-left: 4px;">
              🗑️ Desalocar
            </button>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <div class="glass-panel" style="margin-top: 2rem; margin-bottom: 2rem;">
        <div class="glass-panel__header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <h3 class="glass-panel__title" style="font-size: 1.3rem; font-weight: 700; margin: 0; color: var(--text-primary);">📋 Diretório de Paletes Alocados</h3>
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin: 0;">Consulta e rastreamento de posições WMS de todos os setores em tempo real</p>
          </div>
          
          <div class="cat-quick-tabs" id="dir-cat-tabs" style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${this.renderDirCategoryTabsHTML()}
          </div>
        </div>

        <div class="toolbar" style="margin-bottom: 1.25rem;">
          <div class="search-box" style="flex: 1; max-width: 100%;">
            <span class="search-icon">🔍</span>
            <input type="text" id="dir-search-input" class="search-input" placeholder="Buscar por produto, PLU, código ou endereço (ex: C02, Congelada)..." value="${this.directorySearch}">
          </div>
        </div>

        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>Endereço WMS</th>
                <th>Câmara</th>
                <th>PLU</th>
                <th>Produto</th>
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

  // ── Grade de Cards das Colunas da Câmara Selecionada (Padrão Piso de Loja) ──
  buildColumnsGridHTML() {
    const config = this.CHAMBER_CONFIGS[this.selectedChamber];
    const isResfriada = this.selectedChamber === 'Câmara Resfriada';
    const themeColor = isResfriada ? '#3b82f6' : '#6366f1';
    const chamberIcon = isResfriada ? '❄️' : '🥶';
    const products = this.getAllChamberProducts();
    const stats = this.getChamberStats();
    const activeStats = stats[this.selectedChamber];
    const percent = Math.round((activeStats.occupied / config.capacity) * 100);

    const columnCardsHTML = Array.from({ length: config.columnsCount }, (_, i) => {
      const colNum = i + 1;
      const occupiedSlots = new Set();
      let totalItemsInCol = 0;

      products.forEach(p => {
        const parsed = this.parseLocation(p.location);
        if (parsed && parsed.chamber === this.selectedChamber && parsed.column === colNum) {
          occupiedSlots.add(`N${parsed.level}-${parsed.position}`);
          totalItemsInCol++;
        }
      });
      
      const colOccupiedCount = occupiedSlots.size;
      const hasProducts = colOccupiedCount > 0;
      const isFull = colOccupiedCount === 8;
      const statusColor = isFull ? '#ef4444' : hasProducts ? '#10b981' : '#9ca3af';

      return `
        <div class="chamber-card-outer" data-action="view-column" data-col="${colNum}" style="cursor: pointer;">
          <div class="chamber-card-header-glow" style="background: ${themeColor};"></div>
          <div class="chamber-card-body" style="padding: 1.2rem; text-align: center;">
            <div style="font-size: 2.5rem; font-weight: 800; color: ${themeColor}; margin-bottom: 0.5rem; font-family: monospace;">
              ${colNum.toString().padStart(2, '0')}
            </div>
            <h2 class="chamber-card-name" style="font-size: 1.2rem; margin-bottom: 0.5rem;">Coluna ${colNum.toString().padStart(2, '0')}</h2>
            
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 0.4rem;">
              <span class="status-dot" style="width: 10px; height: 10px; border-radius: 50%; background-color: ${statusColor};"></span>
              <span style="font-size: 0.9rem; color: var(--text-secondary); font-weight: 600;">${colOccupiedCount} / 8 Paletes</span>
            </div>
            
            <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 1rem;">
              ${totalItemsInCol} ${totalItemsInCol === 1 ? 'item alocado' : 'itens alocados'}
            </div>
            
            <div class="chamber-card-footer" style="justify-content: center;">
              <span class="enter-text">Acessar Rack</span>
              ${this.icons.ChevronRight}
            </div>
          </div>
        </div>
      `;
    }).join('');

    const chamberProducts = products.filter(p => {
      const parsed = this.parseLocation(p.location);
      return parsed && parsed.chamber === this.selectedChamber;
    });

    return `
      <div class="chambers-page">
        <div class="panel-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div class="panel-header__left" style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
            <button class="btn btn--ghost" id="btn-back-to-chambers" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; font-weight: 600;">
              ${this.icons.ArrowLeft}
              <span>Voltar para Câmaras</span>
            </button>
            <div>
              <h2 class="panel-title" style="margin: 0;">${chamberIcon} ${this.selectedChamber}</h2>
              <p class="panel-subtitle" style="margin: 0;">Mapa das ${config.columnsCount} colunas (${activeStats.occupied} de ${config.capacity} paletes ocupados • ${percent}% utilizado)</p>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
          ${columnCardsHTML}
        </div>

        ${this.buildDirectoryHTML(chamberProducts)}
      </div>
    `;
  },

  // ── Rack de Armazenamento da Coluna Selecionada (Layout Vertical de 4 Níveis) ──
  buildRackViewHTML() {
    const config = this.CHAMBER_CONFIGS[this.selectedChamber];
    const isResfriada = this.selectedChamber === 'Câmara Resfriada';
    const chamberIcon = isResfriada ? '❄️' : '🥶';
    const colNum = this.selectedColumn;
    const colStr = colNum.toString().padStart(2, '0');

    // Graphical Rack Level Rows
    const rackRowsHTML = Array.from({ length: 4 }, (_, i) => {
      const level = 4 - i; // levels from 4 (top) to 1 (ground)
      const leftProducts = this.getProductAt(colNum, level, 'esquerda');
      const rightProducts = this.getProductAt(colNum, level, 'direita');

      const isPiso = level === 1;
      const levelTypeTag = isPiso ? '📦 Piso' : level === 4 ? '🏗️ Aéreo (Topo)' : '🏗️ Aéreo';
      const levelColor = isPiso ? '#10b981' : level === 4 ? '#a855f7' : '#38bdf8';
      const levelBg = isPiso ? 'rgba(16,185,129,0.15)' : level === 4 ? 'rgba(168,85,247,0.15)' : 'rgba(56,189,248,0.15)';

      const renderSlot = (prods, position) => {
        const posLetter = position === 'esquerda' ? 'E' : 'D';
        const posLabel = position === 'esquerda' ? 'Esquerda (E)' : 'Direita (D)';

        if (prods && prods.length > 0) {
          const isMulti = prods.length > 1;
          const firstProd = prods[0];
          const totalQty = prods.reduce((sum, p) => sum + (parseFloat(p.quantity) || 0), 0);
          
          // Ordena pela validade mais próxima
          const sortedByDate = [...prods].sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
          const earliest = sortedByDate[0];
          const earliestStatus = window.BrigadaData.getProductStatus(earliest);

          return `
            <div class="pallet-content" style="position: relative;">
              <div class="pallet-position-badge ${position === 'esquerda' ? 'left' : 'right'}" data-action="view-pallet" data-col="${colNum}" data-lvl="${level}" data-pos="${position}" title="Ver composição deste palete" style="cursor: pointer;">
                ${posLetter}
              </div>

              <div class="pallet-info" data-action="view-pallet" data-col="${colNum}" data-lvl="${level}" data-pos="${position}" style="cursor: pointer; flex: 1;">
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px;">
                  <span class="pallet-product-name" style="font-weight: 700;" title="${isMulti ? `${prods.length} Itens no Palete` : firstProd.name}">
                    ${isMulti ? `📦 Palete Composto (${prods.length} itens)` : firstProd.name}
                  </span>
                </div>
                
                ${isMulti ? `
                  <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">
                    ${prods.map(p => `${p.quantity}${p.unit} ${p.name.slice(0, 14)}`).slice(0, 2).join(' • ')}${prods.length > 2 ? ` (+${prods.length - 2})` : ''}
                  </div>
                  <div class="pallet-tag-meta" style="margin-top: 4px;">
                    <span class="badge ${earliestStatus.class}" style="font-size: 0.65rem; padding: 1px 6px;">⚡ Próx. Val: ${window.BrigadaData.formatDate(earliest.endDate)}</span>
                    <span style="font-size: 0.68rem; font-weight: 700; color: #38bdf8; background: rgba(56,189,248,0.12); padding: 1px 6px; border-radius: 4px;">Total: ${totalQty.toFixed(totalQty % 1 === 0 ? 0 : 1)} ${firstProd.unit || 'kg'}</span>
                  </div>
                ` : `
                  <div class="pallet-meta">
                    <span class="pallet-sku">PLU: ${firstProd.plu}</span>
                    <span class="pallet-quantity"><strong>${firstProd.quantity || 0}</strong> ${firstProd.unit || 'kg'}</span>
                  </div>
                  <div class="pallet-tag-meta">
                    <span class="pallet-val-badge">Val: ${window.BrigadaData.formatDate(firstProd.endDate)}</span>
                    <span class="badge ${earliestStatus.class}" style="font-size: 0.65rem; padding: 1px 5px;">${earliestStatus.label}</span>
                  </div>
                `}
              </div>

              <!-- Botões rápidos no slot: Adicionar Item ou Ver Palete -->
              <div style="display: flex; flex-direction: column; gap: 4px; align-items: center; justify-content: center; margin-left: 6px;">
                <button class="btn-icon" data-action="add-item-to-pallet" data-col="${colNum}" data-lvl="${level}" data-pos="${position}" title="+ Adicionar outro produto neste palete" style="padding: 3px 6px; font-size: 0.72rem; background: rgba(56,189,248,0.15); border: 1px solid rgba(56,189,248,0.35); color: #38bdf8; border-radius: 6px; cursor: pointer; font-weight: 700;">
                  + Item
                </button>
                <button class="pallet-action-btn" data-action="view-pallet" data-col="${colNum}" data-lvl="${level}" data-pos="${position}" title="Ver e Gerenciar Palete" style="cursor: pointer; padding: 3px 6px; background: rgba(255,255,255,0.06); border: 1px solid var(--border-color); border-radius: 6px; font-size: 0.75rem;">
                  👁️
                </button>
              </div>
            </div>
          `;
        } else {
          return `
            <div class="pallet-empty-content" data-action="allocate-trigger" data-level="${level}" data-pos="${position}" style="cursor: pointer;">
              ${this.icons.Plus}
              <span>Alocar ${isPiso ? 'Piso' : 'Aéreo'} (${posLabel})</span>
            </div>
          `;
        }
      };

      const dividerHTML = level === 1 ? `
        <div style="display: flex; align-items: center; gap: 12px; margin: 14px 0 8px 0;">
          <div style="height: 1px; flex: 1; background: linear-gradient(90deg, transparent, rgba(16,185,129,0.5), transparent);"></div>
          <span style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; color: #10b981; background: rgba(16,185,129,0.12); padding: 3px 12px; border-radius: 12px; border: 1px solid rgba(16,185,129,0.3);">
            ⬇️ Nível 1 — Piso (Chão)
          </span>
          <div style="height: 1px; flex: 1; background: linear-gradient(90deg, transparent, rgba(16,185,129,0.5), transparent);"></div>
        </div>
      ` : (level === 4 ? `
        <div style="display: flex; align-items: center; gap: 12px; margin: 0 0 8px 0;">
          <div style="height: 1px; flex: 1; background: linear-gradient(90deg, transparent, rgba(56,189,248,0.5), transparent);"></div>
          <span style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; color: #38bdf8; background: rgba(56,189,248,0.12); padding: 3px 12px; border-radius: 12px; border: 1px solid rgba(56,189,248,0.3);">
            ⬆️ Níveis 2, 3 e 4 — Estrutura Aérea
          </span>
          <div style="height: 1px; flex: 1; background: linear-gradient(90deg, transparent, rgba(56,189,248,0.5), transparent);"></div>
        </div>
      ` : '');

      return `
        ${dividerHTML}
        <div class="rack-level-row" style="margin-bottom: 8px;">
          <div class="rack-level-label" style="min-width: 95px;">
            <span class="level-num" style="color: ${levelColor}; font-weight: 700;">Nível ${level}</span>
            <span class="level-tag" style="background: ${levelBg}; color: ${levelColor}; font-weight: 600; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px;">${levelTypeTag}</span>
          </div>

          <div class="rack-shelves-container">
            <div class="pallet-slot ${leftProducts.length > 0 ? 'occupied' : 'empty'}" data-level="${level}" data-pos="esquerda">
              ${renderSlot(leftProducts, 'esquerda')}
            </div>

            <div class="pallet-slot ${rightProducts.length > 0 ? 'occupied' : 'empty'}" data-level="${level}" data-pos="direita">
              ${renderSlot(rightProducts, 'direita')}
            </div>
          </div>

          <div class="rack-shelf-beam" style="background: ${isPiso ? '#10b981' : '#f59e0b'};"></div>
        </div>
      `;
    }).join('');

    const prevCol = colNum > 1 ? colNum - 1 : null;
    const nextCol = colNum < config.columnsCount ? colNum + 1 : null;

    return `
      <div class="chambers-page">
        <div class="panel-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
            <button class="btn btn--ghost" id="btn-back-to-columns" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; font-weight: 600;">
              ${this.icons.ArrowLeft}
              <span>Voltar para Colunas</span>
            </button>
            <div>
              <h2 class="panel-title" style="margin: 0;">${chamberIcon} ${this.selectedChamber} — Coluna ${colStr}</h2>
              <p class="panel-subtitle" style="margin: 0;">Layout vertical de 4 níveis de paletes (8 posições)</p>
            </div>
          </div>

          <!-- Navegador Rápido de Colunas -->
          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="btn btn--ghost btn--sm" data-action="nav-col" data-col="${prevCol}" ${prevCol ? '' : 'disabled'} style="padding: 6px 12px; font-weight: 600; cursor: ${prevCol ? 'pointer' : 'default'}; opacity: ${prevCol ? '1' : '0.4'};">
              ◀ Anterior
            </button>
            <select id="rack-column-select" class="form-input" style="padding: 5px 12px; font-size: 0.9rem; font-weight: 700; width: auto; border-radius: 6px; cursor: pointer; background: var(--bg-tertiary);">
              ${Array.from({ length: config.columnsCount }, (_, i) => {
                const c = i + 1;
                return `<option value="${c}" ${c === colNum ? 'selected' : ''}>Coluna ${c.toString().padStart(2, '0')}</option>`;
              }).join('')}
            </select>
            <button class="btn btn--ghost btn--sm" data-action="nav-col" data-col="${nextCol}" ${nextCol ? '' : 'disabled'} style="padding: 6px 12px; font-weight: 600; cursor: ${nextCol ? 'pointer' : 'default'}; opacity: ${nextCol ? '1' : '0.4'};">
              Próxima ▶
            </button>
          </div>
        </div>

        <div class="glass-panel" style="padding: 1.5rem; max-width: 920px; margin: 0 auto 2rem auto;">
          <div class="rack-container">
            ${rackRowsHTML}
            
            <div class="rack-legs-row">
              <div class="rack-leg"></div>
              <div class="rack-leg middle"></div>
              <div class="rack-leg"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  buildHTML() {
    const stats = this.getChamberStats();
    const allProducts = this.getAllChamberProducts();

    // 1. Visão Geral das Câmaras
    if (!this.selectedChamber) {
      const resfriadaCapacity = this.CHAMBER_CONFIGS['Câmara Resfriada'].capacity;
      const resfriadaOccupied = stats['Câmara Resfriada'].occupied;
      const resfriadaPercent = Math.round((resfriadaOccupied / resfriadaCapacity) * 100);

      const congeladaCapacity = this.CHAMBER_CONFIGS['Câmara Congelada'].capacity;
      const congeladaOccupied = stats['Câmara Congelada'].occupied;
      const congeladaPercent = Math.round((congeladaOccupied / congeladaCapacity) * 100);

      return `
        <div class="chambers-page">
          <div class="panel-header">
            <div class="panel-header__left">
              <h2 class="panel-title">❄️ Mapa das Câmaras Frias</h2>
              <p class="panel-subtitle">Visualização e alocação de paletes em tempo real — Todos os setores</p>
            </div>
          </div>

          <div class="chambers-grid-container">
            <div class="chambers-side-by-side">
              <!-- Câmara Resfriada -->
              <div class="chamber-card-outer chamber-resfriada" id="card-chamber-resfriada" style="cursor: pointer;">
                <div class="chamber-card-header-glow" style="background: #3B82F6;"></div>
                <div class="chamber-card-body">
                  <div class="chamber-badge-container">
                    <span class="chamber-type-badge" style="color: #3b82f6; background-color: rgba(59, 130, 246, 0.15)">
                      ${this.icons.Snowflake}
                      Resfriada
                    </span>
                    <div class="chamber-temp-indicator" style="color: #3b82f6; display: flex; align-items: center; gap: 4px;">
                      ${this.icons.Thermometer}
                      <span>2.5 °C</span>
                    </div>
                  </div>

                  <h2 class="chamber-card-name">Câmara Resfriada</h2>
                  <p class="chamber-card-desc">Destinada a carnes resfriadas, laticínios, frios e perecíveis (4 Colunas).</p>

                  <div class="chamber-capacity-info">
                    <div class="capacity-labels">
                      <span>Ocupação</span>
                      <span class="capacity-fraction">${resfriadaOccupied} / ${resfriadaCapacity} Paletes</span>
                    </div>
                    <div class="capacity-bar-bg">
                      <div class="capacity-bar-fill" style="width: ${resfriadaPercent}%; background: linear-gradient(90deg, #3B82F6, #3B82F6cc);"></div>
                    </div>
                    <div class="capacity-percentage-label">
                      <span>${resfriadaPercent}% capacidade utilizada</span>
                    </div>
                  </div>

                  <div class="chamber-card-footer">
                    <span class="enter-text">Explorar Colunas</span>
                    ${this.icons.ChevronRight}
                  </div>
                </div>
              </div>

              <!-- Câmara Congelada -->
              <div class="chamber-card-outer chamber-congelada" id="card-chamber-congelada" style="cursor: pointer;">
                <div class="chamber-card-header-glow" style="background: #6366F1;"></div>
                <div class="chamber-card-body">
                  <div class="chamber-badge-container">
                    <span class="chamber-type-badge" style="color: #6366f1; background-color: rgba(99, 102, 241, 0.15)">
                      ${this.icons.Warehouse}
                      Congelada
                    </span>
                    <div class="chamber-temp-indicator" style="color: #6366F1; display: flex; align-items: center; gap: 4px;">
                      ${this.icons.Thermometer}
                      <span>-18.5 °C</span>
                    </div>
                  </div>

                  <h2 class="chamber-card-name">Câmara Congelada</h2>
                  <p class="chamber-card-desc">Destinada a carnes congeladas, aves, pescados e congelados em geral (16 Colunas).</p>

                  <div class="chamber-capacity-info">
                    <div class="capacity-labels">
                      <span>Ocupação</span>
                      <span class="capacity-fraction">${congeladaOccupied} / ${congeladaCapacity} Paletes</span>
                    </div>
                    <div class="capacity-bar-bg">
                      <div class="capacity-bar-fill" style="width: ${congeladaPercent}%; background: linear-gradient(90deg, #6366F1, #6366F1cc);"></div>
                    </div>
                    <div class="capacity-percentage-label">
                      <span>${congeladaPercent}% capacidade utilizada</span>
                    </div>
                  </div>

                  <div class="chamber-card-footer">
                    <span class="enter-text">Explorar Colunas</span>
                    ${this.icons.ChevronRight}
                  </div>
                </div>
              </div>
            </div>

            ${this.buildDirectoryHTML(allProducts)}

            <!-- Caixa Explicativa -->
            <div class="chambers-quick-info" style="margin-top: 1.5rem;">
              <div class="info-card">
                <div class="info-icon-wrapper" style="color: #6366F1; flex-shrink: 0; margin-top: 3px;">
                  ${this.icons.Info}
                </div>
                <div>
                  <h4 style="font-weight: 600; margin-bottom: 4px; color: var(--text-primary);">Como funciona a alocação de posições e paletes?</h4>
                  <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5;">
                    A Câmara Resfriada possui <strong>4 Colunas</strong> e a Câmara Congelada possui <strong>16 Colunas</strong>. Cada coluna representa uma estrutura vertical (Rack) com <strong>4 níveis de altura</strong> e <strong>2 paletes por nível (Esquerda e Direita)</strong>.
                    Cada palete pode conter <strong>1 ou múltiplos itens</strong> (palete misto). Você pode adicionar novos itens a qualquer momento clicando no botão <strong>+ Item</strong> ou abrindo o palete.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // 2. Visão do Grid de Colunas da Câmara Selecionada
    if (this.selectedColumn === null) {
      return this.buildColumnsGridHTML();
    }

    // 3. Visão Detalhada do Rack da Coluna
    return this.buildRackViewHTML();
  },

  bindEvents() {
    if (!this.container) return;

    // Clique no Card da Câmara Resfriada
    const resfriadaCard = this.container.querySelector('#card-chamber-resfriada');
    if (resfriadaCard) {
      resfriadaCard.addEventListener('click', () => {
        this.selectedChamber = 'Câmara Resfriada';
        this.selectedColumn = null;
        this.render(this.container);
      });
    }

    // Clique no Card da Câmara Congelada
    const congeladaCard = this.container.querySelector('#card-chamber-congelada');
    if (congeladaCard) {
      congeladaCard.addEventListener('click', () => {
        this.selectedChamber = 'Câmara Congelada';
        this.selectedColumn = null;
        this.render(this.container);
      });
    }

    // Voltar para Câmaras (Visão Geral)
    const backToChambersBtn = this.container.querySelector('#btn-back-to-chambers');
    if (backToChambersBtn) {
      backToChambersBtn.addEventListener('click', () => {
        this.selectedChamber = null;
        this.selectedColumn = null;
        this.render(this.container);
      });
    }

    // Voltar para Grid de Colunas
    const backToColumnsBtn = this.container.querySelector('#btn-back-to-columns');
    if (backToColumnsBtn) {
      backToColumnsBtn.addEventListener('click', () => {
        this.selectedColumn = null;
        this.render(this.container);
      });
    }

    // Clique no Card de uma Coluna (no Grid)
    this.container.querySelectorAll('[data-action="view-column"][data-col]').forEach(card => {
      card.addEventListener('click', () => {
        this.selectedColumn = parseInt(card.dataset.col, 10);
        this.render(this.container);
      });
    });

    // Navegador de Colunas (Anterior / Próxima)
    this.container.querySelectorAll('[data-action="nav-col"][data-col]').forEach(btn => {
      btn.addEventListener('click', () => {
        const colVal = btn.dataset.col;
        if (colVal && colVal !== 'null') {
          this.selectedColumn = parseInt(colVal, 10);
          this.render(this.container);
        }
      });
    });

    // Dropdown Select na Barra do Rack
    const rackColSelect = this.container.querySelector('#rack-column-select');
    if (rackColSelect) {
      rackColSelect.addEventListener('change', (e) => {
        this.selectedColumn = parseInt(e.target.value, 10);
        this.render(this.container);
      });
    }

    // Ver Detalhes / Composição do Palete
    this.container.querySelectorAll('[data-action="view-pallet"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const col = parseInt(el.dataset.col, 10);
        const lvl = parseInt(el.dataset.lvl, 10);
        const pos = el.dataset.pos;
        this.openPalletModal(col, lvl, pos);
      });
    });

    // Adicionar Item a Palete Existente (Botão '+ Item')
    this.container.querySelectorAll('[data-action="add-item-to-pallet"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.allocatingSlot = {
          level: parseInt(btn.dataset.lvl, 10),
          position: btn.dataset.pos
        };
        this.selectedCategoryFilter = null;
        this.searchAvailable = '';
        this.openAllocationModal();
      });
    });

    // Trigger de Alocação em Slot Vazio
    this.container.querySelectorAll('[data-action="allocate-trigger"]').forEach(el => {
      el.addEventListener('click', () => {
        this.allocatingSlot = {
          level: parseInt(el.dataset.level, 10),
          position: el.dataset.pos
        };
        this.selectedCategoryFilter = null;
        this.searchAvailable = '';
        this.openAllocationModal();
      });
    });

    // Diretório: Input de Busca
    const dirSearchInput = this.container.querySelector('#dir-search-input');
    if (dirSearchInput) {
      dirSearchInput.addEventListener('input', (e) => {
        this.directorySearch = e.target.value;
        this.updateDirectoryView(this.container);
      });
    }

    // Diretório: Abas de Categorias
    this.container.querySelectorAll('#dir-cat-tabs .cat-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.container.querySelectorAll('#dir-cat-tabs .cat-tab').forEach(t => t.classList.remove('cat-tab--active'));
        tab.classList.add('cat-tab--active');
        this.directoryFilter = tab.dataset.dirCat;
        this.updateDirectoryView(this.container);
      });
    });

    // Diretório: Ações das Linhas
    const tbody = this.container.querySelector('#dir-tbody');
    if (tbody) {
      this.bindDirectoryRowEvents(tbody);
    }
  },

  updateDirectoryView(container) {
    const products = this.selectedChamber 
      ? this.getAllChamberProducts().filter(p => {
          const parsed = this.parseLocation(p.location);
          return parsed && parsed.chamber === this.selectedChamber;
        })
      : this.getAllChamberProducts();

    const tbody = container.querySelector('#dir-tbody');
    if (!tbody) return;

    const allocatedProducts = products.filter(p => {
      const parsed = this.parseLocation(p.location);
      if (!parsed) return false;
      
      if (this.directoryFilter !== 'all') {
        const pCat = (p.category || '').toLowerCase();
        if (pCat !== this.directoryFilter) return false;
      }
      
      if (this.directorySearch) {
        const query = this.directorySearch.toLowerCase().trim();
        const address = `${parsed.chamber} C${parsed.column} N${parsed.level} ${parsed.position}`.toLowerCase();
        const shortAddress = `${parsed.chamber === 'Câmara Resfriada' ? 'resf' : 'cong'}:c${parsed.column}n${parsed.level}${parsed.position[0]}`.toLowerCase();
        return (p.name || '').toLowerCase().includes(query) || 
               String(p.plu || '').toLowerCase().includes(query) || 
               address.includes(query) ||
               shortAddress.includes(query);
      }
      return true;
    });

    if (allocatedProducts.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="empty-state" style="padding: 2.5rem; text-align: center;">
            <div class="empty-state__icon" style="font-size: 2rem; margin-bottom: 8px;">📭</div>
            <p class="empty-state__text" style="color: var(--text-secondary); margin: 0;">Nenhum palete alocado correspondente aos filtros.</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = allocatedProducts.map(p => {
      const parsed = this.parseLocation(p.location);
      const status = window.BrigadaData.getProductStatus(p);
      const isResf = parsed.chamber === 'Câmara Resfriada';
      const chamberLabel = isResf ? 'Resfriada' : 'Congelada';
      const addressLabel = `C${parsed.column.toString().padStart(2, '0')}-N${parsed.level}-${parsed.position === 'esquerda' ? 'E' : 'D'}`;
      
      const stockDist = window.BrigadaData.getProductStockDistribution(p);
      const sameDateOtherLocs = stockDist.sameDate.filter(d => d.id !== p.id);

      return `
        <tr>
          <td data-label="Endereço WMS"><strong style="color: ${isResf ? '#3b82f6' : '#818cf8'}; font-family: monospace; font-size: 0.95rem;">${addressLabel}</strong></td>
          <td data-label="Câmara"><span class="badge ${isResf ? 'badge--info' : 'badge--primary'}" style="font-size: 0.75rem; padding: 2px 8px;">${chamberLabel}</span></td>
          <td data-label="PLU"><span class="plu-badge">${p.plu}</span></td>
          <td data-label="Produto" class="product-name">
            <div onclick="window.BrigadaUI.showProductView('${p.id}')" style="cursor: pointer; font-weight: 600; color: var(--text-primary);" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='var(--text-primary)'" title="Ver detalhes">${p.name}</div>
            <div style="font-size: 0.72rem; color: var(--text-tertiary); margin-top: 1px;">${this.catMap[p.category] || p.category || 'Geral'}</div>
            ${sameDateOtherLocs.length > 0 ? `
              <div onclick="window.BrigadaUI.showProductView('${p.id}')" style="cursor: pointer; font-size: 0.68rem; color: #38bdf8; background: rgba(56,189,248,0.12); border: 1px solid rgba(56,189,248,0.3); border-radius: 4px; padding: 1px 6px; width: fit-content; margin-top: 3px; display: inline-flex; align-items: center; gap: 3px; font-weight: 600;" title="Mesma data também em outro local!">
                ⚡ Mesma data: ${sameDateOtherLocs.map(d => `${d.quantity}${d.unit} no ${d.shortLoc}`).join(', ')}
              </div>
            ` : ''}
          </td>
          <td data-label="Estoque"><strong>${p.quantity}</strong> <span style="font-size: 0.75rem; color: var(--text-secondary);">${p.unit || 'kg'}</span></td>
          <td data-label="Validade" style="white-space: nowrap;">${window.BrigadaData.formatDate(p.endDate)}</td>
          <td data-label="Status"><span class="badge ${status.class}">${status.icon} ${status.label}</span></td>
          <td data-label="Ações" class="actions-cell" style="white-space: nowrap;">
            <button class="btn btn-primary btn-sm" data-dir-action="zoom" data-chamber="${parsed.chamber}" data-col="${parsed.column}" style="padding: 4px 8px; font-size: 0.8rem; cursor: pointer;">
              👁️ Ver Rack
            </button>
            <button class="btn btn-danger btn-sm" data-dir-action="deallocate" data-id="${p.id}" style="padding: 4px 8px; font-size: 0.8rem; cursor: pointer; margin-left: 4px;">
              🗑️ Desalocar
            </button>
          </td>
        </tr>
      `;
    }).join('');

    this.bindDirectoryRowEvents(tbody);
  },

  bindDirectoryRowEvents(tbody) {
    tbody.querySelectorAll('[data-dir-action="zoom"]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedChamber = btn.dataset.chamber;
        this.selectedColumn = parseInt(btn.dataset.col, 10);
        this.render(this.container);
      });
    });

    tbody.querySelectorAll('[data-dir-action="deallocate"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const prodId = parseInt(btn.dataset.id, 10);
        if (confirm('Tem certeza que deseja desalocar este item?')) {
          await this.deallocateProduct(prodId);
        }
      });
    });
  },

  // ── Modal de Visualização Completa da Composição do Palete (Múltiplos Itens) ──
  openPalletModal(col, lvl, pos) {
    this.closeModal('pallet-details-modal');
    this.viewingSlot = { column: col, level: lvl, position: pos };

    const prods = this.getProductAt(col, lvl, pos);
    if (!prods || prods.length === 0) return;

    const isMulti = prods.length > 1;
    const totalQty = prods.reduce((sum, p) => sum + (parseFloat(p.quantity) || 0), 0);
    const sortedByDate = [...prods].sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
    const earliest = sortedByDate[0];
    const mockPhoto = this.generatePalletPhoto(
      isMulti ? `Palete Composto (${prods.length} Itens)` : prods[0].name,
      `Val. Crítica: ${window.BrigadaData.formatDate(earliest.endDate)}`,
      `${prods.length} itens cadastrados`
    );

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay modal-overlay--visible';
    overlay.id = 'pallet-details-modal';

    const itemsRowsHTML = prods.map((p, idx) => {
      const st = window.BrigadaData.getProductStatus(p);
      const stockDist = window.BrigadaData.getProductStockDistribution(p);
      const sameDateOtherLocs = stockDist.sameDate.filter(d => d.id !== p.id);

      return `
        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
          <div style="flex: 1; min-width: 180px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-weight: 700; color: var(--text-primary); font-size: 0.95rem; cursor: pointer;" onclick="window.BrigadaUI.showProductView('${p.id}')" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='var(--text-primary)'" title="Ver ficha completa do produto">
                ${idx + 1}. ${p.name}
              </span>
              <span class="plu-badge" style="font-size: 0.7rem;">${p.plu}</span>
            </div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">
              ${this.catMap[p.category] || p.category || 'Geral'}
              ${p.supplier ? ` • 🏢 ${p.supplier}` : ''}
              ${p.startDate ? ` • Cadastrado: ${window.BrigadaData.formatDate(p.startDate)}` : ''}
            </div>
            ${sameDateOtherLocs.length > 0 ? `
              <div onclick="window.BrigadaUI.showProductView('${p.id}')" style="cursor: pointer; font-size: 0.68rem; color: #38bdf8; background: rgba(56,189,248,0.12); border: 1px solid rgba(56,189,248,0.3); border-radius: 4px; padding: 1px 6px; width: fit-content; margin-top: 3px; display: inline-flex; align-items: center; gap: 3px; font-weight: 600;">
                ⚡ Mesma data em: ${sameDateOtherLocs.map(d => `${d.quantity}${d.unit} no ${d.shortLoc}`).join(', ')}
              </div>
            ` : ''}
          </div>

          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="text-align: right;">
              <div style="font-size: 1rem; font-weight: 700; color: var(--text-primary);">${p.quantity} ${p.unit || 'kg'}</div>
              <div style="font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); margin-top: 1px;">
                Val: <b>${window.BrigadaData.formatDate(p.endDate)}</b>
              </div>
            </div>

            <span class="badge ${st.class}" style="font-size: 0.7rem; padding: 2px 6px; white-space: nowrap;">
              ${st.label}
            </span>

            <button class="btn btn-outline btn-sm" data-action="remove-item-from-pallet" data-id="${p.id}" title="Remover apenas este item do palete" style="padding: 4px 8px; color: #ef4444; border-color: rgba(239,68,68,0.3); font-size: 0.78rem; cursor: pointer;">
              🗑️
            </button>
          </div>
        </div>
      `;
    }).join('');

    overlay.innerHTML = `
      <div class="modal" style="max-width: 680px;">
        <div class="modal-header">
          <div>
            <h3 class="modal-title" style="margin: 0; display: flex; align-items: center; gap: 8px;">
              <span>📦 Composição do Palete</span>
              <span style="font-size: 0.8rem; font-weight: 700; color: #38bdf8; background: rgba(56,189,248,0.15); padding: 2px 8px; border-radius: 9999px;">
                ${prods.length} ${prods.length === 1 ? 'item' : 'itens'}
              </span>
            </h3>
            <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 2px;">
              ${this.selectedChamber} • Coluna ${col.toString().padStart(2, '0')} • ${lvl === 1 ? 'Piso (Nível 1)' : `Aéreo (Nível ${lvl})`} • Posição ${pos.toUpperCase()}
            </div>
          </div>
          <button class="modal-close" id="pallet-modal-close">✕</button>
        </div>

        <div class="modal-body" style="padding: 1.25rem;">
          <!-- Top Info Card -->
          <div style="display: flex; gap: 14px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px 14px; margin-bottom: 1.25rem; align-items: center; flex-wrap: wrap;">
            <div style="width: 96px; height: 80px; border-radius: 8px; background: linear-gradient(135deg, rgba(56,189,248,0.12), rgba(99,102,241,0.18)); border: 1px solid rgba(56,189,248,0.3); display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; overflow: hidden; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
              <div style="font-size: 2.1rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); line-height: 1;">📦</div>
              <div style="font-size: 0.62rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; color: #38bdf8; margin-top: 3px; background: rgba(15,23,42,0.6); padding: 1px 6px; border-radius: 4px; border: 1px solid rgba(56,189,248,0.3);">
                CARGA WMS
              </div>
            </div>
            <div style="flex: 1; min-width: 200px;">
              <div style="font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; display: flex; align-items: center; gap: 4px;">
                🏷️ Resumo da Carga
              </div>
              <div style="display: flex; gap: 14px; margin-top: 6px; flex-wrap: wrap;">
                <div style="font-size: 0.88rem;">Volume Total: <strong style="color: #10b981; font-size: 0.95rem;">${totalQty.toFixed(totalQty % 1 === 0 ? 0 : 1)} ${prods[0].unit || 'kg'}</strong></div>
                <div style="font-size: 0.88rem;">Validade Mais Crítica: <strong style="color: #f59e0b; font-size: 0.95rem;">${window.BrigadaData.formatDate(earliest.endDate)}</strong></div>
              </div>
            </div>
            <div>
              <button class="btn btn-primary btn-sm" id="btn-pallet-modal-add-item" style="display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; font-weight: 700; cursor: pointer;">
                ${this.icons.Plus}
                <span>+ Adicionar Item ao Palete</span>
              </button>
            </div>
          </div>

          <!-- Items List in Pallet -->
          <div style="margin-bottom: 1rem;">
            <div style="font-size: 0.82rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
              📋 Produtos Contidos Neste Palete (${prods.length}):
            </div>
            <div style="max-height: 320px; overflow-y: auto; padding-right: 4px;">
              ${itemsRowsHTML}
            </div>
          </div>

          <!-- Bottom Actions -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 1rem; flex-wrap: wrap; gap: 8px;">
            <button class="btn btn-danger btn-sm" id="btn-pallet-modal-deallocate-all" style="display: inline-flex; align-items: center; gap: 6px;">
              ${this.icons.Trash2}
              <span>Desalocar Todo o Palete (${prods.length} itens)</span>
            </button>
            <button class="btn btn-outline btn-sm" id="btn-pallet-modal-close-bottom">
              Fechar
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const closeModalHandler = () => {
      this.closeModal('pallet-details-modal');
      this.viewingSlot = null;
    };

    document.getElementById('pallet-modal-close').addEventListener('click', closeModalHandler);
    document.getElementById('btn-pallet-modal-close-bottom').addEventListener('click', closeModalHandler);

    overlay.addEventListener('click', (e) => {
      if (e.target.id === 'pallet-details-modal') {
        closeModalHandler();
      }
    });

    // Botão '+ Adicionar Item ao Palete' dentro do modal
    document.getElementById('btn-pallet-modal-add-item')?.addEventListener('click', () => {
      this.closeModal('pallet-details-modal');
      this.allocatingSlot = { level: lvl, position: pos };
      this.selectedCategoryFilter = null;
      this.searchAvailable = '';
      this.openAllocationModal();
    });

    // Remover Item Individual do Palete
    overlay.querySelectorAll('[data-action="remove-item-from-pallet"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const prodId = parseInt(btn.dataset.id, 10);
        if (confirm('Tem certeza que deseja remover este item deste palete?')) {
          await this.deallocateProduct(prodId, false);
          // Atualiza o modal do palete se ainda houver outros itens
          const remaining = this.getProductAt(col, lvl, pos);
          if (remaining.length > 0) {
            this.openPalletModal(col, lvl, pos);
          } else {
            this.closeModal('pallet-details-modal');
          }
          this.render(this.container);
        }
      });
    });

    // Desalocar Todo o Palete
    document.getElementById('btn-pallet-modal-deallocate-all')?.addEventListener('click', async () => {
      if (confirm(`Tem certeza que deseja desalocar TODOS os ${prods.length} itens deste palete?`)) {
        this.closeModal('pallet-details-modal');
        for (const p of prods) {
          await this.deallocateProduct(p.id, false);
        }
        window.BrigadaUI.showToast('Palete inteiro desalocado com sucesso!', 'success');
        this.render(this.container);
      }
    });
  },

  // ── Modal de Alocação de Paletes (Universal e Suporta Adicionar Itens) ──
  openAllocationModal() {
    this.closeModal('allocation-modal');
    if (!this.allocatingSlot) return;

    const col = this.selectedColumn;
    const lvl = this.allocatingSlot.level;
    const pos = this.allocatingSlot.position;
    const existingProdsInSlot = this.getProductAt(col, lvl, pos);

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay modal-overlay--visible';
    overlay.id = 'allocation-modal';

    const allowed = window.BrigadaAuth.getAllowedCategoriesForUser(this.selectedChamber);
    const catLabels = {
      aves: '🐔 Aves',
      bovino: '🐮 Bovino',
      suino: '🐷 Suíno',
      pescado: '🐟 Pescado',
      frios: '🥓 Frios',
      laticinios: '🧀 Laticínios',
      iogurtes: '🥛 Iogurtes',
      pereciveis: '🥗 Perecíveis'
    };

    const categoriesList = [{ id: 'todos', label: 'Todos' }];
    allowed.forEach(c => {
      if (catLabels[c]) {
        categoriesList.push({ id: c, label: catLabels[c] });
      }
    });

    const renderManualTab = () => {
      const available = this.getAvailableProductsForAllocation();

      const categoryChipsHTML = `
        <div class="allocator-category-chips" style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 12px; flex-wrap: wrap;">
          ${categoriesList.map(cat => {
            const isActive = this.selectedCategoryFilter === cat.id;
            return `
              <button type="button" class="category-chip ${isActive ? 'active' : ''}" data-category="${cat.id}" style="
                padding: 6px 12px;
                font-size: 0.82rem;
                border-radius: 20px;
                border: 1px solid ${isActive ? '#38bdf8' : 'var(--border-color, rgba(255,255,255,0.15))'};
                background: ${isActive ? 'rgba(56,189,248,0.2)' : 'var(--bg-tertiary, rgba(255,255,255,0.05))'};
                color: ${isActive ? '#38bdf8' : 'var(--text-primary)'};
                cursor: pointer;
                white-space: nowrap;
                font-weight: 600;
                transition: all 0.15s ease;
              ">
                ${cat.label}
              </button>
            `;
          }).join('')}
        </div>
      `;

      let prodsListHTML = '';
      const hasFilterActive = Boolean(this.selectedCategoryFilter || this.searchAvailable);

      if (!hasFilterActive) {
        const catExamples = allowed.slice(0, 3).map(c => catLabels[c] || c).join(', ');
        prodsListHTML = `
          <div class="empty-allocator-state" style="text-align: center; padding: 2.5rem 1.5rem; color: var(--text-secondary); background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px dashed var(--border-color, rgba(255,255,255,0.1));">
            <div style="font-size: 2.2rem; margin-bottom: 8px;">👆</div>
            <div style="font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">Selecione uma categoria acima</div>
            <div style="font-size: 0.82rem; color: var(--text-secondary); max-width: 380px; margin: 0 auto;">
              Clique em uma categoria (<strong>${catExamples}</strong>) ou faça uma busca por nome/PLU para listar os produtos.
            </div>
          </div>
        `;
      } else if (available.length === 0) {
        prodsListHTML = `
          <div class="empty-allocator-state" style="text-align: center; padding: 2rem; color: var(--text-tertiary);">
            <div style="font-size: 2rem; margin-bottom: 8px;">⚠️</div>
            <span>Nenhum produto encontrado no catálogo do seu setor com os filtros atuais.</span>
          </div>
        `;
      } else {
        prodsListHTML = available.map(p => `
          <div class="available-product-row" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--bg-tertiary); border-radius: 8px; margin-bottom: 8px; border: 1px solid var(--border-color);">
            <div class="prod-main-details" style="display: flex; flex-direction: column; gap: 2px;">
              <span class="prod-name" style="font-weight: 600; color: var(--text-primary); font-size: 0.92rem;">${p.name}</span>
              <div class="prod-meta" style="display: flex; gap: 8px; font-size: 0.75rem; color: var(--text-secondary);">
                <span class="prod-sku">PLU: ${p.plu}</span>
                <span class="prod-category" style="text-transform: capitalize;">Setor: ${this.catMap[p.category] || p.category || 'Geral'}</span>
              </div>
            </div>
            <button class="btn btn-primary btn-sm" data-action="allocate-select-catalog" data-id="${p.id || ''}" data-plu="${p.plu}">
              Selecionar
            </button>
          </div>
        `).join('');
      }

      const activeCatItem = categoriesList.find(c => c.id === this.selectedCategoryFilter);
      const activeCatName = activeCatItem ? activeCatItem.label : '';
      const listTitle = this.selectedCategoryFilter ? `Produtos em ${activeCatName} (${available.length})` : this.searchAvailable ? `Resultados da busca (${available.length})` : 'Aguardando seleção de categoria';

      const userSectorName = (window.BrigadaAuth.currentUser?.sector || '').toUpperCase();

      return `
        <div class="allocator-search-wrapper" style="position: relative; display: flex; align-items: center; margin-bottom: 0.75rem; background: var(--bg-tertiary); border-radius: var(--radius-md); border: 1px solid var(--border-color); padding: 0 12px;">
          <div style="color: var(--text-tertiary); margin-right: 8px;">${this.icons.Search}</div>
          <input type="text" id="allocator-search-input" class="allocator-search-input" placeholder="${this.isListening ? 'Ouvindo... fale agora' : 'Filtro inteligente: nome, PLU, código de barras...'}" value="${this.searchAvailable || ''}" style="flex: 1; padding: 10px 0; border: none; background: transparent; font-size: 0.9rem;" autofocus />
          ${this.searchAvailable ? `
            <button type="button" id="allocator-clear-btn" style="background: none; border: none; color: var(--text-tertiary); cursor: pointer; font-size: 0.85rem; padding: 4px 8px; margin-right: 4px;" title="Limpar busca">✕</button>
          ` : ''}
          <button type="button" id="allocator-voice-btn" class="search-mic-btn ${this.isListening ? 'listening' : ''}" style="color: ${this.isListening ? '#ef4444' : 'var(--text-secondary)'}; padding: 8px; cursor: pointer; background: none; border: none;">
            ${this.icons.Mic}
          </button>
        </div>

        ${categoryChipsHTML}

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <h4 class="list-title" style="font-size: 0.92rem; font-weight: 600;">${listTitle}</h4>
          <span style="font-size: 0.7rem; color: #38bdf8; background: rgba(56,189,248,0.1); padding: 2px 8px; border-radius: 10px; font-weight: 600;">Setor: ${userSectorName || 'TODOS'}</span>
        </div>
        <p class="list-desc" style="font-size: 0.75rem; color: var(--text-tertiary); margin-bottom: 0.75rem;">Selecione um produto do catálogo para adicionar a este palete.</p>

        <div class="available-products-list" style="max-height: 280px; overflow-y: auto; padding-right: 4px;">
          ${prodsListHTML}
        </div>
      `;
    };

    overlay.innerHTML = `
      <div class="modal" style="max-width: 580px; transform: translateY(0); margin-top: 5vh;">
        <div class="modal-header">
          <h3 class="modal-title">${existingProdsInSlot.length > 0 ? 'Adicionar Item ao Palete' : 'Alocar Palete na Posição'}</h3>
          <button class="modal-close" id="alloc-modal-close">✕</button>
        </div>
        <div class="modal-body" style="padding: 1.5rem;">
          <div class="allocator-modal-content">
            <div class="allocator-target-info" style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 10px 14px; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center;">
              <span class="target-label" style="color: var(--text-secondary);">Destino:</span>
              <span class="target-value" style="font-weight: 700; color: #38bdf8;">
                ${this.selectedChamber} • Coluna ${col} • ${lvl === 1 ? '📦 Piso (Nível 1)' : `🏗️ Aéreo (Nível ${lvl})`} • Pos. ${pos.toUpperCase()}
                ${existingProdsInSlot.length > 0 ? ` (${existingProdsInSlot.length} itens já no palete)` : ''}
              </span>
            </div>

            <div id="allocator-tab-content">
              ${renderManualTab()}
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('alloc-modal-close').addEventListener('click', () => {
      this.closeModal('allocation-modal');
      this.allocatingSlot = null;
    });

    overlay.addEventListener('click', (e) => {
      if (e.target.id === 'allocation-modal') {
        this.closeModal('allocation-modal');
        this.allocatingSlot = null;
      }
    });

    this.bindAllocationModalEvents(overlay, renderManualTab);
  },

  getAvailableProductsForAllocation() {
    const rawQuery = (this.searchAvailable || '').trim();
    const activeCategory = this.selectedCategoryFilter;

    if (!activeCategory && !rawQuery) {
      return [];
    }

    const catalog = window.BrigadaData.catalog || [];
    const allowedCats = window.BrigadaAuth.getAllowedCategoriesForUser(this.selectedChamber);

    const normalize = str => (str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const queryNormalized = normalize(rawQuery);
    const tokens = queryNormalized.split(/\s+/).filter(t => t.length > 0);
    const categoryFilter = activeCategory ? normalize(activeCategory) : '';

    return catalog.filter(p => {
      const pCategory = normalize(p.category);

      // REGRA: Apenas produtos das categorias permitidas para o usuário neste contexto
      const isAllowed = allowedCats.some(ac => pCategory.includes(normalize(ac)) || normalize(ac).includes(pCategory));
      if (!isAllowed) return false;

      const pName = normalize(p.name);
      const pPlu = normalize(String(p.plu || ''));
      const pBarcode = normalize(p.barcode || '');

      if (categoryFilter && categoryFilter !== 'todos') {
        if (!pCategory.includes(categoryFilter) && !categoryFilter.includes(pCategory)) return false;
      }

      if (tokens.length > 0) {
        const fullText = `${pName} ${pPlu} ${pCategory} ${pBarcode}`;
        return tokens.every(token => fullText.includes(token));
      }
      return true;
    });
  },

  bindAllocationModalEvents(modalEl, renderManualTab) {
    const contentWrapper = modalEl.querySelector('#allocator-tab-content');
    if (!contentWrapper) return;
    
    const searchInput = modalEl.querySelector('#allocator-search-input');
    const voiceBtn = modalEl.querySelector('#allocator-voice-btn');

    const bindRegisterFormEvents = (catalogProduct) => {
      const backBtn = modalEl.querySelector('#btn-alloc-register-back');
      const submitBtn = modalEl.querySelector('#btn-alloc-register-submit');

      if (backBtn) {
        backBtn.addEventListener('click', () => {
          contentWrapper.innerHTML = renderManualTab();
          this.bindAllocationModalEvents(modalEl, renderManualTab);
        });
      }

      if (submitBtn) {
        submitBtn.addEventListener('click', async () => {
          const endDateVal = modalEl.querySelector('#alloc-field-enddate')?.value;
          const qtyVal = modalEl.querySelector('#alloc-field-quantity')?.value;
          const unitVal = modalEl.querySelector('#alloc-field-unit')?.value;
          const supplierVal = modalEl.querySelector('#alloc-field-supplier')?.value;

          if (!endDateVal) {
            window.BrigadaUI.showToast('Por favor, informe a data de validade.', 'warning');
            return;
          }

          const chamberId = this.selectedChamber === 'Câmara Resfriada' ? 'resfriado' : 'congelado';
          const locString = this.formatLocation(
            chamberId,
            this.selectedColumn,
            this.allocatingSlot.level,
            this.allocatingSlot.position
          );

          window.BrigadaUI.showToast('Cadastrando e adicionando item ao palete...', 'info');

          try {
            await window.BrigadaData.addProduct({
              name: catalogProduct.name,
              plu: catalogProduct.plu,
              barcode: catalogProduct.barcode || null,
              category: catalogProduct.category,
              quantity: parseFloat(qtyVal) || 1,
              unit: unitVal || 'kg',
              supplier: supplierVal || null,
              endDate: endDateVal,
              location: locString
            });

            window.BrigadaUI.showToast('Item adicionado ao palete com sucesso!', 'success');
            
            this.closeModal('allocation-modal');
            this.allocatingSlot = null;
            this.render(this.container);
          } catch (err) {
            console.error(err);
            window.BrigadaUI.showToast('Erro ao cadastrar item no palete: ' + err.message, 'error');
          }
        });
      }
    };

    const handleCatalogSelection = (btn) => {
      const rawId = btn.dataset.id;
      const prodId = rawId ? parseInt(rawId, 10) : null;
      const plu = btn.dataset.plu;
      const catalogProduct = (window.BrigadaData.catalog || []).find(c => 
        (!isNaN(prodId) && prodId !== null && c.id === prodId) || 
        (plu && String(c.plu).trim() === String(plu).trim())
      );
      
      if (catalogProduct) {
        contentWrapper.innerHTML = this.renderRegisterForm(catalogProduct);
        bindRegisterFormEvents(catalogProduct);
      } else {
        window.BrigadaUI.showToast('Erro ao selecionar produto do catálogo.', 'error');
      }
    };

    const refreshProductsList = () => {
      const available = this.getAvailableProductsForAllocation();
      const listWrapper = modalEl.querySelector('.available-products-list');
      const titleCountEl = modalEl.querySelector('.list-title');
      
      const listTitle = this.selectedCategoryFilter ? `Produtos filtrados (${available.length})` : this.searchAvailable ? `Resultados da busca (${available.length})` : 'Aguardando seleção de categoria';
      
      if (titleCountEl) {
        titleCountEl.textContent = listTitle;
      }

      if (listWrapper) {
        if (!this.selectedCategoryFilter && !this.searchAvailable) {
          listWrapper.innerHTML = `
            <div class="empty-allocator-state" style="text-align: center; padding: 2.5rem 1.5rem; color: var(--text-secondary); background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px dashed var(--border-color, rgba(255,255,255,0.1));">
              <div style="font-size: 2.2rem; margin-bottom: 8px;">👆</div>
              <div style="font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">Selecione uma categoria acima</div>
              <div style="font-size: 0.82rem; color: var(--text-secondary); max-width: 380px; margin: 0 auto;">
                Clique em uma categoria ou faça uma busca por nome/PLU para listar os produtos.
              </div>
            </div>
          `;
        } else if (available.length === 0) {
          listWrapper.innerHTML = `
            <div class="empty-allocator-state" style="text-align: center; padding: 2rem; color: var(--text-tertiary);">
              <div style="font-size: 2rem; margin-bottom: 8px;">⚠️</div>
              <span>Nenhum produto encontrado com os filtros atuais.</span>
            </div>
          `;
        } else {
          listWrapper.innerHTML = available.map(p => `
            <div class="available-product-row" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--bg-tertiary); border-radius: 8px; margin-bottom: 8px; border: 1px solid var(--border-color);">
              <div class="prod-main-details" style="display: flex; flex-direction: column; gap: 2px;">
                <span class="prod-name" style="font-weight: 600; color: var(--text-primary); font-size: 0.92rem;">${p.name}</span>
                <div class="prod-meta" style="display: flex; gap: 8px; font-size: 0.75rem; color: var(--text-secondary);">
                  <span class="prod-sku">PLU: ${p.plu}</span>
                  <span class="prod-category" style="text-transform: capitalize;">Setor: ${this.catMap[p.category] || p.category || 'Geral'}</span>
                </div>
              </div>
              <button class="btn btn-primary btn-sm" data-action="allocate-select-catalog" data-id="${p.id || ''}" data-plu="${p.plu}">
                Selecionar
              </button>
            </div>
          `).join('');

          listWrapper.querySelectorAll('[data-action="allocate-select-catalog"]').forEach(btn => {
            btn.addEventListener('click', () => handleCatalogSelection(btn));
          });
        }
      }
    };

    modalEl.querySelectorAll('.category-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const cat = chip.dataset.category;
        if (this.selectedCategoryFilter === cat) {
          this.selectedCategoryFilter = null;
          chip.classList.remove('active');
          chip.style.borderColor = 'var(--border-color, rgba(255,255,255,0.15))';
          chip.style.background = 'var(--bg-tertiary, rgba(255,255,255,0.05))';
          chip.style.color = 'var(--text-primary)';
        } else {
          modalEl.querySelectorAll('.category-chip').forEach(c => {
            c.classList.remove('active');
            c.style.borderColor = 'var(--border-color, rgba(255,255,255,0.15))';
            c.style.background = 'var(--bg-tertiary, rgba(255,255,255,0.05))';
            c.style.color = 'var(--text-primary)';
          });
          this.selectedCategoryFilter = cat;
          chip.classList.add('active');
          chip.style.borderColor = '#38bdf8';
          chip.style.background = 'rgba(56,189,248,0.2)';
          chip.style.color = '#38bdf8';
        }
        refreshProductsList();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchAvailable = e.target.value;
        const clearBtn = modalEl.querySelector('#allocator-clear-btn');
        if (clearBtn) {
          clearBtn.style.display = this.searchAvailable ? 'block' : 'none';
        }
        refreshProductsList();
      });
    }

    const clearBtn = modalEl.querySelector('#allocator-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.searchAvailable = '';
        searchInput.value = '';
        clearBtn.style.display = 'none';
        refreshProductsList();
      });
    }

    if (voiceBtn) {
      voiceBtn.addEventListener('click', () => {
        this.startVoiceSearch(searchInput, refreshProductsList);
      });
    }

    modalEl.querySelectorAll('[data-action="allocate-select-catalog"]').forEach(btn => {
      btn.addEventListener('click', () => handleCatalogSelection(btn));
    });
  },

  renderRegisterForm(product) {
    const today = new Date().toISOString().split('T')[0];
    
    return `
      <div class="alloc-register-form animate-fade-in" style="display: flex; flex-direction: column; gap: 14px;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <button type="button" class="btn btn-outline btn-sm" id="btn-alloc-register-back" style="padding: 4px 8px;">
              ${this.icons.ArrowLeft} Voltar
            </button>
            <span style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary);">Preencher Dados do Item</span>
          </div>
          <span class="badge badge--info" style="font-size: 0.75rem;">${product.plu}</span>
        </div>

        <div style="background: rgba(56,189,248,0.08); border: 1px solid rgba(56,189,248,0.25); border-radius: 8px; padding: 10px 14px;">
          <div style="font-weight: 700; font-size: 1rem; color: var(--text-primary);">${product.name}</div>
          <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">
            Categoria: <b>${this.catMap[product.category] || product.category}</b>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label style="display: block; font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">Quantidade *</label>
            <input type="number" id="alloc-field-quantity" class="form-input" value="1" min="0.1" step="any" required style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-tertiary);" />
          </div>

          <div class="form-group">
            <label style="display: block; font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">Unidade</label>
            <select id="alloc-field-unit" class="form-input" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-tertiary);">
              <option value="kg" selected>kg</option>
              <option value="un">un</option>
              <option value="cx">cx</option>
              <option value="pct">pct</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label style="display: block; font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">Data de Validade *</label>
          <input type="date" id="alloc-field-enddate" class="form-input" min="${today}" required style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-tertiary);" />
        </div>

        <div class="form-group">
          <label style="display: block; font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">Fornecedor / Marca</label>
          <input type="text" id="alloc-field-supplier" class="form-input" placeholder="Ex: Friboi, Seara, Sadia..." style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-tertiary);" />
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
          <button type="button" class="btn btn-primary" id="btn-alloc-register-submit" style="padding: 9px 18px; font-weight: 700;">
            ✓ Adicionar ao Palete
          </button>
        </div>
      </div>
    `;
  },

  async allocateProduct(productId) {
    if (!this.allocatingSlot) return;
    const chamberId = this.selectedChamber === 'Câmara Resfriada' ? 'resfriado' : 'congelado';
    const locString = this.formatLocation(
      chamberId,
      this.selectedColumn,
      this.allocatingSlot.level,
      this.allocatingSlot.position
    );

    try {
      await window.BrigadaData.updateProduct(productId, { location: locString });
      window.BrigadaUI.showToast('Item adicionado ao palete com sucesso!', 'success');
      this.closeModal('allocation-modal');
      this.allocatingSlot = null;
      this.render(this.container);
    } catch (err) {
      window.BrigadaUI.showToast('Erro ao alocar item: ' + err.message, 'error');
    }
  },

  async deallocateProduct(productId, showToast = true) {
    try {
      await window.BrigadaData.updateProduct(productId, { location: 'piso_loja' });
      if (showToast) {
        window.BrigadaUI.showToast('Item desalocado com sucesso!', 'success');
        this.render(this.container);
      }
    } catch (err) {
      window.BrigadaUI.showToast('Erro ao desalocar item: ' + err.message, 'error');
    }
  },

  startVoiceSearch(inputEl, callback) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      window.BrigadaUI.showToast('Reconhecimento de voz não suportado pelo seu navegador.', 'warning');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      this.isListening = true;
      window.BrigadaUI.showToast('🎙️ Ouvindo... Fale o nome ou PLU do produto', 'info');
      const voiceBtn = document.querySelector('#allocator-voice-btn');
      if (voiceBtn) voiceBtn.style.color = '#ef4444';
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      this.searchAvailable = transcript;
      if (inputEl) inputEl.value = transcript;
      if (callback) callback();
    };

    recognition.onerror = () => {
      this.isListening = false;
      const voiceBtn = document.querySelector('#allocator-voice-btn');
      if (voiceBtn) voiceBtn.style.color = 'var(--text-secondary)';
    };

    recognition.onend = () => {
      this.isListening = false;
      const voiceBtn = document.querySelector('#allocator-voice-btn');
      if (voiceBtn) voiceBtn.style.color = 'var(--text-secondary)';
    };

    recognition.start();
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.remove();
    }
  }
};

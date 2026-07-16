/**
 * BRIGADA-IA — Cold Chambers Map Module
 * Visualização e alocação de paletes em tempo real
 */

window.BrigadaChambers = {
  selectedChamber: null,
  selectedColumn: 1,
  allocatingSlot: null, // { level, position }
  searchAvailable: '',
  allocationTab: 'manual', // 'manual' | 'scanner'
  scanStep: 'idle', // 'idle' | 'scanning' | 'done'
  scannedResult: null, // { product, expiryDate, photo }
  viewingPallet: null, // product object to view details
  isListening: false,
  directorySearch: '',
  directoryFilter: 'all',

  CHAMBER_CONFIGS: {
    'Câmara Resfriada': {
      columnsCount: 4,
      capacity: 32 // 4 * 4 * 2
    },
    'Câmara Congelada': {
      columnsCount: 16,
      capacity: 128 // 16 * 4 * 2
    }
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
    ChevronRight: `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`,
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
  generatePalletPhoto(productName, plu, expiryDate) {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    // Background (Pallet box / wrap)
    ctx.fillStyle = '#1e1b4b'; // dark blue theme background
    ctx.fillRect(0, 0, 400, 300);
    
    // Draw wooden pallet base at bottom
    ctx.fillStyle = '#78350F'; // wood brown
    ctx.fillRect(20, 260, 360, 20);
    ctx.fillRect(40, 240, 40, 20);
    ctx.fillRect(180, 240, 40, 20);
    ctx.fillRect(320, 240, 40, 20);
    
    // Draw box structure
    ctx.fillStyle = '#b45309'; // cardboard brown
    ctx.fillRect(40, 40, 320, 200);
    
    // Draw plastic wrap sheen
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.moveTo(40, 40);
    ctx.lineTo(200, 40);
    ctx.lineTo(100, 240);
    ctx.lineTo(40, 240);
    ctx.fill();
    
    // Draw Pallet Label (white sticker)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(80, 70, 240, 140);
    ctx.strokeStyle = '#6366F1';
    ctx.lineWidth = 2;
    ctx.strokeRect(80, 70, 240, 140);
    
    // Label Title
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('ETIQUETA DE PALETE - WMS', 90, 90);
    
    // Barcode representation
    ctx.fillStyle = '#000000';
    for (let i = 0; i < 30; i++) {
      const width = Math.random() > 0.5 ? 4 : 2;
      ctx.fillRect(100 + (i * 6), 105, width, 30);
    }
    
    // Label content
    ctx.fillStyle = '#334155';
    ctx.font = '10px monospace';
    ctx.fillText(`PRODUTO: ${productName.slice(0, 20).toUpperCase()}`, 90, 150);
    ctx.fillText(`PLU/SKU: ${plu}`, 90, 165);
    ctx.fillText(`VALIDADE: ${expiryDate}`, 90, 180);
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('STATUS: QUALIFICADO', 90, 198);
    
    return canvas.toDataURL('image/jpeg');
  },

  render(container) {
    this.container = container;
    container.innerHTML = this.buildHTML();
    this.bindEvents();
  },

  // Filter products in meat and perishables categories
  getMeatProducts() {
    return (window.BrigadaData.products || []).filter(p => 
      ['aves', 'suino', 'bovino', 'pescado', 'laticinios', 'frios'].includes(p.category)
    );
  },

  // Calculate occupied slots
  getChamberStats() {
    const stats = {
      'Câmara Resfriada': { occupied: 0, items: [] },
      'Câmara Congelada': { occupied: 0, items: [] }
    };

    const meatProducts = this.getMeatProducts();
    meatProducts.forEach(p => {
      const parsed = this.parseLocation(p.location);
      if (parsed) {
        stats[parsed.chamber].occupied++;
        stats[parsed.chamber].items.push(p);
      }
    });

    return stats;
  },

  // Find product at coordinates
  getProductAt(column, level, position) {
    if (!this.selectedChamber) return null;
    const meatProducts = this.getMeatProducts();
    return meatProducts.find(p => {
      const parsed = this.parseLocation(p.location);
      return parsed &&
        parsed.chamber === this.selectedChamber &&
        parsed.column === column &&
        parsed.level === level &&
        parsed.position === position;
    });
  },

  buildDirectoryHTML(meatProducts) {
    const allocatedProducts = meatProducts.filter(p => {
      const parsed = this.parseLocation(p.location);
      if (!parsed) return false;
      
      // Filter by category
      if (this.directoryFilter !== 'all' && p.category !== this.directoryFilter) return false;
      
      // Filter by search query
      if (this.directorySearch) {
        const query = this.directorySearch.toLowerCase().trim();
        const address = `${parsed.chamber} C${parsed.column} N${parsed.level} ${parsed.position}`.toLowerCase();
        const shortAddress = `${parsed.chamber === 'Câmara Resfriada' ? 'resf' : 'cong'}:c${parsed.column}n${parsed.level}${parsed.position[0]}`.toLowerCase();
        return p.name.toLowerCase().includes(query) || 
               p.plu.toLowerCase().includes(query) || 
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
      const chamberLabel = parsed.chamber === 'Câmara Resfriada' ? 'Resfriada' : 'Congelada';
      const addressLabel = `C${parsed.column.toString().padStart(2, '0')}-N${parsed.level}-${parsed.position === 'esquerda' ? 'E' : 'D'}`;
      const catMap = { 
        aves: '🐔 Aves', suino: '🐷 Suíno', bovino: '🐮 Bovino', pescado: '🐟 Pescado',
        laticinios: '🧀 Laticínios', frios: '🥓 Frios'
      };
      
      return `
        <tr>
          <td data-label="Endereço WMS"><strong style="color:#6366F1; font-family:monospace; font-size:1rem;">${addressLabel}</strong></td>
          <td data-label="Câmara"><span class="butcher-alloc-badge allocated ${parsed.chamber === 'Câmara Resfriada' ? 'resfriada' : 'congelada'}">${chamberLabel}</span></td>
          <td data-label="PLU"><span class="plu-badge">${p.plu}</span></td>
          <td data-label="Produto" class="product-name" onclick="window.BrigadaUI.showProductView('${p.id}')" style="cursor: pointer; text-decoration: underline; color: var(--primary);" title="Ver detalhes">
            <div>${p.name}</div>
            <div style="font-size:0.7rem; color:var(--text-tertiary);">${catMap[p.category] || p.category}</div>
          </td>
          <td data-label="Estoque"><strong>${p.quantity}</strong> <span style="font-size:0.75rem; color:var(--text-secondary);">${p.unit || 'kg'}</span></td>
          <td data-label="Validade">${window.BrigadaData.formatDate(p.endDate)}</td>
          <td data-label="Status"><span class="badge ${status.class}">${status.icon} ${status.label}</span></td>
          <td data-label="Ações" class="actions-cell">
            <button class="btn btn-primary btn-sm" data-dir-action="zoom" data-chamber="${parsed.chamber}" data-col="${parsed.column}" style="padding: 4px 8px; font-size: 0.8rem; cursor: pointer;">
              👁️ Ver Rack
            </button>
            <button class="btn btn-danger btn-sm" data-dir-action="deallocate" data-id="${p.id}" style="padding: 4px 8px; font-size: 0.8rem; cursor: pointer;">
              🗑️ Desalocar
            </button>
          </td>
        </tr>
      `;
    }).join('');

    return `
      <!-- DIRETÓRIO DE PALETES ALOCADOS -->
      <div class="glass-panel" style="margin-top: 2rem; margin-bottom: 2rem;">
        <div class="glass-panel__header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div style="display:flex; flex-direction:column; gap:4px;">
            <h3 class="glass-panel__title" style="font-size: 1.4rem; font-weight: 700; margin: 0; color: var(--text-primary);">📋 Diretório de Paletes Alocados</h3>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin: 0;">Consulta e rastreamento de posições WMS em tempo real</p>
          </div>
          
          <!-- Category Tabs for Directory -->
          <div class="cat-quick-tabs" id="dir-cat-tabs" style="display: flex; gap: 8px;">
            <button class="cat-tab cat-tab--sm ${this.directoryFilter === 'all' ? 'cat-tab--active' : ''}" data-dir-cat="all">Todos</button>
            <button class="cat-tab cat-tab--sm ${this.directoryFilter === 'aves' ? 'cat-tab--active' : ''}" data-dir-cat="aves">🐔 Aves</button>
            <button class="cat-tab cat-tab--sm ${this.directoryFilter === 'suino' ? 'cat-tab--active' : ''}" data-dir-cat="suino">🐷 Suíno</button>
            <button class="cat-tab cat-tab--sm ${this.directoryFilter === 'bovino' ? 'cat-tab--active' : ''}" data-dir-cat="bovino">🐮 Bovino</button>
            <button class="cat-tab cat-tab--sm ${this.directoryFilter === 'pescado' ? 'cat-tab--active' : ''}" data-dir-cat="pescado">🐟 Pescado</button>
            <button class="cat-tab cat-tab--sm ${this.directoryFilter === 'laticinios' ? 'cat-tab--active' : ''}" data-dir-cat="laticinios">🧀 Laticínios</button>
            <button class="cat-tab cat-tab--sm ${this.directoryFilter === 'frios' ? 'cat-tab--active' : ''}" data-dir-cat="frios">🥓 Frios</button>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="toolbar" style="margin-bottom: 1.5rem;">
          <div class="search-box" style="flex: 1; max-width: 100%;">
            <span class="search-icon">🔍</span>
            <input type="text" id="dir-search-input" class="search-input" placeholder="Buscar por produto, PLU, código de balança ou endereço (ex: C02, Congelada)..." value="${this.directorySearch}">
          </div>
        </div>

        <!-- Table wrapper -->
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

  buildHTML() {
    const stats = this.getChamberStats();
    const meatProducts = this.getMeatProducts();
    
    const avesProducts = meatProducts.filter(p => p.category === 'aves');
    const pescadoProducts = meatProducts.filter(p => p.category === 'pescado');
    const suinoProducts = meatProducts.filter(p => p.category === 'suino');
    const bovinoProducts = meatProducts.filter(p => p.category === 'bovino');

    const renderBadge = (product) => {
      const parsed = this.parseLocation(product.location);
      if (!parsed) {
        return `<span class="butcher-alloc-badge unallocated">Não Alocado</span>`;
      }
      const isResfriada = parsed.chamber === 'Câmara Resfriada';
      return `
        <span class="butcher-alloc-badge allocated ${isResfriada ? 'resfriada' : 'congelada'}" title="${parsed.chamber} - Coluna ${parsed.column}, Nível ${parsed.level}, Posição ${parsed.position === 'esquerda' ? 'Esquerda' : 'Direita'}">
          ${isResfriada ? 'Resf' : 'Cong'}: C${parsed.column}N${parsed.level}
        </span>
      `;
    };

    if (!this.selectedChamber) {
      // ── Main chambers overview ──
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
              <p class="panel-subtitle">Visualização e alocação de paletes em tempo real</p>
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
                  <p class="chamber-card-desc">Destinada a carnes resfriadas, laticínios e embutidos.</p>

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
                  <p class="chamber-card-desc">Destinada a carnes congeladas, aves e congelados em geral.</p>

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

            ${this.buildDirectoryHTML(meatProducts)}

            <!-- SEÇÃO AÇOUGUE -->
            <div class="butcher-section" style="margin-top: 2rem;">
              <div class="butcher-header">
                <h3 class="page-title" style="font-size: 1.4rem; margin-bottom: 0.25rem;">Seção Açougue</h3>
                <p class="page-subtitle" style="font-size: 0.85rem;">Visualização de estoque e alocação por categorias</p>
              </div>

              <div class="butcher-grid">
                <!-- Aves -->
                <div class="butcher-category-card">
                  <div class="category-header aves">
                    <span>🐔 Aves</span>
                    <span class="count-badge">${avesProducts.length} itens</span>
                  </div>
                  <div class="butcher-items-list">
                    ${avesProducts.length === 0 ? `
                      <div class="empty-category-message">Nenhum produto cadastrado</div>
                    ` : avesProducts.map(p => `
                      <div class="butcher-item-row">
                        <div class="item-info">
                          <span class="item-name">${p.name}</span>
                          <span class="item-plu monospace">PLU: ${p.plu}</span>
                        </div>
                        <div class="item-status">
                          <span class="item-stock">${p.quantity || 0} ${p.unit || 'kg'}</span>
                          ${renderBadge(p)}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <!-- Suíno -->
                <div class="butcher-category-card">
                  <div class="category-header suino">
                    <span>🐷 Suíno</span>
                    <span class="count-badge">${suinoProducts.length} itens</span>
                  </div>
                  <div class="butcher-items-list">
                    ${suinoProducts.length === 0 ? `
                      <div class="empty-category-message">Nenhum produto cadastrado</div>
                    ` : suinoProducts.map(p => `
                      <div class="butcher-item-row">
                        <div class="item-info">
                          <span class="item-name">${p.name}</span>
                          <span class="item-plu monospace">PLU: ${p.plu}</span>
                        </div>
                        <div class="item-status">
                          <span class="item-stock">${p.quantity || 0} ${p.unit || 'kg'}</span>
                          ${renderBadge(p)}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <!-- Bovino -->
                <div class="butcher-category-card">
                  <div class="category-header bovino" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b; border-bottom: 2px solid #f59e0b; padding: 12px; font-weight: 600; display: flex; justify-content: space-between;">
                    <span>🐮 Bovino</span>
                    <span class="count-badge">${bovinoProducts.length} itens</span>
                  </div>
                  <div class="butcher-items-list">
                    ${bovinoProducts.length === 0 ? `
                      <div class="empty-category-message">Nenhum produto cadastrado</div>
                    ` : bovinoProducts.map(p => `
                      <div class="butcher-item-row">
                        <div class="item-info">
                          <span class="item-name">${p.name}</span>
                          <span class="item-plu monospace">PLU: ${p.plu}</span>
                        </div>
                        <div class="item-status">
                          <span class="item-stock">${p.quantity || 0} ${p.unit || 'kg'}</span>
                          ${renderBadge(p)}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <!-- Pescado -->
                <div class="butcher-category-card">
                  <div class="category-header pescado">
                    <span>🐟 Pescado</span>
                    <span class="count-badge">${pescadoProducts.length} itens</span>
                  </div>
                  <div class="butcher-items-list">
                    ${pescadoProducts.length === 0 ? `
                      <div class="empty-category-message">Nenhum produto cadastrado</div>
                    ` : pescadoProducts.map(p => `
                      <div class="butcher-item-row">
                        <div class="item-info">
                          <span class="item-name">${p.name}</span>
                          <span class="item-plu monospace">PLU: ${p.plu}</span>
                        </div>
                        <div class="item-status">
                          <span class="item-stock">${p.quantity || 0} ${p.unit || 'kg'}</span>
                          ${renderBadge(p)}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
            </div>

            <!-- Como Funciona Box -->
            <div class="chambers-quick-info" style="margin-top: 1.5rem;">
              <div class="info-card">
                <div class="info-icon-wrapper" style="color: #6366F1; flex-shrink: 0; margin-top: 3px;">
                  ${this.icons.Info}
                </div>
                <div>
                  <h4 style="font-weight: 600; margin-bottom: 4px; color: var(--text-primary);">Como funciona a alocação de posições?</h4>
                  <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5;">
                    A Câmara Resfriada é dividida em <strong>4 Colunas</strong> e a Câmara Congelada em <strong>16 Colunas</strong>. Cada coluna representa uma estrutura vertical (Rack) com <strong>4 níveis (espaços)</strong>.
                    Cada nível acomoda até <strong>2 paletes de produtos lado a lado</strong> (Posição Esquerda e Direita).
                    Clique em uma câmara para visualizar seu grid de colunas e gerenciar as posições individuais de paletes por leitura de etiquetas ou alocação manual.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      // ── Detailed Chamber View ──
      const config = this.CHAMBER_CONFIGS[this.selectedChamber];
      const activeStats = stats[this.selectedChamber];
      
      const columnCardsHTML = Array.from({ length: config.columnsCount }, (_, i) => {
        const colNum = i + 1;
        const isActive = this.selectedColumn === colNum;
        
        // Calculate count of occupied slots in this column
        const colOccupiedCount = meatProducts.filter(p => {
          const parsed = this.parseLocation(p.location);
          return parsed && parsed.chamber === this.selectedChamber && parsed.column === colNum;
        }).length;

        const isFull = colOccupiedCount === 8;

        return `
          <div class="column-select-card ${isActive ? 'active' : ''} ${isFull ? 'full' : ''}" data-col="${colNum}" style="cursor: pointer;">
            <div class="column-card-header">
              <span class="column-number">Col. ${colNum.toString().padStart(2, '0')}</span>
              <span class="column-occupancy">${colOccupiedCount}/8</span>
            </div>
            
            <div class="column-mini-grid">
              ${Array.from({ length: 4 }, (_, levelIdx) => {
                const level = 4 - levelIdx; // top level 4 to bottom level 1
                const leftProduct = this.getProductAt(colNum, level, 'esquerda');
                const rightProduct = this.getProductAt(colNum, level, 'direita');

                return `
                  <div class="mini-grid-row">
                    <span class="mini-dot ${leftProduct ? 'occupied' : 'empty'}"></span>
                    <span class="mini-dot ${rightProduct ? 'occupied' : 'empty'}"></span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }).join('');

      // Graphical Rack Level Rows
      const rackRowsHTML = Array.from({ length: 4 }, (_, i) => {
        const level = 4 - i; // levels from 4 (top) to 1 (ground)
        const leftProduct = this.getProductAt(this.selectedColumn, level, 'esquerda');
        const rightProduct = this.getProductAt(this.selectedColumn, level, 'direita');

        const renderSlot = (product, position) => {
          const posLetter = position === 'esquerda' ? 'E' : 'D';
          const posLabel = position === 'esquerda' ? 'Esquerda (E)' : 'Direita (D)';

          if (product) {
            return `
              <div class="pallet-content">
                <div class="pallet-position-badge ${position === 'esquerda' ? 'left' : 'right'}" data-action="view-pallet" data-id="${product.id}" title="Visualizar Etiqueta WMS" style="cursor: pointer;">
                  ${posLetter}
                </div>
                <div class="pallet-info">
                  <span class="pallet-product-name" title="${product.name}">${product.name}</span>
                  <div class="pallet-meta">
                    <span class="pallet-sku">PLU: ${product.plu}</span>
                    <span class="pallet-quantity">${product.quantity || 0} ${product.unit || 'kg'}</span>
                  </div>
                  <div class="pallet-tag-meta">
                    <span class="pallet-val-badge">Val: ${window.BrigadaData.formatDate(product.endDate)}</span>
                  </div>
                </div>
                <button class="pallet-action-btn delete" data-action="deallocate" data-id="${product.id}" title="Desalocar Posição" style="cursor: pointer;">
                  ${this.icons.Trash2}
                </button>
              </div>
            `;
          } else {
            return `
              <div class="pallet-empty-content" data-action="allocate-trigger" data-level="${level}" data-pos="${position}" style="cursor: pointer;">
                ${this.icons.Plus}
                <span>Alocar ${posLabel}</span>
              </div>
            `;
          }
        };

        return `
          <div class="rack-level-row">
            <div class="rack-level-label">
              <span class="level-num">Nível ${level}</span>
              <span class="level-tag">${level === 4 ? 'Topo' : level === 1 ? 'Chão' : `Nív. ${level}`}</span>
            </div>

            <div class="rack-shelves-container">
              <!-- Left slot -->
              <div class="pallet-slot ${leftProduct ? 'occupied' : 'empty'}">
                ${renderSlot(leftProduct, 'esquerda')}
              </div>

              <!-- Right slot -->
              <div class="pallet-slot ${rightProduct ? 'occupied' : 'empty'}">
                ${renderSlot(rightProduct, 'direita')}
              </div>
            </div>

            <div class="rack-shelf-beam"></div>
          </div>
        `;
      }).join('');

      return `
        <div class="chambers-page">
          <div class="chamber-detail-layout animate-fade-in">
            <!-- Header bar -->
            <div class="chamber-action-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
              <button class="btn btn-outline btn-sm" id="btn-back-to-chambers" style="display: flex; align-items: center; gap: 6px;">
                ${this.icons.ArrowLeft}
                Voltar para Câmaras
              </button>
              <div class="chamber-active-info" style="display: flex; align-items: center; gap: 8px;">
                <span class="status-dot ${this.selectedChamber === 'Câmara Resfriada' ? 'bg-blue' : 'bg-indigo'}" style="width:10px; height:10px; border-radius:50%; background-color:${this.selectedChamber === 'Câmara Resfriada' ? '#3B82F6' : '#6366F1'}; display:inline-block;"></span>
                <h2 class="chamber-title" style="margin: 0; font-size: 1.5rem; font-weight: 700;">${this.selectedChamber}</h2>
                <div class="chamber-meta-badges" style="display: flex; gap: 8px; margin-left: 8px;">
                  <span class="meta-badge" style="background: var(--bg-tertiary); padding: 4px 8px; border-radius: 6px; font-size: 0.8rem; display: flex; align-items: center; gap: 4px;">
                    ${this.icons.Thermometer}
                    ${this.selectedChamber === 'Câmara Resfriada' ? '2.5 °C' : '-18.5 °C'}
                  </span>
                  <span class="meta-badge" style="background: var(--bg-tertiary); padding: 4px 8px; border-radius: 6px; font-size: 0.8rem; display: flex; align-items: center; gap: 4px;">
                    ${this.icons.Layers}
                    Ocupados: ${activeStats.occupied} / ${config.capacity}
                  </span>
                </div>
              </div>
            </div>

            <div class="chamber-workspace-grid" style="display: grid; grid-template-columns: 320px 1fr; gap: 2rem;">
              <!-- LEFT COLUMN: COLUMNS SELECTION GRID -->
              <div class="chamber-columns-selector-panel glass-panel" style="padding: 1.5rem;">
                <div class="panel-header" style="margin-bottom: 1.5rem;">
                  <h3 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 2px;">Colunas da Câmara</h3>
                  <p style="font-size: 0.8rem; color: var(--text-secondary);">Selecione uma coluna para ver o rack</p>
                </div>

                <div class="columns-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                  ${columnCardsHTML}
                </div>
              </div>

              <!-- RIGHT COLUMN: DETAILED VERTICAL RACK PROFILE -->
              <div class="column-rack-detail-panel glass-panel" style="padding: 1.5rem;">
                <div class="panel-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
                  <div class="rack-header-info">
                    <h3 style="font-size: 1.2rem; font-weight: 600; margin-bottom: 2px;">Rack de Armazenamento — Coluna ${this.selectedColumn.toString().padStart(2, '0')}</h3>
                    <p style="font-size: 0.8rem; color: var(--text-secondary);">Layout vertical de 4 níveis de paletes</p>
                  </div>
                  <span class="badge badge--ok" style="font-size: 0.8rem; font-weight: 600; background: rgba(16,185,129,0.15); color:#34d399; padding: 4px 8px; border-radius: 4px;">Coluna ${this.selectedColumn}</span>
                </div>

                <!-- RACK GRAPHICAL VIEW -->
                <div class="rack-container">
                  ${rackRowsHTML}
                  
                  <!-- Rack upright feet visual -->
                  <div class="rack-legs-row">
                    <div class="rack-leg"></div>
                    <div class="rack-leg middle"></div>
                    <div class="rack-leg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  },

  bindEvents() {
    if (!this.container) return;

    // Chamber Card Selection Click
    const resfriadaCard = this.container.querySelector('#card-chamber-resfriada');
    if (resfriadaCard) {
      resfriadaCard.addEventListener('click', () => {
        this.selectedChamber = 'Câmara Resfriada';
        this.selectedColumn = 1;
        this.render(this.container);
      });
    }

    const congeladaCard = this.container.querySelector('#card-chamber-congelada');
    if (congeladaCard) {
      congeladaCard.addEventListener('click', () => {
        this.selectedChamber = 'Câmara Congelada';
        this.selectedColumn = 1;
        this.render(this.container);
      });
    }

    // Voltar para Câmaras
    const backBtn = this.container.querySelector('#btn-back-to-chambers');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.selectedChamber = null;
        this.render(this.container);
      });
    }

    // Select Column Cards
    this.container.querySelectorAll('.column-select-card[data-col]').forEach(card => {
      card.addEventListener('click', () => {
        this.selectedColumn = parseInt(card.dataset.col, 10);
        this.render(this.container);
      });
    });

    // Pallet Details Click
    this.container.querySelectorAll('[data-action="view-pallet"][data-id]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const prodId = parseInt(el.dataset.id, 10);
        this.viewingPallet = window.BrigadaData.products.find(p => p.id === prodId);
        this.openPalletModal();
      });
    });

    // Deallocate Pallet Click
    this.container.querySelectorAll('[data-action="deallocate"][data-id]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const prodId = parseInt(btn.dataset.id, 10);
        if (confirm('Tem certeza que deseja desalocar este palete desta posição?')) {
          await this.deallocateProduct(prodId);
        }
      });
    });

    // Allocate Slot Trigger Click
    this.container.querySelectorAll('[data-action="allocate-trigger"]').forEach(el => {
      el.addEventListener('click', () => {
        this.allocatingSlot = {
          level: parseInt(el.dataset.level, 10),
          position: el.dataset.pos
        };
        this.allocationTab = 'manual';
        this.scanStep = 'idle';
        this.scannedResult = null;
        this.searchAvailable = '';
        this.openAllocationModal();
      });
    });

    // Directory Search Input
    const dirSearchInput = this.container.querySelector('#dir-search-input');
    if (dirSearchInput) {
      dirSearchInput.addEventListener('input', (e) => {
        this.directorySearch = e.target.value;
        this.updateDirectoryView(this.container);
      });
    }

    // Directory Category Tabs
    this.container.querySelectorAll('#dir-cat-tabs .cat-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.container.querySelectorAll('#dir-cat-tabs .cat-tab').forEach(t => t.classList.remove('cat-tab--active'));
        tab.classList.add('cat-tab--active');
        this.directoryFilter = tab.dataset.dirCat;
        this.updateDirectoryView(this.container);
      });
    });

    // Directory Rows Initial Bind
    const tbody = this.container.querySelector('#dir-tbody');
    if (tbody) {
      this.bindDirectoryRowEvents(tbody);
    }
  },

  async deallocateProduct(productId) {
    window.BrigadaUI.showToast('Removendo alocação...', 'info');
    try {
      const resetLoc = this.selectedChamber === 'Câmara Resfriada' ? 'resfriado' : 'congelado';
      await window.BrigadaData.updateProduct(productId, { location: resetLoc }); // Reset location to unallocated text
      window.BrigadaUI.showToast('Palete desalocado com sucesso!', 'success');
      
      // If modal was open, close it
      this.closeModal('pallet-view-modal');
      this.viewingPallet = null;

      // Re-render
      this.render(this.container);
    } catch (err) {
      window.BrigadaUI.showToast('Erro ao desalocar palete: ' + err.message, 'error');
    }
  },

  // Get unallocated products for manual list
  getAvailableProductsForAllocation() {
    const catalog = window.BrigadaData.catalog || [];
    const query = this.searchAvailable.toLowerCase().trim();
    
    return catalog.filter(p => {
      // Filter by search query
      if (query) {
        return (p.name || '').toLowerCase().includes(query) || (p.plu || '').toLowerCase().includes(query);
      }
      return true;
    });
  },

  // Modal handlers
  openPalletModal() {
    this.closeModal('pallet-view-modal');
    
    if (!this.viewingPallet) return;
    const photo = this.generatePalletPhoto(this.viewingPallet.name, this.viewingPallet.plu, window.BrigadaData.formatDate(this.viewingPallet.endDate));
    const parsed = this.parseLocation(this.viewingPallet.location);

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay modal-overlay--visible';
    overlay.id = 'pallet-view-modal';
    
    overlay.innerHTML = `
      <div class="modal" style="max-width: 760px; transform: translateY(0); margin-top: 5vh;">
        <div class="modal-header">
          <h3 class="modal-title">Detalhamento do Palete Alocado</h3>
          <button class="modal-close" id="pallet-modal-close">✕</button>
        </div>
        <div class="modal-body" style="padding: 1.5rem;">
          <div class="pallet-details-dialog-content">
            <div class="pallet-dialog-grid">
              <div class="pallet-photo-card">
                <img src="${photo}" alt="Foto do Palete" class="pallet-large-photo" style="width:100%; height:auto; border-radius: var(--radius-md); border:1px solid var(--border-color);" />
              </div>
              <div class="pallet-data-details">
                <div class="address-badge" style="background: var(--bg-tertiary); padding: 6px 12px; border-radius: var(--radius-sm); font-size: 0.8rem; display: flex; align-items: center; gap: 6px; margin-bottom: 1rem; color: #38bdf8;">
                  ${this.icons.Warehouse}
                  <span>${parsed.chamber} • Col. ${parsed.column} • Nív. ${parsed.level} • Pos. ${parsed.position.toUpperCase()}</span>
                </div>
                <h3 class="prod-title" style="font-size:1.3rem; font-weight:700; margin-bottom: 1rem;">${this.viewingPallet.name}</h3>
                
                <div class="details-info-table" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 1.5rem;">
                  <div class="info-row" style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-color); padding-bottom:6px;">
                    <span class="info-label" style="color:var(--text-secondary);">PLU</span>
                    <span class="info-val monospace" style="font-family:monospace; font-weight:600;">${this.viewingPallet.plu}</span>
                  </div>
                  <div class="info-row" style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-color); padding-bottom:6px;">
                    <span class="info-label" style="color:var(--text-secondary);">Quantidade do Lote</span>
                    <span class="info-val highlight" style="color:var(--accent-2); font-weight:600;">${this.viewingPallet.quantity || 0} ${this.viewingPallet.unit || 'kg'}</span>
                  </div>
                  <div class="info-row" style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-color); padding-bottom:6px;">
                    <span class="info-label" style="color:var(--text-secondary);">Fornecedor</span>
                    <span class="info-val" style="font-weight:500;">${this.viewingPallet.supplier || '—'}</span>
                  </div>
                  <div class="info-row border-highlight" style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(16,185,129,0.3); padding-bottom:6px; color:#34d399;">
                    <span class="info-label" style="color:#34d399;">Data de Validade</span>
                    <span class="info-val date-val" style="display:flex; align-items:center; gap:4px; font-weight:600;">
                      ${this.icons.Calendar}
                      ${window.BrigadaData.formatDate(this.viewingPallet.endDate)}
                    </span>
                  </div>
                </div>

                <div class="pallet-actions-bar" style="display:flex; gap: 12px;">
                  <button class="btn btn-outline" id="btn-print-tag" style="flex:1; display:flex; align-items:center; justify-content:center; gap:6px;">
                    ${this.icons.Printer}
                    Imprimir Etiqueta
                  </button>
                  <button class="btn btn-danger" id="btn-deallocate-pallet" style="flex:1; display:flex; align-items:center; justify-content:center; gap:6px;">
                    ${this.icons.Trash2}
                    Desalocar Palete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Bind Close events
    document.getElementById('pallet-modal-close').addEventListener('click', () => {
      this.closeModal('pallet-view-modal');
      this.viewingPallet = null;
    });

    document.getElementById('btn-print-tag').addEventListener('click', () => {
      alert('Imprimindo etiqueta térmica do Lote ' + this.viewingPallet.plu + '...\nEnviado para Impressora Térmica do Setor.');
    });

    document.getElementById('btn-deallocate-pallet').addEventListener('click', async () => {
      if (confirm('Tem certeza que deseja desalocar este palete?')) {
        await this.deallocateProduct(this.viewingPallet.id);
      }
    });

    overlay.addEventListener('click', (e) => {
      if (e.target.id === 'pallet-view-modal') {
        this.closeModal('pallet-view-modal');
        this.viewingPallet = null;
      }
    });
  },

  openAllocationModal() {
    this.closeModal('allocation-modal');
    
    if (!this.allocatingSlot) return;
    const available = this.getAvailableProductsForAllocation();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay modal-overlay--visible';
    overlay.id = 'allocation-modal';
    
    const renderRegisterForm = (catalogProduct) => {
      return `
        <div class="allocation-register-form" style="display:flex; flex-direction:column; gap:12px; padding:0.5rem 0;">
          <div style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:10px 12px; border-radius:6px; font-size:0.9rem; margin-bottom:0.5rem;">
            <strong style="color:var(--text-secondary);">Produto:</strong> <span style="color:var(--text-primary); font-weight:600;">${catalogProduct.name}</span>
            <div style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">PLU: ${catalogProduct.plu}</div>
          </div>
          
          <div class="form-group" style="display:flex; flex-direction:column; gap:4px; margin-bottom: 0.75rem;">
            <label class="form-label" style="font-size:0.75rem; font-weight:600; text-transform:uppercase; color:var(--text-secondary);">Data de Validade *</label>
            <input type="date" id="alloc-field-enddate" class="form-input" required style="width:100%; color-scheme:dark;" />
          </div>

          <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:12px; margin-bottom: 0.75rem;">
            <div class="form-group" style="display:flex; flex-direction:column; gap:4px;">
              <label class="form-label" style="font-size:0.75rem; font-weight:600; text-transform:uppercase; color:var(--text-secondary);">Quantidade</label>
              <input type="number" id="alloc-field-quantity" class="form-input" placeholder="ex: 1500" value="1500" min="0" step="any" style="width:100%;" />
            </div>
            <div class="form-group" style="display:flex; flex-direction:column; gap:4px;">
              <label class="form-label" style="font-size:0.75rem; font-weight:600; text-transform:uppercase; color:var(--text-secondary);">Unidade</label>
              <select id="alloc-field-unit" class="form-input" style="width:100%; cursor:pointer;">
                <option value="kg">kg</option>
                <option value="un">un</option>
              </select>
            </div>
          </div>

          <div class="form-group" style="display:flex; flex-direction:column; gap:4px; margin-bottom: 1rem;">
            <label class="form-label" style="font-size:0.75rem; font-weight:600; text-transform:uppercase; color:var(--text-secondary);">Fornecedor</label>
            <input type="text" id="alloc-field-supplier" class="form-input" placeholder="Nome do fornecedor (opcional)" style="width:100%;" />
          </div>

          <div style="display:flex; gap:12px; margin-top:0.5rem;">
            <button class="btn btn-outline" id="btn-alloc-register-back" style="flex:1;">Voltar</button>
            <button class="btn btn-primary" id="btn-alloc-register-submit" style="flex:1;">Confirmar Cadastro</button>
          </div>
        </div>
      `;
    };

    const renderManualTab = () => {
      const available = this.getAvailableProductsForAllocation();
      const prodsListHTML = available.length === 0 ? `
        <div class="empty-allocator-state" style="text-align:center; padding:2rem; color:var(--text-tertiary);">
          <div style="font-size:2rem; margin-bottom:8px;">⚠️</div>
          <span>Nenhum produto disponível no catálogo.</span>
        </div>
      ` : available.map(p => `
        <div class="available-product-row" style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:var(--bg-tertiary); border-radius:6px; margin-bottom:8px; border:1px solid var(--border-color);">
          <div class="prod-main-details" style="display:flex; flex-direction:column; gap:2px;">
            <span class="prod-name" style="font-weight:600; color:var(--text-primary); font-size:0.9rem;">${p.name}</span>
            <div class="prod-meta" style="display:flex; gap:8px; font-size:0.75rem; color:var(--text-secondary);">
              <span class="prod-sku">PLU: ${p.plu}</span>
              <span class="prod-category" style="text-transform:capitalize;">Categoria: ${p.category}</span>
            </div>
          </div>
          <button class="btn btn-primary btn-sm" data-action="allocate-select-catalog" data-id="${p.id}">
            Selecionar
          </button>
        </div>
      `).join('');

      return `
        <div class="allocator-search-wrapper" style="position:relative; display:flex; align-items:center; margin-bottom:1.5rem; background:var(--bg-tertiary); border-radius:var(--radius-md); border:1px solid var(--border-color); padding:0 12px;">
          <div style="color:var(--text-tertiary); margin-right:8px;">${this.icons.Search}</div>
          <input type="text" id="allocator-search-input" class="allocator-search-input" placeholder="${this.isListening ? 'Ouvindo... fale agora' : 'Buscar por nome, PLU ou código de balança...'}" value="${this.searchAvailable}" style="flex:1; padding:10px 0; border:none; background:transparent; font-size:0.9rem;" autofocus />
          <button type="button" id="allocator-voice-btn" class="search-mic-btn ${this.isListening ? 'listening' : ''}" style="color:${this.isListening ? '#ef4444' : 'var(--text-secondary)'}; padding:8px; cursor:pointer;">
            ${this.icons.Mic}
          </button>
        </div>

        <h4 class="list-title" style="font-size:0.95rem; font-weight:600; margin-bottom:4px;">Produtos no Catálogo (${available.length})</h4>
        <p class="list-desc" style="font-size:0.75rem; color:var(--text-tertiary); margin-bottom:1rem;">Selecione um produto do catálogo base para registrar e alocar neste slot.</p>

        <div class="available-products-list" style="max-height: 280px; overflow-y:auto; padding-right:4px;">
          ${prodsListHTML}
        </div>
      `;
    };

    const renderScannerTab = () => {
      if (this.scanStep === 'idle') {
        return `
          <div class="smart-scanner-workspace" style="text-align:center; padding:1.5rem 0;">
            <div style="font-size:3rem; margin-bottom:8px; color:#38bdf8; animation: pulse 2s infinite;">📷</div>
            <h3 style="font-size:1.1rem; font-weight:600; margin-bottom:6px;">Simulação de Scanner de Palete</h3>
            <p style="font-size:0.8rem; color:var(--text-secondary); max-width:400px; margin:0 auto 1.5rem;">
              Leia o código de barras da etiqueta anexada ao palete para identificar o código do produto (PLU) e a data de validade automaticamente.
            </p>
            
            <div class="simulate-options-panel" style="background:var(--bg-tertiary); padding:1rem; border-radius:8px; border:1px solid var(--border-color); text-align:left;">
              <h4 style="font-size:0.85rem; font-weight:600; margin-bottom:8px; color:var(--text-primary);">Simular leitura de palete (selecione um lote):</h4>
              
              <div class="simulation-buttons-grid" style="display:grid; grid-template-columns:repeat(2,1fr); gap:8px;">
                <button class="btn btn-outline btn-sm font-sm" data-action="sim-scan" data-plu="1001" style="font-size:0.75rem;">
                  Lote Frango (PLU 1001)
                </button>
                <button class="btn btn-outline btn-sm font-sm" data-action="sim-scan" data-plu="1005" style="font-size:0.75rem;">
                  Lote Suíno (PLU 1005)
                </button>
                <button class="btn btn-outline btn-sm font-sm" data-action="sim-scan" data-plu="1002" style="font-size:0.75rem;">
                  Lote Coxa Frango (PLU 1002)
                </button>
                <button class="btn btn-outline btn-sm font-sm" data-action="sim-scan" data-plu="1003" style="font-size:0.75rem;">
                  Lote Asa Frango (PLU 1003)
                </button>
              </div>
            </div>
          </div>
        `;
      } else if (this.scanStep === 'scanning') {
        return `
          <div class="scanner-active-view" style="text-align:center; padding:2rem 0;">
            <div class="simulated-viewfinder" style="width:240px; height:180px; border:2px dashed #38bdf8; border-radius:8px; margin:0 auto 1rem; display:flex; flex-direction:column; justify-content:center; align-items:center; background:rgba(255,255,255,0.01); position:relative; overflow:hidden;">
              <div style="font-size:2rem; margin-bottom:8px;">🔍</div>
              <span style="font-size:0.8rem; color:var(--text-secondary);">Escaneando Etiqueta WMS...</span>
              <div class="scanner-laser-line" style="position:absolute; width:100%; height:2px; background:#ef4444; top:50%; left:0; box-shadow:0 0 8px #ef4444; animation: laserSweep 1.5s infinite;"></div>
            </div>
            <p style="font-size:0.85rem; color:var(--text-secondary);">Processando OCR do código de barras do palete...</p>
          </div>
        `;
      } else { // done
        const p = this.scannedResult.product;
        return `
          <div class="scanner-processed-result-step" style="padding:1rem 0;">
            <div style="display:flex; align-items:center; gap:12px; background:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.3); border-radius:6px; padding:12px; margin-bottom:1rem;">
              <div style="font-size:1.8rem; color:#22c55e;">✅</div>
              <div>
                <h4 style="font-size:0.9rem; font-weight:600; color:var(--text-primary);">Código Escaneado com Sucesso!</h4>
                <p style="font-size:0.75rem; color:var(--text-secondary);">Lote correspondente e validade identificados.</p>
              </div>
            </div>

            <div style="display:flex; gap:16px; background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:8px; padding:12px;">
              <img src="${this.scannedResult.photo}" style="width:100px; height:75px; object-fit:cover; border-radius:4px; border:1px solid var(--border-color);" />
              <div style="display:flex; flex-direction:column; justify-content:center; gap:2px;">
                <strong style="font-size:0.9rem; color:var(--text-primary);">${p.name}</strong>
                <span style="font-size:0.75rem; color:var(--text-secondary);">PLU: ${p.plu}</span>
                <span style="font-size:0.75rem; color:#22c55e; font-weight:600;">Validade: ${window.BrigadaData.formatDate(p.endDate)}</span>
              </div>
            </div>

            <div style="display:flex; gap:12px; margin-top:1.5rem;">
              <button class="btn btn-outline" id="btn-retry-scan" style="flex:1;">Tentar Novamente</button>
              <button class="btn btn-primary" id="btn-confirm-scan-alloc" style="flex:1;">Confirmar Alocação</button>
            </div>
          </div>
        `;
      }
    };

    overlay.innerHTML = `
      <div class="modal" style="max-width: 580px; transform: translateY(0); margin-top: 5vh;">
        <div class="modal-header">
          <h3 class="modal-title">Alocar Palete na Posição</h3>
          <button class="modal-close" id="alloc-modal-close">✕</button>
        </div>
        <div class="modal-body" style="padding: 1.5rem;">
          <div class="allocator-modal-content">
            <div class="allocator-target-info" style="background:var(--bg-secondary); border:1px solid var(--border-color); padding:10px 12px; border-radius:6px; font-size:0.85rem; margin-bottom:1rem; display:flex; justify-content:space-between;">
              <span class="target-label" style="color:var(--text-secondary);">Local de Destino:</span>
              <span class="target-value" style="font-weight:600; color:#38bdf8;">
                Col. ${this.selectedColumn} • Nível ${this.allocatingSlot.level} • Pos. ${this.allocatingSlot.position.toUpperCase()}
              </span>
            </div>

            <!-- Tab Selector -->
            <div class="allocator-tabs" style="display:flex; border-bottom:1px solid var(--border-color); margin-bottom:1.5rem; gap:12px;">
              <button class="allocator-tab-btn ${this.allocationTab === 'manual' ? 'active' : ''}" id="btn-tab-manual" style="padding:8px 12px; font-weight:600; font-size:0.85rem; border:none; border-bottom:2px solid ${this.allocationTab === 'manual' ? '#38bdf8' : 'transparent'}; background:transparent; color:${this.allocationTab === 'manual' ? 'var(--text-primary)' : 'var(--text-secondary)'}; cursor:pointer;">
                📑 Alocação Manual
              </button>
              <button class="allocator-tab-btn ${this.allocationTab === 'scanner' ? 'active' : ''}" id="btn-tab-scanner" style="padding:8px 12px; font-weight:600; font-size:0.85rem; border:none; border-bottom:2px solid ${this.allocationTab === 'scanner' ? '#38bdf8' : 'transparent'}; background:transparent; color:${this.allocationTab === 'scanner' ? 'var(--text-primary)' : 'var(--text-secondary)'}; cursor:pointer;">
                📷 Leitor Inteligente (Simulação)
              </button>
            </div>

            <!-- Tab Content -->
            <div id="allocator-tab-content">
              ${this.allocationTab === 'manual' ? renderManualTab() : renderScannerTab()}
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Bind Close Event
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

    this.bindAllocationModalEvents(overlay, renderManualTab, renderScannerTab);
  },

  bindAllocationModalEvents(modalEl, renderManualTab, renderScannerTab) {
    const contentWrapper = modalEl.querySelector('#allocator-tab-content');
    
    // Tab switching
    const manualTabBtn = modalEl.querySelector('#btn-tab-manual');
    const scannerTabBtn = modalEl.querySelector('#btn-tab-scanner');

    if (manualTabBtn && scannerTabBtn) {
      manualTabBtn.addEventListener('click', () => {
        this.allocationTab = 'manual';
        manualTabBtn.style.borderBottomColor = '#38bdf8';
        manualTabBtn.style.color = 'var(--text-primary)';
        scannerTabBtn.style.borderBottomColor = 'transparent';
        scannerTabBtn.style.color = 'var(--text-secondary)';
        contentWrapper.innerHTML = renderManualTab();
        this.bindAllocationModalEvents(modalEl, renderManualTab, renderScannerTab);
      });

      scannerTabBtn.addEventListener('click', () => {
        this.allocationTab = 'scanner';
        this.scanStep = 'idle';
        this.scannedResult = null;
        scannerTabBtn.style.borderBottomColor = '#38bdf8';
        scannerTabBtn.style.color = 'var(--text-primary)';
        manualTabBtn.style.borderBottomColor = 'transparent';
        manualTabBtn.style.color = 'var(--text-secondary)';
        contentWrapper.innerHTML = renderScannerTab();
        this.bindAllocationModalEvents(modalEl, renderManualTab, renderScannerTab);
      });
    }

    // Manual Tab events
    if (this.allocationTab === 'manual') {
      const searchInput = modalEl.querySelector('#allocator-search-input');
      const voiceBtn = modalEl.querySelector('#allocator-voice-btn');

      // Helper function to bind registration form submission
      const bindRegisterFormEvents = (catalogProduct) => {
        const backBtn = modalEl.querySelector('#btn-alloc-register-back');
        const submitBtn = modalEl.querySelector('#btn-alloc-register-submit');

        if (backBtn) {
          backBtn.addEventListener('click', () => {
            contentWrapper.innerHTML = renderManualTab();
            this.bindAllocationModalEvents(modalEl, renderManualTab, renderScannerTab);
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

            window.BrigadaUI.showToast('Cadastrando e alocando lote...', 'info');
            try {
              await window.BrigadaData.addProduct({
                plu: catalogProduct.plu,
                name: catalogProduct.name,
                category: catalogProduct.category,
                barcode: catalogProduct.barcode || '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: endDateVal,
                quantity: parseFloat(qtyVal) || 0.0,
                unit: unitVal,
                supplier: supplierVal || '',
                location: locString
              });
              window.BrigadaUI.showToast('Lote cadastrado e alocado com sucesso!', 'success');
              
              // Close allocation modal
              this.closeModal('allocation-modal');
              this.allocatingSlot = null;

              // Re-render
              this.render(this.container);
            } catch (err) {
              window.BrigadaUI.showToast('Erro ao cadastrar lote: ' + err.message, 'error');
            }
          });
        }
      };

      const handleCatalogSelection = (btn) => {
        const prodId = parseInt(btn.dataset.id, 10);
        const catalogProduct = (window.BrigadaData.catalog || []).find(c => c.id === prodId);
        if (catalogProduct) {
          contentWrapper.innerHTML = renderRegisterForm(catalogProduct);
          bindRegisterFormEvents(catalogProduct);
        }
      };

      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.searchAvailable = e.target.value;
          // Refresh only the list without rebuilding all events
          const available = this.getAvailableProductsForAllocation();
          const listWrapper = modalEl.querySelector('.available-products-list');
          if (listWrapper) {
            listWrapper.innerHTML = available.length === 0 ? `
              <div class="empty-allocator-state" style="text-align:center; padding:2rem; color:var(--text-tertiary);">
                <div style="font-size:2rem; margin-bottom:8px;">⚠️</div>
                <span>Nenhum produto disponível no catálogo.</span>
              </div>
            ` : available.map(p => `
              <div class="available-product-row" style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:var(--bg-tertiary); border-radius:6px; margin-bottom:8px; border:1px solid var(--border-color);">
                <div class="prod-main-details" style="display:flex; flex-direction:column; gap:2px;">
                  <span class="prod-name" style="font-weight:600; color:var(--text-primary); font-size:0.9rem;">${p.name}</span>
                  <div class="prod-meta" style="display:flex; gap:8px; font-size:0.75rem; color:var(--text-secondary);">
                    <span class="prod-sku">PLU: ${p.plu}</span>
                    <span class="prod-category" style="text-transform:capitalize;">Categoria: ${p.category}</span>
                  </div>
                </div>
                <button class="btn btn-primary btn-sm" data-action="allocate-select-catalog" data-id="${p.id}">
                  Selecionar
                </button>
              </div>
            `).join('');

            // Rebind manual selection on keypress/input refresh
            listWrapper.querySelectorAll('[data-action="allocate-select-catalog"]').forEach(btn => {
              btn.addEventListener('click', () => handleCatalogSelection(btn));
            });
          }
        });
      }

      // Voice recognition search
      if (voiceBtn) {
        voiceBtn.addEventListener('click', () => {
          this.toggleVoiceListening(searchInput);
        });
      }

      // Manual allocation confirm (initial list)
      modalEl.querySelectorAll('[data-action="allocate-select-catalog"]').forEach(btn => {
        btn.addEventListener('click', () => handleCatalogSelection(btn));
      });
    }

    // Scanner Tab events
    if (this.allocationTab === 'scanner') {
      if (this.scanStep === 'idle') {
        modalEl.querySelectorAll('[data-action="sim-scan"]').forEach(btn => {
          btn.addEventListener('click', () => {
            const plu = btn.dataset.plu;
            this.runSimulatedScan(plu, contentWrapper, renderScannerTab, modalEl, renderManualTab);
          });
        });
      } else if (this.scanStep === 'done') {
        modalEl.querySelector('#btn-retry-scan')?.addEventListener('click', () => {
          this.scanStep = 'idle';
          this.scannedResult = null;
          contentWrapper.innerHTML = renderScannerTab();
          this.bindAllocationModalEvents(modalEl, renderManualTab, renderScannerTab);
        });

        modalEl.querySelector('#btn-confirm-scan-alloc')?.addEventListener('click', async () => {
          if (this.scannedResult) {
            await this.allocateProduct(this.scannedResult.product.id);
          }
        });
      }
    }
  },

  toggleVoiceListening(inputEl) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Seu navegador não suporta reconhecimento de voz. Tente usar o Google Chrome.');
      return;
    }

    if (this.isListening) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      this.isListening = true;
      const micIcon = document.getElementById('allocator-voice-btn');
      if (micIcon) {
        micIcon.style.color = '#ef4444';
        micIcon.classList.add('listening');
      }
      if (inputEl) inputEl.placeholder = 'Ouvindo... fale o produto agora';
    };

    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      const clean = text.endsWith('.') ? text.slice(0, -1) : text;
      this.searchAvailable = clean;
      if (inputEl) {
        inputEl.value = clean;
        inputEl.dispatchEvent(new Event('input'));
      }
    };

    recognition.onerror = (e) => {
      console.error(e);
      this.isListening = false;
    };

    recognition.onend = () => {
      this.isListening = false;
      const micIcon = document.getElementById('allocator-voice-btn');
      if (micIcon) {
        micIcon.style.color = 'var(--text-secondary)';
        micIcon.classList.remove('listening');
      }
      if (inputEl) inputEl.placeholder = 'Buscar por nome, PLU ou código de balança...';
    };

    recognition.start();
  },

  runSimulatedScan(plu, contentWrapper, renderScannerTab, modalEl, renderManualTab) {
    // Find matching product in local database that is not yet allocated
    let matched = (window.BrigadaData.products || []).find(p => 
      ['aves', 'suino', 'bovino', 'pescado'].includes(p.category) &&
      !this.parseLocation(p.location) &&
      p.plu === plu
    );

    // Fallback: pick any available unallocated product in meat categories
    if (!matched) {
      matched = (window.BrigadaData.products || []).find(p => 
        ['aves', 'suino', 'bovino', 'pescado'].includes(p.category) &&
        !this.parseLocation(p.location)
      );
    }

    if (!matched) {
      alert('Nenhum produto cadastrado no açougue está disponível para simular a alocação.');
      return;
    }

    this.scanStep = 'scanning';
    contentWrapper.innerHTML = renderScannerTab();
    
    // Simulate scan duration
    setTimeout(() => {
      const expDate = window.BrigadaData.formatDate(matched.endDate);
      const photo = this.generatePalletPhoto(matched.name, matched.plu, expDate);

      this.scannedResult = {
        product: matched,
        photo: photo
      };
      
      this.scanStep = 'done';
      contentWrapper.innerHTML = renderScannerTab();
      this.bindAllocationModalEvents(modalEl, renderManualTab, renderScannerTab);
    }, 1500);
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

    window.BrigadaUI.showToast('Alocando palete...', 'info');
    try {
      await window.BrigadaData.updateProduct(productId, { location: locString });
      window.BrigadaUI.showToast('Palete alocado com sucesso!', 'success');
      
      // Close allocation modal
      this.closeModal('allocation-modal');
      this.allocatingSlot = null;

      // Re-render
      this.render(this.container);
    } catch (err) {
      window.BrigadaUI.showToast('Erro ao alocar palete: ' + err.message, 'error');
    }
  },

  updateDirectoryView(container) {
    const meatProducts = this.getMeatProducts();
    const allocatedProducts = meatProducts.filter(p => {
      const parsed = this.parseLocation(p.location);
      if (!parsed) return false;
      if (this.directoryFilter !== 'all' && p.category !== this.directoryFilter) return false;
      if (this.directorySearch) {
        const query = this.directorySearch.toLowerCase().trim();
        const address = `${parsed.chamber} C${parsed.column} N${parsed.level} ${parsed.position}`.toLowerCase();
        const shortAddress = `${parsed.chamber === 'Câmara Resfriada' ? 'resf' : 'cong'}:c${parsed.column}n${parsed.level}${parsed.position[0]}`.toLowerCase();
        return p.name.toLowerCase().includes(query) || 
               p.plu.toLowerCase().includes(query) || 
               address.includes(query) ||
               shortAddress.includes(query);
      }
      return true;
    });

    const tbody = container.querySelector('#dir-tbody');
    if (tbody) {
      tbody.innerHTML = allocatedProducts.length === 0 ? `
        <tr>
          <td colspan="8" class="empty-state" style="padding: 2.5rem; text-align: center;">
            <div class="empty-state__icon" style="font-size: 2rem; margin-bottom: 8px;">📭</div>
            <p class="empty-state__text" style="color: var(--text-secondary); margin: 0;">Nenhum palete alocado correspondente aos filtros.</p>
          </td>
        </tr>
      ` : allocatedProducts.map(p => {
        const parsed = this.parseLocation(p.location);
        const status = window.BrigadaData.getProductStatus(p);
        const chamberLabel = parsed.chamber === 'Câmara Resfriada' ? 'Resfriada' : 'Congelada';
        const addressLabel = `C${parsed.column.toString().padStart(2, '0')}-N${parsed.level}-${parsed.position === 'esquerda' ? 'E' : 'D'}`;
        const catMap = { 
          aves: '🐔 Aves', suino: '🐷 Suíno', bovino: '🐮 Bovino', pescado: '🐟 Pescado',
          laticinios: '🧀 Laticínios', frios: '🥓 Frios'
        };
        
        return `
          <tr>
            <td data-label="Endereço WMS"><strong style="color:#6366F1; font-family:monospace; font-size:1rem;">${addressLabel}</strong></td>
            <td data-label="Câmara"><span class="butcher-alloc-badge allocated ${parsed.chamber === 'Câmara Resfriada' ? 'resfriada' : 'congelada'}">${chamberLabel}</span></td>
            <td data-label="PLU"><span class="plu-badge">${p.plu}</span></td>
            <td data-label="Produto" class="product-name" onclick="window.BrigadaUI.showProductView('${p.id}')" style="cursor: pointer; text-decoration: underline; color: var(--primary);" title="Ver detalhes">
              <div>${p.name}</div>
              <div style="font-size:0.7rem; color:var(--text-tertiary);">${catMap[p.category] || p.category}</div>
            </td>
            <td data-label="Estoque"><strong>${p.quantity}</strong> <span style="font-size:0.75rem; color:var(--text-secondary);">${p.unit || 'kg'}</span></td>
            <td data-label="Validade">${window.BrigadaData.formatDate(p.endDate)}</td>
            <td data-label="Status"><span class="badge ${status.class}">${status.icon} ${status.label}</span></td>
            <td data-label="Ações" class="actions-cell">
              <button class="btn btn-primary btn-sm" data-dir-action="zoom" data-chamber="${parsed.chamber}" data-col="${parsed.column}" style="padding: 4px 8px; font-size: 0.8rem; cursor: pointer;">
                👁️ Ver Rack
              </button>
              <button class="btn btn-danger btn-sm" data-dir-action="deallocate" data-id="${p.id}" style="padding: 4px 8px; font-size: 0.8rem; cursor: pointer;">
                🗑️ Desalocar
              </button>
            </td>
          </tr>
        `;
      }).join('');

      this.bindDirectoryRowEvents(tbody);
    }
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
        const id = parseInt(btn.dataset.id, 10);
        if (confirm('Tem certeza que deseja desalocar este palete desta posição?')) {
          await this.deallocateProduct(id);
        }
      });
    });
  },

  closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove('modal-overlay--visible');
      setTimeout(() => modal.remove(), 250);
    }
  }
};

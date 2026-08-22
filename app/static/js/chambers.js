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
  filterScheduleDay: 'all', // 'all', 'today', 'domingo', 'segunda', etc.
  filterColumn: 'all', // 'all', '1', '2', ..., 'alerts', 'occupied', 'empty'

  // Esquema Oficial de Verificação de Validade — Câmara Congelada (Ciclo Único - Domingo a Sábado | 16 Colunas)
  SCHEDULE_CONGELADA: [
    { dayIndex: 0, dayKey: 'domingo', dayName: 'Domingo', short: 'Dom', columns: [1, 2, 3] },
    { dayIndex: 1, dayKey: 'segunda', dayName: 'Segunda', short: 'Seg', columns: [4, 5, 6] },
    { dayIndex: 2, dayKey: 'terca', dayName: 'Terça', short: 'Ter', columns: [7, 8, 9] },
    { dayIndex: 3, dayKey: 'quarta', dayName: 'Quarta', short: 'Qua', columns: [10, 11] },
    { dayIndex: 4, dayKey: 'quinta', dayName: 'Quinta', short: 'Qui', columns: [12, 13] },
    { dayIndex: 5, dayKey: 'sexta', dayName: 'Sexta', short: 'Sex', columns: [14, 15] },
    { dayIndex: 6, dayKey: 'sabado', dayName: 'Sábado', short: 'Sáb', columns: [16] }
  ],

  getScheduleForColumn(chamberName, colNum) {
    if (chamberName !== 'Câmara Congelada') return null;
    return this.SCHEDULE_CONGELADA.find(s => s.columns.includes(colNum)) || null;
  },

  getTodayScheduleCongelada() {
    const todayIndex = new Date().getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    return this.SCHEDULE_CONGELADA.find(s => s.dayIndex === todayIndex) || this.SCHEDULE_CONGELADA[1];
  },

  // ── Gerenciamento de Posições Marcadas como Vazia (Regra: Esquerda ➔ Direita) ──
  getEmptySlots() {
    try {
      const stored = localStorage.getItem('brigada_chamber_empty_slots');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  isSlotMarkedEmpty(chamber, column, level, position) {
    if (!chamber || !column) return false;
    const key = `${chamber}:C${column}:N${level}:${position}`;
    return this.getEmptySlots().includes(key);
  },

  setSlotMarkedEmpty(chamber, column, level, position, isEmpty) {
    if (!chamber || !column) return;
    const key = `${chamber}:C${column}:N${level}:${position}`;
    let list = this.getEmptySlots();
    if (isEmpty) {
      if (!list.includes(key)) list.push(key);
    } else {
      list = list.filter(k => k !== key);
    }
    try {
      localStorage.setItem('brigada_chamber_empty_slots', JSON.stringify(list));
    } catch (e) {}
  },

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
    const match = locationStr.match(/^(resfriado|congelado|laticinios|pereciveis):C(\d+)-N(\d+)-([ED])(?::(full|misto))?$/i);
    if (match) {
      const chKey = match[1].toLowerCase();
      const chMap = {
        resfriado: 'Câmara Resfriada',
        congelado: 'Câmara Congelada',
        laticinios: 'Câmara de Laticínios',
        pereciveis: 'Câmara de Perecíveis'
      };
      return {
        chamberKey: chKey,
        chamber: chMap[chKey] || (chKey === 'resfriado' ? 'Câmara Resfriada' : 'Câmara Congelada'),
        column: parseInt(match[2], 10),
        level: parseInt(match[3], 10),
        position: match[4].toUpperCase() === 'E' ? 'esquerda' : 'direita',
        palletType: match[5] ? match[5].toLowerCase() : 'full'
      };
    }
    return null;
  },

  // Format coordinates to location string
  formatLocation(chamberId, column, level, position, palletType = 'full') {
    const posCode = position === 'esquerda' ? 'E' : 'D';
    const typeCode = palletType === 'misto' ? 'misto' : 'full';
    return `${chamberId}:C${column}-N${level}-${posCode}:${typeCode}`;
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

  // Retorna todos os produtos alocados em uma coluna inteira
  getColumnProducts(column) {
    if (!this.selectedChamber) return [];
    const allProducts = this.getAllChamberProducts();
    return allProducts.filter(p => {
      const parsed = this.parseLocation(p.location);
      return parsed &&
        parsed.chamber === this.selectedChamber &&
        parsed.column === column;
    }).sort((a, b) => {
      const pa = this.parseLocation(a.location);
      const pb = this.parseLocation(b.location);
      if (pa && pb) {
        if (pa.level !== pb.level) return pb.level - pa.level;
        if (pa.position !== pb.position) return pa.position.localeCompare(pb.position);
      }
      return 0;
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

  calculateAlerts(products) {
    const expired = [];
    const today = [];
    const atencao = [];
    const resfriado15 = [];
    const congelado30 = [];

    products.forEach(p => {
      // Produtos com ação registrada (Tratado, Quebra, Troca, Vendido) já foram solucionados e não geram alertas na câmara
      if (p.expiredAction) return;

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

  getColumnAlerts(chamberName, colNum) {
    const products = this.getAllChamberProducts().filter(p => {
      const parsed = this.parseLocation(p.location);
      return parsed && parsed.chamber === chamberName && parsed.column === colNum;
    });
    return this.calculateAlerts(products);
  },

  getChamberAlerts(chamberName) {
    const products = this.getAllChamberProducts().filter(p => {
      const parsed = this.parseLocation(p.location);
      return parsed && parsed.chamber === chamberName;
    });
    return this.calculateAlerts(products);
  },

  renderColumnCard(chamberName, colNum, totalCols, chamberThemeColor, chamberTag) {
    const products = this.getAllChamberProducts();
    const occupiedSlots = new Set();
    let totalItemsInCol = 0;

    products.forEach(p => {
      const parsed = this.parseLocation(p.location);
      if (parsed && parsed.chamber === chamberName && parsed.column === colNum) {
        occupiedSlots.add(`N${parsed.level}-${parsed.position}`);
        totalItemsInCol++;
      }
    });

    const colOccupiedCount = occupiedSlots.size;
    const alerts = this.getColumnAlerts(chamberName, colNum);

    let alertClass = '';
    const alertBadges = [];

    if (alerts.hasExpired) {
      alertClass = 'freezer-card--critical';
      alertBadges.push(`
        <div class="badge--blinking-alert" style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 7px 12px; border-radius: 10px; font-size: 0.82rem; font-weight: 800; box-shadow: 0 4px 12px rgba(239,68,68,0.45); letter-spacing: 0.2px; width: 100%; box-sizing: border-box; display: flex; align-items: center; justify-content: center; gap: 6px;">
          <span style="font-size: 1rem;">🔴</span> <span>VENCIDOS: ${alerts.expired.length} ${alerts.expired.length === 1 ? 'item' : 'itens'}</span>
        </div>
      `);
    }
    if (alerts.hasToday) {
      if (!alertClass) alertClass = 'freezer-card--critical';
      alertBadges.push(`
        <div class="badge--blinking-alert" style="background: linear-gradient(135deg, #ea580c, #c2410c); color: white; padding: 7px 12px; border-radius: 10px; font-size: 0.82rem; font-weight: 800; box-shadow: 0 4px 12px rgba(234,88,12,0.45); letter-spacing: 0.2px; width: 100%; box-sizing: border-box; display: flex; align-items: center; justify-content: center; gap: 6px;">
          <span style="font-size: 1rem;">🟠</span> <span>VENCE HOJE: ${alerts.today.length} ${alerts.today.length === 1 ? 'item' : 'itens'}</span>
        </div>
      `);
    }
    if (alerts.hasAtencao) {
      if (!alertClass) alertClass = 'freezer-card--warning';
      alertBadges.push(`
        <div class="badge--blinking-alert" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 7px 12px; border-radius: 10px; font-size: 0.82rem; font-weight: 800; box-shadow: 0 4px 12px rgba(245,158,11,0.45); letter-spacing: 0.2px; width: 100%; box-sizing: border-box; display: flex; align-items: center; justify-content: center; gap: 6px;">
          <span style="font-size: 1rem;">⚠️</span> <span>ATENÇÃO (1 A 3 DIAS): ${alerts.atencao.length} ${alerts.atencao.length === 1 ? 'item' : 'itens'}</span>
        </div>
      `);
    }
    if (alerts.hasResfriado15) {
      if (!alertClass) alertClass = 'freezer-card--resfriado15';
      alertBadges.push(`
        <div class="badge--blinking-alert" style="background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; padding: 7px 12px; border-radius: 10px; font-size: 0.82rem; font-weight: 800; box-shadow: 0 4px 12px rgba(6,182,212,0.45); letter-spacing: 0.2px; width: 100%; box-sizing: border-box; display: flex; align-items: center; justify-content: center; gap: 6px;">
          <span style="font-size: 1rem;">❄️</span> <span>ALERTA 15 DIAS: ${alerts.resfriado15.length}</span>
        </div>
      `);
    }
    if (alerts.hasCongelado30) {
      if (!alertClass) alertClass = 'freezer-card--congelado30';
      alertBadges.push(`
        <div class="badge--blinking-alert" style="background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; padding: 7px 12px; border-radius: 10px; font-size: 0.82rem; font-weight: 800; box-shadow: 0 4px 12px rgba(99,102,241,0.45); letter-spacing: 0.2px; width: 100%; box-sizing: border-box; display: flex; align-items: center; justify-content: center; gap: 6px;">
          <span style="font-size: 1rem;">🥶</span> <span>ALERTA 30 DIAS: ${alerts.congelado30.length}</span>
        </div>
      `);
    }

    const alertBadgesHTML = alertBadges.length > 0 ? `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; margin: 0.6rem 0 0.9rem 0; width: 100%;">
        ${alertBadges.join('')}
      </div>
    ` : '';

    const glowColor = alerts.hasExpired || alerts.hasToday ? '#ef4444' : alerts.hasAtencao ? '#f59e0b' : alerts.hasResfriado15 ? '#06b6d4' : alerts.hasCongelado30 ? '#6366f1' : (colOccupiedCount > 0 ? '#10b981' : chamberThemeColor);

    const sched = this.getScheduleForColumn(chamberName, colNum);
    const todaySched = this.getTodayScheduleCongelada();
    const isTodaySched = sched && todaySched && sched.dayIndex === todaySched.dayIndex;

    return `
      <div class="chamber-card-outer ${alertClass}" data-action="view-column" data-chamber="${chamberName}" data-col="${colNum}" style="cursor: pointer; position: relative;">
        <div class="chamber-card-header-glow" style="background: ${glowColor};"></div>
        <div class="chamber-card-body" style="padding: 1.2rem; text-align: center;">
          <h2 class="chamber-card-name" style="font-size: 1.35rem; font-weight: 800; color: ${chamberThemeColor}; margin-bottom: 0.25rem; letter-spacing: -0.3px;">Coluna ${colNum.toString().padStart(2, '0')}</h2>
          
          ${sched ? `
            <div style="margin-bottom: 0.45rem;">
              <span style="${isTodaySched ? 'background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; color: #10b981; font-weight: 800; font-size: 0.76rem; padding: 3px 9px; box-shadow: 0 0 10px rgba(16,185,129,0.25);' : 'background: rgba(255,255,255,0.06); border: 1px solid var(--border-color); color: var(--text-secondary); font-size: 0.72rem; padding: 2px 8px;'} border-radius: 6px; display: inline-flex; align-items: center; gap: 4px;">
                ${isTodaySched ? '🎯 Escala de Hoje (' + sched.dayName + ')' : '🗓️ ' + sched.dayName}
              </span>
            </div>
          ` : ''}

          <div style="font-size: 0.78rem; color: var(--text-tertiary); margin-bottom: 0.5rem; font-family: monospace; background: rgba(128,128,128,0.1); display: inline-block; padding: 2px 8px; border-radius: 4px;">Rack ${colNum.toString().padStart(2, '0')} de ${totalCols.toString().padStart(2, '0')} • ${chamberTag}</div>
          
          ${alertBadgesHTML}
          
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 0.35rem;">
            <span class="status-dot" style="width: 10px; height: 10px; border-radius: 50%; background-color: ${glowColor};"></span>
            <span style="font-size: 0.9rem; color: var(--text-secondary); font-weight: 600;">${colOccupiedCount} / 8 Paletes</span>
          </div>

          <div style="font-size: 0.78rem; color: var(--text-tertiary); margin-bottom: 0.8rem;">
            ${totalItemsInCol} ${totalItemsInCol === 1 ? 'item alocado' : 'itens alocados'}
          </div>
          
          <div class="chamber-card-footer" style="justify-content: center;">
            <span class="enter-text">Acessar Rack</span>
            ${this.icons.ChevronRight}
          </div>
        </div>
      </div>
    `;
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
    const isCongelada = this.selectedChamber === 'Câmara Congelada';
    const themeColor = isResfriada ? '#38bdf8' : '#818cf8';
    const chamberIcon = isResfriada ? '❄️' : '🥶';
    const products = this.getAllChamberProducts();
    const stats = this.getChamberStats();
    const activeStats = stats[this.selectedChamber];
    const percent = Math.round((activeStats.occupied / config.capacity) * 100);

    const todaySched = this.getTodayScheduleCongelada();

    // Calcula dados detalhados de cada coluna para filtros e badges
    const colInfoList = Array.from({ length: config.columnsCount }, (_, i) => {
      const colNum = i + 1;
      const alerts = this.getColumnAlerts(this.selectedChamber, colNum);
      const occupiedSlots = new Set();
      let totalItems = 0;
      products.forEach(p => {
        const parsed = this.parseLocation(p.location);
        if (parsed && parsed.chamber === this.selectedChamber && parsed.column === colNum) {
          occupiedSlots.add(`N${parsed.level}-${parsed.position}`);
          totalItems++;
        }
      });
      return {
        colNum,
        occupied: occupiedSlots.size,
        items: totalItems,
        alerts,
        hasAlerts: alerts.hasAny
      };
    });

    const alertColsCount = colInfoList.filter(c => c.hasAlerts).length;
    const occupiedColsCount = colInfoList.filter(c => c.occupied > 0).length;
    const emptyColsCount = colInfoList.filter(c => c.occupied === 0).length;

    // Determina colunas ativas baseadas no filtro de dia (Câmara Congelada) e filtro de coluna
    let baseColumns = Array.from({ length: config.columnsCount }, (_, i) => i + 1);
    if (isCongelada && this.filterScheduleDay !== 'all') {
      if (this.filterScheduleDay === 'today') {
        baseColumns = todaySched.columns;
      } else {
        const matchingSched = this.SCHEDULE_CONGELADA.find(s => s.dayKey === this.filterScheduleDay);
        if (matchingSched) {
          baseColumns = matchingSched.columns;
        }
      }
    }

    let activeColumns = baseColumns;
    if (this.filterColumn === 'alerts') {
      activeColumns = baseColumns.filter(colNum => colInfoList[colNum - 1].hasAlerts);
    } else if (this.filterColumn === 'occupied') {
      activeColumns = baseColumns.filter(colNum => colInfoList[colNum - 1].occupied > 0);
    } else if (this.filterColumn === 'empty') {
      activeColumns = baseColumns.filter(colNum => colInfoList[colNum - 1].occupied === 0);
    } else if (this.filterColumn !== 'all') {
      const targetCol = parseInt(this.filterColumn, 10);
      if (!isNaN(targetCol)) {
        activeColumns = [targetCol];
      }
    }

    const columnCardsHTML = activeColumns.length === 0 ? `
      <div style="grid-column: 1 / -1; padding: 3rem 2rem; text-align: center; background: rgba(255,255,255,0.02); border: 1px dashed var(--glass-border); border-radius: 12px;">
        <div style="font-size: 2.5rem; margin-bottom: 8px;">🔍</div>
        <h4 style="color: var(--text-primary); margin: 0 0 6px 0; font-size: 1.1rem; font-weight: 700;">Nenhuma coluna encontrada</h4>
        <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0 0 1.25rem 0;">Nenhuma coluna corresponde ao filtro selecionado.</p>
        <button type="button" class="btn btn-primary btn-sm" id="btn-reset-filters-empty" style="cursor: pointer; padding: 7px 16px; border-radius: 8px; font-weight: 600;">
          Mostrar Todas as Colunas
        </button>
      </div>
    ` : activeColumns.map(colNum => {
      return this.renderColumnCard(this.selectedChamber, colNum, config.columnsCount, themeColor, isResfriada ? 'Resfriada' : 'Congelada');
    }).join('');

    const chamberProducts = products.filter(p => {
      const parsed = this.parseLocation(p.location);
      return parsed && parsed.chamber === this.selectedChamber;
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
        .col-chip-btn {
          font-size: 0.8rem;
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid var(--border-color, rgba(255,255,255,0.1));
          background: rgba(255,255,255,0.04);
          color: var(--text-secondary);
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
        }
        .col-chip-btn:hover {
          background: rgba(255,255,255,0.1);
          color: var(--text-primary);
          border-color: var(--primary, #6366f1);
        }
        .col-chip-btn--active {
          background: var(--primary, #6366f1) !important;
          color: #ffffff !important;
          border-color: var(--primary, #6366f1) !important;
          font-weight: 800 !important;
          box-shadow: 0 2px 10px rgba(99,102,241,0.4);
        }
      </style>
    `;

    const scheduleBannerHTML = isCongelada ? `
      <!-- Painel do Esquema de Verificação de Validade — Câmara Congelada -->
      <div class="glass-panel" style="padding: 1.25rem 1.5rem; margin-bottom: 1.25rem; border-radius: 12px; border: 1px solid var(--glass-border); background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.6rem;">🗓️</span>
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 700; margin: 0; color: var(--text-primary);">Esquema de Verificação — Câmara Congelada (16 Colunas)</h3>
              <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 2px 0 0 0;">Ciclo único de Domingo a Sábado • Sequência: 1–3 ➔ 4–6 ➔ 7–9 ➔ 10–11 ➔ 12–13 ➔ 14–15 ➔ 16</p>
            </div>
          </div>

          <!-- Banner de Destaque do Dia de Hoje -->
          <div style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 8px; padding: 6px 14px; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.1rem;">🎯</span>
            <span style="font-size: 0.85rem; color: #10b981; font-weight: 700;">
              HOJE (${todaySched.dayName.toUpperCase()}): Colunas ${todaySched.columns.join(', ')} (${todaySched.columns.length} colunas programadas)
            </span>
          </div>
        </div>

        <!-- Abas de Filtro por Dia da Semana -->
        <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px; flex-wrap: wrap;" id="chamber-sched-day-tabs">
          <button type="button" class="cat-tab ${this.filterScheduleDay === 'all' ? 'cat-tab--active' : ''}" data-sched-day="all" style="font-size: 0.8rem; font-weight: 700; padding: 6px 12px; border-radius: 20px; cursor: pointer;">
            🔘 Todas as Escalas (16)
          </button>
          <button type="button" class="cat-tab ${this.filterScheduleDay === 'today' ? 'cat-tab--active' : ''}" data-sched-day="today" style="font-size: 0.8rem; font-weight: 800; padding: 6px 14px; border-radius: 20px; border-color: #10b981; color: ${this.filterScheduleDay === 'today' ? '#ffffff' : '#10b981'}; background: ${this.filterScheduleDay === 'today' ? '#10b981' : 'rgba(16,185,129,0.12)'}; cursor: pointer;">
            🎯 Hoje (${todaySched.dayName})
          </button>
          ${this.SCHEDULE_CONGELADA.map(s => {
            const isActive = this.filterScheduleDay === s.dayKey;
            const isToday = s.dayIndex === todaySched.dayIndex;
            return `
              <button type="button" class="cat-tab ${isActive ? 'cat-tab--active' : ''}" data-sched-day="${s.dayKey}" style="font-size: 0.8rem; padding: 6px 12px; border-radius: 20px; font-weight: 600; cursor: pointer;">
                ${isToday ? '⭐ ' : ''}${s.short} (${s.columns.length})
              </button>
            `;
          }).join('')}
        </div>
      </div>
    ` : '';

    // Barra de Filtro de Colunas (Apenas Pílulas Rápidas e Limpas)
    const columnFilterBarHTML = `
      <div style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 1.5rem; flex-wrap: wrap; align-items: center;" id="chamber-col-chips">
        <button type="button" class="col-chip-btn ${this.filterColumn === 'all' ? 'col-chip-btn--active' : ''}" data-col-filter="all">
          Todas
        </button>

        ${colInfoList.map(c => {
          const isColActive = this.filterColumn === String(c.colNum);
          return `
            <button type="button" class="col-chip-btn ${isColActive ? 'col-chip-btn--active' : ''}" data-col-filter="${c.colNum}">
              Coluna ${c.colNum.toString().padStart(2, '0')}
            </button>
          `;
        }).join('')}
      </div>
    `;

    return `
      <div class="chambers-page">
        ${animationStyles}
        <div class="panel-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div class="panel-header__left" style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
            <button class="btn btn--ghost" id="btn-back-to-chambers" style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; font-weight: 600; cursor: pointer;">
              ${this.icons.ArrowLeft}
              <span>Voltar ao Mapa Geral</span>
            </button>
            <div>
              <h2 class="panel-title" style="margin: 0;">${chamberIcon} ${this.selectedChamber}</h2>
              <p class="panel-subtitle" style="margin: 0;">Mapa das ${config.columnsCount} colunas (${activeStats.occupied} de ${config.capacity} paletes ocupados • ${percent}% utilizado)</p>
            </div>
          </div>
        </div>

        ${scheduleBannerHTML}

        ${columnFilterBarHTML}

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(235px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
          ${columnCardsHTML}
        </div>

        ${this.buildDirectoryHTML(chamberProducts)}
      </div>
    `;
  },


  // ── Rack de Armazenamento da Coluna Selecionada ──
  buildRackViewHTML() {
    const config = this.CHAMBER_CONFIGS[this.selectedChamber];
    const isResfriada = this.selectedChamber === 'Câmara Resfriada';
    const chamberIcon = isResfriada ? '❄️' : '🥶';
    const colNum = this.selectedColumn;
    const colStr = colNum.toString().padStart(2, '0');
    const alerts = this.getColumnAlerts(this.selectedChamber, colNum);

    const alertBannerHTML = alerts.hasAny ? `
      <div class="badge--blinking-alert" style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.4); border-left: 5px solid #ef4444; border-radius: 8px; padding: 12px 16px; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.6rem;">🚨</span>
          <div>
            <div style="font-weight: 700; color: #ef4444; font-size: 0.98rem;">ALERTA DE VALIDADE ATIVO NESTA COLUNA!</div>
            <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 2px;">
              Existem <strong>${alerts.totalAlerts} produto(s)</strong> exigindo atenção de validade (vencidos, vencendo hoje ou em alerta de dias).
            </div>
          </div>
        </div>
        <div style="font-size: 0.8rem; font-weight: 600; color: #ef4444; background: rgba(239,68,68,0.15); padding: 4px 10px; border-radius: 6px; white-space: nowrap;">
          ⚠️ Atenção Prioritária
        </div>
      </div>
    ` : '';

    const prevCol = colNum > 1 ? colNum - 1 : null;
    const nextCol = colNum < config.columnsCount ? colNum + 1 : null;
    const colProducts = this.getColumnProducts(colNum);

    return `
      <div class="chambers-page animate-fade-in">
        <div class="chamber-action-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
          <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
            <button class="btn btn-outline btn-sm" id="btn-back-to-columns" style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
              ${this.icons.ArrowLeft}
              <span>Voltar ao Mapa Geral</span>
            </button>
            <div class="chamber-active-info" style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              <span class="status-dot" style="width:10px; height:10px; border-radius:50%; background-color:${alerts.hasCritical ? '#ef4444' : alerts.hasWarning ? '#f59e0b' : '#10b981'}; display:inline-block;"></span>
              <h2 class="chamber-title" style="margin: 0; font-size: 1.5rem; font-weight: 700;">${chamberIcon} ${this.selectedChamber} — Coluna ${colStr}</h2>
              ${(() => {
                const sched = this.getScheduleForColumn(this.selectedChamber, colNum);
                const todaySched = this.getTodayScheduleCongelada();
                const isToday = sched && todaySched && sched.dayIndex === todaySched.dayIndex;
                if (!sched) return '';
                return `
                  <span style="${isToday ? 'background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; color: #10b981; font-weight: 800;' : 'background: rgba(255,255,255,0.06); border: 1px solid var(--border-color); color: var(--text-secondary);'} font-size: 0.8rem; padding: 4px 10px; border-radius: 6px; display: inline-flex; align-items: center; gap: 5px;">
                    ${isToday ? '🎯 Auditoria Programada para Hoje (' + sched.dayName + ')' : '🗓️ Escala Oficial: ' + sched.dayName}
                  </span>
                `;
              })()}
            </div>
          </div>

          <!-- Navegador Rápido de Colunas -->
          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="btn btn-outline btn-sm" data-action="nav-col" data-col="${prevCol}" ${prevCol ? '' : 'disabled'} style="padding: 6px 12px; font-weight: 600; cursor: ${prevCol ? 'pointer' : 'default'}; opacity: ${prevCol ? '1' : '0.4'};">
              ◀ Anterior
            </button>
            <select id="rack-column-select" class="form-input" style="padding: 5px 12px; font-size: 0.9rem; font-weight: 700; width: auto; border-radius: 6px; cursor: pointer; background: var(--bg-tertiary);">
              ${Array.from({ length: config.columnsCount }, (_, i) => {
                const c = i + 1;
                return `<option value="${c}" ${c === colNum ? 'selected' : ''}>Coluna ${c.toString().padStart(2, '0')}</option>`;
              }).join('')}
            </select>
            <button class="btn btn-outline btn-sm" data-action="nav-col" data-col="${nextCol}" ${nextCol ? '' : 'disabled'} style="padding: 6px 12px; font-weight: 600; cursor: ${nextCol ? 'pointer' : 'default'}; opacity: ${nextCol ? '1' : '0.4'};">
              Próxima ▶
            </button>
          </div>
        </div>

        ${alertBannerHTML}

        <!-- Tabela Principal de Produtos Alocados na Coluna (Estilo Idêntico ao Piso de Loja) -->
        <div class="glass-panel" style="padding: 1.5rem; margin-bottom: 2rem;">
          <div class="panel-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
            <div style="display:flex; flex-direction:column; gap:4px;">
              <h3 style="font-size: 1.2rem; font-weight: 600; margin: 0;">Produtos Alocados nesta Coluna</h3>
              <p style="font-size:0.85rem; color:var(--text-secondary); margin: 0;">Total: ${colProducts.length} itens armazenados na Coluna ${colStr}</p>
            </div>
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
              <button class="btn btn--primary" id="btn-open-add-new-chamber-col" style="display: flex; align-items: center; gap: 6px; background-color: #10b981; border-color: #10b981; color: white; cursor: pointer; font-weight: 700; padding: 7px 14px;">
                <span>➕</span>
                Adicionar Novo Produto
              </button>
            </div>
          </div>

          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>PLU</th>
                  <th>Produto</th>
                  <th>Posição / Nível</th>
                  <th>Estoque</th>
                  <th>Validade</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                ${colProducts.length === 0 ? `
                  <tr>
                    <td colspan="7" class="empty-state" style="padding: 2.5rem; text-align: center; color: var(--text-secondary);">
                      <div style="font-size: 2rem; margin-bottom: 8px;">❄️</div>
                      Nenhum produto alocado nesta coluna ainda.<br>
                      <small style="color: var(--text-tertiary); margin-top: 4px; display: inline-block;">Clique em "+ Adicionar Novo Produto" para cadastrar itens nesta coluna.</small>
                    </td>
                  </tr>
                ` : colProducts.map(p => {
                  const status = window.BrigadaData.getProductStatus(p);
                  const isResolved = !!p.expiredAction;
                  const isCritical = !isResolved && (status.days <= 0 || status.class === 'badge--expired' || status.class === 'badge--today');
                  const isWarning = !isResolved && (status.days > 0 && status.days <= 3);
                  const isAlert = !isResolved && (isCritical || isWarning || status.isResfriadoAlert || status.isCongeladoAlert);
                  const rowStyle = isCritical ? 'background: rgba(239, 68, 68, 0.08);' : isWarning ? 'background: rgba(245, 158, 11, 0.08);' : '';
                  const blinkBadgeClass = isAlert ? 'badge--blinking-alert' : '';
                  const parsed = this.parseLocation(p.location);
                  const lvl = parsed ? parsed.level : 1;
                  const pos = parsed ? parsed.position : 'esquerda';
                  const palletType = parsed ? (parsed.palletType || 'full') : 'full';
                  const sideLabel = pos === 'esquerda' ? 'Lado Esquerdo' : 'Lado Direito';
                  const isPiso = lvl === 1;
                  const levelBadge = isPiso
                    ? `<span style="background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid rgba(16,185,129,0.3); font-weight: 700; font-size: 0.78rem; padding: 3px 8px; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;">📦 Piso • ${sideLabel}</span>`
                    : `<span style="background: rgba(56,189,248,0.15); color: #38bdf8; border: 1px solid rgba(56,189,248,0.3); font-weight: 700; font-size: 0.78rem; padding: 3px 8px; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;">🏗️ Nível ${lvl} • ${sideLabel}</span>`;
                  const palletBadge = palletType === 'misto'
                    ? `<span style="background: rgba(168,85,247,0.18); color: #c084fc; border: 1px solid rgba(168,85,247,0.4); font-weight: 700; font-size: 0.72rem; padding: 2px 7px; border-radius: 5px; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;">🔀 Palete Misto</span>`
                    : `<span style="background: rgba(56,189,248,0.12); color: #38bdf8; border: 1px solid rgba(56,189,248,0.25); font-weight: 700; font-size: 0.72rem; padding: 2px 7px; border-radius: 5px; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;">📦 Palete Full</span>`;

                  return `
                    <tr style="${rowStyle}">
                      <td><span class="plu-badge">${p.plu}</span></td>
                      <td style="font-weight: 500;">
                        <div onclick="window.BrigadaUI.showProductView('${p.id}')" style="cursor: pointer; font-weight: 600; color: var(--text-primary);" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='var(--text-primary)'" title="Ver detalhes">${p.name}</div>
                        <div style="font-size:0.7rem; color:var(--text-tertiary);">${this.catMap[p.category] || p.category || ''} ${p.supplier ? `• 🏢 ${p.supplier}` : ''}</div>
                      </td>
                      <td>
                        <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
                          ${levelBadge}
                          ${palletBadge}
                        </div>
                      </td>
                      <td><strong>${p.quantity}</strong> ${p.unit || 'kg'}</td>
                      <td><strong>${window.BrigadaData.formatDate(p.endDate)}</strong></td>
                      <td><span class="badge ${status.class} ${blinkBadgeClass}">${status.icon} ${status.label}</span></td>
                      <td>
                        <div style="display: inline-flex; gap: 6px; flex-wrap: wrap;">
                          <button class="btn btn-outline btn-sm" data-action="cracha-product-col-table" data-id="${p.id}" style="cursor: pointer; padding: 4px 10px; font-size: 0.8rem; background: rgba(99,102,241,0.15); color: #818cf8; border: 1px solid rgba(99,102,241,0.35); display: inline-flex; align-items: center; gap: 4px;" title="Gerar Crachá com Informações do Produto">
                            🏷️ Crachá
                          </button>
                          <button class="btn btn-outline btn-sm" data-action="edit-product-col-table" data-id="${p.id}" data-col="${colNum}" data-lvl="${lvl}" data-pos="${pos}" style="cursor: pointer; padding: 4px 10px; font-size: 0.8rem; color: #38bdf8; border-color: rgba(56,189,248,0.35);" title="Editar Produto">
                            ✏️ Editar
                          </button>
                          <button class="btn btn-danger btn-sm" data-action="delete-product-col-table" data-id="${p.id}" style="cursor: pointer; padding: 4px 10px; font-size: 0.8rem; background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.3);" title="Excluir Produto Permanentemente">
                            🗑️ Excluir
                          </button>
                        </div>
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
  },

  buildHTML() {
    const stats = this.getChamberStats();
    const allProducts = this.getAllChamberProducts();

    // 1. Visão Geral das Câmaras (Padrão Completo e Rico do Piso de Loja)
    if (!this.selectedChamber) {
      const resfriadaCapacity = this.CHAMBER_CONFIGS['Câmara Resfriada'].capacity;
      const resfriadaOccupied = stats['Câmara Resfriada'].occupied;
      const resfriadaPercent = Math.round((resfriadaOccupied / resfriadaCapacity) * 100);
      const resfriadaAlerts = this.getChamberAlerts('Câmara Resfriada');

      const congeladaCapacity = this.CHAMBER_CONFIGS['Câmara Congelada'].capacity;
      const congeladaOccupied = stats['Câmara Congelada'].occupied;
      const congeladaPercent = Math.round((congeladaOccupied / congeladaCapacity) * 100);
      const congeladaAlerts = this.getChamberAlerts('Câmara Congelada');

      // Badges de alerta das câmaras
      const buildChamberAlertBadges = (alerts) => {
        const badges = [];
        if (alerts.hasExpired) {
          badges.push(`
            <div class="badge--blinking-alert" style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 800; box-shadow: 0 4px 12px rgba(239,68,68,0.4);">
              <span>🔴</span> <span>VENCIDOS: ${alerts.expired.length}</span>
            </div>
          `);
        }
        if (alerts.hasToday) {
          badges.push(`
            <div class="badge--blinking-alert" style="background: linear-gradient(135deg, #ea580c, #c2410c); color: white; padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 800; box-shadow: 0 4px 12px rgba(234,88,12,0.4);">
              <span>🟠</span> <span>VENCE HOJE: ${alerts.today.length}</span>
            </div>
          `);
        }
        if (alerts.hasAtencao) {
          badges.push(`
            <div class="badge--blinking-alert" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 800; box-shadow: 0 4px 12px rgba(245,158,11,0.4);">
              <span>⚠️</span> <span>ATENÇÃO (1 A 3 DIAS): ${alerts.atencao.length}</span>
            </div>
          `);
        }
        if (alerts.hasResfriado15) {
          badges.push(`
            <div class="badge--blinking-alert" style="background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 800; box-shadow: 0 4px 12px rgba(6,182,212,0.4);">
              <span>❄️</span> <span>ALERTA 15 DIAS: ${alerts.resfriado15.length}</span>
            </div>
          `);
        }
        if (alerts.hasCongelado30) {
          badges.push(`
            <div class="badge--blinking-alert" style="background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 800; box-shadow: 0 4px 12px rgba(99,102,241,0.4);">
              <span>🥶</span> <span>ALERTA 30 DIAS: ${alerts.congelado30.length}</span>
            </div>
          `);
        }
        return badges.length > 0 ? `<div style="display:flex; flex-wrap:wrap; gap:6px; margin: 0.6rem 0 0.8rem 0;">${badges.join('')}</div>` : '';
      };

      const resfriadaGlow = resfriadaAlerts.hasExpired || resfriadaAlerts.hasToday ? '#ef4444' : resfriadaAlerts.hasAtencao ? '#f59e0b' : '#38bdf8';
      const congeladaGlow = congeladaAlerts.hasExpired || congeladaAlerts.hasToday ? '#ef4444' : congeladaAlerts.hasAtencao ? '#f59e0b' : '#818cf8';

      // Gerar cards das 4 colunas da Resfriada
      const resfriadaColsCards = Array.from({ length: 4 }, (_, i) => {
        return this.renderColumnCard('Câmara Resfriada', i + 1, 4, '#38bdf8', 'Resfriada');
      }).join('');

      // Gerar cards das 16 colunas da Congelada
      const congeladaColsCards = Array.from({ length: 16 }, (_, i) => {
        return this.renderColumnCard('Câmara Congelada', i + 1, 16, '#f59e0b', 'Congelada');
      }).join('');

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
              <h2 class="panel-title">❄️ Mapa das Câmaras Frias</h2>
              <p class="panel-subtitle">Visualização e alocação de paletes em tempo real — Todos os setores</p>
            </div>
          </div>

          <!-- Cards de Resumo das Câmaras -->
          <div class="chambers-grid-container" style="margin-bottom: 2.5rem;">
            <div class="chambers-side-by-side">
              <!-- Câmara Resfriada -->
              <div class="chamber-card-outer chamber-resfriada ${resfriadaAlerts.hasCritical ? 'freezer-card--critical' : resfriadaAlerts.hasAtencao ? 'freezer-card--warning' : ''}" id="card-chamber-resfriada" style="cursor: pointer;">
                <div class="chamber-card-header-glow" style="background: ${resfriadaGlow};"></div>
                <div class="chamber-card-body" style="padding: 1.5rem;">
                  <div class="chamber-badge-container">
                    <span class="chamber-type-badge" style="color: #38bdf8; background-color: rgba(56, 189, 248, 0.15)">
                      ${this.icons.Snowflake}
                      Resfriada
                    </span>
                    <div class="chamber-temp-indicator" style="color: #38bdf8; display: flex; align-items: center; gap: 4px;">
                      ${this.icons.Thermometer}
                      <span>2.5 °C</span>
                    </div>
                  </div>

                  <h2 class="chamber-card-name" style="color: #38bdf8; font-weight: 800; font-size: 1.4rem;">Câmara Resfriada</h2>
                  <p class="chamber-card-desc" style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.6rem;">Destinada a carnes resfriadas, laticínios, frios e perecíveis (4 Colunas / 32 Paletes).</p>

                  ${buildChamberAlertBadges(resfriadaAlerts)}

                  <div class="chamber-capacity-info">
                    <div class="capacity-labels">
                      <span style="font-weight: 600;">Ocupação</span>
                      <span class="capacity-fraction" style="font-weight: 700; color: #38bdf8;">${resfriadaOccupied} / ${resfriadaCapacity} Paletes</span>
                    </div>
                    <div class="capacity-bar-bg" style="background: rgba(255,255,255,0.08); border-radius: 6px; height: 8px; overflow: hidden; margin: 6px 0;">
                      <div class="capacity-bar-fill" style="width: ${resfriadaPercent}%; height: 100%; background: linear-gradient(90deg, #38bdf8, #0284c7); border-radius: 6px;"></div>
                    </div>
                    <div class="capacity-percentage-label" style="display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--text-tertiary);">
                      <span>${resfriadaPercent}% capacidade utilizada</span>
                      <span>4 Racks Verticais</span>
                    </div>
                  </div>

                  <div class="chamber-card-footer" style="margin-top: 1rem;">
                    <span class="enter-text" style="color: #38bdf8; font-weight: 700;">Ver Racks Resfriada</span>
                    ${this.icons.ChevronRight}
                  </div>
                </div>
              </div>

              <!-- Câmara Congelada -->
              <div class="chamber-card-outer chamber-congelada ${congeladaAlerts.hasCritical ? 'freezer-card--critical' : congeladaAlerts.hasAtencao ? 'freezer-card--warning' : ''}" id="card-chamber-congelada" style="cursor: pointer;">
                <div class="chamber-card-header-glow" style="background: ${congeladaGlow};"></div>
                <div class="chamber-card-body" style="padding: 1.5rem;">
                  <div class="chamber-badge-container">
                    <span class="chamber-type-badge" style="color: #818cf8; background-color: rgba(129, 140, 248, 0.15)">
                      ${this.icons.Warehouse}
                      Congelada
                    </span>
                    <div class="chamber-temp-indicator" style="color: #818cf8; display: flex; align-items: center; gap: 4px;">
                      ${this.icons.Thermometer}
                      <span>-18.5 °C</span>
                    </div>
                  </div>

                  <h2 class="chamber-card-name" style="color: #818cf8; font-weight: 800; font-size: 1.4rem;">Câmara Congelada</h2>
                  <p class="chamber-card-desc" style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.6rem;">Destinada a carnes congeladas, aves, pescados e congelados em geral (16 Colunas / 128 Paletes).</p>

                  ${buildChamberAlertBadges(congeladaAlerts)}

                  <div class="chamber-capacity-info">
                    <div class="capacity-labels">
                      <span style="font-weight: 600;">Ocupação</span>
                      <span class="capacity-fraction" style="font-weight: 700; color: #818cf8;">${congeladaOccupied} / ${congeladaCapacity} Paletes</span>
                    </div>
                    <div class="capacity-bar-bg" style="background: rgba(255,255,255,0.08); border-radius: 6px; height: 8px; overflow: hidden; margin: 6px 0;">
                      <div class="capacity-bar-fill" style="width: ${congeladaPercent}%; height: 100%; background: linear-gradient(90deg, #818cf8, #6366f1); border-radius: 6px;"></div>
                    </div>
                    <div class="capacity-percentage-label" style="display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--text-tertiary);">
                      <span>${congeladaPercent}% capacidade utilizada</span>
                      <span>16 Racks Verticais</span>
                    </div>
                  </div>

                  <div class="chamber-card-footer" style="margin-top: 1rem;">
                    <span class="enter-text" style="color: #818cf8; font-weight: 700;">Ver Racks Congelada</span>
                    ${this.icons.ChevronRight}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Seção 1: Colunas da Câmara Resfriada -->
          <div style="margin-bottom: 2.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.2rem; padding-bottom: 0.6rem; border-bottom: 2px solid rgba(56,189,248,0.35);">
              <div>
                <h3 style="font-size: 1.2rem; font-weight: 800; color: #38bdf8; margin: 0; display: flex; align-items: center; gap: 8px;">
                  <span>❄️</span> Câmara Resfriada — 4 Colunas (Racks)
                </h3>
                <p style="font-size: 0.82rem; color: var(--text-secondary); margin: 3px 0 0 0;">Cada coluna possui 4 níveis de altura e 2 paletes por nível (8 posições por rack)</p>
              </div>
              <span style="font-size: 0.78rem; font-weight: 700; color: #38bdf8; background: rgba(56,189,248,0.12); padding: 4px 10px; border-radius: 6px;">4 Colunas</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(235px, 1fr)); gap: 1.5rem;">
              ${resfriadaColsCards}
            </div>
          </div>

          <!-- Seção 2: Colunas da Câmara Congelada -->
          <div style="margin-bottom: 2.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.2rem; padding-bottom: 0.6rem; border-bottom: 2px solid rgba(245,158,11,0.35);">
              <div>
                <h3 style="font-size: 1.2rem; font-weight: 800; color: #f59e0b; margin: 0; display: flex; align-items: center; gap: 8px;">
                  <span>🥶</span> Câmara Congelada — 16 Colunas (Racks)
                </h3>
                <p style="font-size: 0.82rem; color: var(--text-secondary); margin: 3px 0 0 0;">Cada coluna possui 4 níveis de altura e 2 paletes por nível (8 posições por rack)</p>
              </div>
              <span style="font-size: 0.78rem; font-weight: 700; color: #f59e0b; background: rgba(245,158,11,0.12); padding: 4px 10px; border-radius: 6px;">16 Colunas</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(235px, 1fr)); gap: 1.5rem;">
              ${congeladaColsCards}
            </div>
          </div>

          <!-- Diretório de Paletes Alocados -->
          ${this.buildDirectoryHTML(allProducts)}

          <!-- Caixa Explicativa -->
          <div class="chambers-quick-info" style="margin-top: 1.5rem;">
            <div class="info-card" style="display: flex; gap: 1rem; padding: 1.25rem; background: var(--bg-card); border: 1px solid var(--glass-border); border-radius: var(--r-lg);">
              <div class="info-icon-wrapper" style="color: #38bdf8; font-size: 1.5rem; flex-shrink: 0; margin-top: 2px;">
                💡
              </div>
              <div>
                <h4 style="font-weight: 700; margin-bottom: 4px; color: var(--text-primary); font-size: 0.95rem;">Como funciona o mapa WMS das Câmaras Frias?</h4>
                <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5; margin: 0;">
                  A Câmara Resfriada possui <strong>4 Colunas</strong> e a Câmara Congelada possui <strong>16 Colunas</strong>. Cada coluna é um Rack vertical com <strong>4 níveis de altura</strong> (Nível 1 Piso e Níveis 2, 3 e 4 Aéreos) e <strong>2 paletes por nível (Esquerda e Direita)</strong>.
                  Clique em qualquer coluna acima para visualizar a estrutura detalhada e alocar ou retirar paletes.
                </p>
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
        this.filterColumn = 'all';
        this.filterScheduleDay = 'all';
        this.render(this.container);
      });
    }

    // Clique no Card da Câmara Congelada
    const congeladaCard = this.container.querySelector('#card-chamber-congelada');
    if (congeladaCard) {
      congeladaCard.addEventListener('click', () => {
        this.selectedChamber = 'Câmara Congelada';
        this.selectedColumn = null;
        this.filterColumn = 'all';
        this.filterScheduleDay = 'all';
        this.render(this.container);
      });
    }

    // Voltar para Câmaras (Visão Geral)
    const backToChambersBtn = this.container.querySelector('#btn-back-to-chambers');
    if (backToChambersBtn) {
      backToChambersBtn.addEventListener('click', () => {
        this.selectedChamber = null;
        this.selectedColumn = null;
        this.filterColumn = 'all';
        this.filterScheduleDay = 'all';
        this.render(this.container);
      });
    }

    // Voltar para Grid de Colunas / Visão Geral
    const backToColumnsBtn = this.container.querySelector('#btn-back-to-columns');
    if (backToColumnsBtn) {
      backToColumnsBtn.addEventListener('click', () => {
        this.selectedColumn = null;
        this.render(this.container);
      });
    }

    // Clique no Card de uma Coluna (no Grid ou na Visão Geral)
    this.container.querySelectorAll('[data-action="view-column"]').forEach(card => {
      card.addEventListener('click', () => {
        if (card.dataset.chamber) {
          this.selectedChamber = card.dataset.chamber;
        }
        this.selectedColumn = parseInt(card.dataset.col, 10);
        this.render(this.container);
      });
    });

    // Schedule Day Tabs Click (Câmara Congelada)
    this.container.querySelectorAll('#chamber-sched-day-tabs .cat-tab[data-sched-day]').forEach(el => {
      el.addEventListener('click', (e) => {
        this.filterScheduleDay = e.currentTarget.dataset.schedDay;
        this.filterColumn = 'all';
        this.render(this.container);
      });
    });

    // Filtro de Colunas: Dropdown Select
    const colFilterSelect = this.container.querySelector('#chamber-col-filter-select');
    if (colFilterSelect) {
      colFilterSelect.addEventListener('change', (e) => {
        this.filterColumn = e.target.value;
        if (this.filterColumn !== 'all' && !['alerts', 'occupied', 'empty'].includes(this.filterColumn)) {
          this.filterScheduleDay = 'all';
        }
        this.render(this.container);
      });
    }

    // Filtro de Colunas: Chips / Botões de Coluna
    this.container.querySelectorAll('#chamber-col-chips [data-col-filter]').forEach(el => {
      el.addEventListener('click', (e) => {
        this.filterColumn = e.currentTarget.dataset.colFilter;
        if (this.filterColumn !== 'all' && !['alerts', 'occupied', 'empty'].includes(this.filterColumn)) {
          this.filterScheduleDay = 'all';
        }
        this.render(this.container);
      });
    });

    // Botões de Limpar Filtros
    const resetFiltersBtn = this.container.querySelector('#btn-reset-chamber-filters');
    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener('click', () => {
        this.filterColumn = 'all';
        this.filterScheduleDay = 'all';
        this.render(this.container);
      });
    }
    const resetEmptyBtn = this.container.querySelector('#btn-reset-filters-empty');
    if (resetEmptyBtn) {
      resetEmptyBtn.addEventListener('click', () => {
        this.filterColumn = 'all';
        this.filterScheduleDay = 'all';
        this.render(this.container);
      });
    }

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

    // Botão Adicionar Novo Produto no Header da Tabela da Coluna
    const addColProdBtn = this.container.querySelector('#btn-open-add-new-chamber-col');
    if (addColProdBtn) {
      addColProdBtn.addEventListener('click', () => {
        this.openAddNewProductModal(this.selectedColumn, 1, 'esquerda');
      });
    }

    // Gerar Crachá na Tabela da Coluna
    this.container.querySelectorAll('[data-action="cracha-product-col-table"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const prodId = parseInt(btn.dataset.id, 10);
        window.BrigadaUI.generateCrachaFromProduct(prodId);
      });
    });

    // Editar Produto na Tabela da Coluna
    this.container.querySelectorAll('[data-action="edit-product-col-table"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const prodId = parseInt(btn.dataset.id, 10);
        const col = parseInt(btn.dataset.col, 10) || this.selectedColumn;
        const lvl = parseInt(btn.dataset.lvl, 10) || 1;
        const pos = btn.dataset.pos || 'esquerda';
        this.openEditProductModal(prodId, col, lvl, pos);
      });
    });

    // Excluir Produto Permanentemente na Tabela da Coluna
    this.container.querySelectorAll('[data-action="delete-product-col-table"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const prodId = parseInt(btn.dataset.id, 10);
        this.deleteProductPermanently(prodId);
      });
    });

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
        const level = parseInt(btn.dataset.lvl, 10);
        const position = btn.dataset.pos;
        const colNum = parseInt(btn.dataset.col, 10) || this.selectedColumn;
        this.openAddNewProductModal(colNum, level, position);
      });
    });

    // Trigger de Alocação em Slot Vazio (Catálogo)
    this.container.querySelectorAll('[data-action="allocate-trigger"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.allocatingSlot = {
          level: parseInt(el.dataset.level, 10),
          position: el.dataset.pos
        };
        this.selectedCategoryFilter = null;
        this.searchAvailable = '';
        this.openAllocationModal();
      });
    });

    // Trigger de Adição Direta de Novo Produto em Slot Vazio
    this.container.querySelectorAll('[data-action="add-new-trigger"]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const level = parseInt(el.dataset.level, 10);
        const position = el.dataset.pos;
        this.openAddNewProductModal(this.selectedColumn, level, position);
      });
    });

    // Marcar Posição como Vazia
    this.container.querySelectorAll('[data-action="mark-slot-empty"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const level = parseInt(btn.dataset.level, 10);
        const pos = btn.dataset.pos;
        this.setSlotMarkedEmpty(this.selectedChamber, this.selectedColumn, level, pos, true);
        window.BrigadaUI?.showToast?.(`Posição ${pos === 'esquerda' ? 'Esquerda' : 'Direita'} (Nível ${level}) marcada como vazia.`, 'info');
        this.render(this.container);
      });
    });

    // Desmarcar Posição Vazia
    this.container.querySelectorAll('[data-action="unmark-slot-empty"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const level = parseInt(btn.dataset.level, 10);
        const pos = btn.dataset.pos;
        this.setSlotMarkedEmpty(this.selectedChamber, this.selectedColumn, level, pos, false);
        this.render(this.container);
      });
    });

    // Alerta de Posição Bloqueada (Regra: Esquerda primeiro)
    this.container.querySelectorAll('[data-action="locked-slot-alert"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.BrigadaUI?.showToast) {
          window.BrigadaUI.showToast('Regra de Alocação: Preencha primeiro o lado Esquerdo ou clique em "Deixar Vazio".', 'warning');
        } else {
          alert('Regra de Alocação: Preencha primeiro o lado Esquerdo ou clique em "Deixar Vazio" antes de adicionar à Direita.');
        }
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

            <div style="display: flex; align-items: center; gap: 6px;">
              <button class="btn btn-outline btn-sm" data-action="cracha-item-in-pallet" data-id="${p.id}" title="Gerar Crachá deste produto" style="padding: 4px 8px; color: #818cf8; border-color: rgba(99,102,241,0.35); font-size: 0.78rem; cursor: pointer; display: inline-flex; align-items: center; gap: 3px;">
                🏷️
              </button>
              <button class="btn btn-outline btn-sm" data-action="edit-item-in-pallet" data-id="${p.id}" title="Editar este produto" style="padding: 4px 8px; color: #38bdf8; border-color: rgba(56,189,248,0.35); font-size: 0.78rem; cursor: pointer; display: inline-flex; align-items: center; gap: 3px;">
                ✏️
              </button>
              <button class="btn btn-outline btn-sm" data-action="delete-item-in-pallet" data-id="${p.id}" title="Excluir este produto permanentemente" style="padding: 4px 8px; color: #ef4444; border-color: rgba(239,68,68,0.3); font-size: 0.78rem; cursor: pointer;">
                🗑️
              </button>
            </div>
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
          <div style="display: flex; justify-content: flex-end; align-items: center; border-top: 1px solid var(--border-color); padding-top: 1rem; flex-wrap: wrap; gap: 8px;">
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
      this.openAddNewProductModal(col, lvl, pos);
    });

    // Editar Item do Palete
    overlay.querySelectorAll('[data-action="cracha-item-in-pallet"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const prodId = parseInt(btn.dataset.id, 10);
        window.BrigadaUI.generateCrachaFromProduct(prodId);
      });
    });

    overlay.querySelectorAll('[data-action="edit-item-in-pallet"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const prodId = parseInt(btn.dataset.id, 10);
        this.openEditProductModal(prodId, col, lvl, pos);
      });
    });



    // Remover Item Individual do Palete (Desalocar)
    // Excluir Item Permanentemente
    overlay.querySelectorAll('[data-action="delete-item-in-pallet"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const prodId = parseInt(btn.dataset.id, 10);
        await this.deleteProductPermanently(prodId);
      });
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
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center;">
          <h3 class="modal-title">${existingProdsInSlot.length > 0 ? 'Adicionar Item ao Palete' : 'Alocar Palete na Posição'}</h3>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button type="button" class="btn btn--outline btn-sm" id="btn-switch-to-add-new-prod" style="font-size: 0.78rem; display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-color: rgba(16,185,129,0.4); color: #10b981;">
              <span>➕</span> Novo Produto Manual
            </button>
            <button class="modal-close" id="alloc-modal-close">✕</button>
          </div>
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

    const switchBtn = overlay.querySelector('#btn-switch-to-add-new-prod');
    if (switchBtn) {
      switchBtn.addEventListener('click', () => {
        this.openAddNewProductModal(col, lvl, pos);
      });
    }

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
        // Máscara de data manual DD/MM/AAAA
        const allocDateField = modalEl.querySelector('#alloc-field-enddate');
        if (window.BrigadaData?.applyDateMask && allocDateField) {
          window.BrigadaData.applyDateMask(allocDateField);
        }

        submitBtn.addEventListener('click', async () => {
          const rawEndDate = modalEl.querySelector('#alloc-field-enddate')?.value.trim();
          const qtyVal = modalEl.querySelector('#alloc-field-quantity')?.value;
          const unitVal = modalEl.querySelector('#alloc-field-unit')?.value;
          const supplierVal = modalEl.querySelector('#alloc-field-supplier')?.value;

          const parsedEndDate = window.BrigadaData.parseDateInput(rawEndDate);
          if (!parsedEndDate) {
            window.BrigadaUI.showToast('Data de validade inválida. Digite no formato DD/MM/AAAA (ex: 25/12/2026).', 'warning');
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
              endDate: parsedEndDate,
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
    const defaultSupplier = product.supplier || (window.BrigadaData ? window.BrigadaData.detectSupplierFromName(product.name) : '') || '';
    
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
          <label style="display: block; font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">Data de Validade (DD/MM/AAAA) *</label>
          <input type="text" id="alloc-field-enddate" class="form-input" placeholder="DD/MM/AAAA" inputmode="numeric" maxlength="10" required style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-tertiary);" />
        </div>

        <div class="form-group">
          <label style="display: block; font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">Fornecedor / Marca</label>
          <input type="text" id="alloc-field-supplier" class="form-input" value="${defaultSupplier}" placeholder="Ex: Friboi, Seara, Sadia..." style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-tertiary);" />
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

  // ── Exclusão Permanente de Produto ──
  async deleteProductPermanently(productId) {
    const p = (window.BrigadaData.products || []).find(item => item.id === productId);
    const prodName = p ? p.name : 'este produto';
    const prodPlu = p ? ` (PLU: ${p.plu})` : '';
    if (confirm(`Tem certeza que deseja EXCLUIR permanentemente ${prodName}${prodPlu} do sistema?\n\nEsta ação não poderá ser desfeita.`)) {
      try {
        await window.BrigadaData.deleteProduct(productId, {
          annotation: 'Excluído diretamente pelo mapa de Câmaras Frias',
          editor: window.BrigadaAuth?.currentUser?.name || 'Sistema'
        });
        window.BrigadaUI.showToast('Produto excluído com sucesso!', 'success');
        this.closeModal('pallet-details-modal');
        this.render(this.container);
      } catch (err) {
        window.BrigadaUI.showToast('Erro ao excluir produto: ' + err.message, 'error');
      }
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

  // ── Modal de Cadastro Inteligente por Catálogo de Novo Produto na Posição ──
  openAddNewProductModal(col, lvl, pos) {
    this.closeModal('add-product-chamber-modal');
    this.closeModal('allocation-modal');

    const isResfriada = this.selectedChamber === 'Câmara Resfriada';
    const chamberIcon = isResfriada ? '❄️' : '🥶';
    const chamberId = isResfriada ? 'resfriado' : 'congelado';
    const today = new Date().toISOString().split('T')[0];

    const allowedCats = window.BrigadaAuth.getAllowedCategoriesForUser(this.selectedChamber);
    const catOptions = [
      { val: 'aves', label: '🐔 Aves' },
      { val: 'bovino', label: '🐮 Bovino' },
      { val: 'suino', label: '🐷 Suíno' },
      { val: 'pescado', label: '🐟 Pescado' },
      { val: 'frios', label: '🥓 Frios' },
      { val: 'laticinios', label: '🧀 Laticínios' },
      { val: 'iogurtes', label: '🥛 Iogurtes' },
      { val: 'pereciveis', label: '🥗 Perecíveis' }
    ].filter(opt => allowedCats.length === 0 || allowedCats.includes(opt.val));

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay modal-overlay--visible';
    overlay.id = 'add-product-chamber-modal';

    let currentCatFilter = 'all';
    let currentSearch = '';

    overlay.innerHTML = `
      <div class="modal" style="max-width: 580px; width: 92%; transform: translateY(0); margin-top: 3vh;">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding: 1rem 1.5rem;">
          <h3 class="modal-title" id="chamber-modal-title" style="margin: 0; font-size: 1.15rem; font-weight: 700; display: flex; align-items: center; gap: 8px;">
            <span>${chamberIcon}</span>
            <span>Novo Produto — ${this.selectedChamber}</span>
          </h3>
          <button class="modal-close" id="modal-close-add-chamber" style="background: none; border: none; font-size: 1.25rem; color: var(--text-secondary); cursor: pointer;">✕</button>
        </div>

        <div class="modal-body" style="padding: 1.25rem 1.5rem;">
          <!-- ETAPA 1: Seleção Inteligente por Catálogo -->
          <div id="chamber-modal-step-catalog">
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 0; margin-bottom: 12px;">
              Selecione o produto do catálogo abaixo para preenchimento ágil:
            </p>

            <div class="search-box" style="width: 100%; margin-bottom: 0.75rem; display: flex; align-items: center; position: relative;">
              <span class="search-icon" style="position: absolute; left: 12px; color: var(--text-secondary);">🔍</span>
              <input type="text" id="chamber-catalog-search" class="search-input" placeholder="Buscar por produto ou PLU..." autocomplete="off" style="width: 100%; padding: 9px 40px 9px 36px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-tertiary);" />
              <button type="button" id="chamber-catalog-voice-btn" class="search-mic-btn" style="position: absolute; right: 10px; background:none; border:none; color:var(--text-secondary); cursor:pointer; font-size: 1rem;" title="Buscar por voz">🎙️</button>
            </div>

            <div class="cat-quick-tabs" id="chamber-catalog-tabs" style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;">
              <button type="button" class="cat-tab cat-tab--sm cat-tab--active" data-cat="all" style="cursor: pointer;">Todos</button>
              ${catOptions.map(c => `
                <button type="button" class="cat-tab cat-tab--sm" data-cat="${c.val}" style="cursor: pointer;">${c.label}</button>
              `).join('')}
            </div>

            <div class="table-scroll" style="max-height: 260px; overflow-y: auto; margin-bottom: 1rem; border: 1px solid var(--border-color); border-radius: 8px;">
              <table class="data-table" style="margin: 0; width: 100%;">
                <thead>
                  <tr>
                    <th style="width: 75px; text-transform: uppercase; font-size: 0.75rem;">PLU</th>
                    <th style="text-transform: uppercase; font-size: 0.75rem;">PRODUTO</th>
                    <th style="width: 95px; text-align: right; text-transform: uppercase; font-size: 0.75rem;">AÇÃO</th>
                  </tr>
                </thead>
                <tbody id="chamber-catalog-tbody">
                  <!-- Gerado dinamicamente -->
                </tbody>
              </table>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 10px;">
              <span id="chamber-catalog-count" style="font-size: 0.8rem; color: var(--text-secondary);">0 produtos disponíveis</span>
              <button type="button" class="btn btn--outline btn--sm" id="btn-switch-manual-chamber" style="font-weight: 600; cursor: pointer; border-radius: 6px;">
                ✍️ Preenchimento Manual
              </button>
            </div>
          </div>

          <!-- ETAPA 2: Formulário de Preenchimento do Lote / Alocação -->
          <div id="chamber-modal-step-form" style="display: none;">
            <!-- Card do Produto Selecionado -->
            <div id="chamber-selected-catalog-card" style="display: none; background: rgba(56,189,248,0.08); border: 1px solid rgba(56,189,248,0.25); border-radius: 8px; padding: 10px 14px; margin-bottom: 1rem; align-items: center; justify-content: space-between;">
              <div>
                <div id="chamber-selected-name" style="font-weight: 700; font-size: 0.98rem; color: var(--text-primary);">Nome do Produto</div>
                <div style="display: flex; gap: 8px; font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">
                  <span>PLU: <b id="chamber-selected-plu" style="color: #38bdf8;">000000</b></span>
                  <span>•</span>
                  <span>Categoria: <b id="chamber-selected-cat">Aves</b></span>
                </div>
              </div>
              <button type="button" class="btn btn--ghost btn--sm" id="btn-back-to-chamber-catalog" style="font-size: 0.78rem; padding: 4px 8px; color: #38bdf8; cursor: pointer;">
                ← Trocar Produto
              </button>
            </div>

            <form id="form-add-chamber-prod" style="display: flex; flex-direction: column; gap: 1rem;">
              <!-- Campos Manuais (somente se clicou em Preenchimento Manual) -->
              <div id="chamber-manual-fields-row" style="display: none;">
                <div class="form-group" style="margin-bottom: 10px;">
                  <label style="display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">
                    Código PLU / EAN *
                  </label>
                  <input type="text" id="add-chamber-plu" class="form-input" placeholder="Ex: 52629" autocomplete="off" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-tertiary);" />
                </div>
                <div class="form-group" style="margin-bottom: 10px;">
                  <label style="display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">
                    Nome do Produto *
                  </label>
                  <input type="text" id="add-chamber-name" class="form-input" placeholder="Ex: ASA DE FGO FORMOSO CONG" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-tertiary);" />
                </div>
              </div>

              <!-- Destino / Posição de Armazenagem & Tipo do Palete -->
              <div style="background: rgba(56, 189, 248, 0.06); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 10px;">
                <div style="font-size: 0.82rem; color: #38bdf8; font-weight: 700; display: flex; align-items: center; gap: 6px;">
                  <span>📍 Local de Alocação:</span>
                  <span>${chamberIcon} ${this.selectedChamber} • Coluna ${col.toString().padStart(2, '0')}</span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                  <div class="form-group">
                    <label style="display: block; font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">
                      Nível de Armazenagem *
                    </label>
                    <select id="add-chamber-level" class="form-input" style="width: 100%; padding: 7px 10px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-tertiary);">
                      <option value="1" ${lvl === 1 ? 'selected' : ''}>📦 Nível 1 — Piso (Chão)</option>
                      <option value="2" ${lvl === 2 ? 'selected' : ''}>🏗️ Nível 2 — Aéreo</option>
                      <option value="3" ${lvl === 3 ? 'selected' : ''}>🏗️ Nível 3 — Aéreo</option>
                      <option value="4" ${lvl === 4 ? 'selected' : ''}>🏗️ Nível 4 — Aéreo (Topo)</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label style="display: block; font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">
                      Posição / Lado *
                    </label>
                    <select id="add-chamber-position" class="form-input" style="width: 100%; padding: 7px 10px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-tertiary);">
                      <option value="esquerda" ${pos === 'esquerda' ? 'selected' : ''}>⬅️ Lado Esquerdo (E)</option>
                      <option value="direita" ${pos === 'direita' ? 'selected' : ''}>➡️ Lado Direito (D)</option>
                    </select>
                  </div>
                </div>

                <!-- Tipo do Palete (Full ou Misto) -->
                <div class="form-group" style="margin-top: 2px;">
                  <label style="display: block; font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px;">
                    Estrutura / Tipo do Palete *
                  </label>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <label style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(56, 189, 248, 0.35); background: rgba(56, 189, 248, 0.1); cursor: pointer; font-size: 0.85rem; font-weight: 700; color: var(--text-primary); transition: all 0.2s;">
                      <input type="radio" name="add-chamber-pallet-type" value="full" checked style="cursor: pointer;" />
                      <span>📦 Palete Full</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(168, 85, 247, 0.35); background: rgba(168, 85, 247, 0.1); cursor: pointer; font-size: 0.85rem; font-weight: 700; color: var(--text-primary); transition: all 0.2s;">
                      <input type="radio" name="add-chamber-pallet-type" value="misto" style="cursor: pointer;" />
                      <span>🔀 Palete Misto</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Categoria e Unidade -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                  <label style="display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">
                    Categoria *
                  </label>
                  <select id="add-chamber-category" class="form-input" required style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-tertiary);">
                    ${catOptions.map(o => `<option value="${o.val}">${o.label}</option>`).join('')}
                  </select>
                </div>

                <div class="form-group">
                  <label style="display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">
                    Unidade
                  </label>
                  <select id="add-chamber-unit" class="form-input" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-tertiary);">
                    <option value="kg" selected>kg</option>
                    <option value="un">un</option>
                    <option value="cx">cx</option>
                    <option value="pct">pct</option>
                  </select>
                </div>
              </div>

              <!-- Quantidade e Validade -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                  <label style="display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">
                    Quantidade *
                  </label>
                  <input type="number" id="add-chamber-quantity" class="form-input" value="1" min="0.1" step="any" required style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-tertiary);" />
                </div>

                <div class="form-group">
                  <label style="display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">
                    Data de Validade (DD/MM/AAAA) *
                  </label>
                  <input type="text" id="add-chamber-enddate" class="form-input" placeholder="DD/MM/AAAA" inputmode="numeric" maxlength="10" required style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-tertiary);" />
                </div>
              </div>

              <!-- Fornecedor / Marca -->
              <div class="form-group">
                <label style="display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">
                  Fornecedor / Marca
                </label>
                <input type="text" id="add-chamber-supplier" class="form-input" placeholder="Ex: Friboi, Seara, Sadia, Perdigão..." style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-tertiary);" />
              </div>

              <!-- Botões de Ação -->
              <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; border-top: 1px solid var(--border-color); padding-top: 14px;">
                <button type="button" class="btn btn--outline" id="btn-cancel-add-chamber" style="padding: 8px 16px; cursor: pointer;">
                  Cancelar
                </button>
                <button type="submit" class="btn btn--primary" id="btn-submit-add-chamber" style="padding: 8px 20px; font-weight: 700; background-color: #10b981; border-color: #10b981; color: white; cursor: pointer;">
                  ✓ Cadastrar e Alocar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Aplica máscara de data manual DD/MM/AAAA
    const endDateInput = overlay.querySelector('#add-chamber-enddate');
    if (window.BrigadaData?.applyDateMask && endDateInput) {
      window.BrigadaData.applyDateMask(endDateInput);
    }

    const close = () => this.closeModal('add-product-chamber-modal');
    overlay.querySelector('#modal-close-add-chamber').addEventListener('click', close);
    overlay.querySelector('#btn-cancel-add-chamber').addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target.id === 'add-product-chamber-modal') close();
    });

    // Renderização do Catálogo
    const renderCatalogList = () => {
      const tbody = overlay.querySelector('#chamber-catalog-tbody');
      const countEl = overlay.querySelector('#chamber-catalog-count');
      if (!tbody) return;

      const rawCatalog = window.BrigadaData?.catalog || [];
      const normalize = str => (str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const q = normalize(currentSearch);

      const filtered = rawCatalog.filter(p => {
        const pCat = normalize(p.category);
        if (allowedCats.length > 0) {
          const isAllowed = allowedCats.some(ac => pCat.includes(normalize(ac)) || normalize(ac).includes(pCat));
          if (!isAllowed) return false;
        }

        if (currentCatFilter !== 'all') {
          if (!pCat.includes(normalize(currentCatFilter)) && !normalize(currentCatFilter).includes(pCat)) return false;
        }

        if (q) {
          const full = `${normalize(p.name)} ${normalize(String(p.plu || ''))} ${normalize(p.barcode || '')}`;
          return q.split(/\s+/).every(t => full.includes(t));
        }
        return true;
      });

      if (countEl) {
        countEl.textContent = `${filtered.length} ${filtered.length === 1 ? 'produto disponível' : 'produtos disponíveis'}`;
      }

      if (filtered.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="3" style="text-align: center; padding: 2rem; color: var(--text-tertiary);">
              Nenhum produto encontrado no catálogo do setor.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = filtered.slice(0, 80).map(p => {
        const catName = this.catMap[(p.category || '').toLowerCase()] || p.category || 'Geral';
        return `
          <tr>
            <td style="font-family: monospace; font-weight: 700; color: #38bdf8; vertical-align: middle; padding: 8px 12px;">${p.plu || '—'}</td>
            <td style="vertical-align: middle; padding: 8px 12px;">
              <div style="font-weight: 700; color: var(--text-primary); font-size: 0.9rem;">${p.name}</div>
              <div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 1px;">${catName}</div>
            </td>
            <td style="text-align: right; vertical-align: middle; padding: 8px 12px;">
              <button type="button" class="btn btn--primary btn--sm" data-action="select-chamber-cat-item" data-plu="${p.plu || ''}" data-name="${(p.name || '').replace(/"/g, '&quot;')}" data-cat="${p.category || ''}" data-unit="${p.unit || 'kg'}" data-supplier="${(p.supplier || '').replace(/"/g, '&quot;')}" style="padding: 5px 14px; font-weight: 600; cursor: pointer; border-radius: 6px; background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4);">
                Selecionar
              </button>
            </td>
          </tr>
        `;
      }).join('');

      tbody.querySelectorAll('[data-action="select-chamber-cat-item"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const plu = btn.dataset.plu;
          const name = btn.dataset.name;
          const cat = btn.dataset.cat;
          const unit = btn.dataset.unit;
          const supplier = btn.dataset.supplier || (window.BrigadaData?.detectSupplierFromName ? window.BrigadaData.detectSupplierFromName(name) : '');

          overlay.querySelector('#add-chamber-plu').value = plu;
          overlay.querySelector('#add-chamber-name').value = name;
          if (cat && overlay.querySelector(`#add-chamber-category option[value="${cat.toLowerCase()}"]`)) {
            overlay.querySelector('#add-chamber-category').value = cat.toLowerCase();
          }
          if (unit && overlay.querySelector(`#add-chamber-unit option[value="${unit.toLowerCase()}"]`)) {
            overlay.querySelector('#add-chamber-unit').value = unit.toLowerCase();
          }
          if (supplier) {
            overlay.querySelector('#add-chamber-supplier').value = supplier;
          }

          overlay.querySelector('#chamber-selected-name').textContent = name;
          overlay.querySelector('#chamber-selected-plu').textContent = plu || '—';
          overlay.querySelector('#chamber-selected-cat').textContent = this.catMap[(cat || '').toLowerCase()] || cat || 'Geral';
          overlay.querySelector('#chamber-selected-catalog-card').style.display = 'flex';
          overlay.querySelector('#chamber-manual-fields-row').style.display = 'none';

          overlay.querySelector('#chamber-modal-step-catalog').style.display = 'none';
          overlay.querySelector('#chamber-modal-step-form').style.display = 'block';

          overlay.querySelector('#add-chamber-enddate')?.focus();
        });
      });
    };

    // Inicializa catálogo
    renderCatalogList();

    // Busca no catálogo
    const searchInput = overlay.querySelector('#chamber-catalog-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        currentSearch = searchInput.value;
        renderCatalogList();
      });
    }

    // Abas de categoria
    overlay.querySelectorAll('#chamber-catalog-tabs .cat-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        overlay.querySelectorAll('#chamber-catalog-tabs .cat-tab').forEach(t => t.classList.remove('cat-tab--active'));
        tab.classList.add('cat-tab--active');
        currentCatFilter = tab.dataset.cat;
        renderCatalogList();
      });
    });

    // Busca por voz
    const voiceBtn = overlay.querySelector('#chamber-catalog-voice-btn');
    if (voiceBtn) {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        voiceBtn.style.display = 'none';
      } else {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recog = new SpeechRec();
        recog.lang = 'pt-BR';
        recog.continuous = false;
        recog.interimResults = false;

        recog.onstart = () => {
          voiceBtn.style.color = '#ef4444';
          voiceBtn.title = 'Ouvindo... Fale agora';
        };
        recog.onresult = (ev) => {
          const transcript = ev.results[0][0].transcript;
          if (searchInput) {
            searchInput.value = transcript;
            currentSearch = transcript;
            renderCatalogList();
          }
        };
        recog.onerror = recog.onend = () => {
          voiceBtn.style.color = 'var(--text-secondary)';
          voiceBtn.title = 'Buscar por voz';
        };

        voiceBtn.addEventListener('click', () => {
          try { recog.start(); } catch (e) { recog.stop(); }
        });
      }
    }

    // Preenchimento manual
    overlay.querySelector('#btn-switch-manual-chamber').addEventListener('click', () => {
      overlay.querySelector('#chamber-selected-catalog-card').style.display = 'none';
      overlay.querySelector('#chamber-manual-fields-row').style.display = 'block';
      overlay.querySelector('#add-chamber-plu').value = '';
      overlay.querySelector('#add-chamber-name').value = '';

      overlay.querySelector('#chamber-modal-step-catalog').style.display = 'none';
      overlay.querySelector('#chamber-modal-step-form').style.display = 'block';
      overlay.querySelector('#add-chamber-plu')?.focus();
    });

    // Trocar produto (voltar ao catálogo)
    overlay.querySelector('#btn-back-to-chamber-catalog').addEventListener('click', () => {
      overlay.querySelector('#chamber-modal-step-form').style.display = 'none';
      overlay.querySelector('#chamber-modal-step-catalog').style.display = 'block';
      renderCatalogList();
    });

    // Submissão do formulário
    const form = overlay.querySelector('#form-add-chamber-prod');
    const nameInput = overlay.querySelector('#add-chamber-name');
    const pluInput = overlay.querySelector('#add-chamber-plu');
    const catSelect = overlay.querySelector('#add-chamber-category');
    const unitSelect = overlay.querySelector('#add-chamber-unit');
    const supplierInput = overlay.querySelector('#add-chamber-supplier');

    // Auto-detect supplier on manual name blur
    nameInput.addEventListener('blur', () => {
      if (!supplierInput.value && nameInput.value && window.BrigadaData?.detectSupplierFromName) {
        const detected = window.BrigadaData.detectSupplierFromName(nameInput.value);
        if (detected) supplierInput.value = detected;
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameVal = nameInput.value.trim();
      const pluVal = pluInput.value.trim();
      const catVal = catSelect.value;
      const unitVal = unitSelect.value;
      const qtyVal = parseFloat(overlay.querySelector('#add-chamber-quantity').value) || 1;
      const rawEndVal = overlay.querySelector('#add-chamber-enddate').value.trim();
      const suppVal = supplierInput.value.trim();

      const parsedEndDate = window.BrigadaData.parseDateInput(rawEndVal);
      if (!parsedEndDate) {
        window.BrigadaUI.showToast('Data de validade inválida. Digite no formato DD/MM/AAAA (ex: 25/12/2026).', 'warning');
        return;
      }

      if (!nameVal) {
        window.BrigadaUI.showToast('Preencha o nome do produto.', 'warning');
        return;
      }

      const chosenLvl = parseInt(overlay.querySelector('#add-chamber-level')?.value, 10) || lvl || 1;
      const chosenPos = overlay.querySelector('#add-chamber-position')?.value || pos || 'esquerda';
      const chosenType = overlay.querySelector('input[name="add-chamber-pallet-type"]:checked')?.value || 'full';
      const locString = this.formatLocation(chamberId, col, chosenLvl, chosenPos, chosenType);
      window.BrigadaUI.showToast('Cadastrando e adicionando produto...', 'info');

      try {
        await window.BrigadaData.addProduct({
          name: nameVal,
          plu: pluVal || '000000',
          category: catVal,
          unit: unitVal,
          quantity: qtyVal,
          startDate: today,
          endDate: parsedEndDate,
          supplier: suppVal || null,
          location: locString
        });

        this.setSlotMarkedEmpty(this.selectedChamber, col, chosenLvl, chosenPos, false);
        window.BrigadaUI.showToast('Produto cadastrado e alocado com sucesso!', 'success');
        close();
        this.render(this.container);
      } catch (err) {
        console.error(err);
        window.BrigadaUI.showToast('Erro ao cadastrar produto: ' + err.message, 'error');
      }
    });
  },

  // ── Modal de Edição de Produto no Palete ──
  openEditProductModal(productId, col, lvl, pos) {
    const product = window.BrigadaData.products.find(p => p.id === productId);
    if (!product) {
      window.BrigadaUI.showToast('Produto não encontrado.', 'error');
      return;
    }

    this.closeModal('edit-product-chamber-modal');
    this.closeModal('pallet-details-modal');

    const isResfriada = this.selectedChamber === 'Câmara Resfriada';
    const chamberIcon = isResfriada ? '❄️' : '🥶';
    const posLabel = pos === 'esquerda' ? 'Esquerda (E)' : 'Direita (D)';
    const levelLabel = lvl === 1 ? '📦 Piso (Nível 1)' : `🏗️ Aéreo (Nível ${lvl})`;

    const allowedCats = window.BrigadaAuth.getAllowedCategoriesForUser(this.selectedChamber);
    const catOptions = [
      { val: 'aves', label: '🐔 Aves' },
      { val: 'bovino', label: '🐮 Bovino' },
      { val: 'suino', label: '🐷 Suíno' },
      { val: 'pescado', label: '🐟 Pescado' },
      { val: 'frios', label: '🥓 Frios' },
      { val: 'laticinios', label: '🧀 Laticínios' },
      { val: 'iogurtes', label: '🥛 Iogurtes' },
      { val: 'pereciveis', label: '🥗 Perecíveis' }
    ].filter(opt => allowedCats.length === 0 || allowedCats.includes(opt.val));

    const currentParsed = this.parseLocation(product.location);
    const currentPalletType = currentParsed?.palletType || 'full';
    const currentChamberKey = currentParsed?.chamberKey || (isResfriada ? 'resfriado' : 'congelado');
    const currentCol = currentParsed?.column || col || 1;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay modal-overlay--visible';
    overlay.id = 'edit-product-chamber-modal';

    overlay.innerHTML = `
      <div class="modal" style="max-width: 540px; width: 92%; transform: translateY(0); margin-top: 4vh;">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding: 1rem 1.5rem;">
          <div>
            <h3 class="modal-title" style="margin: 0; display: flex; align-items: center; gap: 8px;">
              <span>✏️ Editar Produto no Palete</span>
            </h3>
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">
              ${chamberIcon} ${this.selectedChamber} • Coluna ${col.toString().padStart(2, '0')} • ${levelLabel} • ${posLabel}
            </div>
          </div>
          <button class="modal-close" id="modal-close-edit-chamber">✕</button>
        </div>

        <div class="modal-body" style="padding: 1.25rem 1.5rem;">
          <form id="form-edit-chamber-prod" style="display: flex; flex-direction: column; gap: 12px;">
            
            <!-- Câmara e Coluna de Armazenagem -->
            <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: 12px;">
              <div class="form-group">
                <label style="display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">
                  Câmara <span style="color: #ef4444;">*</span>
                </label>
                <select id="edit-chamber-select" class="form-input" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-tertiary); font-weight: 600;">
                  <option value="congelado" ${currentChamberKey === 'congelado' ? 'selected' : ''}>🥶 Câmara Congelada</option>
                  <option value="resfriado" ${currentChamberKey === 'resfriado' ? 'selected' : ''}>❄️ Câmara Resfriada</option>
                  <option value="laticinios" ${currentChamberKey === 'laticinios' ? 'selected' : ''}>🧀 Câmara de Laticínios</option>
                  <option value="pereciveis" ${currentChamberKey === 'pereciveis' ? 'selected' : ''}>🥗 Câmara de Perecíveis</option>
                </select>
              </div>

              <div class="form-group">
                <label style="display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">
                  Coluna <span style="color: #ef4444;">*</span>
                </label>
                <select id="edit-chamber-column" class="form-input" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-tertiary);">
                </select>
              </div>
            </div>

            <!-- Nível e Posição (Lado) -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label style="display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">
                  Nível de Armazenagem <span style="color: #ef4444;">*</span>
                </label>
                <select id="edit-chamber-level" class="form-input" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-tertiary);">
                  <option value="1" ${lvl === 1 ? 'selected' : ''}>📦 Nível 1 — Piso (Chão)</option>
                  <option value="2" ${lvl === 2 ? 'selected' : ''}>🏗️ Nível 2 — Aéreo</option>
                  <option value="3" ${lvl === 3 ? 'selected' : ''}>🏗️ Nível 3 — Aéreo</option>
                  <option value="4" ${lvl === 4 ? 'selected' : ''}>🏗️ Nível 4 — Aéreo (Topo)</option>
                </select>
              </div>

              <div class="form-group">
                <label style="display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">
                  Posição / Lado <span style="color: #ef4444;">*</span>
                </label>
                <select id="edit-chamber-position" class="form-input" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-tertiary);">
                  <option value="esquerda" ${pos === 'esquerda' ? 'selected' : ''}>⬅️ Lado Esquerdo (E)</option>
                  <option value="direita" ${pos === 'direita' ? 'selected' : ''}>➡️ Lado Direito (D)</option>
                </select>
              </div>
            </div>

            <!-- Tipo do Palete (Full ou Misto) -->
            <div class="form-group">
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px;">
                Estrutura / Tipo do Palete *
              </label>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <label style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(56, 189, 248, 0.35); background: rgba(56, 189, 248, 0.1); cursor: pointer; font-size: 0.85rem; font-weight: 700; color: var(--text-primary);">
                  <input type="radio" name="edit-chamber-pallet-type" value="full" ${currentPalletType !== 'misto' ? 'checked' : ''} style="cursor: pointer;" />
                  <span>📦 Palete Full</span>
                </label>
                <label style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(168, 85, 247, 0.35); background: rgba(168, 85, 247, 0.1); cursor: pointer; font-size: 0.85rem; font-weight: 700; color: var(--text-primary);">
                  <input type="radio" name="edit-chamber-pallet-type" value="misto" ${currentPalletType === 'misto' ? 'checked' : ''} style="cursor: pointer;" />
                  <span>🔀 Palete Misto</span>
                </label>
              </div>
            </div>

            <!-- PLU e Sugestões -->
            <div class="form-group" style="position: relative;">
              <label style="display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">
                Código PLU / EAN
              </label>
              <input type="text" id="edit-chamber-plu" class="form-input" value="${product.plu || ''}" placeholder="Digite o PLU..." autocomplete="off" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-tertiary);" />
            </div>

            <!-- Nome do Produto -->
            <div class="form-group">
              <label style="display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">
                Nome do Produto <span style="color: #ef4444;">*</span>
              </label>
              <input type="text" id="edit-chamber-name" class="form-input" value="${product.name || ''}" placeholder="Nome do produto..." required style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-tertiary);" />
            </div>

            <!-- Categoria e Unidade -->
            <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 12px;">
              <div class="form-group">
                <label style="display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">
                  Categoria / Setor <span style="color: #ef4444;">*</span>
                </label>
                <select id="edit-chamber-category" class="form-input" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-tertiary);">
                  ${catOptions.map(c => `<option value="${c.val}" ${product.category === c.val ? 'selected' : ''}>${c.label}</option>`).join('')}
                </select>
              </div>

              <div class="form-group">
                <label style="display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">
                  Unidade <span style="color: #ef4444;">*</span>
                </label>
                <select id="edit-chamber-unit" class="form-input" style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-tertiary);">
                  <option value="kg" ${product.unit === 'kg' ? 'selected' : ''}>kg</option>
                  <option value="cx" ${product.unit === 'cx' ? 'selected' : ''}>cx</option>
                  <option value="un" ${product.unit === 'un' ? 'selected' : ''}>un</option>
                  <option value="pct" ${product.unit === 'pct' ? 'selected' : ''}>pct</option>
                </select>
              </div>
            </div>

            <!-- Quantidade e Validade -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label style="display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">
                  Quantidade <span style="color: #ef4444;">*</span>
                </label>
                <input type="number" id="edit-chamber-quantity" class="form-input" value="${product.quantity || 1}" min="0.01" step="any" required style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-tertiary);" />
              </div>

              <div class="form-group">
                <label style="display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">
                  Data de Validade (DD/MM/AAAA) <span style="color: #ef4444;">*</span>
                </label>
                <input type="text" id="edit-chamber-enddate" class="form-input" value="${window.BrigadaData.formatDate(product.endDate)}" placeholder="DD/MM/AAAA" inputmode="numeric" maxlength="10" required style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-tertiary);" />
              </div>
            </div>

            <!-- Fornecedor / Marca -->
            <div class="form-group">
              <label style="display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">
                Fornecedor / Marca
              </label>
              <input type="text" id="edit-chamber-supplier" class="form-input" value="${product.supplier || ''}" placeholder="Ex: Friboi, Seara, Sadia, Perdigão, Mauricéa..." style="width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-tertiary);" />
            </div>

            <!-- Botões de Ação -->
            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; border-top: 1px solid var(--border-color); padding-top: 14px;">
              <button type="button" class="btn btn--outline" id="btn-cancel-edit-chamber" style="padding: 8px 16px;">
                Cancelar
              </button>
              <button type="submit" class="btn btn--primary" id="btn-submit-edit-chamber" style="padding: 8px 20px; font-weight: 700; background: #38bdf8; border-color: #38bdf8; color: #0f172a;">
                ✓ Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const chamberSelect = overlay.querySelector('#edit-chamber-select');
    const colSelect = overlay.querySelector('#edit-chamber-column');

    const updateColOptions = () => {
      const selectedChamber = chamberSelect.value;
      const count = selectedChamber === 'congelado' ? 16 : 4;
      const prevVal = parseInt(colSelect.value, 10) || currentCol;
      colSelect.innerHTML = Array.from({ length: count }, (_, i) => {
        const cNum = i + 1;
        const pad = String(cNum).padStart(2, '0');
        const isSel = cNum === Math.min(prevVal, count);
        return `<option value="${cNum}" ${isSel ? 'selected' : ''}>Coluna ${pad}</option>`;
      }).join('');
    };

    updateColOptions();
    chamberSelect.addEventListener('change', updateColOptions);

    // Aplica máscara de data DD/MM/AAAA
    const endDateInput = overlay.querySelector('#edit-chamber-enddate');
    if (window.BrigadaData?.applyDateMask && endDateInput) {
      window.BrigadaData.applyDateMask(endDateInput);
    }

    const closeAndReturn = () => {
      overlay.remove();
      if (document.getElementById('pallet-details-modal')) {
        this.openPalletModal(col, lvl, pos);
      }
    };

    overlay.querySelector('#modal-close-edit-chamber').addEventListener('click', closeAndReturn);
    overlay.querySelector('#btn-cancel-edit-chamber').addEventListener('click', closeAndReturn);
    overlay.addEventListener('click', (e) => {
      if (e.target.id === 'edit-product-chamber-modal') closeAndReturn();
    });

    // Submissão da edição
    const form = overlay.querySelector('#form-edit-chamber-prod');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameVal = overlay.querySelector('#edit-chamber-name').value.trim();
      const pluVal = overlay.querySelector('#edit-chamber-plu').value.trim();
      const catVal = overlay.querySelector('#edit-chamber-category').value;
      const unitVal = overlay.querySelector('#edit-chamber-unit').value;
      const qtyVal = parseFloat(overlay.querySelector('#edit-chamber-quantity').value) || 1;
      const rawEndVal = overlay.querySelector('#edit-chamber-enddate').value.trim();
      const suppVal = overlay.querySelector('#edit-chamber-supplier').value.trim();

      const chosenChamber = chamberSelect.value;
      const chosenCol = parseInt(colSelect.value, 10) || 1;
      const chosenLvl = parseInt(overlay.querySelector('#edit-chamber-level')?.value, 10) || lvl || 1;
      const chosenPos = overlay.querySelector('#edit-chamber-position')?.value || pos || 'esquerda';
      const chosenType = overlay.querySelector('input[name="edit-chamber-pallet-type"]:checked')?.value || 'full';
      const newLoc = this.formatLocation(chosenChamber, chosenCol, chosenLvl, chosenPos, chosenType);
      const colLabel = chosenLvl === 1 ? 'Piso' : 'Aéreo';

      const parsedEndDate = window.BrigadaData.parseDateInput(rawEndVal);
      if (!parsedEndDate) {
        window.BrigadaUI.showToast('Data de validade inválida. Digite no formato DD/MM/AAAA (ex: 25/12/2026).', 'warning');
        return;
      }

      if (!nameVal) {
        window.BrigadaUI.showToast('Preencha o nome do produto.', 'warning');
        return;
      }

      window.BrigadaUI.showToast('Salvando alterações do produto...', 'info');

      try {
        await window.BrigadaData.updateProduct(productId, {
          name: nameVal,
          plu: pluVal || product.plu,
          category: catVal,
          unit: unitVal,
          quantity: qtyVal,
          endDate: parsedEndDate,
          supplier: suppVal || null,
          location: newLoc,
          column: colLabel,
          columnNumber: chosenCol
        });

        window.BrigadaUI.showToast('Produto atualizado com sucesso!', 'success');
        overlay.remove();
        if (document.getElementById('pallet-details-modal')) {
          this.openPalletModal(chosenCol, chosenLvl, chosenPos);
        }
        this.render(this.container);
      } catch (err) {
        console.error(err);
        window.BrigadaUI.showToast('Erro ao atualizar produto: ' + err.message, 'error');
      }
    });
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.remove();
    }
  }
};

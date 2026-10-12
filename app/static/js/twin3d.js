/**
 * BRIGADA-IA — Gêmeo Digital 3D
 *
 * Visualização espacial interativa (Piso de Loja + Câmaras Frias) com:
 *  - cores semafóricas de validade por freezer / palete,
 *  - trilho de alertas com "Ir para o problema" (câmera voa até o objeto),
 *  - drill-down contextual (painel lateral) e ações com um clique,
 *  - camadas: Validade · Verificar hoje · Rebaixa · Categoria.
 *
 * Os dados vêm de window.BrigadaData.products e as localizações reaproveitam
 * os formatos já usados pelos módulos existentes:
 *   Piso de Loja ........ piso_loja:FZ{n}
 *   Câmaras Frias ....... {resfriado|congelado}:C{col}-N{nivel}-{E|D}[:full|misto]
 *
 * O modelo de dados (buildModel) não depende do Three.js, que só é baixado
 * quando a página é aberta.
 */
(function () {
  'use strict';

  // ── Constantes ────────────────────────────────────────────────────────────
  const SEV = { EMPTY: -1, OK: 0, LONG: 1, WARN: 2, TODAY: 3, EXPIRED: 4 };

  const SEV_META = {
    [SEV.EMPTY]:   { color: '#475569', label: 'Vazio',             icon: '⚪' },
    [SEV.OK]:      { color: '#10b981', label: 'OK',                icon: '🟢' },
    [SEV.LONG]:    { color: '#38bdf8', label: 'Alerta 15d/30d',    icon: '❄️' },
    [SEV.WARN]:    { color: '#f59e0b', label: 'Vence em até 3 dias', icon: '🟡' },
    [SEV.TODAY]:   { color: '#f97316', label: 'Vence hoje',        icon: '🟠' },
    [SEV.EXPIRED]: { color: '#ef4444', label: 'Vencido',           icon: '🔴' },
  };

  const CATEGORY_COLORS = {
    aves: '#facc15', bovino: '#dc2626', suino: '#f472b6', misto: '#fb923c',
    pescado: '#38bdf8', resfriados: '#22d3ee', queijos_especiais: '#fde68a',
    frios: '#f87171', laticinios: '#e0f2fe', iogurtes: '#c4b5fd', pereciveis: '#86efac',
  };

  const CHAMBER_NAMES = { congelado: 'Câmara Congelada', resfriado: 'Câmara Resfriada' };

  /**
   * Layout físico — ajuste aqui para espelhar a planta real da loja.
   * Unidades em metros. Cada câmara lista as fileiras de colunas (rack).
   */
  const LAYOUT = {
    freezer: { w: 2.0, h: 0.9, d: 1.1, gapX: 0.35, rowGap: 2.6 },
    store: {
      acougue:    { origin: { x: -21, z: 0 }, perRow: 8, label: '🥩 AÇOUGUE' },
      pereciveis: { origin: { x: 3,   z: 0 }, perRow: 9, label: '🥗 PERECÍVEIS' },
    },
    chambersInStore: {
      congelado: { x: -12, z: -10, w: 18, d: 7, h: 4.2 },
      resfriado: { x: 10,  z: -10, w: 9,  d: 7, h: 4.2 },
    },
    chamberInterior: {
      // Fileiras de colunas; a 1ª fileira fica de frente para a 2ª (corredor no meio)
      congelado: { offset: { x: 400, z: 0 }, rows: [[1, 2, 3, 4, 5, 6, 7, 8], [9, 10, 11, 12, 13, 14, 15, 16]], levels: 4 },
      resfriado: { offset: { x: 600, z: 0 }, rows: [[1, 2, 3, 4]], levels: 4 },
    },
    rack: { colW: 2.7, levelH: 1.35, palletW: 1.15, palletH: 1.0, palletD: 1.1, aisle: 4.5 },
  };

  const THREE_URL = 'three';
  const ORBIT_URL = 'three/addons/controls/OrbitControls.js';
  const REFRESH_MS = 60000;

  // ── Utilitários ───────────────────────────────────────────────────────────
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad2 = (n) => String(n).padStart(2, '0');
  const norm = (s) => (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  window.BrigadaTwin = {
    SEV, SEV_META, LAYOUT,

    // estado de UI
    view: 'store',            // 'store' | 'congelado' | 'resfriado'
    layer: 'validade',        // 'validade' | 'agenda' | 'rebaixa' | 'categoria'
    search: '',
    selectedKey: null,
    railOpen: true,
    model: null,

    // estado 3D
    _three: null,
    _ctx: null,

    // ════════════════════════════════════════════════════════════════════════
    // 1. MODELO DE DADOS (sem dependência de Three.js)
    // ════════════════════════════════════════════════════════════════════════

    isMaster(user) {
      const u = user || window.BrigadaAuth?.currentUser;
      if (!u) return false;
      const email = (u.email || '').toLowerCase();
      return u.role === 'superadmin' || u.role === 'gestao' || norm(u.sector) === 'todos' ||
        email === 'admin@brigada.com' || email === 'marcos@brigada.com';
    },

    visibleSectors(user) {
      const u = user || window.BrigadaAuth?.currentUser;
      if (this.isMaster(u)) return ['acougue', 'pereciveis'];
      const sec = norm(u?.sector);
      if (sec.includes('pereciv')) return ['pereciveis'];
      return ['acougue'];
    },

    /** Classifica um produto na escala de severidade (null = já tratado/resolvido). */
    classify(p) {
      if (!p || p.expiredAction) return null;
      const s = window.BrigadaData.getProductStatus(p, true);
      if (s.days < 0) return SEV.EXPIRED;
      if (s.days === 0) return SEV.TODAY;
      if (s.days >= 1 && s.days <= 3) return SEV.WARN;
      if (s.isResfriadoAlert || s.isCongeladoAlert) return SEV.LONG;
      return SEV.OK;
    },

    parseFreezerLocation(loc) {
      const m = /^piso_loja:FZ(\d+)$/i.exec(loc || '');
      return m ? parseInt(m[1], 10) : null;
    },

    parseChamberLocation(loc) {
      const m = /^(resfriado|congelado|laticinios|pereciveis):C(\d+)-N(\d+)-([ED])(?::(full|misto))?$/i.exec(loc || '');
      if (!m) return null;
      return {
        chamberKey: m[1].toLowerCase(),
        column: parseInt(m[2], 10),
        level: parseInt(m[3], 10),
        pos: m[4].toUpperCase(),
        palletType: (m[5] || 'full').toLowerCase(),
      };
    },

    _newEntity(props) {
      return {
        products: [], counts: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 }, active: 0,
        worst: SEV.EMPTY, rebaixa: 0, scheduled: false, ...props,
      };
    },

    _addToEntity(e, p, sev) {
      e.products.push({ p, sev });
      if (p.isAwaitingReduction) e.rebaixa++;
      if (sev === null) {
        if (e.worst === SEV.EMPTY) e.worst = SEV.OK;
        return;
      }
      e.counts[sev]++;
      e.active++;
      if (sev > e.worst) e.worst = sev;
    },

    /**
     * Constrói o modelo espacial completo a partir dos produtos carregados.
     * @returns {{entities: Map, alerts: Array, kpis: Object, today: Object}}
     */
    buildModel(opts = {}) {
      const D = window.BrigadaData;
      const P = window.BrigadaPisoLoja;
      const C = window.BrigadaChambers;
      const user = opts.user || window.BrigadaAuth?.currentUser;
      const master = this.isMaster(user);
      const sectors = this.visibleSectors(user);
      const todayIdx = opts.todayIndex ?? new Date().getDay();
      const entities = new Map();

      // ── Freezers do piso ──
      const freezerDefs = {
        acougue: P?.FREEZERS_AÇOUGUE || [],
        pereciveis: P?.FREEZERS_PERECIVEIS || [],
      };
      const schedules = {
        acougue: (P?.SCHEDULE_AÇOUGUE || []).find(s => s.dayIndex === todayIdx),
        pereciveis: (P?.SCHEDULE_PERECIVEIS || []).find(s => s.dayIndex === todayIdx),
      };
      sectors.forEach(sector => {
        freezerDefs[sector].forEach(f => {
          entities.set(`fz:${sector}:${f.num}`, this._newEntity({
            key: `fz:${sector}:${f.num}`, type: 'freezer', sector, num: f.num, category: f.category,
            label: `Freezer ${pad2(f.num)}`,
            scheduled: !!schedules[sector]?.freezers?.includes(f.num),
          }));
        });
      });

      // ── Câmaras, colunas e posições de palete ──
      const congSchedule = (C?.SCHEDULE_CONGELADA || []).find(s => s.dayIndex === todayIdx);
      const configs = C?.CHAMBER_CONFIGS || {};
      Object.keys(CHAMBER_NAMES).forEach(chKey => {
        const name = CHAMBER_NAMES[chKey];
        const cols = configs[name]?.columnsCount || (chKey === 'congelado' ? 16 : 4);
        const levels = LAYOUT.chamberInterior[chKey].levels;
        entities.set(`ch:${chKey}`, this._newEntity({
          key: `ch:${chKey}`, type: 'chamber', chamberKey: chKey, label: name,
          temp: configs[name]?.temp || '', capacity: cols * levels * 2, occupied: 0,
        }));
        for (let col = 1; col <= cols; col++) {
          const scheduled = chKey === 'congelado' && !!congSchedule?.columns?.includes(col);
          entities.set(`col:${chKey}:${col}`, this._newEntity({
            key: `col:${chKey}:${col}`, type: 'column', chamberKey: chKey, column: col,
            label: `${name} · Coluna ${pad2(col)}`, scheduled,
          }));
          for (let lvl = 1; lvl <= levels; lvl++) {
            ['E', 'D'].forEach(pos => {
              const key = `slot:${chKey}:${col}:${lvl}:${pos}`;
              entities.set(key, this._newEntity({
                key, type: 'slot', chamberKey: chKey, column: col, level: lvl, pos,
                label: `${name} · C${pad2(col)} · Nível ${lvl} · ${pos === 'E' ? 'Esquerda' : 'Direita'}`,
                scheduled,
              }));
            });
          }
        }
      });

      // ── Distribui os produtos ──
      const kpis = { total: 0, active: 0, expired: 0, today: 0, warn: 0, long: 0, ok: 0, rebaixa: 0, unplaced: 0, conformidade: 100 };
      const products = (D?.products || []).filter(p => master || D.isProductAllowedForUser(p, user));

      products.forEach(p => {
        const sev = this.classify(p);
        kpis.total++;
        if (sev !== null) {
          kpis.active++;
          if (sev === SEV.EXPIRED) kpis.expired++;
          else if (sev === SEV.TODAY) kpis.today++;
          else if (sev === SEV.WARN) kpis.warn++;
          else if (sev === SEV.LONG) kpis.long++;
          else kpis.ok++;
        }
        if (p.isAwaitingReduction) kpis.rebaixa++;

        const fz = this.parseFreezerLocation(p.location);
        if (fz !== null) {
          const candidates = sectors.filter(s => entities.has(`fz:${s}:${fz}`));
          let sector = candidates[0];
          if (candidates.length > 1) {
            // FZ17–FZ35 existem nos dois setores: decide pela natureza do produto
            sector = (D.isPereciveisProduct(p) && !D.isAçougueProduct(p)) ? 'pereciveis' : 'acougue';
          }
          if (sector) { this._addToEntity(entities.get(`fz:${sector}:${fz}`), p, sev); return; }
          kpis.unplaced++; return;
        }

        const ch = this.parseChamberLocation(p.location);
        if (ch) {
          const slot = entities.get(`slot:${ch.chamberKey}:${ch.column}:${ch.level}:${ch.pos}`);
          if (slot) {
            slot.palletType = ch.palletType;
            this._addToEntity(slot, p, sev);
            this._addToEntity(entities.get(`col:${ch.chamberKey}:${ch.column}`), p, sev);
            this._addToEntity(entities.get(`ch:${ch.chamberKey}`), p, sev);
            return;
          }
        }
        kpis.unplaced++;
      });

      // ocupação das câmaras
      entities.forEach(e => {
        if (e.type === 'slot' && e.products.length) entities.get(`ch:${e.chamberKey}`).occupied++;
      });

      kpis.conformidade = kpis.active ? Math.round(((kpis.ok + kpis.long) / kpis.active) * 1000) / 10 : 100;

      // ── Alertas (nível de causa raiz: freezer ou posição de palete) ──
      const alerts = [];
      entities.forEach(e => {
        if ((e.type === 'freezer' || e.type === 'slot') && e.worst >= SEV.WARN) {
          const parts = [];
          if (e.counts[SEV.EXPIRED]) parts.push(`${e.counts[SEV.EXPIRED]} vencido${e.counts[SEV.EXPIRED] > 1 ? 's' : ''}`);
          if (e.counts[SEV.TODAY]) parts.push(`${e.counts[SEV.TODAY]} vence${e.counts[SEV.TODAY] > 1 ? 'm' : ''} hoje`);
          if (e.counts[SEV.WARN]) parts.push(`${e.counts[SEV.WARN]} em até 3 dias`);
          alerts.push({ key: e.key, severity: e.worst, title: parts.join(' · '), entity: e, weight: e.counts[e.worst] });
        }
      });
      alerts.sort((a, b) => b.severity - a.severity || b.weight - a.weight || a.key.localeCompare(b.key));

      const scheduledToday = [...entities.values()].filter(e => e.scheduled && (e.type === 'freezer' || e.type === 'column'));

      return { entities, alerts, kpis, sectors, master, scheduledToday, generatedAt: new Date() };
    },

    // ════════════════════════════════════════════════════════════════════════
    // 2. PÁGINA (HUD 2D)
    // ════════════════════════════════════════════════════════════════════════

    render(container) {
      this.destroy();
      this.container = container;
      this.selectedKey = null;
      this.view = 'store';
      this.model = this.buildModel();
      this.railOpen = window.innerWidth > 900;

      container.innerHTML = `
        <div class="twin" id="twin-root">
          <div class="twin__topbar">
            <div class="twin__title">
              <h1>🧊 Gêmeo Digital</h1>
              <nav class="twin__crumbs" id="twin-crumbs"></nav>
            </div>
            <div class="twin__kpis" id="twin-kpis"></div>
          </div>
          <div class="twin__toolbar">
            <div class="twin__layers" id="twin-layers">
              <button data-layer="validade" class="twin-chip">🚦 Validade</button>
              <button data-layer="agenda" class="twin-chip">📅 Verificar hoje</button>
              <button data-layer="rebaixa" class="twin-chip">🏷️ Rebaixa</button>
              <button data-layer="categoria" class="twin-chip">🥩 Categoria</button>
            </div>
            <div class="twin__search">
              <input type="search" id="twin-search" class="form-input" placeholder="Localizar produto ou PLU no mapa…" autocomplete="off">
            </div>
            <button class="twin-chip" id="twin-toggle-rail" title="Mostrar/ocultar alertas">🚨 Alertas</button>
          </div>
          <div class="twin__body">
            <aside class="twin__rail ${this.railOpen ? '' : 'twin__rail--closed'}" id="twin-rail"></aside>
            <div class="twin__stage" id="twin-stage">
              <div class="twin__loading" id="twin-loading"><div class="spinner"></div><span>Carregando ambiente 3D…</span></div>
              <div class="twin__tooltip" id="twin-tooltip"></div>
              <div class="twin__legend" id="twin-legend"></div>
              <div class="twin__stage-actions">
                <button class="twin-chip" id="twin-back" style="display:none;">⬅ Voltar para a loja</button>
                <button class="twin-chip" id="twin-reset" title="Recentralizar câmera">🎯 Centralizar</button>
              </div>
            </div>
            <aside class="twin__drawer" id="twin-drawer"></aside>
          </div>
        </div>`;

      this._bindHud();
      this.renderHud();
      this._initThree().catch(err => {
        console.error('[Gêmeo Digital] Falha ao iniciar 3D:', err);
        this._showFallback(err);
      });

      this._refreshTimer = setInterval(() => this.refresh(), REFRESH_MS);
    },

    _bindHud() {
      const root = this.container;
      root.querySelectorAll('[data-layer]').forEach(btn => btn.addEventListener('click', () => {
        this.layer = btn.dataset.layer;
        this.renderHud();
        this._applyColors();
      }));
      let t;
      root.querySelector('#twin-search').addEventListener('input', (e) => {
        clearTimeout(t);
        t = setTimeout(() => { this.search = e.target.value.trim(); this._applyColors(); this.renderRail(); }, 200);
      });
      root.querySelector('#twin-toggle-rail').addEventListener('click', () => {
        this.railOpen = !this.railOpen;
        root.querySelector('#twin-rail').classList.toggle('twin__rail--closed', !this.railOpen);
        setTimeout(() => this._resize(), 260);
      });
      root.querySelector('#twin-back').addEventListener('click', () => this.setView('store'));
      root.querySelector('#twin-reset').addEventListener('click', () => this._flyToView(this.view));

      // Delegação de eventos (rail + drawer)
      root.addEventListener('click', (e) => {
        const go = e.target.closest('[data-go]');
        if (go) { e.preventDefault(); this.focusEntity(go.dataset.go); return; }
        const pv = e.target.closest('[data-product]');
        if (pv) { e.preventDefault(); window.BrigadaUI?.showProductView?.(pv.dataset.product); return; }
        const act = e.target.closest('[data-action]');
        if (act) { e.preventDefault(); this._handleAction(act.dataset.action, act.dataset); }
      });
    },

    renderHud() {
      if (!this.container?.isConnected) return;
      const m = this.model;
      const k = m.kpis;
      const kpi = (label, value, cls = '', go = '') => `
        <div class="twin-kpi ${cls}" ${go ? `data-go="${go}" role="button" tabindex="0"` : ''}>
          <span class="twin-kpi__value">${value}</span><span class="twin-kpi__label">${label}</span>
        </div>`;
      const firstOf = (sev) => m.alerts.find(a => a.severity === sev)?.key || '';
      this.container.querySelector('#twin-kpis').innerHTML = [
        kpi('Conformidade', `${k.conformidade}%`, k.conformidade >= 95 ? 'twin-kpi--ok' : k.conformidade >= 85 ? 'twin-kpi--warn' : 'twin-kpi--bad'),
        kpi('Vencidos', k.expired, k.expired ? 'twin-kpi--bad' : '', firstOf(SEV.EXPIRED)),
        kpi('Vencem hoje', k.today, k.today ? 'twin-kpi--today' : '', firstOf(SEV.TODAY)),
        kpi('Até 3 dias', k.warn, k.warn ? 'twin-kpi--warn' : '', firstOf(SEV.WARN)),
        kpi('Em rebaixa', k.rebaixa),
        kpi('Verificar hoje', m.scheduledToday.length),
      ].join('');

      this.container.querySelectorAll('[data-layer]').forEach(b => b.classList.toggle('twin-chip--active', b.dataset.layer === this.layer));

      const crumbs = [`<a href="#" data-crumb="store">🏪 Loja</a>`];
      if (this.view !== 'store') crumbs.push(`<span>›</span><strong>${esc(CHAMBER_NAMES[this.view])}</strong>`);
      const crumbEl = this.container.querySelector('#twin-crumbs');
      crumbEl.innerHTML = crumbs.join(' ');
      crumbEl.querySelector('[data-crumb]')?.addEventListener('click', (e) => { e.preventDefault(); this.setView('store'); });
      this.container.querySelector('#twin-back').style.display = this.view === 'store' ? 'none' : '';

      this.renderRail();
      this.renderLegend();
      this.renderDrawer();
    },

    renderRail() {
      const rail = this.container?.querySelector('#twin-rail');
      if (!rail) return;
      const m = this.model;
      const matches = this.search ? this._searchMatches() : null;

      let html = '';
      if (matches) {
        html += `<div class="twin-rail__section">🔎 Resultado da busca <span class="twin-badge">${matches.size}</span></div>`;
        if (!matches.size) html += `<div class="twin-rail__empty">Nenhum local contém "${esc(this.search)}".</div>`;
        [...matches].slice(0, 40).forEach(key => {
          const e = m.entities.get(key);
          html += this._railItem(e, `${e.products.length} item(ns) aqui`);
        });
      }

      html += `<div class="twin-rail__section">🚨 Alertas <span class="twin-badge">${m.alerts.length}</span></div>`;
      if (!m.alerts.length) {
        html += `<div class="twin-rail__empty">✅ Nenhum item vencido ou próximo do vencimento.</div>`;
      } else {
        m.alerts.slice(0, 60).forEach(a => { html += this._railItem(a.entity, a.title); });
        if (m.alerts.length > 60) html += `<div class="twin-rail__empty">+ ${m.alerts.length - 60} alertas…</div>`;
      }

      html += `<div class="twin-rail__section">📅 Verificação de hoje <span class="twin-badge">${m.scheduledToday.length}</span></div>`;
      if (!m.scheduledToday.length) html += `<div class="twin-rail__empty">Sem locais agendados para hoje.</div>`;
      m.scheduledToday.forEach(e => { html += this._railItem(e, `${e.products.length} item(ns) · verificar hoje`); });

      if (m.kpis.unplaced) {
        html += `<div class="twin-rail__note">ℹ️ ${m.kpis.unplaced} produto(s) sem posição no mapa (sem freezer ou palete definido).</div>`;
      }
      rail.innerHTML = html;
    },

    _railItem(e, subtitle) {
      const meta = SEV_META[e.worst];
      const where = e.type === 'freezer'
        ? (e.sector === 'acougue' ? 'Açougue' : 'Perecíveis')
        : CHAMBER_NAMES[e.chamberKey];
      const label = e.type === 'slot' ? `C${pad2(e.column)} · N${e.level} · ${e.pos}` : e.type === 'column' ? `Coluna ${pad2(e.column)}` : e.label;
      return `
        <button class="twin-alert ${this.selectedKey === e.key ? 'twin-alert--active' : ''}" data-go="${e.key}" style="--sev:${meta.color}">
          <span class="twin-alert__dot"></span>
          <span class="twin-alert__body">
            <strong>${esc(label)}</strong>
            <small>${esc(where)} — ${esc(subtitle)}</small>
          </span>
          <span class="twin-alert__go">➜</span>
        </button>`;
    },

    renderLegend() {
      const el = this.container?.querySelector('#twin-legend');
      if (!el) return;
      let items = [];
      if (this.layer === 'validade' || this.layer === 'agenda') {
        items = [SEV.EXPIRED, SEV.TODAY, SEV.WARN, SEV.LONG, SEV.OK, SEV.EMPTY].map(s => [SEV_META[s].color, SEV_META[s].label]);
        if (this.layer === 'agenda') items.push(['#1e293b', 'Fora da agenda de hoje']);
      } else if (this.layer === 'rebaixa') {
        items = [['#a855f7', 'Com itens em rebaixa'], ['#334155', 'Sem rebaixa']];
      } else {
        const labels = window.BrigadaPisoLoja?.FREEZER_CATEGORY_LABELS || {};
        items = Object.entries(CATEGORY_COLORS).slice(0, 7).map(([k, c]) => [c, labels[k] || k]);
      }
      el.innerHTML = items.map(([c, l]) => `<span><i style="background:${c}"></i>${esc(l)}</span>`).join('');
    },

    renderDrawer() {
      const drawer = this.container?.querySelector('#twin-drawer');
      if (!drawer) return;
      const e = this.selectedKey && this.model.entities.get(this.selectedKey);
      drawer.classList.toggle('twin__drawer--open', !!e);
      if (!e) { drawer.innerHTML = ''; return; }

      const D = window.BrigadaData;
      const meta = SEV_META[e.worst];
      const chips = [SEV.EXPIRED, SEV.TODAY, SEV.WARN, SEV.LONG, SEV.OK]
        .filter(s => e.counts[s])
        .map(s => `<span class="twin-pill" style="--sev:${SEV_META[s].color}">${SEV_META[s].icon} ${e.counts[s]} ${esc(SEV_META[s].label)}</span>`)
        .join('');

      const subtitle = e.type === 'freezer'
        ? `${e.sector === 'acougue' ? '🥩 Açougue' : '🥗 Perecíveis'} · ${esc(window.BrigadaPisoLoja?.FREEZER_CATEGORY_LABELS?.[e.category] || e.category || '')}`
        : e.type === 'chamber' ? `🌡️ ${esc(e.temp)} · Ocupação ${e.occupied}/${e.capacity} posições (${Math.round((e.occupied / e.capacity) * 100)}%)`
        : e.type === 'slot' ? (e.products.length ? `Palete ${e.palletType === 'misto' ? 'misto' : 'cheio'}` : 'Posição livre')
        : `${e.products.length} item(ns) na coluna`;

      const sorted = [...e.products].sort((a, b) => (b.sev ?? -2) - (a.sev ?? -2) || String(a.p.endDate).localeCompare(String(b.p.endDate)));
      const rows = sorted.slice(0, 80).map(({ p, sev }) => {
        const st = D.getProductStatus(p);
        const color = sev === null ? '#64748b' : SEV_META[sev].color;
        const where = e.type === 'column' || e.type === 'chamber' ? (() => {
          const c = this.parseChamberLocation(p.location);
          return c ? `<span class="twin-row__where">C${pad2(c.column)}·N${c.level}·${c.pos}</span>` : '';
        })() : '';
        return `
          <button class="twin-row" data-product="${esc(p.id)}" style="--sev:${color}">
            <span class="twin-row__bar"></span>
            <span class="twin-row__main">
              <strong>${esc(p.name || 'Sem nome')}</strong>
              <small>PLU ${esc(p.plu || '—')} · ${esc(p.quantity ?? 0)} ${esc(p.unit || '')} · Val. ${esc(D.formatDate ? D.formatDate(p.endDate) : p.endDate)} ${where}</small>
            </span>
            <span class="twin-row__status">${st.icon} ${esc(st.label)}${p.isAwaitingReduction ? '<em>🏷️ Rebaixa</em>' : ''}</span>
          </button>`;
      }).join('');

      const reducible = e.products.filter(({ p, sev }) => (sev === SEV.WARN || sev === SEV.TODAY) && !p.isAwaitingReduction);
      const actions = [];
      if (e.type === 'chamber') actions.push(`<button class="btn btn--primary btn--sm" data-action="enter" data-chamber="${e.chamberKey}">🚪 Entrar na câmara</button>`);
      if (reducible.length) actions.push(`<button class="btn btn--outline btn--sm" data-action="rebaixa">🏷️ Marcar rebaixa (${reducible.length})</button>`);
      actions.push(`<button class="btn btn--ghost btn--sm" data-action="open-module">↗ Abrir no módulo</button>`);

      drawer.innerHTML = `
        <div class="twin-drawer__head" style="--sev:${meta.color}">
          <div>
            <span class="twin-drawer__status">${meta.icon} ${esc(meta.label)}</span>
            <h2>${esc(e.label)}</h2>
            <p>${subtitle}</p>
          </div>
          <button class="modal-close" data-action="close" title="Fechar">✕</button>
        </div>
        ${e.scheduled ? `<div class="twin-drawer__notice">📅 Este local está na <strong>agenda de verificação de hoje</strong>.</div>` : ''}
        <div class="twin-drawer__pills">${chips || '<span class="twin-pill">Sem itens ativos</span>'}${e.rebaixa ? `<span class="twin-pill" style="--sev:#a855f7">🏷️ ${e.rebaixa} em rebaixa</span>` : ''}</div>
        <div class="twin-drawer__actions">${actions.join('')}</div>
        <div class="twin-drawer__list">
          ${rows || `<div class="twin-rail__empty">Nenhum produto alocado neste local.</div>`}
          ${sorted.length > 80 ? `<div class="twin-rail__empty">+ ${sorted.length - 80} itens…</div>` : ''}
        </div>`;
    },

    async _handleAction(action, data) {
      const e = this.selectedKey && this.model.entities.get(this.selectedKey);
      if (action === 'close') { this.select(null); return; }
      if (action === 'enter') { this.setView(data.chamber); return; }
      if (!e) return;

      if (action === 'rebaixa') {
        const ids = e.products.filter(({ p, sev }) => (sev === SEV.WARN || sev === SEV.TODAY) && !p.isAwaitingReduction).map(({ p }) => p.id);
        if (!ids.length) return;
        if (!window.confirm(`Marcar ${ids.length} produto(s) de "${e.label}" como aguardando rebaixa?`)) return;
        await window.BrigadaData.setAwaitingReduction(ids, true, 'aguardando');
        window.BrigadaUI?.showToast?.(`${ids.length} produto(s) enviados para rebaixa.`, 'success');
        this._rebuild();
        return;
      }

      if (action === 'open-module') {
        const R = window.BrigadaRouter;
        if (e.type === 'freezer' && window.BrigadaPisoLoja) {
          window.BrigadaPisoLoja.selectedSector = e.sector === 'acougue' ? 'açougue' : 'pereciveis';
          window.BrigadaPisoLoja.selectedFreezer = e.num;
          R.navigate('piso-loja');
        } else if (window.BrigadaChambers) {
          window.BrigadaChambers.selectedChamber = CHAMBER_NAMES[e.chamberKey];
          window.BrigadaChambers.selectedColumn = e.column || null;
          R.navigate('chambers');
        }
      }
    },

    _searchMatches() {
      const q = norm(this.search);
      const out = new Set();
      if (!q) return out;
      this.model.entities.forEach(e => {
        if (e.type !== 'freezer' && e.type !== 'slot') return;
        if (e.products.some(({ p }) => norm(p.name).includes(q) || String(p.plu || '').includes(q) || String(p.barcode || '').includes(q))) out.add(e.key);
      });
      return out;
    },

    // ── Refresh ────────────────────────────────────────────────────────────
    async refresh() {
      if (!this.container?.isConnected) { this.destroy(); return; }
      if (document.hidden) return;
      try { await window.BrigadaData.load(); } catch (err) { console.warn('[Gêmeo Digital] refresh falhou', err); return; }
      this._rebuild();
    },

    _rebuild() {
      this.model = this.buildModel();
      if (this.selectedKey && !this.model.entities.has(this.selectedKey)) this.selectedKey = null;
      this.renderHud();
      this._applyColors();
    },

    // ════════════════════════════════════════════════════════════════════════
    // 3. CENA 3D
    // ════════════════════════════════════════════════════════════════════════

    async _initThree() {
      const stage = this.container.querySelector('#twin-stage');
      if (!this._hasWebGL()) throw new Error('WebGL indisponível neste dispositivo');

      const [THREE, { OrbitControls }] = await Promise.all([import(THREE_URL), import(ORBIT_URL)]);
      if (!stage.isConnected) return; // usuário saiu da página durante o download
      this._three = THREE;

      const lowPower = (navigator.hardwareConcurrency || 8) <= 4 || window.innerWidth < 768;
      const renderer = new THREE.WebGLRenderer({ antialias: !lowPower, alpha: false, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1 : 2));
      renderer.shadowMap.enabled = !lowPower;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.domElement.className = 'twin__canvas';
      stage.prepend(renderer.domElement);

      const scene = new THREE.Scene();
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim() || '#0d071a';
      const isLight = document.documentElement.classList.contains('light-theme');
      scene.background = new THREE.Color(bg);
      scene.fog = new THREE.Fog(scene.background, 70, 160);

      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.maxPolarAngle = Math.PI * 0.47;
      controls.minDistance = 3;
      controls.maxDistance = 90;

      scene.add(new THREE.HemisphereLight(isLight ? 0xffffff : 0xbfd4ff, isLight ? 0x888888 : 0x1a1030, isLight ? 1.1 : 0.9));
      const sun = new THREE.DirectionalLight(0xffffff, 1.2);
      sun.position.set(30, 50, 25);
      sun.castShadow = !lowPower;
      sun.shadow.mapSize.set(2048, 2048);
      Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, near: 1, far: 150 });
      scene.add(sun);

      this._ctx = {
        THREE, renderer, scene, camera, controls, stage, isLight,
        meshes: new Map(),      // key -> mesh principal (raycast + cor)
        pickables: [],
        groups: {},
        materials: new Map(),
        pulse: new Set(),
        tween: null,
        hoverKey: null,
        raycaster: new THREE.Raycaster(),
        pointer: new THREE.Vector2(),
        clock: new THREE.Clock(),
      };

      this._buildStore();
      this._buildChamberInterior('congelado');
      this._buildChamberInterior('resfriado');
      this._buildSelectionMarker();

      this._applyColors();
      this._bindStage();
      this._resize();
      this._resizeObs = new ResizeObserver(() => this._resize());
      this._resizeObs.observe(stage);

      this.setView('store', true);
      this.container.querySelector('#twin-loading')?.remove();
      this._loop();
    },

    _hasWebGL() {
      try {
        const c = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
      } catch { return false; }
    },

    _showFallback(err) {
      const loading = this.container?.querySelector('#twin-loading');
      if (!loading) return;
      loading.innerHTML = `
        <div style="font-size:2.2rem">🧊</div>
        <strong>Não foi possível abrir o ambiente 3D</strong>
        <span>${esc(err?.message || err)}</span>
        <span style="opacity:.75">Os alertas ao lado continuam funcionando: use <em>↗ Abrir no módulo</em> para ir ao Piso de Loja ou às Câmaras.</span>`;
      loading.classList.add('twin__loading--error');
    },

    _mat(color, opts = {}) {
      const { THREE, materials } = this._ctx;
      const key = `${color}|${opts.opacity ?? 1}|${opts.emissive ?? 0.12}`;
      if (!materials.has(key)) {
        const m = new THREE.MeshStandardMaterial({
          color, roughness: 0.55, metalness: 0.1,
          emissive: new THREE.Color(color), emissiveIntensity: opts.emissive ?? 0.12,
          transparent: (opts.opacity ?? 1) < 1, opacity: opts.opacity ?? 1,
        });
        m.userData.baseEmissive = opts.emissive ?? 0.12;
        materials.set(key, m);
      }
      return materials.get(key);
    },

    _label(text, { size = 0.9, color = '#ffffff', bg = 'rgba(15,23,42,0.85)', flat = false } = {}) {
      const { THREE } = this._ctx;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const font = 'bold 56px Outfit, system-ui, sans-serif';
      ctx.font = font;
      const w = Math.ceil(ctx.measureText(text).width) + 48;
      canvas.width = w; canvas.height = 88;
      ctx.font = font;
      if (bg) {
        ctx.fillStyle = bg;
        if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(0, 0, w, 88, 20); ctx.fill(); }
        else ctx.fillRect(0, 0, w, 88);
      }
      ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(text, w / 2, 46);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      const aspect = w / 88;
      if (flat) {
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size * aspect, size), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
        mesh.rotation.x = -Math.PI / 2;
        return mesh;
      }
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
      sprite.scale.set(size * aspect, size, 1);
      return sprite;
    },

    _register(key, mesh) {
      mesh.userData.key = key;
      this._ctx.meshes.set(key, mesh);
      this._ctx.pickables.push(mesh);
    },

    _buildStore() {
      const { THREE, scene, isLight } = this._ctx;
      const g = new THREE.Group();
      g.name = 'store';
      this._ctx.groups.store = g;
      scene.add(g);

      // piso
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(70, 46), new THREE.MeshStandardMaterial({ color: isLight ? 0xe2e8f0 : 0x161029, roughness: 0.95 }));
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(0, 0, 0);
      floor.receiveShadow = true;
      g.add(floor);
      const grid = new THREE.GridHelper(70, 35, isLight ? 0x94a3b8 : 0x3b2f63, isLight ? 0xcbd5e1 : 0x241a42);
      grid.position.y = 0.01;
      g.add(grid);

      const F = LAYOUT.freezer;
      const bodyGeo = new THREE.BoxGeometry(F.w, F.h, F.d);
      const glassGeo = new THREE.BoxGeometry(F.w * 0.92, 0.06, F.d * 0.85);
      const glassMat = new THREE.MeshStandardMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.35, roughness: 0.1, metalness: 0.3 });

      this.model.sectors.forEach(sector => {
        const conf = LAYOUT.store[sector];
        const list = [...this.model.entities.values()].filter(e => e.type === 'freezer' && e.sector === sector).sort((a, b) => a.num - b.num);
        list.forEach((e, i) => {
          const row = Math.floor(i / conf.perRow);
          const col = i % conf.perRow;
          const x = conf.origin.x + col * (F.w + F.gapX) + F.w / 2;
          const z = conf.origin.z + row * (F.d + F.rowGap) + F.d / 2;

          const body = new THREE.Mesh(bodyGeo, this._mat(SEV_META[SEV.EMPTY].color));
          body.position.set(x, F.h / 2, z);
          body.castShadow = true; body.receiveShadow = true;
          g.add(body);
          this._register(e.key, body);

          const glass = new THREE.Mesh(glassGeo, glassMat);
          glass.position.set(x, F.h + 0.03, z);
          g.add(glass);

          const label = this._label(pad2(e.num), { size: 0.55 });
          label.position.set(x, F.h + 0.6, z);
          g.add(label);
        });

        const rows = Math.ceil(list.length / conf.perRow);
        const title = this._label(conf.label, { size: 1.3, flat: true, bg: null, color: isLight ? '#334155' : '#a5b4fc' });
        title.position.set(conf.origin.x + (conf.perRow * (F.w + F.gapX)) / 2, 0.03, conf.origin.z + rows * (F.d + F.rowGap) + 0.6);
        g.add(title);
      });

      // câmaras (blocos clicáveis no fundo da loja)
      Object.entries(LAYOUT.chambersInStore).forEach(([chKey, c]) => {
        const e = this.model.entities.get(`ch:${chKey}`);
        const box = new THREE.Mesh(new THREE.BoxGeometry(c.w, c.h, c.d), this._mat(SEV_META[SEV.EMPTY].color, { opacity: 0.55 }));
        box.position.set(c.x, c.h / 2, c.z);
        box.castShadow = true;
        g.add(box);
        this._register(e.key, box);

        const edges = new THREE.LineSegments(new THREE.EdgesGeometry(box.geometry), new THREE.LineBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.6 }));
        edges.position.copy(box.position);
        g.add(edges);

        const label = this._label(`❄️ ${e.label} · ${e.temp}`, { size: 0.9 });
        label.position.set(c.x, c.h + 0.9, c.z);
        g.add(label);
      });
    },

    _chamberRackPositions(chKey) {
      const conf = LAYOUT.chamberInterior[chKey];
      const R = LAYOUT.rack;
      const out = new Map(); // column -> {x, z, facing}
      conf.rows.forEach((cols, rowIdx) => {
        const width = cols.length * R.colW;
        const z = conf.rows.length === 1 ? 0 : (rowIdx === 0 ? -R.aisle / 2 - R.palletD / 2 : R.aisle / 2 + R.palletD / 2);
        const facing = rowIdx === 0 ? 1 : -1; // +z ou -z (corredor)
        cols.forEach((col, i) => {
          // fileira de trás (facing -1) é espelhada para manter E/D coerente para quem está no corredor
          const idx = facing === 1 ? i : cols.length - 1 - i;
          out.set(col, { x: conf.offset.x - width / 2 + idx * R.colW + R.colW / 2, z: conf.offset.z + z, facing });
        });
      });
      return out;
    },

    _buildChamberInterior(chKey) {
      const { THREE, scene, isLight } = this._ctx;
      const conf = LAYOUT.chamberInterior[chKey];
      const R = LAYOUT.rack;
      const g = new THREE.Group();
      g.name = chKey;
      g.visible = false;
      this._ctx.groups[chKey] = g;
      scene.add(g);

      const positions = this._chamberRackPositions(chKey);
      const maxCols = Math.max(...conf.rows.map(r => r.length));
      const floorW = maxCols * R.colW + 6;
      const floorD = conf.rows.length * (R.palletD + 1) + R.aisle + 6;

      const floor = new THREE.Mesh(new THREE.PlaneGeometry(floorW, floorD), new THREE.MeshStandardMaterial({ color: isLight ? 0xdbeafe : (chKey === 'congelado' ? 0x1e1b4b : 0x0c2340), roughness: 0.4, metalness: 0.2 }));
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(conf.offset.x, 0, conf.offset.z);
      floor.receiveShadow = true;
      g.add(floor);

      const frameMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7, roughness: 0.35 });
      const beamMat = new THREE.MeshStandardMaterial({ color: 0xf97316, metalness: 0.4, roughness: 0.5 });
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.9 });
      const postGeo = new THREE.BoxGeometry(0.08, conf.levels * R.levelH + 0.2, 0.08);
      const beamGeo = new THREE.BoxGeometry(R.colW, 0.08, 0.08);
      const palletGeo = new THREE.BoxGeometry(R.palletW, R.palletH, R.palletD);
      const baseGeo = new THREE.BoxGeometry(R.palletW, 0.12, R.palletD);
      const emptyGeo = new THREE.BoxGeometry(R.palletW, R.palletH * 0.92, R.palletD);

      positions.forEach((p, col) => {
        const colEntity = this.model.entities.get(`col:${chKey}:${col}`);
        if (!colEntity) return;
        // montantes
        [-1, 1].forEach(sx => [-1, 1].forEach(sz => {
          const post = new THREE.Mesh(postGeo, frameMat);
          post.position.set(p.x + sx * (R.colW / 2 - 0.04), postGeo.parameters.height / 2, p.z + sz * (R.palletD / 2));
          g.add(post);
        }));
        for (let lvl = 1; lvl <= conf.levels; lvl++) {
          const y = (lvl - 1) * R.levelH;
          [-1, 1].forEach(sz => {
            const beam = new THREE.Mesh(beamGeo, beamMat);
            beam.position.set(p.x, y + 0.06, p.z + sz * (R.palletD / 2));
            g.add(beam);
          });
          ['E', 'D'].forEach(pos => {
            const key = `slot:${chKey}:${col}:${lvl}:${pos}`;
            const e = this.model.entities.get(key);
            // Esquerda/Direita do ponto de vista de quem está no corredor olhando para o rack
            const side = (pos === 'E' ? -1 : 1) * p.facing;
            const x = p.x + side * (R.colW / 4);
            const base = new THREE.Mesh(baseGeo, woodMat);
            base.position.set(x, y + 0.16, p.z);
            g.add(base);
            const mesh = new THREE.Mesh(e.products.length ? palletGeo : emptyGeo, this._mat(SEV_META[SEV.EMPTY].color, { opacity: 0.18 }));
            mesh.position.set(x, y + 0.22 + R.palletH / 2, p.z);
            mesh.castShadow = true;
            g.add(mesh);
            this._register(key, mesh);
          });
        }
        // número da coluna
        const label = this._label(`C${pad2(col)}`, { size: 0.7, bg: colEntity.scheduled ? 'rgba(16,185,129,0.9)' : 'rgba(15,23,42,0.85)' });
        label.position.set(p.x, conf.levels * R.levelH + 0.7, p.z);
        g.add(label);
        // marcador invisível da coluna (para foco da câmera)
        const anchor = new THREE.Object3D();
        anchor.position.set(p.x, (conf.levels * R.levelH) / 2, p.z);
        anchor.userData.key = colEntity.key;
        g.add(anchor);
        this._ctx.meshes.set(colEntity.key, anchor);
      });

      const title = this._label(`❄️ ${CHAMBER_NAMES[chKey]}`, { size: 1.4, flat: true, bg: null, color: isLight ? '#1e3a8a' : '#c7d2fe' });
      title.position.set(conf.offset.x, 0.03, conf.offset.z + floorD / 2 - 1.5);
      g.add(title);
    },

    _buildSelectionMarker() {
      const { THREE, scene } = this._ctx;
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1, 0.06, 12, 48),
        new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.95 })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.visible = false;
      const box = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)),
        new THREE.LineBasicMaterial({ color: 0x22d3ee })
      );
      box.visible = false;
      scene.add(ring, box);
      this._ctx.selRing = ring;
      this._ctx.selBox = box;
    },

    /** Cor de cada objeto conforme a camada ativa + busca. */
    _applyColors() {
      if (!this._ctx) return;
      const ctx = this._ctx;
      const matches = this.search ? this._searchMatches() : null;
      ctx.pulse.forEach(m => { m.emissiveIntensity = m.userData.baseEmissive ?? 0.12; });
      ctx.pulse.clear();

      ctx.meshes.forEach((mesh, key) => {
        if (!mesh.isMesh) return;
        const e = this.model.entities.get(key);
        if (!e) return;
        const isChamberBox = e.type === 'chamber';
        const empty = !e.products.length;
        let color = SEV_META[e.worst].color;
        let opacity = isChamberBox ? 0.55 : (e.type === 'slot' && empty ? 0.18 : 1);
        let emissive = 0.12;

        if (this.layer === 'agenda') {
          const sched = e.scheduled || (isChamberBox && [...this.model.entities.values()].some(x => x.type === 'column' && x.chamberKey === e.chamberKey && x.scheduled));
          if (!sched) { color = '#1e293b'; emissive = 0.02; if (e.type === 'slot') opacity = empty ? 0.08 : 0.35; }
          else emissive = 0.35;
        } else if (this.layer === 'rebaixa') {
          color = e.rebaixa ? '#a855f7' : '#334155';
          emissive = e.rebaixa ? 0.4 : 0.05;
        } else if (this.layer === 'categoria') {
          const cat = e.type === 'freezer' ? e.category : norm(e.products[0]?.p?.category);
          color = CATEGORY_COLORS[cat] || '#475569';
          if (e.type === 'slot' && empty) color = '#475569';
        }

        if (matches) {
          if (matches.has(key)) { color = '#fde047'; emissive = 0.7; opacity = 1; }
          else if (e.type !== 'chamber') { emissive = 0.02; opacity = Math.min(opacity, e.type === 'slot' ? 0.12 : 0.35); }
        }

        const mat = this._mat(color, { opacity, emissive });
        mesh.material = mat;
        const pulsing = !matches && this.layer === 'validade' && (e.worst === SEV.EXPIRED || e.worst === SEV.TODAY);
        if (pulsing) ctx.pulse.add(mat);
      });
    },

    _bindStage() {
      const { renderer } = this._ctx;
      const el = renderer.domElement;
      let downAt = null;

      el.addEventListener('pointermove', (ev) => this._onHover(ev));
      el.addEventListener('pointerleave', () => this._setHover(null));
      el.addEventListener('pointerdown', (ev) => { downAt = { x: ev.clientX, y: ev.clientY }; });
      el.addEventListener('pointerup', (ev) => {
        if (!downAt) return;
        const moved = Math.hypot(ev.clientX - downAt.x, ev.clientY - downAt.y);
        downAt = null;
        if (moved > 6) return; // foi arraste (órbita), não clique
        const key = this._pick(ev);
        if (!key) { this.select(null); return; }
        const e = this.model.entities.get(key);
        if (e?.type === 'chamber') { this.setView(e.chamberKey); return; }
        this.select(key, true);
      });
      el.addEventListener('dblclick', (ev) => {
        const key = this._pick(ev);
        const e = key && this.model.entities.get(key);
        if (e?.type === 'chamber') this.setView(e.chamberKey);
      });

      this._onVisibility = () => { if (!document.hidden) this._ctx?.clock.getDelta(); };
      document.addEventListener('visibilitychange', this._onVisibility);
    },

    _pick(ev) {
      const { renderer, camera, raycaster, pointer, pickables } = this._ctx;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const visible = pickables.filter(m => m.parent?.visible);
      const hit = raycaster.intersectObjects(visible, false)[0];
      return hit?.object?.userData?.key || null;
    },

    _onHover(ev) {
      if (ev.pointerType === 'touch') return;
      const key = this._pick(ev);
      this._setHover(key, ev);
    },

    _setHover(key, ev) {
      const ctx = this._ctx;
      const tip = this.container?.querySelector('#twin-tooltip');
      if (!tip || !ctx) return;
      ctx.renderer.domElement.style.cursor = key ? 'pointer' : 'grab';
      if (!key) { tip.style.opacity = 0; ctx.hoverKey = null; return; }
      const e = this.model.entities.get(key);
      if (!e) return;
      if (ctx.hoverKey !== key) {
        const meta = SEV_META[e.worst];
        const top = [...e.products].filter(x => x.sev !== null).sort((a, b) => b.sev - a.sev)[0];
        tip.innerHTML = `
          <strong>${esc(e.type === 'slot' ? `C${pad2(e.column)} · N${e.level} · ${e.pos}` : e.label)}</strong>
          <span style="color:${meta.color}">${meta.icon} ${esc(meta.label)}</span>
          <span>${e.products.length} item(ns)${e.rebaixa ? ` · 🏷️ ${e.rebaixa} rebaixa` : ''}${e.type === 'chamber' ? ` · ${e.occupied}/${e.capacity} posições` : ''}</span>
          ${top ? `<span class="twin__tooltip-top">${esc(top.p.name)}</span>` : ''}
          ${e.scheduled ? '<span>📅 Verificar hoje</span>' : ''}
          <em>${e.type === 'chamber' ? 'Clique para entrar' : 'Clique para detalhes'}</em>`;
        ctx.hoverKey = key;
      }
      const rect = ctx.stage.getBoundingClientRect();
      tip.style.left = `${Math.min(ev.clientX - rect.left + 16, rect.width - 240)}px`;
      tip.style.top = `${Math.max(ev.clientY - rect.top - 10, 8)}px`;
      tip.style.opacity = 1;
    },

    // ── Navegação / câmera ────────────────────────────────────────────────
    _viewOf(key) {
      if (key.startsWith('fz:') || key.startsWith('ch:')) return 'store';
      const parts = key.split(':');
      return parts[1]; // slot:congelado:..., col:resfriado:...
    },

    setView(view, instant = false) {
      this.view = view;
      if (this._ctx) {
        Object.entries(this._ctx.groups).forEach(([k, g]) => { g.visible = k === view; });
        if (this.selectedKey && this._viewOf(this.selectedKey) !== view) this.selectedKey = null;
        this._updateSelectionMarker();
        this._flyToView(view, instant);
      }
      this.renderHud();
    },

    _flyToView(view, instant = false) {
      if (!this._ctx) return;
      const { THREE } = this._ctx;
      if (view === 'store') {
        const xs = this.model.sectors.map(s => LAYOUT.store[s].origin.x);
        const cx = this.model.sectors.length === 2 ? 0 : xs[0] + 10;
        this._tweenCamera(new THREE.Vector3(cx, 30, 30), new THREE.Vector3(cx, 0, -2), instant);
      } else {
        const o = LAYOUT.chamberInterior[view].offset;
        const wide = LAYOUT.chamberInterior[view].rows[0].length > 4;
        this._tweenCamera(new THREE.Vector3(o.x, wide ? 14 : 9, o.z + (wide ? 20 : 13)), new THREE.Vector3(o.x, 2, o.z), instant);
      }
    },

    _tweenCamera(toPos, toTarget, instant = false, ms = 900) {
      const { camera, controls } = this._ctx;
      if (instant) {
        camera.position.copy(toPos); controls.target.copy(toTarget); controls.update();
        this._ctx.tween = null; return;
      }
      this._ctx.tween = {
        fromPos: camera.position.clone(), fromTarget: controls.target.clone(),
        toPos, toTarget, start: performance.now(), ms,
      };
    },

    /** Vai até uma entidade (troca de cena se necessário), foca e abre o painel. */
    focusEntity(key) {
      if (!this.model.entities.has(key)) return;
      const view = this._viewOf(key);
      if (view !== this.view) {
        this.view = view;
        if (this._ctx) Object.entries(this._ctx.groups).forEach(([k, g]) => { g.visible = k === view; });
      }
      this.select(key, true);
      if (window.innerWidth <= 900 && this.railOpen) {
        this.railOpen = false;
        this.container.querySelector('#twin-rail')?.classList.add('twin__rail--closed');
        setTimeout(() => this._resize(), 260);
      }
    },

    select(key, fly = false) {
      this.selectedKey = key;
      this.renderHud();
      if (!this._ctx) return;
      this._updateSelectionMarker();
      if (key && fly) {
        const obj = this._ctx.meshes.get(key);
        if (!obj) return;
        const { THREE, camera, controls } = this._ctx;
        const target = new THREE.Vector3();
        obj.getWorldPosition(target);
        const e = this.model.entities.get(key);
        const dist = e.type === 'column' ? 9 : e.type === 'slot' ? 6 : 7.5;
        const dir = camera.position.clone().sub(controls.target).normalize();
        if (dir.y < 0.45) { dir.y = 0.45; dir.normalize(); }
        // na câmara, olhar sempre a partir do corredor
        if (e.type === 'slot' || e.type === 'column') {
          const p = this._chamberRackPositions(e.chamberKey).get(e.column);
          if (p) dir.set(0, 0.55, p.facing).normalize();
        }
        this._tweenCamera(target.clone().add(dir.multiplyScalar(dist)), target);
      }
    },

    _updateSelectionMarker() {
      const { selRing, selBox, meshes, THREE } = this._ctx;
      selRing.visible = selBox.visible = false;
      if (!this.selectedKey) return;
      const obj = meshes.get(this.selectedKey);
      if (!obj || !obj.parent?.visible) return;
      const pos = new THREE.Vector3();
      obj.getWorldPosition(pos);
      if (obj.isMesh) {
        const size = new THREE.Box3().setFromObject(obj).getSize(new THREE.Vector3());
        selBox.scale.set(size.x + 0.15, size.y + 0.15, size.z + 0.15);
        selBox.position.copy(pos);
        selBox.visible = true;
        selRing.scale.setScalar(Math.max(size.x, size.z) * 0.85);
      } else {
        selRing.scale.setScalar(1.8);
      }
      selRing.position.set(pos.x, 0.05, pos.z);
      selRing.visible = true;
    },

    _resize() {
      if (!this._ctx) return;
      const { renderer, camera, stage } = this._ctx;
      const w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    },

    _loop() {
      const ctx = this._ctx;
      if (!ctx) return;
      if (!ctx.renderer.domElement.isConnected) { this.destroy(); return; }
      this._raf = requestAnimationFrame(() => this._loop());
      if (document.hidden) return;

      const t = ctx.clock.getElapsedTime();
      if (ctx.tween) {
        const k = Math.min(1, (performance.now() - ctx.tween.start) / ctx.tween.ms);
        const e = easeInOut(k);
        ctx.camera.position.lerpVectors(ctx.tween.fromPos, ctx.tween.toPos, e);
        ctx.controls.target.lerpVectors(ctx.tween.fromTarget, ctx.tween.toTarget, e);
        if (k >= 1) ctx.tween = null;
      }
      const pulse = 0.25 + (Math.sin(t * 4) + 1) * 0.3;
      ctx.pulse.forEach(m => { m.emissiveIntensity = pulse; });
      if (ctx.selRing.visible) {
        ctx.selRing.material.opacity = 0.55 + Math.sin(t * 5) * 0.4;
        ctx.selRing.rotation.z = t * 0.8;
      }
      ctx.controls.update();
      ctx.renderer.render(ctx.scene, ctx.camera);
    },

    destroy() {
      clearInterval(this._refreshTimer);
      this._refreshTimer = null;
      cancelAnimationFrame(this._raf);
      this._resizeObs?.disconnect();
      this._resizeObs = null;
      if (this._onVisibility) document.removeEventListener('visibilitychange', this._onVisibility);
      const ctx = this._ctx;
      if (ctx) {
        ctx.scene.traverse(o => {
          o.geometry?.dispose?.();
          const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
          mats.forEach(m => { m.map?.dispose?.(); m.dispose?.(); });
        });
        ctx.controls.dispose();
        ctx.renderer.dispose();
        ctx.renderer.forceContextLoss?.();
      }
      this._ctx = null;
    },
  };
})();

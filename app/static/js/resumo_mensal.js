/**
 * BRIGADA-IA — Resumo Mensal por Setor Module
 */

window.BrigadaResumoMensal = {
  currentYear: new Date().getFullYear().toString(),
  currentMonth: (new Date().getMonth() + 1).toString().padStart(2, '0'),
  currentSector: 'all',

  render(container) {
    this.initFilters();
    container.innerHTML = this.buildHTML();
    this.bindEvents(container);
    this.calculateAndRenderMetrics(container);
  },

  initFilters() {
    // Garante que o ano, mês e setor padrão estejam definidos
    if (!this.currentYear || this.currentYear === 'all') {
      this.currentYear = new Date().getFullYear().toString();
    }
    if (!this.currentMonth || this.currentMonth === 'all') {
      this.currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
    }
    
    const userSector = window.BrigadaAuth.currentUser?.sector || 'todos';
    const isSuperAdmin = window.BrigadaAuth.isSuperAdmin() || userSector === 'todos';
    
    if (!isSuperAdmin && userSector !== 'todos') {
      this.currentSector = userSector === 'pereciveis' ? 'pereciveis' : 'acougue';
    } else if (!this.currentSector || this.currentSector === 'all' || this.currentSector === 'acougue' || this.currentSector === 'pereciveis') {
      // mantém valor válido
    } else {
      this.currentSector = 'all';
    }
  },

  buildHTML() {
    const years = this.getAvailableYears();
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

    const userSector = window.BrigadaAuth.currentUser?.sector || 'todos';
    const isSuperAdmin = window.BrigadaAuth.isSuperAdmin() || userSector === 'todos';

    let sectorOptionsHTML = '';
    if (!isSuperAdmin && userSector !== 'todos') {
      const label = userSector === 'pereciveis' ? '🧊 Perecíveis' : '🥩 Açougue';
      const val = userSector === 'pereciveis' ? 'pereciveis' : 'acougue';
      sectorOptionsHTML = `<option value="${val}">${label}</option>`;
    } else {
      sectorOptionsHTML = `
        <option value="all" ${this.currentSector === 'all' ? 'selected' : ''}>🏢 Todos os Setores</option>
        <option value="acougue" ${this.currentSector === 'acougue' ? 'selected' : ''}>🥩 Açougue</option>
        <option value="pereciveis" ${this.currentSector === 'pereciveis' ? 'selected' : ''}>🧊 Perecíveis</option>
      `;
    }

    return `
      <div class="panel-header">
        <div class="panel-header__left">
          <h2 class="panel-title">📅 Resumo Mensal por Setor</h2>
          <p class="panel-subtitle">Análise de eficiência de tratamento de validade e oportunidades de melhoria</p>
        </div>
        <div class="glass-actions-card" style="display:flex; gap:var(--sp-sm); flex-wrap:wrap; align-items:center;">
          <!-- Filtro de Setor -->
          <select id="resumo-sector-select" class="select-control" style="min-width: 170px;" ${!isSuperAdmin && userSector !== 'todos' ? 'disabled' : ''}>
            ${sectorOptionsHTML}
          </select>
          <!-- Filtro de Ano -->
          <select id="resumo-year-select" class="select-control" style="min-width: 100px;">
            ${years.map(y => `<option value="${y}" ${this.currentYear === y ? 'selected' : ''}>${y}</option>`).join('')}
          </select>
          <!-- Filtro de Mês -->
          <select id="resumo-month-select" class="select-control" style="min-width: 140px;">
            ${months.map(m => `<option value="${m.val}" ${this.currentMonth === m.val ? 'selected' : ''}>${m.name}</option>`).join('')}
          </select>
          <!-- Botão Imprimir -->
          <button id="btn-print-resumo" class="btn btn--primary" style="display:inline-flex; align-items:center; gap:6px; cursor:pointer;" title="Imprimir Relatório Resumo Mensal">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px; height:16px;"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            <span id="btn-print-label">Imprimir</span>
          </button>
        </div>
      </div>

      <!-- Resumo Geral Cards -->
      <div class="dashboard-grid dashboard-grid--4 stagger" style="margin-top: 1.5rem;" id="resumo-cards-overview">
        <!-- Injetado dinamicamente -->
      </div>

      <!-- Top Quebras e Trocas Widget -->
      <div class="dashboard-grid dashboard-grid--2" style="margin-top: 1.5rem; margin-bottom:1.5rem;">
        <div class="glass-panel" id="card-top-quebra-week" style="display:flex; flex-direction:column; justify-content:center; padding: 1.5rem; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'" title="Clique para ver o Top 10">
          <h3 class="glass-panel__title" style="margin-bottom:1rem;">🏆 Top Quebras e Trocas (Semana)</h3>
          <div style="display:flex; align-items:center; gap: 1rem;">
            <div style="font-size:2.5rem; background:rgba(239,68,68,0.1); border-radius:50%; padding:0.5rem; width:60px; height:60px; display:flex; align-items:center; justify-content:center;">🗑️</div>
            <div>
              <p style="font-size:1.1rem; font-weight:bold; color:var(--text-primary);" id="top-quebra-week-name">Calculando...</p>
              <p style="font-size:0.9rem; color:var(--error);" id="top-quebra-week-count">...</p>
            </div>
          </div>
        </div>
        <div class="glass-panel" id="card-top-quebra-month" style="display:flex; flex-direction:column; justify-content:center; padding: 1.5rem; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'" title="Clique para ver o Top 10">
          <h3 class="glass-panel__title" style="margin-bottom:1rem;">🏆 Top Quebras e Trocas (Mês)</h3>
          <div style="display:flex; align-items:center; gap: 1rem;">
            <div style="font-size:2.5rem; background:rgba(239,68,68,0.1); border-radius:50%; padding:0.5rem; width:60px; height:60px; display:flex; align-items:center; justify-content:center;">📅</div>
            <div>
              <p style="font-size:1.1rem; font-weight:bold; color:var(--text-primary);" id="top-quebra-month-name">Calculando...</p>
              <p style="font-size:0.9rem; color:var(--error);" id="top-quebra-month-count">...</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Relatório Detalhado por Setor -->
      <div class="sectors-report-container" style="margin-top: 2rem; display: flex; flex-direction: column; gap: 2rem;" id="resumo-sectors-list">
        <!-- Injetado dinamicamente -->
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
    `;
  },

  getAvailableYears() {
    const yearsSet = new Set();
    yearsSet.add(new Date().getFullYear().toString()); // Ano atual garantido
    
    const products = window.BrigadaData.products || [];
    products.forEach(p => {
      if (p.endDate) {
        const [y] = p.endDate.split('-');
        if (y && y.length === 4) {
          yearsSet.add(y);
        }
      }
    });

    return Array.from(yearsSet).sort((a, b) => b - a);
  },

  bindEvents(container) {
    const yearSelect = container.querySelector('#resumo-year-select');
    const monthSelect = container.querySelector('#resumo-month-select');
    const sectorSelect = container.querySelector('#resumo-sector-select');
    const printBtn = container.querySelector('#btn-print-resumo');

    yearSelect?.addEventListener('change', (e) => {
      this.currentYear = e.target.value;
      this.calculateAndRenderMetrics(container);
    });

    monthSelect?.addEventListener('change', (e) => {
      this.currentMonth = e.target.value;
      this.calculateAndRenderMetrics(container);
    });

    sectorSelect?.addEventListener('change', (e) => {
      this.currentSector = e.target.value;
      this.calculateAndRenderMetrics(container);
    });

    printBtn?.addEventListener('click', () => {
      this.printResumo();
    });

    // Top 10 Modal Events
    container.querySelector('#top10-modal-close')?.addEventListener('click', () => this.closeTop10Modal(container));
    container.querySelector('#btn-cancel-top10')?.addEventListener('click', () => this.closeTop10Modal(container));
    container.querySelector('#top10-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'top10-modal') this.closeTop10Modal(container);
    });

    // Top Quebra Widgets click
    container.querySelector('#card-top-quebra-week')?.addEventListener('click', () => {
      if (this.top10WeekData) this.openTop10Modal(container, this.top10WeekData, '🏆 Top 10 Quebras e Trocas (Nesta Semana)');
    });
    container.querySelector('#card-top-quebra-month')?.addEventListener('click', () => {
      if (this.top10MonthData) this.openTop10Modal(container, this.top10MonthData, `🏆 Top 10 Quebras e Trocas (${this.currentMonth}/${this.currentYear})`);
    });

    // Print button Top 10
    container.querySelector('#btn-print-top10')?.addEventListener('click', () => {
      this.printTop10(container.querySelector('#top10-modal-title').textContent, this.currentTop10Data);
    });
  },

  calculateAndRenderMetrics(container) {
    const products = window.BrigadaData.products || [];
    const userSector = window.BrigadaAuth.currentUser?.sector || 'todos';
    const isSuperAdmin = window.BrigadaAuth.isSuperAdmin() || userSector === 'todos';
    
    // Filtrar produtos que vencem/venceram no mês e ano selecionados
    let monthlyProducts = products.filter(p => {
      if (!p.endDate) return false;
      const [y, m] = p.endDate.split('-');
      return y === this.currentYear && m === this.currentMonth;
    });

    // Se o usuário não for Admin, restringe rigorosamente os produtos totais ao seu próprio setor
    if (!isSuperAdmin && userSector !== 'todos') {
      const allowedCats = userSector === 'pereciveis'
        ? ['iogurtes', 'laticinios', 'frios', 'pereciveis', 'perecíveis']
        : ['aves', 'suino', 'bovino', 'pescado'];
      monthlyProducts = monthlyProducts.filter(p => allowedCats.includes(p.category));
    }

    // Mapeamento dos 2 setores oficiais da loja
    const sectors = [
      {
        id: 'acougue',
        name: '🥩 Açougue',
        filter: (p) => ['aves', 'suino', 'bovino', 'pescado'].includes(p.category)
      },
      {
        id: 'pereciveis',
        name: '🧊 Perecíveis',
        filter: (p) => ['iogurtes', 'laticinios', 'frios', 'pereciveis', 'perecíveis'].includes(p.category)
      }
    ];

    // Estatísticas Gerais
    let totalItems = monthlyProducts.length;
    let totalTratados = 0;
    let totalQuebras = 0;
    let totalTrocas = 0;
    let totalSemAcao = 0;

    let totalKgTratados = 0;
    let totalUnTratados = 0;

    const sectorStats = sectors.map(sec => {
      const secProducts = monthlyProducts.filter(sec.filter);
      
      let tratados = 0;
      let quebras = 0;
      let trocas = 0;
      let semAcao = 0;

      let tratadosKg = 0;
      let tratadosUn = 0;
      let totalKg = 0;
      let totalUn = 0;

      // Armazenar produtos que precisam de melhoria para identificar ofensores
      const ofensoresMap = {};

      secProducts.forEach(p => {
        const qty = p.quantity || 0;
        const isKg = p.unit === 'kg';
        
        if (isKg) {
          totalKg += qty;
        } else {
          totalUn += qty;
        }

        const todayStr = new Date().toISOString().split('T')[0];
        const isNotExpired = p.endDate >= todayStr;

        if (p.expiredAction === 'tratado' || (!p.expiredAction && isNotExpired)) {
          tratados += qty;
          totalTratados += qty;
          if (isKg) {
            tratadosKg += qty;
            totalKgTratados += qty;
          } else {
            tratadosUn += qty;
            totalUnTratados += qty;
          }
        } else if (p.expiredAction === 'quebra') {
          quebras += qty;
          totalQuebras += qty;
          ofensoresMap[p.name] = (ofensoresMap[p.name] || 0) + qty;
        } else if (p.expiredAction === 'troca') {
          trocas += qty;
          totalTrocas += qty;
          ofensoresMap[p.name] = (ofensoresMap[p.name] || 0) + qty;
        } else {
          // Vencido sem ação
          semAcao += qty;
          totalSemAcao += qty;
          ofensoresMap[p.name] = (ofensoresMap[p.name] || 0) + qty;
        }
      });

      const totalSec = tratados + quebras + trocas + semAcao;
      const successRate = totalSec > 0 ? Math.round((tratados / totalSec) * 100) : 100;
      const successRateKg = totalKg > 0 ? Math.round((tratadosKg / totalKg) * 100) : 100;

      // Ordenar ofensores de perda
      const topOfensores = Object.entries(ofensoresMap)
        .map(([name, qty]) => ({ name, qty }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 3);

      return {
        ...sec,
        total: totalSec,
        tratados,
        quebras,
        trocas,
        semAcao,
        successRate,
        successRateKg,
        tratadosKg,
        tratadosUn,
        totalKg,
        totalUn,
        topOfensores
      };
    });

    // Filtra os setores estatísticos
    const activeSectorStats = this.currentSector === 'all' ? null : sectorStats.find(s => s.id === this.currentSector);

    // Totais globais
    const totalGeralTratados = totalTratados + totalQuebras + totalTrocas + totalSemAcao;
    const taxaGeralSucesso = totalGeralTratados > 0 ? Math.round((totalTratados / totalGeralTratados) * 100) : 100;

    const totalKg = monthlyProducts.filter(p => p.unit === 'kg').reduce((acc, p) => acc + (p.quantity || 0), 0);
    const totalUn = monthlyProducts.filter(p => p.unit !== 'kg').reduce((acc, p) => acc + (p.quantity || 0), 0);

    // Atualiza o botão de impressão principal com a informação do setor ativo
    const btnLabel = container.querySelector('#btn-print-label');
    if (btnLabel) {
      const sectorNames = {
        all: 'Imprimir',
        acougue: 'Imprimir (Açougue)',
        pereciveis: 'Imprimir (Perecíveis)'
      };
      btnLabel.textContent = sectorNames[this.currentSector] || 'Imprimir';
    }

    // Filtrar os setores exibidos na tela de acordo com a seleção atual
    const displaySectors = this.currentSector === 'all'
      ? sectorStats
      : sectorStats.filter(sec => sec.id === this.currentSector);

    const overviewContainer = container.querySelector('#resumo-cards-overview');
    if (overviewContainer) {
      const cardsTotalItems = activeSectorStats ? activeSectorStats.total : totalItems;
      const cardsTotalKg = activeSectorStats ? activeSectorStats.totalKg : totalKg;
      const cardsTotalUn = activeSectorStats ? activeSectorStats.totalUn : totalUn;
      const cardsTaxaSucesso = activeSectorStats ? activeSectorStats.successRate : taxaGeralSucesso;
      const cardsSalvoKg = activeSectorStats ? activeSectorStats.tratadosKg : totalKgTratados;
      const cardsSalvoUn = activeSectorStats ? activeSectorStats.tratadosUn : totalUnTratados;
      const cardsQuebras = activeSectorStats ? activeSectorStats.quebras : totalQuebras;
      const cardsTrocas = activeSectorStats ? activeSectorStats.trocas : totalTrocas;

      overviewContainer.innerHTML = `
        <div class="metric-card">
          <div class="metric-card__icon">📊</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Total Registros (Mês)</p>
            <p class="metric-card__value" style="font-size:1.5rem; line-height:1.2;">${cardsTotalItems} itens</p>
            <p class="text-secondary" style="font-size:0.75rem; margin-top:0.25rem;">${cardsTotalKg.toFixed(1)} kg / ${cardsTotalUn} un</p>
          </div>
        </div>
        <div class="metric-card metric-card--success">
          <div class="metric-card__icon">✔️</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Taxa Global de Sucesso</p>
            <p class="metric-card__value">${cardsTaxaSucesso}%</p>
            <p class="text-secondary" style="font-size:0.75rem; margin-top:0.25rem;">Salvo: ${cardsSalvoKg.toFixed(1)} kg / ${cardsSalvoUn} un</p>
          </div>
        </div>
        <div class="metric-card metric-card--danger">
          <div class="metric-card__icon">🗑️</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Total Quebras (Perda)</p>
            <p class="metric-card__value">${cardsQuebras}</p>
            <p class="text-secondary" style="font-size:0.75rem; margin-top:0.25rem;">Descartados / Perda seca</p>
          </div>
        </div>
        <div class="metric-card metric-card--warning">
          <div class="metric-card__icon">🔄</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Total Trocas</p>
            <p class="metric-card__value">${cardsTrocas}</p>
            <p class="text-secondary" style="font-size:0.75rem; margin-top:0.25rem;">Devoluções de fornecedores</p>
          </div>
        </div>
      `;
    }

    // Cálculo do Top Quebras (Semana e Mês)
    const quebraProducts = monthlyProducts.filter(p => p.expiredAction === 'quebra' || p.expiredAction === 'troca');
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const calcTop10 = (items) => {
      if (items.length === 0) return [];
      const counts = {};
      const productMap = {};
      items.forEach(i => {
        counts[i.plu] = (counts[i.plu] || 0) + (i.quantity ? parseFloat(i.quantity) : 1);
        if (!productMap[i.plu]) productMap[i.plu] = i;
      });
      
      return Object.keys(counts).map(plu => ({
        plu,
        name: productMap[plu].name,
        category: productMap[plu].category,
        action: productMap[plu].expiredAction,
        unit: productMap[plu].unit || 'kg',
        count: counts[plu]
      })).sort((a, b) => b.count - a.count).slice(0, 10);
    };

    const weekItems = quebraProducts.filter(p => new Date(p.endDate) >= oneWeekAgo);
    this.top10WeekData = calcTop10(weekItems);
    this.top10MonthData = calcTop10(quebraProducts);

    const topWeek = this.top10WeekData.length > 0 ? this.top10WeekData[0] : { name: 'Nenhum registro', count: '-' };
    const topMonth = this.top10MonthData.length > 0 ? this.top10MonthData[0] : { name: 'Nenhum registro', count: '-' };

    const set = (id, val) => {
      const el = container.querySelector(`#${id}`);
      if (el) el.textContent = val;
    };

    set('top-quebra-week-name', topWeek.name);
    set('top-quebra-week-count', topWeek.count !== '-' ? `Quantidade: ${topWeek.count} ${topWeek.unit || ''}` : '');
    set('top-quebra-month-name', topMonth.name);
    set('top-quebra-month-count', topMonth.count !== '-' ? `Quantidade: ${topMonth.count} ${topMonth.unit || ''}` : '');

    // Atualiza a lista de relatórios por setor
    const listContainer = container.querySelector('#resumo-sectors-list');
    if (listContainer) {
      if (totalItems === 0 || displaySectors.length === 0) {
        listContainer.innerHTML = `
          <div class="glass-panel" style="padding: 3rem; text-align: center;">
            <p class="text-secondary" style="font-size: 1.1rem;">Nenhum produto cadastrado com validade para o período de ${this.currentMonth}/${this.currentYear}.</p>
          </div>
        `;
        return;
      }

      listContainer.innerHTML = displaySectors.map(sec => {
        let statusClass = 'success';
        if (sec.successRate < 50) statusClass = 'danger';
        else if (sec.successRate < 80) statusClass = 'warning';

        // Filtrar produtos específicos deste setor
        const secProducts = monthlyProducts.filter(sec.filter);

        const ofensoresHTML = sec.topOfensores.length > 0 
          ? sec.topOfensores.map((o, idx) => `
              <div style="display:flex; justify-content:space-between; align-items:center; padding: 0.5rem 0; border-bottom: 1px solid var(--glass-border);">
                <span style="font-size: 0.9rem; color: var(--text-primary);">${idx + 1}. ${o.name}</span>
                <span class="badge badge--expired" style="font-size: 0.8rem; padding: 2px 8px;">${o.qty} perdidos</span>
              </div>
            `).join('')
          : `<p class="text-secondary" style="font-size: 0.85rem; font-style: italic; margin: 0.5rem 0 0 0;">Nenhum ofensor de perda este mês!</p>`;

        // Recomendações práticas baseadas nos dados
        let recomendacaoText = '';
        if (sec.successRate === 100) {
          recomendacaoText = '🏆 Excelente trabalho! O setor alcançou 100% de eficácia no tratamento de validades. Continue com a rotina de monitoramento diário.';
        } else if (sec.semAcao > 0) {
          recomendacaoText = `⚠️ <b>Atenção:</b> Existem ${sec.semAcao} itens que venceram sem nenhum registro de ação. Reforce com a equipe a importância de registrar se o item foi rebaixado, descartado ou trocado assim que atingir a data limite.`;
        } else if (sec.quebras > sec.tratados) {
          recomendacaoText = `📉 <b>Oportunidade:</b> O volume de quebras (${sec.quebras}) é superior ao tratado com sucesso (${sec.tratados}). Recomenda-se reduzir o estoque de segurança dos itens listados abaixo ou antecipar o início das ofertas de rebaixa.`;
        } else {
          recomendacaoText = `💡 <b>Ajuste Fino:</b> Para melhorar a taxa de ${sec.successRate}%, inicie a ação de rebaixa de preços com 3 dias de antecedência para os produtos com maior recorrência de perdas.`;
        }

        // Tabela detalhada de itens e destinos
        const itemsTableHTML = secProducts.length > 0
          ? `
            <div style="margin-top: 1rem; overflow-x: auto; background: rgba(128, 128, 128, 0.04); border-radius: 8px; padding: 0.75rem; border: 1px solid var(--glass-border);">
              <h4 style="font-size:0.95rem; font-weight:600; color: var(--text-secondary); margin: 0 0 0.75rem 0;">📋 Detalhes dos Itens do Setor</h4>
              <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                  <tr style="border-bottom: 1.5px solid var(--glass-border); font-size: 0.8rem; color: var(--text-secondary);">
                    <th style="padding: 6px 8px;">PLU</th>
                    <th style="padding: 6px 8px;">Produto</th>
                    <th style="padding: 6px 8px; text-align: right;">Quantidade</th>
                    <th style="padding: 6px 8px; text-align: center;">Destino / Status</th>
                  </tr>
                </thead>
                <tbody style="font-size: 0.82rem; color: var(--text-primary);">
                  ${secProducts.map(p => {
                    let badgeClass = 'badge--ok';
                    let statusLabel = 'Tratado com Sucesso';
                    if (p.expiredAction === 'quebra') {
                      badgeClass = 'badge--expired';
                      statusLabel = '🗑️ Quebra';
                    } else if (p.expiredAction === 'troca') {
                      badgeClass = 'badge--warning';
                      statusLabel = '🔄 Troca';
                    } else {
                      const todayStr = new Date().toISOString().split('T')[0];
                      if (p.endDate < todayStr) {
                        badgeClass = 'badge--expired';
                        statusLabel = '🔴 Vencido s/ Ação';
                      } else {
                        badgeClass = 'badge--today';
                        statusLabel = '🟠 A Vencer';
                      }
                    }
                    return `
                      <tr style="border-bottom: 1px solid var(--glass-border);">
                        <td style="padding: 6px 8px; font-family: monospace; color: var(--text-secondary);">${p.plu}</td>
                        <td style="padding: 6px 8px; font-weight: 500; color: var(--text-primary);">${p.name}</td>
                        <td style="padding: 6px 8px; text-align: right; font-weight: 600; color: var(--text-primary);">${p.quantity || 0} ${p.unit || 'un'}</td>
                        <td style="padding: 6px 8px; text-align: center;">
                          <span class="badge ${badgeClass}" style="font-size: 0.72rem; padding: 2px 6px;">${statusLabel}</span>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          `
          : `<p class="text-secondary" style="font-size: 0.85rem; font-style: italic; margin-top: 0.5rem;">Nenhum item registrado no período.</p>`;

        const badgesEficaciaHTML = `
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;">
            <span class="badge badge--${statusClass === 'success' ? 'ok' : statusClass}" style="font-size: 0.85rem; padding: 4px 10px; font-weight: 600;" title="Eficácia por quantidade de itens">
              Itens: ${sec.successRate}%
            </span>
            ${sec.totalKg > 0 ? `
              <span class="badge badge--${sec.successRateKg >= 80 ? 'ok' : sec.successRateKg >= 50 ? 'warning' : 'danger'}" style="font-size: 0.85rem; padding: 4px 10px; font-weight: 600;" title="Eficácia baseada no peso em quilos">
                Quilos (kg): ${sec.successRateKg}%
              </span>
            ` : ''}
          </div>
        `;

        return `
          <div class="glass-panel" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.2rem;">
            <!-- Cabeçalho do Setor -->
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.75rem; flex-wrap:wrap; gap:0.5rem;">
              <h3 style="font-size: 1.2rem; font-weight: 700; color: var(--text-primary); margin:0;">${sec.name}</h3>
              <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                ${badgesEficaciaHTML}
                <button class="btn btn--sm btn--ghost btn-print-sector" data-sector="${sec.id}" style="padding: 4px 10px; font-size: 0.8rem; display:inline-flex; align-items:center; gap:4px; border: 1px solid var(--glass-border); cursor:pointer;" title="Imprimir apenas o relatório de ${sec.name}">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px; height:14px;"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                  Imprimir Setor
                </button>
              </div>
            </div>

            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
              
              <!-- Distribuição de Métricas -->
              <div style="display:flex; flex-direction:column; gap:0.8rem;">
                <h4 style="font-size:0.95rem; font-weight:600; color: var(--text-secondary); margin:0;">Resumo dos Itens</h4>
                
                <div style="display:flex; flex-direction:column; gap:0.5rem;">
                  <!-- Barra de Progresso CSS (Eficácia Geral ou por Peso) -->
                  <div style="background: rgba(128,128,128,0.1); height: 10px; border-radius: 5px; overflow: hidden; width: 100%;">
                    <div style="background: var(--success); height: 100%; width: ${sec.totalKg > 0 ? sec.successRateKg : sec.successRate}%;"></div>
                  </div>
                  
                  <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-top:0.25rem;">
                    <span style="color:var(--text-secondary);">Salvo / OK (Sucesso):</span>
                    <span style="color:var(--success); font-weight:600;">
                      ${sec.tratadosKg > 0 ? sec.tratadosKg.toFixed(1) + ' kg' : ''} 
                      ${sec.tratadosKg > 0 && sec.tratadosUn > 0 ? ' e ' : ''} 
                      ${sec.tratadosUn > 0 ? sec.tratadosUn + ' un' : ''}
                      ${sec.tratadosKg === 0 && sec.tratadosUn === 0 ? '0' : ''}
                    </span>
                  </div>
                  
                  <div style="display:flex; justify-content:space-between; font-size:0.85rem;">
                    <span style="color:var(--text-secondary);">Quebras (Perda Seca):</span>
                    <span style="color:#ef4444; font-weight:600;">${sec.quebras} un/kg</span>
                  </div>

                  <div style="display:flex; justify-content:space-between; font-size:0.85rem;">
                    <span style="color:var(--text-secondary);">Trocas pendentes/efetuadas:</span>
                    <span style="color:#3b82f6; font-weight:600;">${sec.trocas} un/kg</span>
                  </div>

                  <div style="display:flex; justify-content:space-between; font-size:0.85rem;">
                    <span style="color:var(--text-secondary);">Vencidos sem Ação:</span>
                    <span style="color:#f59e0b; font-weight:600;">${sec.semAcao} un/kg</span>
                  </div>
                </div>
              </div>

              <!-- Ofensores de Perda (O que pode melhorar) -->
              <div style="display:flex; flex-direction:column; gap:0.8rem;">
                <h4 style="font-size:0.95rem; font-weight:600; color: var(--text-secondary); margin:0;">Principais Ofensores de Perda</h4>
                <div style="background: rgba(128, 128, 128, 0.04); border-radius: 8px; padding: 0.75rem; border: 1px solid var(--glass-border);">
                  ${ofensoresHTML}
                </div>
              </div>

            </div>

            <!-- Tabela Detalhada dos Itens -->
            ${itemsTableHTML}

            <!-- Card de Ação / Recomendação -->
            <div style="background: rgba(128, 128, 128, 0.02); border-left: 4px solid ${statusClass === 'success' ? 'var(--success)' : statusClass === 'warning' ? '#f59e0b' : '#ef4444'}; padding: 0.75rem 1rem; border-radius: 0 8px 8px 0; font-size: 0.85rem; color: var(--text-primary); line-height: 1.4;">
              ${recomendacaoText}
            </div>

          </div>
        `;
      }).join('');

      // Adiciona o evento aos botões individuais de impressão por setor
      listContainer.querySelectorAll('.btn-print-sector').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const secId = e.currentTarget.getAttribute('data-sector');
          this.printResumo(secId);
        });
      });
    }
  },

  printResumo(specificSectorId) {
    const targetSector = specificSectorId || this.currentSector || 'all';
    const products = window.BrigadaData.products || [];
    const userSector = window.BrigadaAuth.currentUser?.sector || 'todos';
    const isSuperAdmin = window.BrigadaAuth.isSuperAdmin() || userSector === 'todos';

    let monthlyProducts = products.filter(p => {
      if (!p.endDate) return false;
      const [y, m] = p.endDate.split('-');
      return y === this.currentYear && m === this.currentMonth;
    });

    // Se o usuário não for Admin, restringe rigorosamente os produtos do PDF ao seu próprio setor
    if (!isSuperAdmin && userSector !== 'todos') {
      const allowedCats = userSector === 'pereciveis'
        ? ['iogurtes', 'laticinios', 'frios', 'pereciveis', 'perecíveis']
        : ['aves', 'suino', 'bovino', 'pescado'];
      monthlyProducts = monthlyProducts.filter(p => allowedCats.includes(p.category));
    }

    const monthsNames = {
      '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
      '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
      '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
    };
    const monthName = monthsNames[this.currentMonth] || this.currentMonth;

    const allSectors = [
      { id: 'acougue', name: '🥩 Açougue', filter: (p) => ['aves', 'suino', 'bovino', 'pescado'].includes(p.category) },
      { id: 'pereciveis', name: '🧊 Perecíveis', filter: (p) => ['iogurtes', 'laticinios', 'frios', 'pereciveis', 'perecíveis'].includes(p.category) }
    ];

    const sectorsToProcess = targetSector === 'all'
      ? allSectors
      : allSectors.filter(s => s.id === targetSector);

    const reportProducts = targetSector === 'all'
      ? monthlyProducts
      : monthlyProducts.filter(p => sectorsToProcess.some(s => s.filter(p)));

    let totalItems = reportProducts.length;
    let totalTratados = 0;
    let totalQuebras = 0;
    let totalTrocas = 0;
    let totalSemAcao = 0;
    let totalKgTratados = 0;
    let totalUnTratados = 0;

    const totalKg = reportProducts.filter(p => p.unit === 'kg').reduce((acc, p) => acc + (p.quantity || 0), 0);
    const totalUn = reportProducts.filter(p => p.unit !== 'kg').reduce((acc, p) => acc + (p.quantity || 0), 0);

    const sectorStats = sectorsToProcess.map(sec => {
      const secProducts = monthlyProducts.filter(sec.filter);
      let tratados = 0, quebras = 0, trocas = 0, semAcao = 0;
      let tratadosKg = 0, tratadosUn = 0, totalSecKg = 0, totalSecUn = 0;
      const ofensoresMap = {};

      secProducts.forEach(p => {
        const qty = p.quantity || 0;
        const isKg = p.unit === 'kg';
        if (isKg) totalSecKg += qty; else totalSecUn += qty;

        const todayStr = new Date().toISOString().split('T')[0];
        const isNotExpired = p.endDate >= todayStr;

        if (p.expiredAction === 'tratado' || (!p.expiredAction && isNotExpired)) {
          tratados += qty;
          totalTratados += qty;
          if (isKg) { tratadosKg += qty; totalKgTratados += qty; }
          else { tratadosUn += qty; totalUnTratados += qty; }
        } else if (p.expiredAction === 'quebra') {
          quebras += qty;
          totalQuebras += qty;
          ofensoresMap[p.name] = (ofensoresMap[p.name] || 0) + qty;
        } else if (p.expiredAction === 'troca') {
          trocas += qty;
          totalTrocas += qty;
          ofensoresMap[p.name] = (ofensoresMap[p.name] || 0) + qty;
        } else {
          semAcao += qty;
          totalSemAcao += qty;
          ofensoresMap[p.name] = (ofensoresMap[p.name] || 0) + qty;
        }
      });

      const totalSec = tratados + quebras + trocas + semAcao;
      const successRate = totalSec > 0 ? Math.round((tratados / totalSec) * 100) : 100;
      const successRateKg = totalSecKg > 0 ? Math.round((tratadosKg / totalSecKg) * 100) : 100;

      const topOfensores = Object.entries(ofensoresMap)
        .map(([name, qty]) => ({ name, qty }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 3);

      return {
        ...sec,
        secProducts,
        total: totalSec,
        tratados, quebras, trocas, semAcao,
        successRate, successRateKg,
        tratadosKg, tratadosUn, totalSecKg, totalSecUn,
        topOfensores
      };
    });

    const totalGeralTratados = totalTratados + totalQuebras + totalTrocas + totalSemAcao;
    const taxaGeralSucesso = totalGeralTratados > 0 ? Math.round((totalTratados / totalGeralTratados) * 100) : 100;
    const dateStr = new Date().toLocaleString('pt-BR');

    const reportTitle = targetSector !== 'all' && sectorsToProcess.length === 1
      ? `BRIGADA-IA — Resumo Mensal (${sectorsToProcess[0].name})`
      : `BRIGADA-IA — Resumo Mensal por Setor`;

    const printHTML = `
      <div class="print-resumo-container">
        <style>
          @media print {
            @page { size: A4 portrait; margin: 10mm; }
          }
          .print-resumo-container {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            color: #0f172a;
            padding: 10px;
            background: #ffffff;
            line-height: 1.35;
          }
          .print-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2.5px solid #0284c7;
            padding-bottom: 10px;
            margin-bottom: 14px;
          }
          .print-title { font-size: 1.35rem; font-weight: 800; color: #0f172a; margin: 0; }
          .print-subtitle { font-size: 0.85rem; color: #64748b; margin: 3px 0 0 0; }
          .print-badge-period {
            background: #f0f9ff;
            color: #0369a1;
            font-size: 0.95rem;
            font-weight: 700;
            padding: 6px 12px;
            border-radius: 8px;
            border: 1px solid #bae6fd;
            text-align: right;
          }
          .print-overview-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 16px;
          }
          .print-card {
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 8px 10px;
            background: #f8fafc;
          }
          .print-card-title { font-size: 0.72rem; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 2px; }
          .print-card-val { font-size: 1.25rem; font-weight: 800; color: #0f172a; }
          .print-card-sub { font-size: 0.72rem; color: #475569; margin-top: 1px; }

          .print-sector-block {
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            margin-bottom: 14px;
            padding: 10px 12px;
            page-break-inside: avoid;
            background: #ffffff;
          }
          .print-sector-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 6px;
            margin-bottom: 8px;
          }
          .print-sector-title { font-size: 1.05rem; font-weight: 700; color: #0f172a; margin: 0; }
          .print-rates { display: flex; gap: 6px; font-size: 0.78rem; font-weight: 700; }
          .rate-tag { background: #dcfce7; color: #15803d; padding: 2px 7px; border-radius: 4px; border: 1px solid #bbf7d0; }

          .print-sector-body {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 8px;
          }
          .print-subhead { font-size: 0.82rem; font-weight: 700; color: #334155; margin: 0 0 4px 0; border-bottom: 1px solid #f1f5f9; padding-bottom: 2px; }
          .print-stat-line { display: flex; justify-content: space-between; font-size: 0.78rem; padding: 2px 0; border-bottom: 1px dashed #f1f5f9; }

          .print-table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 0.78rem; }
          .print-table th { background: #f1f5f9; color: #334155; padding: 5px 6px; text-align: left; border-bottom: 2px solid #cbd5e1; font-weight: 700; }
          .print-table td { padding: 4px 6px; border-bottom: 1px solid #e2e8f0; color: #1e293b; }

          .print-signatures {
            margin-top: 24px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            page-break-inside: avoid;
          }
          .signature-box { border-top: 1.5px dashed #94a3b8; text-align: center; padding-top: 6px; font-size: 0.8rem; color: #475569; }
        </style>

        <div class="print-header">
          <div>
            <h1 class="print-title">${reportTitle}</h1>
            <p class="print-subtitle">Relatório Consolidado de Eficiência de Validade e Prevenção de Perdas</p>
            <p style="font-size:0.72rem; color:#64748b; margin:2px 0 0 0;">Gerado em: ${dateStr}</p>
          </div>
          <div class="print-badge-period">
            📅 ${monthName} / ${this.currentYear}
          </div>
        </div>

        <!-- Indicadores Globais -->
        <div class="print-overview-grid">
          <div class="print-card">
            <div class="print-card-title">Total Registros</div>
            <div class="print-card-val">${totalItems} itens</div>
            <div class="print-card-sub">${totalKg.toFixed(1)} kg / ${totalUn} un</div>
          </div>
          <div class="print-card" style="border-left: 4px solid #16a34a;">
            <div class="print-card-title">Taxa de Sucesso</div>
            <div class="print-card-val" style="color: #16a34a;">${taxaGeralSucesso}%</div>
            <div class="print-card-sub">Salvo: ${totalKgTratados.toFixed(1)} kg / ${totalUnTratados} un</div>
          </div>
          <div class="print-card" style="border-left: 4px solid #dc2626;">
            <div class="print-card-title">Perda Seca (Quebras)</div>
            <div class="print-card-val" style="color: #dc2626;">${totalQuebras}</div>
            <div class="print-card-sub">Descartados</div>
          </div>
          <div class="print-card" style="border-left: 4px solid #2563eb;">
            <div class="print-card-title">Devoluções (Trocas)</div>
            <div class="print-card-val" style="color: #2563eb;">${totalTrocas}</div>
            <div class="print-card-sub">Fornecedor</div>
          </div>
        </div>

        <!-- Detalhamento por Setor -->
        ${sectorStats.map(sec => `
          <div class="print-sector-block">
            <div class="print-sector-header">
              <h3 class="print-sector-title">${sec.name}</h3>
              <div class="print-rates">
                <span class="rate-tag">Eficácia Itens: ${sec.successRate}%</span>
                ${sec.totalSecKg > 0 ? `<span class="rate-tag" style="background:#e0f2fe; color:#0369a1; border-color:#bae6fd;">Eficácia Kg: ${sec.successRateKg}%</span>` : ''}
              </div>
            </div>

            <div class="print-sector-body">
              <div>
                <h4 class="print-subhead">📊 Distribuição dos Atendimentos</h4>
                <div class="print-stat-line">
                  <span>Tratados com Sucesso:</span>
                  <strong style="color:#16a34a;">
                    ${sec.tratadosKg > 0 ? sec.tratadosKg.toFixed(1) + ' kg' : ''} 
                    ${sec.tratadosKg > 0 && sec.tratadosUn > 0 ? ' e ' : ''} 
                    ${sec.tratadosUn > 0 ? sec.tratadosUn + ' un' : ''}
                    ${sec.tratadosKg === 0 && sec.tratadosUn === 0 ? '0' : ''}
                  </strong>
                </div>
                <div class="print-stat-line">
                  <span>Quebras (Descarte):</span>
                  <strong style="color:#dc2626;">${sec.quebras} un/kg</strong>
                </div>
                <div class="print-stat-line">
                  <span>Trocas (Devoluções):</span>
                  <strong style="color:#2563eb;">${sec.trocas} un/kg</strong>
                </div>
                <div class="print-stat-line">
                  <span>Vencidos Sem Ação:</span>
                  <strong style="color:#d97706;">${sec.semAcao} un/kg</strong>
                </div>
              </div>

              <div>
                <h4 class="print-subhead">🚨 Principais Ofensores de Perda</h4>
                ${sec.topOfensores.length > 0 ? sec.topOfensores.map((o, idx) => `
                  <div class="print-stat-line">
                    <span>${idx + 1}. ${o.name}</span>
                    <strong style="color:#dc2626;">${o.qty} perdidos</strong>
                  </div>
                `).join('') : '<p style="font-size:0.75rem; color:#64748b; font-style:italic; margin:3px 0;">Nenhum ofensor registrado no mês.</p>'}
              </div>
            </div>

            <!-- Tabela Detalhada -->
            ${sec.secProducts.length > 0 ? `
              <h4 class="print-subhead" style="margin-top:6px;">📋 Produtos do Setor no Período</h4>
              <table class="print-table">
                <thead>
                  <tr>
                    <th style="width: 70px;">PLU</th>
                    <th>Produto</th>
                    <th style="width: 90px; text-align: right;">Quantidade</th>
                    <th style="width: 120px; text-align: center;">Status / Destino</th>
                  </tr>
                </thead>
                <tbody>
                  ${sec.secProducts.map(p => {
                    let statusTxt = 'OK / Tratado';
                    if (p.expiredAction === 'quebra') statusTxt = 'Quebra (Descarte)';
                    else if (p.expiredAction === 'troca') statusTxt = 'Troca (Fornecedor)';
                    else {
                      const todayStr = new Date().toISOString().split('T')[0];
                      if (p.endDate < todayStr) statusTxt = 'Vencido s/ Ação';
                      else statusTxt = 'A Vencer (OK)';
                    }
                    return `
                      <tr>
                        <td style="font-family: monospace;">${p.plu}</td>
                        <td><strong>${p.name}</strong></td>
                        <td style="text-align: right;">${p.quantity || 0} ${p.unit || 'un'}</td>
                        <td style="text-align: center;">${statusTxt}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            ` : ''}
          </div>
        `).join('')}

        <!-- Assinaturas -->
        <div class="print-signatures">
          <div class="signature-box">
            ________________________________________________<br>
            <strong>Responsável pela Contagem / Setor</strong>
          </div>
          <div class="signature-box">
            ________________________________________________<br>
            <strong>Liderança / Gerência da Loja</strong>
          </div>
        </div>
      </div>
    `;

    if (window.BrigadaUI && window.BrigadaUI.printContent) {
      window.BrigadaUI.printContent(printHTML);
    } else {
      window.print();
    }
  },

  openTop10Modal(container, dataList, title) {
    this.currentTop10Data = dataList;
    container.querySelector('#top10-modal-title').textContent = title;
    const listContainer = container.querySelector('#top10-list');
    
    if (!dataList || dataList.length === 0) {
      listContainer.innerHTML = '<div class="empty-state" style="padding:2rem;"><p>Nenhum dado encontrado para o período.</p></div>';
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
                <td style="font-weight:bold; font-size:1.1rem;">${item.count} ${item.unit || ''}</td>
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
                <td><strong>${item.count} ${item.unit || ''}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    window.BrigadaUI.printContent(printContent);
  }
};

/**
 * BRIGADA-IA — Resumo Mensal por Setor Module
 */

window.BrigadaResumoMensal = {
  currentYear: new Date().getFullYear().toString(),
  currentMonth: (new Date().getMonth() + 1).toString().padStart(2, '0'),

  render(container) {
    this.initFilters();
    container.innerHTML = this.buildHTML();
    this.bindEvents(container);
    this.calculateAndRenderMetrics(container);
  },

  initFilters() {
    // Garante que o ano e o mês padrão estejam definidos caso estejam vazios ou inválidos
    if (!this.currentYear || this.currentYear === 'all') {
      this.currentYear = new Date().getFullYear().toString();
    }
    if (!this.currentMonth || this.currentMonth === 'all') {
      this.currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
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

    return `
      <div class="panel-header">
        <div class="panel-header__left">
          <h2 class="panel-title">📅 Resumo Mensal por Setor</h2>
          <p class="panel-subtitle">Análise de eficiência de tratamento de validade e oportunidades de melhoria</p>
        </div>
        <div class="glass-actions-card" style="display:flex; gap:var(--sp-sm); flex-wrap:wrap; align-items:center;">
          <!-- Filtro de Ano -->
          <select id="resumo-year-select" class="select-control" style="min-width: 100px;">
            ${years.map(y => `<option value="${y}" ${this.currentYear === y ? 'selected' : ''}>${y}</option>`).join('')}
          </select>
          <!-- Filtro de Mês -->
          <select id="resumo-month-select" class="select-control" style="min-width: 140px;">
            ${months.map(m => `<option value="${m.val}" ${this.currentMonth === m.val ? 'selected' : ''}>${m.name}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Resumo Geral Cards -->
      <div class="dashboard-grid dashboard-grid--4 stagger" style="margin-top: 1.5rem;" id="resumo-cards-overview">
        <!-- Injetado dinamicamente -->
      </div>

      <!-- Relatório Detalhado por Setor -->
      <div class="sectors-report-container" style="margin-top: 2rem; display: flex; flex-direction: column; gap: 2rem;" id="resumo-sectors-list">
        <!-- Injetado dinamicamente -->
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

    yearSelect?.addEventListener('change', (e) => {
      this.currentYear = e.target.value;
      this.calculateAndRenderMetrics(container);
    });

    monthSelect?.addEventListener('change', (e) => {
      this.currentMonth = e.target.value;
      this.calculateAndRenderMetrics(container);
    });
  },

  calculateAndRenderMetrics(container) {
    const products = window.BrigadaData.products || [];
    
    // Filtrar produtos que vencem/venceram no mês e ano selecionados
    const monthlyProducts = products.filter(p => {
      if (!p.endDate) return false;
      const [y, m] = p.endDate.split('-');
      return y === this.currentYear && m === this.currentMonth;
    });

    // Mapeamento de setores
    const sectors = [
      {
        id: 'acougue',
        name: '🥩 Açougue',
        filter: (p) => ['aves', 'suino', 'bovino', 'pescado'].includes(p.category)
      },
      {
        id: 'padaria',
        name: '🍞 Padaria',
        filter: (p) => p.category === 'padaria'
      },
      {
        id: 'hortifruti',
        name: '🥦 Hortifruti',
        filter: (p) => p.category === 'hortifruti'
      },
      {
        id: 'mercearia',
        name: '🛒 Mercearia / Perecíveis',
        filter: (p) => ['mercearia', 'laticinios', 'frios'].includes(p.category) || (!['aves', 'suino', 'bovino', 'pescado', 'padaria', 'hortifruti'].includes(p.category))
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

    // Atualiza os cards gerais de overview
    const totalGeralTratados = totalTratados + totalQuebras + totalTrocas + totalSemAcao;
    const taxaGeralSucesso = totalGeralTratados > 0 ? Math.round((totalTratados / totalGeralTratados) * 100) : 100;

    const totalKg = monthlyProducts.filter(p => p.unit === 'kg').reduce((acc, p) => acc + (p.quantity || 0), 0);
    const totalUn = monthlyProducts.filter(p => p.unit !== 'kg').reduce((acc, p) => acc + (p.quantity || 0), 0);

    const overviewContainer = container.querySelector('#resumo-cards-overview');
    if (overviewContainer) {
      overviewContainer.innerHTML = `
        <div class="metric-card">
          <div class="metric-card__icon">📊</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Total Registros (Mês)</p>
            <p class="metric-card__value" style="font-size:1.5rem; line-height:1.2;">${totalItems} itens</p>
            <p class="text-secondary" style="font-size:0.75rem; margin-top:0.25rem;">${totalKg.toFixed(1)} kg / ${totalUn} un</p>
          </div>
        </div>
        <div class="metric-card metric-card--success">
          <div class="metric-card__icon">✔️</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Taxa Global de Sucesso</p>
            <p class="metric-card__value">${taxaGeralSucesso}%</p>
            <p class="text-secondary" style="font-size:0.75rem; margin-top:0.25rem;">Salvo: ${totalKgTratados.toFixed(1)} kg / ${totalUnTratados} un</p>
          </div>
        </div>
        <div class="metric-card metric-card--danger">
          <div class="metric-card__icon">🗑️</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Total Quebras (Perda)</p>
            <p class="metric-card__value">${totalQuebras}</p>
            <p class="text-secondary" style="font-size:0.75rem; margin-top:0.25rem;">Descartados / Perda seca</p>
          </div>
        </div>
        <div class="metric-card metric-card--warning">
          <div class="metric-card__icon">🔄</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Total Trocas</p>
            <p class="metric-card__value">${totalTrocas}</p>
            <p class="text-secondary" style="font-size:0.75rem; margin-top:0.25rem;">Devoluções de fornecedores</p>
          </div>
        </div>
      `;
    }

    // Atualiza a lista de relatórios por setor
    const listContainer = container.querySelector('#resumo-sectors-list');
    if (listContainer) {
      if (totalItems === 0) {
        listContainer.innerHTML = `
          <div class="glass-panel" style="padding: 3rem; text-align: center;">
            <p class="text-secondary" style="font-size: 1.1rem;">Nenhum produto cadastrado com validade para o período de ${this.currentMonth}/${this.currentYear}.</p>
          </div>
        `;
        return;
      }

      listContainer.innerHTML = sectorStats.map(sec => {
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
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
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
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.75rem;">
              <h3 style="font-size: 1.2rem; font-weight: 700; color: var(--text-primary); margin:0;">${sec.name}</h3>
              ${badgesEficaciaHTML}
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
                <div style="background: rgba(128,128,128,0.04); border-radius: 8px; padding: 0.75rem; border: 1px solid var(--glass-border);">
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
    }
  }
};

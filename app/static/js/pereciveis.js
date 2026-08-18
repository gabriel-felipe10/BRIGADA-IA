/**
 * BRIGADA-IA — Perecíveis Module (Completamente equivalente ao módulo de Açougue)
 */

window.BrigadaPereciveis = {
  currentFilter: 'all',
  currentSearch: '',
  editingId: null,
  originalQuantity: 0,
  currentDay: 'all',
  currentMonth: 'all',
  currentYear: 'all',
  catalogModalSearch: '',
  catalogModalCategory: 'all',
  catMap: {
    iogurtes: '🍦 Iogurtes',
    laticinios: '🧀 Laticínios',
    frios: '🥓 Frios',
    pereciveis: '🍎 Perecíveis',
    'perecíveis': '🍎 Perecíveis'
  },

  render(container) {
    container.innerHTML = this.buildHTML();
    this.bindEvents(container);
    this.renderTable(container);
  },

  buildHTML() {
    const canAddProduct = window.BrigadaAuth.canAddProduct();
    const isSuperAdmin = window.BrigadaAuth.isSuperAdmin();

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
          <h2 class="panel-title">🍎 Gestão de Perecíveis</h2>
          <p class="panel-subtitle">Controle completo do estoque de perecíveis por categoria</p>
        </div>
        <div class="glass-actions-card" style="display:flex; gap:var(--sp-sm); flex-wrap:wrap; align-items:center;">
          ${isSuperAdmin ? `
          <button class="btn btn--primary" id="btn-import-csv-pereciveis" title="Importar produtos via CSV">
            <span>📥</span> Importar
          </button>
          ` : ''}
          <button class="btn btn--primary" id="btn-request-reduction-pereciveis" title="Mover selecionados para Aguardando Rebaixa">
            <span>📉</span> Rebaixar
          </button>
          <button class="btn btn--primary" id="btn-export-excel-pereciveis" title="Exportar para Excel">
            <span>📗</span> Excel
          </button>
          <button class="btn btn--primary" id="btn-export-pdf-pereciveis" title="Exportar para PDF">
            <span>📄</span> PDF
          </button>
          ${canAddProduct ? `
          <button class="btn btn--primary" id="btn-add-product-pereciveis">
            <span>＋</span> Novo Produto
          </button>
          ` : ''}
        </div>
      </div>

      <!-- Hidden file input for CSV import -->
      <input type="file" id="import-file-input-pereciveis" accept=".csv" style="display:none;">

      <div class="glass-panel" style="padding: 1.5rem; margin-top: 1rem;">
        <div class="category-tabs" id="category-tabs-pereciveis">
          <button class="cat-tab cat-tab--active" data-cat="all">🏪 Todos</button>
          <button class="cat-tab" data-cat="iogurtes">🍦 Iogurtes</button>
          <button class="cat-tab" data-cat="laticinios">🧀 Laticínios</button>
          <button class="cat-tab" data-cat="frios">🥓 Frios</button>
          <button class="cat-tab" data-cat="pereciveis">🍎 Perecíveis</button>
        </div>

        <!-- Barra de Ferramentas e Filtros Unificada -->
        <div class="toolbar" style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; margin-bottom: 1.25rem; padding: 0.75rem 1rem; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px solid var(--glass-border);">
          <!-- Busca -->
          <div class="search-box" style="display: flex; gap: 0.5rem; flex: 1; min-width: 240px;">
            <div style="position: relative; flex: 1; display: flex; align-items: center;">
              <span class="search-icon" style="position: absolute; left: 1rem; font-size: 0.9rem;">🔍</span>
              <input type="text" id="search-products-pereciveis" class="search-input" placeholder="Buscar por produto, PLU..." style="width: 100%; padding-left: 2.5rem; height: 38px;">
            </div>
            <button id="btn-scan-products-pereciveis" class="btn btn--outline" style="padding: 0 0.85rem; height: 38px;" title="Escanear Código">📷</button>
          </div>

          <!-- Filtros de Validade -->
          <div style="display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap;">
            <span style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 500; margin-right: 2px;">📅</span>
            <select id="pereciveis-filter-day" class="select-control" style="padding: 0.35rem 1.75rem 0.35rem 0.75rem; min-width: 85px; height: 38px; font-size: 0.85rem;">
              ${dayOptions}
            </select>
            <select id="pereciveis-filter-month" class="select-control" style="padding: 0.35rem 1.75rem 0.35rem 0.75rem; min-width: 110px; height: 38px; font-size: 0.85rem;">
              ${monthOptions}
            </select>
            <select id="pereciveis-filter-year" class="select-control" style="padding: 0.35rem 1.75rem 0.35rem 0.75rem; min-width: 95px; height: 38px; font-size: 0.85rem;">
              ${yearOptions}
            </select>
            <button id="btn-clear-pereciveis-date-filters" class="btn btn--ghost" style="padding: 0 0.75rem; height: 38px; font-size: 0.85rem; border-radius: var(--r-full);" title="Limpar filtro de data">
              🧹
            </button>
          </div>

          <!-- Filtro de Status -->
          <div style="min-width: 170px;">
            <select id="filter-status-pereciveis" class="select-control" style="height: 38px; font-size: 0.85rem;">
              <option value="all">📊 Todos os status</option>
              <option value="congelado30">🥶 Alerta Congelados (≤ 30d)</option>
              <option value="resfriado15">❄️ Alerta Resfriados (≤ 15d)</option>
              <option value="warning">🟡 Atenção (1-3d)</option>
              <option value="today">🟠 Vence Hoje</option>
              <option value="expired">🔴 Vencido</option>
              <option value="ok">🟢 OK</option>
              <option value="rebaixa">📉 Aguardando Rebaixa</option>
              <option value="tratado">✔️ Tratado com Sucesso</option>
            </select>
          </div>
        </div>

        <!-- Barra de Ações em Massa (visível quando há itens selecionados) -->
        <div id="batch-actions-bar-pereciveis" style="display: none; align-items: center; justify-content: space-between; padding: 0.75rem 1.25rem; background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.3); border-radius: 10px; margin-bottom: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem; color: #a5b4fc; font-weight: 600; font-size: 0.9rem;">
            <span>📦</span> <span id="batch-selected-count-pereciveis">0 produtos selecionados</span>
          </div>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn btn--primary" id="btn-batch-rebaixa-pereciveis" style="padding: 4px 12px; font-size: 0.8rem; height: 32px;">📉 Rebaixar</button>
            <button class="btn btn--outline" id="btn-batch-quebra-pereciveis" style="padding: 4px 12px; font-size: 0.8rem; height: 32px; border-color: rgba(239,68,68,0.4); color: #f87171;">🗑️ Quebra</button>
            <button class="btn btn--outline" id="btn-batch-troca-pereciveis" style="padding: 4px 12px; font-size: 0.8rem; height: 32px; border-color: rgba(59,130,246,0.4); color: #60a5fa;">🔄 Troca</button>
            <button class="btn btn--outline" id="btn-batch-tratado-pereciveis" style="padding: 4px 12px; font-size: 0.8rem; height: 32px; border-color: rgba(16,185,129,0.4); color: #34d399;">✔️ Tratado</button>
          </div>
        </div>

        <div class="table-wrapper" id="products-table-wrapper-pereciveis">
          <!-- tabela renderizada dinamicamente -->
        </div>
      </div>

      <!-- Modal de produto -->
      <!-- Modal de produto Perecíveis -->
      <div class="modal-overlay" id="product-modal-pereciveis" style="display:none;">
        <div class="modal" style="max-width: 580px;">
          <div class="modal-header">
            <h3 class="modal-title" id="modal-title-pereciveis">Novo Produto Perecível</h3>
            <button class="modal-close" id="modal-close-pereciveis">✕</button>
          </div>
          <div class="modal-body" style="padding: 1.25rem;">
            <!-- ETAPA 1: Seleção Inteligente por Catálogo -->
            <div id="product-modal-step-catalog-pereciveis">
              <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 0; margin-bottom: 12px;">
                Selecione o produto do catálogo abaixo para preenchimento ágil:
              </p>

              <div class="search-box" style="width: 100%; margin-bottom: 0.75rem; display: flex; align-items: center;">
                <span class="search-icon">🔍</span>
                <input type="text" id="catalog-modal-search-pereciveis" class="search-input" placeholder="Buscar por produto ou PLU..." autocomplete="off">
                <button type="button" id="catalog-modal-voice-btn-pereciveis" class="search-mic-btn" style="background:none; border:none; color:var(--text-secondary); cursor:pointer; padding:6px 10px;" title="Buscar por voz">🎙️</button>
              </div>

              <div class="cat-quick-tabs" id="catalog-modal-cat-tabs-pereciveis" style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;">
                <button type="button" class="cat-tab cat-tab--sm cat-tab--active" data-mcat="all">Todos</button>
                <button type="button" class="cat-tab cat-tab--sm" data-mcat="laticinios">🧀 Laticínios</button>
                <button type="button" class="cat-tab cat-tab--sm" data-mcat="frios">🥓 Frios</button>
                <button type="button" class="cat-tab cat-tab--sm" data-mcat="iogurtes">🍦 Iogurtes</button>
                <button type="button" class="cat-tab cat-tab--sm" data-mcat="pereciveis">🍎 Perecíveis</button>
              </div>

              <div class="table-scroll" style="max-height: 260px; overflow-y: auto; margin-bottom: 1rem; border: 1px solid var(--border-color); border-radius: 8px;">
                <table class="data-table" style="margin: 0;">
                  <thead>
                    <tr>
                      <th style="width: 75px;">PLU</th>
                      <th>PRODUTO</th>
                      <th style="width: 95px; text-align: right;">AÇÃO</th>
                    </tr>
                  </thead>
                  <tbody id="catalog-modal-tbody-pereciveis">
                    <!-- Linhas geradas dinamicamente -->
                  </tbody>
                </table>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 10px;">
                <span id="catalog-modal-count-pereciveis" style="font-size: 0.8rem; color: var(--text-secondary);">0 produtos disponíveis</span>
                <button type="button" class="btn btn--outline btn--sm" id="btn-switch-to-manual-form-pereciveis" style="font-weight: 600;">
                  ✍️ Preenchimento Manual
                </button>
              </div>
            </div>

            <!-- ETAPA 2: Formulário de Preenchimento do Lote -->
            <div id="product-modal-step-form-pereciveis" style="display: none;">
              <!-- Card do Produto Selecionado -->
              <div id="selected-catalog-card-pereciveis" style="display: none; background: rgba(56,189,248,0.08); border: 1px solid rgba(56,189,248,0.25); border-radius: 8px; padding: 10px 14px; margin-bottom: 1rem; align-items: center; justify-content: space-between;">
                <div>
                  <div id="selected-catalog-name-pereciveis" style="font-weight: 700; font-size: 0.98rem; color: var(--text-primary);">Nome do Produto</div>
                  <div style="display: flex; gap: 8px; font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">
                    <span>PLU: <b id="selected-catalog-plu-pereciveis" style="color: #38bdf8;">PE001</b></span>
                    <span>•</span>
                    <span>Categoria: <b id="selected-catalog-cat-pereciveis">Laticínios</b></span>
                  </div>
                </div>
                <button type="button" class="btn btn--ghost btn--sm" id="btn-back-to-catalog-pereciveis" style="font-size: 0.78rem; padding: 4px 8px; color: #38bdf8;">
                  ← Trocar Produto
                </button>
              </div>

              <form id="product-form-pereciveis">
                <input type="hidden" id="field-id-pereciveis">
                <div class="form-row" id="manual-fields-row-pereciveis" style="display: none;">
                  <div class="form-group" style="position: relative;">
                    <label class="form-label">PLU *</label>
                    <input type="text" id="field-plu-pereciveis" class="form-input" placeholder="ex: PE001" autocomplete="off" required>
                    <div id="plu-suggestions-pereciveis" class="autocomplete-suggestions"></div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Categoria *</label>
                    <select id="field-category-pereciveis" class="form-input" required>
                      <option value="">Selecione...</option>
                      <option value="iogurtes">🍦 Iogurtes</option>
                      <option value="laticinios">🧀 Laticínios</option>
                      <option value="frios">🥓 Frios</option>
                      <option value="pereciveis">🍎 Perecíveis</option>
                    </select>
                  </div>
                </div>
                <div class="form-group" id="manual-name-group-pereciveis" style="position: relative; margin-bottom: 1rem; display: none;">
                  <label class="form-label">Nome do Produto *</label>
                  <input type="text" id="field-name-pereciveis" class="form-input" placeholder="Nome do produto" autocomplete="off" required>
                  <div id="name-suggestions-pereciveis" class="autocomplete-suggestions"></div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Data de Cadastro</label>
                    <input type="text" id="field-startDate-pereciveis" class="form-input" placeholder="DD/MM/AAAA" inputmode="numeric" maxlength="10">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Data Final (Validade) *</label>
                    <input type="text" id="field-endDate-pereciveis" class="form-input" placeholder="DD/MM/AAAA" inputmode="numeric" maxlength="10" required>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                      <label class="form-label" style="margin-bottom: 0;">Fornecedor</label>
                      <button type="button" class="btn btn--ghost btn--sm" id="btn-open-supplier-modal-pereciveis" style="font-size: 0.72rem; padding: 2px 6px; color: #38bdf8;">
                        🏢 Selecionar da Lista
                      </button>
                    </div>
                    <div style="position: relative; display: flex; align-items: center;">
                      <input type="text" id="field-supplier-pereciveis" class="form-input" placeholder="Ex: Betânia, Nestlé, Danone..." autocomplete="off">
                      <button type="button" id="btn-quick-supplier-picker-pereciveis" class="btn btn--ghost" style="position: absolute; right: 4px; padding: 4px 8px; font-size: 0.9rem;" title="Abrir Lista de Fornecedores">🏢</button>
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Localização *</label>
                    <select id="field-location-pereciveis" class="form-input" required>
                      <option value="">Selecione...</option>
                      <option value="resfriado">❄️ Câmara Resfriada</option>
                      <option value="congelado">🥶 Câmara Congelada</option>
                      <option value="piso_loja">🏪 Piso de Loja</option>
                    </select>
                  </div>
                </div>
                <!-- Seletor de Posição da Câmara Fria -->
                <div class="form-row" id="row-chamber-slots-pereciveis" style="display: none; background: rgba(56,189,248,0.06); padding: 10px; border-radius: 8px; border: 1px solid rgba(56,189,248,0.2); margin-bottom: 1rem;">
                  <div class="form-group">
                    <label class="form-label" style="color: #38bdf8;">Coluna *</label>
                    <select id="field-chamber-col-pereciveis" class="form-input">
                      <option value="">Selecione a coluna...</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label" style="color: #38bdf8;">Nível *</label>
                    <select id="field-chamber-level-pereciveis" class="form-input">
                      <option value="">Selecione o nível...</option>
                      <option value="1">📦 Nível 1 — Piso (Chão)</option>
                      <option value="2">🏗️ Nível 2 — Aéreo</option>
                      <option value="3">🏗️ Nível 3 — Aéreo</option>
                      <option value="4">🏗️ Nível 4 — Aéreo (Topo)</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label" style="color: #38bdf8;">Posição *</label>
                    <select id="field-chamber-pos-pereciveis" class="form-input">
                      <option value="">Selecione o lado...</option>
                      <option value="E">⬅️ Esquerda (E)</option>
                      <option value="D">➡️ Direita (D)</option>
                    </select>
                  </div>
                </div>
                <!-- Seletor de Freezer do Piso de Loja -->
                <div class="form-row" id="row-freezer-slots-pereciveis" style="display: none; background: rgba(16,185,129,0.06); padding: 10px; border-radius: 8px; border: 1px solid rgba(16,185,129,0.2); margin-bottom: 1rem;">
                  <div class="form-group">
                    <label class="form-label" style="color: #34d399;">Freezer do Piso de Loja</label>
                    <select id="field-freezer-num-pereciveis" class="form-input">
                      <option value="">Geral / Sem freezer específico</option>
                      <optgroup label="❄️ Produtos Resfriados (Freezers 01 a 34)">
                        <option value="FZ01">Freezer 01 - Resfriados</option>
                        <option value="FZ02">Freezer 02 - Resfriados</option>
                        <option value="FZ03">Freezer 03 - Resfriados</option>
                        <option value="FZ04">Freezer 04 - Resfriados</option>
                        <option value="FZ05">Freezer 05 - Resfriados</option>
                        <option value="FZ06">Freezer 06 - Resfriados</option>
                        <option value="FZ07">Freezer 07 - Resfriados</option>
                        <option value="FZ08">Freezer 08 - Resfriados</option>
                        <option value="FZ09">Freezer 09 - Resfriados</option>
                        <option value="FZ10">Freezer 10 - Resfriados</option>
                        <option value="FZ11">Freezer 11 - Resfriados</option>
                        <option value="FZ12">Freezer 12 - Resfriados</option>
                        <option value="FZ13">Freezer 13 - Resfriados</option>
                        <option value="FZ14">Freezer 14 - Resfriados</option>
                        <option value="FZ15">Freezer 15 - Resfriados</option>
                        <option value="FZ16">Freezer 16 - Resfriados</option>
                        <option value="FZ17">Freezer 17 - Resfriados</option>
                        <option value="FZ18">Freezer 18 - Resfriados</option>
                        <option value="FZ19">Freezer 19 - Resfriados</option>
                        <option value="FZ20">Freezer 20 - Resfriados</option>
                        <option value="FZ21">Freezer 21 - Resfriados</option>
                        <option value="FZ22">Freezer 22 - Resfriados</option>
                        <option value="FZ23">Freezer 23 - Resfriados</option>
                        <option value="FZ24">Freezer 24 - Resfriados</option>
                        <option value="FZ25">Freezer 25 - Resfriados</option>
                        <option value="FZ26">Freezer 26 - Resfriados</option>
                        <option value="FZ27">Freezer 27 - Resfriados</option>
                        <option value="FZ28">Freezer 28 - Resfriados</option>
                        <option value="FZ29">Freezer 29 - Resfriados</option>
                        <option value="FZ30">Freezer 30 - Resfriados</option>
                        <option value="FZ31">Freezer 31 - Resfriados</option>
                        <option value="FZ32">Freezer 32 - Resfriados</option>
                        <option value="FZ33">Freezer 33 - Resfriados</option>
                        <option value="FZ34">Freezer 34 - Resfriados</option>
                      </optgroup>
                      <optgroup label="🧀 Queijos Especiais">
                        <option value="FZ35">Freezer 35 - Queijos Especiais</option>
                      </optgroup>
                    </select>
                  </div>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Quantidade</label>
                    <input type="number" id="field-quantity-pereciveis" class="form-input" placeholder="ex: 10" step="any" min="0">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Unidade</label>
                    <select id="field-unit-pereciveis" class="form-input">
                      <option value="kg">kg</option>
                      <option value="un">un</option>
                      <option value="cx">cx</option>
                      <option value="pct">pct</option>
                    </select>
                  </div>
                </div>
                <div class="form-row" id="annotation-info-banner-pereciveis" style="display: none; margin-top: 1rem; width: 100%;">
                  <div style="background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 6px; padding: 8px 12px; width: 100%; display: flex; justify-content: space-between; font-size: 0.85rem; color: #f8fafc;">
                    <div><strong>Quantidade Anterior:</strong> <span id="info-original-quantity-pereciveis">0</span></div>
                    <div><strong>Data da Alteração:</strong> <span id="info-change-date-pereciveis">--/--/----</span></div>
                  </div>
                </div>
                <div class="form-row" id="group-annotation-pereciveis" style="display: none; margin-top: 1rem; flex-direction: column; gap: 0.8rem;">
                  <div class="form-group" style="width: 100%;">
                    <label class="form-label" style="color: #f8fafc; font-weight: 600;">O que aconteceu com o restante do produto? *</label>
                    <div class="annotation-buttons-container-pereciveis" style="display: flex; gap: 0.5rem; flex-wrap: wrap; width: 100%;">
                      <button type="button" class="btn btn--outline annotation-btn-pereciveis" data-value="quebra" style="flex: 1; min-width: 80px;">Quebra</button>
                      <button type="button" class="btn btn--outline annotation-btn-pereciveis" data-value="troca" style="flex: 1; min-width: 80px;">Troca</button>
                      <button type="button" class="btn btn--outline annotation-btn-pereciveis" data-value="rebaixa" style="flex: 1; min-width: 80px;">Rebaixa</button>
                      <button type="button" class="btn btn--outline annotation-btn-pereciveis" data-value="vendido" style="flex: 1; min-width: 80px;">Vendido</button>
                      <button type="button" class="btn btn--outline annotation-btn-pereciveis btn--danger-outline" data-value="excluir" style="flex: 1.2; min-width: 110px;">Excluir o item</button>
                    </div>
                    <input type="hidden" id="field-annotation-pereciveis" value="">
                  </div>
                  <div class="form-group" id="subgroup-annotation-text-pereciveis" style="display: none; width: 100%;">
                    <label class="form-label" style="color: #cbd5e1; font-size: 0.85rem; font-weight: 500;">Explicação/Detalhes *</label>
                    <input type="text" id="field-annotation-text-pereciveis" class="form-input" maxlength="100" placeholder="Descreva os detalhes (Máx. 100 caracteres)...">
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div class="modal-footer" id="product-modal-footer-pereciveis" style="display: none;">
            <button class="btn btn--ghost" id="btn-cancel-modal-pereciveis">Cancelar</button>
            <button class="btn btn--primary" id="btn-save-product-pereciveis" style="font-weight: 700;">✓ Salvar Produto</button>
          </div>
        </div>
      </div>

      <!-- Modal Seletor de Fornecedores / Marcas (Perecíveis) -->
      <div class="modal-overlay" id="supplier-modal-pereciveis" style="display:none; z-index: 10050;">
        <div class="modal" style="max-width: 540px;">
          <div class="modal-header">
            <h3 class="modal-title" style="display: flex; align-items: center; gap: 8px;">
              <span>🏢 Fornecedores & Marcas</span>
            </h3>
            <button class="modal-close" id="supplier-modal-close-pereciveis">✕</button>
          </div>
          <div class="modal-body" style="padding: 1.25rem;">
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 0; margin-bottom: 12px;">
              Selecione o fornecedor/marca abaixo para preenchimento rápido:
            </p>

            <div class="search-box" style="width: 100%; margin-bottom: 0.75rem; display: flex; align-items: center;">
              <span class="search-icon">🔍</span>
              <input type="text" id="supplier-modal-search-pereciveis" class="search-input" placeholder="Buscar por fornecedor ou marca..." autocomplete="off">
              <button type="button" id="supplier-modal-voice-btn-pereciveis" class="search-mic-btn" style="background:none; border:none; color:var(--text-secondary); cursor:pointer; padding:6px 10px;" title="Buscar por voz">🎙️</button>
            </div>

            <div class="cat-quick-tabs" id="supplier-modal-tabs-pereciveis" style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;">
              <button type="button" class="cat-tab cat-tab--sm cat-tab--active" data-sfilter="all">Todos</button>
              <button type="button" class="cat-tab cat-tab--sm" data-sfilter="pereciveis">🥛 Laticínios & Frios</button>
              <button type="button" class="cat-tab cat-tab--sm" data-sfilter="açougue">🥩 Carnes & Aves</button>
            </div>

            <div class="table-scroll" style="max-height: 260px; overflow-y: auto; margin-bottom: 1rem; border: 1px solid var(--border-color); border-radius: 8px;">
              <table class="data-table" style="margin: 0;">
                <thead>
                  <tr>
                    <th>FORNECEDOR / MARCA</th>
                    <th>SEGMENTO</th>
                    <th style="width: 95px; text-align: right;">AÇÃO</th>
                  </tr>
                </thead>
                <tbody id="supplier-modal-tbody-pereciveis">
                  <!-- Gerado dinamicamente -->
                </tbody>
              </table>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 10px;">
              <span id="supplier-modal-count-pereciveis" style="font-size: 0.8rem; color: var(--text-secondary);">0 fornecedores disponíveis</span>
              <button type="button" class="btn btn--ghost btn--sm" id="btn-supplier-modal-cancel-pereciveis">
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de confirmação de exclusão -->
      <div class="modal-overlay" id="delete-modal-pereciveis" style="display:none;">
        <div class="modal modal--sm">
          <div class="modal-header">
            <h3 class="modal-title">⚠️ Confirmar Exclusão</h3>
            <button class="modal-close" id="delete-modal-close-pereciveis">✕</button>
          </div>
          <div class="modal-body">
            <p style="color:var(--text-secondary);">Tem certeza que deseja remover o produto <strong id="delete-product-name-pereciveis" style="color:var(--text-primary);"></strong>?</p>
            <p style="color:var(--error);font-size:0.85rem;margin-top:0.5rem;">Esta ação não pode ser desfeita.</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn--ghost" id="btn-cancel-delete-pereciveis">Cancelar</button>
            <button class="btn btn--danger" id="btn-confirm-delete-pereciveis">Excluir</button>
          </div>
        </div>
      </div>
    `;
  },

  getFilteredProducts() {
    let products = window.BrigadaData.products.filter(p => 
      p.category && ['iogurtes', 'laticinios', 'frios', 'pereciveis', 'perecíveis'].includes(p.category.toLowerCase())
    );

    if (this.currentFilter !== 'all') {
      products = products.filter(p => p.category && p.category.toLowerCase() === this.currentFilter.toLowerCase());
    }

    if (this.currentSearch) {
      const q = this.currentSearch.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.plu.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.toLowerCase().includes(q))
      );
    }

    // Filtro por Data de Vencimento (Dia, Mês, Ano)
    if (this.currentDay !== 'all' || this.currentMonth !== 'all' || this.currentYear !== 'all') {
      products = products.filter(p => {
        if (!p.endDate) return false;
        const parts = p.endDate.split('-');
        if (parts.length < 3) return false;
        const [pYear, pMonth, pDay] = parts;

        if (this.currentYear !== 'all' && pYear !== this.currentYear) return false;
        if (this.currentMonth !== 'all' && pMonth !== this.currentMonth) return false;
        if (this.currentDay !== 'all' && pDay !== this.currentDay) return false;
        return true;
      });
    }

    const statusFilter = document.getElementById('filter-status-pereciveis')?.value || 'all';
    if (statusFilter !== 'all') {
      products = products.filter(p => {
        const s = window.BrigadaData.getProductStatus(p);
        if (statusFilter === 'rebaixa') return p.isAwaitingReduction === true;
        if (statusFilter === 'congelado30') return window.BrigadaData.isCongelado(p) && s.days >= 0 && s.days <= 30 && !p.expiredAction;
        if (statusFilter === 'resfriado15') return window.BrigadaData.isResfriado(p) && s.days >= 0 && s.days <= 15 && !p.expiredAction;
        if (statusFilter === 'expired') return s.days < 0 && !p.expiredAction;
        if (statusFilter === 'today') return s.days === 0 && !p.expiredAction;
        if (statusFilter === 'warning') return s.days > 0 && s.days <= 3 && !p.expiredAction;
        if (statusFilter === 'ok') return s.label === 'OK' && !p.expiredAction;
        if (statusFilter === 'tratado') return p.expiredAction === 'tratado';
        return true;
      });
    }

    // Sort: datas mais recentes no topo
    products.sort((a, b) => {
      const dateA = a.startDate ? new Date(a.startDate).getTime() : (a.endDate ? new Date(a.endDate).getTime() : 0);
      const dateB = b.startDate ? new Date(b.startDate).getTime() : (b.endDate ? new Date(b.endDate).getTime() : 0);
      if (dateB !== dateA) return dateB - dateA;
      return (b.id || 0) - (a.id || 0);
    });

    return products;
  },

  renderTable(container) {
    const wrapper = container.querySelector('#products-table-wrapper-pereciveis');
    if (!wrapper) return;

    const products = this.getFilteredProducts();
    const catMap = { iogurtes: '🍦 Iogurtes', laticinios: '🧀 Laticínios', frios: '🥓 Frios', pereciveis: '🍎 Perecíveis', 'perecíveis': '🍎 Perecíveis' };

    if (products.length === 0) {
      wrapper.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">🍎</div>
          <p class="empty-state__text">Nenhum produto perecível encontrado</p>
        </div>`;
      return;
    }

    const showActions = products.some(p => window.BrigadaAuth.canEditProduct(p) || window.BrigadaAuth.canDeleteProduct(p));
    const rows = products.map(p => {
      const status = window.BrigadaData.getProductStatus(p);
      const baseStatus = window.BrigadaData.getProductStatus(p, true);
      const qty = p.quantity !== undefined ? p.quantity : 0;
      const unit = p.unit || 'kg';
      const canEditThis = window.BrigadaAuth.canEditProduct(p);
      const canDeleteThis = window.BrigadaAuth.canDeleteProduct(p);
      const locChamberMatch = p.location ? p.location.match(/^(resfriado|congelado):C(\d+)-N(\d+)-([ED])$/) : null;
      const locFreezerMatch = p.location ? p.location.match(/^piso_loja:(FZ\d+|\d+)$/) : null;
      const stockDist = window.BrigadaData.getProductStockDistribution(p);
      const sameDateOtherLocs = stockDist.sameDate.filter(d => d.id !== p.id);

      return `
        <tr data-id="${p.id}" style="transition: background 0.15s;">
          <td style="text-align: center; width: 40px;"><input type="checkbox" class="select-product-checkbox" data-id="${p.id}" style="cursor:pointer; width:16px; height:16px;"></td>
          <td data-label="PLU" style="width: 75px;"><span class="plu-badge">${p.plu}</span></td>
          <td data-label="Produto" class="product-name" style="max-width: 250px;">
            <div onclick="window.BrigadaUI.showProductView('${p.id}')" style="cursor: pointer; font-weight: 600; color: var(--text-primary);" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color='var(--text-primary)'" title="Ver detalhes">${p.name}</div>
            <div style="display: flex; gap: 8px; align-items: center; margin-top: 2px;">
              ${p.supplier ? `<span style="font-size: 0.72rem; color: var(--text-tertiary);">🏢 ${p.supplier}</span>` : ''}
              ${p.createdBy ? `<span style="font-size: 0.7rem; color: #a78bfa;" title="${p.createdBy}">👤 ${window.BrigadaData.getUserNameByEmail(p.createdBy)}</span>` : ''}
            </div>
          </td>
          <td data-label="Qtd" style="white-space: nowrap;">
            <strong style="color: var(--primary); font-size: 0.95rem;">${qty}</strong> <span style="font-size: 0.75rem; color: var(--text-secondary);">${unit}</span>
          </td>
          <td data-label="Categoria" style="white-space: nowrap;">
            <span class="cat-pill cat-pill--${p.category}">${catMap[p.category] || p.category}</span>
          </td>
          <td data-label="Data de Cadastro" style="white-space: nowrap; font-size: 0.85rem;">
            ${window.BrigadaData.formatCreatedDateAndHour(p)}
          </td>
          <td data-label="Validade" style="white-space: nowrap;">
            <div style="font-weight: 600; font-size: 0.9rem;">${window.BrigadaData.formatDate(p.endDate)}</div>
            <div style="font-size: 0.75rem; margin-top: 1px;">
              ${status.days < 0 ? `<span style="color: #ef4444; font-weight: 600;">Venceu há ${Math.abs(status.days)}d</span>` : 
                status.days === 0 ? `<span style="color: #f97316; font-weight: 700;">Vence HOJE</span>` : 
                status.days <= 3 ? `<span style="color: #eab308; font-weight: 600;">Faltam ${status.days}d</span>` : 
                `<span style="color: var(--text-tertiary);">${status.days}d restantes</span>`}
            </div>
          </td>
          <td data-label="Localização" style="white-space: nowrap;">
            <div style="display: flex; flex-direction: column; gap: 2px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 0.85rem; font-weight: 500;">${window.BrigadaData.formatLocationFriendly(p)}</span>
                ${locChamberMatch ? `
                  <button class="btn-icon" data-action="view-rack" data-chamber="${locChamberMatch[1]}" data-col="${locChamberMatch[2]}" title="Ver no Rack da Câmara" style="padding: 2px 6px; font-size: 0.75rem; background: rgba(56,189,248,0.12); border: 1px solid rgba(56,189,248,0.3); color: #38bdf8; border-radius: 6px;">
                    👁️
                  </button>
                ` : ''}
                ${locFreezerMatch ? `
                  <button class="btn-icon" data-action="view-freezer" data-fz="${locFreezerMatch[1]}" title="Ver no Piso de Loja" style="padding: 2px 6px; font-size: 0.75rem; background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.3); color: #34d399; border-radius: 6px;">
                    🏪
                  </button>
                ` : ''}
              </div>
              ${sameDateOtherLocs.length > 0 ? `
                <div onclick="window.BrigadaUI.showProductView('${p.id}')" style="cursor: pointer; font-size: 0.7rem; color: #38bdf8; background: rgba(56,189,248,0.12); border: 1px solid rgba(56,189,248,0.3); border-radius: 4px; padding: 2px 6px; width: fit-content; display: inline-flex; align-items: center; gap: 3px; font-weight: 600;" title="Mesma data (${window.BrigadaData.formatDate(p.endDate)}) também em outro local!">
                  ⚡ Mesma data: ${sameDateOtherLocs.map(d => `${d.quantity}${d.unit} em ${d.shortLoc}`).join(', ')}
                </div>
              ` : ''}
            </div>
          </td>
          <td data-label="Status" style="white-space: nowrap;">
            <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
              <span class="badge ${baseStatus.class}" style="font-size: 0.72rem; padding: 3px 8px;">${baseStatus.icon} ${baseStatus.label}</span>
              ${p.expiredAction && status ? `<span class="badge ${status.class}" style="font-size: 0.68rem; padding: 2px 6px;">${status.icon} ${status.label}</span>` : ''}
              ${p.isAwaitingReduction ? `<span class="badge" style="background:${p.rebaixaStatus === 'ok' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)'}; color:${p.rebaixaStatus === 'ok' ? '#34d399' : '#fbbf24'}; border:1px solid ${p.rebaixaStatus === 'ok' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}; font-size:0.68rem; padding: 2px 6px;">${p.rebaixaStatus === 'ok' ? '🟢 Rebaixa OK' : '🟡 Rebaixa Pendente'}</span>` : ''}
            </div>
          </td>
          <td data-label="Ações" style="white-space: nowrap; text-align: right;">
            <div style="display: inline-flex; gap: 6px; align-items: center; justify-content: flex-end; flex-wrap: wrap;">
              ${p.isAwaitingReduction && canEditThis ? `
                <button class="btn-icon" data-action="toggle-rebaixa" data-id="${p.id}" title="${p.rebaixaStatus === 'ok' ? 'Voltar para Aguardando' : 'Marcar Rebaixa OK'}">
                  ${p.rebaixaStatus === 'ok' ? '↩️' : '✅'}
                  <span class="btn-label">${p.rebaixaStatus === 'ok' ? 'Voltar' : 'Rebaixa'}</span>
                </button>
              ` : ''}
              ${canEditThis ? `
                ${p.expiredAction !== 'quebra' ? `<button class="btn-icon btn-icon--quebra" data-action="set-quebra" data-id="${p.id}" title="Registrar Quebra / Avaria">🗑️<span class="btn-label">Quebra</span></button>` : ''}
                ${p.expiredAction !== 'troca' ? `<button class="btn-icon btn-icon--troca" data-action="set-troca" data-id="${p.id}" title="Marcar como Troca">🔄<span class="btn-label">Troca</span></button>` : ''}
                ${p.expiredAction !== 'tratado' ? `<button class="btn-icon btn-icon--tratado" data-action="set-tratado" data-id="${p.id}" title="Tratado com Sucesso">✔️<span class="btn-label">Tratado</span></button>` : ''}
                ${p.expiredAction ? `<button class="btn-icon" data-action="clear-expired" data-id="${p.id}" title="Desfazer Ação">↩️<span class="btn-label">Desfazer</span></button>` : ''}
                <button class="btn-icon btn-icon--edit" data-action="edit" data-id="${p.id}" title="Editar Produto">
                  ✏️<span class="btn-label">Editar</span>
                </button>
              ` : ''}
              ${(locChamberMatch || locFreezerMatch) && canEditThis ? `
                <button class="btn-icon" data-action="${locChamberMatch ? 'deallocate-chamber' : 'deallocate-freezer'}" data-id="${p.id}" title="Desalocar da posição">
                  📦↩️<span class="btn-label">Desalocar</span>
                </button>
              ` : ''}
              ${canDeleteThis ? `
                <button class="btn-icon btn-icon--delete" data-action="delete" data-id="${p.id}" title="Excluir Produto">
                  🗑️<span class="btn-label">Excluir</span>
                </button>
              ` : ''}
            </div>
          </td>
        </tr>`;
    }).join('');

    wrapper.innerHTML = `
      <div class="results-info" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <span>${products.length} produto${products.length !== 1 ? 's' : ''} encontrado${products.length !== 1 ? 's' : ''}</span>
      </div>
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 36px; text-align: center;"><input type="checkbox" id="select-all-products-pereciveis" style="cursor:pointer; width:16px; height:16px;"></th>
              <th style="width: 70px;">PLU</th>
              <th style="min-width: 170px;">Produto</th>
              <th style="width: 75px;">Qtd</th>
              <th style="width: 95px;">Categoria</th>
              <th style="width: 110px;">Data Cadastro</th>
              <th style="width: 115px;">Validade</th>
              <th style="width: 125px;">Localização</th>
              <th style="width: 165px;">Status</th>
              <th style="width: 110px; text-align: right;">Ações</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;

    // Atualiza barra de ações em lote
    const updateBatchBar = () => {
      const selected = Array.from(container.querySelectorAll('.select-product-checkbox:checked')).map(cb => parseInt(cb.dataset.id, 10));
      const batchBar = container.querySelector('#batch-actions-bar-pereciveis');
      const batchCount = container.querySelector('#batch-selected-count-pereciveis');
      if (batchBar && batchCount) {
        if (selected.length > 0) {
          batchCount.textContent = `${selected.length} produto${selected.length > 1 ? 's' : ''} selecionado${selected.length > 1 ? 's' : ''}`;
          batchBar.style.display = 'flex';
        } else {
          batchBar.style.display = 'none';
        }
      }
    };

    // Bind select all checkbox
    const selectAllCb = container.querySelector('#select-all-products-pereciveis');
    selectAllCb?.addEventListener('change', (e) => {
      const checked = e.target.checked;
      container.querySelectorAll('.select-product-checkbox').forEach(cb => {
        cb.checked = checked;
      });
      updateBatchBar();
    });

    container.querySelectorAll('.select-product-checkbox').forEach(cb => {
      cb.addEventListener('change', updateBatchBar);
    });

    // Batch Actions buttons
    container.querySelector('#btn-batch-rebaixa-pereciveis')?.addEventListener('click', () => {
      const selected = Array.from(container.querySelectorAll('.select-product-checkbox:checked')).map(cb => parseInt(cb.dataset.id, 10));
      if (selected.length === 0) return;
      window.BrigadaData.setAwaitingReduction(selected, true).then(() => {
        window.BrigadaUI.showToast(`${selected.length} produtos movidos para Aguardando Rebaixa.`, 'success');
        this.renderTable(container);
      });
    });

    container.querySelector('#btn-batch-quebra-pereciveis')?.addEventListener('click', async () => {
      const selected = Array.from(container.querySelectorAll('.select-product-checkbox:checked')).map(cb => parseInt(cb.dataset.id, 10));
      if (selected.length === 0) return;
      if (confirm(`Marcar ${selected.length} produto(s) como Quebra?`)) {
        for (const id of selected) {
          await window.BrigadaData.setExpiredAction(id, 'quebra');
        }
        window.BrigadaUI.showToast('Quebra registrada com sucesso.', 'success');
        this.renderTable(container);
      }
    });

    container.querySelector('#btn-batch-troca-pereciveis')?.addEventListener('click', async () => {
      const selected = Array.from(container.querySelectorAll('.select-product-checkbox:checked')).map(cb => parseInt(cb.dataset.id, 10));
      if (selected.length === 0) return;
      if (confirm(`Marcar ${selected.length} produto(s) para Troca?`)) {
        for (const id of selected) {
          await window.BrigadaData.setExpiredAction(id, 'troca');
        }
        window.BrigadaUI.showToast('Troca registrada com sucesso.', 'success');
        this.renderTable(container);
      }
    });

    container.querySelector('#btn-batch-tratado-pereciveis')?.addEventListener('click', async () => {
      const selected = Array.from(container.querySelectorAll('.select-product-checkbox:checked')).map(cb => parseInt(cb.dataset.id, 10));
      if (selected.length === 0) return;
      for (const id of selected) {
        await window.BrigadaData.setExpiredAction(id, 'tratado');
      }
      window.BrigadaUI.showToast('Produtos marcados como Tratados.', 'success');
      this.renderTable(container);
    });

    // Bind action buttons inside table
    wrapper.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const id = parseInt(btn.dataset.id);
        if (action === 'edit') this.openEditModal(id, container);
        if (action === 'delete') this.openDeleteModal(id, container);
        if (action === 'toggle-rebaixa') {
          const product = window.BrigadaData.products.find(x => x.id === id);
          const newStatus = product.rebaixaStatus === 'ok' ? 'aguardando' : 'ok';
          window.BrigadaData.setAwaitingReduction([id], true, newStatus).then(() => {
            this.renderTable(container);
          });
        }
        if (action === 'set-quebra') {
          window.BrigadaUI.showQuebraModal(id, () => this.renderTable(container));
        }
        if (action === 'set-troca') {
          window.BrigadaData.setExpiredAction(id, 'troca').then(() => this.renderTable(container));
        }
        if (action === 'set-tratado') {
          window.BrigadaData.setExpiredAction(id, 'tratado').then(() => this.renderTable(container));
        }
        if (action === 'clear-expired') {
          window.BrigadaData.setExpiredAction(id, null).then(() => this.renderTable(container));
        }
        if (action === 'view-rack') {
          const chamber = btn.dataset.chamber;
          const col = parseInt(btn.dataset.col, 10);
          if (window.BrigadaChambers) {
            window.BrigadaChambers.selectedChamber = chamber;
            window.BrigadaChambers.selectedColumn = col;
            window.BrigadaChambers.sidebarFilter = 'all';
          }
          window.BrigadaRouter.navigate('chambers');
        }
        if (action === 'deallocate-chamber') {
          const product = window.BrigadaData.products.find(x => x.id === id);
          if (product && confirm(`Tem certeza que deseja desalocar o produto "${product.name}" da câmara fria?`)) {
            const locMatch = product.location ? product.location.match(/^(resfriado|congelado)/) : null;
            const baseLoc = locMatch ? locMatch[1] : 'resfriado';
            window.BrigadaData.updateProduct(id, { location: baseLoc }).then(() => {
              window.BrigadaUI.showToast('Palete desalocado com sucesso!', 'success');
              this.renderTable(container);
            });
          }
        }
        if (action === 'view-freezer') {
          const fz = btn.dataset.fz;
          const fzNum = parseInt(fz.replace('FZ', ''), 10);
          if (window.BrigadaPisoLoja) {
            window.BrigadaPisoLoja.selectedFreezer = fzNum;
          }
          window.BrigadaRouter.navigate('piso_loja');
        }
        if (action === 'deallocate-freezer') {
          const product = window.BrigadaData.products.find(x => x.id === id);
          if (product && confirm(`Tem certeza que deseja desalocar o produto "${product.name}" do freezer?`)) {
            window.BrigadaData.updateProduct(id, { location: 'piso_loja' }).then(() => {
              window.BrigadaUI.showToast('Produto desalocado do freezer!', 'success');
              this.renderTable(container);
            });
          }
        }
      });
    });
  },

  bindEvents(container) {
    // Category tabs
    container.querySelectorAll('.cat-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        container.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('cat-tab--active'));
        tab.classList.add('cat-tab--active');
        this.currentFilter = tab.dataset.cat;
        this.renderTable(container);
      });
    });

    // Search
    const searchInput = container.querySelector('#search-products-pereciveis');
    searchInput?.addEventListener('input', (e) => {
      this.currentSearch = e.target.value;
      this.renderTable(container);
    });

    // Date Filters (Dia, Mês, Ano)
    const selectDay = container.querySelector('#pereciveis-filter-day');
    const selectMonth = container.querySelector('#pereciveis-filter-month');
    const selectYear = container.querySelector('#pereciveis-filter-year');
    const btnClearDate = container.querySelector('#btn-clear-pereciveis-date-filters');

    const handleDateFilterChange = () => {
      this.currentDay = selectDay ? selectDay.value : 'all';
      this.currentMonth = selectMonth ? selectMonth.value : 'all';
      this.currentYear = selectYear ? selectYear.value : 'all';
      this.renderTable(container);
    };

    if (selectDay) selectDay.addEventListener('change', handleDateFilterChange);
    if (selectMonth) selectMonth.addEventListener('change', handleDateFilterChange);
    if (selectYear) selectYear.addEventListener('change', handleDateFilterChange);

    if (btnClearDate) {
      btnClearDate.addEventListener('click', () => {
        this.currentDay = 'all';
        this.currentMonth = 'all';
        this.currentYear = 'all';
        if (selectDay) selectDay.value = 'all';
        if (selectMonth) selectMonth.value = 'all';
        if (selectYear) selectYear.value = 'all';
        this.renderTable(container);
      });
    }

    // Status filter
    const statusFilter = container.querySelector('#filter-status-pereciveis');
    statusFilter?.addEventListener('change', () => this.renderTable(container));

    // Scanner
    const scanBtn = container.querySelector('#btn-scan-products-pereciveis');
    scanBtn?.addEventListener('click', () => {
      window.BrigadaUI.openScanner((result) => {
        if (result.isScaleCode) {
          searchInput.value = result.plu;
        } else {
          searchInput.value = result.barcode;
        }
        this.currentSearch = searchInput.value;
        this.renderTable(container);
      });
    });

    const formScanBtn = container.querySelector('#btn-scan-form-pereciveis');
    formScanBtn?.addEventListener('click', () => {
      window.BrigadaUI.openScanner((result) => {
        const barcodeInput = container.querySelector('#field-barcode-pereciveis');
        if (barcodeInput) barcodeInput.value = result.barcode;
      });
    });

    // Add product button
    container.querySelector('#btn-add-product-pereciveis')?.addEventListener('click', () => {
      this.openAddModal(container);
    });

    // Export / Import / Rebaixar buttons
    container.querySelector('#btn-request-reduction-pereciveis')?.addEventListener('click', () => this.requestReduction(container));
    container.querySelector('#btn-export-excel-pereciveis')?.addEventListener('click', () => this.exportExcel());
    container.querySelector('#btn-export-pdf-pereciveis')?.addEventListener('click', () => this.exportPDF());
    container.querySelector('#btn-import-csv-pereciveis')?.addEventListener('click', () => {
      container.querySelector('#import-file-input-pereciveis')?.click();
    });
    container.querySelector('#import-file-input-pereciveis')?.addEventListener('change', (e) => {
      this.importCSV(e, container);
    });

    // Modal close
    container.querySelector('#modal-close-pereciveis')?.addEventListener('click', () => this.closeModal(container));
    container.querySelector('#btn-cancel-modal-pereciveis')?.addEventListener('click', () => this.closeModal(container));

    // Save product
    container.querySelector('#btn-save-product-pereciveis')?.addEventListener('click', () => this.saveProduct(container));

    // Delete modal
    container.querySelector('#delete-modal-close-pereciveis')?.addEventListener('click', () => this.closeDeleteModal(container));
    container.querySelector('#btn-cancel-delete-pereciveis')?.addEventListener('click', () => this.closeDeleteModal(container));
    container.querySelector('#btn-confirm-delete-pereciveis')?.addEventListener('click', () => this.confirmDelete(container));

    // Close modal on overlay click
    container.querySelector('#product-modal-pereciveis')?.addEventListener('click', (e) => {
      if (e.target.id === 'product-modal-pereciveis') this.closeModal(container);
    });
    container.querySelector('#delete-modal-pereciveis')?.addEventListener('click', (e) => {
      if (e.target.id === 'delete-modal-pereciveis') this.closeDeleteModal(container);
    });

    // Initialize Autocomplete (PLU e Nome)
    window.BrigadaUI.setupPluAutocomplete(container, '#field-plu-pereciveis', '#plu-suggestions-pereciveis', {
      name: '#field-name-pereciveis',
      category: '#field-category-pereciveis',
      unit: '#field-unit-pereciveis'
    }, ['iogurtes', 'laticinios', 'frios', 'pereciveis', 'perecíveis'], 'plu');

    window.BrigadaUI.setupPluAutocomplete(container, '#field-name-pereciveis', '#name-suggestions-pereciveis', {
      plu: '#field-plu-pereciveis',
      category: '#field-category-pereciveis',
      unit: '#field-unit-pereciveis'
    }, ['iogurtes', 'laticinios', 'frios', 'pereciveis', 'perecíveis'], 'name');

    // Listener para o campo de quantidade exibir/ocultar anotação
    const qtyInput = container.querySelector('#field-quantity-pereciveis');
    const annotationGroup = container.querySelector('#group-annotation-pereciveis');
    const annotationInput = container.querySelector('#field-annotation-pereciveis');
    const subGroup = container.querySelector('#subgroup-annotation-text-pereciveis');
    const subInput = container.querySelector('#field-annotation-text-pereciveis');
    
    qtyInput?.addEventListener('input', () => {
      if (this.editingId) {
        const newVal = parseFloat(qtyInput.value) || 0;
        const infoBanner = container.querySelector('#annotation-info-banner-pereciveis');
        if (newVal < this.originalQuantity) {
          annotationGroup.style.display = 'flex';
          annotationInput.required = true;
          if (infoBanner) {
            container.querySelector('#info-original-quantity-pereciveis').textContent = this.originalQuantity + ' ' + (container.querySelector('#field-unit-pereciveis').value || '');
            const today = new Date();
            const dd = String(today.getDate()).padStart(2, '0');
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const yyyy = today.getFullYear();
            container.querySelector('#info-change-date-pereciveis').textContent = dd + '/' + mm + '/' + yyyy;
            infoBanner.style.display = 'flex';
          }
        } else {
          annotationGroup.style.display = 'none';
          annotationInput.required = false;
          annotationInput.value = '';
          subGroup.style.display = 'none';
          subInput.required = false;
          subInput.value = '';
          if (infoBanner) infoBanner.style.display = 'none';
        }
      }
    });

    const annotationBtns = container.querySelectorAll('.annotation-btn-pereciveis');
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
        annotationInput.value = btn.dataset.value;
        subGroup.style.display = 'block';
        subInput.required = true;
      });
    });

    // Listener para o campo de localização alternar seletores de Câmara e Freezer
    const locSelect = container.querySelector('#field-location-pereciveis');
    const chamberSlotsRow = container.querySelector('#row-chamber-slots-pereciveis');
    const freezerSlotsRow = container.querySelector('#row-freezer-slots-pereciveis');
    const chamberColSelect = container.querySelector('#field-chamber-col-pereciveis');

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

    // Máscaras de data manual DD/MM/AAAA
    if (window.BrigadaData?.applyDateMask) {
      window.BrigadaData.applyDateMask(container.querySelector('#field-startDate-pereciveis'));
      window.BrigadaData.applyDateMask(container.querySelector('#field-endDate-pereciveis'));
    }

    // Eventos do seletor inteligente de catálogo no modal de Novo Produto Perecível
    const catSearchInput = container.querySelector('#catalog-modal-search-pereciveis');
    const catVoiceBtn = container.querySelector('#catalog-modal-voice-btn-pereciveis');
    const catTabs = container.querySelectorAll('#catalog-modal-cat-tabs-pereciveis .cat-tab');
    const btnSwitchManual = container.querySelector('#btn-switch-to-manual-form-pereciveis');
    const btnBackCatalog = container.querySelector('#btn-back-to-catalog-pereciveis');

    catSearchInput?.addEventListener('input', (e) => {
      this.catalogModalSearch = e.target.value;
      this.renderCatalogSelectorInModal(container);
    });

    catVoiceBtn?.addEventListener('click', () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        window.BrigadaUI.showToast('Reconhecimento de voz não suportado pelo seu navegador.', 'warning');
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.start();
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (catSearchInput) catSearchInput.value = transcript;
        this.catalogModalSearch = transcript;
        this.renderCatalogSelectorInModal(container);
      };
    });

    catTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        catTabs.forEach(t => t.classList.remove('cat-tab--active'));
        tab.classList.add('cat-tab--active');
        this.catalogModalCategory = tab.dataset.mcat || 'all';
        this.renderCatalogSelectorInModal(container);
      });
    });

    btnSwitchManual?.addEventListener('click', () => {
      container.querySelector('#manual-fields-row-pereciveis').style.display = 'flex';
      container.querySelector('#manual-name-group-pereciveis').style.display = 'block';
      container.querySelector('#selected-catalog-card-pereciveis').style.display = 'none';

      container.querySelector('#product-modal-step-catalog-pereciveis').style.display = 'none';
      container.querySelector('#product-modal-step-form-pereciveis').style.display = 'block';
      container.querySelector('#product-modal-footer-pereciveis').style.display = 'flex';
    });

    btnBackCatalog?.addEventListener('click', () => {
      container.querySelector('#product-modal-step-catalog-pereciveis').style.display = 'block';
      container.querySelector('#product-modal-step-form-pereciveis').style.display = 'none';
      container.querySelector('#product-modal-footer-pereciveis').style.display = 'none';
      this.renderCatalogSelectorInModal(container);
    });

    // Eventos do Modal Seletor de Fornecedores (Perecíveis)
    container.querySelector('#btn-open-supplier-modal-pereciveis')?.addEventListener('click', () => this.openSupplierModal(container));
    container.querySelector('#btn-quick-supplier-picker-pereciveis')?.addEventListener('click', () => this.openSupplierModal(container));
    container.querySelector('#supplier-modal-close-pereciveis')?.addEventListener('click', () => this.closeSupplierModal(container));
    container.querySelector('#btn-supplier-modal-cancel-pereciveis')?.addEventListener('click', () => this.closeSupplierModal(container));

    const suppSearch = container.querySelector('#supplier-modal-search-pereciveis');
    const suppVoiceBtn = container.querySelector('#supplier-modal-voice-btn-pereciveis');
    const suppTabs = container.querySelectorAll('#supplier-modal-tabs-pereciveis .cat-tab');

    suppSearch?.addEventListener('input', (e) => {
      this.supplierModalSearch = e.target.value;
      this.renderSupplierListInModal(container);
    });

    suppVoiceBtn?.addEventListener('click', () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        window.BrigadaUI.showToast('Reconhecimento de voz não suportado.', 'warning');
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.start();
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (suppSearch) suppSearch.value = transcript;
        this.supplierModalSearch = transcript;
        this.renderSupplierListInModal(container);
      };
    });

    suppTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        suppTabs.forEach(t => t.classList.remove('cat-tab--active'));
        tab.classList.add('cat-tab--active');
        this.supplierModalFilter = tab.dataset.sfilter || 'all';
        this.renderSupplierListInModal(container);
      });
    });
  },

  supplierModalSearch: '',
  supplierModalFilter: 'all',

  openSupplierModal(container) {
    const modal = container.querySelector('#supplier-modal-pereciveis');
    if (!modal) return;
    this.supplierModalSearch = '';
    this.supplierModalFilter = 'all';
    
    container.querySelectorAll('#supplier-modal-tabs-pereciveis .cat-tab').forEach(t => {
      if (t.dataset.sfilter === 'all') t.classList.add('cat-tab--active');
      else t.classList.remove('cat-tab--active');
    });
    if (container.querySelector('#supplier-modal-search-pereciveis')) {
      container.querySelector('#supplier-modal-search-pereciveis').value = '';
    }

    this.renderSupplierListInModal(container);
    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('modal-overlay--visible'));
  },

  closeSupplierModal(container) {
    const modal = container.querySelector('#supplier-modal-pereciveis');
    if (!modal) return;
    modal.classList.remove('modal-overlay--visible');
    setTimeout(() => { modal.style.display = 'none'; }, 200);
  },

  renderSupplierListInModal(container) {
    const tbody = container.querySelector('#supplier-modal-tbody-pereciveis');
    const countEl = container.querySelector('#supplier-modal-count-pereciveis');
    if (!tbody) return;

    const query = (this.supplierModalSearch || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const filter = this.supplierModalFilter || 'all';

    const suppliers = window.BrigadaData.getSuppliersList();
    const filtered = suppliers.filter(s => {
      if (filter !== 'all' && s.sector !== filter && s.sector !== 'geral') return false;
      if (query) {
        const full = `${s.name.toLowerCase()} ${s.category.toLowerCase()}`;
        return query.split(/\s+/).every(t => full.includes(t));
      }
      return true;
    });

    if (countEl) {
      countEl.textContent = `${filtered.length} ${filtered.length === 1 ? 'fornecedor disponível' : 'fornecedores disponíveis'}`;
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" style="text-align: center; padding: 2rem; color: var(--text-tertiary);">
            Nenhum fornecedor encontrado com este termo.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(s => `
      <tr>
        <td>
          <div style="font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 6px; font-size: 0.92rem;">
            <span>${s.icon || '🏢'}</span>
            <span>${s.name}</span>
          </div>
          ${s.productCount > 0 ? `<div style="font-size: 0.72rem; color: #38bdf8; margin-top: 1px;">📦 ${s.productCount} produtos vinculados</div>` : ''}
        </td>
        <td>
          <span style="font-size: 0.78rem; color: var(--text-secondary); background: rgba(255,255,255,0.04); padding: 2px 8px; border-radius: 4px;">
            ${s.category}
          </span>
        </td>
        <td style="text-align: right;">
          <button type="button" class="btn btn--primary btn--sm" data-action="select-supplier-item-pereciveis" data-name="${s.name.replace(/"/g, '&quot;')}" style="padding: 4px 10px; font-weight: 600; cursor: pointer;">
            Selecionar
          </button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-action="select-supplier-item-pereciveis"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.dataset.name;
        const suppInput = container.querySelector('#field-supplier-pereciveis');
        if (suppInput) suppInput.value = name;
        this.closeSupplierModal(container);
      });
    });
  },

  renderCatalogSelectorInModal(container) {
    const tbody = container.querySelector('#catalog-modal-tbody-pereciveis');
    const countEl = container.querySelector('#catalog-modal-count-pereciveis');
    if (!tbody) return;

    const query = (this.catalogModalSearch || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const activeCategory = this.catalogModalCategory || 'all';

    const catalog = window.BrigadaData.catalog || [];
    const allowed = ['laticinios', 'frios', 'iogurtes', 'pereciveis', 'perecíveis'];
    const normalize = str => (str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const filtered = catalog.filter(p => {
      const pCat = normalize(p.category);
      const isAllowed = allowed.some(ac => pCat.includes(normalize(ac)) || normalize(ac).includes(pCat));
      if (!isAllowed) return false;

      if (activeCategory !== 'all') {
        if (!pCat.includes(normalize(activeCategory)) && !normalize(activeCategory).includes(pCat)) return false;
      }

      if (query) {
        const full = `${normalize(p.name)} ${normalize(String(p.plu || ''))} ${normalize(p.barcode || '')}`;
        return query.split(/\s+/).every(t => full.includes(t));
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

    tbody.innerHTML = filtered.slice(0, 60).map(p => `
      <tr>
        <td style="font-family: monospace; font-weight: 700; color: #38bdf8;">${p.plu}</td>
        <td>
          <div style="font-weight: 600; color: var(--text-primary); font-size: 0.9rem;">${p.name}</div>
          <div style="font-size: 0.72rem; color: var(--text-secondary);">${(this.catMap && this.catMap[(p.category || '').toLowerCase()]) || p.category || 'Geral'}</div>
        </td>
        <td style="text-align: right;">
          <button type="button" class="btn btn--primary btn--sm" data-action="select-cat-prod-pereciveis" data-plu="${p.plu}" data-name="${p.name.replace(/"/g, '&quot;')}" data-cat="${p.category}" style="padding: 4px 10px; font-weight: 600; cursor: pointer;">
            Selecionar
          </button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-action="select-cat-prod-pereciveis"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const plu = btn.dataset.plu;
        const name = btn.dataset.name;
        const cat = btn.dataset.cat;

        container.querySelector('#field-plu-pereciveis').value = plu;
        container.querySelector('#field-name-pereciveis').value = name;
        container.querySelector('#field-category-pereciveis').value = cat;

        // Auto-detecção do fornecedor pelo nome
        const detectedSupp = window.BrigadaData.detectSupplierFromName(name);
        if (detectedSupp) {
          container.querySelector('#field-supplier-pereciveis').value = detectedSupp;
        }

        container.querySelector('#selected-catalog-name-pereciveis').textContent = name;
        container.querySelector('#selected-catalog-plu-pereciveis').textContent = plu;
        container.querySelector('#selected-catalog-cat-pereciveis').textContent = (this.catMap && this.catMap[(cat || '').toLowerCase()]) || cat;
        container.querySelector('#selected-catalog-card-pereciveis').style.display = 'flex';

        container.querySelector('#manual-fields-row-pereciveis').style.display = 'none';
        container.querySelector('#manual-name-group-pereciveis').style.display = 'none';

        // Oculta catálogo e exibe formulário
        container.querySelector('#product-modal-step-catalog-pereciveis').style.display = 'none';
        container.querySelector('#product-modal-step-form-pereciveis').style.display = 'block';
        container.querySelector('#product-modal-footer-pereciveis').style.display = 'flex';
      });
    });
  },

  openAddModal(container) {
    if (!window.BrigadaAuth.canAddProduct()) return;
    this.editingId = null;
    this.originalQuantity = 0;
    this.catalogModalSearch = '';
    this.catalogModalCategory = 'all';

    container.querySelector('#modal-title-pereciveis').textContent = 'Novo Produto Perecível';
    
    const form = container.querySelector('#product-form-pereciveis');
    form.reset();
    form.querySelectorAll('.form-input, select').forEach(el => {
      el.disabled = false;
      el.readOnly = false;
    });

    container.querySelector('#field-id-pereciveis').value = '';
    container.querySelector('#field-plu-pereciveis').value = '';
    container.querySelector('#field-startDate-pereciveis').value = window.BrigadaData.getTodayFormatted();
    container.querySelector('#field-endDate-pereciveis').value = '';
    container.querySelector('#field-quantity-pereciveis').value = '';
    container.querySelector('#field-location-pereciveis').value = '';
    if (container.querySelector('#field-chamber-col-pereciveis')) container.querySelector('#field-chamber-col-pereciveis').value = '';
    if (container.querySelector('#field-chamber-level-pereciveis')) container.querySelector('#field-chamber-level-pereciveis').value = '';
    if (container.querySelector('#field-chamber-pos-pereciveis')) container.querySelector('#field-chamber-pos-pereciveis').value = '';
    if (container.querySelector('#field-freezer-num-pereciveis')) container.querySelector('#field-freezer-num-pereciveis').value = '';
    if (container.querySelector('#row-chamber-slots-pereciveis')) container.querySelector('#row-chamber-slots-pereciveis').style.display = 'none';
    if (container.querySelector('#row-freezer-slots-pereciveis')) container.querySelector('#row-freezer-slots-pereciveis').style.display = 'none';
    
    // Mostra etapa do catálogo e oculta etapa do formulário
    container.querySelector('#product-modal-step-catalog-pereciveis').style.display = 'block';
    container.querySelector('#product-modal-step-form-pereciveis').style.display = 'none';
    container.querySelector('#product-modal-footer-pereciveis').style.display = 'none';
    container.querySelector('#selected-catalog-card-pereciveis').style.display = 'none';
    container.querySelector('#manual-fields-row-pereciveis').style.display = 'none';
    container.querySelector('#manual-name-group-pereciveis').style.display = 'none';

    // Reset abas do catálogo
    container.querySelectorAll('#catalog-modal-cat-tabs-pereciveis .cat-tab').forEach(t => {
      if (t.dataset.mcat === 'all') t.classList.add('cat-tab--active');
      else t.classList.remove('cat-tab--active');
    });
    if (container.querySelector('#catalog-modal-search-pereciveis')) {
      container.querySelector('#catalog-modal-search-pereciveis').value = '';
    }

    this.renderCatalogSelectorInModal(container);

    // Reset annotation
    container.querySelector('#group-annotation-pereciveis').style.display = 'none';
    container.querySelector('#field-annotation-pereciveis').required = false;
    const infoBanner = container.querySelector('#annotation-info-banner-pereciveis');
    if (infoBanner) infoBanner.style.display = 'none';
    container.querySelectorAll('.annotation-btn-pereciveis').forEach(b => {
      if (b.dataset.value === 'excluir') {
        b.classList.remove('btn--danger');
        b.classList.add('btn--outline', 'btn--danger-outline');
      } else {
        b.classList.remove('btn--primary');
        b.classList.add('btn--outline');
      }
    });
    container.querySelector('#field-annotation-pereciveis').value = '';
    container.querySelector('#subgroup-annotation-text-pereciveis').style.display = 'none';
    container.querySelector('#field-annotation-text-pereciveis').required = false;
    container.querySelector('#field-annotation-text-pereciveis').value = '';

    this.showModal(container);
  },

  openEditModal(id, container) {
    const product = window.BrigadaData.products.find(p => p.id === id);
    if (!product || !window.BrigadaAuth.canEditProduct(product)) return;
    this.editingId = id;
    this.originalQuantity = product.quantity !== undefined ? product.quantity : 0;
    container.querySelector('#modal-title-pereciveis').textContent = 'Editar Produto Perecível';

    // Em edição, abre direto no formulário com campos manuais visíveis
    container.querySelector('#product-modal-step-catalog-pereciveis').style.display = 'none';
    container.querySelector('#product-modal-step-form-pereciveis').style.display = 'block';
    container.querySelector('#product-modal-footer-pereciveis').style.display = 'flex';
    container.querySelector('#selected-catalog-card-pereciveis').style.display = 'none';
    container.querySelector('#manual-fields-row-pereciveis').style.display = 'flex';
    container.querySelector('#manual-name-group-pereciveis').style.display = 'block';
    container.querySelector('#field-id-pereciveis').value = product.id;
    container.querySelector('#field-plu-pereciveis').value = product.plu;
    container.querySelector('#field-name-pereciveis').value = product.name;
    container.querySelector('#field-category-pereciveis').value = product.category;
    container.querySelector('#field-startDate-pereciveis').value = window.BrigadaData.formatDate(product.startDate);
    container.querySelector('#field-endDate-pereciveis').value = window.BrigadaData.formatDate(product.endDate);
    container.querySelector('#field-supplier-pereciveis').value = product.supplier || '';
    
    // Parse location
    const loc = product.location || '';
    const chamberMatch = loc.match(/^(resfriado|congelado)(?::C(\d+)-N(\d+)-([ED]))?$/i);
    const freezerMatch = loc.match(/^piso_loja:(.+)$/i);

    if (chamberMatch) {
      container.querySelector('#field-location-pereciveis').value = chamberMatch[1];
      const chamberSlotsRow = container.querySelector('#row-chamber-slots-pereciveis');
      const freezerSlotsRow = container.querySelector('#row-freezer-slots-pereciveis');
      if (chamberSlotsRow) chamberSlotsRow.style.display = 'flex';
      if (freezerSlotsRow) freezerSlotsRow.style.display = 'none';

      const count = chamberMatch[1] === 'resfriado' ? 4 : 16;
      const colSelect = container.querySelector('#field-chamber-col-pereciveis');
      if (colSelect) {
        colSelect.innerHTML = '<option value="">Selecione a coluna...</option>' + 
          Array.from({ length: count }, (_, i) => {
            const col = i + 1;
            const pad = col.toString().padStart(2, '0');
            return `<option value="${col}">Coluna ${pad}</option>`;
          }).join('');
        if (chamberMatch[2]) colSelect.value = parseInt(chamberMatch[2], 10);
      }
      if (chamberMatch[3] && container.querySelector('#field-chamber-level-pereciveis')) {
        container.querySelector('#field-chamber-level-pereciveis').value = chamberMatch[3];
      }
      if (chamberMatch[4] && container.querySelector('#field-chamber-pos-pereciveis')) {
        container.querySelector('#field-chamber-pos-pereciveis').value = chamberMatch[4].toUpperCase();
      }
    } else if (freezerMatch) {
      container.querySelector('#field-location-pereciveis').value = 'piso_loja';
      const chamberSlotsRow = container.querySelector('#row-chamber-slots-pereciveis');
      const freezerSlotsRow = container.querySelector('#row-freezer-slots-pereciveis');
      if (chamberSlotsRow) chamberSlotsRow.style.display = 'none';
      if (freezerSlotsRow) freezerSlotsRow.style.display = 'flex';
      if (container.querySelector('#field-freezer-num-pereciveis')) {
        container.querySelector('#field-freezer-num-pereciveis').value = freezerMatch[1];
      }
    } else {
      container.querySelector('#field-location-pereciveis').value = loc;
      if (container.querySelector('#row-chamber-slots-pereciveis')) container.querySelector('#row-chamber-slots-pereciveis').style.display = 'none';
      if (container.querySelector('#row-freezer-slots-pereciveis')) container.querySelector('#row-freezer-slots-pereciveis').style.display = 'none';
    }

    container.querySelector('#field-unit-pereciveis').value = product.unit || 'kg';
    container.querySelector('#field-quantity-pereciveis').value = product.quantity !== undefined ? product.quantity : '';
    
    // Reset annotation
    container.querySelector('#group-annotation-pereciveis').style.display = 'none';
    container.querySelector('#field-annotation-pereciveis').required = false;
    const infoBanner = container.querySelector('#annotation-info-banner-pereciveis');
    if (infoBanner) infoBanner.style.display = 'none';
    container.querySelectorAll('.annotation-btn-pereciveis').forEach(b => {
      if (b.dataset.value === 'excluir') {
        b.classList.remove('btn--danger');
        b.classList.add('btn--outline', 'btn--danger-outline');
      } else {
        b.classList.remove('btn--primary');
        b.classList.add('btn--outline');
      }
    });
    container.querySelector('#field-annotation-pereciveis').value = '';
    container.querySelector('#subgroup-annotation-text-pereciveis').style.display = 'none';
    container.querySelector('#field-annotation-text-pereciveis').required = false;
    container.querySelector('#field-annotation-text-pereciveis').value = '';

    // Disable all fields except quantity, annotation and sub-annotation details
    const form = container.querySelector('#product-form-pereciveis');
    form.querySelectorAll('.form-input, select, textarea').forEach(el => {
      if (el.id !== 'field-quantity-pereciveis' && el.id !== 'field-annotation-pereciveis' && el.id !== 'field-annotation-text-pereciveis') {
        el.disabled = true;
      } else {
        el.disabled = false;
      }
    });

    this.showModal(container);
  },

  showModal(container) {
    const modal = container.querySelector('#product-modal-pereciveis');
    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('modal-overlay--visible'));
  },

  closeModal(container) {
    const modal = container.querySelector('#product-modal-pereciveis');
    modal.classList.remove('modal-overlay--visible');
    setTimeout(() => modal.style.display = 'none', 250);
  },

  openDeleteModal(id, container) {
    const product = window.BrigadaData.products.find(p => p.id === id);
    if (!product || !window.BrigadaAuth.canDeleteProduct(product)) return;
    this.deletingId = id;
    container.querySelector('#delete-product-name-pereciveis').textContent = product.name;
    const modal = container.querySelector('#delete-modal-pereciveis');
    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('modal-overlay--visible'));
  },

  closeDeleteModal(container) {
    const modal = container.querySelector('#delete-modal-pereciveis');
    modal.classList.remove('modal-overlay--visible');
    setTimeout(() => modal.style.display = 'none', 250);
  },

  async saveProduct(container) {
    const isEditing = !!this.editingId;
    if (isEditing) {
      const product = window.BrigadaData.products.find(p => p.id === this.editingId);
      if (!product || !window.BrigadaAuth.canEditProduct(product)) {
        window.BrigadaUI.showToast('Permissão negada. Você não tem permissão para editar este produto.', 'error');
        return;
      }
    } else {
      if (!window.BrigadaAuth.canAddProduct()) {
        window.BrigadaUI.showToast('Permissão negada. Apenas Super Administradores e Usuários comuns podem adicionar produtos.', 'error');
        return;
      }
    }
    const plu = container.querySelector('#field-plu-pereciveis').value.trim();
    const barcode = product?.barcode || '';
    const name = container.querySelector('#field-name-pereciveis').value.trim();
    const category = container.querySelector('#field-category-pereciveis').value;
    const rawStartDate = container.querySelector('#field-startDate-pereciveis').value.trim();
    const rawEndDate = container.querySelector('#field-endDate-pereciveis').value.trim();
    const supplier = container.querySelector('#field-supplier-pereciveis').value.trim();
    const locationType = container.querySelector('#field-location-pereciveis').value;
    const unit = container.querySelector('#field-unit-pereciveis').value;
    const qtyVal = container.querySelector('#field-quantity-pereciveis').value;
    const quantity = qtyVal !== '' ? parseFloat(qtyVal) : 0;
    
    const startDate = rawStartDate ? window.BrigadaData.parseDateInput(rawStartDate) : null;
    const endDate = window.BrigadaData.parseDateInput(rawEndDate);
    
    let location = locationType;
    let column = null;
    let columnNumber = null;

    if (locationType === 'resfriado' || locationType === 'congelado') {
      const col = container.querySelector('#field-chamber-col-pereciveis')?.value;
      const level = container.querySelector('#field-chamber-level-pereciveis')?.value;
      const pos = container.querySelector('#field-chamber-pos-pereciveis')?.value;

      if (col && level && pos) {
        location = `${locationType}:C${col}-N${level}-${pos}`;
        column = level === '1' ? 'Piso' : 'Aéreo';
        columnNumber = parseInt(col, 10);
      }
    } else if (locationType === 'piso_loja') {
      const fz = container.querySelector('#field-freezer-num-pereciveis')?.value;
      if (fz) {
        location = `piso_loja:${fz}`;
      }
    }

    const selectVal = container.querySelector('#field-annotation-pereciveis').value;
    const textVal = container.querySelector('#field-annotation-text-pereciveis').value.trim();

    if (this.editingId && quantity < this.originalQuantity) {
      if (!selectVal) {
        window.BrigadaUI.showToast('Por favor, selecione o motivo da redução da quantidade.', 'error');
        return;
      }
      if (!textVal) {
        window.BrigadaUI.showToast('Por favor, digite os detalhes do motivo da redução.', 'error');
        return;
      }
    }

    const annotation = selectVal ? `${selectVal} - ${textVal}` : '';

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

    const payload = { plu, barcode, name, category, startDate, endDate, supplier, location, unit, quantity, column, columnNumber, annotation, creator, editor };

    try {
      if (this.editingId) {
        await window.BrigadaData.updateProduct(this.editingId, payload);
        window.BrigadaUI.showToast('Produto atualizado com sucesso!', 'success');
      } else {
        await window.BrigadaData.addProduct(payload);
        window.BrigadaUI.showToast('Produto cadastrado com sucesso!', 'success');
      }
      this.closeModal(container);
      this.renderTable(container);
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
    this.renderTable(container);
  },

  // ── Solicitar Rebaixa ──────────────────────────────────────────────────────
  requestReduction(container) {
    const checkboxes = container.querySelectorAll('.select-product-checkbox:checked');
    const ids = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
    if (ids.length === 0) {
      window.BrigadaUI.showToast('Selecione pelo menos um produto para solicitar rebaixa.', 'error');
      return;
    }
    window.BrigadaData.setAwaitingReduction(ids, true);
    window.BrigadaUI.showToast(`${ids.length} produto(s) movido(s) para Aguardando Rebaixa!`, 'success');
    
    const selectAll = container.querySelector('#select-all-products-pereciveis');
    if (selectAll) selectAll.checked = false;
    this.renderTable(container);
  },

  // ── Export Excel (CSV com BOM UTF-8) ──────────────────────────────────────
  exportExcel() {
    const checkboxes = document.querySelectorAll('.select-product-checkbox:checked');
    const ids = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
    let products = this.getFilteredProducts();
    if (ids.length > 0) {
      products = products.filter(p => ids.includes(p.id));
    }
    if (products.length === 0) {
      window.BrigadaUI.showToast('Nenhum produto selecionado ou filtrado para exportar.', 'error');
      return;
    }

    const catMap = { iogurtes: 'Iogurtes', laticinios: 'Laticínios', frios: 'Frios', pereciveis: 'Perecíveis', 'perecíveis': 'Perecíveis' };
    const header = ['PLU', 'Produto', 'Quantidade', 'Unidade', 'Categoria', 'Data de Cadastro', 'Validade', 'Status', 'Fornecedor', 'Localização'];

    const rows = products.map(p => {
      const s = window.BrigadaData.getProductStatus(p);
      return [
        p.plu,
        p.name,
        p.quantity !== undefined ? p.quantity : 0,
        p.unit || 'kg',
        catMap[p.category] || p.category,
        p.startDate || '',
        p.endDate,
        s.label,
        p.supplier || '',
        window.BrigadaData.formatLocationFriendly(p)
      ];
    });

    const csvContent = [header, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
      .join('\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `produtos_pereciveis_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    window.BrigadaUI.showToast(`${products.length} produtos exportados para Excel!`, 'success');
  },

  // ── Export PDF ────────────────────────────────────────────────────────────
  exportPDF() {
    const checkboxes = document.querySelectorAll('.select-product-checkbox:checked');
    const ids = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
    let products = this.getFilteredProducts();
    if (ids.length > 0) {
      products = products.filter(p => ids.includes(p.id));
    }
    if (products.length === 0) {
      window.BrigadaUI.showToast('Nenhum produto selecionado ou filtrado para exportar.', 'error');
      return;
    }

    const catMap = { iogurtes: 'Iogurtes', laticinios: 'Laticínios', frios: 'Frios', pereciveis: 'Perecíveis', 'perecíveis': 'Perecíveis' };
    const now = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const stats = {
      total: products.length,
      ok: 0,
      expiresSoon: 0,
      expired: 0
    };

    const rows = products.map(p => {
      const s = window.BrigadaData.getProductStatus(p);
      const statusColor = s.days < 0 ? '#ef4444' : s.days === 0 ? '#f97316' : s.days <= 3 ? '#f59e0b' : '#22c55e';
      
      if (s.days < 0) stats.expired++;
      else if (s.days <= 3) stats.expiresSoon++;
      else stats.ok++;

      return `
        <tr>
          <td style="font-family:monospace;color:#6366f1;font-weight:600;">${p.plu}</td>
          <td>${p.name}</td>
          <td>${p.quantity || 0} ${p.unit || 'kg'}</td>
          <td>${catMap[p.category] || p.category}</td>
          <td>${window.BrigadaData.formatDate ? window.BrigadaData.formatDate(p.endDate) : p.endDate}</td>
          <td><span style="color:${statusColor}">${s.label || s.text || ''}</span></td>
          <td>${p.location || '—'}</td>
        </tr>
      `;
    }).join('');

    const printContent = `
      <div class="print-container">
        <style>
          .print-container { font-family: 'Segoe UI', Arial, sans-serif; color:#1e293b; padding:24px; font-size:11px; background:#ffffff; }
          .print-container .header { text-align:center; margin-bottom:20px; padding-bottom:16px; border-bottom:2px solid #6366f1; }
          .print-container .header h1 { font-size:20px; color:#6366f1; margin-bottom:4px; }
          .print-container .header p { color:#64748b; font-size:12px; }
          .print-container .summary { display:flex; gap:12px; margin-bottom:16px; justify-content:center; flex-wrap:wrap; }
          .print-container .summary-item { background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:8px 16px; text-align:center; }
          .print-container .summary-item .num { font-size:18px; font-weight:800; }
          .print-container .summary-item .label { font-size:9px; color:#64748b; text-transform:uppercase; letter-spacing:0.05em; }
          .print-container .num-total { color:#6366f1; }
          .print-container .num-ok { color:#22c55e; }
          .print-container .num-warn { color:#f59e0b; }
          .print-container .num-exp { color:#ef4444; }
          .print-container table { width:100%; border-collapse:collapse; margin-top:8px; }
          .print-container th { background:#6366f1; color:#fff; padding:8px 6px; text-align:left; font-size:10px; text-transform:uppercase; letter-spacing:0.05em; }
          .print-container td { padding:6px; border-bottom:1px solid #e2e8f0; font-size:11px; color:#1e293b; }
          .print-container tr:nth-child(even) td { background:#f8fafc; }
          .print-container .footer { margin-top:20px; text-align:center; color:#94a3b8; font-size:9px; border-top:1px solid #e2e8f0; padding-top:12px; }
        </style>
        <div class="header">
          <h1>🛡️ BRIGADA-IA — Relatório de Produtos</h1>
          <p>Gerado em ${now} · Setor de Perecíveis</p>
        </div>
        <div class="summary">
          <div class="summary-item"><div class="num num-total">${stats.total}</div><div class="label">Total</div></div>
          <div class="summary-item"><div class="num num-ok">${stats.ok}</div><div class="label">OK</div></div>
          <div class="summary-item"><div class="num num-warn">${stats.expiresSoon}</div><div class="label">Atenção</div></div>
          <div class="summary-item"><div class="num num-exp">${stats.expired}</div><div class="label">Vencidos</div></div>
        </div>
        <table>
          <thead>
            <tr><th>PLU</th><th>Produto</th><th>Qtd</th><th>Categoria</th><th>Validade</th><th>Status</th><th>Local</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="footer">BRIGADA-IA v1.0 · Brigada de Validade · ${products.length} produtos listados</div>
      </div>`;

    window.BrigadaUI.printContent(printContent);
    window.BrigadaUI.showToast('Visualização de impressão aberta! Use "Salvar como PDF" se desejar.', 'success');
  },

  // ── Import CSV ────────────────────────────────────────────────────────────
  async importCSV(event, container) {
    const file = event.target.files[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(l => l.trim());

    if (lines.length < 2) {
      window.BrigadaUI.showToast('Arquivo CSV vazio ou sem dados.', 'error');
      event.target.value = '';
      return;
    }

    const sep = lines[0].includes(';') ? ';' : ',';
    const parseRow = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
          else { inQuotes = !inQuotes; }
        } else if (ch === sep && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += ch;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseRow(lines[0]).map(h => h.toLowerCase().replace(/[^a-záéíóúãõâêôç]/g, ''));

    const findCol = (...names) => headers.findIndex(h => names.some(n => h.includes(n)));
    const colPlu = findCol('plu', 'codigo', 'cdigo');
    const colName = findCol('produto', 'nome', 'name');
    const colCategory = findCol('categoria', 'category');
    const colEndDate = findCol('validade', 'datafinal', 'enddate', 'vencimento');
    const colStartDate = findCol('datainicial', 'startdate', 'inicio');
    const colSupplier = findCol('fornecedor', 'supplier');
    const colLocation = findCol('localizao', 'localizacao', 'location', 'local');
    const colQty = findCol('quantidade', 'qtd', 'qty', 'quantity');
    const colUnit = findCol('unidade', 'unit');

    if (colPlu === -1 || colName === -1 || colEndDate === -1) {
      window.BrigadaUI.showToast('CSV deve ter colunas: PLU, Produto/Nome e Validade/DataFinal.', 'error');
      event.target.value = '';
      return;
    }

    const catMap = { 
      iogurtes: 'iogurtes', 
      laticinios: 'laticinios', 
      frios: 'frios', 
      pereciveis: 'pereciveis', 
      perecveis: 'pereciveis',
      perecíveis: 'pereciveis'
    };
    let imported = 0;
    let skipped = 0;

    for (let i = 1; i < lines.length; i++) {
      const cols = parseRow(lines[i]);
      const plu = cols[colPlu] || '';
      const name = cols[colName] || '';
      const endDate = cols[colEndDate] || '';

      if (!plu || !name || !endDate) { skipped++; continue; }

      if (window.BrigadaData.products.find(p => p.plu.trim().toLowerCase() === plu.toLowerCase() && p.endDate === endDate)) {
        skipped++;
        continue;
      }

      const rawCat = colCategory !== -1 ? (cols[colCategory] || '').toLowerCase().replace(/[^a-z]/g, '') : '';
      const category = catMap[rawCat] || 'pereciveis';

      const rawLoc = colLocation !== -1 ? (cols[colLocation] || '').toLowerCase() : '';
      let location = 'resfriado';
      if (rawLoc.includes('congelado')) {
        location = 'congelado';
      }

      const payload = {
        plu,
        name,
        category,
        endDate,
        startDate: colStartDate !== -1 ? (cols[colStartDate] || '') : '',
        supplier: colSupplier !== -1 ? (cols[colSupplier] || '') : '',
        location,
        quantity: colQty !== -1 ? (parseFloat(cols[colQty]) || 0) : 0,
        unit: colUnit !== -1 ? (cols[colUnit] || 'kg') : 'kg',
      };

      try {
        await window.BrigadaData.addProduct(payload);
        imported++;
      } catch {
        skipped++;
      }
    }

    event.target.value = '';
    this.renderTable(container);
    window.BrigadaUI.showToast(`Importação concluída: ${imported} adicionados, ${skipped} ignorados.`, imported > 0 ? 'success' : 'error');
  },
};

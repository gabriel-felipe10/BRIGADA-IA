/**
 * BRIGADA-IA — Módulo de Conciliação de Estoque
 */

(function() {
  const style = document.createElement('style');
  style.textContent = `
    .autocomplete-wrapper {
      position: relative;
    }
    .autocomplete-results {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      max-height: 200px;
      overflow-y: auto;
      background: rgba(30, 41, 59, 0.98);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      z-index: 1000;
      margin-top: 4px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
    }
    .autocomplete-item {
      padding: 10px 12px;
      cursor: pointer;
      color: #f8fafc;
      font-size: 0.9rem;
      transition: background 0.2s, color 0.2s;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .autocomplete-item:last-child {
      border-bottom: none;
    }
    .autocomplete-item:hover {
      background: #3b82f6;
      color: #fff;
    }
  `;
  document.head.appendChild(style);
})();

window.BrigadaConciliacao = {
  currentSearch: '',
  editingId: null,
  deletingId: null,

  render(container) {
    container.innerHTML = this.buildHTML();
    this.bindEvents(container);
    this.renderTable(container);
  },

  buildHTML() {
    const canAddProduct = window.BrigadaAuth.canAddProduct();
    return `
      <div class="panel-header">
        <div class="panel-header__left">
          <h2 class="panel-title">⚖️ Conciliação de Estoque</h2>
          <p class="panel-subtitle">Compare o estoque físico com o virtual para auditar divergências</p>
        </div>
        <div class="glass-actions-card" style="display:flex; gap:var(--sp-sm); flex-wrap:wrap; align-items:center;">
          ${window.BrigadaAuth.isPromotor() ? `
          <button class="btn btn--ghost" id="btn-goto-dashboard">
            <span>📊</span> Voltar ao Dashboard
          </button>
          ` : ''}
          <button class="btn btn--primary" id="btn-print-reconciliation" title="Imprimir itens selecionados">
            <span>🖨️</span> Imprimir Selecionados
          </button>
          ${canAddProduct ? `
          <button class="btn btn--primary" id="btn-add-conciliacao">
            <span>＋</span> Nova Conciliação
          </button>
          ` : ''}
        </div>
      </div>

      <div class="glass-panel" style="padding: 1.5rem; margin-top: 1rem;">
        <div class="toolbar">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input type="text" id="search-conciliacao" class="search-input" placeholder="Buscar por nome ou PLU...">
          </div>
          <div class="toolbar-right">
            <select id="filter-divergencia-conciliacao" class="select-control">
              <option value="all">Todas as divergências</option>
              <option value="divergente">⚠️ Com Divergência</option>
              <option value="conciliado">✅ Conciliado (Sem Divergência)</option>
              <option value="sobra">📈 Sobra (Físico > Virtual)</option>
              <option value="falta">📉 Falta (Físico < Virtual)</option>
            </select>
          </div>
        </div>

        <div class="table-wrapper" id="conciliacao-table-wrapper">
          <!-- tabela renderizada dinamicamente -->
        </div>
      </div>

      <!-- Modal de cadastro/edição -->
      <div class="modal-overlay" id="conciliacao-modal" style="display:none;">
        <div class="modal" style="max-width: 500px;">
          <div class="modal-header">
            <h3 class="modal-title" id="conciliacao-modal-title">Nova Conciliação</h3>
            <button class="modal-close" id="conciliacao-modal-close">✕</button>
          </div>
          <div class="modal-body">
            <form id="conciliacao-form">
              <input type="hidden" id="field-conciliacao-id">
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Filtrar por Categoria</label>
                  <select id="field-conciliacao-category-filter" class="form-input">
                    <option value="all">Todas as Categorias</option>
                    <!-- preenchido via JS dinamicamente com base no setor do usuário -->
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Conservação</label>
                  <select id="field-conciliacao-temp-filter" class="form-input">
                    <option value="all">Todos</option>
                    <option value="resfriado">❄️ Resfriado</option>
                    <option value="congelado">🥶 Congelado</option>
                    <option value="piso_loja">🏪 Piso de Loja</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Produto do Catálogo *</label>
                <div class="autocomplete-wrapper">
                  <input type="text" id="field-conciliacao-product-search" class="form-input" placeholder="Escreva o PLU ou nome para buscar..." required autocomplete="off">
                  <input type="hidden" id="field-conciliacao-product" required>
                  <div id="field-conciliacao-product-results" class="autocomplete-results" style="display:none;"></div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Estoque Físico Contado *</label>
                  <input type="number" id="field-conciliacao-physical" class="form-input" placeholder="ex: 15.5" step="any" min="0" required>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Unidade</label>
                  <select id="field-conciliacao-unit" class="form-input">
                    <option value="kg">kg</option>
                    <option value="un">un</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Local de Contagem *</label>
                  <select id="field-conciliacao-location" class="form-input" required>
                    <option value="">Selecione...</option>
                    <!-- preenchido dinamicamente com base no setor do usuário -->
                  </select>
                </div>
              </div>

              <!-- Nome Completo do Responsável -->
              <div class="form-group">
                <label class="form-label" for="field-conciliacao-responsible-name">Nome Completo do Responsável *</label>
                <input type="text" id="field-conciliacao-responsible-name" class="form-input" placeholder="Digite o nome de quem realizou a contagem..." required>
              </div>

              <!-- Assinatura do Responsável -->
              <div class="form-group">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                  <label class="form-label" style="font-weight: 600; margin-bottom: 0; color: var(--text-primary);">✍️ Assinatura do Responsável *</label>
                  <button type="button" class="btn btn--sm btn--ghost" id="clear-conciliacao-sig-btn" style="padding: 2px 8px; font-size: 0.8rem; height: auto;">Limpar</button>
                </div>
                <div style="background: #ffffff; border-radius: 6px; border: 1px solid #cbd5e1; height: 120px; overflow: hidden; position: relative;">
                  <canvas id="field-conciliacao-sig-canvas" width="460" height="120" style="width: 100%; height: 100%; cursor: crosshair; display: block; touch-action: none;"></canvas>
                </div>
              </div>

              <!-- Nome Completo do Líder que Acompanhou -->
              <div class="form-group">
                <label class="form-label" for="field-conciliacao-leader-name">Nome Completo do Líder (Acompanhamento) *</label>
                <input type="text" id="field-conciliacao-leader-name" class="form-input" placeholder="Digite o nome do líder que acompanhou a contagem..." required>
              </div>

              <!-- Assinatura do Líder -->
              <div class="form-group">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                  <label class="form-label" style="font-weight: 600; margin-bottom: 0; color: var(--text-primary);">✍️ Assinatura do Líder *</label>
                  <button type="button" class="btn btn--sm btn--ghost" id="clear-conciliacao-leader-sig-btn" style="padding: 2px 8px; font-size: 0.8rem; height: auto;">Limpar</button>
                </div>
                <div style="background: #ffffff; border-radius: 6px; border: 1px solid #cbd5e1; height: 120px; overflow: hidden; position: relative;">
                  <canvas id="field-conciliacao-leader-sig-canvas" width="460" height="120" style="width: 100%; height: 100%; cursor: crosshair; display: block; touch-action: none;"></canvas>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn--ghost" id="btn-cancel-conciliacao">Cancelar</button>
            <button class="btn btn--primary" id="btn-save-conciliacao">Salvar Conciliação</button>
          </div>
        </div>
      </div>

      <!-- Modal de confirmação de exclusão -->
      <div class="modal-overlay" id="delete-conciliacao-modal" style="display:none;">
        <div class="modal modal--sm">
          <div class="modal-header">
            <h3 class="modal-title">⚠️ Confirmar Remoção</h3>
            <button class="modal-close" id="delete-conciliacao-modal-close">✕</button>
          </div>
          <div class="modal-body">
            <p style="color:var(--text-secondary);">Tem certeza que deseja remover esta contagem de conciliação do produto <strong id="delete-conciliacao-name" style="color:var(--text-primary);"></strong>?</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn--ghost" id="btn-cancel-delete-conciliacao">Cancelar</button>
            <button class="btn btn--danger" id="btn-confirm-delete-conciliacao">Remover</button>
          </div>
        </div>
      </div>
    `;
  },

  bindEvents(container) {
    const searchInput = container.querySelector('#search-conciliacao');
    const filterDivergencia = container.querySelector('#filter-divergencia-conciliacao');
    const btnAdd = container.querySelector('#btn-add-conciliacao');
    const btnPrint = container.querySelector('#btn-print-reconciliation');

    searchInput?.addEventListener('input', (e) => {
      this.currentSearch = e.target.value;
      this.renderTable(container);
    });

    filterDivergencia?.addEventListener('change', () => {
      this.renderTable(container);
    });

    btnAdd?.addEventListener('click', () => {
      this.openModal(container);
    });

    btnPrint?.addEventListener('click', () => {
      this.printSelected(container);
    });

    container.querySelector('#btn-goto-dashboard')?.addEventListener('click', () => {
      window.BrigadaRouter.navigate('dashboard');
    });

    // Close Modals
    container.querySelector('#conciliacao-modal-close')?.addEventListener('click', () => this.closeModal(container));
    container.querySelector('#btn-cancel-conciliacao')?.addEventListener('click', () => this.closeModal(container));

    container.querySelector('#delete-conciliacao-modal-close')?.addEventListener('click', () => this.closeDeleteModal(container));
    container.querySelector('#btn-cancel-delete-conciliacao')?.addEventListener('click', () => this.closeDeleteModal(container));

    // Save Conciliação
    container.querySelector('#btn-save-conciliacao')?.addEventListener('click', () => this.saveConciliacao(container));

    // Delete Confirm
    container.querySelector('#btn-confirm-delete-conciliacao')?.addEventListener('click', () => this.deleteConciliacao(container));

    // Product Autocomplete Events (escrever e aparecer produto)
    const productSearchInput = container.querySelector('#field-conciliacao-product-search');
    const hiddenProduct = container.querySelector('#field-conciliacao-product');
    const resultsBox = container.querySelector('#field-conciliacao-product-results');
    const categoryFilter = container.querySelector('#field-conciliacao-category-filter');
    const tempFilter = container.querySelector('#field-conciliacao-temp-filter');
    const unitSelect = container.querySelector('#field-conciliacao-unit');

    const updateResults = () => {
      const q = productSearchInput.value.toLowerCase().trim();
      const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
      const selectedTemp = tempFilter ? tempFilter.value : 'all';

      // Filtrar produtos baseados no setor e categoria
      const user = window.BrigadaAuth.currentUser;
      const userSector = user ? user.sector : 'todos';

      const sectorCategories = {
        'açougue': ['aves', 'suino', 'bovino', 'pescado'],
        'padaria': ['padaria'],
        'hortifruti': ['hortifruti'],
        'mercearia': ['mercearia']
      };

      let allowedCategories = [];
      if (userSector === 'todos' || window.BrigadaAuth.isSuperAdmin()) {
        allowedCategories = Object.values(sectorCategories).flat();
      } else if (sectorCategories[userSector]) {
        allowedCategories = sectorCategories[userSector];
      }

      const rawCatalog = [
        ...(window.BrigadaData.catalog || []),
        ...(window.BrigadaData.products || []),
        ...(window.PRODUCTS_DB || [])
      ];

      const seenPlus = new Set();
      let catalogItems = [];
      for (const item of rawCatalog) {
        if (item && item.plu && !seenPlus.has(String(item.plu).trim())) {
          seenPlus.add(String(item.plu).trim());
          catalogItems.push(item);
        }
      }

      // Filtra pelo setor do usuário
      catalogItems = catalogItems.filter(c => {
        if (allowedCategories.length === 0) return true;
        const cat = (c.category || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return allowedCategories.some(ac => cat.includes(ac) || ac.includes(cat));
      });

      // Filtra pela categoria selecionada
      if (selectedCategory !== 'all') {
        catalogItems = catalogItems.filter(c => {
          const cat = (c.category || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const target = selectedCategory.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

          if (target === 'bovino') return cat.includes('bov') || cat.includes('carne');
          if (target === 'suino') return cat.includes('suin') || cat.includes('suno') || cat.includes('porc');
          if (target === 'pescado') return cat.includes('pesc') || cat.includes('peix');
          if (target === 'aves') return cat.includes('av') || cat.includes('frang');
          if (target === 'padaria') return cat.includes('padaria') || cat.includes('paes');
          if (target === 'hortifruti') return cat.includes('horti') || cat.includes('frut');
          if (target === 'mercearia') return cat.includes('mercearia');

          return cat === target || cat.includes(target) || target.includes(cat);
        });
      }

      // Filtra pela conservação (congelado vs resfriado com base no nome)
      if (selectedTemp !== 'all') {
        catalogItems = catalogItems.filter(c => {
          const nameLower = c.name.toLowerCase();
          const isCong = nameLower.includes('cong') || 
                         nameLower.includes('cg') || 
                         nameLower.includes('cgo') || 
                         nameLower.includes('iqf') || 
                         nameLower.includes('empan') || 
                         nameLower.includes(' emp ') || 
                         nameLower.endsWith(' emp') || 
                         nameLower.includes('env') || 
                         nameLower.includes('formoso') || 
                         nameLower.includes('cancao') || 
                         nameLower.includes('bj') || 
                         nameLower.includes('bdj') || 
                         nameLower.includes('desf') || 
                         nameLower.includes('assa') || 
                         nameLower.includes('congelad');
          return selectedTemp === 'congelado' ? isCong : !isCong;
        });
      }

      // Filtra pela digitação (PLU ou nome)
      if (q) {
        catalogItems = catalogItems.filter(c => 
          c.plu.toLowerCase().includes(q) || 
          c.name.toLowerCase().includes(q)
        );
      }

      if (catalogItems.length === 0) {
        resultsBox.innerHTML = '<div class="autocomplete-item" style="color:var(--text-tertiary); cursor:default;">Nenhum produto encontrado nesta categoria</div>';
      } else {
        resultsBox.innerHTML = catalogItems.map(c => `
          <div class="autocomplete-item" data-plu="${c.plu}" data-name="${c.name}" data-category="${c.category}">
            <strong>${c.plu}</strong> - ${c.name}
          </div>
        `).join('');

        // Bind clicks no item
        resultsBox.querySelectorAll('.autocomplete-item').forEach(item => {
          item.addEventListener('click', () => {
            const plu = item.dataset.plu;
            const name = item.dataset.name;
            const category = item.dataset.category;

            productSearchInput.value = `${plu} - ${name}`;
            hiddenProduct.value = plu;
            resultsBox.style.display = 'none';

            // Define unidade recomendada do catálogo
            if (category) {
              const defaultUnit = ['aves', 'suino', 'bovino', 'pescado'].includes(category) ? 'kg' : 'un';
              unitSelect.value = defaultUnit;
            }
          });
        });
      }

      resultsBox.style.display = 'block';
    };

    productSearchInput?.addEventListener('input', updateResults);
    productSearchInput?.addEventListener('focus', updateResults);

    // Fecha ao clicar fora
    document.addEventListener('click', (e) => {
      if (!productSearchInput?.contains(e.target) && !resultsBox?.contains(e.target)) {
        if (resultsBox) resultsBox.style.display = 'none';
      }
    });

    // Se o filtro de categoria mudar, limpa a seleção e atualiza os resultados
    categoryFilter?.addEventListener('change', () => {
      productSearchInput.value = '';
      hiddenProduct.value = '';
      updateResults();
    });

    // Se o filtro de conservação mudar, limpa a seleção e atualiza os resultados
    tempFilter?.addEventListener('change', () => {
      productSearchInput.value = '';
      hiddenProduct.value = '';
      updateResults();
    });
  },

  calculateVirtualStock(plu) {
    // Soma a quantidade de todos os produtos do mesmo PLU que NÃO sejam da categoria de conciliação
    return window.BrigadaData.products
      .filter(p => p.plu.trim() === plu.trim() && p.category !== 'conciliacao')
      .reduce((acc, p) => acc + (p.quantity || 0), 0);
  },

  getFilteredReconciliations() {
    let products = window.BrigadaData.products.filter(p => p.category === 'conciliacao');

    const user = window.BrigadaAuth.currentUser;
    const userSector = user ? user.sector : 'todos';

    const sectorCategories = {
      'açougue': ['aves', 'suino', 'bovino', 'pescado'],
      'padaria': ['padaria'],
      'hortifruti': ['hortifruti'],
      'mercearia': ['mercearia']
    };

    let allowedCategories = [];
    if (userSector === 'todos' || window.BrigadaAuth.isSuperAdmin()) {
      allowedCategories = Object.values(sectorCategories).flat();
    } else if (sectorCategories[userSector]) {
      allowedCategories = sectorCategories[userSector];
    }

    // Filtra pelo setor do usuário
    const rawCatalog = [
      ...(window.BrigadaData.catalog || []),
      ...(window.PRODUCTS_DB || [])
    ];

    products = products.filter(p => {
      if (userSector === 'todos' || window.BrigadaAuth.isSuperAdmin() || allowedCategories.length === 0) {
        return true;
      }
      const catalogItem = rawCatalog.find(c => String(c.plu).trim() === String(p.plu).trim());
      if (!catalogItem) return true; // Se o item é novo ou não está no catálogo base, exibe para não ocultar da tabela
      const cat = (catalogItem.category || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return allowedCategories.some(ac => cat.includes(ac) || ac.includes(cat));
    });

    if (this.currentSearch) {
      const q = this.currentSearch.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.plu.toLowerCase().includes(q)
      );
    }

    const diffFilter = document.getElementById('filter-divergencia-conciliacao')?.value || 'all';
    if (diffFilter !== 'all') {
      products = products.filter(p => {
        const virtual = this.calculateVirtualStock(p.plu);
        const physical = p.quantity || 0;
        const diff = physical - virtual;

        if (diffFilter === 'divergente') return Math.abs(diff) > 0.01;
        if (diffFilter === 'conciliado') return Math.abs(diff) <= 0.01;
        if (diffFilter === 'sobra') return diff > 0.01;
        if (diffFilter === 'falta') return diff < -0.01;
        return true;
      });
    }

    return products;
  },

  renderTable(container) {
    const wrapper = container.querySelector('#conciliacao-table-wrapper');
    if (!wrapper) return;

    const reconciliations = this.getFilteredReconciliations();

    if (reconciliations.length === 0) {
      wrapper.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">⚖️</div>
          <p class="empty-state__text">Nenhuma conciliação cadastrada</p>
        </div>`;
      return;
    }

    // Toggle select all checkbox in table header
    const showActions = reconciliations.some(p => window.BrigadaAuth.canEditProduct(p) || window.BrigadaAuth.canDeleteProduct(p));
    
    wrapper.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 50px; text-align: center;">
              <input type="checkbox" id="select-all-conciliacao" style="cursor:pointer; width:16px; height:16px;">
            </th>
            <th>PLU</th>
            <th>Produto</th>
            <th>Estoque Físico</th>
            <th>Localização</th>
            <th style="text-align: center;">Ações</th>
          </tr>
        </thead>
        <tbody id="conciliacao-table-body">
          <!-- Renderizado abaixo -->
        </tbody>
      </table>
    `;

    const tbody = wrapper.querySelector('#conciliacao-table-body');
    if (!tbody) return;

    tbody.innerHTML = reconciliations.map(p => {
      const physical = p.quantity || 0;
      const unit = p.unit || 'kg';

      const canEditThis = window.BrigadaAuth.canEditProduct(p);
      const canDeleteThis = window.BrigadaAuth.canDeleteProduct(p);
      const storedSigs = this.getStoredSignatures(p);
      const isSigned = storedSigs.hasRealSignature || !!storedSigs.signature || !!storedSigs.leaderSignature;

      return `
        <tr data-id="${p.id}">
          <td style="text-align: center;">
            <input type="checkbox" class="select-conciliacao-row" value="${p.id}" style="cursor:pointer; width:16px; height:16px;">
          </td>
          <td data-label="PLU"><span class="plu-badge">${p.plu}</span></td>
          <td data-label="Produto" class="product-name" onclick="window.BrigadaUI.showProductView('${p.id}')" style="cursor: pointer; text-decoration: underline; color: var(--primary);" title="Ver detalhes">${p.name}</td>
          <td data-label="Físico" style="font-weight: 600; color: var(--text-primary);">${physical.toFixed(2)} ${unit}</td>
          <td data-label="Localização">${p.location || '—'}</td>
          <td data-label="Ações" class="actions-cell">
            <button class="btn-icon btn-icon--print" data-action="print-item" data-id="${p.id}" title="Imprimir Comprovante">🖨️</button>
            ${isSigned ? `<span class="btn-icon" style="opacity:0.5; cursor:default;" title="Documento Assinado (Inalterável)">🔒</span>` : ''}
            ${!isSigned && canEditThis ? `<button class="btn-icon btn-icon--edit" data-action="edit" data-id="${p.id}" title="Assinar Contagem">✏️</button>` : ''}
            ${canDeleteThis ? `<button class="btn-icon btn-icon--delete" data-action="delete" data-id="${p.id}" title="Excluir">🗑️</button>` : ''}
          </td>
        </tr>
      `;
    }).join('');

    // Bind checkboxes events
    const selectAll = wrapper.querySelector('#select-all-conciliacao');
    const rowCheckboxes = wrapper.querySelectorAll('.select-conciliacao-row');
    
    selectAll?.addEventListener('change', (e) => {
      rowCheckboxes.forEach(cb => cb.checked = e.target.checked);
    });

    // Bind table action buttons
    tbody.querySelectorAll('[data-action="print-item"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.dataset.id);
        const item = window.BrigadaData.products.find(p => p.id === id);
        if (item) {
          this.generateSignedPDF([item]);
        }
      });
    });

    tbody.querySelectorAll('[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.dataset.id);
        this.openModal(container, id);
      });
    });

    tbody.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.dataset.id);
        this.openDeleteModal(container, id);
      });
    });
  },

  openModal(container, id = null) {
    const modal = container.querySelector('#conciliacao-modal');
    const form = container.querySelector('#conciliacao-form');
    const title = container.querySelector('#conciliacao-modal-title');
    const hiddenProduct = container.querySelector('#field-conciliacao-product');
    const searchInput = container.querySelector('#field-conciliacao-product-search');
    const categoryFilter = container.querySelector('#field-conciliacao-category-filter');
    const tempFilter = container.querySelector('#field-conciliacao-temp-filter');
    const physicalInput = container.querySelector('#field-conciliacao-physical');
    const unitSelect = container.querySelector('#field-conciliacao-unit');
    const locationSelect = container.querySelector('#field-conciliacao-location');
    const hiddenId = container.querySelector('#field-conciliacao-id');

    form.reset();
    this.editingId = id;
    hiddenId.value = id || '';
    
    if (categoryFilter) categoryFilter.value = 'all';
    if (tempFilter) tempFilter.value = 'all';
    if (searchInput) searchInput.value = '';
    if (hiddenProduct) hiddenProduct.value = '';

    // Dados do usuário logado
    const user = window.BrigadaAuth.currentUser;
    const userSector = user ? user.sector : 'todos';

    // Preenche locais de contagem com base no setor do usuário
    const sectorLocations = {
      'açougue': [
        { value: 'Câmara Resfriada', label: '❄️ Câmara Resfriada' },
        { value: 'Congelado', label: '🥶 Congelado' },
        { value: 'Antecâmara', label: '🚪 Antecâmara' }
      ],
      'padaria': [
        { value: 'Câmara Resfriada', label: '❄️ Câmara Resfriada' },
        { value: 'Congelado', label: '🥶 Congelado' },
        { value: 'Área de Produção', label: '🍞 Área de Produção' }
      ],
      'hortifruti': [
        { value: 'Câmara Resfriada', label: '❄️ Câmara Resfriada' },
        { value: 'Exposição', label: '🏬 Exposição' }
      ],
      'mercearia': [
        { value: 'Depósito', label: '📦 Depósito' },
        { value: 'Gôndola', label: '🛒 Gôndola' }
      ]
    };

    let locationsToShow = [];
    if (userSector === 'todos' || window.BrigadaAuth.isSuperAdmin()) {
      // Super admin vê todos os locais sem repetição
      const allLocs = Object.values(sectorLocations).flat();
      const seen = new Set();
      locationsToShow = allLocs.filter(l => {
        if (seen.has(l.value)) return false;
        seen.add(l.value);
        return true;
      });
    } else if (sectorLocations[userSector]) {
      locationsToShow = sectorLocations[userSector];
    }

    if (locationSelect) {
      locationSelect.innerHTML = '<option value="">Selecione...</option>' +
        locationsToShow.map(l => `<option value="${l.value}">${l.label}</option>`).join('');
    }

    // Filtro dinâmico de categorias com base no setor do usuário
    const sectorCategories = {
      'açougue': [
        { value: 'aves', label: '🐔 Aves' },
        { value: 'suino', label: '🐷 Suíno' },
        { value: 'bovino', label: '🐮 Bovino' },
        { value: 'pescado', label: '🐟 Pescado' }
      ],
      'padaria': [
        { value: 'padaria', label: '🍞 Padaria' }
      ],
      'hortifruti': [
        { value: 'hortifruti', label: '🥦 Hortifruti' }
      ],
      'mercearia': [
        { value: 'mercearia', label: '🛒 Mercearia' }
      ]
    };



    let categoriesToShow = [];
    if (userSector === 'todos' || window.BrigadaAuth.isSuperAdmin()) {
      categoriesToShow = [
        ...sectorCategories['açougue'],
        ...sectorCategories['padaria'],
        ...sectorCategories['hortifruti'],
        ...sectorCategories['mercearia']
      ];
    } else if (sectorCategories[userSector]) {
      categoriesToShow = sectorCategories[userSector];
    }

    if (categoryFilter) {
      categoryFilter.innerHTML = '<option value="all">Todas as Categorias</option>' +
        categoriesToShow.map(c => `<option value="${c.value}">${c.label}</option>`).join('');
      categoryFilter.value = 'all';
    }

    if (id) {
      title.textContent = 'Editar Conciliação';
      const record = window.BrigadaData.products.find(p => p.id === id);
      if (record) {
        const catalogItem = window.BrigadaData.catalog.find(c => c.plu === record.plu);
        if (catalogItem && categoryFilter) {
          categoryFilter.value = catalogItem.category || 'all';
        }
        
        if (catalogItem && tempFilter) {
          const nameLower = catalogItem.name.toLowerCase();
          const isCong = nameLower.includes('cong') || 
                         nameLower.includes('cg') || 
                         nameLower.includes('cgo') || 
                         nameLower.includes('iqf') || 
                         nameLower.includes('empan') || 
                         nameLower.includes(' emp ') || 
                         nameLower.endsWith(' emp') || 
                         nameLower.includes('env') || 
                         nameLower.includes('formoso') || 
                         nameLower.includes('cancao') || 
                         nameLower.includes('bj') || 
                         nameLower.includes('bdj') || 
                         nameLower.includes('desf') || 
                         nameLower.includes('assa') || 
                         nameLower.includes('congelad');
          tempFilter.value = isCong ? 'congelado' : 'resfriado';
        }

        if (searchInput) searchInput.value = `${record.plu} - ${record.name}`;
        if (hiddenProduct) hiddenProduct.value = record.plu;

        if (categoryFilter) categoryFilter.disabled = true;
        if (tempFilter) tempFilter.disabled = true;
        if (searchInput) searchInput.disabled = true; // não deixa alterar o produto na edição
        
        physicalInput.value = record.quantity;
        unitSelect.value = record.unit || 'kg';
        locationSelect.value = record.location || '';
        
        const respInput = container.querySelector('#field-conciliacao-responsible-name');
        const leaderInput = container.querySelector('#field-conciliacao-leader-name');
        const clearRespBtn = container.querySelector('#clear-conciliacao-sig-btn');
        const clearLeaderBtn = container.querySelector('#clear-conciliacao-leader-sig-btn');
        const saveBtn = container.querySelector('#btn-save-conciliacao');
        const modalForm = container.querySelector('#conciliacao-form');

        const oldNotice = container.querySelector('#locked-conciliacao-notice');
        if (oldNotice) oldNotice.remove();

        const storedSigs = this.getStoredSignatures(record);
        const isAlreadySigned = storedSigs.hasRealSignature || (storedSigs.signature && storedSigs.leaderSignature);
        this.isRecordLocked = isAlreadySigned;

        if (isAlreadySigned) {
          title.textContent = 'Visualizar Conciliação (Documento Inalterável 🔒)';

          if (modalForm) {
            const banner = document.createElement('div');
            banner.id = 'locked-conciliacao-notice';
            banner.style.cssText = 'background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.35); color: #f87171; padding: 10px 14px; border-radius: 8px; font-size: 0.85rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 8px; font-weight: 600;';
            banner.innerHTML = '🔒 <strong>Documento Auditado e Inalterável:</strong> A assinatura foi realizada no cadastro e o documento não pode ser alterado.';
            modalForm.prepend(banner);
          }

          if (physicalInput) physicalInput.disabled = true;
          if (unitSelect) unitSelect.disabled = true;
          if (locationSelect) locationSelect.disabled = true;
          if (respInput) { respInput.value = storedSigs.responsibleName; respInput.disabled = true; }
          if (leaderInput) { leaderInput.value = storedSigs.leaderName; leaderInput.disabled = true; }

          if (clearRespBtn) clearRespBtn.style.display = 'none';
          if (clearLeaderBtn) clearLeaderBtn.style.display = 'none';

          if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '🔒 Documento Inalterável (Assinado)';
            saveBtn.style.opacity = '0.5';
            saveBtn.style.cursor = 'not-allowed';
          }
        } else {
          title.textContent = 'Assinar Conciliação (Permitido 1x)';
          this.isRecordLocked = false;
          if (physicalInput) physicalInput.disabled = true;
          if (unitSelect) unitSelect.disabled = true;
          if (locationSelect) locationSelect.disabled = true;

          // Se já tem assinatura do responsável, bloqueia edição
          const hasRespSig = !!storedSigs.signature;
          const hasLeaderSig = !!storedSigs.leaderSignature;

          if (respInput) { 
            respInput.value = storedSigs.responsibleName || user?.name || ''; 
            respInput.disabled = hasRespSig; 
          }
          if (leaderInput) { 
            leaderInput.value = storedSigs.leaderName || ''; 
            leaderInput.disabled = hasLeaderSig; 
          }
          if (clearRespBtn) clearRespBtn.style.display = hasRespSig ? 'none' : 'inline-flex';
          if (clearLeaderBtn) clearLeaderBtn.style.display = hasLeaderSig ? 'none' : 'inline-flex';
          if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '💾 Salvar Conciliação';
            saveBtn.style.opacity = '1';
            saveBtn.style.cursor = 'pointer';
          }
        }

        this.existingSignature = storedSigs.signature || null;
        this.existingLeaderSignature = storedSigs.leaderSignature || null;
      }
    } else {
      title.textContent = 'Nova Conciliação';
      this.isRecordLocked = false;

      const oldNotice = container.querySelector('#locked-conciliacao-notice');
      if (oldNotice) oldNotice.remove();

      if (categoryFilter) categoryFilter.disabled = false;
      if (tempFilter) tempFilter.disabled = false;
      if (searchInput) searchInput.disabled = false;
      if (physicalInput) physicalInput.disabled = false;
      if (unitSelect) unitSelect.disabled = false;
      if (locationSelect) locationSelect.disabled = false;

      const respInput = container.querySelector('#field-conciliacao-responsible-name');
      const leaderInput = container.querySelector('#field-conciliacao-leader-name');
      const clearRespBtn = container.querySelector('#clear-conciliacao-sig-btn');
      const clearLeaderBtn = container.querySelector('#clear-conciliacao-leader-sig-btn');
      const saveBtn = container.querySelector('#btn-save-conciliacao');

      if (respInput) { respInput.value = user ? user.name : ''; respInput.disabled = false; }
      if (leaderInput) { leaderInput.value = ''; leaderInput.disabled = false; }
      if (clearRespBtn) clearRespBtn.style.display = 'inline-flex';
      if (clearLeaderBtn) clearLeaderBtn.style.display = 'inline-flex';
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '💾 Salvar Conciliação';
        saveBtn.style.opacity = '1';
        saveBtn.style.cursor = 'pointer';
      }

      this.existingSignature = null;
      this.existingLeaderSignature = null;
    }

    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('modal-overlay--visible'));

    setTimeout(() => {
      this.initFormSignatureDrawing(container);
      if (!this.isRecordLocked) {
        this.clearFormCanvas();
      }
    }, 150);
  },

  getStoredSignatures(item) {
    if (!item) return { hasRealSignature: false };
    let stored = {};
    try {
      const byId = localStorage.getItem('conciliacao_sig_' + item.id);
      const byPlu = localStorage.getItem('conciliacao_sig_plu_' + item.plu);
      if (byId) stored = JSON.parse(byId);
      else if (byPlu) stored = JSON.parse(byPlu);
    } catch(e) {}

    const responsibleName = item.responsibleName || stored.responsibleName || 'Responsável pela Contagem';
    const leaderName = item.leaderName || stored.leaderName || 'Líder / Supervisor';
    
    const signature = item.signature || stored.signature || null;
    const leaderSignature = item.leaderSignature || stored.leaderSignature || null;
    const hasRealSignature = !!(signature && leaderSignature);

    return {
      responsibleName,
      signature,
      leaderName,
      leaderSignature,
      hasRealSignature
    };
  },

  saveStoredSignatures(item, data) {
    if (!item) return;
    try {
      const json = JSON.stringify(data);
      if (item.id) localStorage.setItem('conciliacao_sig_' + item.id, json);
      if (item.plu) localStorage.setItem('conciliacao_sig_plu_' + item.plu, json);
    } catch(e) {}
  },

  getDigitalSignatureSvg(name) {
    if (!name) return '';
    const cleanName = String(name).trim();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="70" viewBox="0 0 280 70">
      <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="'Brush Script MT', 'Dancing Script', cursive, sans-serif" font-size="26" font-style="italic" fill="#0f172a">${cleanName}</text>
      <path d="M 30 52 Q 140 64 250 50" stroke="#1e3a8a" stroke-width="2" fill="none" opacity="0.7"/>
    </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  },

  initFormSignatureDrawing(container) {
    const setupCanvas = (canvasId, clearBtnId, type) => {
      const canvas = container.querySelector(canvasId);
      const clearBtn = container.querySelector(clearBtnId);
      if (!canvas) return;

      canvas.width = canvas.offsetWidth || 460;
      canvas.height = 120;

      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (type === 'resp') {
        this.formCanvasInstance = canvas;
        this.formCtxInstance = ctx;
        this.hasFormSigned = false;
      } else {
        this.leaderCanvasInstance = canvas;
        this.leaderCtxInstance = ctx;
        this.hasLeaderSigned = false;
      }

      if (this.isRecordLocked) {
        canvas.style.pointerEvents = 'none';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const sigSrc = type === 'resp' ? this.existingSignature : this.existingLeaderSignature;
        if (sigSrc) {
          const img = new Image();
          img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          img.src = sigSrc;
        }
        if (clearBtn) clearBtn.style.display = 'none';
        return;
      }

      // Bloquear canvas individual se essa assinatura já existe
      const existingSig = type === 'resp' ? this.existingSignature : this.existingLeaderSignature;
      if (existingSig) {
        canvas.style.pointerEvents = 'none';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        img.src = existingSig;
        if (type === 'resp') this.hasFormSigned = true;
        else this.hasLeaderSigned = true;
        if (clearBtn) clearBtn.style.display = 'none';
        return;
      }

      canvas.style.pointerEvents = 'auto';

      const getMousePos = (canvasEl, evt) => {
        const rect = canvasEl.getBoundingClientRect();
        const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
        const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
        return {
          x: (clientX - rect.left) * (canvasEl.width / rect.width),
          y: (clientY - rect.top) * (canvasEl.height / rect.height)
        };
      };

      let drawing = false;
      let lastPos = { x: 0, y: 0 };

      const startDrawing = (e) => {
        if (e.cancelable) e.preventDefault();
        drawing = true;
        lastPos = getMousePos(canvas, e);
        ctx.beginPath();
        ctx.moveTo(lastPos.x, lastPos.y);
        if (type === 'resp') this.hasFormSigned = true;
        else this.hasLeaderSigned = true;
      };

      const draw = (e) => {
        if (!drawing) return;
        if (e.cancelable) e.preventDefault();
        const currentPos = getMousePos(canvas, e);
        ctx.lineTo(currentPos.x, currentPos.y);
        ctx.stroke();
        lastPos = currentPos;
      };

      const stopDrawing = () => {
        drawing = false;
      };

      canvas.onmousedown = startDrawing;
      canvas.onmousemove = draw;
      canvas.onmouseup = stopDrawing;
      canvas.onmouseleave = stopDrawing;

      canvas.ontouchstart = (e) => startDrawing(e);
      canvas.ontouchmove = (e) => draw(e);
      canvas.ontouchend = stopDrawing;
      canvas.ontouchcancel = stopDrawing;

      if (clearBtn) {
        clearBtn.onclick = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          if (type === 'resp') this.hasFormSigned = false;
          else this.hasLeaderSigned = false;
        };
      }
    };

    setupCanvas('#field-conciliacao-sig-canvas', '#clear-conciliacao-sig-btn', 'resp');
    setupCanvas('#field-conciliacao-leader-sig-canvas', '#clear-conciliacao-leader-sig-btn', 'leader');
  },

  clearFormCanvas() {
    if (this.formCanvasInstance && this.formCtxInstance) {
      this.formCtxInstance.clearRect(0, 0, this.formCanvasInstance.width, this.formCanvasInstance.height);
      this.hasFormSigned = false;
    }
    if (this.leaderCanvasInstance && this.leaderCtxInstance) {
      this.leaderCtxInstance.clearRect(0, 0, this.leaderCanvasInstance.width, this.leaderCanvasInstance.height);
      this.hasLeaderSigned = false;
    }
  },

  closeModal(container) {
    const modal = container.querySelector('#conciliacao-modal');
    if (modal) {
      modal.classList.remove('modal-overlay--visible');
      setTimeout(() => modal.style.display = 'none', 250);
    }
  },

  populateProductDropdown(container, selectedCategory = 'all') {
    // Não é mais necessário pois o produto agora usa autocomplete com busca livre de PLU e Nome.
  },

  async saveConciliacao(container) {
    if (this.isRecordLocked) {
      window.BrigadaUI.showToast('Documento auditado e assinado no cadastro é inalterável.', 'error');
      return;
    }

    const selectProduct = container.querySelector('#field-conciliacao-product');
    const physicalVal = container.querySelector('#field-conciliacao-physical').value;
    const unit = container.querySelector('#field-conciliacao-unit').value;
    const location = container.querySelector('#field-conciliacao-location').value;
    const responsibleNameInput = container.querySelector('#field-conciliacao-responsible-name');
    const responsibleName = responsibleNameInput ? responsibleNameInput.value.trim() : '';
    const leaderNameInput = container.querySelector('#field-conciliacao-leader-name');
    const leaderName = leaderNameInput ? leaderNameInput.value.trim() : '';
    const plu = selectProduct.value;

    if (!plu || physicalVal === '' || !location) {
      window.BrigadaUI.showToast('Preencha todos os campos obrigatórios.', 'error');
      return;
    }

    if (!responsibleName) {
      window.BrigadaUI.showToast('Informe o nome do responsável pela contagem.', 'error');
      return;
    }

    let signature = null;
    if (this.hasFormSigned && this.formCanvasInstance) {
      signature = this.formCanvasInstance.toDataURL('image/png');
    } else if (this.editingId && this.existingSignature) {
      signature = this.existingSignature;
    }

    if (!signature && !this.editingId) {
      window.BrigadaUI.showToast('A assinatura do responsável pela contagem é obrigatória.', 'error');
      return;
    }

    if (!leaderName) {
      window.BrigadaUI.showToast('Informe o nome do líder que acompanhou a contagem.', 'error');
      return;
    }

    let leaderSignature = null;
    if (this.hasLeaderSigned && this.leaderCanvasInstance) {
      leaderSignature = this.leaderCanvasInstance.toDataURL('image/png');
    } else if (this.editingId && this.existingLeaderSignature) {
      leaderSignature = this.existingLeaderSignature;
    }

    if (!leaderSignature && !this.editingId) {
      window.BrigadaUI.showToast('A assinatura do líder é obrigatória.', 'error');
      return;
    }

    const physical = parseFloat(physicalVal);
    const catalogItem = window.BrigadaData.catalog.find(c => c.plu === plu);
    const name = catalogItem ? catalogItem.name : 'PRODUTO';

    // Cria a data final de hoje (exigência do BD)
    const todayStr = new Date().toISOString().split('T')[0];

    const payload = {
      plu,
      name,
      category: 'conciliacao',
      endDate: todayStr,
      startDate: todayStr,
      location,
      unit,
      quantity: physical,
      supplier: 'Inventário Físico',
      responsibleName,
      signature,
      leaderName,
      leaderSignature
    };

    let resProd = null;
    try {
      if (this.editingId) {
        resProd = await window.BrigadaData.updateProduct(this.editingId, payload);
        window.BrigadaUI.showToast('Conciliação atualizada com sucesso!', 'success');
      } else {
        // Verifica se já existe uma conciliação para esse PLU
        const exists = window.BrigadaData.products.find(p => p.category === 'conciliacao' && p.plu === plu);
        if (exists) {
          window.BrigadaUI.showToast(`Já existe uma contagem de conciliação para o PLU ${plu}. Edite a contagem existente.`, 'error');
          return;
        }

        resProd = await window.BrigadaData.addProduct(payload);
        window.BrigadaUI.showToast('Conciliação cadastrada com sucesso!', 'success');
      }

      const recordToStore = resProd || { id: this.editingId, plu };
      this.saveStoredSignatures(recordToStore, {
        responsibleName,
        signature,
        leaderName,
        leaderSignature
      });

      this.closeModal(container);
      this.renderTable(container);
    } catch (err) {
      window.BrigadaUI.showToast(err.message || 'Erro ao salvar a conciliação.', 'error');
    }
  },

  openDeleteModal(container, id) {
    this.deletingId = id;
    const record = window.BrigadaData.products.find(p => p.id === id);
    if (!record) return;

    container.querySelector('#delete-conciliacao-name').textContent = record.name;
    const modal = container.querySelector('#delete-conciliacao-modal');
    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('modal-overlay--visible'));
  },

  closeDeleteModal(container) {
    const modal = container.querySelector('#delete-conciliacao-modal');
    if (modal) {
      modal.classList.remove('modal-overlay--visible');
      setTimeout(() => modal.style.display = 'none', 250);
    }
  },

  async deleteConciliacao(container) {
    if (!this.deletingId) return;
    try {
      await window.BrigadaData.deleteProduct(this.deletingId);
      window.BrigadaUI.showToast('Contagem de conciliação removida!', 'success');
      this.closeDeleteModal(container);
      this.renderTable(container);
    } catch (err) {
      window.BrigadaUI.showToast(err.message || 'Erro ao excluir conciliação.', 'error');
    }
  },

  signatureInitialized: false,
  currentReconciliationItems: null,
  hasSigned1: false,
  hasSigned2: false,

  initSignatureModal() {
    if (this.signatureInitialized) return;

    const modal = document.getElementById('signature-modal-overlay');
    const closeBtn = document.getElementById('close-signature-btn');
    const cancelBtn = document.getElementById('btn-cancel-signature');
    const confirmBtn = document.getElementById('btn-confirm-signature');
    const canvas1 = document.getElementById('sig-canvas-1');
    const canvas2 = document.getElementById('sig-canvas-2');
    const clearBtn1 = document.getElementById('clear-sig-1-btn');
    const clearBtn2 = document.getElementById('clear-sig-2-btn');

    if (!modal || !canvas1 || !canvas2) return;

    // Helper para obter coordenadas do toque/mouse relativas ao canvas
    const getMousePos = (canvas, evt) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
      const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
      return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
      };
    };

    // Helper para registrar eventos de desenho no canvas
    const setupDrawing = (canvas, key) => {
      const ctx = canvas.getContext('2d');
      let drawing = false;
      let lastPos = { x: 0, y: 0 };

      const startDrawing = (e) => {
        if (e.cancelable) e.preventDefault();
        drawing = true;
        lastPos = getMousePos(canvas, e);
        ctx.beginPath();
        ctx.moveTo(lastPos.x, lastPos.y);
        this[key] = true; // Define hasSigned1 ou hasSigned2 como true
      };

      const draw = (e) => {
        if (!drawing) return;
        if (e.cancelable) e.preventDefault();
        const currentPos = getMousePos(canvas, e);
        ctx.lineTo(currentPos.x, currentPos.y);
        ctx.stroke();
        lastPos = currentPos;
      };

      const stopDrawing = () => {
        drawing = false;
      };

      // Eventos de mouse
      canvas.addEventListener('mousedown', startDrawing);
      canvas.addEventListener('mousemove', draw);
      canvas.addEventListener('mouseup', stopDrawing);
      canvas.addEventListener('mouseleave', stopDrawing);

      // Eventos de toque (mobile)
      canvas.addEventListener('touchstart', startDrawing, { passive: false });
      canvas.addEventListener('touchmove', draw, { passive: false });
      canvas.addEventListener('touchend', stopDrawing);
      canvas.addEventListener('touchcancel', stopDrawing);
    };

    setupDrawing(canvas1, 'hasSigned1');
    setupDrawing(canvas2, 'hasSigned2');

    // Botão de limpar
    clearBtn1.addEventListener('click', (e) => {
      e.preventDefault();
      const ctx = canvas1.getContext('2d');
      ctx.clearRect(0, 0, canvas1.width, canvas1.height);
      this.hasSigned1 = false;
    });

    clearBtn2.addEventListener('click', (e) => {
      e.preventDefault();
      const ctx = canvas2.getContext('2d');
      ctx.clearRect(0, 0, canvas2.width, canvas2.height);
      this.hasSigned2 = false;
    });

    // Ações de fechar
    const closeModal = () => {
      modal.classList.remove('modal-overlay--visible');
      setTimeout(() => { modal.style.display = 'none'; }, 200);
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Botão confirmar
    confirmBtn.addEventListener('click', () => {
      if (!this.hasSigned1 || !this.hasSigned2) {
        window.BrigadaUI.showToast('Ambas as assinaturas (Responsável e Liderança) são obrigatórias.', 'error');
        return;
      }

      const select1 = document.getElementById('sig-user-1-input');
      const select2 = document.getElementById('sig-user-2-input');
      const sigImg1 = canvas1.toDataURL('image/png');
      const sigImg2 = canvas2.toDataURL('image/png');
      const name1 = select1.value.trim() || 'Responsável';
      const name2 = select2.value.trim() || 'Liderança';

      closeModal();
      this.generateSignedPDF(this.currentReconciliationItems, name1, sigImg1, name2, sigImg2);
    });

    this.signatureInitialized = true;
  },

  openSignatureModal(items) {
    this.currentReconciliationItems = items;

    // Inicializa os listeners uma única vez
    this.initSignatureModal();

    const modal = document.getElementById('signature-modal-overlay');
    const select1 = document.getElementById('sig-user-1-input');
    const select2 = document.getElementById('sig-user-2-input');
    const datalist = document.getElementById('sig-users-list');
    const canvas1 = document.getElementById('sig-canvas-1');
    const canvas2 = document.getElementById('sig-canvas-2');

    if (!modal || !canvas1 || !canvas2 || !datalist) {
      window.BrigadaUI.showToast('Erro ao carregar o modal de assinaturas.', 'error');
      return;
    }

    // Preenche a lista de sugestões (datalist)
    const users = window.BrigadaData.users && window.BrigadaData.users.length ? window.BrigadaData.users : [
      { name: 'Marcos', role: 'gestao' },
      { name: 'Jefferson', role: 'gestao' },
      { name: 'Administrador', role: 'superadmin' }
    ];

    datalist.innerHTML = users.map(u => `<option value="${u.name}">`).join('');

    // Deixa as caixas para digitar sempre limpas por padrão
    select1.value = '';
    select2.value = '';

    // Reseta flags de validação
    this.hasSigned1 = false;
    this.hasSigned2 = false;

    const clearAndStyleCanvas = (canvas) => {
      // Usamos dimensões lógicas fixas para evitar distorção de aspect-ratio no canvas
      canvas.width = 500;
      canvas.height = 120;
      
      const ctx = canvas.getContext('2d');
      // Mantém fundo transparente para imprimir corretamente no PDF independente de blend-mode
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // O estilo de traçado precisa ser configurado sempre que a largura/altura muda
      ctx.strokeStyle = '#1e3a8a';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };

    // Abre o modal
    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('modal-overlay--visible'));

    // Executa o ajuste dos canvases pós-exibição
    setTimeout(() => {
      clearAndStyleCanvas(canvas1);
      clearAndStyleCanvas(canvas2);
    }, 150);
  },

  printSelected(container) {
    const checkedBoxes = container.querySelectorAll('.select-conciliacao-row:checked');
    if (checkedBoxes.length === 0) {
      window.BrigadaUI.showToast('Selecione pelo menos um item para imprimir.', 'error');
      return;
    }

    const selectedIds = Array.from(checkedBoxes).map(cb => parseInt(cb.value));
    const items = window.BrigadaData.products.filter(p => selectedIds.includes(p.id));

    this.openSignatureModal(items);
  },

  async generateSignedPDF(items, n1, s1, n2, s2) {
    const includeLogs = document.getElementById('include-logs-checkbox')?.checked;
    let allLogs = [];
    if (includeLogs) {
      try {
        const res = await fetch('/api/logs?per_page=100');
        if (res.ok) {
          const data = await res.json();
          allLogs = data.logs || [];
        }
      } catch (e) {
        console.error('Erro ao carregar logs para o PDF:', e);
      }
    }

    let printContent = `
      <div class="print-container">
        <style>
          .print-card {
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #1e293b;
            padding: 24px;
            font-size: 12px;
            background: #ffffff;
            max-width: 420px;
            margin: 0 auto 24px auto;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            page-break-inside: avoid;
          }
          .print-card .header {
            text-align: center;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 2px solid #6366f1;
          }
          .print-card .header h1 {
            font-size: 16px;
            font-weight: 700;
            margin: 0;
            color: #0f172a;
            letter-spacing: -0.025em;
          }
          .print-card .header p {
            font-size: 10px;
            color: #64748b;
            margin: 4px 0 0 0;
          }
          .print-card .item-detail {
            margin-bottom: 12px;
          }
          .print-card .label {
            font-size: 9px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-weight: 600;
            margin-bottom: 2px;
          }
          .print-card .value {
            font-size: 13px;
            font-weight: 500;
            color: #1e293b;
          }
          .print-card .value-large {
            font-size: 20px;
            font-weight: 800;
            color: #6366f1;
          }
          .print-card .footer {
            margin-top: 16px;
            padding-top: 12px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 8px;
            color: #94a3b8;
            letter-spacing: 0.05em;
          }
          @media print {
            .print-card {
              border: 1px solid #cbd5e1;
              box-shadow: none;
            }
          }
        </style>
        ${items.map(item => {
          const sigs = this.getStoredSignatures(item);
          const itemDate = item.startDate ? new Date(item.startDate).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');
          const respName = n1 || sigs.responsibleName;
          const lName = n2 || sigs.leaderName;

          const sigImg = s1 || sigs.signature || this.getDigitalSignatureSvg(respName);
          const lSigImg = s2 || sigs.leaderSignature || this.getDigitalSignatureSvg(lName);

          const productLogs = allLogs.filter(log => {
            if (log.type === 'product_edit') {
              try {
                const pld = typeof log.payload === 'string' ? JSON.parse(log.payload) : log.payload;
                return pld.product_id === item.id || String(pld.plu).trim() === String(item.plu).trim();
              } catch(e) {
                return false;
              }
            }
            return false;
          });

          return `
            <div class="print-card">
              <div class="header">
                <h1>⚖️ CONCILIAÇÃO DE ESTOQUE</h1>
                <p>BRIGADA-IA · Comprovante de Contagem & Auditoria</p>
              </div>
              
              <div class="item-detail">
                <div class="label">Código PLU</div>
                <div class="value-large">${item.plu}</div>
              </div>

              <div class="item-detail">
                <div class="label">Produto</div>
                <div class="value">${item.name}</div>
              </div>

              <div class="item-detail" style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 8px;">
                <div>
                  <div class="label">Estoque Físico Contado</div>
                  <div class="value" style="font-size: 16px; font-weight: 800; color: #0f172a;">${(item.quantity || 0).toFixed(2)} ${item.unit || 'kg'}</div>
                </div>
                <div style="text-align: right;">
                  <div class="label">Localização</div>
                  <div class="value" style="font-weight: 600;">${item.location || '—'}</div>
                </div>
              </div>

              <div class="item-detail">
                <div class="label">Data de Chegada/Contagem</div>
                <div class="value" style="font-size: 12px; color: #475569;">${itemDate}</div>
              </div>

              ${includeLogs && productLogs.length > 0 ? `
                <div class="item-detail" style="margin-top: 12px; border-top: 1px dashed #cbd5e1; padding-top: 8px; text-align: left;">
                  <div class="label" style="font-weight: bold; color: #475569; font-size: 9px; text-transform: uppercase; margin-bottom: 4px;">Histórico de Alterações</div>
                  <div style="font-size: 10px; color: #334155;">
                    ${productLogs.map(log => {
                      let dateStr = log.timestamp;
                      try {
                        const d = new Date(log.timestamp);
                        if (!isNaN(d.getTime())) {
                          dateStr = d.toLocaleDateString('pt-BR');
                        }
                      } catch(e) {}
                      return `<div style="margin-bottom: 4px; line-height: 1.3;">• <strong>${dateStr}</strong>: ${log.details}</div>`;
                    }).join('')}
                  </div>
                </div>
              ` : ''}

              <div class="signatures-row" style="display: flex; gap: 12px; margin-top: 16px; padding-top: 12px; border-top: 1px solid #e2e8f0; justify-content: space-around;">
                <div class="signature-box" style="text-align: center; flex: 1;">
                  <div class="label" style="font-weight: bold; color: #64748b; font-size: 9px; text-transform: uppercase; margin-bottom: 4px;">Responsável Contagem</div>
                  ${sigImg ? `<img src="${sigImg}" class="signature-img" style="max-height: 55px; max-width: 100%; border: 1px solid #e2e8f0; border-radius: 4px; display: inline-block; background: #fff; padding: 2px;" alt="Assinatura Responsável">` : ''}
                  <div class="signature-name" style="font-size: 11px; font-weight: 600; color: #0f172a; margin-top: 4px;">${respName}</div>
                </div>
                <div class="signature-box" style="text-align: center; flex: 1;">
                  <div class="label" style="font-weight: bold; color: #64748b; font-size: 9px; text-transform: uppercase; margin-bottom: 4px;">Assinatura Líder</div>
                  ${lSigImg ? `<img src="${lSigImg}" class="signature-img" style="max-height: 55px; max-width: 100%; border: 1px solid #e2e8f0; border-radius: 4px; display: inline-block; background: #fff; padding: 2px;" alt="Assinatura Líder">` : ''}
                  <div class="signature-name" style="font-size: 11px; font-weight: 600; color: #0f172a; margin-top: 4px;">${lName}</div>
                </div>
              </div>

              <div class="footer">
                BRIGADA-IA v1.0.0 · Comprovante Oficial de Conciliação
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    window.BrigadaUI.printContent(printContent);
    window.BrigadaUI.showToast('Visualização de impressão aberta!', 'success');
  }
};

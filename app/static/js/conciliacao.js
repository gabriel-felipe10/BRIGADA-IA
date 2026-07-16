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
                    <option value="cx">cx</option>
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
        'pereciveis': ['laticinios', 'frios'],
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

      let catalogItems = window.BrigadaData.catalog || [];

      // Filtra pelo setor do usuário
      catalogItems = catalogItems.filter(c => {
        const cat = (c.category || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return allowedCategories.includes(cat);
      });

      // Filtra pela categoria selecionada
      if (selectedCategory !== 'all') {
        catalogItems = catalogItems.filter(c => {
          const cat = (c.category || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const filterCat = selectedCategory.toLowerCase();
          if (filterCat === 'suino') return cat.startsWith('suino') || cat.startsWith('suno');
          return cat === filterCat;
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
        resultsBox.innerHTML = '<div class="autocomplete-item" style="color:var(--text-tertiary); cursor:default;">Nenhum produto encontrado</div>';
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
      if (resultsBox) resultsBox.style.display = 'none';
    });

    // Se o filtro de conservação mudar, limpa a seleção e atualiza os resultados
    tempFilter?.addEventListener('change', () => {
      productSearchInput.value = '';
      hiddenProduct.value = '';
      if (resultsBox) resultsBox.style.display = 'none';
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
      'pereciveis': ['laticinios', 'frios'],
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

    // Filtra pelo setor do usuário baseado no PLU do catálogo
    products = products.filter(p => {
      const catalogItem = window.BrigadaData.catalog.find(c => c.plu.trim() === p.plu.trim());
      if (!catalogItem) return false;
      const cat = (catalogItem.category || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return allowedCategories.includes(cat);
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
            ${showActions ? '<th>Ações</th>' : ''}
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

      return `
        <tr data-id="${p.id}">
          <td style="text-align: center;">
            <input type="checkbox" class="select-conciliacao-row" value="${p.id}" style="cursor:pointer; width:16px; height:16px;">
          </td>
          <td data-label="PLU"><span class="plu-badge">${p.plu}</span></td>
          <td data-label="Produto" class="product-name" onclick="window.BrigadaUI.showProductView('${p.id}')" style="cursor: pointer; text-decoration: underline; color: var(--primary);" title="Ver detalhes">${p.name}</td>
          <td data-label="Físico" style="font-weight: 600; color: var(--text-primary);">${physical.toFixed(2)} ${unit}</td>
          <td data-label="Localização">${p.location || '—'}</td>
          ${showActions ? `
          <td data-label="Ações" class="actions-cell">
            ${canEditThis ? `<button class="btn-icon btn-icon--edit" data-action="edit" data-id="${p.id}" title="Editar">✏️</button>` : ''}
            ${canDeleteThis ? `<button class="btn-icon btn-icon--delete" data-action="delete" data-id="${p.id}" title="Excluir">🗑️</button>` : ''}
          </td>
          ` : ''}
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
      'pereciveis': [
        { value: 'Câmara Resfriada', label: '❄️ Câmara Resfriada' },
        { value: 'Congelado', label: '🥶 Congelado' },
        { value: 'Exposição', label: '🏬 Exposição' }
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
      'pereciveis': [
        { value: 'laticinios', label: '🧀 Laticínios' },
        { value: 'frios', label: '🥓 Frios' }
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
        ...sectorCategories['pereciveis'],
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
      }
    } else {
      title.textContent = 'Nova Conciliação';
      if (categoryFilter) categoryFilter.disabled = false;
      if (tempFilter) tempFilter.disabled = false;
      if (searchInput) searchInput.disabled = false;
    }

    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('modal-overlay--visible'));
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
    const selectProduct = container.querySelector('#field-conciliacao-product');
    const physicalVal = container.querySelector('#field-conciliacao-physical').value;
    const unit = container.querySelector('#field-conciliacao-unit').value;
    const location = container.querySelector('#field-conciliacao-location').value;
    const plu = selectProduct.value;

    if (!plu || physicalVal === '' || !location) {
      window.BrigadaUI.showToast('Preencha todos os campos obrigatórios.', 'error');
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
      supplier: 'Inventário Físico'
    };

    try {
      if (this.editingId) {
        await window.BrigadaData.updateProduct(this.editingId, payload);
        window.BrigadaUI.showToast('Conciliação atualizada com sucesso!', 'success');
      } else {
        // Verifica se já existe uma conciliação para esse PLU
        const exists = window.BrigadaData.products.find(p => p.category === 'conciliacao' && p.plu === plu);
        if (exists) {
          window.BrigadaUI.showToast(`Já existe uma contagem de conciliação para o PLU ${plu}. Edite a contagem existente.`, 'error');
          return;
        }

        await window.BrigadaData.addProduct(payload);
        window.BrigadaUI.showToast('Conciliação cadastrada com sucesso!', 'success');
      }
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

  printSelected(container) {
    const checkedBoxes = container.querySelectorAll('.select-conciliacao-row:checked');
    if (checkedBoxes.length === 0) {
      window.BrigadaUI.showToast('Selecione pelo menos um item para imprimir.', 'error');
      return;
    }

    const selectedIds = Array.from(checkedBoxes).map(cb => parseInt(cb.value));
    const items = window.BrigadaData.products.filter(p => selectedIds.includes(p.id));

    const today = new Date().toLocaleDateString('pt-BR', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    let printContent = `
      <div class="print-container">
        <style>
          .print-container { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 30px; color: #1e293b; background: #ffffff; }
          .print-container .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 15px; }
          .print-container .title { margin: 0; font-size: 1.8rem; color: #1e3a8a; text-transform: uppercase; }
          .print-container .meta { font-size: 0.85rem; color: #64748b; margin-top: 5px; }
          .print-container table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .print-container th, .print-container td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-size: 0.9rem; color: #1e293b; }
          .print-container th { background-color: #f1f5f9; color: #1e293b; font-weight: 600; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.5px; }
          .print-container tr:nth-child(even) td { background-color: #f8fafc; }
          .print-container .footer { margin-top: 50px; display: flex; justify-content: space-between; font-size: 0.85rem; color: #64748b; }
          .print-container .signature-box { border-top: 1px dashed #94a3b8; width: 250px; text-align: center; padding-top: 5px; margin-top: 40px; }
        </style>

        <div class="header">
          <h2 class="title">⚖️ Relatório de Conciliação de Estoque</h2>
          <div class="meta">Gerado em: ${today} · BRIGADA-IA</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>PLU</th>
              <th>Nome do Produto</th>
              <th>Estoque Físico</th>
              <th>Localização</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(p => {
              const physical = p.quantity || 0;
              const unit = p.unit || 'kg';

              return `
                <tr>
                  <td><strong>${p.plu}</strong></td>
                  <td>${p.name}</td>
                  <td>${physical.toFixed(2)} ${unit}</td>
                  <td>${p.location || '—'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="footer">
          <div>
            <p>Total de itens conciliados: <strong>${items.length}</strong></p>
          </div>
          <div style="display: flex; gap: 40px;">
            <div class="signature-box">Responsável Contagem</div>
            <div class="signature-box">Assinatura Gerente</div>
          </div>
        </div>
      </div>
    `;

    window.BrigadaUI.printContent(printContent);
  }
};

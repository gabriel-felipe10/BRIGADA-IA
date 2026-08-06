/**
 * BRIGADA-IA — Tela de Catálogo de Produtos
 */

window.BrigadaCatalog = {
  normalizeCat(c) {
    if (!c) return '';
    let str = c.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    if (str.startsWith('suin')) return 'suino';
    if (str.startsWith('bovin')) return 'bovino';
    if (str.startsWith('pescad')) return 'pescado';
    if (str.startsWith('ave')) return 'aves';
    if (str.startsWith('iogurt')) return 'iogurtes';
    if (str.startsWith('laticin')) return 'laticinios';
    if (str.startsWith('frio')) return 'frios';
    if (str.startsWith('padari')) return 'padaria';
    if (str.startsWith('hortifrut')) return 'hortifruti';
    if (str.startsWith('merceari')) return 'mercearia';
    return str;
  },

  sectorCategoriesMap: {
    'açougue': {
      label: '🥩 Açougue',
      categories: {
        'aves': '🐔 Aves',
        'bovino': '🐮 Bovinos',
        'suino': '🐷 Suínos',
        'pescado': '🐟 Pescados'
      }
    },
    'pereciveis': {
      label: '🧊 Perecíveis',
      categories: {
        'iogurtes': '🍦 Iogurtes',
        'laticinios': '🧀 Laticínios',
        'frios': '🥓 Frios',
        'pereciveis': '📦 Perecíveis Gerais'
      }
    },
    'padaria': {
      label: '🍞 Padaria',
      categories: {
        'padaria': '🍞 Padaria'
      }
    },
    'hortifruti': {
      label: '🥬 Hortifruti',
      categories: {
        'hortifruti': '🥦 Hortifruti'
      }
    },
    'mercearia': {
      label: '🛒 Mercearia',
      categories: {
        'mercearia': '🛒 Mercearia'
      }
    }
  },

  getAllCategories() {
    const all = {};
    Object.values(this.sectorCategoriesMap).forEach(sec => {
      Object.assign(all, sec.categories);
    });
    return all;
  },

  getAllowedCatalog() {
    return window.BrigadaData.catalog || [];
  },

  render(container) {
    const rawCatalog = window.BrigadaData.catalog || [];
    const userSector = window.BrigadaAuth.currentUser?.sector || 'todos';

    // Determina o setor inicial selecionado (se admin ou todos, inicia em todos; caso contrário, no setor do usuário)
    let defaultSector = 'todos';
    if (userSector !== 'todos' && this.sectorCategoriesMap[userSector]) {
      defaultSector = userSector;
    }

    container.innerHTML = `
      <div class="panel-header">
        <div class="panel-header__left">
          <h2 class="panel-title">📖 Catálogo Base de Produtos</h2>
          <p class="panel-subtitle">Consulta geral e busca centralizada de produtos por Setor e Categoria</p>
        </div>
        <span id="catalog-count-badge" class="badge badge--ok" style="padding:0.4rem 0.8rem;font-size:0.8rem;">
          ${rawCatalog.length} produtos
        </span>
      </div>

      ${window.BrigadaAuth.isKiosk() ? `
        <div style="background: var(--primary-dark); color: white; padding: 0.5rem 1rem; border-radius: 8px; margin-bottom: 1rem; text-align: center; font-size: 0.9rem;">
          🔒 <strong>Modo Quiosque:</strong> Acesso restrito apenas para consulta e leitura de produtos.
        </div>
      ` : ''}

      <div class="glass-panel">
        <div style="display: flex; gap: 1rem; margin-bottom: 1rem; align-items: center; flex-wrap: wrap;">
          <div style="display: flex; gap: 0.5rem; align-items: center; min-width: 260px; flex: 1;">
            <input type="text" id="catalog-search" class="form-input" placeholder="Buscar por PLU, Código ou Nome..." style="flex: 1;">
            <button id="btn-scan-catalog" class="btn btn--outline" style="padding: 0.5rem;" title="Escanear Código">📷</button>
          </div>

          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <!-- Select 1: Setor -->
            <select id="catalog-sector-filter" class="form-input" style="min-width: 180px;">
              <option value="todos">🏢 Todos os Setores</option>
              <option value="açougue">🥩 Açougue</option>
              <option value="pereciveis">🧊 Perecíveis</option>
              <option value="padaria">🍞 Padaria</option>
              <option value="hortifruti">🥬 Hortifruti</option>
              <option value="mercearia">🛒 Mercearia</option>
            </select>

            <!-- Select 2: Categoria (dinâmico) -->
            <select id="catalog-category-filter" class="form-input" style="min-width: 200px;">
              <!-- Preenchido via JS -->
            </select>
          </div>

          ${!window.BrigadaAuth.isKiosk() ? `<button id="btn-print-selected" class="btn btn--primary" style="margin-left: auto;">🖨️ Imprimir Selecionados</button>` : ''}
        </div>

        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                ${!window.BrigadaAuth.isKiosk() ? `<th style="width: 50px; text-align: center;"><input type="checkbox" id="catalog-select-all"></th>` : ''}
                <th>PLU</th>
                <th>Nome do Produto</th>
                <th>Categoria</th>
              </tr>
            </thead>
            <tbody id="catalog-table-body">
              <!-- Renderizado via JS -->
            </tbody>
          </table>
        </div>
      </div>
    `;

    const searchInput = document.getElementById('catalog-search');
    const scanBtn = document.getElementById('btn-scan-catalog');
    const sectorSelect = document.getElementById('catalog-sector-filter');
    const categorySelect = document.getElementById('catalog-category-filter');

    // Define setor inicial no select
    sectorSelect.value = defaultSector;

    // Atualiza opções do dropdown de categoria com base no setor escolhido
    const populateCategoryOptions = (selectedSector) => {
      let optionsHTML = '';
      if (selectedSector === 'todos') {
        optionsHTML += '<option value="todos">Todas Categorias</option>';
        const allCats = this.getAllCategories();
        Object.entries(allCats).forEach(([catKey, label]) => {
          optionsHTML += `<option value="${catKey}">${label}</option>`;
        });
      } else if (this.sectorCategoriesMap[selectedSector]) {
        const secInfo = this.sectorCategoriesMap[selectedSector];
        optionsHTML += `<option value="todos">Todas Categorias (${secInfo.label})</option>`;
        Object.entries(secInfo.categories).forEach(([catKey, label]) => {
          optionsHTML += `<option value="${catKey}">${label}</option>`;
        });
      }
      categorySelect.innerHTML = optionsHTML;
    };

    // Preenche categorias iniciais
    populateCategoryOptions(sectorSelect.value);

    // Função de filtragem
    const updateFilter = () => {
      const terms = searchInput.value.toLowerCase().split(/\s+/).filter(t => t.length > 0);
      const chosenSector = sectorSelect.value.toLowerCase();
      const chosenCat = categorySelect.value.toLowerCase();

      const filtered = rawCatalog.filter(p => {
        const normCat = this.normalizeCat(p.category);

        // Filtro por Setor
        let matchSector = true;
        if (chosenSector !== 'todos' && this.sectorCategoriesMap[chosenSector]) {
          const allowedCats = Object.keys(this.sectorCategoriesMap[chosenSector].categories);
          matchSector = allowedCats.includes(normCat);
        }

        // Filtro por Categoria
        let matchCat = true;
        if (chosenCat !== 'todos') {
          matchCat = (normCat === chosenCat);
        }

        // Filtro por Texto (PLU, Nome, Código de barras)
        let matchText = true;
        if (terms.length > 0) {
          const itemName = p.name ? p.name.toLowerCase() : '';
          const itemPlu = p.plu ? p.plu.toLowerCase() : '';
          const itemBarcode = p.barcode ? p.barcode.toLowerCase() : '';
          matchText = terms.every(t => itemPlu.includes(t) || itemName.includes(t) || itemBarcode.includes(t));
        }

        return matchSector && matchCat && matchText;
      });

      // Atualiza badge de contagem
      const countBadge = document.getElementById('catalog-count-badge');
      if (countBadge) {
        countBadge.textContent = `${filtered.length} produtos`;
      }

      this.renderTable(filtered);
    };

    // Eventos
    sectorSelect.addEventListener('change', () => {
      populateCategoryOptions(sectorSelect.value);
      updateFilter();
    });

    categorySelect.addEventListener('change', updateFilter);
    searchInput.addEventListener('input', updateFilter);

    if (scanBtn) {
      scanBtn.addEventListener('click', () => {
        window.BrigadaUI.openScanner((result) => {
          if (result.isScaleCode) {
            searchInput.value = result.plu;
          } else {
            searchInput.value = result.barcode;
          }
          updateFilter();
        });
      });
    }

    // Toggle checkboxes
    document.getElementById('catalog-select-all')?.addEventListener('change', (e) => {
      const checkboxes = document.querySelectorAll('.catalog-row-checkbox');
      checkboxes.forEach(cb => cb.checked = e.target.checked);
    });

    // Impressão de selecionados
    document.getElementById('btn-print-selected')?.addEventListener('click', () => {
      const selectedCheckboxes = document.querySelectorAll('.catalog-row-checkbox:checked');
      if (selectedCheckboxes.length === 0) {
        alert('Selecione ao menos um produto para imprimir.');
        return;
      }
      
      const selectedPlus = Array.from(selectedCheckboxes).map(cb => cb.value);
      const selectedProducts = rawCatalog.filter(p => selectedPlus.includes(p.plu));
      
      let printContent = `
        <div style="font-family: sans-serif; padding: 20px; color: #000; background: #fff;">
          <h2 style="text-align: center; margin-bottom: 20px;">Lista de Produtos Selecionados</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">PLU</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Nome do Produto</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Categoria</th>
              </tr>
            </thead>
            <tbody>
              ${selectedProducts.map(p => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${p.plu || ''}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${p.name || ''}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${p.category || ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      window.BrigadaUI.printContent(printContent);
    });

    // Executa filtro inicial
    updateFilter();
  },

  renderTable(data) {
    const tbody = document.getElementById('catalog-table-body');
    const isKiosk = window.BrigadaAuth.isKiosk();
    
    if (!tbody) return;

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="${isKiosk ? '3' : '4'}" style="text-align: center; padding: 2rem;">Nenhum produto encontrado.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.map(p => {
      let icon = '';
      const safeCat = this.normalizeCat(p.category);
      if (safeCat === 'aves') icon = '🐔 Aves';
      else if (safeCat === 'bovino') icon = '🐮 Bovino';
      else if (safeCat === 'suino') icon = '🐷 Suíno';
      else if (safeCat === 'pescado') icon = '🐟 Pescado';
      else if (safeCat === 'iogurtes') icon = '🍦 Iogurtes';
      else if (safeCat === 'laticinios') icon = '🧀 Laticínios';
      else if (safeCat === 'frios') icon = '🥓 Frios';
      else if (safeCat === 'padaria') icon = '🍞 Padaria';
      else if (safeCat === 'hortifruti') icon = '🥦 Hortifruti';
      else if (safeCat === 'mercearia') icon = '🛒 Mercearia';
      else icon = '📦 ' + (p.category || 'Geral');

      return `
        <tr>
          ${!isKiosk ? `<td style="text-align: center;"><input type="checkbox" class="catalog-row-checkbox" value="${p.plu}"></td>` : ''}
          <td data-label="PLU">
            <span class="plu-badge">${p.plu || '—'}</span>
            ${p.barcode ? `<div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px;">Cód: ${p.barcode}</div>` : ''}
          </td>
          <td data-label="Produto" class="product-name">${p.name || '—'}</td>
          <td data-label="Categoria">
            <span class="cat-pill cat-pill--${p.category || 'default'}">${icon}</span>
          </td>
        </tr>
      `;
    }).join('');
  }
};

/**
 * BRIGADA-IA — Tela de Catálogo de Produtos
 */

window.BrigadaCatalog = {
  render(container) {
    const catalog = window.BrigadaData.catalog || [];

    container.innerHTML = `
      <div class="panel-header">
        <div class="panel-header__left">
          <h2 class="panel-title">📖 Catálogo Base de Produtos</h2>
          <p class="panel-subtitle">Lista de todos os produtos cadastrados no sistema central</p>
        </div>
        <span class="badge badge--ok" style="padding:0.4rem 0.8rem;font-size:0.8rem;">
          ${catalog.length} produtos
        </span>
      </div>

      ${window.BrigadaAuth.isKiosk() ? `
        <div style="background: var(--primary-dark); color: white; padding: 0.5rem 1rem; border-radius: 8px; margin-bottom: 1rem; text-align: center; font-size: 0.9rem;">
          🔒 <strong>Modo Quiosque:</strong> Acesso restrito apenas para consulta e leitura de produtos.
        </div>
      ` : ''}

      <div class="glass-panel">
        <div style="display: flex; gap: 1rem; margin-bottom: 1rem; align-items: center; flex-wrap: wrap;">
          <div style="display: flex; gap: 0.5rem; align-items: center; max-width: 450px; flex: 1;">
            <input type="text" id="catalog-search" class="form-input" placeholder="Buscar por PLU, Código ou Nome..." style="flex: 1;">
            <button id="btn-scan-catalog" class="btn btn--outline" style="padding: 0.5rem;" title="Escanear Código">📷</button>
          </div>
          <select id="catalog-filter" class="form-input" style="max-width: 200px;">
            <option value="todos">Todas Categorias</option>
            <option value="aves">🐔 Aves</option>
            <option value="bovino">🐮 Bovino</option>
            <option value="suino">🐷 Suíno</option>
            <option value="pescado">🐟 Pescado</option>
          </select>
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

    this.renderTable(catalog);

    // Filtros e busca
    const searchInput = document.getElementById('catalog-search');
    const scanBtn = document.getElementById('btn-scan-catalog');
    const filterSelect = document.getElementById('catalog-filter');

    const updateFilter = () => {
      const terms = searchInput.value.toLowerCase().split(/\s+/).filter(t => t.length > 0);
      const cat = filterSelect.value.toLowerCase();
      const normalizeCat = (c) => {
        if (!c) return '';
        let str = c.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (str.startsWith('suino')) return 'suino';
        if (str.startsWith('bovino')) return 'bovino';
        if (str.startsWith('pescado')) return 'pescado';
        return str;
      };

      const filtered = catalog.filter(p => {
        const itemName = p.name ? p.name.toLowerCase() : '';
        const itemPlu = p.plu ? p.plu.toLowerCase() : '';
        const itemBarcode = p.barcode ? p.barcode.toLowerCase() : '';

        let matchText = true;
        if (terms.length > 0) {
          matchText = terms.every(t => itemPlu.includes(t) || itemName.includes(t) || itemBarcode.includes(t));
        }

        let matchCat = true;
        if (cat !== 'todos') {
          matchCat = (normalizeCat(p.category) === cat);
        }

        return matchText && matchCat;
      });

      this.renderTable(filtered);
    };

    searchInput.addEventListener('input', updateFilter);
    filterSelect.addEventListener('change', updateFilter);
    
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

    // Toggle all checkboxes
    document.getElementById('catalog-select-all')?.addEventListener('change', (e) => {
      const checkboxes = document.querySelectorAll('.catalog-row-checkbox');
      checkboxes.forEach(cb => cb.checked = e.target.checked);
    });

    // Print selected function
    document.getElementById('btn-print-selected')?.addEventListener('click', () => {
      const selectedCheckboxes = document.querySelectorAll('.catalog-row-checkbox:checked');
      if (selectedCheckboxes.length === 0) {
        alert('Selecione ao menos um produto para imprimir.');
        return;
      }
      
      const selectedPlus = Array.from(selectedCheckboxes).map(cb => cb.value);
      const selectedProducts = catalog.filter(p => selectedPlus.includes(p.plu));
      
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
      const normalizeCat = (c) => {
        if (!c) return '';
        let str = c.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (str.startsWith('suino')) return 'suino';
        if (str.startsWith('bovino')) return 'bovino';
        if (str.startsWith('pescado')) return 'pescado';
        return str;
      };
      const safeCat = normalizeCat(p.category);
      if (safeCat === 'aves') icon = '🐔 Aves';
      else if (safeCat === 'bovino') icon = '🐮 Bovino';
      else if (safeCat === 'suino') icon = '🐷 Suíno';
      else if (safeCat === 'pescado') icon = '🐟 Pescado';
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

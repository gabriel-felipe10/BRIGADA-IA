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
    if (str.startsWith('pereciv')) return 'pereciveis';
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
    const rawCatalog = window.BrigadaData.catalog || [];
    const isSuperAdmin = window.BrigadaAuth.isSuperAdmin() || window.BrigadaAuth.currentUser?.sector === 'todos';
    const userSector = window.BrigadaAuth.currentUser?.sector || 'todos';

    // Se o usuário pertence a um setor específico e não é SuperAdmin, filtra rigorosamente pelo seu setor
    if (!isSuperAdmin && userSector !== 'todos' && this.sectorCategoriesMap[userSector]) {
      const allowedCats = Object.keys(this.sectorCategoriesMap[userSector].categories);
      return rawCatalog.filter(p => allowedCats.includes(this.normalizeCat(p.category)));
    }
    return rawCatalog;
  },

  render(container) {
    const isSuperAdmin = window.BrigadaAuth.isSuperAdmin() || window.BrigadaAuth.currentUser?.sector === 'todos';
    const userSector = window.BrigadaAuth.currentUser?.sector || 'todos';
    const rawCatalog = window.BrigadaData.catalog || [];
    const catalog = this.getAllowedCatalog();

    // Determina as opções de setor visíveis no dropdown
    let sectorOptionsHTML = '';
    if (!isSuperAdmin && userSector !== 'todos' && this.sectorCategoriesMap[userSector]) {
      const secInfo = this.sectorCategoriesMap[userSector];
      sectorOptionsHTML = `<option value="${userSector}">${secInfo.label}</option>`;
    } else {
      sectorOptionsHTML = `
        <option value="todos">🏢 Todos os Setores</option>
        <option value="açougue">🥩 Açougue</option>
        <option value="pereciveis">🧊 Perecíveis</option>
      `;
    }

    let defaultSector = 'todos';
    if (!isSuperAdmin && userSector !== 'todos' && this.sectorCategoriesMap[userSector]) {
      defaultSector = userSector;
    }

    container.innerHTML = `
      <div class="panel-header">
        <div class="panel-header__left">
          <h2 class="panel-title">📖 Catálogo Base de Produtos</h2>
          <p class="panel-subtitle">Consulta geral e busca de produtos por Setor e Categoria (${!isSuperAdmin && userSector !== 'todos' ? userSector.toUpperCase() : 'TODOS OS SETORES'})</p>
        </div>
        <span id="catalog-count-badge" class="badge badge--ok" style="padding:0.4rem 0.8rem;font-size:0.8rem;">
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
          <div style="display: flex; gap: 0.5rem; align-items: center; min-width: 260px; flex: 1;">
            <input type="text" id="catalog-search" class="form-input" placeholder="Buscar por PLU, Código ou Nome..." style="flex: 1;">
            <button id="btn-scan-catalog" class="btn btn--outline" style="padding: 0.5rem;" title="Escanear Código">📷</button>
          </div>

          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <!-- Select 1: Setor -->
            <select id="catalog-sector-filter" class="form-input" style="min-width: 180px;">
              ${sectorOptionsHTML}
            </select>

            <!-- Select 2: Categoria (dinâmico) -->
            <select id="catalog-category-filter" class="form-input" style="min-width: 200px;">
              <!-- Preenchido via JS -->
            </select>
          </div>

          ${!window.BrigadaAuth.isKiosk() ? `
            <div style="display: flex; gap: 8px; margin-left: auto;">
              <button id="btn-print-selected" class="btn btn--secondary">🖨️ Imprimir Selecionados</button>
              <button id="btn-share-selected" class="btn btn--primary" style="background: rgba(16, 185, 129, 0.2); border-color: rgba(16, 185, 129, 0.5); color: #34d399;">📲 Compartilhar PDF</button>
            </div>
          ` : ''}
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
    if (!isSuperAdmin && userSector !== 'todos' && this.sectorCategoriesMap[userSector]) {
      sectorSelect.disabled = true; // Trava o setor para usuários não-admin
    }

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

      // Base da lista respeita rigorosamente a permissão do setor do usuário
      const baseCatalog = this.getAllowedCatalog();

      const filtered = baseCatalog.filter(p => {
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

    const generateCatalogPDF = (selectedProducts) => {
      if (!window.jspdf || !window.jspdf.jsPDF) return null;
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const nowStr = new Date().toLocaleDateString('pt-BR');

      doc.setFillColor(99, 102, 241);
      doc.rect(0, 0, 210, 20, 'F');
      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('BRIGADA-IA — Catálogo de Produtos', 14, 13);

      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.text(`Data: ${nowStr} | Total: ${selectedProducts.length} itens`, 14, 28);

      doc.autoTable({
        startY: 32,
        head: [['PLU', 'Nome do Produto', 'Categoria']],
        body: selectedProducts.map(p => [
          p.plu || '—',
          p.name || '—',
          p.category || '—'
        ]),
        theme: 'grid',
        headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
        bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 14, right: 14 },
        styles: { cellPadding: 2.5 }
      });

      return doc;
    };

    // Impressão de selecionados
    document.getElementById('btn-print-selected')?.addEventListener('click', () => {
      const selectedCheckboxes = document.querySelectorAll('.catalog-row-checkbox:checked');
      if (selectedCheckboxes.length === 0) {
        alert('Selecione ao menos um produto para imprimir.');
        return;
      }
      
      const selectedPlus = Array.from(selectedCheckboxes).map(cb => cb.value);
      const selectedProducts = rawCatalog.filter(p => selectedPlus.includes(p.plu));
      const doc = generateCatalogPDF(selectedProducts);
      if (doc) {
        doc.autoPrint();
        window.open(doc.output('bloburl'), '_blank');
      }
    });

    // Compartilhamento de selecionados
    document.getElementById('btn-share-selected')?.addEventListener('click', () => {
      const selectedCheckboxes = document.querySelectorAll('.catalog-row-checkbox:checked');
      if (selectedCheckboxes.length === 0) {
        alert('Selecione ao menos um produto para compartilhar.');
        return;
      }
      
      const selectedPlus = Array.from(selectedCheckboxes).map(cb => cb.value);
      const selectedProducts = rawCatalog.filter(p => selectedPlus.includes(p.plu));
      const doc = generateCatalogPDF(selectedProducts);
      if (doc) {
        window.BrigadaUI.shareDocPDF(doc, `catalogo_produtos_${selectedProducts.length}.pdf`, 'Catálogo de Produtos');
      }
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
      else if (safeCat === 'pereciveis') icon = '🥗 Perecíveis';
      else icon = '📦 ' + (p.category || 'Geral');

      return `
        <tr>
          ${!isKiosk ? `<td style="text-align: center;"><input type="checkbox" class="catalog-row-checkbox" value="${p.plu}"></td>` : ''}
          <td data-label="PLU">
            <span class="plu-badge">${p.plu || '—'}</span>
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

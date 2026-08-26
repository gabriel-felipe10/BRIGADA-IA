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
        <div style="display: flex; gap: 10px; align-items: center;">
          ${!window.BrigadaAuth.isKiosk() ? `
            <button id="btn-open-new-plu-modal" class="btn btn--primary" style="font-weight: 700; display: flex; align-items: center; gap: 6px; padding: 0.5rem 1.1rem; background: #38bdf8; border-color: #38bdf8; color: #0f172a; cursor: pointer; box-shadow: 0 2px 8px rgba(56, 189, 248, 0.25);">
              <span>➕ Cadastrar Novo PLU</span>
            </button>
          ` : ''}
          <span id="catalog-count-badge" class="badge badge--ok" style="padding:0.4rem 0.8rem;font-size:0.8rem;">
            ${catalog.length} produtos
          </span>
        </div>
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
            <div style="display: flex; gap: 8px; margin-left: auto; align-items: center;">
              <button id="btn-print-selected" class="btn" style="background: rgba(99, 102, 241, 0.18); border: 1px solid rgba(99, 102, 241, 0.45); color: #c7d2fe; font-weight: 600; padding: 0.45rem 1rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                <span>🖨️ Imprimir Selecionados</span>
              </button>
              <button id="btn-share-selected" class="btn" style="background: rgba(16, 185, 129, 0.18); border: 1px solid rgba(16, 185, 129, 0.45); color: #34d399; font-weight: 600; padding: 0.45rem 1rem; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                <span>📲 Compartilhar PDF</span>
              </button>
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
    const btnNewPlu = document.getElementById('btn-open-new-plu-modal');

    if (btnNewPlu) {
      btnNewPlu.addEventListener('click', () => {
        const rawTerm = searchInput?.value?.trim() || '';
        const isNum = /^\d+$/.test(rawTerm);
        this.openNewPluModal({
          plu: isNum ? rawTerm : '',
          name: isNum ? '' : rawTerm
        }, (created) => {
          if (searchInput) searchInput.value = created.plu;
          updateFilter();
        });
      });
    }

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
      const rawSearch = searchInput.value.trim();
      const terms = rawSearch.toLowerCase().split(/\s+/).filter(t => t.length > 0);
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
          const itemPlu = p.plu ? String(p.plu).toLowerCase() : '';
          const itemBarcode = p.barcode ? String(p.barcode).toLowerCase() : '';
          matchText = terms.every(t => itemPlu.includes(t) || itemName.includes(t) || itemBarcode.includes(t));
        }

        return matchSector && matchCat && matchText;
      });

      // Atualiza badge de contagem
      const countBadge = document.getElementById('catalog-count-badge');
      if (countBadge) {
        countBadge.textContent = `${filtered.length} produtos`;
      }

      this.renderTable(filtered, rawSearch, () => updateFilter());
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

  renderTable(data, searchTerm = '', onRefresh = null) {
    const tbody = document.getElementById('catalog-table-body');
    const isKiosk = window.BrigadaAuth.isKiosk();
    
    if (!tbody) return;

    if (data.length === 0) {
      if (searchTerm && !isKiosk) {
        const isNum = /^\d+$/.test(searchTerm);
        tbody.innerHTML = `
          <tr>
            <td colspan="4" style="text-align: center; padding: 2.5rem 1rem;">
              <div style="max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 12px;">
                <div style="font-size: 2.4rem;">🔍</div>
                <div style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary);">
                  Nenhum produto encontrado para "${searchTerm}"
                </div>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">
                  Este produto ou PLU ainda não está cadastrado no catálogo do sistema.
                </p>
                <button type="button" class="btn btn--primary" id="btn-empty-register-plu" style="margin-top: 6px; font-weight: 700; display: flex; align-items: center; gap: 8px; padding: 8px 18px; background: #38bdf8; border-color: #38bdf8; color: #0f172a; cursor: pointer; border-radius: 8px;">
                  <span>➕ Cadastrar "${searchTerm}" no Catálogo</span>
                </button>
              </div>
            </td>
          </tr>
        `;

        const btnEmpty = document.getElementById('btn-empty-register-plu');
        if (btnEmpty) {
          btnEmpty.addEventListener('click', () => {
            this.openNewPluModal({
              plu: isNum ? searchTerm : '',
              name: isNum ? '' : searchTerm
            }, () => {
              if (typeof onRefresh === 'function') onRefresh();
            });
          });
        }
      } else {
        tbody.innerHTML = `<tr><td colspan="${isKiosk ? '3' : '4'}" style="text-align: center; padding: 2rem; color: var(--text-secondary);">Nenhum produto encontrado.</td></tr>`;
      }
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
  },

  /**
   * Modal Global para Cadastrar Novo PLU no Catálogo
   */
  openNewPluModal(prefill = {}, onSuccess = null) {
    const userSector = window.BrigadaAuth.currentUser?.sector || 'todos';
    const isSuperAdmin = window.BrigadaAuth.isSuperAdmin() || userSector === 'todos';

    const allCategories = [
      { val: 'aves', label: '🐔 Aves (Açougue)', sector: 'açougue' },
      { val: 'bovino', label: '🐮 Bovinos (Açougue)', sector: 'açougue' },
      { val: 'suino', label: '🐷 Suínos (Açougue)', sector: 'açougue' },
      { val: 'pescado', label: '🐟 Pescados (Açougue)', sector: 'açougue' },
      { val: 'frios', label: '🥓 Frios & Embutidos', sector: 'pereciveis' },
      { val: 'laticinios', label: '🧀 Laticínios & Queijos', sector: 'pereciveis' },
      { val: 'iogurtes', label: '🍦 Iogurtes & Sobremesas', sector: 'pereciveis' },
      { val: 'pereciveis', label: '📦 Perecíveis Gerais', sector: 'pereciveis' }
    ];

    const allowedCategories = isSuperAdmin 
      ? allCategories 
      : allCategories.filter(c => c.sector === userSector);

    const defaultCat = prefill.category || (allowedCategories[0]?.val || 'aves');

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay modal-overlay--visible';
    overlay.id = 'modal-add-new-plu';
    overlay.style.zIndex = '100200';

    overlay.innerHTML = `
      <div class="modal" style="max-width: 520px; width: 92%; transform: translateY(0); margin-top: 5vh; border: 1px solid rgba(56, 189, 248, 0.3);">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding: 1.1rem 1.4rem;">
          <div>
            <h3 class="modal-title" style="margin: 0; display: flex; align-items: center; gap: 8px; font-size: 1.15rem;">
              <span>➕ Cadastrar Novo PLU no Catálogo</span>
            </h3>
            <p style="margin: 3px 0 0 0; font-size: 0.8rem; color: var(--text-secondary);">
              Este produto será sincronizado e ficará disponível em todo o sistema.
            </p>
          </div>
          <button class="modal-close" id="btn-close-new-plu-modal" style="background:none; border:none; color:var(--text-secondary); cursor:pointer; font-size:1.2rem;">✕</button>
        </div>

        <div class="modal-body" style="padding: 1.25rem 1.4rem;">
          <form id="form-add-new-plu" style="display: flex; flex-direction: column; gap: 14px;">
            
            <div class="form-group">
              <label style="display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">
                Código PLU / EAN <span style="color: #ef4444;">*</span>
              </label>
              <input type="text" id="new-plu-code" class="form-input" value="${prefill.plu || ''}" placeholder="Ex: 52629 ou código de balança..." required autocomplete="off" style="width: 100%; padding: 9px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-tertiary); font-family: monospace; font-weight: 700; color: #38bdf8; font-size: 1.05rem;" />
            </div>

            <div class="form-group">
              <label style="display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">
                Nome Completo do Produto <span style="color: #ef4444;">*</span>
              </label>
              <input type="text" id="new-plu-name" class="form-input" value="${prefill.name || ''}" placeholder="Ex: ASA DE FGO FORMOSO CONG KG" required autocomplete="off" style="width: 100%; padding: 9px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-tertiary); text-transform: uppercase;" />
            </div>

            <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 12px;">
              <div class="form-group">
                <label style="display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">
                  Categoria / Setor <span style="color: #ef4444;">*</span>
                </label>
                <select id="new-plu-category" class="form-input" style="width: 100%; padding: 9px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-tertiary); font-weight: 600;">
                  ${allowedCategories.map(c => `<option value="${c.val}" ${c.val === defaultCat ? 'selected' : ''}>${c.label}</option>`).join('')}
                </select>
              </div>

              <div class="form-group">
                <label style="display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">
                  Unidade Padrão <span style="color: #ef4444;">*</span>
                </label>
                <select id="new-plu-unit" class="form-input" style="width: 100%; padding: 9px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-tertiary);">
                  <option value="kg" selected>kg (Quilo)</option>
                  <option value="un">un (Unidade)</option>
                  <option value="cx">cx (Caixa)</option>
                  <option value="pct">pct (Pacote)</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label style="display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px;">
                Código de Barras EAN-13 (Opcional)
              </label>
              <input type="text" id="new-plu-barcode" class="form-input" value="${prefill.barcode || ''}" placeholder="Ex: 7891234567890" autocomplete="off" style="width: 100%; padding: 9px 12px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-tertiary); font-family: monospace;" />
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; border-top: 1px solid var(--border-color); padding-top: 14px;">
              <button type="button" class="btn btn--outline" id="btn-cancel-new-plu" style="padding: 8px 16px;">
                Cancelar
              </button>
              <button type="submit" class="btn btn--primary" id="btn-submit-new-plu" style="padding: 8px 22px; font-weight: 700; background: #38bdf8; border-color: #38bdf8; color: #0f172a; cursor: pointer;">
                ✓ Cadastrar e Sincronizar
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    overlay.querySelector('#btn-close-new-plu-modal').addEventListener('click', close);
    overlay.querySelector('#btn-cancel-new-plu').addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target.id === 'modal-add-new-plu') close();
    });

    const form = overlay.querySelector('#form-add-new-plu');
    const pluInput = overlay.querySelector('#new-plu-code');
    const nameInput = overlay.querySelector('#new-plu-name');
    const catSelect = overlay.querySelector('#new-plu-category');
    const unitSelect = overlay.querySelector('#new-plu-unit');
    const barInput = overlay.querySelector('#new-plu-barcode');
    const submitBtn = overlay.querySelector('#btn-submit-new-plu');

    if (!prefill.plu) {
      pluInput.focus();
    } else {
      nameInput.focus();
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const pluVal = pluInput.value.trim();
      const nameVal = nameInput.value.trim().toUpperCase();
      const catVal = catSelect.value;
      const unitVal = unitSelect.value;
      const barVal = barInput.value.trim();

      if (!pluVal || !nameVal) {
        window.BrigadaUI.showToast('Preencha o PLU e o Nome do produto.', 'warning');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Salvando no Catálogo...';

      try {
        const saved = await window.BrigadaData.createCatalogProduct({
          plu: pluVal,
          name: nameVal,
          category: catVal,
          unit: unitVal,
          barcode: barVal || null
        });

        window.BrigadaUI.showToast(`✨ PLU ${pluVal} - ${nameVal} cadastrado e sincronizado com sucesso!`, 'success');
        close();

        if (typeof onSuccess === 'function') {
          onSuccess(saved);
        }
      } catch (err) {
        console.error(err);
        submitBtn.disabled = false;
        submitBtn.textContent = '✓ Cadastrar e Sincronizar';
        window.BrigadaUI.showToast('Erro ao cadastrar PLU: ' + err.message, 'error');
      }
    });
  }
};

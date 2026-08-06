/**
 * BRIGADA-IA — Master PLU Registry (Lista de Balança)
 * Allows managing the official database of product PLUs (scale codes).
 * Seseeded from mock data, supports CSV import, manual registration, and search.
 */

window.BrigadaProductList = {
  registry: [],
  searchQuery: '',

  // Load from localStorage or seed from local database
  load() {
    const stored = localStorage.getItem('master-plu-registry');
    let currentList = [];
    if (stored) {
      currentList = JSON.parse(stored);
    }
    
    // Seed and sync from products in data.js
    const seed = window.BrigadaData.products || [];
    const mapByPlu = new Map(currentList.map(item => [item.plu, item]));
    
    let updated = false;
    seed.forEach(p => {
      if (mapByPlu.has(p.plu)) {
        const item = mapByPlu.get(p.plu);
        if (item.category !== p.category) {
          item.category = p.category;
          updated = true;
        }
      } else {
        const newItem = { plu: p.plu, name: p.name, category: p.category };
        currentList.push(newItem);
        mapByPlu.set(p.plu, newItem);
        updated = true;
      }
    });

    this.registry = currentList;
    if (!stored || updated) {
      this.save();
    }
  },

  save() {
    localStorage.setItem('master-plu-registry', JSON.stringify(this.registry));
  },

  render(container) {
    this.load();
    const canManage = window.BrigadaAuth.canAddProduct();
    
    container.innerHTML = `
      <div class="panel-header">
        <div class="panel-header__left">
          <h2 class="panel-title">📋 Lista</h2>
          <p class="panel-subtitle">Dicionário e cadastro de códigos PLU oficiais do açougue</p>
        </div>
        <div class="glass-actions-card" style="display:flex; gap:var(--sp-sm); flex-wrap:wrap; align-items:center;">
          ${canManage ? `
          <button class="btn btn--primary" id="btn-import-plu-csv" title="Importar PLUs via CSV">
            <span>📥</span> Importar CSV
          </button>
          <button class="btn btn--primary" id="btn-add-plu" title="Cadastrar código PLU individual">
            <span>＋</span> Novo Cadastro
          </button>
          <button class="btn btn--danger" id="btn-clear-plu" title="Limpar todos os cadastros">
            <span>🗑️</span> Limpar Tudo
          </button>
          ` : ''}
        </div>
      </div>

      <!-- Hidden file input for CSV import -->
      <input type="file" id="import-plu-file-input" accept=".csv" style="display:none;">

      <div class="glass-panel" style="padding: 1.5rem; margin-top: 1rem;">
        <!-- Real-time search bar -->
        <div class="toolbar" style="margin-bottom: 1.5rem;">
          <div class="search-box" style="flex: 1; max-width: 100%;">
            <span class="search-icon">🔍</span>
            <input type="text" id="search-plu-registry" class="search-input" placeholder="Buscar por nome, PLU ou código de balança..." value="${this.searchQuery}">
          </div>
        </div>

        <!-- Categorized registry grid -->
        <div class="registry-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
          
          <!-- AVES -->
          <div class="category-list-card glass-panel" style="padding: 1.25rem; background: rgba(255,255,255,0.02);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid var(--glass-border); padding-bottom:0.5rem;">
              <h3 style="font-size:1rem; font-weight:700; color:var(--text-primary);">🐔 Aves</h3>
              <span class="badge" id="badge-aves" style="background:rgba(59,130,246,0.15); color:#3b82f6; border-radius:10px; padding:2px 8px; font-size:0.75rem; font-weight:700;">0</span>
            </div>
            <div class="plu-items-list" id="list-aves" style="display:flex; flex-direction:column; gap:0.75rem; max-height:400px; overflow-y:auto; padding-right:4px;">
            </div>
          </div>

          <!-- SUÍNO -->
          <div class="category-list-card glass-panel" style="padding: 1.25rem; background: rgba(255,255,255,0.02);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid var(--glass-border); padding-bottom:0.5rem;">
              <h3 style="font-size:1rem; font-weight:700; color:var(--text-primary);">🐷 Suíno</h3>
              <span class="badge" id="badge-suino" style="background:rgba(236,72,153,0.15); color:#ec4899; border-radius:10px; padding:2px 8px; font-size:0.75rem; font-weight:700;">0</span>
            </div>
            <div class="plu-items-list" id="list-suino" style="display:flex; flex-direction:column; gap:0.75rem; max-height:400px; overflow-y:auto; padding-right:4px;">
            </div>
          </div>

          <!-- BOVINO -->
          <div class="category-list-card glass-panel" style="padding: 1.25rem; background: rgba(255,255,255,0.02);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid var(--glass-border); padding-bottom:0.5rem;">
              <h3 style="font-size:1rem; font-weight:700; color:var(--text-primary);">🐮 Bovino</h3>
              <span class="badge" id="badge-bovino" style="background:rgba(168,85,247,0.15); color:#a855f7; border-radius:10px; padding:2px 8px; font-size:0.75rem; font-weight:700;">0</span>
            </div>
            <div class="plu-items-list" id="list-bovino" style="display:flex; flex-direction:column; gap:0.75rem; max-height:400px; overflow-y:auto; padding-right:4px;">
            </div>
          </div>

          <!-- PESCADO -->
          <div class="category-list-card glass-panel" style="padding: 1.25rem; background: rgba(255,255,255,0.02);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid var(--glass-border); padding-bottom:0.5rem;">
              <h3 style="font-size:1rem; font-weight:700; color:var(--text-primary);">🐟 Pescados</h3>
              <span class="badge" id="badge-pescado" style="background:rgba(16,185,129,0.15); color:#10b981; border-radius:10px; padding:2px 8px; font-size:0.75rem; font-weight:700;">0</span>
            </div>
            <div class="plu-items-list" id="list-pescado" style="display:flex; flex-direction:column; gap:0.75rem; max-height:400px; overflow-y:auto; padding-right:4px;">
            </div>
          </div>

          <!-- IOGURTES -->
          <div class="category-list-card glass-panel" style="padding: 1.25rem; background: rgba(255,255,255,0.02);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid var(--glass-border); padding-bottom:0.5rem;">
              <h3 style="font-size:1rem; font-weight:700; color:var(--text-primary);">🍦 Iogurtes</h3>
              <span class="badge" id="badge-iogurtes" style="background:rgba(99,102,241,0.15); color:#6366f1; border-radius:10px; padding:2px 8px; font-size:0.75rem; font-weight:700;">0</span>
            </div>
            <div class="plu-items-list" id="list-iogurtes" style="display:flex; flex-direction:column; gap:0.75rem; max-height:400px; overflow-y:auto; padding-right:4px;">
            </div>
          </div>

          <!-- LATICÍNIOS -->
          <div class="category-list-card glass-panel" style="padding: 1.25rem; background: rgba(255,255,255,0.02);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid var(--glass-border); padding-bottom:0.5rem;">
              <h3 style="font-size:1rem; font-weight:700; color:var(--text-primary);">🧀 Laticínios</h3>
              <span class="badge" id="badge-laticinios" style="background:rgba(245,158,11,0.15); color:#f59e0b; border-radius:10px; padding:2px 8px; font-size:0.75rem; font-weight:700;">0</span>
            </div>
            <div class="plu-items-list" id="list-laticinios" style="display:flex; flex-direction:column; gap:0.75rem; max-height:400px; overflow-y:auto; padding-right:4px;">
            </div>
          </div>

          <!-- FRIOS -->
          <div class="category-list-card glass-panel" style="padding: 1.25rem; background: rgba(255,255,255,0.02);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid var(--glass-border); padding-bottom:0.5rem;">
              <h3 style="font-size:1rem; font-weight:700; color:var(--text-primary);">🥓 Frios</h3>
              <span class="badge" id="badge-frios" style="background:rgba(239,68,68,0.15); color:#ef4444; border-radius:10px; padding:2px 8px; font-size:0.75rem; font-weight:700;">0</span>
            </div>
            <div class="plu-items-list" id="list-frios" style="display:flex; flex-direction:column; gap:0.75rem; max-height:400px; overflow-y:auto; padding-right:4px;">
            </div>
          </div>

        </div>
      </div>

      <!-- Add/Edit PLU Registry Modal -->
      <div class="modal-overlay" id="plu-modal" style="display:none; z-index: 2000;">
        <div class="modal modal--sm">
          <div class="modal-header">
            <h3 class="modal-title" id="plu-modal-title">Novo Código de Balança</h3>
            <button class="modal-close" id="plu-modal-close">✕</button>
          </div>
          <div class="modal-body">
            <form id="plu-form">
              <input type="hidden" id="plu-field-old-key">
              <div class="form-group" style="margin-bottom:1rem;">
                <label class="form-label">Código PLU (Balança) *</label>
                <input type="text" id="plu-field-code" class="form-input" placeholder="ex: 20777" required>
              </div>
              <div class="form-group" style="margin-bottom:1rem;">
                <label class="form-label">Nome do Produto *</label>
                <input type="text" id="plu-field-name" class="form-input" placeholder="ex: Maminha Bov Resf" required>
              </div>
              <div class="form-group" style="margin-bottom:1rem;">
                <label class="form-label">Categoria *</label>
                  <select id="plu-field-category" class="form-input" required>
                    <option value="">Selecione...</option>
                    <option value="aves">🐔 Aves</option>
                    <option value="suino">🐷 Suíno</option>
                    <option value="bovino">🐮 Bovino</option>
                    <option value="pescado">🐟 Pescados</option>
                    <option value="laticinios">🧀 Laticínios</option>
                    <option value="frios">🥓 Frios</option>
                  </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn--ghost" id="plu-btn-cancel">Cancelar</button>
            <button class="btn btn--primary" id="plu-btn-save">Salvar Cadastro</button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
    this.updateList(container);
  },

  updateList(container) {
    const canManage = window.BrigadaAuth.canAddProduct();
    const q = this.searchQuery.toLowerCase().trim();

    const filtered = this.registry.filter(item => {
      if (!q) return true;
      return item.name.toLowerCase().includes(q) || item.plu.toLowerCase().includes(q);
    });

    const grouped = {
      aves: filtered.filter(item => item.category === 'aves').sort((a, b) => a.name.localeCompare(b.name)),
      suino: filtered.filter(item => item.category === 'suino').sort((a, b) => a.name.localeCompare(b.name)),
      bovino: filtered.filter(item => item.category === 'bovino').sort((a, b) => a.name.localeCompare(b.name)),
      pescado: filtered.filter(item => item.category === 'pescado').sort((a, b) => a.name.localeCompare(b.name)),
      iogurtes: filtered.filter(item => item.category === 'iogurtes').sort((a, b) => a.name.localeCompare(b.name)),
      laticinios: filtered.filter(item => item.category === 'laticinios').sort((a, b) => a.name.localeCompare(b.name)),
      frios: filtered.filter(item => item.category === 'frios').sort((a, b) => a.name.localeCompare(b.name))
    };

    // Update badges
    const badgeAves = container.querySelector('#badge-aves');
    const badgeSuino = container.querySelector('#badge-suino');
    const badgeBovino = container.querySelector('#badge-bovino');
    const badgePescado = container.querySelector('#badge-pescado');
    const badgeIogurtes = container.querySelector('#badge-iogurtes');
    const badgeLaticinios = container.querySelector('#badge-laticinios');
    const badgeFrios = container.querySelector('#badge-frios');

    if (badgeAves) badgeAves.textContent = grouped.aves.length;
    if (badgeSuino) badgeSuino.textContent = grouped.suino.length;
    if (badgeBovino) badgeBovino.textContent = grouped.bovino.length;
    if (badgePescado) badgePescado.textContent = grouped.pescado.length;
    if (badgeIogurtes) badgeIogurtes.textContent = grouped.iogurtes.length;
    if (badgeLaticinios) badgeLaticinios.textContent = grouped.laticinios.length;
    if (badgeFrios) badgeFrios.textContent = grouped.frios.length;

    // Update HTML lists
    const listAves = container.querySelector('#list-aves');
    const listSuino = container.querySelector('#list-suino');
    const listBovino = container.querySelector('#list-bovino');
    const listPescado = container.querySelector('#list-pescado');
    const listIogurtes = container.querySelector('#list-iogurtes');
    const listLaticinios = container.querySelector('#list-laticinios');
    const listFrios = container.querySelector('#list-frios');

    if (listAves) {
      listAves.innerHTML = grouped.aves.length === 0 ? '<p style="font-size:0.8rem; color:var(--text-tertiary); text-align:center; padding:1rem 0;">Nenhum produto cadastrado</p>' : 
        grouped.aves.map(item => this.renderPLURowHTML(item, canManage)).join('');
    }
    if (listSuino) {
      listSuino.innerHTML = grouped.suino.length === 0 ? '<p style="font-size:0.8rem; color:var(--text-tertiary); text-align:center; padding:1rem 0;">Nenhum produto cadastrado</p>' : 
        grouped.suino.map(item => this.renderPLURowHTML(item, canManage)).join('');
    }
    if (listBovino) {
      listBovino.innerHTML = grouped.bovino.length === 0 ? '<p style="font-size:0.8rem; color:var(--text-tertiary); text-align:center; padding:1rem 0;">Nenhum produto cadastrado</p>' : 
        grouped.bovino.map(item => this.renderPLURowHTML(item, canManage)).join('');
    }
    if (listPescado) {
      listPescado.innerHTML = grouped.pescado.length === 0 ? '<p style="font-size:0.8rem; color:var(--text-tertiary); text-align:center; padding:1rem 0;">Nenhum produto cadastrado</p>' : 
        grouped.pescado.map(item => this.renderPLURowHTML(item, canManage)).join('');
    }
    if (listIogurtes) {
      listIogurtes.innerHTML = grouped.iogurtes.length === 0 ? '<p style="font-size:0.8rem; color:var(--text-tertiary); text-align:center; padding:1rem 0;">Nenhum produto cadastrado</p>' : 
        grouped.iogurtes.map(item => this.renderPLURowHTML(item, canManage)).join('');
    }
    if (listLaticinios) {
      listLaticinios.innerHTML = grouped.laticinios.length === 0 ? '<p style="font-size:0.8rem; color:var(--text-tertiary); text-align:center; padding:1rem 0;">Nenhum produto cadastrado</p>' : 
        grouped.laticinios.map(item => this.renderPLURowHTML(item, canManage)).join('');
    }
    if (listFrios) {
      listFrios.innerHTML = grouped.frios.length === 0 ? '<p style="font-size:0.8rem; color:var(--text-tertiary); text-align:center; padding:1rem 0;">Nenhum produto cadastrado</p>' : 
        grouped.frios.map(item => this.renderPLURowHTML(item, canManage)).join('');
    }
  },

  renderPLURowHTML(item, canManage) {
    return `
      <div class="plu-item-row" style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.02); border:1px solid var(--glass-border); padding:8px 12px; border-radius:var(--r-md); transition:all var(--t-fast);">
        <div style="display:flex; align-items:center; gap:8px; overflow:hidden;">
          <span style="font-family:monospace; font-weight:700; color:var(--text-primary); background:var(--bg-tertiary); padding:2px 6px; border-radius:4px; font-size:0.85rem; border:1px solid var(--glass-border); flex-shrink:0;">
            ${item.plu}
          </span>
          <span style="font-size:0.85rem; color:var(--text-secondary); text-overflow:ellipsis; overflow:hidden; white-space:nowrap;" title="${item.name}">
            ${item.name}
          </span>
        </div>
      </div>
    `;
  },

  bindEvents(container) {
    // 1. Real-time search (no full re-render!)
    const searchInput = container.querySelector('#search-plu-registry');
    searchInput?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.updateList(container);
    });

    // 2. Add individual PLU
    const addBtn = container.querySelector('#btn-add-plu');
    const pluModal = container.querySelector('#plu-modal');
    
    addBtn?.addEventListener('click', () => {
      container.querySelector('#plu-modal-title').textContent = 'Novo Código de Balança';
      container.querySelector('#plu-field-old-key').value = '';
      container.querySelector('#plu-field-code').value = '';
      container.querySelector('#plu-field-code').disabled = false;
      container.querySelector('#plu-field-name').value = '';
      container.querySelector('#plu-field-category').value = '';

      pluModal.style.display = 'flex';
      requestAnimationFrame(() => pluModal.classList.add('modal-overlay--visible'));
    });

    // Modal closing
    const closeModal = () => {
      if (pluModal) {
        pluModal.classList.remove('modal-overlay--visible');
        setTimeout(() => pluModal.style.display = 'none', 250);
      }
    };
    container.querySelector('#plu-modal-close')?.addEventListener('click', closeModal);
    container.querySelector('#plu-btn-cancel')?.addEventListener('click', closeModal);

    // Save PLU
    container.querySelector('#plu-btn-save')?.addEventListener('click', () => {
      const code = container.querySelector('#plu-field-code').value.trim();
      const name = container.querySelector('#plu-field-name').value.trim();
      const category = container.querySelector('#plu-field-category').value;
      const oldKey = container.querySelector('#plu-field-old-key').value;

      if (!code || !name || !category) {
        window.BrigadaUI.showToast('Por favor, preencha todos os campos.', 'error');
        return;
      }

      if (!oldKey) {
        // Verify duplicates
        const exists = this.registry.some(item => item.plu === code);
        if (exists) {
          window.BrigadaUI.showToast(`Código PLU ${code} já está cadastrado.`, 'error');
          return;
        }
        this.registry.push({ plu: code, name, category });
        window.BrigadaUI.showToast('Produto cadastrado com sucesso!');
      } else {
        // Editing existing
        const idx = this.registry.findIndex(item => item.plu === oldKey);
        if (idx !== -1) {
          this.registry[idx] = { plu: code, name, category };
          window.BrigadaUI.showToast('Cadastro atualizado com sucesso!');
        }
      }

      this.save();
      closeModal();
      this.updateList(container);
    });

    // Clear all PLU registry
    container.querySelector('#btn-clear-plu')?.addEventListener('click', () => {
      if (confirm('Tem certeza que deseja apagar TODOS os códigos cadastrados? Esta ação não pode ser desfeita.')) {
        this.registry = [];
        this.save();
        window.BrigadaUI.showToast('Todos os códigos foram removidos.', 'info');
        this.updateList(container);
      }
    });

    // CSV Import
    const importBtn = container.querySelector('#btn-import-plu-csv');
    const fileInput = container.querySelector('#import-plu-file-input');

    importBtn?.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const csvText = evt.target.result;
          this.parseAndImportCSV(csvText);
          fileInput.value = '';
          this.updateList(container);
        } catch (err) {
          window.BrigadaUI.showToast(err.message || 'Erro ao importar arquivo CSV.', 'error');
        }
      };
      reader.readAsText(file, 'UTF-8');
    });
  },

  parseAndImportCSV(csvText) {
    const lines = csvText.split('\n');
    if (lines.length < 2) {
      throw new Error('O arquivo CSV deve conter um cabeçalho e pelo menos uma linha de dados.');
    }

    const separator = lines[0].includes(';') ? ';' : ',';
    const headers = lines[0].split(separator).map(h => h.trim().toLowerCase());
    
    // Find columns index
    const pluIdx = headers.findIndex(h => h.includes('plu') || h.includes('codigo') || h.includes('código') || h.includes('balanca') || h.includes('balança'));
    const nameIdx = headers.findIndex(h => h.includes('nome') || h.includes('produto') || h.includes('desc'));
    const catIdx = headers.findIndex(h => h.includes('cat') || h.includes('grupo') || h.includes('tipo'));

    if (pluIdx === -1 || nameIdx === -1 || catIdx === -1) {
      throw new Error('O arquivo CSV deve conter colunas para PLU, Nome e Categoria.');
    }

    let addedCount = 0;
    let updatedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(separator).map(c => c.trim());
      if (cols.length <= Math.max(pluIdx, nameIdx, catIdx)) continue;

      const plu = cols[pluIdx];
      const name = cols[nameIdx];
      let rawCat = cols[catIdx].toLowerCase();

      // Map raw category to system keys
      let category = '';
      if (rawCat.includes('ave') || rawCat.includes('frango')) {
        category = 'aves';
      } else if (rawCat.includes('suin') || rawCat.includes('porco')) {
        category = 'suino';
      } else if (rawCat.includes('bovin') || rawCat.includes('boi') || rawCat.includes('carne')) {
        category = 'bovino';
      } else if (rawCat.includes('pesc') || rawCat.includes('peixe') || rawCat.includes('fruto')) {
        category = 'pescado';
      }

      if (!plu || !name || !category) continue;

      const existingIdx = this.registry.findIndex(item => item.plu === plu);
      if (existingIdx !== -1) {
        this.registry[existingIdx] = { plu, name, category };
        updatedCount++;
      } else {
        this.registry.push({ plu, name, category });
        addedCount++;
      }
    }

    this.save();
    window.BrigadaUI.showToast(`Importação concluída: ${addedCount} novos, ${updatedCount} atualizados.`);
  }
};

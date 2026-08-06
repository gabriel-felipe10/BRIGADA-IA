/**
 * BRIGADA-IA — Main App Router & UI System
 * Painel Super Admin · Gestão de Usuários · Brigada de Validade
 */

// ── UI Helpers ────────────────────────────────────────────────────────────────
window.BrigadaUI = {
  setupPluAutocomplete(container, inputSelector, suggestionsContainerSelector, fieldsMapping) {
    const input = container.querySelector(inputSelector);
    const suggContainer = container.querySelector(suggestionsContainerSelector);
    if (!input || !suggContainer) return;

    input.setAttribute('autocomplete', 'off');

    const handleInput = () => {
      const query = input.value.trim().toLowerCase();
      if (!query) {
        suggContainer.style.display = 'none';
        return;
      }

      // Search central catalog
      const catalog = window.BrigadaData.catalog || [];
      const matches = catalog.filter(item => 
        (item.plu && item.plu.toLowerCase().includes(query)) ||
        (item.barcode && item.barcode.toLowerCase().includes(query)) ||
        (item.name && item.name.toLowerCase().includes(query))
      ).slice(0, 5); // limit to 5 suggestions

      if (matches.length === 0) {
        suggContainer.style.display = 'none';
        return;
      }

      suggContainer.innerHTML = matches.map(item => `
        <div class="autocomplete-suggestion-item" data-plu="${item.plu}">
          <span class="suggestion-plu">${item.plu}</span>
          <span class="suggestion-name">${item.name}</span>
        </div>
      `).join('');
      suggContainer.style.display = 'block';

      // Bind selection clicks
      suggContainer.querySelectorAll('.autocomplete-suggestion-item').forEach(el => {
        el.addEventListener('click', () => {
          const plu = el.dataset.plu;
          const selected = catalog.find(item => item.plu === plu);
          if (selected) {
            input.value = selected.plu;
            
            // Pre-fill mapped fields
            if (fieldsMapping.name) {
              const nameEl = container.querySelector(fieldsMapping.name);
              if (nameEl) nameEl.value = selected.name || '';
            }
            if (fieldsMapping.category) {
              const catEl = container.querySelector(fieldsMapping.category);
              if (catEl) catEl.value = selected.category || '';
            }
            if (fieldsMapping.barcode) {
              const barEl = container.querySelector(fieldsMapping.barcode);
              if (barEl) barEl.value = selected.barcode || '';
            }
            if (fieldsMapping.unit && selected.unit) {
              const unitEl = container.querySelector(fieldsMapping.unit);
              if (unitEl) unitEl.value = selected.unit || '';
            }
          }
          suggContainer.style.display = 'none';
        });
      });
    };

    input.addEventListener('input', handleInput);
    input.addEventListener('focus', handleInput);

    // Close suggestion list when clicking outside
    const handleOutsideClick = (e) => {
      if (e.target !== input && e.target !== suggContainer && !suggContainer.contains(e.target)) {
        suggContainer.style.display = 'none';
      }
    };
    document.addEventListener('click', handleOutsideClick);
  },

  showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
      <span class="toast__icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
      <span class="toast__message">${message}</span>
    `;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('toast--visible'));
    setTimeout(() => {
      toast.classList.remove('toast--visible');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  printContent(html) {
    let printArea = document.getElementById('print-area');
    if (!printArea) {
      printArea = document.createElement('div');
      printArea.id = 'print-area';
      document.body.appendChild(printArea);
    }
    printArea.innerHTML = html;

    // Espera as imagens (como as assinaturas em base64) carregarem antes de imprimir
    const images = printArea.querySelectorAll('img');
    if (images.length > 0) {
      let loadedCount = 0;
      const onImageLoad = () => {
        loadedCount++;
        if (loadedCount === images.length) {
          setTimeout(() => {
            window.print();
          }, 150);
        }
      };
      images.forEach(img => {
        if (img.complete) {
          onImageLoad();
        } else {
          img.addEventListener('load', onImageLoad);
          img.addEventListener('error', onImageLoad);
        }
      });
    } else {
      setTimeout(() => {
        window.print();
      }, 100);
    }
  },
  
  // ── Scanner ─────────────────────────────────────────────────────────────
  scannerInstance: null,
  onScanCallback: null,

  openScanner(callback) {
    this.onScanCallback = callback;
    const modal = document.getElementById('scanner-modal-overlay');
    if (!modal) return;
    
    modal.style.display = 'block';
    requestAnimationFrame(() => modal.classList.add('modal-overlay--visible'));

    if (!this.scannerInstance) {
      this.scannerInstance = new Html5Qrcode("scanner-reader");
    }

    const config = { fps: 10, qrbox: { width: 250, height: 150 }, aspectRatio: 1.0 };
    
    // Bind close button
    const closeBtn = document.getElementById('close-scanner-btn');
    if (closeBtn) closeBtn.onclick = () => this.closeScanner();

    this.scannerInstance.start(
      { facingMode: "environment" },
      config,
      (decodedText, decodedResult) => {
        // Success
        this.closeScanner();
        this.playBeep();
        
        let isScaleCode = false;
        let plu = null;
        let barcode = decodedText;

        // Lógica de Código de Balança (Brasil: começa com 2, 13 dígitos)
        // Exemplo: 2 CCCC PPPPPPP D (onde CCCC é o PLU)
        if (decodedText.startsWith('2') && decodedText.length === 13) {
           isScaleCode = true;
           // O PLU costuma estar entre a posição 1 e 5 (4 dígitos) ou 1 e 6 (5 dígitos)
           // Ex: 20123... (PLU 123) ou 21234... (PLU 1234). Assumindo 4 dígitos por padrão 
           // para a maioria das balanças (pos 1 a 5) ou adaptativo. 
           // Geralmente os zeros à esquerda são ignorados.
           plu = parseInt(decodedText.substring(1, 5), 10).toString();
        }

        if (this.onScanCallback) {
           this.onScanCallback({ barcode, isScaleCode, plu, raw: decodedText });
        }
      },
      (errorMessage) => {
        // Ignorar erros de scan contínuo
      }
    ).catch(err => {
      console.error("Erro ao iniciar câmera", err);
      this.showToast("Erro ao abrir a câmera. Verifique as permissões.", "error");
    });
  },

  closeScanner() {
    const modal = document.getElementById('scanner-modal-overlay');
    if (modal) {
      modal.classList.remove('modal-overlay--visible');
      setTimeout(() => { modal.style.display = 'none'; }, 300);
    }
    if (this.scannerInstance) {
      this.scannerInstance.stop().then(() => {
        this.scannerInstance.clear();
      }).catch(err => console.error("Erro ao parar o scanner", err));
    }
  },

  playBeep() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = 800;
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.05);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } catch(e) {}
  },

  // ── Product View Modal ───────────────────────────────────────────────────
  showProductView(productId) {
    const product = window.BrigadaData.products.find(p => String(p.id) === String(productId));
    if (!product) return;

    const modal = document.getElementById('product-view-modal-overlay');
    const content = document.getElementById('product-view-content');
    if (!modal || !content) return;

    const catMap = {
      aves: '🐔 Aves', suino: '🐷 Suíno', bovino: '🐮 Bovino', pescado: '🐟 Pescado'
    };
    const status = window.BrigadaData.getProductStatus(product);

    const isConciliacao = product.category === 'conciliacao';

    content.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <strong style="color: var(--text-secondary); font-size: 0.85rem;">PRODUTO</strong>
        <div style="font-size: 1.25rem; font-weight: bold; color: var(--text-primary);">${product.name}</div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div>
          <strong style="color: var(--text-secondary); font-size: 0.85rem;">PLU</strong>
          <div style="color: var(--text-primary);">${product.plu}</div>
        </div>
        <div>
          <strong style="color: var(--text-secondary); font-size: 0.85rem;">CÓD. BARRAS</strong>
          <div style="color: var(--text-primary);">${product.barcode || '—'}</div>
        </div>
        <div>
          <strong style="color: var(--text-secondary); font-size: 0.85rem;">CATEGORIA</strong>
          <div style="color: var(--text-primary);">${catMap[product.category] || product.category}</div>
        </div>
        <div>
          <strong style="color: var(--text-secondary); font-size: 0.85rem;">QUANTIDADE</strong>
          <div style="color: var(--text-primary);">${product.quantity !== undefined ? product.quantity : 0} ${product.unit || 'kg'}</div>
        </div>
        <div>
          <strong style="color: var(--text-secondary); font-size: 0.85rem;">${isConciliacao ? 'DATA DA CONTAGEM' : 'DATA DE CADASTRO'}</strong>
          <div style="color: var(--text-primary);">${window.BrigadaData.formatDate(product.startDate)}</div>
        </div>
        <div>
          <strong style="color: var(--text-secondary); font-size: 0.85rem;">${isConciliacao ? 'DATA DE VALIDADE' : 'VALIDADE'}</strong>
          <div style="color: var(--text-primary);">${window.BrigadaData.formatDate(product.endDate)}</div>
        </div>
        ${!isConciliacao ? `
        <div>
          <strong style="color: var(--text-secondary); font-size: 0.85rem;">STATUS</strong>
          <div style="margin-top: 0.25rem;"><span class="badge ${status.class}">${status.icon} ${status.label}</span></div>
        </div>
        <div>
          <strong style="color: var(--text-secondary); font-size: 0.85rem;">FORNECEDOR</strong>
          <div style="color: var(--text-primary);">${product.supplier || '—'}</div>
        </div>
        ` : ''}
        <div style="grid-column: span 2;">
          <strong style="color: var(--text-secondary); font-size: 0.85rem;">LOCALIZAÇÃO</strong>
          <div style="color: var(--text-primary);">${window.BrigadaData.formatLocationFriendly(product)}</div>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('modal-overlay--visible'));

    const closeBtn = document.getElementById('close-product-view-btn');
    const closeBtn2 = document.getElementById('btn-close-product-view');
    const closeHandler = () => {
      modal.classList.remove('modal-overlay--visible');
      setTimeout(() => modal.style.display = 'none', 250);
    };
    if (closeBtn) closeBtn.onclick = closeHandler;
    if (closeBtn2) closeBtn2.onclick = closeHandler;
    modal.onclick = (e) => {
      if (e.target === modal) closeHandler();
    };
  }
};

// ── Router ────────────────────────────────────────────────────────────────────
window.BrigadaRouter = {
  currentPage: null,

  async init() {
    window.BrigadaAuth.init();
    
    await window.BrigadaData.load();
    
    if (window.BrigadaAuth.isLoggedIn()) {
      if (window.BrigadaAuth.isKiosk()) {
        this.navigate('catalog');
      } else {
        this.navigate('dashboard');
      }
    } else {
      this.navigate('login');
    }
  },

  navigate(page) {
    this.currentPage = page;
    const root = document.getElementById('app-root');
    if (!root) return;

    // Clear
    root.innerHTML = '';

    if (page === 'login') {
      this.renderLogin(root);
    } else {
      // Require auth for all other pages
      if (!window.BrigadaAuth.requireAuth()) return;
      this.renderShell(root, page);
    }
  },

  // ── Login Screen ─────────────────────────────────────────────────────────
  renderLogin(root) {
    root.innerHTML = `
      <div class="login-screen">
        <div class="login-bg"></div>
        <div class="login-card">
          <div class="login-logo">
            <img src="/static/icon.svg" alt="Logo" style="width: 72px; height: 72px; border-radius: 16px; object-fit: cover; margin-bottom: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.3); border: 2px solid rgba(255,255,255,0.08);">
            <h1 class="login-logo__title">BRIGADA-IA</h1>
            <p class="login-logo__sub">Sistema de Validade · Açougue Varejo</p>
          </div>
          <form id="login-form" class="login-form">
            <div class="form-group">
              <label class="form-label">E-mail</label>
              <input type="email" id="login-email" class="form-input" placeholder="seu@email.com" autocomplete="email" required>
            </div>
            <div class="form-group">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label class="form-label" style="margin-bottom: 0;">Senha</label>
                <a href="#" id="link-forgot-password" style="font-size: 0.75rem; color: var(--primary); text-decoration: none; font-weight: 500; transition: opacity 0.2s;" onmouseover="this.style.opacity=0.8" onmouseout="this.style.opacity=1">Esqueci minha senha</a>
              </div>
              <div class="password-wrapper">
                <input type="password" id="login-password" class="form-input" placeholder="••••••••" autocomplete="current-password" required>
                <button type="button" class="btn-eye" id="toggle-password">👁️</button>
              </div>
            </div>
            <div class="login-error" id="login-error" style="display:none;"></div>
            <button type="submit" class="btn btn--primary btn--full" id="btn-login">
              <span class="spinner" id="login-spinner" style="display:none;"></span>
              <span id="btn-login-text">Entrar no Sistema</span>
            </button>
            <div style="text-align: center; margin-top: 1rem;">
              <button type="button" class="btn btn--ghost" id="btn-toggle-pin" style="font-size: 0.85rem; padding: 0.5rem;">
                Acesso Rápido ao Catálogo
              </button>
            </div>
          </form>

          <form id="login-pin-form" class="login-form" style="display:none;">
            <p style="text-align: center; color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">
              Modo Quiosque (Somente Leitura)
            </p>
            <div class="form-group" style="text-align: center;">
              <label class="form-label">PIN de 4 dígitos</label>
              <input type="password" id="login-pin" class="form-input" placeholder="••••" maxlength="4" style="text-align: center; font-size: 2rem; letter-spacing: 0.5rem; width: 150px; margin: 0 auto;" readonly>
            </div>
            
            <div class="virtual-keypad">
              <button type="button" class="keypad-btn" data-key="1">1</button>
              <button type="button" class="keypad-btn" data-key="2">2<span class="keypad-sub">ABC</span></button>
              <button type="button" class="keypad-btn" data-key="3">3<span class="keypad-sub">DEF</span></button>
              <button type="button" class="keypad-btn" data-key="4">4<span class="keypad-sub">GHI</span></button>
              <button type="button" class="keypad-btn" data-key="5">5<span class="keypad-sub">JKL</span></button>
              <button type="button" class="keypad-btn" data-key="6">6<span class="keypad-sub">MNO</span></button>
              <button type="button" class="keypad-btn" data-key="7">7<span class="keypad-sub">PQRS</span></button>
              <button type="button" class="keypad-btn" data-key="8">8<span class="keypad-sub">TUV</span></button>
              <button type="button" class="keypad-btn" data-key="9">9<span class="keypad-sub">WXYZ</span></button>
              <button type="button" class="keypad-btn keypad-action" data-key="back">⌫</button>
              <button type="button" class="keypad-btn" data-key="0">0</button>
              <button type="button" class="keypad-btn keypad-action" data-key="ok">OK</button>
            </div>

            <div class="login-error" id="login-pin-error" style="display:none;"></div>
            <button type="submit" class="btn btn--primary btn--full" id="btn-login-pin" style="display: none;">
              <span id="btn-login-pin-text">Acessar Catálogo</span>
            </button>
            <div style="text-align: center; margin-top: 1rem;">
              <button type="button" class="btn btn--ghost" id="btn-toggle-email" style="font-size: 0.85rem; padding: 0.5rem;">
                Voltar para Login Admin
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal Esqueci Minha Senha -->
      <div class="modal-overlay" id="forgot-password-modal" style="display:none; z-index: 2000;">
        <div class="modal modal--sm">
          <div class="modal-header">
            <h3 class="modal-title">🔑 Redefinir Senha</h3>
            <button class="modal-close" id="forgot-modal-close">✕</button>
          </div>
          <div class="modal-body" style="padding: 1.5rem 0;">
            <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5; margin-bottom: 1rem;">
              Para redefinir sua senha, solicite ao **Super Administrador** para alterá-la na aba de gerenciamento de usuários do sistema.
            </p>
            <p style="color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5;">
              Ou entre em contato via e-mail: <strong style="color: var(--primary);">admin@brigada.com</strong>
            </p>
          </div>
          <div class="modal-footer" style="padding-top: 0;">
            <button class="btn btn--primary btn--full" id="forgot-btn-ok">Entendi</button>
          </div>
        </div>
      </div>
    `;

    // Toggle password
    document.getElementById('toggle-password')?.addEventListener('click', () => {
      const input = document.getElementById('login-password');
      input.type = input.type === 'password' ? 'text' : 'password';
    });

    // Forgot password modal events
    const forgotModal = document.getElementById('forgot-password-modal');
    const closeForgotModal = () => {
      if (forgotModal) {
        forgotModal.classList.remove('modal-overlay--visible');
        setTimeout(() => forgotModal.style.display = 'none', 250);
      }
    };

    document.getElementById('link-forgot-password')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (forgotModal) {
        forgotModal.style.display = 'flex';
        requestAnimationFrame(() => forgotModal.classList.add('modal-overlay--visible'));
      }
    });

    document.getElementById('forgot-modal-close')?.addEventListener('click', closeForgotModal);
    document.getElementById('forgot-btn-ok')?.addEventListener('click', closeForgotModal);
    forgotModal?.addEventListener('click', (e) => {
      if (e.target.id === 'forgot-password-modal') closeForgotModal();
    });

    // Toggle Forms
    const formEmail = document.getElementById('login-form');
    const formPin = document.getElementById('login-pin-form');
    document.getElementById('btn-toggle-pin')?.addEventListener('click', () => {
      formEmail.style.display = 'none';
      formPin.style.display = 'block';
    });
    document.getElementById('btn-toggle-email')?.addEventListener('click', () => {
      formPin.style.display = 'none';
      formEmail.style.display = 'block';
    });

    // Form submit
    document.getElementById('login-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const errorEl = document.getElementById('login-error');
      const spinner = document.getElementById('login-spinner');
      const btnText = document.getElementById('btn-login-text');

      spinner.style.display = 'inline-block';
      btnText.textContent = 'Autenticando...';
      errorEl.style.display = 'none';

      // Simula latência e aguarda login assíncrono
      setTimeout(async () => {
        try {
          const result = await window.BrigadaAuth.login(email, password);
          spinner.style.display = 'none';
          btnText.textContent = 'Entrar no Sistema';
          if (result.success) {
            window.BrigadaUI.showToast(`Bem-vindo, ${result.user.name}! 👋`, 'success');
            this.navigate('dashboard');
          } else {
            errorEl.style.display = 'block';
            errorEl.textContent = result.message;
          }
        } catch (err) {
          spinner.style.display = 'none';
          btnText.textContent = 'Entrar no Sistema';
          errorEl.style.display = 'block';
          errorEl.textContent = 'Erro ao tentar autenticar. Tente novamente.';
        }
      }, 700);
    });

    // PIN Form submit
    document.getElementById('login-pin-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const pin = document.getElementById('login-pin').value;
      const errorEl = document.getElementById('login-pin-error');
      
      errorEl.style.display = 'none';

      const result = window.BrigadaAuth.loginPin(pin);
      if (result.success) {
        window.BrigadaUI.showToast(`Acesso rápido autorizado!`, 'success');
        this.navigate('catalog');
      } else {
        errorEl.style.display = 'block';
        errorEl.textContent = result.message;
      }
    });

    // Virtual Keypad logic
    const pinInput = document.getElementById('login-pin');
    const pinForm = document.getElementById('login-pin-form');
    document.querySelectorAll('.keypad-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        if (!pinInput) return;

        if (key === 'ok') {
          if (pinInput.value.length > 0) {
            pinForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
          }
        } else if (key === 'back') {
          pinInput.value = pinInput.value.slice(0, -1);
        } else {
          if (pinInput.value.length < 4) {
            pinInput.value += key;
          }
        }
        
        // Trigger visual feedback or input events if necessary
        pinInput.dispatchEvent(new Event('input'));
      });
    });
  },

  // ── App Shell (sidebar layout) ────────────────────────────────────────────
  renderShell(root, activePage) {
    const user = window.BrigadaAuth.currentUser;
    const isSuperAdmin = window.BrigadaAuth.isSuperAdmin();
    const isKiosk = window.BrigadaAuth.isKiosk();
    const avatarColor = this.avatarColor(user.name);
    const hasImageAvatar = user.avatar && (user.avatar.startsWith('data:image/') || user.avatar.startsWith('http'));
    const avatarHTML = hasImageAvatar ? `<img src="${user.avatar}" alt="${user.name}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">` : user.avatar;

    const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
    const collapsedClass = isCollapsed ? 'sidebar-collapsed' : '';
    const toggleIcon = '☰';
    const toggleTitle = isCollapsed ? 'Expandir menu' : 'Recolher menu';

    root.innerHTML = `
      <div class="app-shell ${collapsedClass} ${isKiosk ? 'is-kiosk' : ''}">
        <!-- Sidebar Overlay -->
        <div class="sidebar-overlay" id="sidebar-overlay"></div>
        <!-- Sidebar -->
        ${!isKiosk ? `
        <aside class="sidebar" id="sidebar">
          <button class="sidebar__toggle" id="sidebar-toggle" title="${toggleTitle}">
            <span class="sidebar__toggle-icon" id="sidebar-toggle-icon">${toggleIcon}</span>
          </button>
          <div class="sidebar__brand">
            <img src="/static/icon.svg" alt="Logo" style="width: 32px; height: 32px; border-radius: 8px; object-fit: cover; margin-right: 8px; border: 1px solid rgba(255,255,255,0.08);">
            <div>
              <h1 class="sidebar__title">BRIGADA-IA</h1>
              <p class="sidebar__sub">Varejo · Açougue</p>
            </div>
          </div>

          <nav class="sidebar__nav">
            <div class="sidebar__section-label">Principal</div>
            <a class="sidebar__link ${activePage === 'dashboard' ? 'sidebar__link--active' : ''}" data-page="dashboard" href="#">
              <span class="sidebar__link-icon">📊</span>
              <span>Dashboard</span>
            </a>
            ${!window.BrigadaAuth.isPromotor() ? `
            <a class="sidebar__link ${activePage === 'catalog' ? 'sidebar__link--active' : ''}" data-page="catalog" href="#">
              <span class="sidebar__link-icon">📖</span>
              <span>Catálogo</span>
            </a>
            ` : ''}
            <a class="sidebar__link ${activePage === 'conciliacao' ? 'sidebar__link--active' : ''}" data-page="conciliacao" href="#">
              <span class="sidebar__link-icon">⚖️</span>
              <span>Conciliação</span>
            </a>
            <a class="sidebar__link ${activePage === 'produtos-sem-nota' ? 'sidebar__link--active' : ''}" data-page="produtos-sem-nota" href="#">
              <span class="sidebar__link-icon">📄</span>
              <span>Sem Nota</span>
            </a>
            ${window.BrigadaAuth.isSuperAdmin() || window.BrigadaAuth.isGestao() || window.BrigadaAuth.currentUser?.role === 'lider' ? `
            <a class="sidebar__link ${activePage === 'resumo-mensal' ? 'sidebar__link--active' : ''}" data-page="resumo-mensal" href="#">
              <span class="sidebar__link-icon">📅</span>
              <span>Resumo Mensal</span>
            </a>
            ` : ''}
            ${!window.BrigadaAuth.isPromotor() && window.BrigadaAuth.hasSectorAccess('açougue') ? `
            <a class="sidebar__link ${activePage === 'products' ? 'sidebar__link--active' : ''}" data-page="products" href="#">
              <span class="sidebar__link-icon">🥩</span>
              <span>Açougue</span>
            </a>
            ` : ''}

            ${!window.BrigadaAuth.isPromotor() && (window.BrigadaAuth.hasSectorAccess('açougue') || window.BrigadaAuth.hasSectorAccess('pereciveis')) ? `
            <a class="sidebar__link ${activePage === 'chambers' ? 'sidebar__link--active' : ''}" data-page="chambers" href="#">
              <span class="sidebar__link-icon">❄️</span>
              <span>Câmaras Frias</span>
            </a>
            ` : ''}
            ${!window.BrigadaAuth.isPromotor() && window.BrigadaAuth.hasSectorAccess('pereciveis') ? `
            <a class="sidebar__link ${activePage === 'pereciveis' ? 'sidebar__link--active' : ''}" data-page="pereciveis" href="#">
              <span class="sidebar__link-icon">🍎</span>
              <span>Perecíveis</span>
            </a>
            ` : ''}
            ${!window.BrigadaAuth.isPromotor() && window.BrigadaAuth.hasSectorAccess('padaria') ? `
            <a class="sidebar__link ${activePage === 'padaria' ? 'sidebar__link--active' : ''}" data-page="padaria" href="#">
              <span class="sidebar__link-icon">🍞</span>
              <span>Padaria</span>
            </a>
            ` : ''}
            ${!window.BrigadaAuth.isPromotor() && window.BrigadaAuth.hasSectorAccess('hortifruti') ? `
            <a class="sidebar__link ${activePage === 'hortifruti' ? 'sidebar__link--active' : ''}" data-page="hortifruti" href="#">
              <span class="sidebar__link-icon">🥦</span>
              <span>Hortifruti</span>
            </a>
            ` : ''}
            ${!window.BrigadaAuth.isPromotor() && window.BrigadaAuth.hasSectorAccess('mercearia') ? `
            <a class="sidebar__link ${activePage === 'mercearia' ? 'sidebar__link--active' : ''}" data-page="mercearia" href="#">
              <span class="sidebar__link-icon">🛒</span>
              <span>Mercearia</span>
            </a>
            ` : ''}

            ${!window.BrigadaAuth.isPromotor() ? `
            <div class="sidebar__section-label">Configurações</div>
            <a class="sidebar__link ${activePage === 'notifications' ? 'sidebar__link--active' : ''}" data-page="notifications" href="#">
              <span class="sidebar__link-icon">🔔</span>
              <span>Notificações</span>
            </a>
            ` : ''}

            ${isSuperAdmin ? `
            <div class="sidebar__section-label">Administração</div>
            <a class="sidebar__link ${activePage === 'users' ? 'sidebar__link--active' : ''}" data-page="users" href="#">
              <span class="sidebar__link-icon">👥</span>
              <span>Usuários</span>
            </a>
            <a class="sidebar__link ${activePage === 'admin' ? 'sidebar__link--active' : ''}" data-page="admin" href="#">
              <span class="sidebar__link-icon">🛡️</span>
              <span>Super Admin</span>
            </a>
            ` : ''}
          </nav>

          <div class="sidebar__footer" style="flex-direction: column; align-items: stretch; gap: var(--sp-md);">
            <div class="sidebar__user" style="width: 100%;" title="Clique para editar seu perfil">
              <div class="sidebar__avatar" id="sidebar-user-avatar" style="${hasImageAvatar ? '' : `background:${avatarColor}`}">${avatarHTML}</div>
              <div class="sidebar__user-info">
                <p class="sidebar__user-name" id="sidebar-user-name">${user.name}</p>
                <p class="sidebar__user-role">${isSuperAdmin ? '🛡️ Super Admin' : window.BrigadaAuth.isGestao() ? '👥 Gestão' : window.BrigadaAuth.isPromotor() ? '📋 Promotor' : window.BrigadaAuth.currentUser?.role === 'lider' ? '👤 Usuário/Líder' : '👤 Usuário'}</p>
              </div>
            </div>
            <div class="sidebar__actions">
              <button class="btn-theme" id="btn-theme-toggle" title="Alternar Tema">
                <span id="theme-icon">${document.documentElement.classList.contains('light-theme') ? '🌙' : '☀️'}</span> <span class="logout-text" style="font-size: 0.8rem; margin-left: 4px;">Tema</span>
              </button>
              <button class="btn-logout" id="btn-logout" title="Sair do Sistema">
                <span>🚪</span> <span class="logout-text" style="font-size: 0.8rem; margin-left: 4px;">Sair</span>
              </button>
            </div>
          </div>
        </aside>
        ` : `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--surface); border-bottom: 1px solid var(--border);">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <img src="/static/icon.svg" alt="Logo" style="width: 32px; height: 32px; border-radius: 8px;">
            <h1 style="margin: 0; font-size: 1.25rem;">Catálogo Rápido</h1>
          </div>
          <button class="btn btn--outline" id="btn-logout-kiosk" style="padding: 0.5rem 1rem;">Sair</button>
        </div>
        `}

        <!-- Mobile menu toggle -->
        ${!isKiosk ? `<button class="mobile-menu-btn" id="mobile-menu-btn">☰</button>` : ''}

        <!-- Main content -->
        <main class="main-content" id="main-content">
          <div class="page-container fade-in" id="page-container">
            <!-- Conteúdo injetado aqui -->
          </div>
        </main>
      </div>

      <!-- Modal de perfil do usuário logado -->
      <div class="modal-overlay" id="profile-modal" style="display:none; z-index: 2000;">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">👤 Meu Perfil</h3>
            <button class="modal-close" id="profile-modal-close">✕</button>
          </div>
          <div class="modal-body">
            <form id="profile-form">
              <div class="form-group">
                <label class="form-label">Nome Completo *</label>
                <input type="text" id="profile-field-name" class="form-input" placeholder="Seu nome" required>
              </div>
              <div class="form-group">
                <label class="form-label">E-mail</label>
                <input type="email" id="profile-field-email" class="form-input" disabled style="opacity: 0.6; cursor: not-allowed; background: rgba(255,255,255,0.02); border-color: var(--glass-border);">
              </div>
              <div class="form-group">
                <label class="form-label">Nova Senha (deixe em branco para manter)</label>
                <input type="password" id="profile-field-password" class="form-input" placeholder="Mínimo 6 caracteres">
              </div>
              <input type="hidden" id="profile-field-avatar-base64">
              <div class="form-group" style="margin-top: 1rem;">
                <label class="form-label">Foto de Perfil</label>
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <div class="user-avatar" id="profile-avatar-preview" style="width: 50px; height: 50px; border-radius: 50%; font-size: 1.2rem; font-weight: bold; display: flex; align-items: center; justify-content: center; background: var(--glass-bg); border: 1px solid var(--glass-border); overflow: hidden;">US</div>
                  <div style="flex: 1; display: flex; flex-direction: column; gap: 4px;">
                    <input type="file" id="profile-field-avatar-file" class="form-input" accept="image/*" style="padding: 4px; background: transparent; border: 1px solid var(--glass-border);">
                    <button type="button" class="btn btn--ghost" id="profile-btn-remove-avatar" style="padding: 4px 8px; font-size: 0.75rem; align-self: flex-start; display: none;">Remover Foto</button>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn--ghost" id="profile-btn-cancel">Cancelar</button>
            <button class="btn btn--primary" id="profile-btn-save">Salvar Alterações</button>
          </div>
        </div>
      </div>
    `;

    // Navigation events
    if (!isKiosk) {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.getElementById('sidebar-overlay');
      const closeSidebar = () => {
        sidebar?.classList.remove('sidebar--open');
        overlay?.classList.remove('sidebar-overlay--visible');
      };

      root.querySelectorAll('.sidebar__link').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const page = e.currentTarget.dataset.page;
          if (page !== activePage) {
            this.navigate(page);
          }
          if (window.innerWidth <= 768) {
            closeSidebar();
          }
        });
      });

      // Toggle Sidebar events
      document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
        const appSidebar = document.getElementById('app-sidebar');
        const icon = document.getElementById('sidebar-toggle-icon');
        appSidebar.classList.toggle('sidebar-collapsed');
        const collapsed = appSidebar.classList.contains('sidebar-collapsed');
        icon.textContent = collapsed ? '☰' : '☰';
        localStorage.setItem('sidebar-collapsed', collapsed);
        document.getElementById('sidebar-toggle').title = collapsed ? 'Expandir menu' : 'Recolher menu';
      });

      // Mobile Menu
      document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
        sidebar?.classList.add('sidebar--open');
        overlay?.classList.add('sidebar-overlay--visible');
      });
      overlay?.addEventListener('click', () => {
        closeSidebar();
      });
    }

    // Logout
    const logoutHandler = () => {
      if (!isKiosk) {
        document.getElementById('sidebar')?.classList.remove('sidebar--open');
        document.getElementById('sidebar-overlay')?.classList.remove('sidebar-overlay--visible');
      }
      window.BrigadaAuth.logout();
      window.BrigadaUI.showToast(isKiosk ? 'Sessão encerrada.' : 'Até logo! 👋', 'success');
      this.navigate('login');
    };
    
    document.getElementById('btn-logout')?.addEventListener('click', logoutHandler);
    document.getElementById('btn-logout-kiosk')?.addEventListener('click', logoutHandler);

    // Theme Toggle
    document.getElementById('btn-theme-toggle')?.addEventListener('click', () => {
      const isLight = document.documentElement.classList.toggle('light-theme');
      localStorage.setItem('brigada-theme', isLight ? 'light' : 'dark');
      const themeIcon = document.getElementById('theme-icon');
      if (themeIcon) {
        themeIcon.textContent = isLight ? '🌙' : '☀️';
      }
    });

    // Mobile menu toggle is handled inside the !isKiosk block
    // Sidebar toggle (desktop collapse/expand)
    const toggleBtn = document.getElementById('sidebar-toggle');
    const appShell = root.querySelector('.app-shell');
    const toggleIconEl = document.getElementById('sidebar-toggle-icon');

    toggleBtn?.addEventListener('click', () => {
      if (appShell) {
        const isCurrentlyCollapsed = appShell.classList.toggle('sidebar-collapsed');
        localStorage.setItem('sidebar-collapsed', isCurrentlyCollapsed ? 'true' : 'false');
        if (toggleBtn) {
          toggleBtn.title = isCurrentlyCollapsed ? 'Expandir menu' : 'Recolher menu';
        }
      }
    });


    // Eventos do Modal de Perfil
    const profileModal = document.getElementById('profile-modal');
    const closeProfileModal = () => {
      if (profileModal) {
        profileModal.classList.remove('modal-overlay--visible');
        setTimeout(() => profileModal.style.display = 'none', 250);
      }
    };

    document.querySelector('.sidebar__user')?.addEventListener('click', () => {
      const currentUser = window.BrigadaAuth.currentUser;
      if (!currentUser) return;

      const nameInput = document.getElementById('profile-field-name');
      const emailInput = document.getElementById('profile-field-email');
      const pwdInput = document.getElementById('profile-field-password');
      const base64Input = document.getElementById('profile-field-avatar-base64');
      const previewEl = document.getElementById('profile-avatar-preview');
      const removeBtn = document.getElementById('profile-btn-remove-avatar');
      const fileInput = document.getElementById('profile-field-avatar-file');

      nameInput.value = currentUser.name;
      emailInput.value = currentUser.email;
      pwdInput.value = '';
      fileInput.value = '';

      if (currentUser.avatar && (currentUser.avatar.startsWith('data:image/') || currentUser.avatar.startsWith('http'))) {
        base64Input.value = currentUser.avatar;
        previewEl.innerHTML = `<img src="${currentUser.avatar}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
        previewEl.style.background = 'none';
        removeBtn.style.display = 'inline-block';
      } else {
        base64Input.value = '';
        previewEl.textContent = currentUser.avatar || 'US';
        previewEl.style.background = 'var(--glass-bg)';
        removeBtn.style.display = 'none';
      }

      profileModal.style.display = 'flex';
      requestAnimationFrame(() => profileModal.classList.add('modal-overlay--visible'));
    });

    document.getElementById('profile-modal-close')?.addEventListener('click', closeProfileModal);
    document.getElementById('profile-btn-cancel')?.addEventListener('click', closeProfileModal);
    profileModal?.addEventListener('click', (e) => {
      if (e.target.id === 'profile-modal') closeProfileModal();
    });

    const profileFileInput = document.getElementById('profile-field-avatar-file');
    const profilePreviewEl = document.getElementById('profile-avatar-preview');
    const profileBase64Input = document.getElementById('profile-field-avatar-base64');
    const profileRemoveBtn = document.getElementById('profile-btn-remove-avatar');

    profileFileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const max_size = 128;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > max_size) {
              height *= max_size / width;
              width = max_size;
            }
          } else {
            if (height > max_size) {
              width *= max_size / height;
              height = max_size;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const resizedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          profileBase64Input.value = resizedBase64;
          profilePreviewEl.innerHTML = `<img src="${resizedBase64}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
          profilePreviewEl.style.background = 'none';
          profileRemoveBtn.style.display = 'inline-block';
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });

    profileRemoveBtn?.addEventListener('click', () => {
      profileFileInput.value = '';
      profileBase64Input.value = '';
      const name = document.getElementById('profile-field-name').value.trim() || 'US';
      const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      profilePreviewEl.textContent = initials;
      profilePreviewEl.style.background = 'var(--glass-bg)';
      profileRemoveBtn.style.display = 'none';
    });

    document.getElementById('profile-btn-save')?.addEventListener('click', async () => {
      const currentUser = window.BrigadaAuth.currentUser;
      if (!currentUser) return;

      const name = document.getElementById('profile-field-name').value.trim();
      const password = document.getElementById('profile-field-password').value;
      const base64Avatar = document.getElementById('profile-field-avatar-base64').value;
      
      if (!name) {
        window.BrigadaUI.showToast('O nome é obrigatório.', 'error');
        return;
      }

      if (password && password.length < 6) {
        window.BrigadaUI.showToast('A senha deve ter pelo menos 6 caracteres.', 'error');
        return;
      }

      const avatar = base64Avatar || name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      const payload = {
        name,
        email: currentUser.email,
        role: currentUser.role,
        status: currentUser.status,
        avatar,
        ...(password ? { password } : {})
      };

      try {
        await window.BrigadaData.updateUser(currentUser.id, payload);
        
        currentUser.name = name;
        currentUser.avatar = avatar;
        sessionStorage.setItem('brigada_user', JSON.stringify(currentUser));
        
        window.BrigadaRouter.updateUserInfo();

        window.BrigadaUI.showToast('Perfil atualizado com sucesso!', 'success');
        closeProfileModal();
      } catch (err) {
        window.BrigadaUI.showToast(err.message || 'Erro ao salvar alterações do perfil.', 'error');
      }
    });

    // Render page content
    const pageContainer = document.getElementById('page-container');
    this.renderPage(activePage, pageContainer);
  },

  renderPage(page, container) {
    const user = window.BrigadaAuth.currentUser;

    if (page === 'dashboard') {
      window.BrigadaDashboard.render(container, user.role);
    } else if (page === 'conciliacao') {
      if (window.BrigadaConciliacao) {
        window.BrigadaConciliacao.render(container);
      } else {
        container.innerHTML = `<div class="empty-state">Erro ao carregar conciliação</div>`;
      }
    } else if (page === 'catalog') {
      if (window.BrigadaCatalog) {
        window.BrigadaCatalog.render(container);
      } else {
        container.innerHTML = `
          <div class="empty-state" style="padding:4rem 2rem; text-align:center;">
            <div class="empty-state__icon" style="font-size: 3rem; margin-bottom: 1rem;">🔄</div>
            <h3 style="margin-bottom: 0.5rem; color: var(--text-primary);">Atualização Necessária</h3>
            <p style="color: var(--text-secondary); max-width: 400px; margin: 0 auto;">
              Uma nova versão do sistema está disponível. Por favor, faça uma <strong>atualização forçada (Ctrl + F5)</strong> ou feche e abra a aba novamente para carregar a nova tela de catálogo.
            </p>
          </div>
        `;
      }
    } else if (page === 'products') {
      if (!window.BrigadaAuth.hasSectorAccess('açougue')) {
        this.navigate('dashboard');
        return;
      }
      window.BrigadaProducts.render(container);
    } else if (page === 'product-list') {
      if (!window.BrigadaAuth.hasSectorAccess('açougue')) {
        this.navigate('dashboard');
        return;
      }
      window.BrigadaProductList.render(container);
    } else if (page === 'chambers') {
      if (!window.BrigadaAuth.hasSectorAccess('açougue') && !window.BrigadaAuth.hasSectorAccess('pereciveis')) {
        this.navigate('dashboard');
        return;
      }
      window.BrigadaChambers.render(container);
    } else if (page === 'pereciveis') {
      if (!window.BrigadaAuth.hasSectorAccess('pereciveis')) {
        this.navigate('dashboard');
        return;
      }
      window.BrigadaPereciveis.render(container);
    } else if (page === 'padaria') {
      if (!window.BrigadaAuth.hasSectorAccess('padaria')) {
        this.navigate('dashboard');
        return;
      }
      window.BrigadaPadaria.render(container);
    } else if (page === 'hortifruti') {
      if (!window.BrigadaAuth.hasSectorAccess('hortifruti')) {
        this.navigate('dashboard');
        return;
      }
      window.BrigadaHortifruti.render(container);
    } else if (page === 'mercearia') {
      if (!window.BrigadaAuth.hasSectorAccess('mercearia')) {
        this.navigate('dashboard');
        return;
      }
      window.BrigadaMercearia.render(container);
    } else if (page === 'users') {
      if (!window.BrigadaAuth.requireSuperAdmin()) return;
      window.BrigadaUsers.render(container);
    } else if (page === 'notifications') {
      window.BrigadaNotifications.render(container);
    } else if (page === 'produtos-sem-nota') {
      if (window.BrigadaProdutosSemNota) {
        window.BrigadaProdutosSemNota.render(container);
      } else {
        container.innerHTML = `<div class="empty-state">Erro ao carregar página de Produtos Sem Nota</div>`;
      }
    } else if (page === 'admin') {
      if (!window.BrigadaAuth.requireSuperAdmin()) return;
      this.renderAdminPanel(container);
    } else if (page === 'resumo-mensal') {
      if (!(window.BrigadaAuth.isSuperAdmin() || window.BrigadaAuth.isGestao() || window.BrigadaAuth.currentUser?.role === 'lider')) {
        this.navigate('dashboard');
        return;
      }
      if (window.BrigadaResumoMensal) {
        window.BrigadaResumoMensal.render(container);
      } else {
        container.innerHTML = `<div class="empty-state">Erro ao carregar resumo mensal</div>`;
      }
    }

    // Render active announcement banners for the user
    if (window.BrigadaBanners) {
      window.BrigadaBanners.renderUserBanners(container);
    }
  },

  renderAdminPanel(container) {
    const stats = window.BrigadaData.getStats();
    const products = window.BrigadaData.products;

    const byCategory = {
      aves: products.filter(p => p.category === 'aves').length,
      suino: products.filter(p => p.category === 'suino').length,
      bovino: products.filter(p => p.category === 'bovino').length,
      pescado: products.filter(p => p.category === 'pescado').length,
    };

    const criticalProducts = products
      .map(p => ({ ...p, _status: window.BrigadaData.getProductStatus(p) }))
      .filter(p => p._status.days < 0 || p._status.days === 0)
      .sort((a, b) => a._status.days - b._status.days);

    container.innerHTML = `
      <div class="panel-header">
        <div class="panel-header__left">
          <h2 class="panel-title">🛡️ Painel Super Admin</h2>
          <p class="panel-subtitle">Visão geral e controle total do sistema</p>
        </div>
        <span class="badge badge--superadmin" style="padding:0.4rem 0.8rem;font-size:0.8rem;">Super Admin</span>
      </div>

      <!-- Overview cards -->
      <div class="dashboard-grid dashboard-grid--3 stagger" style="margin-bottom:2rem;">
        <div class="metric-card">
          <div class="metric-card__icon">📦</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Total de Produtos</p>
            <p class="metric-card__value">${stats.total}</p>
            <p class="metric-card__sub">Nos 3 setores</p>
          </div>
        </div>
        <div class="metric-card metric-card--danger">
          <div class="metric-card__icon">🚨</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Críticos</p>
            <p class="metric-card__value">${stats.expired + stats.expiresToday}</p>
            <p class="metric-card__sub">${stats.expired} vencidos + ${stats.expiresToday} hoje</p>
          </div>
        </div>
        <div class="metric-card metric-card--success">
          <div class="metric-card__icon">👥</div>
          <div class="metric-card__body">
            <p class="metric-card__label">Usuários Ativos</p>
            <p class="metric-card__value">${stats.activeUsers} / ${stats.totalUsers}</p>
            <p class="metric-card__sub">No sistema</p>
          </div>
        </div>
      </div>

      <!-- Category breakdown -->
      <div class="dashboard-grid dashboard-grid--4 stagger" style="margin-bottom:2rem;">
        <div class="cat-overview-card cat-overview-card--aves">
          <div class="cat-overview-card__icon">🐔</div>
          <div class="cat-overview-card__body">
            <h3>Aves</h3>
            <p class="cat-count">${byCategory.aves} produtos</p>
            <div class="cat-status-row">
              <span class="badge badge--ok">${products.filter(p => p.category === 'aves' && window.BrigadaData.getProductStatus(p).days > 3).length} OK</span>
              <span class="badge badge--warning">${products.filter(p => p.category === 'aves' && window.BrigadaData.getProductStatus(p).days >= 0 && window.BrigadaData.getProductStatus(p).days <= 3).length} atenção</span>
              <span class="badge badge--expired">${products.filter(p => p.category === 'aves' && window.BrigadaData.getProductStatus(p).days < 0).length} vencido</span>
            </div>
          </div>
        </div>
        <div class="cat-overview-card cat-overview-card--suino">
          <div class="cat-overview-card__icon">🐷</div>
          <div class="cat-overview-card__body">
            <h3>Suíno</h3>
            <p class="cat-count">${byCategory.suino} produtos</p>
            <div class="cat-status-row">
              <span class="badge badge--ok">${products.filter(p => p.category === 'suino' && window.BrigadaData.getProductStatus(p).days > 3).length} OK</span>
              <span class="badge badge--warning">${products.filter(p => p.category === 'suino' && window.BrigadaData.getProductStatus(p).days >= 0 && window.BrigadaData.getProductStatus(p).days <= 3).length} atenção</span>
              <span class="badge badge--expired">${products.filter(p => p.category === 'suino' && window.BrigadaData.getProductStatus(p).days < 0).length} vencido</span>
            </div>
          </div>
        </div>
        <div class="cat-overview-card cat-overview-card--bovino">
          <div class="cat-overview-card__icon">🐮</div>
          <div class="cat-overview-card__body">
            <h3>Bovino</h3>
            <p class="cat-count">${byCategory.bovino} produtos</p>
            <div class="cat-status-row">
              <span class="badge badge--ok">${products.filter(p => p.category === 'bovino' && window.BrigadaData.getProductStatus(p).days > 3).length} OK</span>
              <span class="badge badge--warning">${products.filter(p => p.category === 'bovino' && window.BrigadaData.getProductStatus(p).days >= 0 && window.BrigadaData.getProductStatus(p).days <= 3).length} atenção</span>
              <span class="badge badge--expired">${products.filter(p => p.category === 'bovino' && window.BrigadaData.getProductStatus(p).days < 0).length} vencido</span>
            </div>
          </div>
        </div>
        <div class="cat-overview-card cat-overview-card--pescado">
          <div class="cat-overview-card__icon">🐟</div>
          <div class="cat-overview-card__body">
            <h3>Pescado</h3>
            <p class="cat-count">${byCategory.pescado} produtos</p>
            <div class="cat-status-row">
              <span class="badge badge--ok">${products.filter(p => p.category === 'pescado' && window.BrigadaData.getProductStatus(p).days > 3).length} OK</span>
              <span class="badge badge--warning">${products.filter(p => p.category === 'pescado' && window.BrigadaData.getProductStatus(p).days >= 0 && window.BrigadaData.getProductStatus(p).days <= 3).length} atenção</span>
              <span class="badge badge--expired">${products.filter(p => p.category === 'pescado' && window.BrigadaData.getProductStatus(p).days < 0).length} vencido</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Critical products -->
      <div class="glass-panel" style="margin-bottom:2rem;">
        <div class="glass-panel__header">
          <h3 class="glass-panel__title">🚨 Produtos Críticos</h3>
          <span class="badge badge--expired">${criticalProducts.length} produto${criticalProducts.length !== 1 ? 's' : ''}</span>
        </div>
        ${criticalProducts.length === 0 ? `
          <div class="empty-state" style="padding:2rem;"><div class="empty-state__icon">✅</div><p>Nenhum produto crítico!</p></div>
        ` : `
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr><th>PLU</th><th>Produto</th><th>Categoria</th><th>Validade</th><th>Status</th><th>Localização</th></tr>
              </thead>
              <tbody>
                ${criticalProducts.map(p => `
                  <tr>
                    <td data-label="PLU"><span class="plu-badge">${p.plu}</span></td>
                    <td data-label="Produto" class="product-name" onclick="window.BrigadaUI.showProductView('${p.id}')" style="cursor: pointer; text-decoration: underline; color: var(--primary);" title="Ver detalhes">${p.name}</td>
                    <td data-label="Categoria"><span class="cat-pill cat-pill--${p.category}">${p.category === 'aves' ? '🐔 Aves' : p.category === 'suino' ? '🐷 Suíno' : p.category === 'bovino' ? '🐮 Bovino' : '🐟 Pescado'}</span></td>
                    <td data-label="Validade">${window.BrigadaData.formatDate(p.endDate)}</td>
                    <td data-label="Status"><span class="badge ${p._status.class}">${p._status.icon} ${p._status.label}</span></td>
                    <td data-label="Localização">${p.location || '—'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>

      <!-- Quick actions -->
      <div class="glass-panel" style="margin-bottom:2rem;">
        <h3 class="glass-panel__title" style="margin-bottom:1rem;">⚡ Ações Rápidas</h3>
        <div class="quick-actions">
          <button class="quick-action-btn" id="qa-dashboard">
            <span class="quick-action-btn__icon">📊</span>
            <span>Ir ao Dashboard</span>
          </button>
          <button class="quick-action-btn" id="qa-products">
            <span class="quick-action-btn__icon">📦</span>
            <span>Gestão de Produtos</span>
          </button>
          <button class="quick-action-btn" id="qa-users">
            <span class="quick-action-btn__icon">👥</span>
            <span>Gestão de Usuários</span>
          </button>
          <button class="quick-action-btn" id="qa-notifications">
            <span class="quick-action-btn__icon">🔔</span>
            <span>Notificações</span>
          </button>
        </div>
      </div>

      <!-- Gestão de Usuários integrada -->
      <div class="glass-panel" style="margin-bottom:2rem;">
        <div id="admin-users-wrapper"></div>
      </div>
    `;

    container.querySelector('#qa-dashboard')?.addEventListener('click', () => this.navigate('dashboard'));
    container.querySelector('#qa-products')?.addEventListener('click', () => this.navigate('products'));
    container.querySelector('#qa-users')?.addEventListener('click', () => this.navigate('users'));
    container.querySelector('#qa-notifications')?.addEventListener('click', () => this.navigate('notifications'));

    // Renderiza a Gestão de Usuários diretamente no Painel do Administrador
    const adminUsersWrapper = container.querySelector('#admin-users-wrapper');
    if (adminUsersWrapper) {
      window.BrigadaUsers.render(adminUsersWrapper);
    }
  },

  updateUserInfo() {
    const user = window.BrigadaAuth.currentUser;
    const elName = document.getElementById('sidebar-user-name');
    if (elName && user) elName.textContent = user.name;
    const elAvatar = document.getElementById('sidebar-user-avatar');
    if (elAvatar && user) {
      const hasImage = user.avatar && (user.avatar.startsWith('data:image/') || user.avatar.startsWith('http'));
      if (hasImage) {
        elAvatar.innerHTML = `<img src="${user.avatar}" alt="${user.name}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
        elAvatar.style.background = 'none';
      } else {
        elAvatar.textContent = user.avatar;
        elAvatar.style.background = this.avatarColor(user.name);
      }
    }
  },

  avatarColor(name) {
    const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#14b8a6', '#f59e0b', '#ef4444'];
    let hash = 0;
    for (let c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  },
};

// ── Banners & Recados Display Engine ───────────────────────────────────────
window.BrigadaBanners = {
  async renderUserBanners(container) {
    const user = window.BrigadaAuth.currentUser;
    if (!user || !container) return;

    try {
      const rawBanners = await window.BrigadaData.loadSettings('banners');
      const banners = Array.isArray(rawBanners) ? rawBanners : [];
      if (banners.length === 0) return;

      const activeBanners = banners.filter(b => {
        if (!b.active) return false;
        if (sessionStorage.getItem(`dismissed_banner_${b.id}`)) return false;

        // Target matching
        if (b.targetType === 'all') return true;
        if (b.targetType === 'sector') {
          if (!b.targetValue) return true;
          return user.sector === 'todos' || user.sector === b.targetValue;
        }
        if (b.targetType === 'user') {
          return String(user.id) === String(b.targetValue) || user.email === b.targetValue;
        }
        return false;
      });

      if (activeBanners.length === 0) return;

      let wrapper = container.querySelector('#app-announcement-banners');
      if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.id = 'app-announcement-banners';
        wrapper.style.cssText = 'margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; width: 100%;';
        container.insertBefore(wrapper, container.firstChild);
      } else {
        wrapper.innerHTML = '';
      }

      wrapper.innerHTML = activeBanners.map(b => this._renderBannerCard(b)).join('');

      wrapper.querySelectorAll('.btn-close-banner').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const card = e.currentTarget.closest('.announcement-banner');
          const bannerId = btn.dataset.id;
          sessionStorage.setItem(`dismissed_banner_${bannerId}`, 'true');
          if (card) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(-10px)';
            setTimeout(() => card.remove(), 250);
          }
        });
      });
    } catch (err) {
      console.warn('Erro ao carregar banners de aviso:', err);
    }
  },

  _renderBannerCard(b) {
    const typeConfig = {
      info:    { icon: 'ℹ️', color: '#818cf8', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)' },
      warning: { icon: '⚠️', color: '#fbbf24', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
      alert:   { icon: '🚨', color: '#f87171', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' },
      success: { icon: '✅', color: '#4ade80', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)' }
    }[b.type || 'info'] || { icon: '📌', color: '#818cf8', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)' };

    let targetLabel = '🌐 Todos os Usuários';
    if (b.targetType === 'sector') {
      const sectorNames = { açougue: '🥩 Açougue', padaria: '🍞 Padaria', hortifruti: '🥬 Hortifruti', mercearia: '🛒 Mercearia', pereciveis: '🧊 Perecíveis' };
      targetLabel = `🏢 Setor: ${sectorNames[b.targetValue] || b.targetValue}`;
    } else if (b.targetType === 'user') {
      targetLabel = `👤 Exclusivo para Você`;
    }

    return `
      <div class="announcement-banner" style="
        background: ${typeConfig.bg};
        border: 1px solid ${typeConfig.border};
        border-left: 4px solid ${typeConfig.color};
        border-radius: 12px; padding: 1.1rem 1.25rem;
        position: relative; transition: all 0.3s ease;
        box-shadow: 0 8px 24px rgba(0,0,0,0.15); backdrop-filter: blur(10px);
        animation: fadeInDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      ">
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem;">
          <div style="display: flex; gap: 0.85rem; align-items: flex-start; flex: 1;">
            <span style="font-size: 1.5rem; line-height: 1; flex-shrink: 0; margin-top: 2px;">${typeConfig.icon}</span>
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem; flex-wrap: wrap;">
                <h4 style="margin: 0; font-size: 0.95rem; font-weight: 700; color: var(--text-primary);">${b.title || 'Recado Importante'}</h4>
                <span class="badge" style="font-size: 0.68rem; padding: 0.15rem 0.5rem; background: ${typeConfig.color}25; color: ${typeConfig.color}; border: 1px solid ${typeConfig.color}40;">
                  ${targetLabel}
                </span>
              </div>
              <div style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5; white-space: pre-line;">${b.message || ''}</div>
              ${b.createdAt ? `<div style="font-size: 0.72rem; color: var(--text-tertiary); margin-top: 0.5rem;">Publicado em ${new Date(b.createdAt).toLocaleDateString('pt-BR')} ${b.authorName ? 'por ' + b.authorName : ''}</div>` : ''}
            </div>
          </div>
          <button type="button" class="btn-close-banner" data-id="${b.id}" title="Fechar recado" style="
            background: transparent; border: none; color: var(--text-tertiary); font-size: 1.2rem;
            cursor: pointer; padding: 0.2rem 0.5rem; border-radius: 6px; line-height: 1;
            transition: all 0.2s ease;
          " onmouseover="this.style.color='var(--text-primary)'; this.style.background='rgba(255,255,255,0.1)';" onmouseout="this.style.color='var(--text-tertiary)'; this.style.background='transparent';">
            ✕
          </button>
        </div>
      </div>
    `;
  }
};

// ── Bootstrap ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  window.BrigadaRouter.init();
});

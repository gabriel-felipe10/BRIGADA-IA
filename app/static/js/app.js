/**
 * BRIGADA-IA — Main App Router & UI System
 * Painel Super Admin · Gestão de Usuários · Brigada de Validade
 */

// ── UI Helpers ────────────────────────────────────────────────────────────────
window.BrigadaUI = {
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
};

// ── Router ────────────────────────────────────────────────────────────────────
window.BrigadaRouter = {
  currentPage: null,

  async init() {
    window.BrigadaAuth.init();
    
    await window.BrigadaData.load();
    
    if (window.BrigadaAuth.isLoggedIn()) {
      this.navigate('dashboard');
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
        <div class="login-bg">
          <div class="login-blob login-blob--1"></div>
          <div class="login-blob login-blob--2"></div>
          <div class="login-blob login-blob--3"></div>
        </div>
        <div class="login-card">
          <div class="login-logo">
            <img src="/static/icon.jpg" alt="Logo" style="width: 72px; height: 72px; border-radius: 16px; object-fit: cover; margin-bottom: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.3); border: 2px solid rgba(255,255,255,0.08);">
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
  },

  // ── App Shell (sidebar layout) ────────────────────────────────────────────
  renderShell(root, activePage) {
    const user = window.BrigadaAuth.currentUser;
    const isSuperAdmin = window.BrigadaAuth.isSuperAdmin();
    const avatarColor = this.avatarColor(user.name);
    const hasImageAvatar = user.avatar && (user.avatar.startsWith('data:image/') || user.avatar.startsWith('http'));
    const avatarHTML = hasImageAvatar ? `<img src="${user.avatar}" alt="${user.name}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">` : user.avatar;

    root.innerHTML = `
      <div class="app-shell">
        <!-- Sidebar Overlay -->
        <div class="sidebar-overlay" id="sidebar-overlay"></div>
        <!-- Sidebar -->
        <aside class="sidebar" id="sidebar">
          <div class="sidebar__brand">
            <img src="/static/icon.jpg" alt="Logo" style="width: 32px; height: 32px; border-radius: 8px; object-fit: cover; margin-right: 8px; border: 1px solid rgba(255,255,255,0.08);">
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
            <a class="sidebar__link ${activePage === 'products' ? 'sidebar__link--active' : ''}" data-page="products" href="#">
              <span class="sidebar__link-icon">📦</span>
              <span>Produtos</span>
            </a>
            ${isSuperAdmin ? `
            <div class="sidebar__section-label">Administração</div>
            <a class="sidebar__link ${activePage === 'users' ? 'sidebar__link--active' : ''}" data-page="users" href="#">
              <span class="sidebar__link-icon">👥</span>
              <span>Usuários</span>
            </a>
            <a class="sidebar__link ${activePage === 'notifications' ? 'sidebar__link--active' : ''}" data-page="notifications" href="#">
              <span class="sidebar__link-icon">🔔</span>
              <span>Notificações</span>
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
                <p class="sidebar__user-role">${isSuperAdmin ? '🛡️ Super Admin' : window.BrigadaAuth.isGestao() ? '👥 Gestão' : '👤 Usuário'}</p>
              </div>
            </div>
            <button class="btn-logout" id="btn-logout" title="Sair do Sistema">
              <span>🚪</span> Sair do Sistema
            </button>
          </div>
        </aside>

        <!-- Mobile menu toggle -->
        <button class="mobile-menu-btn" id="mobile-menu-btn">☰</button>

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

    // Helper to close sidebar on mobile
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const closeSidebar = () => {
      sidebar?.classList.remove('sidebar--open');
      overlay?.classList.remove('sidebar-overlay--visible');
    };

    // Nav links
    root.querySelectorAll('.sidebar__link[data-page]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        closeSidebar();
        this.navigate(link.dataset.page);
      });
    });

    // Logout
    document.getElementById('btn-logout')?.addEventListener('click', () => {
      closeSidebar();
      window.BrigadaAuth.logout();
      window.BrigadaUI.showToast('Até logo! 👋', 'success');
      this.navigate('login');
    });

    // Mobile menu
    document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
      sidebar?.classList.toggle('sidebar--open');
      overlay?.classList.toggle('sidebar-overlay--visible');
    });

    // Close on overlay click
    overlay?.addEventListener('click', closeSidebar);

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
    } else if (page === 'products') {
      window.BrigadaProducts.render(container);
    } else if (page === 'users') {
      if (!window.BrigadaAuth.requireSuperAdmin()) return;
      window.BrigadaUsers.render(container);
    } else if (page === 'notifications') {
      if (!window.BrigadaAuth.requireSuperAdmin()) return;
      window.BrigadaNotifications.render(container);
    } else if (page === 'admin') {
      if (!window.BrigadaAuth.requireSuperAdmin()) return;
      this.renderAdminPanel(container);
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
                    <td data-label="Produto" class="product-name">${p.name}</td>
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

// ── Bootstrap ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  window.BrigadaRouter.init();
});

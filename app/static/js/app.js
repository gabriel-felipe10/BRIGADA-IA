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
    
    // Mostra tela de carregamento do banco de dados (Supabase)
    const root = document.getElementById('app-root');
    if (root) {
      root.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#060918;color:#fff;font-family:var(--font-family, sans-serif);">
          <div style="border:3px solid rgba(255,255,255,0.1);border-left-color:var(--primary, #8b5cf6);border-radius:50%;width:36px;height:36px;animation:spin-db 1s linear infinite;margin-bottom:1rem;"></div>
          <p style="color:var(--text-secondary, rgba(255,255,255,0.6));font-size:0.9rem;letter-spacing:0.5px;">Conectando ao Supabase...</p>
        </div>
        <style>
          @keyframes spin-db { to { transform: rotate(360deg); } }
        </style>
      `;
    }
    
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
            <span class="login-logo__icon">🛡️</span>
            <h1 class="login-logo__title">BRIGADA-IA</h1>
            <p class="login-logo__sub">Sistema de Validade · Açougue Varejo</p>
          </div>
          <form id="login-form" class="login-form">
            <div class="form-group">
              <label class="form-label">E-mail</label>
              <input type="email" id="login-email" class="form-input" placeholder="seu@email.com" autocomplete="email" required>
            </div>
            <div class="form-group">
              <label class="form-label">Senha</label>
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
          <div class="login-hints">
            <p class="login-hints__title">Contas de teste:</p>
            <div class="login-hint" data-email="admin@brigada.com" data-pwd="admin123">
              <span>🛡️ Super Admin</span>
              <span class="login-hint__cred">admin@brigada.com / admin123</span>
            </div>
            <div class="login-hint" data-email="marcos@brigada.com" data-pwd="123456">
              <span>👤 Usuário</span>
              <span class="login-hint__cred">marcos@brigada.com / 123456</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Toggle password
    document.getElementById('toggle-password')?.addEventListener('click', () => {
      const input = document.getElementById('login-password');
      input.type = input.type === 'password' ? 'text' : 'password';
    });

    // Quick fill hints
    root.querySelectorAll('.login-hint').forEach(hint => {
      hint.style.cursor = 'pointer';
      hint.addEventListener('click', () => {
        document.getElementById('login-email').value = hint.dataset.email;
        document.getElementById('login-password').value = hint.dataset.pwd;
      });
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

    root.innerHTML = `
      <div class="app-shell">
        <!-- Sidebar -->
        <aside class="sidebar" id="sidebar">
          <div class="sidebar__brand">
            <span class="sidebar__logo">🛡️</span>
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
            <a class="sidebar__link ${activePage === 'admin' ? 'sidebar__link--active' : ''}" data-page="admin" href="#">
              <span class="sidebar__link-icon">🛡️</span>
              <span>Super Admin</span>
            </a>
            ` : ''}
          </nav>

          <div class="sidebar__footer">
            <div class="sidebar__user">
              <div class="sidebar__avatar" style="background:${avatarColor}">${user.avatar}</div>
              <div class="sidebar__user-info">
                <p class="sidebar__user-name" id="sidebar-user-name">${user.name}</p>
                <p class="sidebar__user-role">${isSuperAdmin ? '🛡️ Super Admin' : '👤 Usuário'}</p>
              </div>
            </div>
            <button class="btn-logout" id="btn-logout" title="Sair">🚪</button>
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
    `;

    // Nav links
    root.querySelectorAll('.sidebar__link[data-page]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigate(link.dataset.page);
      });
    });

    // Logout
    document.getElementById('btn-logout')?.addEventListener('click', () => {
      window.BrigadaAuth.logout();
      window.BrigadaUI.showToast('Até logo! 👋', 'success');
      this.navigate('login');
    });

    // Mobile menu
    document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
      document.getElementById('sidebar')?.classList.toggle('sidebar--open');
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
      <div class="dashboard-grid dashboard-grid--3 stagger" style="margin-bottom:2rem;">
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
                    <td><span class="plu-badge">${p.plu}</span></td>
                    <td class="product-name">${p.name}</td>
                    <td><span class="cat-pill cat-pill--${p.category}">${p.category === 'aves' ? '🐔 Aves' : p.category === 'suino' ? '🐷 Suíno' : '🐟 Pescado'}</span></td>
                    <td>${window.BrigadaData.formatDate(p.endDate)}</td>
                    <td><span class="badge ${p._status.class}">${p._status.icon} ${p._status.label}</span></td>
                    <td>${p.location || '—'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>

      <!-- Quick actions -->
      <div class="glass-panel">
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
        </div>
      </div>
    `;

    container.querySelector('#qa-dashboard')?.addEventListener('click', () => this.navigate('dashboard'));
    container.querySelector('#qa-products')?.addEventListener('click', () => this.navigate('products'));
    container.querySelector('#qa-users')?.addEventListener('click', () => this.navigate('users'));
  },

  updateUserInfo() {
    const user = window.BrigadaAuth.currentUser;
    const el = document.getElementById('sidebar-user-name');
    if (el && user) el.textContent = user.name;
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

/**
 * BRIGADA-IA — Authentication Module
 */

window.BrigadaAuth = {
  currentUser: null,

  init() {
    // Verifica sessão salva
    const saved = sessionStorage.getItem('brigada_user');
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
      } catch (e) {
        sessionStorage.removeItem('brigada_user');
      }
    }
  },

  async login(email, password) {
    const user = window.BrigadaData.users.find(
      u => u.email === email && u.password === password
    );
    if (!user) return { success: false, message: 'E-mail ou senha incorretos.' };

    if (user.status !== 'active') {
      return { success: false, message: 'Usuário bloqueado. Fale com o admin para desbloquear.' };
    }

    // Salva sessão (sem senha)
    this.currentUser = { ...user };
    delete this.currentUser.password;
    sessionStorage.setItem('brigada_user', JSON.stringify(this.currentUser));
    // Atualiza lastLogin no DB via API
    const now = new Date().toISOString();
    await window.BrigadaData.updateUser(user.id, { lastLogin: now });
    return { success: true, user: this.currentUser };
  },

  logout() {
    this.currentUser = null;
    sessionStorage.removeItem('brigada_user');
  },

  isLoggedIn() {
    return !!this.currentUser;
  },

  isSuperAdmin() {
    return this.currentUser?.role === 'superadmin';
  },

  isGestao() {
    return this.currentUser?.role === 'gestao';
  },

  hasSectorAccess(sector) {
    if (!this.currentUser) return false;
    const email = this.currentUser.email.toLowerCase();
    if (email === 'admin@brigada.com' || email === 'marcos@brigada.com' || this.isSuperAdmin()) {
      return true;
    }
    return this.currentUser.sector === sector || this.currentUser.sector === 'todos';
  },

  canAddProduct() {
    return this.currentUser?.role === 'superadmin' || this.currentUser?.role === 'user';
  },

  canEditOrDeleteProduct() {
    return this.currentUser?.role === 'superadmin';
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      window.BrigadaRouter.navigate('login');
      return false;
    }
    return true;
  },

  requireSuperAdmin() {
    if (!this.isLoggedIn()) {
      window.BrigadaRouter.navigate('login');
      return false;
    }
    if (!this.isSuperAdmin()) {
      window.BrigadaRouter.navigate('dashboard');
      return false;
    }
    return true;
  },
};

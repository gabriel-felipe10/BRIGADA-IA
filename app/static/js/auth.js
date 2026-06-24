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

  login(email, password) {
    const user = window.BrigadaData.users.find(
      u => u.email === email && u.password === password && u.status === 'active'
    );
    if (!user) return { success: false, message: 'E-mail ou senha incorretos.' };
    // Salva sessão (sem senha)
    this.currentUser = { ...user };
    delete this.currentUser.password;
    sessionStorage.setItem('brigada_user', JSON.stringify(this.currentUser));
    // Atualiza lastLogin no DB
    const idx = window.BrigadaData.users.findIndex(u => u.id === user.id);
    if (idx !== -1) window.BrigadaData.users[idx].lastLogin = new Date().toISOString();
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

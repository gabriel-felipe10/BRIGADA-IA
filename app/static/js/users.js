/**
 * BRIGADA-IA — Users Management Module
 */

window.BrigadaUsers = {
  editingId: null,

  render(container) {
    container.innerHTML = this.buildHTML();
    this.bindEvents(container);
    this.renderTable(container);
  },

  buildHTML() {
    return `
      <div class="panel-header">
        <div class="panel-header__left">
          <h2 class="panel-title">👥 Gestão de Usuários</h2>
          <p class="panel-subtitle">Administre os acessos ao sistema</p>
        </div>
        <button class="btn btn--primary" id="btn-add-user">
          <span>＋</span> Novo Usuário
        </button>
      </div>

      <div class="toolbar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" id="search-users" class="search-input" placeholder="Buscar por nome ou e-mail...">
        </div>
        <div class="toolbar-right">
          <select id="filter-role" class="select-control">
            <option value="all">Todos os perfis</option>
            <option value="superadmin">🛡️ Super Admin</option>
            <option value="user">👤 Usuário</option>
          </select>
          <select id="filter-user-status" class="select-control">
            <option value="all">Todos os status</option>
            <option value="active">✅ Ativo</option>
            <option value="inactive">⛔ Inativo</option>
          </select>
        </div>
      </div>

      <div id="users-table-wrapper" class="table-wrapper">
        <!-- tabela renderizada dinamicamente -->
      </div>

      <!-- Modal de usuário -->
      <div class="modal-overlay" id="user-modal" style="display:none;">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title" id="user-modal-title">Novo Usuário</h3>
            <button class="modal-close" id="user-modal-close">✕</button>
          </div>
          <div class="modal-body">
            <form id="user-form">
              <input type="hidden" id="user-field-id">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Nome Completo *</label>
                  <input type="text" id="user-field-name" class="form-input" placeholder="Nome do usuário" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Perfil *</label>
                  <select id="user-field-role" class="form-input" required>
                    <option value="user">👤 Usuário</option>
                    <option value="superadmin">🛡️ Super Admin</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">E-mail *</label>
                <input type="email" id="user-field-email" class="form-input" placeholder="email@brigada.com" required>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label" id="user-pwd-label">Senha *</label>
                  <input type="password" id="user-field-password" class="form-input" placeholder="Mínimo 6 caracteres">
                </div>
                <div class="form-group">
                  <label class="form-label">Status</label>
                  <select id="user-field-status" class="form-input">
                    <option value="active">✅ Ativo</option>
                    <option value="inactive">⛔ Inativo</option>
                  </select>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn--ghost" id="btn-cancel-user-modal">Cancelar</button>
            <button class="btn btn--primary" id="btn-save-user">Salvar Usuário</button>
          </div>
        </div>
      </div>

      <!-- Modal de confirmação de exclusão -->
      <div class="modal-overlay" id="delete-user-modal" style="display:none;">
        <div class="modal modal--sm">
          <div class="modal-header">
            <h3 class="modal-title">⚠️ Confirmar Exclusão</h3>
            <button class="modal-close" id="delete-user-modal-close">✕</button>
          </div>
          <div class="modal-body">
            <p style="color:var(--text-secondary);">Tem certeza que deseja remover o usuário <strong id="delete-user-name" style="color:var(--text-primary);"></strong>?</p>
            <p style="color:var(--error);font-size:0.85rem;margin-top:0.5rem;">Esta ação não pode ser desfeita.</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn--ghost" id="btn-cancel-delete-user">Cancelar</button>
            <button class="btn btn--danger" id="btn-confirm-delete-user">Excluir</button>
          </div>
        </div>
      </div>
    `;
  },

  getFilteredUsers() {
    let users = window.BrigadaData.users;
    const searchInput = document.getElementById('search-users');
    const roleFilter = document.getElementById('filter-role');
    const statusFilter = document.getElementById('filter-user-status');

    if (searchInput?.value) {
      const q = searchInput.value.toLowerCase();
      users = users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    if (roleFilter?.value !== 'all') {
      users = users.filter(u => u.role === roleFilter.value);
    }
    if (statusFilter?.value !== 'all') {
      users = users.filter(u => u.status === statusFilter.value);
    }
    return users;
  },

  renderTable(container) {
    const wrapper = container.querySelector('#users-table-wrapper');
    if (!wrapper) return;

    const users = this.getFilteredUsers();

    if (users.length === 0) {
      wrapper.innerHTML = `<div class="empty-state"><div class="empty-state__icon">👥</div><p class="empty-state__text">Nenhum usuário encontrado</p></div>`;
      return;
    }

    const roleLabel = { superadmin: '🛡️ Super Admin', user: '👤 Usuário' };
    const roleClass = { superadmin: 'badge--superadmin', user: 'badge--user-role' };

    const rows = users.map(u => {
      const isCurrentUser = u.id === window.BrigadaAuth.currentUser?.id;
      return `
        <tr>
          <td>
            <div class="user-cell">
              <div class="user-avatar" style="background: ${this.avatarColor(u.name)}">${u.avatar}</div>
              <div>
                <div class="user-name">${u.name} ${isCurrentUser ? '<span class="badge badge--you">Você</span>' : ''}</div>
                <div class="user-email">${u.email}</div>
              </div>
            </div>
          </td>
          <td><span class="badge ${roleClass[u.role]}">${roleLabel[u.role]}</span></td>
          <td><span class="badge ${u.status === 'active' ? 'badge--ok' : 'badge--expired'}">${u.status === 'active' ? '✅ Ativo' : '⛔ Inativo'}</span></td>
          <td>${window.BrigadaData.formatDate(u.createdAt)}</td>
          <td>${window.BrigadaData.formatDateTime(u.lastLogin)}</td>
          <td class="actions-cell">
            <button class="btn-icon btn-icon--edit" data-action="edit-user" data-id="${u.id}" title="Editar">✏️</button>
            ${!isCurrentUser ? `<button class="btn-icon btn-icon--delete" data-action="delete-user" data-id="${u.id}" title="Excluir">🗑️</button>` : ''}
          </td>
        </tr>`;
    }).join('');

    wrapper.innerHTML = `
      <div class="results-info">${users.length} usuário${users.length !== 1 ? 's' : ''} encontrado${users.length !== 1 ? 's' : ''}</div>
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Perfil</th>
              <th>Status</th>
              <th>Cadastrado em</th>
              <th>Último Acesso</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;

    wrapper.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const id = parseInt(btn.dataset.id);
        if (action === 'edit-user') this.openEditModal(id, container);
        if (action === 'delete-user') this.openDeleteModal(id, container);
      });
    });
  },

  avatarColor(name) {
    const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#14b8a6', '#f59e0b', '#ef4444'];
    let hash = 0;
    for (let c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  },

  bindEvents(container) {
    container.querySelector('#search-users')?.addEventListener('input', () => this.renderTable(container));
    container.querySelector('#filter-role')?.addEventListener('change', () => this.renderTable(container));
    container.querySelector('#filter-user-status')?.addEventListener('change', () => this.renderTable(container));

    container.querySelector('#btn-add-user')?.addEventListener('click', () => this.openAddModal(container));

    container.querySelector('#user-modal-close')?.addEventListener('click', () => this.closeModal(container));
    container.querySelector('#btn-cancel-user-modal')?.addEventListener('click', () => this.closeModal(container));
    container.querySelector('#btn-save-user')?.addEventListener('click', () => this.saveUser(container));

    container.querySelector('#delete-user-modal-close')?.addEventListener('click', () => this.closeDeleteModal(container));
    container.querySelector('#btn-cancel-delete-user')?.addEventListener('click', () => this.closeDeleteModal(container));
    container.querySelector('#btn-confirm-delete-user')?.addEventListener('click', () => this.confirmDelete(container));

    container.querySelector('#user-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'user-modal') this.closeModal(container);
    });
    container.querySelector('#delete-user-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'delete-user-modal') this.closeDeleteModal(container);
    });
  },

  openAddModal(container) {
    this.editingId = null;
    container.querySelector('#user-modal-title').textContent = 'Novo Usuário';
    container.querySelector('#user-form').reset();
    container.querySelector('#user-field-id').value = '';
    container.querySelector('#user-pwd-label').textContent = 'Senha *';
    this.showModal(container);
  },

  openEditModal(id, container) {
    const user = window.BrigadaData.users.find(u => u.id === id);
    if (!user) return;
    this.editingId = id;
    container.querySelector('#user-modal-title').textContent = 'Editar Usuário';
    container.querySelector('#user-field-id').value = user.id;
    container.querySelector('#user-field-name').value = user.name;
    container.querySelector('#user-field-email').value = user.email;
    container.querySelector('#user-field-role').value = user.role;
    container.querySelector('#user-field-status').value = user.status;
    container.querySelector('#user-field-password').value = '';
    container.querySelector('#user-pwd-label').textContent = 'Nova Senha (deixe em branco para manter)';
    this.showModal(container);
  },

  showModal(container) {
    const modal = container.querySelector('#user-modal');
    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('modal-overlay--visible'));
  },

  closeModal(container) {
    const modal = container.querySelector('#user-modal');
    modal.classList.remove('modal-overlay--visible');
    setTimeout(() => modal.style.display = 'none', 250);
  },

  openDeleteModal(id, container) {
    const user = window.BrigadaData.users.find(u => u.id === id);
    if (!user) return;
    this.deletingId = id;
    container.querySelector('#delete-user-name').textContent = user.name;
    const modal = container.querySelector('#delete-user-modal');
    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('modal-overlay--visible'));
  },

  closeDeleteModal(container) {
    const modal = container.querySelector('#delete-user-modal');
    modal.classList.remove('modal-overlay--visible');
    setTimeout(() => modal.style.display = 'none', 250);
  },

  async saveUser(container) {
    const name = container.querySelector('#user-field-name').value.trim();
    const email = container.querySelector('#user-field-email').value.trim();
    const role = container.querySelector('#user-field-role').value;
    const status = container.querySelector('#user-field-status').value;
    const password = container.querySelector('#user-field-password').value;

    if (!name || !email || !role) {
      window.BrigadaUI.showToast('Preencha todos os campos obrigatórios.', 'error');
      return;
    }

    if (!this.editingId && !password) {
      window.BrigadaUI.showToast('Informe uma senha para o novo usuário.', 'error');
      return;
    }

    if (password && password.length < 6) {
      window.BrigadaUI.showToast('A senha deve ter pelo menos 6 caracteres.', 'error');
      return;
    }

    // Check duplicate email
    const duplicate = window.BrigadaData.users.find(u => u.email === email && u.id !== this.editingId);
    if (duplicate) {
      window.BrigadaUI.showToast('Este e-mail já está em uso.', 'error');
      return;
    }

    const avatar = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const payload = {
      name, email, role, status, avatar,
      ...(password ? { password } : {})
    };

    if (this.editingId) {
      await window.BrigadaData.updateUser(this.editingId, payload);
      // Update current user session if editing self
      if (this.editingId === window.BrigadaAuth.currentUser?.id) {
        window.BrigadaAuth.currentUser.name = name;
        sessionStorage.setItem('brigada_user', JSON.stringify(window.BrigadaAuth.currentUser));
        window.BrigadaRouter.updateUserInfo();
      }
      window.BrigadaUI.showToast('Usuário atualizado com sucesso!', 'success');
    } else {
      await window.BrigadaData.addUser(payload);
      window.BrigadaUI.showToast('Usuário cadastrado com sucesso!', 'success');
    }

    this.closeModal(container);
    this.renderTable(container);
  },

  async confirmDelete(container) {
    await window.BrigadaData.deleteUser(this.deletingId);
    window.BrigadaUI.showToast('Usuário removido.', 'success');
    this.closeDeleteModal(container);
    this.renderTable(container);
  },
};

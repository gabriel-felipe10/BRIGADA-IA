/**
 * BRIGADA-IA — Versículo do Dia
 * Modal premium de boas-vindas com versículo bíblico diário.
 * Exibido apenas uma vez por dia, na primeira abertura do app.
 */

window.BrigadaVerseOfTheDay = {
  _modalVisible: false,

  /**
   * Inicializa o sistema de versículo do dia.
   * Verifica se já foi exibido hoje. Se não, busca e exibe.
   */
  async init() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const lastShown = localStorage.getItem('brigada_votd_date');

      if (lastShown === today) {
        console.log('[VOTD] Versículo já exibido hoje.');
        return;
      }

      const response = await fetch('/api/bible/verse-of-the-day');
      if (!response.ok) {
        console.warn('[VOTD] Falha ao buscar versículo do dia:', response.status);
        return;
      }

      const verse = await response.json();
      if (!verse || !verse.text) {
        console.warn('[VOTD] Versículo recebido é inválido:', verse);
        return;
      }

      // Pequeno delay para a interface principal carregar antes
      setTimeout(() => {
        this.showModal(verse);
        localStorage.setItem('brigada_votd_date', today);
      }, 800);

    } catch (err) {
      console.error('[VOTD] Erro ao inicializar versículo do dia:', err);
    }
  },

  /**
   * Retorna saudação dinâmica baseada no horário atual.
   */
  getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: 'Bom dia', emoji: '☀️' };
    if (hour >= 12 && hour < 18) return { text: 'Boa tarde', emoji: '🌤️' };
    return { text: 'Boa noite', emoji: '🌙' };
  },

  /**
   * Retorna o primeiro nome do usuário logado.
   */
  getUserFirstName() {
    const user = window.BrigadaAuth?.currentUser;
    if (!user?.name) return '';
    return user.name.split(' ')[0];
  },

  /**
   * Exibe o modal premium de boas-vindas com o versículo.
   */
  showModal(verse) {
    if (this._modalVisible) return;
    this._modalVisible = true;

    const greeting = this.getGreeting();
    const firstName = this.getUserFirstName();
    const greetingLine = firstName
      ? `${greeting.emoji} ${greeting.text}, ${firstName}!`
      : `${greeting.emoji} ${greeting.text}!`;

    // Criar overlay
    const overlay = document.createElement('div');
    overlay.id = 'votd-overlay';
    overlay.className = 'votd-overlay';

    overlay.innerHTML = `
      <div class="votd-modal">
        <!-- Decoração de fundo -->
        <div class="votd-bg-glow"></div>
        <div class="votd-bg-cross">✝</div>

        <!-- Conteúdo -->
        <div class="votd-content">
          <!-- Saudação -->
          <p class="votd-greeting">${greetingLine}</p>

          <!-- Frase motivacional -->
          <div class="votd-phrase">
            <span class="votd-phrase__quote">"</span>
            <p class="votd-phrase__text">Não se preocupe...<br>Vai dar certo.</p>
            <span class="votd-phrase__quote votd-phrase__quote--end">"</span>
          </div>

          <!-- Separador decorativo -->
          <div class="votd-divider">
            <span class="votd-divider__line"></span>
            <span class="votd-divider__icon">📖</span>
            <span class="votd-divider__line"></span>
          </div>

          <!-- Versículo -->
          <div class="votd-verse">
            <p class="votd-verse__text">"${this._escapeHtml(verse.text)}"</p>
            <p class="votd-verse__reference">— ${this._escapeHtml(verse.reference || `${verse.book} ${verse.chapter}:${verse.verse}`)}</p>
          </div>

          <!-- Botão -->
          <button class="votd-btn" id="votd-close-btn">
            <span>Amém</span>
            <span class="votd-btn__emoji">🙏</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Animação de entrada
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.classList.add('votd-overlay--visible');
      });
    });

    // Evento de fechar
    const closeBtn = overlay.querySelector('#votd-close-btn');
    closeBtn.addEventListener('click', () => this.closeModal());

    // Fechar ao clicar fora do modal
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.closeModal();
    });

    // Fechar com Escape
    this._escHandler = (e) => {
      if (e.key === 'Escape') this.closeModal();
    };
    document.addEventListener('keydown', this._escHandler);
  },

  /**
   * Fecha o modal com animação.
   */
  closeModal() {
    const overlay = document.getElementById('votd-overlay');
    if (!overlay) return;

    overlay.classList.remove('votd-overlay--visible');
    overlay.classList.add('votd-overlay--closing');

    if (this._escHandler) {
      document.removeEventListener('keydown', this._escHandler);
      this._escHandler = null;
    }

    setTimeout(() => {
      overlay.remove();
      this._modalVisible = false;
    }, 400);
  },

  /**
   * Escape HTML para prevenir XSS.
   */
  _escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};

/**
 * BRIGADA-IA — Central de Notificações v2.5
 * - Gerenciamento de Instância WhatsApp (Pastorini API)
 * - Disparo em Massa por Setor
 * - Recados & Banners de Avisos (por Usuário, Setor ou Todos)
 * - Regras de Alertas Automáticos
 * - Notificações Push do Navegador
 */
window.BrigadaNotifications = {
  config: null,
  bannersList: [],
  pollingIntervals: {},
  activeTab: 'instance',
  selectedSectors: new Set(),
  excludedRecipients: new Set(),
  editingBannerId: null,

  SECTORS: [
    { id: 'açougue',    label: 'Açougue',    icon: '🥩', color: '#ef4444', categories: ['aves','suino','bovino','pescado'] },
    { id: 'pereciveis', label: 'Perecíveis', icon: '🧊', color: '#06b6d4', categories: ['aves','suino','bovino','pescado','iogurtes','laticinios','frios','pereciveis'] },
  ],

  // ═══════════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════════

  async render(container) {
    this.stopPolling('all');
    this.selectedSectors = new Set();
    this.excludedRecipients = new Set();
    this.editingBannerId = null;
    const isSuperAdmin = window.BrigadaAuth.isSuperAdmin();

    container.innerHTML = `
      <div class="panel-header">
        <div class="panel-header__left">
          <h2 class="panel-title">🔔 Central de Notificações</h2>
          <p class="panel-subtitle">Gerencie instância WhatsApp, disparos em massa, recados e alertas automáticos</p>
        </div>
      </div>

      ${isSuperAdmin ? this._renderAdminPanel() : ''}

      ${!isSuperAdmin ? this._renderUserPushPanel() : ''}
    `;

    await this.loadAndFillForm(container);
    this.bindEvents(container);
    if (isSuperAdmin) this.updateSectorCards(container);
  },

  // ═══════════════════════════════════════════════════════════════════
  //  HTML TEMPLATES
  // ═══════════════════════════════════════════════════════════════════

  _renderAdminPanel() {
    return `
      <!-- Sub-tabs Navigation -->
      <div id="notif-tabs" style="display: flex; gap: 0.4rem; margin-bottom: 2rem; background: var(--glass-bg); padding: 0.3rem; border-radius: var(--r-full); border: 1px solid var(--glass-border); max-width: 960px; flex-wrap: wrap;">
        <button data-tab="instance" style="flex: 1; min-width: 110px; padding: 0.6rem 0.8rem; border-radius: var(--r-full); border: none; font-family: var(--font); font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; background: var(--accent-gradient); color: #fff; box-shadow: 0 4px 12px rgba(99,102,241,0.25); white-space: nowrap;">
          📱 Instância
        </button>
        <button data-tab="broadcast" style="flex: 1; min-width: 110px; padding: 0.6rem 0.8rem; border-radius: var(--r-full); border: none; font-family: var(--font); font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; background: transparent; color: var(--text-secondary); white-space: nowrap;">
          📢 Disparo em Massa
        </button>
        <button data-tab="banners" style="flex: 1; min-width: 110px; padding: 0.6rem 0.8rem; border-radius: var(--r-full); border: none; font-family: var(--font); font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; background: transparent; color: var(--text-secondary); white-space: nowrap;">
          📌 Recados & Banners
        </button>
        <button data-tab="rules" style="flex: 1; min-width: 110px; padding: 0.6rem 0.8rem; border-radius: var(--r-full); border: none; font-family: var(--font); font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; background: transparent; color: var(--text-secondary); white-space: nowrap;">
          ⚙️ Regras & Alertas
        </button>
      </div>

      ${this._renderInstanceTab()}
      ${this._renderBroadcastTab()}
      ${this._renderBannersTab()}
      ${this._renderRulesTab()}
    `;
  },

  // ── TAB 1: INSTÂNCIA ──────────────────────────────────────────────

  _renderInstanceTab() {
    return `
      <div class="notif-tab-content" id="tab-instance" style="max-width: 960px;">
        <div class="glass-panel stagger" style="margin-bottom: 2rem;">
          <div style="padding: 1.5rem;">
            <h3 class="glass-panel__title" style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
              <span>📱</span> Integração WhatsApp — Pastorini API (PAPI)
            </h3>

            <form id="whatsapp-settings-form">
              <input type="checkbox" id="field-whatsapp-enabled" checked style="display: none;">

              <div style="display: flex; gap: 2rem; flex-wrap: wrap;">
                <!-- LADO ESQUERDO: Dados de Conexão -->
                <div style="flex: 1; min-width: 280px;">
                  <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--glass-border);">
                    <span style="font-size: 1.1rem;">🔗</span>
                    <h4 style="margin: 0; font-size: 0.95rem; color: var(--text-primary);">Conexão por Dados (PAPI)</h4>
                  </div>

                  <div class="form-group">
                    <label class="form-label">URL do Gateway (PAPI) *</label>
                    <input type="url" id="field-whatsapp-api-url" class="form-input" placeholder="ex: https://papi.seu-servidor.com" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label">ID da Instância (PAPI) *</label>
                    <input type="text" id="field-whatsapp-instance-id" class="form-input" placeholder="ex: papi ou instance-papi" required>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Token / Chave de API PAPI (x-api-key)</label>
                    <input type="password" id="field-whatsapp-api-token" class="form-input" placeholder="Chave de API PAPI">
                  </div>

                  <button type="button" class="btn btn--primary" id="btn-connect-data" style="width: 100%; justify-content: center; margin-top: 0.5rem;">
                    🔗 Salvar e Conectar
                  </button>
                </div>

                <!-- LADO DIREITO: QR Code -->
                <div style="flex: 1; min-width: 250px; display: flex; flex-direction: column; align-items: center; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px dashed var(--glass-border); padding: 1.5rem;">
                  <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--glass-border); width: 100%;">
                    <span style="font-size: 1.1rem;">📷</span>
                    <h4 style="margin: 0; font-size: 0.95rem; color: var(--text-primary);">Conexão por QR Code</h4>
                  </div>

                  <div id="whatsapp-qr-wrapper" style="display: none; text-align: center; margin: 1rem 0; background: #fff; padding: 1rem; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.2);">
                    <img id="whatsapp-qr-image" style="width: 180px; height: 180px; display: block;" src="" alt="Scan QR Code">
                    <p style="color: #333; font-size: 0.8rem; margin: 0.5rem 0 0 0; font-weight: 600;">Escaneie com o WhatsApp</p>
                  </div>

                  <div id="qr-placeholder" style="text-align: center; padding: 2rem 0; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <div style="font-size: 3rem; margin-bottom: 0.75rem; opacity: 0.3;">📱</div>
                    <p style="color: var(--text-tertiary); font-size: 0.85rem; margin: 0;">Clique para gerar o QR Code</p>
                  </div>

                  <button type="button" class="btn btn--ghost" id="btn-generate-qr" style="width: 100%; justify-content: center; margin-top: auto;">
                    📷 Gerar QR Code
                  </button>
                </div>
              </div>

              <!-- Barra de Status -->
              <div style="margin-top: 1.5rem; padding: 1rem 1.25rem; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px solid var(--glass-border); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <span style="font-weight: 600; color: var(--text-secondary); font-size: 0.85rem;">Status:</span>
                  <span id="whatsapp-connection-badge" class="badge badge--expired" style="font-size: 0.75rem; padding: 0.2rem 0.6rem;">Carregando...</span>
                </div>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                  <button type="button" class="btn btn--ghost" id="btn-disconnect-whatsapp" style="font-size: 0.75rem; padding: 0.4rem 0.8rem; display: none; background: rgba(239,68,68,0.1); color: #ef4444; border-color: rgba(239,68,68,0.2);">
                    Desconectar
                  </button>
                  <button type="button" class="btn btn--ghost" id="btn-refresh-status" style="font-size: 0.75rem; padding: 0.4rem 0.8rem;">
                    🔄 Atualizar
                  </button>
                  <button type="button" class="btn btn--ghost" id="btn-test-whatsapp" style="font-size: 0.75rem; padding: 0.4rem 0.8rem; display: flex; align-items: center; gap: 0.35rem;">
                    <span class="spinner" id="test-spinner" style="display:none; width: 12px; height: 12px; border-width: 2px;"></span>
                    ⚡ Testar
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  },

  // ── TAB 2: DISPARO EM MASSA ────────────────────────────────────────

  _renderBroadcastTab() {
    return `
      <div class="notif-tab-content" id="tab-broadcast" style="display: none; max-width: 1100px;">
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">

          <!-- COLUNA 1: Seleção e Configurações (Lado Esquerdo) -->
          <div style="flex: 1; min-width: 320px; display: flex; flex-direction: column; gap: 1rem;">

            <!-- Seleção de Setores (Card 1) -->
            <div class="glass-panel stagger" style="margin: 0; height: 180px; display: flex; flex-direction: column;">
              <div style="padding: 1rem 1.25rem; flex: 1; display: flex; flex-direction: column;">
                <h3 class="glass-panel__title" style="margin-bottom: 0.5rem; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem;">
                  <span>🏢</span> Selecione os Setores
                </h3>
                <div id="sector-cards-grid" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.4rem; flex: 1;">
                  ${this.SECTORS.map(s => `
                    <div class="sector-card" data-sector="${s.id}" style="
                      background: linear-gradient(135deg, ${s.color}15, ${s.color}05);
                      border: 1px solid ${s.color}30;
                      border-radius: 8px; padding: 0.5rem; cursor: pointer;
                      transition: all 0.2s ease; text-align: center;
                      position: relative; user-select: none; display: flex; flex-direction: column; justify-content: center; align-items: center;
                    ">
                      <div style="font-size: 1.2rem; margin-bottom: 0.15rem; transition: transform 0.2s ease;">${s.icon}</div>
                      <div style="font-weight: 700; font-size: 0.75rem; color: var(--text-primary); margin-bottom: 0.1rem; line-height: 1.1;">${s.label}</div>
                      <div class="sector-count" style="font-size: 0.65rem; color: var(--text-tertiary);">0 contatos</div>
                      <div class="sector-check" style="
                        position: absolute; top: 4px; right: 4px;
                        width: 12px; height: 12px; border-radius: 50%;
                        border: 1px solid ${s.color}40;
                        display: flex; align-items: center; justify-content: center;
                        font-size: 0.5rem; transition: all 0.2s ease; background: transparent;
                      "></div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Tipo de Mensagem (Card 2) -->
            <div class="glass-panel stagger" style="margin: 0; height: 330px; display: flex; flex-direction: column;">
              <div style="padding: 1rem 1.25rem; flex: 1; display: flex; flex-direction: column; overflow: hidden;">
                <h3 class="glass-panel__title" style="margin-bottom: 0.5rem; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem;">
                  <span>💬</span> Tipo de Mensagem
                </h3>
                <div id="msg-type-cards" style="display: flex; flex-direction: column; gap: 0.4rem; overflow-y: auto; flex: 1; scrollbar-width: thin;">
                  <div class="msg-type-card" data-type="custom" style="
                    display: flex; align-items: center; gap: 0.5rem;
                    padding: 0.5rem 0.75rem; border-radius: 6px; cursor: pointer;
                    border: 1px solid var(--accent-border); background: var(--accent-subtle);
                    transition: all 0.2s ease;
                  ">
                    <span style="font-size: 1rem; flex-shrink: 0;">📝</span>
                    <div style="flex: 1; min-width: 0;">
                      <div style="font-weight: 700; font-size: 0.78rem; color: var(--text-primary); line-height: 1.1;">Personalizada</div>
                      <div style="font-size: 0.65rem; color: var(--text-tertiary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Digite sua mensagem livremente</div>
                    </div>
                  </div>
                  <div class="msg-type-card" data-type="alert" style="
                    display: flex; align-items: center; gap: 0.5rem;
                    padding: 0.5rem 0.75rem; border-radius: 6px; cursor: pointer;
                    border: 1px solid var(--glass-border); background: var(--glass-bg);
                    transition: all 0.2s ease;
                  ">
                    <span style="font-size: 1rem; flex-shrink: 0;">🚨</span>
                    <div style="flex: 1; min-width: 0;">
                      <div style="font-weight: 700; font-size: 0.78rem; color: var(--text-primary); line-height: 1.1;">Alerta de Validade</div>
                      <div style="font-size: 0.65rem; color: var(--text-tertiary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Produtos vencidos/a vencer</div>
                    </div>
                  </div>
                  <div class="msg-type-card" data-type="report" style="
                    display: flex; align-items: center; gap: 0.5rem;
                    padding: 0.5rem 0.75rem; border-radius: 6px; cursor: pointer;
                    border: 1px solid var(--glass-border); background: var(--glass-bg);
                    transition: all 0.2s ease;
                  ">
                    <span style="font-size: 1rem; flex-shrink: 0;">📋</span>
                    <div style="flex: 1; min-width: 0;">
                      <div style="font-weight: 700; font-size: 0.78rem; color: var(--text-primary); line-height: 1.1;">Relatório Diário</div>
                      <div style="font-size: 0.65rem; color: var(--text-tertiary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Resumo consolidado do estoque</div>
                    </div>
                  </div>
                  <div class="msg-type-card" data-type="invoice" style="
                    display: flex; align-items: center; gap: 0.5rem;
                    padding: 0.5rem 0.75rem; border-radius: 6px; cursor: pointer;
                    border: 1px solid var(--glass-border); background: var(--glass-bg);
                    transition: all 0.2s ease;
                  ">
                    <span style="font-size: 1rem; flex-shrink: 0;">📉</span>
                    <div style="flex: 1; min-width: 0;">
                      <div style="font-weight: 700; font-size: 0.78rem; color: var(--text-primary); line-height: 1.1;">Auditoria de Notas</div>
                      <div style="font-size: 0.65rem; color: var(--text-tertiary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Produtos pendentes de NF-e</div>
                    </div>
                  </div>
                  <div class="msg-type-card" data-type="checklist" style="
                    display: flex; align-items: center; gap: 0.5rem;
                    padding: 0.5rem 0.75rem; border-radius: 6px; cursor: pointer;
                    border: 1px solid var(--glass-border); background: var(--glass-bg);
                    transition: all 0.2s ease;
                  ">
                    <span style="font-size: 1rem; flex-shrink: 0;">🧹</span>
                    <div style="flex: 1; min-width: 0;">
                      <div style="font-weight: 700; font-size: 0.78rem; color: var(--text-primary); line-height: 1.1;">Checklist do Dia</div>
                      <div style="font-size: 0.65rem; color: var(--text-tertiary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Rotina e auditoria de limpeza</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- COLUNA 2: Destinatários e Redação (Lado Direito) -->
          <div style="flex: 1; min-width: 320px; display: flex; flex-direction: column; gap: 1rem;">

            <!-- Destinatários (Card 3) -->
            <div class="glass-panel stagger" style="margin: 0; height: 180px; display: flex; flex-direction: column;">
              <div style="padding: 1rem 1.25rem; flex: 1; display: flex; flex-direction: column; overflow: hidden;">
                <h3 class="glass-panel__title" style="margin-bottom: 0.5rem; font-size: 0.9rem; display: flex; align-items: center; justify-content: space-between;">
                  <span style="display: flex; align-items: center; gap: 0.4rem;">
                    <input type="checkbox" id="chk-select-all-recipients" checked style="cursor: pointer; width: 14px; height: 14px; margin: 0; accent-color: var(--accent);">
                    <span>👥</span> Destinatários
                  </span>
                  <span id="recipients-count" class="badge badge--expired" style="font-size: 0.7rem; padding: 0.15rem 0.4rem;">0</span>
                </h3>
                <div id="broadcast-recipients-list" style="overflow-y: auto; border-radius: 8px; scrollbar-width: thin; flex: 1;">
                  <div style="text-align: center; padding: 1.2rem; color: var(--text-tertiary); font-size: 0.8rem;">
                    Selecione setores acima para carregar contatos
                  </div>
                </div>
              </div>
            </div>

            <!-- Redação da Mensagem (Card 4) -->
            <div class="glass-panel stagger" style="margin: 0; height: 330px; display: flex; flex-direction: column;">
              <div style="padding: 1rem 1.25rem; display: flex; flex-direction: column; flex: 1; overflow: hidden;">
                <h3 class="glass-panel__title" style="margin-bottom: 0.5rem; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem;">
                  <span>✍️</span> Redação do Disparo
                </h3>

                <!-- Painel Informativo de Envio (Resumo Dinâmico Compacto) -->
                <div id="broadcast-summary-card" style="
                  background: rgba(255,255,255,0.02);
                  border: 1px solid var(--glass-border);
                  border-radius: 6px;
                  padding: 0.4rem 0.6rem;
                  margin-bottom: 0.5rem;
                  display: flex;
                  gap: 1rem;
                  flex-wrap: wrap;
                  transition: all 0.3s ease;
                ">
                  <div style="flex: 1.2; min-width: 120px;">
                    <span style="font-size: 0.65rem; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase; display: block; margin-bottom: 0.15rem;">Setores Alvo</span>
                    <div id="summary-sectors-badges" style="display: flex; gap: 0.25rem; flex-wrap: wrap; align-items: center;">
                      <span style="font-size: 0.72rem; color: #ef4444; font-weight: 600;">Nenhum</span>
                    </div>
                  </div>

                  <div style="flex: 1; min-width: 100px; border-left: 1px solid var(--glass-border); padding-left: 1rem;">
                    <span style="font-size: 0.65rem; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase; display: block; margin-bottom: 0.15rem;">Template</span>
                    <div id="summary-msg-type-badge" style="display: flex; align-items: center;">
                      <span class="badge" style="font-size: 0.68rem; padding: 0.1rem 0.4rem; background: rgba(99,102,241,0.1); color: #818cf8; border: 1px solid rgba(99,102,241,0.25);">
                        Personalizada
                      </span>
                    </div>
                  </div>
                </div>

                <textarea id="broadcast-message" class="form-input" style="flex: 1; min-height: 80px; resize: none; font-family: var(--font); line-height: 1.4; font-size: 0.82rem; padding: 0.5rem; margin-bottom: 0.5rem;" placeholder="Digite a mensagem que será enviada..."></textarea>

                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--glass-border);">
                  <span id="broadcast-estimate" style="color: var(--text-tertiary); font-size: 0.75rem;">0 mensagens serão enviadas</span>
                  <button type="button" class="btn btn--primary" id="btn-send-broadcast" style="display: flex; align-items: center; gap: 0.35rem; padding: 0.45rem 1rem; font-size: 0.8rem;">
                    <span class="spinner" id="broadcast-spinner" style="display:none; width: 12px; height: 12px; border-width: 1.5px;"></span>
                    <span>📨 Enviar Disparo</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    `;
  },

  // ── TAB 3: RECADOS & BANNERS ───────────────────────────────────────

  _renderBannersTab() {
    return `
      <div class="notif-tab-content" id="tab-banners" style="display: none; max-width: 960px;">

        <!-- Formulário de Criar/Editar Recado -->
        <div class="glass-panel stagger" style="margin-bottom: 1.5rem;">
          <div style="padding: 1.5rem;">
            <h3 class="glass-panel__title" style="margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between;">
              <span style="display: flex; align-items: center; gap: 0.5rem;">
                <span>📌</span> <span id="banner-form-title-text">Novo Recado / Banner de Aviso</span>
              </span>
              <button type="button" class="btn btn--ghost" id="btn-cancel-banner-edit" style="display: none; font-size: 0.75rem; padding: 0.3rem 0.75rem;">
                ✕ Cancelar Edição
              </button>
            </h3>

            <form id="banner-form">
              <input type="hidden" id="field-banner-id" value="">

              <div class="form-group">
                <label class="form-label">Título do Recado *</label>
                <input type="text" id="field-banner-title" class="form-input" placeholder="ex: 🥩 Atenção Setor de Açougue — Higienização das Câmaras" required>
              </div>

              <div class="form-group">
                <label class="form-label">Mensagem / Conteúdo *</label>
                <textarea id="field-banner-message" class="form-input" rows="4" style="resize: vertical; font-family: var(--font);" placeholder="Digite as orientações, avisos ou recados que aparecerão no topo do sistema para os usuários selecionados..." required></textarea>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;" class="form-row-grid">
                <div class="form-group">
                  <label class="form-label">Tipo / Nível do Alerta</label>
                  <select id="field-banner-type" class="form-input">
                    <option value="info">🔵 Informação (Azul)</option>
                    <option value="warning">🟡 Aviso / Atenção (Amarelo)</option>
                    <option value="alert">🔴 Urgente / Alerta (Vermelho)</option>
                    <option value="success">🟢 Comunicado / Sucesso (Verde)</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Público Alvo</label>
                  <select id="field-banner-target-type" class="form-input">
                    <option value="all">🌐 Todos os Usuários</option>
                    <option value="sector">🏢 Por Setor</option>
                    <option value="user">👤 Por Usuário Específico</option>
                  </select>
                </div>
              </div>

              <!-- Seletor dinâmico de Setor -->
              <div class="form-group" id="group-banner-target-sector" style="display: none; margin-top: 0.5rem;">
                <label class="form-label">Selecione o Setor Alvo *</label>
                <select id="field-banner-target-sector" class="form-input">
                  <option value="açougue">🥩 Açougue</option>
                  <option value="pereciveis">🧊 Perecíveis</option>
                </select>
              </div>

              <!-- Seletor dinâmico de Usuário -->
              <div class="form-group" id="group-banner-target-user" style="display: none; margin-top: 0.5rem;">
                <label class="form-label">Selecione o Usuário Alvo *</label>
                <select id="field-banner-target-user" class="form-input">
                  <option value="">Carregando lista de usuários...</option>
                </select>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; flex-wrap: wrap; gap: 1rem; padding-top: 1rem; border-top: 1px solid var(--glass-border);">
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                  <label class="switch">
                    <input type="checkbox" id="field-banner-active" checked>
                    <span class="slider round"></span>
                  </label>
                  <span style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">Exibir recado no sistema imediatamente</span>
                </div>

                <button type="submit" class="btn btn--primary" id="btn-save-banner" style="padding: 0.65rem 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                  <span>💾 Salvar Recado</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Lista de Recados Cadastrados -->
        <div class="glass-panel stagger">
          <div style="padding: 1.5rem;">
            <h3 class="glass-panel__title" style="margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between;">
              <span style="display: flex; align-items: center; gap: 0.5rem;">
                <span>📋</span> Recados Cadastrados
              </span>
              <span id="banners-count-badge" class="badge badge--ok" style="font-size: 0.75rem;">0 recados</span>
            </h3>

            <div id="banners-list-container" style="display: flex; flex-direction: column; gap: 0.85rem;">
              <div style="text-align: center; padding: 2rem; color: var(--text-tertiary); font-size: 0.85rem;">
                Nenhum recado cadastrado ainda. Use o formulário acima para criar um aviso.
              </div>
            </div>
          </div>
        </div>

      </div>
    `;
  },

  // ── TAB 4: REGRAS & ALERTAS ────────────────────────────────────────

  _renderRulesTab() {
    return `
      <div class="notif-tab-content" id="tab-rules" style="display: none; max-width: 800px;">

        <!-- Alertas de Validade -->
        <div class="glass-panel stagger" style="margin-bottom: 1.5rem;">
          <div style="padding: 1.5rem;">
            <h3 class="glass-panel__title" style="margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
              <span>🚨</span> Regras dos Alertas de Validade
            </h3>

            <form id="rules-settings-form">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Disparar Alerta Antecipado (Dias)</label>
                  <input type="number" id="field-alert-days" class="form-input" min="1" max="15" value="3" required>
                  <p style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 4px;">Alerta de produtos a vencer com esta margem de dias</p>
                </div>
                <div class="form-group">
                  <label class="form-label">Horário de Envio do Alerta</label>
                  <input type="time" id="field-alert-time" class="form-input" required>
                  <p style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 4px;">Horário que o relatório diário será disparado</p>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Número de Telefone de Destino (Administrador) *</label>
                <input type="tel" id="field-alert-phone" class="form-input" placeholder="ex: 5511999999999" required>
                <p style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 4px;">Código do país + DDD + Número (ex: 5511999999999)</p>
              </div>

              <hr style="border: 0; border-top: 1px solid var(--glass-border); margin: 1.5rem 0;">

              <!-- Lembretes da Equipe -->
              <div class="form-group" style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 8px; border: 1px solid var(--glass-border); margin-bottom: 1.5rem;">
                <div>
                  <label class="form-label" style="margin-bottom: 2px; font-size: 1rem;">Habilitar Lembretes da Equipe</label>
                  <p style="color: var(--text-secondary); font-size: 0.8rem; margin: 0;">Envia lembretes no WhatsApp cobrando checagens de validade</p>
                </div>
                <label class="switch">
                  <input type="checkbox" id="field-reminder-active">
                  <span class="slider round"></span>
                </label>
              </div>

              <div id="reminders-config-section" style="display: none; transition: all 0.3s ease;">
                <div class="form-group">
                  <label class="form-label">Horário de Envio do Lembrete</label>
                  <input type="time" id="field-reminder-time" class="form-input">
                </div>
                <div class="form-group">
                  <label class="form-label">Mensagem Padrão do Lembrete</label>
                  <textarea id="field-reminder-msg" class="form-input" rows="3" style="resize: vertical; font-family: inherit;" placeholder="Atenção equipe! Favor verificar as validades do setor de aves hoje."></textarea>
                </div>
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem;">
                <button type="submit" class="btn btn--primary" id="btn-save-rules">
                  Salvar Regras
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Push Notifications -->
        <div class="glass-panel stagger" style="margin-bottom: 2rem;">
          <div style="padding: 1.5rem;">
            <h3 class="glass-panel__title" style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
              <span>🔔</span> Notificações Push do Navegador (Web Push)
            </h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1.5rem;">
              Receba alertas de validade diretamente na tela do seu dispositivo.
            </p>
            <div style="background: rgba(255,255,255,0.02); padding: 1.25rem; border-radius: 8px; border: 1px dashed var(--glass-border);">
              <h4 style="margin: 0 0 1rem 0; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem;">
                <span>Status:</span> <span id="push-status-badge" class="badge badge--expired" style="font-size: 0.8rem; padding: 0.2rem 0.6rem;">Carregando...</span>
              </h4>
              <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                <button type="button" class="btn btn--primary" id="btn-subscribe-push" style="font-size: 0.85rem; padding: 0.5rem 1rem;">Ativar neste Navegador</button>
                <button type="button" class="btn btn--ghost" id="btn-unsubscribe-push" style="font-size: 0.85rem; padding: 0.5rem 1rem; display: none; background: rgba(239,68,68,0.1); color: #ef4444; border-color: rgba(239,68,68,0.2);">Desativar</button>
                <button type="button" class="btn btn--ghost" id="btn-test-push" style="font-size: 0.85rem; padding: 0.5rem 1rem; display: none;">⚡ Testar Push</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // ── PANEL PUSH (NON-ADMIN) ─────────────────────────────────────────

  _renderUserPushPanel() {
    return `
      <div class="glass-panel stagger" style="max-width: 800px; margin-bottom: 2rem;">
        <div style="padding: 1.5rem;">
          <h3 class="glass-panel__title" style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>🔔</span> Notificações Push do Navegador
          </h3>
          <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1.5rem;">
            Receba alertas de validade diretamente na tela do seu dispositivo.
          </p>
          <div style="background: rgba(255,255,255,0.02); padding: 1.25rem; border-radius: 8px; border: 1px dashed var(--glass-border);">
            <h4 style="margin: 0 0 1rem 0; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem;">
              <span>Status:</span> <span id="push-status-badge" class="badge badge--expired" style="font-size: 0.8rem; padding: 0.2rem 0.6rem;">Carregando...</span>
            </h4>
            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
              <button type="button" class="btn btn--primary" id="btn-subscribe-push" style="font-size: 0.85rem; padding: 0.5rem 1rem;">Ativar neste Navegador</button>
              <button type="button" class="btn btn--ghost" id="btn-unsubscribe-push" style="font-size: 0.85rem; padding: 0.5rem 1rem; display: none; background: rgba(239,68,68,0.1); color: #ef4444; border-color: rgba(239,68,68,0.2);">Desativar</button>
              <button type="button" class="btn btn--ghost" id="btn-test-push" style="font-size: 0.85rem; padding: 0.5rem 1rem; display: none;">⚡ Testar</button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // ═══════════════════════════════════════════════════════════════════
  //  TAB SWITCHING
  // ═══════════════════════════════════════════════════════════════════

  switchTab(container, tabId) {
    this.activeTab = tabId;
    container.querySelectorAll('.notif-tab-content').forEach(el => el.style.display = 'none');
    const target = container.querySelector(`#tab-${tabId}`);
    if (target) target.style.display = 'block';

    container.querySelectorAll('#notif-tabs button[data-tab]').forEach(btn => {
      if (btn.dataset.tab === tabId) {
        btn.style.background = 'var(--accent-gradient)';
        btn.style.color = '#fff';
        btn.style.boxShadow = '0 4px 12px rgba(99,102,241,0.25)';
      } else {
        btn.style.background = 'transparent';
        btn.style.color = 'var(--text-secondary)';
        btn.style.boxShadow = 'none';
      }
    });

    if (tabId === 'broadcast') {
      this.updateSectorCards(container);
      this.updateBroadcastSummary(container);
    }
    if (tabId === 'banners') this.renderBannersList(container);
  },

  // ═══════════════════════════════════════════════════════════════════
  //  LOAD & FILL FORM
  // ═══════════════════════════════════════════════════════════════════

  async loadAndFillForm(container) {
    if (window.BrigadaAuth.isSuperAdmin()) {
      this.config = await window.BrigadaData.loadSettings('whatsapp');
      const rawBanners = await window.BrigadaData.loadSettings('banners');
      this.bannersList = Array.isArray(rawBanners) ? rawBanners : [];

      // Instance fields
      const fUrl = container.querySelector('#field-whatsapp-api-url');
      const fId = container.querySelector('#field-whatsapp-instance-id');
      const fToken = container.querySelector('#field-whatsapp-api-token');

      // Rules fields
      const fDays = container.querySelector('#field-alert-days');
      const fTime = container.querySelector('#field-alert-time');
      const fPhone = container.querySelector('#field-alert-phone');
      const fReminder = container.querySelector('#field-reminder-active');
      const fReminderTime = container.querySelector('#field-reminder-time');
      const fReminderMsg = container.querySelector('#field-reminder-msg');

      if (this.config) {
        // Sanitize old Evolution API values if coming from legacy database/cache
        if (this.config.apiUrl && this.config.apiUrl.includes('evolution')) {
          this.config.apiUrl = '';
        }
        if (this.config.instanceId && (this.config.instanceId.includes('rotaflash-instance') || this.config.instanceId.includes('evolution'))) {
          this.config.instanceId = 'papi';
        }

        if (fUrl) fUrl.value = this.config.apiUrl || '';
        if (fId) fId.value = this.config.instanceId || 'papi';
        if (fToken) fToken.value = this.config.apiToken || '';

        if (fDays) fDays.value = this.config.alertDaysBefore !== undefined ? this.config.alertDaysBefore : 3;
        if (fTime) fTime.value = this.config.alertTime || '08:00';
        if (fPhone) fPhone.value = this.config.alertPhone || '';
        if (fReminder) fReminder.checked = !!this.config.reminderActive;
        if (fReminderTime) fReminderTime.value = this.config.reminderTime || '09:00';
        if (fReminderMsg) fReminderMsg.value = this.config.reminderMsg || 'Atenção equipe! Favor verificar as validades do setor de aves hoje.';
      }

      this.populateUsersTargetSelect(container);
      this.renderBannersList(container);
      this.toggleSections(container);
      this.updateConnectionStatus(container);
    }
    this.checkPushSubscription(container);
  },

  populateUsersTargetSelect(container) {
    const select = container.querySelector('#field-banner-target-user');
    if (!select) return;

    const users = window.BrigadaData.users || [];
    const activeUsers = users.filter(u => u.status === 'active');

    if (activeUsers.length === 0) {
      select.innerHTML = '<option value="">Nenhum usuário ativo cadastrado</option>';
      return;
    }

    const sectorNames = { açougue: '🥩 Açougue', pereciveis: '🧊 Perecíveis', todos: '🌍 Todos' };

    select.innerHTML = activeUsers.map(u => `
      <option value="${u.id}">${u.name} (${u.role || 'usuário'} — ${sectorNames[u.sector] || u.sector})</option>
    `).join('');
  },

  toggleSections(container) {
    const remindersSection = container.querySelector('#reminders-config-section');
    const remindersChecked = container.querySelector('#field-reminder-active')?.checked;
    if (remindersSection) remindersSection.style.display = remindersChecked ? 'block' : 'none';
  },

  // ═══════════════════════════════════════════════════════════════════
  //  CONNECTION STATUS & POLLING
  // ═══════════════════════════════════════════════════════════════════

  startPolling(container) {
    if (this.pollingIntervals['main']) clearInterval(this.pollingIntervals['main']);
    this.pollingIntervals['main'] = setInterval(() => {
      this.updateConnectionStatus(container, true);
    }, 5000);
  },

  stopPolling(type = 'all') {
    Object.keys(this.pollingIntervals).forEach(k => {
      if (this.pollingIntervals[k]) {
        clearInterval(this.pollingIntervals[k]);
        this.pollingIntervals[k] = null;
      }
    });
  },

  async updateConnectionStatus(container, isPolling = false) {
    try {
      const res = await fetch('/api/settings/whatsapp/instance-status').then(r => r.json());
      const badge = container.querySelector('#whatsapp-connection-badge');
      const qrWrapper = container.querySelector('#whatsapp-qr-wrapper');
      const qrImage = container.querySelector('#whatsapp-qr-image');
      const qrPlaceholder = container.querySelector('#qr-placeholder');
      const btnDisconnect = container.querySelector('#btn-disconnect-whatsapp');

      if (!badge) return;

      if (res.status === 'CONNECTED') {
        badge.textContent = 'CONECTADO 🟢';
        badge.className = 'badge badge--ok';
        if (qrWrapper) qrWrapper.style.display = 'none';
        if (qrPlaceholder) qrPlaceholder.style.display = 'flex';
        if (btnDisconnect) btnDisconnect.style.display = 'inline-flex';
        this.stopPolling();
      } else if (res.status === 'QR_READY' && res.qrImage) {
        badge.textContent = 'AGUARDANDO QR CODE 🟡';
        badge.className = 'badge badge--warning';
        if (qrImage) qrImage.src = res.qrImage;
        if (qrWrapper) qrWrapper.style.display = 'block';
        if (qrPlaceholder) qrPlaceholder.style.display = 'none';
        if (btnDisconnect) btnDisconnect.style.display = 'inline-flex';
        if (!isPolling) this.startPolling(container);
      } else if (res.status === 'CONNECTING') {
        badge.textContent = 'CONECTANDO 🔵';
        badge.className = 'badge badge--info';
        if (qrWrapper) qrWrapper.style.display = 'none';
        if (qrPlaceholder) qrPlaceholder.style.display = 'flex';
        if (btnDisconnect) btnDisconnect.style.display = 'inline-flex';
        if (!isPolling) this.startPolling(container);
      } else {
        badge.textContent = 'DESCONECTADO 🔴';
        badge.className = 'badge badge--expired';
        if (qrWrapper) qrWrapper.style.display = 'none';
        if (qrPlaceholder) qrPlaceholder.style.display = 'flex';
        if (btnDisconnect) btnDisconnect.style.display = 'none';
        this.stopPolling();
      }
    } catch (e) {
      console.error('Erro ao atualizar status do WhatsApp:', e);
    }
  },

  // ═══════════════════════════════════════════════════════════════════
  //  EVENTS
  // ═══════════════════════════════════════════════════════════════════

  bindEvents(container) {
    // ── Tab Navigation ──
    container.querySelectorAll('#notif-tabs button[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(container, btn.dataset.tab));
    });

    if (window.BrigadaAuth.isSuperAdmin()) {
      this._bindInstanceEvents(container);
      this._bindBroadcastEvents(container);
      this._bindBannersEvents(container);
      this._bindRulesEvents(container);
    }
    this._bindPushEvents(container);
  },

  // ── Instance Tab Events ──

  _bindInstanceEvents(container) {
    const btnConnectData = container.querySelector('#btn-connect-data');
    const btnGenerateQr = container.querySelector('#btn-generate-qr');
    const btnDisconnect = container.querySelector('#btn-disconnect-whatsapp');
    const btnRefresh = container.querySelector('#btn-refresh-status');
    const btnTest = container.querySelector('#btn-test-whatsapp');
    const testSpinner = container.querySelector('#test-spinner');

    if (btnConnectData) {
      btnConnectData.addEventListener('click', async () => {
        window.BrigadaUI.showToast('Salvando e conectando...', 'info');
        try {
          const data = this._gatherInstanceData(container);
          await window.BrigadaData.saveSettings('whatsapp', { ...this.config, ...data });
          this.config = { ...this.config, ...data };

          const res = await fetch('/api/settings/whatsapp/connect', { method: 'POST' }).then(r => r.json());
          this.updateConnectionStatus(container);
          if (res.status === 'QR_READY') {
            window.BrigadaUI.showToast('QR Code gerado! Escaneie com o WhatsApp.', 'warning');
          } else if (res.status === 'CONNECTED') {
            window.BrigadaUI.showToast('Instância conectada com sucesso!', 'success');
          } else if (res.error) {
            window.BrigadaUI.showToast(`Erro: ${res.error}`, 'error');
          }
        } catch (err) {
          window.BrigadaUI.showToast('Falha ao conectar a instância.', 'error');
        }
      });
    }

    if (btnGenerateQr) {
      btnGenerateQr.addEventListener('click', async () => {
        window.BrigadaUI.showToast('Gerando QR Code...', 'info');
        try {
          const data = this._gatherInstanceData(container);
          await window.BrigadaData.saveSettings('whatsapp', { ...this.config, ...data });
          this.config = { ...this.config, ...data };

          const res = await fetch('/api/settings/whatsapp/connect', { method: 'POST' }).then(r => r.json());
          this.updateConnectionStatus(container);
          if (res.status === 'QR_READY') {
            window.BrigadaUI.showToast('Escaneie o QR Code com o WhatsApp!', 'warning');
          } else if (res.status === 'CONNECTED') {
            window.BrigadaUI.showToast('Instância já está conectada!', 'success');
          }
        } catch (err) {
          window.BrigadaUI.showToast('Falha ao gerar QR Code.', 'error');
        }
      });
    }

    if (btnDisconnect) {
      btnDisconnect.addEventListener('click', async () => {
        if (!confirm('Deseja realmente desconectar a instância do WhatsApp?')) return;
        try {
          const res = await fetch('/api/settings/whatsapp/disconnect', { method: 'POST' }).then(r => r.json());
          if (res.success) {
            window.BrigadaUI.showToast('Desconectado com sucesso!', 'success');
            this.updateConnectionStatus(container);
          }
        } catch (err) {
          window.BrigadaUI.showToast('Falha ao desconectar.', 'error');
        }
      });
    }

    if (btnRefresh) {
      btnRefresh.addEventListener('click', () => {
        this.updateConnectionStatus(container);
        window.BrigadaUI.showToast('Status atualizado!', 'success');
      });
    }

    if (btnTest) {
      btnTest.addEventListener('click', async () => {
        const phone = this.config?.alertPhone;
        if (!phone) {
          window.BrigadaUI.showToast('Configure o telefone de destino na aba "Regras & Alertas" primeiro.', 'error');
          return;
        }
        btnTest.disabled = true;
        if (testSpinner) testSpinner.style.display = 'inline-block';

        try {
          const data = { ...this.config, ...this._gatherInstanceData(container) };
          const res = await window.BrigadaData.testWhatsApp(data);
          if (testSpinner) testSpinner.style.display = 'none';
          btnTest.disabled = false;
          if (res.success) {
            window.BrigadaUI.showToast(res.warning || res.message || 'Teste realizado!', res.warning ? 'info' : 'success');
          } else {
            window.BrigadaUI.showToast(res.error || 'Erro ao testar.', 'error');
          }
        } catch (err) {
          if (testSpinner) testSpinner.style.display = 'none';
          btnTest.disabled = false;
          window.BrigadaUI.showToast('Falha ao processar teste.', 'error');
        }
      });
    }
  },

  // ── Broadcast Tab Events ──

  _bindBroadcastEvents(container) {
    container.querySelectorAll('.sector-card').forEach(card => {
      card.addEventListener('click', () => {
        const sector = card.dataset.sector;
        if (this.selectedSectors.has(sector)) {
          this.selectedSectors.delete(sector);
          card.style.transform = 'scale(1)';
          card.style.boxShadow = 'none';
          card.querySelector('.sector-check').innerHTML = '';
          card.querySelector('.sector-check').style.background = 'transparent';
        } else {
          this.selectedSectors.add(sector);
          card.style.transform = 'scale(1.03)';
          card.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)';
          card.querySelector('.sector-check').innerHTML = '✓';
          card.querySelector('.sector-check').style.background = 'var(--accent)';
          card.querySelector('.sector-check').style.color = '#fff';
          card.querySelector('.sector-check').style.borderColor = 'var(--accent)';
        }
        this.updateRecipientsList(container);
        this._updateBroadcastEstimate(container);
        this.updateBroadcastSummary(container);
      });

      card.addEventListener('mouseenter', () => {
        if (!this.selectedSectors.has(card.dataset.sector)) {
          card.style.transform = 'translateY(-2px)';
        }
      });
      card.addEventListener('mouseleave', () => {
        if (!this.selectedSectors.has(card.dataset.sector)) {
          card.style.transform = 'scale(1)';
        }
      });
    });

    container.querySelectorAll('.msg-type-card').forEach(card => {
      card.addEventListener('click', () => {
        container.querySelectorAll('.msg-type-card').forEach(c => {
          c.style.border = '2px solid var(--glass-border)';
          c.style.background = 'var(--glass-bg)';
        });
        card.style.border = '2px solid var(--accent-border)';
        card.style.background = 'var(--accent-subtle)';

        const type = card.dataset.type;
        const textarea = container.querySelector('#broadcast-message');

        if (type === 'alert' || type === 'report' || type === 'invoice' || type === 'checklist') {
          const msg = this.generateAutoMessage(type);
          if (textarea) textarea.value = msg;
        } else {
          if (textarea) textarea.value = '';
          if (textarea) textarea.focus();
        }
        this.updateBroadcastSummary(container);
      });
    });

    const chkSelectAll = container.querySelector('#chk-select-all-recipients');
    if (chkSelectAll) {
      chkSelectAll.addEventListener('change', () => {
        const checked = chkSelectAll.checked;
        const contacts = this.getAllSelectedContacts();
        if (checked) {
          this.excludedRecipients.clear();
        } else {
          contacts.forEach(c => this.excludedRecipients.add(c.whatsapp));
        }
        container.querySelectorAll('.chk-recipient').forEach(chk => {
          chk.checked = checked;
        });
        this._updateBroadcastEstimate(container);
      });
    }

    const btnSend = container.querySelector('#btn-send-broadcast');
    if (btnSend) {
      btnSend.addEventListener('click', () => this.sendBroadcast(container));
    }
  },

  // ── Banners Tab Events ──

  _bindBannersEvents(container) {
    const targetTypeSelect = container.querySelector('#field-banner-target-type');
    const groupSector = container.querySelector('#group-banner-target-sector');
    const groupUser = container.querySelector('#group-banner-target-user');
    const btnCancelEdit = container.querySelector('#btn-cancel-banner-edit');
    const bannerForm = container.querySelector('#banner-form');

    // Toggle dynamic target selects
    if (targetTypeSelect) {
      targetTypeSelect.addEventListener('change', () => {
        const val = targetTypeSelect.value;
        if (groupSector) groupSector.style.display = val === 'sector' ? 'block' : 'none';
        if (groupUser) groupUser.style.display = val === 'user' ? 'block' : 'none';
      });
    }

    // Cancel edit
    if (btnCancelEdit) {
      btnCancelEdit.addEventListener('click', () => {
        this.editingBannerId = null;
        this.resetBannerForm(container);
      });
    }

    // Submit banner form
    if (bannerForm) {
      bannerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const idField = container.querySelector('#field-banner-id');
        const titleField = container.querySelector('#field-banner-title');
        const messageField = container.querySelector('#field-banner-message');
        const typeField = container.querySelector('#field-banner-type');
        const targetTypeField = container.querySelector('#field-banner-target-type');
        const targetSectorField = container.querySelector('#field-banner-target-sector');
        const targetUserField = container.querySelector('#field-banner-target-user');
        const activeField = container.querySelector('#field-banner-active');

        const title = titleField.value.trim();
        const message = messageField.value.trim();
        const type = typeField.value;
        const targetType = targetTypeField.value;
        let targetValue = '';

        if (targetType === 'sector') targetValue = targetSectorField.value;
        if (targetType === 'user') targetValue = targetUserField.value;

        if (!title || !message) {
          window.BrigadaUI.showToast('Preencha título e mensagem.', 'error');
          return;
        }

        const currentUser = window.BrigadaAuth.currentUser;
        const bannerId = idField.value || `banner-${Date.now()}`;

        const newBanner = {
          id: bannerId,
          title,
          message,
          type,
          targetType,
          targetValue,
          active: activeField.checked,
          createdAt: new Date().toISOString(),
          authorName: currentUser ? currentUser.name : 'Administrador'
        };

        if (idField.value) {
          const index = this.bannersList.findIndex(b => b.id === idField.value);
          if (index !== -1) this.bannersList[index] = newBanner;
        } else {
          this.bannersList.unshift(newBanner);
        }

        try {
          const res = await window.BrigadaData.saveSettings('banners', this.bannersList);
          if (res.success || res.message) {
            window.BrigadaUI.showToast(idField.value ? 'Recado atualizado com sucesso!' : 'Novo recado salvo e ativado no sistema!', 'success');
            this.resetBannerForm(container);
            this.renderBannersList(container);
          } else {
            window.BrigadaUI.showToast('Erro ao salvar recado.', 'error');
          }
        } catch (err) {
          window.BrigadaUI.showToast('Falha ao salvar recado.', 'error');
        }
      });
    }
  },

  resetBannerForm(container) {
    this.editingBannerId = null;
    const idField = container.querySelector('#field-banner-id');
    const titleField = container.querySelector('#field-banner-title');
    const messageField = container.querySelector('#field-banner-message');
    const typeField = container.querySelector('#field-banner-type');
    const targetTypeField = container.querySelector('#field-banner-target-type');
    const activeField = container.querySelector('#field-banner-active');
    const groupSector = container.querySelector('#group-banner-target-sector');
    const groupUser = container.querySelector('#group-banner-target-user');
    const btnCancelEdit = container.querySelector('#btn-cancel-banner-edit');
    const titleText = container.querySelector('#banner-form-title-text');

    if (idField) idField.value = '';
    if (titleField) titleField.value = '';
    if (messageField) messageField.value = '';
    if (typeField) typeField.value = 'info';
    if (targetTypeField) targetTypeField.value = 'all';
    if (activeField) activeField.checked = true;
    if (groupSector) groupSector.style.display = 'none';
    if (groupUser) groupUser.style.display = 'none';
    if (btnCancelEdit) btnCancelEdit.style.display = 'none';
    if (titleText) titleText.textContent = 'Novo Recado / Banner de Aviso';
  },

  renderBannersList(container) {
    const listEl = container.querySelector('#banners-list-container');
    const badgeEl = container.querySelector('#banners-count-badge');
    if (!listEl) return;

    if (badgeEl) {
      badgeEl.textContent = `${this.bannersList.length} recado${this.bannersList.length !== 1 ? 's' : ''}`;
    }

    if (this.bannersList.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-tertiary); font-size: 0.85rem;">
          Nenhum recado cadastrado ainda. Use o formulário acima para criar um aviso.
        </div>`;
      return;
    }

    const typeBadges = {
      info:    { label: '🔵 Informação', color: '#818cf8', bg: 'rgba(99,102,241,0.1)' },
      warning: { label: '🟡 Aviso',      color: '#fbbf24', bg: 'rgba(245,158,11,0.1)' },
      alert:   { label: '🔴 Urgente',    color: '#f87171', bg: 'rgba(239,68,68,0.1)' },
      success: { label: '🟢 Sucesso',    color: '#4ade80', bg: 'rgba(34,197,94,0.1)' },
    };

    const sectorLabels = { açougue: '🥩 Açougue', pereciveis: '🧊 Perecíveis' };

    listEl.innerHTML = this.bannersList.map(b => {
      const typeInfo = typeBadges[b.type] || typeBadges.info;
      let targetText = '🌐 Todos os Usuários';
      if (b.targetType === 'sector') targetText = `🏢 Setor: ${sectorLabels[b.targetValue] || b.targetValue}`;
      if (b.targetType === 'user') {
        const u = window.BrigadaData.users?.find(usr => String(usr.id) === String(b.targetValue) || usr.email === b.targetValue);
        targetText = `👤 Usuário: ${u ? u.name : b.targetValue}`;
      }

      return `
        <div class="banner-item-card" data-id="${b.id}" style="
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--glass-border);
          border-left: 4px solid ${b.active ? typeInfo.color : 'var(--text-tertiary)'};
          border-radius: 10px; padding: 1rem 1.25rem;
          display: flex; flex-direction: column; gap: 0.5rem;
          transition: all 0.2s ease; opacity: ${b.active ? '1' : '0.6'};
        ">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
              <h4 style="margin: 0; font-size: 0.95rem; color: var(--text-primary); font-weight: 700;">${b.title}</h4>
              <span class="badge" style="font-size: 0.68rem; padding: 0.15rem 0.5rem; background: ${typeInfo.bg}; color: ${typeInfo.color}; border: 1px solid ${typeInfo.color}30;">
                ${typeInfo.label}
              </span>
              <span class="badge" style="font-size: 0.68rem; padding: 0.15rem 0.5rem; background: rgba(255,255,255,0.05); color: var(--text-secondary); border: 1px solid var(--glass-border);">
                ${targetText}
              </span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <button type="button" class="btn btn--ghost btn-toggle-banner" data-id="${b.id}" style="font-size: 0.72rem; padding: 0.25rem 0.6rem;">
                ${b.active ? '🟢 Ativo' : '⚪ Inativo'}
              </button>
              <button type="button" class="btn btn--ghost btn-edit-banner" data-id="${b.id}" style="font-size: 0.72rem; padding: 0.25rem 0.6rem;">
                ✏️ Editar
              </button>
              <button type="button" class="btn btn--ghost btn-delete-banner" data-id="${b.id}" style="font-size: 0.72rem; padding: 0.25rem 0.6rem; color: #ef4444;">
                🗑️
              </button>
            </div>
          </div>

          <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; white-space: pre-line; background: rgba(0,0,0,0.15); padding: 0.6rem 0.8rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.03);">
            ${b.message}
          </div>

          <div style="font-size: 0.72rem; color: var(--text-tertiary); display: flex; justify-content: space-between;">
            <span>Criado por ${b.authorName || 'Admin'} em ${new Date(b.createdAt).toLocaleDateString('pt-BR')} ${new Date(b.createdAt).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</span>
          </div>
        </div>
      `;
    }).join('');

    // Bind list buttons
    listEl.querySelectorAll('.btn-toggle-banner').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const banner = this.bannersList.find(b => b.id === id);
        if (banner) {
          banner.active = !banner.active;
          await window.BrigadaData.saveSettings('banners', this.bannersList);
          window.BrigadaUI.showToast(banner.active ? 'Recado ativado!' : 'Recado desativado.', 'info');
          this.renderBannersList(container);
        }
      });
    });

    listEl.querySelectorAll('.btn-edit-banner').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const banner = this.bannersList.find(b => b.id === id);
        if (banner) {
          this.editingBannerId = id;
          const idField = container.querySelector('#field-banner-id');
          const titleField = container.querySelector('#field-banner-title');
          const messageField = container.querySelector('#field-banner-message');
          const typeField = container.querySelector('#field-banner-type');
          const targetTypeField = container.querySelector('#field-banner-target-type');
          const targetSectorField = container.querySelector('#field-banner-target-sector');
          const targetUserField = container.querySelector('#field-banner-target-user');
          const activeField = container.querySelector('#field-banner-active');
          const btnCancelEdit = container.querySelector('#btn-cancel-banner-edit');
          const titleText = container.querySelector('#banner-form-title-text');

          if (idField) idField.value = banner.id;
          if (titleField) titleField.value = banner.title;
          if (messageField) messageField.value = banner.message;
          if (typeField) typeField.value = banner.type || 'info';
          if (targetTypeField) {
            targetTypeField.value = banner.targetType || 'all';
            targetTypeField.dispatchEvent(new Event('change'));
          }
          if (targetSectorField && banner.targetValue) targetSectorField.value = banner.targetValue;
          if (targetUserField && banner.targetValue) targetUserField.value = banner.targetValue;
          if (activeField) activeField.checked = banner.active;
          if (btnCancelEdit) btnCancelEdit.style.display = 'inline-block';
          if (titleText) titleText.textContent = '✏️ Editar Recado';

          container.querySelector('#tab-banners')?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    listEl.querySelectorAll('.btn-delete-banner').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        if (!confirm('Deseja realmente excluir este recado?')) return;
        this.bannersList = this.bannersList.filter(b => b.id !== id);
        await window.BrigadaData.saveSettings('banners', this.bannersList);
        window.BrigadaUI.showToast('Recado excluído.', 'success');
        this.renderBannersList(container);
      });
    });
  },

  // ── Rules Tab Events ──

  _bindRulesEvents(container) {
    const fieldReminderActive = container.querySelector('#field-reminder-active');
    if (fieldReminderActive) {
      fieldReminderActive.addEventListener('change', () => this.toggleSections(container));
    }

    const form = container.querySelector('#rules-settings-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const rulesData = this._gatherRulesData(container);
        try {
          const merged = { ...this.config, ...rulesData };
          const res = await window.BrigadaData.saveSettings('whatsapp', merged);
          this.config = merged;
          if (res.success) {
            window.BrigadaUI.showToast(res.message || 'Regras salvas com sucesso!', 'success');
          } else {
            window.BrigadaUI.showToast(res.error || 'Erro ao salvar regras.', 'error');
          }
        } catch (err) {
          window.BrigadaUI.showToast(err.message || 'Erro ao salvar.', 'error');
        }
      });
    }
  },

  // ── Push Notification Events ──

  _bindPushEvents(container) {
    const btnSub = container.querySelector('#btn-subscribe-push');
    const btnUnsub = container.querySelector('#btn-unsubscribe-push');
    const btnTestPush = container.querySelector('#btn-test-push');

    if (btnSub) btnSub.addEventListener('click', () => this.subscribePush(container));
    if (btnUnsub) btnUnsub.addEventListener('click', () => this.unsubscribePush(container));
    if (btnTestPush) {
      btnTestPush.addEventListener('click', async () => {
        try {
          const res = await fetch('/api/settings/push/test', { method: 'POST' }).then(r => r.json());
          window.BrigadaUI.showToast(res.success ? res.message : (res.error || 'Erro.'), res.success ? 'success' : 'error');
        } catch (err) {
          window.BrigadaUI.showToast('Erro de conexão.', 'error');
        }
      });
    }
  },

  // ═══════════════════════════════════════════════════════════════════
  //  DATA GATHERING
  // ═══════════════════════════════════════════════════════════════════

  _gatherInstanceData(container) {
    return {
      enabled: true,
      apiUrl: (container.querySelector('#field-whatsapp-api-url')?.value || '').trim(),
      instanceId: (container.querySelector('#field-whatsapp-instance-id')?.value || '').trim(),
      apiToken: (container.querySelector('#field-whatsapp-api-token')?.value || '').trim(),
    };
  },

  _gatherRulesData(container) {
    return {
      alertDaysBefore: parseInt(container.querySelector('#field-alert-days')?.value) || 3,
      alertTime: container.querySelector('#field-alert-time')?.value || '08:00',
      alertPhone: (container.querySelector('#field-alert-phone')?.value || '').trim(),
      reminderActive: container.querySelector('#field-reminder-active')?.checked || false,
      reminderTime: container.querySelector('#field-reminder-time')?.value || '09:00',
      reminderMsg: (container.querySelector('#field-reminder-msg')?.value || '').trim(),
    };
  },

  // ═══════════════════════════════════════════════════════════════════
  //  BROADCAST — SECTOR & CONTACTS
  // ═══════════════════════════════════════════════════════════════════

  getContactsBySector(sectorId) {
    if (!window.BrigadaData.users) return [];
    return window.BrigadaData.users.filter(u => {
      if (u.status !== 'active') return false;
      if (!u.whatsapp || !u.whatsapp.trim()) return false;
      if (u.sector === 'todos') return true;
      return u.sector === sectorId;
    });
  },

  getAllSelectedContacts() {
    const seen = new Set();
    const contacts = [];
    this.selectedSectors.forEach(sectorId => {
      this.getContactsBySector(sectorId).forEach(u => {
        if (!seen.has(u.id)) {
          seen.add(u.id);
          contacts.push(u);
        }
      });
    });
    return contacts;
  },

  updateSectorCards(container) {
    this.SECTORS.forEach(s => {
      const card = container.querySelector(`.sector-card[data-sector="${s.id}"]`);
      if (card) {
        const count = this.getContactsBySector(s.id).length;
        const countEl = card.querySelector('.sector-count');
        if (countEl) countEl.textContent = `${count} contato${count !== 1 ? 's' : ''}`;
      }
    });
  },

  updateBroadcastSummary(container) {
    const sectorsContainer = container.querySelector('#summary-sectors-badges');
    const typeContainer = container.querySelector('#summary-msg-type-badge');
    if (!sectorsContainer || !typeContainer) return;

    // 1. Update sectors
    if (this.selectedSectors.size === 0) {
      sectorsContainer.innerHTML = '<span style="font-size: 0.82rem; color: #ef4444; font-weight: 600;">⚠️ Nenhum setor selecionado</span>';
    } else {
      sectorsContainer.innerHTML = Array.from(this.selectedSectors).map(sectorId => {
        const sector = this.SECTORS.find(s => s.id === sectorId);
        if (!sector) return '';
        return `
          <span class="badge" style="
            font-size: 0.75rem; padding: 0.2rem 0.65rem;
            background: ${sector.color}20; color: ${sector.color};
            border: 1px solid ${sector.color}35; display: inline-flex; align-items: center; gap: 0.25rem;
          ">
            <span>${sector.icon}</span> ${sector.label}
          </span>
        `;
      }).join('');
    }

    // 2. Update message type
    const activeTypeCard = container.querySelector('.msg-type-card[style*="border-color: var(--accent-border)"]');
    const type = activeTypeCard ? activeTypeCard.dataset.type : 'custom';

    const typeConfig = {
      custom: { label: '📝 Personalizada', color: '#818cf8', bg: 'rgba(99,102,241,0.1)' },
      alert:  { label: '🚨 Alerta de Validade', color: '#f87171', bg: 'rgba(239,68,68,0.1)' },
      report: { label: '📋 Relatório Diário', color: '#fbbf24', bg: 'rgba(245,158,11,0.1)' },
      invoice: { label: '📉 Auditoria de Notas', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
      checklist: { label: '🧹 Checklist do Dia', color: '#34d399', bg: 'rgba(52,211,153,0.1)' }
    }[type] || { label: '📝 Personalizada', color: '#818cf8', bg: 'rgba(99,102,241,0.1)' };

    typeContainer.innerHTML = `
      <span class="badge" style="
        font-size: 0.75rem; padding: 0.2rem 0.65rem;
        background: ${typeConfig.bg}; color: ${typeConfig.color};
        border: 1px solid ${typeConfig.color}30;
      ">
        ${typeConfig.label}
      </span>
    `;
  },

  updateRecipientsList(container) {
    const listEl = container.querySelector('#broadcast-recipients-list');
    const countBadge = container.querySelector('#recipients-count');
    if (!listEl) return;

    const contacts = this.getAllSelectedContacts();

    if (countBadge) {
      countBadge.textContent = `${contacts.length} selecionado${contacts.length !== 1 ? 's' : ''}`;
      countBadge.className = contacts.length > 0 ? 'badge badge--ok' : 'badge badge--expired';
    }

    if (contacts.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; padding: 1.5rem; color: var(--text-tertiary); font-size: 0.8rem;">
          ${this.selectedSectors.size === 0
            ? 'Selecione setores acima para carregar contatos'
            : 'Nenhum contato com WhatsApp cadastrado nos setores selecionados'}
        </div>`;
      return;
    }

    const sectorLabels = {
      'todos': '🌍 Todos', 'açougue': '🥩 Açougue', 'pereciveis': '🧊 Perecíveis'
    };

    listEl.innerHTML = contacts.map(u => `
      <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.6rem; border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.15s ease;"
           onmouseenter="this.style.background='rgba(255,255,255,0.03)'" onmouseleave="this.style.background='transparent'">
        <input type="checkbox" class="chk-recipient" data-phone="${u.whatsapp}" ${this.excludedRecipients.has(u.whatsapp) ? '' : 'checked'} style="cursor: pointer; width: 14px; height: 14px; margin: 0 0.35rem 0 0; accent-color: var(--accent); flex-shrink: 0;">
        <div style="width: 28px; height: 28px; border-radius: 50%; background: var(--accent-subtle); border: 1px solid var(--accent-border); display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 700; color: var(--text-accent); flex-shrink: 0;">
          ${(u.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${u.name}</div>
          <div style="font-size: 0.7rem; color: var(--text-tertiary);">📱 ${u.whatsapp}</div>
        </div>
        <span class="badge" style="font-size: 0.62rem; padding: 0.1rem 0.35rem; background: rgba(255,255,255,0.05); color: var(--text-secondary); border: 1px solid var(--glass-border); flex-shrink: 0;">
          ${sectorLabels[u.sector] || u.sector}
        </span>
        <button type="button" class="btn btn--ghost btn-send-individual" data-phone="${u.whatsapp}" data-sector="${u.sector}" data-name="${u.name}" style="
          font-size: 0.68rem; padding: 0.25rem 0.5rem; display: flex; align-items: center; gap: 0.25rem;
          background: rgba(99,102,241,0.08); color: #818cf8; border-color: rgba(99,102,241,0.15); flex-shrink: 0;
        " onmouseover="this.style.background='rgba(99,102,241,0.15)'" onmouseout="this.style.background='rgba(99,102,241,0.08)'">
          <span class="spinner btn-individual-spinner" style="display:none; width: 10px; height: 10px; border-width: 1.5px;"></span>
          <span>📨 Enviar</span>
        </button>
      </div>
    `).join('');

    // Bind checkbox change listeners
    listEl.querySelectorAll('.chk-recipient').forEach(chk => {
      chk.addEventListener('change', () => {
        const phone = chk.dataset.phone;
        if (chk.checked) {
          this.excludedRecipients.delete(phone);
        } else {
          this.excludedRecipients.add(phone);
        }
        
        // Update header Select All checkbox status
        const chkSelectAll = container.querySelector('#chk-select-all-recipients');
        if (chkSelectAll) {
          const checkedCount = listEl.querySelectorAll('.chk-recipient:checked').length;
          const totalCount = contacts.length;
          chkSelectAll.checked = checkedCount === totalCount;
        }

        this._updateBroadcastEstimate(container);
      });
    });

    // Bind individual send buttons
    listEl.querySelectorAll('.btn-send-individual').forEach(btn => {
      btn.addEventListener('click', async () => {
        const phone = btn.dataset.phone;
        const name = btn.dataset.name;
        const sectorId = btn.dataset.sector;
        const spinner = btn.querySelector('.btn-individual-spinner');
        
        try {
          const activeTypeCard = container.querySelector('.msg-type-card[style*="border-color: var(--accent-border)"]');
          const type = activeTypeCard ? activeTypeCard.dataset.type : 'custom';
          
          let messageToSend = '';
          if (type === 'custom') {
            messageToSend = (container.querySelector('#broadcast-message')?.value || '').trim();
            if (!messageToSend) {
              window.BrigadaUI.showToast('Digite uma mensagem personalizada antes de enviar.', 'error');
              return;
            }
          } else {
            // Generate auto message specifically filtered for this user's sector!
            messageToSend = this.generateAutoMessage(type, sectorId);
          }

          // Open the preview modal
          this.showPreviewModal(name, messageToSend, async () => {
            btn.disabled = true;
            if (spinner) spinner.style.display = 'inline-block';
            
            try {
              const res = await window.BrigadaData.broadcastWhatsApp([phone], messageToSend);
              if (res.success) {
                window.BrigadaUI.showToast(`Mensagem individual enviada para ${name}!`, 'success');
              } else {
                window.BrigadaUI.showToast(res.error || `Erro ao enviar para ${name}`, 'error');
              }
            } catch (err) {
              window.BrigadaUI.showToast(`Falha no envio para ${name}`, 'error');
            } finally {
              btn.disabled = false;
              if (spinner) spinner.style.display = 'none';
            }
          });

        } catch (err) {
          window.BrigadaUI.showToast(`Erro ao preparar envio para ${name}`, 'error');
        }
      });
    });
  },

  showPreviewModal(name, message, onConfirm) {
    const existing = document.getElementById('notif-preview-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'notif-preview-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.2s ease;
    `;

    modal.innerHTML = `
      <div class="glass-panel" style="
        width: 90%; max-width: 480px;
        padding: 1.5rem;
        border: 1px solid var(--glass-border);
        box-shadow: var(--shadow-xl);
        transform: translateY(15px);
        transition: transform 0.2s ease;
        margin: auto;
      ">
        <h3 style="margin: 0 0 0.75rem 0; font-size: 1.05rem; display: flex; align-items: center; gap: 0.5rem; color: var(--text-primary);">
          <span>📨</span> Confirmar Envio para ${name}
        </h3>
        
        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
          Revise o conteúdo da mensagem que será enviada via WhatsApp:
        </p>

        <div style="
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          padding: 1rem;
          font-family: var(--font);
          font-size: 0.82rem;
          line-height: 1.5;
          color: var(--text-primary);
          white-space: pre-wrap;
          max-height: 200px;
          overflow-y: auto;
          margin-bottom: 1.25rem;
          scrollbar-width: thin;
        ">${message}</div>

        <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
          <button type="button" class="btn btn--ghost modal-cancel" style="padding: 0.45rem 1rem; font-size: 0.8rem;">Cancelar</button>
          <button type="button" class="btn btn--primary modal-confirm" style="padding: 0.45rem 1.25rem; font-size: 0.8rem;">Confirmar e Enviar</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    setTimeout(() => {
      modal.style.opacity = '1';
      const panel = modal.querySelector('.glass-panel');
      if (panel) panel.style.transform = 'translateY(0)';
    }, 10);

    const closeModal = () => {
      modal.style.opacity = '0';
      const panel = modal.querySelector('.glass-panel');
      if (panel) panel.style.transform = 'translateY(15px)';
      setTimeout(() => modal.remove(), 200);
    };

    modal.querySelector('.modal-cancel').addEventListener('click', closeModal);
    modal.querySelector('.modal-confirm').addEventListener('click', () => {
      onConfirm();
      closeModal();
    });
  },

  _updateBroadcastEstimate(container) {
    const contacts = this.getAllSelectedContacts();
    const activeCount = contacts.filter(c => !this.excludedRecipients.has(c.whatsapp)).length;
    const estimateEl = container.querySelector('#broadcast-estimate');
    if (estimateEl) {
      estimateEl.textContent = `${activeCount} mensagen${activeCount !== 1 ? 's serão enviadas' : ' será enviada'}`;
    }
  },

  // ═══════════════════════════════════════════════════════════════════
  //  BROADCAST — AUTO MESSAGE GENERATION
  // ═══════════════════════════════════════════════════════════════════

  generateAutoMessage(type, forcedSectorId = null) {
    const products = window.BrigadaData.products || [];
    const now = new Date();
    const alertDays = parseInt(this.config?.alertDaysBefore) || 3;
    const alertDate = new Date();
    alertDate.setDate(alertDate.getDate() + alertDays);

    let categories = new Set();
    const targetSectors = forcedSectorId ? [forcedSectorId] : Array.from(this.selectedSectors);
    targetSectors.forEach(sectorId => {
      const sector = this.SECTORS.find(s => s.id === sectorId);
      if (sector) sector.categories.forEach(c => categories.add(c));
    });

    let filtered = products;
    if (categories.size > 0) {
      filtered = products.filter(p => categories.has(p.category));
    }

    if (type === 'alert') {
      const expired = filtered.filter(p => {
        if (!p.expirationDate) return false;
        const exp = new Date(p.expirationDate);
        return exp < now && !p.expiredAction;
      });

      const expiring = filtered.filter(p => {
        const dStr = p.endDate || p.expirationDate;
        if (!dStr) return false;
        const exp = new Date(dStr);
        return exp >= now && exp <= alertDate && !p.expiredAction;
      });

      let msg = `🛡️ *BRIGADA-IA — Alerta de Validade*\n📅 ${now.toLocaleDateString('pt-BR')}\n\n`;

      if (expired.length > 0) {
        msg += `🔴 *Produtos VENCIDOS (${expired.length}):*\n`;
        expired.slice(0, 20).forEach(p => {
          const dStr = p.endDate || p.expirationDate;
          const exp = new Date(dStr);
          msg += `  • ${p.name} (venceu: ${exp.toLocaleDateString('pt-BR')})\n`;
        });
        if (expired.length > 20) msg += `  ... e mais ${expired.length - 20} produtos\n`;
        msg += '\n';
      }

      if (expiring.length > 0) {
        msg += `⚠️ *A VENCER em ${alertDays} dia${alertDays > 1 ? 's' : ''} (${expiring.length}):*\n`;
        expiring.slice(0, 20).forEach(p => {
          const dStr = p.endDate || p.expirationDate;
          const exp = new Date(dStr);
          msg += `  • ${p.name} (vence: ${exp.toLocaleDateString('pt-BR')})\n`;
        });
        if (expiring.length > 20) msg += `  ... e mais ${expiring.length - 20} produtos\n`;
        msg += '\n';
      }

      if (expired.length === 0 && expiring.length === 0) {
        msg += '✅ Nenhum produto vencido ou a vencer nos próximos dias!\n\n';
      }

      msg += `_Gerado automaticamente pelo BRIGADA-IA_`;
      return msg;
    }

    if (type === 'report') {
      let exp = 0, soon = 0, ok = 0, quebra = 0, troca = 0, tratado = 0;

      filtered.forEach(p => {
        if (p.expiredAction === 'quebra') { quebra++; return; }
        if (p.expiredAction === 'troca') { troca++; return; }
        if (p.expiredAction === 'tratado' || p.expiredAction === 'vendido') { tratado++; ok++; return; }
        const dStr = p.endDate || p.expirationDate;
        if (!dStr) { ok++; return; }
        const d = new Date(dStr);
        if (d < now && !p.expiredAction) exp++;
        else if (d <= alertDate && !p.expiredAction) soon++;
        else ok++;
      });

      const total = filtered.length;
      const conformidade = total > 0 ? Math.round((ok / total) * 100) : 100;

      let msg = `🛡️ *BRIGADA-IA — Relatório Diário*\n📅 ${now.toLocaleDateString('pt-BR')}\n\n`;
      msg += `📊 *Resumo do Estoque:*\n`;
      msg += `  ✅ OK: ${ok} produtos\n`;
      msg += `  ⚠️ A vencer: ${soon} produtos\n`;
      msg += `  🔴 Vencidos: ${exp} produtos\n`;
      msg += `  ❌ Quebra: ${quebra} produtos\n`;
      msg += `  🔄 Troca: ${troca} produtos\n\n`;
      msg += `📈 *Taxa de conformidade:* ${conformidade}%\n`;
      msg += `📦 *Total de produtos:* ${total}\n\n`;
      msg += `_Gerado automaticamente pelo BRIGADA-IA_`;
      return msg;
    }

    if (type === 'invoice') {
      const allInvoices = window.BrigadaData.produtosSemNota || [];
      let filteredInvoices = allInvoices;
      if (categories.size > 0) {
        filteredInvoices = allInvoices.filter(p => categories.has(p.category));
      }

      let msg = `🛡️ *BRIGADA-IA — Auditoria de Notas*\n📅 ${now.toLocaleDateString('pt-BR')}\n\n`;
      if (filteredInvoices.length > 0) {
        msg += `📉 *PRODUTOS PENDENTES DE NOTA FISCAL (${filteredInvoices.length}):*\n`;
        filteredInvoices.slice(0, 15).forEach(p => {
          msg += `  • ${p.name} (PLU/ID: ${p.plu || p.id})\n`;
        });
        if (filteredInvoices.length > 15) {
          msg += `  ... e mais ${filteredInvoices.length - 15} produtos\n`;
        }
        msg += '\n⚠️ *Ação necessária:* Por favor, regularize as notas fiscais pendentes no painel do sistema.';
      } else {
        msg += `✅ Tudo regularizado! Nenhum produto pendente de nota fiscal nos setores selecionados.`;
      }
      return msg;
    }

    if (type === 'checklist') {
      const sectorTasks = {
        'açougue': [
          'Verificar e registrar temperatura das câmaras frias.',
          'Higienizar moedores de carne, serras e facas.',
          'Limpar e organizar o balcão de atendimento.',
          'Auditoria de validades das carnes embaladas.'
        ],
        'pereciveis': [
          'Verificar temperatura dos balcões de frios e laticínios.',
          'Limpeza e organização das câmaras de congelados e resfriados.',
          'Rodízio PEPS (Primeiro que Entra, Primeiro que Sai).'
        ]
      };

      let msg = `🛡️ *BRIGADA-IA — Checklist do Dia*\n📅 ${now.toLocaleDateString('pt-BR')}\n\n`;
      
      let tasksList = [];
      targetSectors.forEach(sectorId => {
        const tasks = sectorTasks[sectorId];
        if (tasks) {
          tasksList.push(`*${sectorId.toUpperCase()}:*`, ...tasks.map(t => `  [ ] ${t}`));
        }
      });

      if (tasksList.length === 0) {
        tasksList = [
          '*GERAL:*',
          '  [ ] Auditoria completa de validades.',
          '  [ ] Limpeza dos carrinhos de compras e cestas.',
          '  [ ] Verificação geral de etiquetas de preço.'
        ];
      }

      msg += `🧹 *ATIVIDADES E ROTINAS:* \n${tasksList.join('\n')}\n\n`;
      msg += `🚀 _Trabalho em equipe gera excelência! Bom turno!_`;
      return msg;
    }

    return '';
  },

  // ═══════════════════════════════════════════════════════════════════
  //  BROADCAST — SEND
  // ═══════════════════════════════════════════════════════════════════

  async sendBroadcast(container) {
    const allContacts = this.getAllSelectedContacts();
    const contacts = allContacts.filter(c => !this.excludedRecipients.has(c.whatsapp));
    const message = (container.querySelector('#broadcast-message')?.value || '').trim();
    const spinner = container.querySelector('#broadcast-spinner');
    const btnSend = container.querySelector('#btn-send-broadcast');

    if (contacts.length === 0) {
      window.BrigadaUI.showToast('Selecione pelo menos um destinatário ativo.', 'error');
      return;
    }
    if (!message) {
      window.BrigadaUI.showToast('Digite ou gere uma mensagem antes de enviar.', 'error');
      return;
    }

    if (!confirm(`Enviar mensagem para ${contacts.length} contato(s)?`)) return;

    const phones = contacts.map(u => u.whatsapp);

    if (btnSend) btnSend.disabled = true;
    if (spinner) spinner.style.display = 'inline-block';

    try {
      const res = await window.BrigadaData.broadcastWhatsApp(phones, message);

      if (spinner) spinner.style.display = 'none';
      if (btnSend) btnSend.disabled = false;

      if (res.success) {
        const icon = res.simulated ? 'info' : 'success';
        window.BrigadaUI.showToast(res.message || `Disparo concluído: ${res.sent} enviadas.`, icon);
      } else {
        window.BrigadaUI.showToast(res.error || 'Erro ao enviar disparo.', 'error');
      }
    } catch (err) {
      if (spinner) spinner.style.display = 'none';
      if (btnSend) btnSend.disabled = false;
      window.BrigadaUI.showToast('Falha ao processar disparo em massa.', 'error');
    }
  },

  // ═══════════════════════════════════════════════════════════════════
  //  PUSH NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════════

  async checkPushSubscription(container) {
    const badge = container.querySelector('#push-status-badge');
    const btnSub = container.querySelector('#btn-subscribe-push');
    const btnUnsub = container.querySelector('#btn-unsubscribe-push');
    const btnTest = container.querySelector('#btn-test-push');

    if (!badge) return;

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      badge.textContent = 'NÃO SUPORTADO 🔴';
      badge.className = 'badge badge--expired';
      if (btnSub) btnSub.style.display = 'none';
      if (btnUnsub) btnUnsub.style.display = 'none';
      if (btnTest) btnTest.style.display = 'none';
      return;
    }

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();

      if (sub) {
        badge.textContent = 'ATIVADO 🟢';
        badge.className = 'badge badge--ok';
        if (btnSub) btnSub.style.display = 'none';
        if (btnUnsub) btnUnsub.style.display = 'inline-block';
        if (btnTest) btnTest.style.display = 'inline-block';
      } else {
        badge.textContent = 'DESATIVADO 🟡';
        badge.className = 'badge badge--warning';
        if (btnSub) btnSub.style.display = 'inline-block';
        if (btnUnsub) btnUnsub.style.display = 'none';
        if (btnTest) btnTest.style.display = 'none';
      }
    } catch (err) {
      console.error('Erro ao verificar inscrição push:', err);
      badge.textContent = 'ERRO 🔴';
      badge.className = 'badge badge--expired';
    }
  },

  async subscribePush(container) {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        window.BrigadaUI.showToast('Permissão de notificação negada.', 'error');
        return;
      }

      window.BrigadaUI.showToast('Obtendo chaves do servidor...', 'info');
      const { publicKey } = await fetch('/api/settings/push/public-key').then(r => r.json());
      const applicationServerKey = this.urlBase64ToUint8Array(publicKey);

      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });

      window.BrigadaUI.showToast('Registrando inscrição...', 'info');
      const res = await fetch('/api/settings/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      }).then(r => r.json());

      if (res.success) {
        window.BrigadaUI.showToast('Notificações ativadas!', 'success');
        this.checkPushSubscription(container);
      } else {
        window.BrigadaUI.showToast(res.error || 'Erro ao registrar.', 'error');
      }
    } catch (err) {
      console.error('Erro ao se inscrever no push:', err);
      window.BrigadaUI.showToast('Falha ao ativar notificações push.', 'error');
    }
  },

  async unsubscribePush(container) {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await fetch('/api/settings/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sub)
        });
      }
      window.BrigadaUI.showToast('Notificações desativadas.', 'success');
      this.checkPushSubscription(container);
    } catch (err) {
      console.error('Erro ao cancelar inscrição:', err);
      window.BrigadaUI.showToast('Erro ao desativar.', 'error');
    }
  },

  // ═══════════════════════════════════════════════════════════════════
  //  UTILITIES
  // ═══════════════════════════════════════════════════════════════════

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
};

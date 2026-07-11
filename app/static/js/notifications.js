/**
 * BRIGADA-IA — Notifications & Reminders (WhatsApp) Module
 */window.BrigadaNotifications = {
  config: null,
  pollingIntervals: {},

  async render(container) {
    this.stopPolling('all');
    const isSuperAdmin = window.BrigadaAuth.isSuperAdmin();

    container.innerHTML = `
      <div class="panel-header">
        <div class="panel-header__left">
          <h2 class="panel-title">🔔 Notificações e Lembretes</h2>
          <p class="panel-subtitle">Configure alertas automáticos de validade por WhatsApp</p>
        </div>
      </div>

      ${isSuperAdmin ? `
      <div class="glass-panel stagger" style="max-width: 800px; margin-bottom: 2rem;">
        <div style="padding: 1.5rem;">
          <h3 class="glass-panel__title" style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>📱</span> Integração com WhatsApp Gateway
          </h3>

          <form id="whatsapp-settings-form">
            <!-- Habilitar Serviço -->
            <div class="form-group" style="display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 8px; border: 1px solid var(--glass-border); margin-bottom: 1.5rem;">
              <div>
                <label class="form-label" style="margin-bottom: 2px; font-size: 1rem;">Habilitar Notificações Automáticas</label>
                <p style="color: var(--text-secondary); font-size: 0.8rem; margin: 0;">Envio automático diário de alertas de produtos vencendo</p>
              </div>
              <label class="switch">
                <input type="checkbox" id="field-whatsapp-enabled">
                <span class="slider round"></span>
              </label>
            </div>

            <!-- Seção de credenciais do Gateway -->
            <div id="gateway-config-section" style="display: none; transition: all 0.3s ease;">
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem;">
                
                <!-- CARD 1: INSTÂNCIA PRINCIPAL -->
                <div class="glass-panel" style="padding: 1.25rem; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.01); border-radius: 12px; display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    <h4 style="margin: 0 0 1rem 0; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem; color: var(--text-primary);">
                      <span>🟢</span> Instância Principal
                    </h4>
                    
                    <div class="form-group">
                      <label class="form-label">URL do Gateway (API) *</label>
                      <input type="url" id="field-whatsapp-api-url" class="form-input" placeholder="ex: http://74.1.20.130:3000" required>
                    </div>

                    <div class="form-group">
                      <label class="form-label">ID da Instância *</label>
                      <input type="text" id="field-whatsapp-instance-id" class="form-input" placeholder="ex: MinhaInstancia" required>
                    </div>
                    
                    <div class="form-group">
                      <label class="form-label">Token de Acesso</label>
                      <input type="password" id="field-whatsapp-api-token" class="form-input" placeholder="Chave de API secreta">
                    </div>

                    <!-- Status / QR Code Principal -->
                    <div class="connection-status-panel" style="background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 8px; border: 1px dashed var(--glass-border); margin-top: 1rem; margin-bottom: 1rem;">
                      <div style="font-size: 0.85rem; margin-bottom: 0.75rem; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap;">
                        <span style="font-weight: 500; color: var(--text-secondary);">Status da Conexão:</span>
                        <span id="whatsapp-connection-badge" class="badge badge--expired" style="font-size: 0.75rem; padding: 0.15rem 0.5rem;">Carregando...</span>
                      </div>
                      
                      <div id="whatsapp-qr-wrapper" style="display: none; text-align: center; margin: 1rem 0; background: #fff; padding: 0.75rem; border-radius: 8px; width: fit-content; margin-left: auto; margin-right: auto; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                        <img id="whatsapp-qr-image" style="width: 160px; height: 160px; display: block;" src="" alt="Scan QR Code">
                        <p style="color: #333; font-size: 0.75rem; margin: 0.4rem 0 0 0; font-weight: 500;">Escaneie o código</p>
                      </div>

                      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center;">
                        <button type="button" class="btn btn--primary" id="btn-connect-whatsapp" style="font-size: 0.75rem; padding: 0.4rem 0.8rem; flex: 1;">
                          Conectar / QR Code
                        </button>
                        <button type="button" class="btn btn--ghost" id="btn-disconnect-whatsapp" style="font-size: 0.75rem; padding: 0.4rem 0.8rem; display: none; background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.2); flex: 1;">
                          Desconectar
                        </button>
                        <button type="button" class="btn btn--ghost" id="btn-refresh-status" style="font-size: 0.75rem; padding: 0.4rem 0.8rem;">
                          🔄
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- CARD 2: INSTÂNCIA DE FALLBACK -->
                <div class="glass-panel" style="padding: 1.25rem; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.01); border-radius: 12px; display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                      <h4 style="margin: 0; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem; color: var(--text-primary);">
                        <span>🟡</span> Instância de Fallback
                      </h4>
                      <label class="switch" style="transform: scale(0.85);">
                        <input type="checkbox" id="field-whatsapp-enabled-fallback">
                        <span class="slider round"></span>
                      </label>
                    </div>

                    <!-- Seção interna do Fallback -->
                    <div id="fallback-instance-config-section" style="transition: all 0.3s ease; opacity: 0.5; pointer-events: none;">
                      <div class="form-group">
                        <label class="form-label">URL do Gateway (API) *</label>
                        <input type="url" id="field-whatsapp-api-url-fallback" class="form-input" placeholder="ex: https://evolution.rotaflash.com">
                      </div>

                      <div class="form-group">
                        <label class="form-label">ID da Instância *</label>
                        <input type="text" id="field-whatsapp-instance-id-fallback" class="form-input" placeholder="ex: InstanciaFallback">
                      </div>
                      
                      <div class="form-group">
                        <label class="form-label">Token de Acesso</label>
                        <input type="password" id="field-whatsapp-api-token-fallback" class="form-input" placeholder="Chave de API secreta">
                      </div>

                      <!-- Status / QR Code Fallback -->
                      <div class="connection-status-panel" style="background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 8px; border: 1px dashed var(--glass-border); margin-top: 1rem; margin-bottom: 1rem;">
                        <div style="font-size: 0.85rem; margin-bottom: 0.75rem; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap;">
                          <span style="font-weight: 500; color: var(--text-secondary);">Status da Conexão:</span>
                          <span id="whatsapp-connection-badge-fallback" class="badge badge--expired" style="font-size: 0.75rem; padding: 0.15rem 0.5rem;">Carregando...</span>
                        </div>
                        
                        <div id="whatsapp-qr-wrapper-fallback" style="display: none; text-align: center; margin: 1rem 0; background: #fff; padding: 0.75rem; border-radius: 8px; width: fit-content; margin-left: auto; margin-right: auto; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                          <img id="whatsapp-qr-image-fallback" style="width: 160px; height: 160px; display: block;" src="" alt="Scan QR Code">
                          <p style="color: #333; font-size: 0.75rem; margin: 0.4rem 0 0 0; font-weight: 500;">Escaneie o código</p>
                        </div>

                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center;">
                          <button type="button" class="btn btn--primary" id="btn-connect-whatsapp-fallback" style="font-size: 0.75rem; padding: 0.4rem 0.8rem; flex: 1;">
                            Conectar / QR Code
                          </button>
                          <button type="button" class="btn btn--ghost" id="btn-disconnect-whatsapp-fallback" style="font-size: 0.75rem; padding: 0.4rem 0.8rem; display: none; background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.2); flex: 1;">
                            Desconectar
                          </button>
                          <button type="button" class="btn btn--ghost" id="btn-refresh-status-fallback" style="font-size: 0.75rem; padding: 0.4rem 0.8rem;">
                            🔄
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <hr style="border: 0; border-top: 1px solid var(--glass-border); margin: 1.5rem 0;">

            <!-- Seção de Alertas -->
            <h3 class="glass-panel__title" style="margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
              <span>🚨</span> Regras dos Alertas de Validade
            </h3>

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
              <p style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 4px;">Código do país + DDD + Número. Exemplo: 55 para Brasil (ex: 5511999999999)</p>
            </div>

            <hr style="border: 0; border-top: 1px solid var(--glass-border); margin: 1.5rem 0;">

            <!-- Seção de Lembretes adicionais -->
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

            <!-- Botões -->
            <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem;">
              <button type="button" class="btn btn--ghost" id="btn-test-whatsapp" style="display: flex; align-items: center; gap: 0.5rem;">
                <span class="spinner" id="test-spinner" style="display:none; width: 14px; height: 14px; border-width: 2px;"></span>
                <span>⚡ Testar Envio</span>
              </button>
              <button type="submit" class="btn btn--primary" id="btn-save-settings">
                Salvar Configurações
              </button>
            </div>
          </form>
        </div>
      </div>
      ` : ''}

      <div class="glass-panel stagger" style="max-width: 800px; margin-bottom: 2rem;">
        <div style="padding: 1.5rem;">
          <h3 class="glass-panel__title" style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>🔔</span> Notificações Push do Navegador (Web Push)
          </h3>
          <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1.5rem;">
            Receba alertas de validade diretamente na tela do seu dispositivo através das notificações nativas do navegador.
          </p>

          <div style="background: rgba(255,255,255,0.02); padding: 1.25rem; border-radius: 8px; border: 1px dashed var(--glass-border); margin-bottom: 1.5rem;">
            <h4 style="margin: 0 0 1rem 0; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem;">
              <span>Status:</span> <span id="push-status-badge" class="badge badge--expired" style="font-size: 0.8rem; padding: 0.2rem 0.6rem;">Carregando...</span>
            </h4>
            
            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
              <button type="button" class="btn btn--primary" id="btn-subscribe-push" style="font-size: 0.85rem; padding: 0.5rem 1rem;">
                Ativar neste Navegador
              </button>
              <button type="button" class="btn btn--ghost" id="btn-unsubscribe-push" style="font-size: 0.85rem; padding: 0.5rem 1rem; display: none; background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.2);">
                Desativar neste Navegador
              </button>
              <button type="button" class="btn btn--ghost" id="btn-test-push" style="font-size: 0.85rem; padding: 0.5rem 1rem; display: none;">
                ⚡ Testar Notificação Push
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    await this.loadAndFillForm(container);
    this.bindEvents(container);
  },

  async loadAndFillForm(container) {
    if (window.BrigadaAuth.isSuperAdmin()) {
      this.config = await window.BrigadaData.loadSettings('whatsapp');

      const fieldEnabled = container.querySelector('#field-whatsapp-enabled');
      const fieldApiUrl = container.querySelector('#field-whatsapp-api-url');
      const fieldInstanceId = container.querySelector('#field-whatsapp-instance-id');
      const fieldApiToken = container.querySelector('#field-whatsapp-api-token');
      
      const fieldEnabledFallback = container.querySelector('#field-whatsapp-enabled-fallback');
      const fieldApiUrlFallback = container.querySelector('#field-whatsapp-api-url-fallback');
      const fieldInstanceIdFallback = container.querySelector('#field-whatsapp-instance-id-fallback');
      const fieldApiTokenFallback = container.querySelector('#field-whatsapp-api-token-fallback');
      
      const fieldAlertDays = container.querySelector('#field-alert-days');
      const fieldAlertTime = container.querySelector('#field-alert-time');
      const fieldAlertPhone = container.querySelector('#field-alert-phone');
      const fieldReminderActive = container.querySelector('#field-reminder-active');
      const fieldReminderTime = container.querySelector('#field-reminder-time');
      const fieldReminderMsg = container.querySelector('#field-reminder-msg');

      if (this.config) {
        fieldEnabled.checked = !!this.config.enabled;
        fieldApiUrl.value = this.config.apiUrl || '';
        fieldInstanceId.value = this.config.instanceId || '';
        fieldApiToken.value = this.config.apiToken || '';
        
        fieldEnabledFallback.checked = !!this.config.enabledFallback;
        fieldApiUrlFallback.value = this.config.apiUrlFallback || '';
        fieldInstanceIdFallback.value = this.config.instanceIdFallback || '';
        fieldApiTokenFallback.value = this.config.apiTokenFallback || '';
        
        fieldAlertDays.value = this.config.alertDaysBefore !== undefined ? this.config.alertDaysBefore : 3;
        fieldAlertTime.value = this.config.alertTime || '08:00';
        fieldAlertPhone.value = this.config.alertPhone || '';
        fieldReminderActive.checked = !!this.config.reminderActive;
        fieldReminderTime.value = this.config.reminderTime || '09:00';
        fieldReminderMsg.value = this.config.reminderMsg || 'Atenção equipe! Favor verificar as validades do setor de aves hoje.';
      }

      this.toggleSections(container);

      if (this.config && this.config.enabled) {
        this.updateConnectionStatus(container, 'primary');
        if (this.config.enabledFallback) {
          this.updateConnectionStatus(container, 'fallback');
        }
      }
    }
    this.checkPushSubscription(container);
  },

  toggleSections(container) {
    const gatewaySection = container.querySelector('#gateway-config-section');
    const remindersSection = container.querySelector('#reminders-config-section');
    const fallbackConfigSection = container.querySelector('#fallback-instance-config-section');

    const enabledChecked = container.querySelector('#field-whatsapp-enabled').checked;
    const remindersChecked = container.querySelector('#field-reminder-active').checked;
    const fallbackChecked = container.querySelector('#field-whatsapp-enabled-fallback').checked;

    gatewaySection.style.display = enabledChecked ? 'block' : 'none';
    remindersSection.style.display = remindersChecked ? 'block' : 'none';
    
    if (fallbackChecked) {
      fallbackConfigSection.style.opacity = '1';
      fallbackConfigSection.style.pointerEvents = 'auto';
      container.querySelector('#field-whatsapp-api-url-fallback').required = true;
      container.querySelector('#field-whatsapp-instance-id-fallback').required = true;
    } else {
      fallbackConfigSection.style.opacity = '0.5';
      fallbackConfigSection.style.pointerEvents = 'none';
      container.querySelector('#field-whatsapp-api-url-fallback').removeAttribute('required');
      container.querySelector('#field-whatsapp-instance-id-fallback').removeAttribute('required');
    }
  },

  startPolling(container, type = 'primary') {
    if (this.pollingIntervals[type]) clearInterval(this.pollingIntervals[type]);
    this.pollingIntervals[type] = setInterval(() => {
      this.updateConnectionStatus(container, type, true);
    }, 5000);
  },

  stopPolling(type = 'primary') {
    if (type === 'all') {
      Object.keys(this.pollingIntervals).forEach(k => {
        if (this.pollingIntervals[k]) {
          clearInterval(this.pollingIntervals[k]);
          this.pollingIntervals[k] = null;
        }
      });
    } else {
      if (this.pollingIntervals[type]) {
        clearInterval(this.pollingIntervals[type]);
        this.pollingIntervals[type] = null;
      }
    }
  },

  async updateConnectionStatus(container, type = 'primary', isPolling = false) {
    try {
      const suffix = type === 'fallback' ? '-fallback' : '';
      const res = await fetch(`/api/settings/whatsapp/instance-status?type=${type}`).then(r => r.json());
      const badge = container.querySelector(`#whatsapp-connection-badge${suffix}`);
      const qrWrapper = container.querySelector(`#whatsapp-qr-wrapper${suffix}`);
      const qrImage = container.querySelector(`#whatsapp-qr-image${suffix}`);
      const btnConnect = container.querySelector(`#btn-connect-whatsapp${suffix}`);
      const btnDisconnect = container.querySelector(`#btn-disconnect-whatsapp${suffix}`);
      
      if (!badge) return;

      if (res.status === 'CONNECTED') {
        badge.textContent = 'CONECTADO 🟢';
        badge.className = 'badge badge--ok';
        qrWrapper.style.display = 'none';
        btnConnect.style.display = 'none';
        btnDisconnect.style.display = 'inline-block';
        this.stopPolling(type);
      } else if (res.status === 'QR_READY' && res.qrImage) {
        badge.textContent = 'AGUARDANDO LEITURA DO QR CODE 🟡';
        badge.className = 'badge badge--warning';
        qrImage.src = res.qrImage;
        qrWrapper.style.display = 'block';
        btnConnect.style.display = 'none';
        btnDisconnect.style.display = 'inline-block';
        
        if (!isPolling) this.startPolling(container, type);
      } else if (res.status === 'CONNECTING') {
        badge.textContent = 'CONECTANDO 🔵';
        badge.className = 'badge badge--info';
        qrWrapper.style.display = 'none';
        btnConnect.style.display = 'none';
        btnDisconnect.style.display = 'inline-block';
        if (!isPolling) this.startPolling(container, type);
      } else {
        badge.textContent = 'DESCONECTADO 🔴';
        badge.className = 'badge badge--expired';
        qrWrapper.style.display = 'none';
        btnConnect.style.display = 'inline-block';
        btnDisconnect.style.display = 'none';
        this.stopPolling(type);
      }
    } catch (e) {
      console.error(`Erro ao atualizar status do WhatsApp (${type}):`, e);
    }
  },

  bindEvents(container) {
    if (window.BrigadaAuth.isSuperAdmin()) {
      const form = container.querySelector('#whatsapp-settings-form');
      const fieldEnabled = container.querySelector('#field-whatsapp-enabled');
      const fieldEnabledFallback = container.querySelector('#field-whatsapp-enabled-fallback');
      const fieldReminderActive = container.querySelector('#field-reminder-active');
      const btnTest = container.querySelector('#btn-test-whatsapp');
      const testSpinner = container.querySelector('#test-spinner');

      const btnConnectInst = container.querySelector('#btn-connect-whatsapp');
      const btnDisconnectInst = container.querySelector('#btn-disconnect-whatsapp');
      const btnRefreshStatus = container.querySelector('#btn-refresh-status');

      const btnConnectInstFallback = container.querySelector('#btn-connect-whatsapp-fallback');
      const btnDisconnectInstFallback = container.querySelector('#btn-disconnect-whatsapp-fallback');
      const btnRefreshStatusFallback = container.querySelector('#btn-refresh-status-fallback');

      fieldEnabled.addEventListener('change', () => this.toggleSections(container));
      fieldEnabledFallback.addEventListener('change', () => {
        this.toggleSections(container);
        if (fieldEnabledFallback.checked) {
          this.updateConnectionStatus(container, 'fallback');
        } else {
          this.stopPolling('fallback');
        }
      });
      fieldReminderActive.addEventListener('change', () => this.toggleSections(container));

      btnConnectInst.addEventListener('click', async () => {
        window.BrigadaUI.showToast('Iniciando conexão da instância principal...', 'info');
        try {
          const res = await fetch('/api/settings/whatsapp/connect?type=primary', { method: 'POST' }).then(r => r.json());
          this.updateConnectionStatus(container, 'primary');
          if (res.status === 'QR_READY') {
            window.BrigadaUI.showToast('Instância principal pronta para escanear!', 'warning');
          } else if (res.status === 'CONNECTED') {
            window.BrigadaUI.showToast('Instância principal conectada com sucesso!', 'success');
          }
        } catch (err) {
          window.BrigadaUI.showToast('Falha ao tentar conectar a instância principal.', 'error');
        }
      });

      btnDisconnectInst.addEventListener('click', async () => {
        if (!confirm('Deseja realmente desconectar a instância principal do WhatsApp?')) return;
        try {
          const res = await fetch('/api/settings/whatsapp/disconnect?type=primary', { method: 'POST' }).then(r => r.json());
          if (res.success) {
            window.BrigadaUI.showToast('Desconectado com sucesso!', 'success');
            this.updateConnectionStatus(container, 'primary');
          }
        } catch (err) {
          window.BrigadaUI.showToast('Falha ao desconectar instância principal.', 'error');
        }
      });

      btnRefreshStatus.addEventListener('click', () => {
        this.updateConnectionStatus(container, 'primary');
        window.BrigadaUI.showToast('Status da instância principal atualizado!', 'success');
      });

      btnConnectInstFallback.addEventListener('click', async () => {
        window.BrigadaUI.showToast('Iniciando conexão da instância de fallback...', 'info');
        try {
          const res = await fetch('/api/settings/whatsapp/connect?type=fallback', { method: 'POST' }).then(r => r.json());
          this.updateConnectionStatus(container, 'fallback');
          if (res.status === 'QR_READY') {
            window.BrigadaUI.showToast('Instância de fallback pronta para escanear!', 'warning');
          } else if (res.status === 'CONNECTED') {
            window.BrigadaUI.showToast('Instância de fallback conectada com sucesso!', 'success');
          }
        } catch (err) {
          window.BrigadaUI.showToast('Falha ao tentar conectar a instância de fallback.', 'error');
        }
      });

      btnDisconnectInstFallback.addEventListener('click', async () => {
        if (!confirm('Deseja realmente desconectar a instância de fallback?')) return;
        try {
          const res = await fetch('/api/settings/whatsapp/disconnect?type=fallback', { method: 'POST' }).then(r => r.json());
          if (res.success) {
            window.BrigadaUI.showToast('Desconectado com sucesso!', 'success');
            this.updateConnectionStatus(container, 'fallback');
          }
        } catch (err) {
          window.BrigadaUI.showToast('Falha ao desconectar instância de fallback.', 'error');
        }
      });

      btnRefreshStatusFallback.addEventListener('click', () => {
        this.updateConnectionStatus(container, 'fallback');
        window.BrigadaUI.showToast('Status da instância de fallback atualizado!', 'success');
      });

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = this.gatherFormData(container);
        try {
          const res = await window.BrigadaData.saveSettings('whatsapp', data);
          if (res.success) {
            window.BrigadaUI.showToast(res.message || 'Configurações salvas com sucesso!', 'success');
            this.updateConnectionStatus(container, 'primary');
            if (data.enabledFallback) {
              this.updateConnectionStatus(container, 'fallback');
            }
          } else {
            window.BrigadaUI.showToast(res.error || 'Erro ao salvar configurações.', 'error');
          }
        } catch (err) {
          window.BrigadaUI.showToast(err.message || 'Erro ao tentar salvar.', 'error');
        }
      });

      btnTest.addEventListener('click', async () => {
        const phone = container.querySelector('#field-alert-phone').value.trim();
        if (!phone) {
          window.BrigadaUI.showToast('Preencha o campo de telefone para testar o envio.', 'error');
          return;
        }

        btnTest.disabled = true;
        testSpinner.style.display = 'inline-block';

        const data = this.gatherFormData(container);

        try {
          const res = await window.BrigadaData.testWhatsApp(data);
          testSpinner.style.display = 'none';
          btnTest.disabled = false;

          if (res.success) {
            if (res.warning) {
              window.BrigadaUI.showToast(res.warning, 'info');
            } else {
              window.BrigadaUI.showToast(res.message || 'Teste realizado com sucesso!', 'success');
            }
          } else {
            window.BrigadaUI.showToast(res.error || 'Erro ao realizar teste.', 'error');
          }
        } catch (err) {
          testSpinner.style.display = 'none';
          btnTest.disabled = false;
          window.BrigadaUI.showToast(err.message || 'Falha ao processar teste.', 'error');
        }
      });
    }

    const btnSubscribePush = container.querySelector('#btn-subscribe-push');
    const btnUnsubscribePush = container.querySelector('#btn-unsubscribe-push');
    const btnTestPush = container.querySelector('#btn-test-push');

    btnSubscribePush.addEventListener('click', () => this.subscribePush(container));
    btnUnsubscribePush.addEventListener('click', () => this.unsubscribePush(container));
    btnTestPush.addEventListener('click', async () => {
      try {
        const res = await fetch('/api/settings/push/test', { method: 'POST' }).then(r => r.json());
        if (res.success) {
          window.BrigadaUI.showToast(res.message, 'success');
        } else {
          window.BrigadaUI.showToast(res.error || 'Erro ao enviar notificação de teste.', 'error');
        }
      } catch (err) {
        window.BrigadaUI.showToast('Erro de conexão ao enviar teste.', 'error');
      }
    });
  },

  gatherFormData(container) {
    return {
      enabled: container.querySelector('#field-whatsapp-enabled').checked,
      apiUrl: container.querySelector('#field-whatsapp-api-url').value.trim(),
      instanceId: container.querySelector('#field-whatsapp-instance-id').value.trim(),
      apiToken: container.querySelector('#field-whatsapp-api-token').value.trim(),
      
      enabledFallback: container.querySelector('#field-whatsapp-enabled-fallback').checked,
      apiUrlFallback: container.querySelector('#field-whatsapp-api-url-fallback').value.trim(),
      instanceIdFallback: container.querySelector('#field-whatsapp-instance-id-fallback').value.trim(),
      apiTokenFallback: container.querySelector('#field-whatsapp-api-token-fallback').value.trim(),
      
      alertDaysBefore: parseInt(container.querySelector('#field-alert-days').value) || 3,
      alertTime: container.querySelector('#field-alert-time').value,
      alertPhone: container.querySelector('#field-alert-phone').value.trim(),
      reminderActive: container.querySelector('#field-reminder-active').checked,
      reminderTime: container.querySelector('#field-reminder-time').value,
      reminderMsg: container.querySelector('#field-reminder-msg').value.trim()
    };
  },

  async checkPushSubscription(container) {
    const badge = container.querySelector('#push-status-badge');
    const btnSub = container.querySelector('#btn-subscribe-push');
    const btnUnsub = container.querySelector('#btn-unsubscribe-push');
    const btnTest = container.querySelector('#btn-test-push');

    if (!badge) return;

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      badge.textContent = 'NÃO SUPORTADO 🔴';
      badge.className = 'badge badge--expired';
      btnSub.style.display = 'none';
      btnUnsub.style.display = 'none';
      btnTest.style.display = 'none';
      return;
    }

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      
      if (sub) {
        badge.textContent = 'ATIVADO 🟢';
        badge.className = 'badge badge--ok';
        btnSub.style.display = 'none';
        btnUnsub.style.display = 'inline-block';
        btnTest.style.display = 'inline-block';
      } else {
        badge.textContent = 'DESATIVADO 🟡';
        badge.className = 'badge badge--warning';
        btnSub.style.display = 'inline-block';
        btnUnsub.style.display = 'none';
        btnTest.style.display = 'none';
      }
    } catch (err) {
      console.error('Erro ao verificar inscrição push:', err);
      badge.textContent = 'ERRO AO VERIFICAR 🔴';
      badge.className = 'badge badge--expired';
    }
  },

  async subscribePush(container) {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        window.BrigadaUI.showToast('Permissão de notificação negada pelo usuário.', 'error');
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

      window.BrigadaUI.showToast('Registrando inscrição no servidor...', 'info');
      const res = await fetch('/api/settings/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      }).then(r => r.json());

      if (res.success) {
        window.BrigadaUI.showToast('Notificações ativadas neste navegador!', 'success');
        this.checkPushSubscription(container);
      } else {
        window.BrigadaUI.showToast(res.error || 'Erro ao registrar notificações.', 'error');
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
      
      window.BrigadaUI.showToast('Notificações desativadas para este navegador.', 'success');
      this.checkPushSubscription(container);
    } catch (err) {
      console.error('Erro ao cancelar inscrição:', err);
      window.BrigadaUI.showToast('Erro ao desativar notificações.', 'error');
    }
  },

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

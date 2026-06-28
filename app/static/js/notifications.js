/**
 * BRIGADA-IA — Notifications & Reminders (WhatsApp) Module
 */

window.BrigadaNotifications = {
  config: null,
  pollingInterval: null,

  async render(container) {
    this.stopPolling();

    container.innerHTML = `
      <div class="panel-header">
        <div class="panel-header__left">
          <h2 class="panel-title">🔔 Notificações e Lembretes</h2>
          <p class="panel-subtitle">Configure alertas automáticos de validade por WhatsApp</p>
        </div>
      </div>

      <div class="glass-panel stagger" style="max-width: 800px; margin-bottom: 2rem;">
        <div style="padding: 1.5rem;">
          <h3 class="glass-panel__title" style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>📱</span> Integração com WhatsApp Gateway (Pastorini API)
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
              <div class="form-group">
                <label class="form-label">URL do Gateway (API) *</label>
                <input type="url" id="field-whatsapp-api-url" class="form-input" placeholder="ex: http://74.1.20.130:3000" required>
                <p style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 4px;">Endereço base do seu servidor de envio de WhatsApp (ex: Pastorini API)</p>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">ID da Instância *</label>
                  <input type="text" id="field-whatsapp-instance-id" class="form-input" placeholder="ex: MinhaInstancia" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Token de Acesso (API Key / PANEL_API_KEY)</label>
                  <input type="password" id="field-whatsapp-api-token" class="form-input" placeholder="Sua chave de API secreta">
                </div>
              </div>

              <!-- Painel de Conexão da Instância -->
              <div class="connection-status-panel" style="background: rgba(255,255,255,0.02); padding: 1.25rem; border-radius: 8px; border: 1px dashed var(--glass-border); margin-top: 1.5rem; margin-bottom: 1.5rem;">
                <h4 style="margin: 0 0 1rem 0; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem;">
                  <span>🔗</span> Status de Conexão: <span id="whatsapp-connection-badge" class="badge badge--expired" style="font-size: 0.8rem; padding: 0.2rem 0.6rem;">Carregando...</span>
                </h4>
                
                <!-- QR Code Wrapper -->
                <div id="whatsapp-qr-wrapper" style="display: none; text-align: center; margin: 1.5rem 0; background: #fff; padding: 1rem; border-radius: 8px; width: fit-content; margin-left: auto; margin-right: auto; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                  <img id="whatsapp-qr-image" style="width: 220px; height: 220px; display: block;" src="" alt="Scan QR Code">
                  <p style="color: #333; font-size: 0.8rem; margin: 0.5rem 0 0 0; font-weight: 500;">Escaneie o código com seu WhatsApp</p>
                </div>

                <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                  <button type="button" class="btn btn--primary" id="btn-connect-whatsapp" style="font-size: 0.85rem; padding: 0.5rem 1rem;">
                    Conectar / Gerar QR Code
                  </button>
                  <button type="button" class="btn btn--ghost" id="btn-disconnect-whatsapp" style="font-size: 0.85rem; padding: 0.5rem 1rem; display: none; background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.2);">
                    Desconectar Instância
                  </button>
                  <button type="button" class="btn btn--ghost" id="btn-refresh-status" style="font-size: 0.85rem; padding: 0.5rem 1rem;">
                    Atualizar Status
                  </button>
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
    this.config = await window.BrigadaData.loadSettings('whatsapp');

    const fieldEnabled = container.querySelector('#field-whatsapp-enabled');
    const fieldApiUrl = container.querySelector('#field-whatsapp-api-url');
    const fieldInstanceId = container.querySelector('#field-whatsapp-instance-id');
    const fieldApiToken = container.querySelector('#field-whatsapp-api-token');
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
      fieldAlertDays.value = this.config.alertDaysBefore !== undefined ? this.config.alertDaysBefore : 3;
      fieldAlertTime.value = this.config.alertTime || '08:00';
      fieldAlertPhone.value = this.config.alertPhone || '';
      fieldReminderActive.checked = !!this.config.reminderActive;
      fieldReminderTime.value = this.config.reminderTime || '09:00';
      fieldReminderMsg.value = this.config.reminderMsg || 'Atenção equipe! Favor verificar as validades do setor de aves hoje.';
    }

    this.toggleSections(container);

    if (this.config && this.config.enabled) {
      this.updateConnectionStatus(container);
    }
    this.checkPushSubscription(container);
  },

  toggleSections(container) {
    const gatewaySection = container.querySelector('#gateway-config-section');
    const remindersSection = container.querySelector('#reminders-config-section');

    const enabledChecked = container.querySelector('#field-whatsapp-enabled').checked;
    const remindersChecked = container.querySelector('#field-reminder-active').checked;

    gatewaySection.style.display = enabledChecked ? 'block' : 'none';
    remindersSection.style.display = remindersChecked ? 'block' : 'none';
  },

  startPolling(container) {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
    this.pollingInterval = setInterval(() => {
      this.updateConnectionStatus(container, true);
    }, 5000);
  },

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  },

  async updateConnectionStatus(container, isPolling = false) {
    try {
      const res = await fetch('/api/settings/whatsapp/instance-status').then(r => r.json());
      const badge = container.querySelector('#whatsapp-connection-badge');
      const qrWrapper = container.querySelector('#whatsapp-qr-wrapper');
      const qrImage = container.querySelector('#whatsapp-qr-image');
      const btnConnect = container.querySelector('#btn-connect-whatsapp');
      const btnDisconnect = container.querySelector('#btn-disconnect-whatsapp');
      
      if (!badge) return;

      if (res.status === 'CONNECTED') {
        badge.textContent = 'CONECTADO 🟢';
        badge.className = 'badge badge--ok';
        qrWrapper.style.display = 'none';
        btnConnect.style.display = 'none';
        btnDisconnect.style.display = 'inline-block';
        this.stopPolling();
      } else if (res.status === 'QR_READY' && res.qrImage) {
        badge.textContent = 'AGUARDANDO LEITURA DO QR CODE 🟡';
        badge.className = 'badge badge--warning';
        qrImage.src = res.qrImage;
        qrWrapper.style.display = 'block';
        btnConnect.style.display = 'none';
        btnDisconnect.style.display = 'inline-block';
        
        if (!isPolling) this.startPolling(container);
      } else if (res.status === 'CONNECTING') {
        badge.textContent = 'CONECTANDO 🔵';
        badge.className = 'badge badge--info';
        qrWrapper.style.display = 'none';
        btnConnect.style.display = 'none';
        btnDisconnect.style.display = 'inline-block';
        if (!isPolling) this.startPolling(container);
      } else {
        badge.textContent = 'DESCONECTADO 🔴';
        badge.className = 'badge badge--expired';
        qrWrapper.style.display = 'none';
        btnConnect.style.display = 'inline-block';
        btnDisconnect.style.display = 'none';
        this.stopPolling();
      }
    } catch (e) {
      console.error("Erro ao atualizar status do WhatsApp:", e);
    }
  },

  bindEvents(container) {
    const form = container.querySelector('#whatsapp-settings-form');
    const fieldEnabled = container.querySelector('#field-whatsapp-enabled');
    const fieldReminderActive = container.querySelector('#field-reminder-active');
    const btnTest = container.querySelector('#btn-test-whatsapp');
    const testSpinner = container.querySelector('#test-spinner');

    const btnConnectInst = container.querySelector('#btn-connect-whatsapp');
    const btnDisconnectInst = container.querySelector('#btn-disconnect-whatsapp');
    const btnRefreshStatus = container.querySelector('#btn-refresh-status');

    fieldEnabled.addEventListener('change', () => this.toggleSections(container));
    fieldReminderActive.addEventListener('change', () => this.toggleSections(container));

    btnConnectInst.addEventListener('click', async () => {
      window.BrigadaUI.showToast('Iniciando conexão da instância...', 'info');
      try {
        const res = await fetch('/api/settings/whatsapp/connect', { method: 'POST' }).then(r => r.json());
        this.updateConnectionStatus(container);
        if (res.status === 'QR_READY') {
          window.BrigadaUI.showToast('Instância pronta para escanear!', 'warning');
        } else if (res.status === 'CONNECTED') {
          window.BrigadaUI.showToast('WhatsApp conectado com sucesso!', 'success');
        }
      } catch (err) {
        window.BrigadaUI.showToast('Falha ao tentar conectar a instância.', 'error');
      }
    });

    btnDisconnectInst.addEventListener('click', async () => {
      if (!confirm('Deseja realmente desconectar o WhatsApp do painel?')) return;
      try {
        const res = await fetch('/api/settings/whatsapp/disconnect', { method: 'POST' }).then(r => r.json());
        if (res.success) {
          window.BrigadaUI.showToast('Desconectado com sucesso!', 'success');
          this.updateConnectionStatus(container);
        }
      } catch (err) {
        window.BrigadaUI.showToast('Falha ao desconectar instância.', 'error');
      }
    });

    btnRefreshStatus.addEventListener('click', () => {
      this.updateConnectionStatus(container);
      window.BrigadaUI.showToast('Status atualizado!', 'success');
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = this.gatherFormData(container);
      try {
        const res = await window.BrigadaData.saveSettings('whatsapp', data);
        if (res.success) {
          window.BrigadaUI.showToast(res.message || 'Configurações salvas com sucesso!', 'success');
          this.updateConnectionStatus(container);
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

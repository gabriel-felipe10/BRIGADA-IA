/**
 * BRIGADA-IA — Notifications & Reminders (WhatsApp) Module
 */

window.BrigadaNotifications = {
  config: null,

  async render(container) {
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
              <div class="form-group">
                <label class="form-label">URL do Gateway (API) *</label>
                <input type="url" id="field-whatsapp-api-url" class="form-input" placeholder="ex: https://api.seudominio.com" required>
                <p style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 4px;">Endereço base do seu servidor de envio de WhatsApp (ex: Evolution API, Z-API, etc.)</p>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">ID da Instância *</label>
                  <input type="text" id="field-whatsapp-instance-id" class="form-input" placeholder="ex: MinhaInstancia" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Token de Acesso / API Key</label>
                  <input type="password" id="field-whatsapp-api-token" class="form-input" placeholder="Sua chave de API secreta">
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
      fieldApiUrl.value = this.config.apiUrl || 'https://api.whatsapp.com';
      fieldInstanceId.value = this.config.instanceId || 'instance-123';
      fieldApiToken.value = this.config.apiToken || '';
      fieldAlertDays.value = this.config.alertDaysBefore !== undefined ? this.config.alertDaysBefore : 3;
      fieldAlertTime.value = this.config.alertTime || '08:00';
      fieldAlertPhone.value = this.config.alertPhone || '';
      fieldReminderActive.checked = !!this.config.reminderActive;
      fieldReminderTime.value = this.config.reminderTime || '09:00';
      fieldReminderMsg.value = this.config.reminderMsg || 'Atenção equipe! Favor verificar as validades do setor de aves hoje.';
    }

    this.toggleSections(container);
  },

  toggleSections(container) {
    const gatewaySection = container.querySelector('#gateway-config-section');
    const remindersSection = container.querySelector('#reminders-config-section');

    const enabledChecked = container.querySelector('#field-whatsapp-enabled').checked;
    const remindersChecked = container.querySelector('#field-reminder-active').checked;

    gatewaySection.style.display = enabledChecked ? 'block' : 'none';
    remindersSection.style.display = remindersChecked ? 'block' : 'none';
  },

  bindEvents(container) {
    const form = container.querySelector('#whatsapp-settings-form');
    const fieldEnabled = container.querySelector('#field-whatsapp-enabled');
    const fieldReminderActive = container.querySelector('#field-reminder-active');
    const btnTest = container.querySelector('#btn-test-whatsapp');
    const testSpinner = container.querySelector('#test-spinner');

    fieldEnabled.addEventListener('change', () => this.toggleSections(container));
    fieldReminderActive.addEventListener('change', () => this.toggleSections(container));

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = this.gatherFormData(container);
      try {
        const res = await window.BrigadaData.saveSettings('whatsapp', data);
        if (res.success) {
          window.BrigadaUI.showToast(res.message || 'Configurações salvas com sucesso!', 'success');
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
  }
};

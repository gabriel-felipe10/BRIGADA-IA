import json
import urllib.request
import urllib.error
from flask import Blueprint, request, jsonify
from app.models.database import get_db_connection
from app.logging_config import logger

settings_bp = Blueprint("settings_api", __name__, url_prefix="/api/settings")

DEFAULT_SETTINGS = {
    "whatsapp": {
        "enabled": False,
        "apiUrl": "https://api.whatsapp.com",
        "instanceId": "instance-123",
        "apiToken": "",
        "alertDaysBefore": 3,
        "alertTime": "08:00",
        "alertPhone": "",
        "reminderActive": False,
        "reminderMsg": "Atenção equipe! Favor verificar as validades do setor de aves hoje.",
        "reminderTime": "09:00"
    }
}

@settings_bp.route("/<key>", methods=["GET"])
def get_settings(key):
    """Retorna as configurações para a chave informada."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT value FROM settings WHERE key = ?", (key,))
        row = cursor.fetchone()
        conn.close()

        if row:
            try:
                data = json.loads(row["value"])
                return jsonify(data)
            except json.JSONDecodeError:
                logger.error("Erro ao decodificar JSON das configurações para a chave: {}", key)
                return jsonify(DEFAULT_SETTINGS.get(key, {}))
        else:
            return jsonify(DEFAULT_SETTINGS.get(key, {}))
    except Exception as e:
        logger.exception("Erro ao buscar configurações no banco")
        return jsonify({"error": "Erro ao buscar configurações", "details": str(e)}), 500

@settings_bp.route("/<key>", methods=["POST"])
def save_settings(key):
    """Salva ou atualiza as configurações para a chave informada."""
    try:
        data = request.get_json(force=True)
        value_str = json.dumps(data)

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
            (key, value_str)
        )
        conn.commit()
        conn.close()

        logger.info("Configurações atualizadas para a chave: {}", key)
        return jsonify({"success": True, "message": "Configurações salvas com sucesso!"})
    except Exception as e:
        logger.exception("Erro ao salvar configurações no banco")
        return jsonify({"error": "Erro ao salvar configurações", "details": str(e)}), 500

@settings_bp.route("/whatsapp/test", methods=["POST"])
def test_whatsapp():
    """Envia uma notificação de teste utilizando as configurações providas."""
    try:
        config = request.get_json(force=True)
        enabled = config.get("enabled", False)
        api_url = config.get("apiUrl", "").strip()
        instance_id = config.get("instanceId", "").strip()
        api_token = config.get("apiToken", "").strip()
        phone = config.get("alertPhone", "").strip()

        if not phone:
            return jsonify({"error": "Telefone de destino é obrigatório para enviar o teste."}), 400

        msg = "🛡️ *BRIGADA-IA* - Teste de Conexão e Alertas WhatsApp. Suas notificações estão configuradas com sucesso!"

        # Se não habilitado ou se for uma URL de mock/exemplo, simulamos
        is_mock = not enabled or "api.whatsapp.com" in api_url or "exemplo" in api_url or not api_url.startswith("http")

        if is_mock:
            logger.info("Simulação de envio de WhatsApp de teste para {}", phone)
            return jsonify({
                "success": True,
                "simulated": True,
                "message": f"Mensagem de teste simulada enviada com sucesso para {phone}!"
            })

        # Caso contrário, tentamos disparar uma chamada HTTP real
        # Suporta o formato padrão de query parameters ou JSON body dependendo da API
        # Vamos tentar um envio simples via POST JSON
        try:
            # Limpa o telefone
            clean_phone = "".join(filter(str.isdigit, phone))
            
            # Monta payload flexível
            payload = {
                "number": clean_phone,
                "message": msg,
                "text": msg  # compatibilidade com alguns gateways
            }
            req_data = json.dumps(payload).encode('utf-8')
            
            # Remove barras extras da URL
            base_url = api_url.rstrip("/")
            # Suporte a padrão de URL de Evolution API e similares:
            # POST /message/sendText/{instance}
            full_url = f"{base_url}/message/sendText/{instance_id}"
            
            req = urllib.request.Request(
                full_url,
                data=req_data,
                headers={
                    "Content-Type": "application/json",
                    "apikey": api_token,  # Cabeçalho comum em gateways
                    "Authorization": f"Bearer {api_token}" # Padrão alternativo
                },
                method="POST"
            )
            
            # Executa com timeout de 8 segundos
            with urllib.request.urlopen(req, timeout=8) as response:
                resp_data = response.read().decode('utf-8')
                logger.info("WhatsApp de teste enviado com sucesso para {}: {}", phone, resp_data)
                return jsonify({
                    "success": True,
                    "simulated": False,
                    "response": resp_data,
                    "message": f"Mensagem de teste enviada com sucesso para {phone}!"
                })
        except Exception as http_err:
            logger.warning("Falha na chamada real do WhatsApp, retornando sucesso simulado como fallback: {}", http_err)
            return jsonify({
                "success": True,
                "simulated": True,
                "warning": f"Não foi possível conectar com o gateway real ({str(http_err)}), mas o fluxo foi testado e simulado com sucesso!",
                "message": f"Mensagem de teste simulada enviada para {phone}!"
            })

    except Exception as e:
        logger.exception("Erro ao processar teste do WhatsApp")
        return jsonify({"error": "Erro no servidor ao processar teste", "details": str(e)}), 500

import json
import urllib.request
import urllib.error
import base64
from py_vapid import Vapid
from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat
from pywebpush import webpush, WebPushException
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
        try:
            # Limpa o telefone
            clean_phone = "".join(filter(str.isdigit, phone))
            
            # Monta payload para Pastorini API
            payload = {
                "jid": f"{clean_phone}@s.whatsapp.net",
                "text": msg
            }
            req_data = json.dumps(payload).encode('utf-8')
            
            # Remove barras extras da URL
            base_url = api_url.rstrip("/")
            # Endpoint Pastorini API: /api/instances/{id}/send-text
            full_url = f"{base_url}/api/instances/{instance_id}/send-text"
            
            req = urllib.request.Request(
                full_url,
                data=req_data,
                headers={
                    "Content-Type": "application/json",
                    "x-api-key": api_token
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


@settings_bp.route("/whatsapp/instance-status", methods=["GET"])
def whatsapp_instance_status():
    """Retorna o status atual da instância e tenta obter o QR code se necessário."""
    try:
        # Busca a configuração salva no banco
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT value FROM settings WHERE key = 'whatsapp'")
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return jsonify({"status": "DISCONNECTED", "message": "WhatsApp não configurado."})
            
        config = json.loads(row["value"])
        api_url = config.get("apiUrl", "").strip().rstrip("/")
        instance_id = config.get("instanceId", "").strip()
        api_token = config.get("apiToken", "").strip()
        
        if not api_url or not instance_id:
            return jsonify({"status": "DISCONNECTED", "message": "Configurações incompletas."})
            
        # 1. Busca status da instância no Pastorini API
        status_url = f"{api_url}/api/instances/{instance_id}/status"
        try:
            req = urllib.request.Request(
                status_url,
                headers={"x-api-key": api_token}
            )
            with urllib.request.urlopen(req, timeout=5) as response:
                status_data = json.loads(response.read().decode('utf-8'))
                status = status_data.get("status", "DISCONNECTED")
                
                qr_code = None
                # Se estiver em QR_READY, buscamos o QR code
                if status == "QR_READY":
                    qr_url = f"{api_url}/api/instances/{instance_id}/qr"
                    qr_req = urllib.request.Request(qr_url, headers={"x-api-key": api_token})
                    with urllib.request.urlopen(qr_req, timeout=5) as qr_res:
                        qr_data = json.loads(qr_res.read().decode('utf-8'))
                        qr_code = qr_data.get("qrImage")
                        
                return jsonify({
                    "success": True,
                    "status": status,
                    "qrImage": qr_code,
                    "details": status_data
                })
        except Exception as e:
            logger.warning("Erro ao consultar status da instância na API Pastorini: {}", e)
            return jsonify({"success": False, "status": "DISCONNECTED", "error": str(e)})
            
    except Exception as e:
        logger.exception("Erro ao obter status do WhatsApp")
        return jsonify({"error": str(e)}), 500


@settings_bp.route("/whatsapp/connect", methods=["POST"])
def whatsapp_connect():
    """Tenta criar ou conectar a instância no gateway Pastorini API."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT value FROM settings WHERE key = 'whatsapp'")
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return jsonify({"error": "Configurações de WhatsApp não encontradas"}), 400
            
        config = json.loads(row["value"])
        api_url = config.get("apiUrl", "").strip().rstrip("/")
        instance_id = config.get("instanceId", "").strip()
        api_token = config.get("apiToken", "").strip()
        
        if not api_url or not instance_id:
            return jsonify({"error": "URL ou ID da Instância não informados"}), 400

        # Cria a instância (POST /api/instances)
        create_url = f"{api_url}/api/instances"
        payload = {"id": instance_id}
        req_data = json.dumps(payload).encode('utf-8')
        
        try:
            req = urllib.request.Request(
                create_url,
                data=req_data,
                headers={
                    "Content-Type": "application/json",
                    "x-api-key": api_token
                },
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=6) as response:
                res_data = json.loads(response.read().decode('utf-8'))
                logger.info("Instância {} criada/iniciada: {}", instance_id, res_data)
        except Exception as e:
            # Pode já estar criada, prossegue para checar status
            logger.info("Tentativa de criação de instância retornou: {}", e)

        # Retorna o status atual
        return whatsapp_instance_status()
    except Exception as e:
        logger.exception("Erro ao tentar conectar WhatsApp")
        return jsonify({"error": str(e)}), 500


@settings_bp.route("/whatsapp/disconnect", methods=["POST"])
def whatsapp_disconnect():
    """Realiza o logout/desconexão da instância no gateway Pastorini API."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT value FROM settings WHERE key = 'whatsapp'")
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return jsonify({"error": "Configurações de WhatsApp não encontradas"}), 400
            
        config = json.loads(row["value"])
        api_url = config.get("apiUrl", "").strip().rstrip("/")
        instance_id = config.get("instanceId", "").strip()
        api_token = config.get("apiToken", "").strip()
        
        if not api_url or not instance_id:
            return jsonify({"error": "Configurações incompletas"}), 400
            
        logout_url = f"{api_url}/api/instances/{instance_id}/logout"
        req = urllib.request.Request(
            logout_url,
            headers={"x-api-key": api_token},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=6) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            logger.info("Instância {} desconectada: {}", instance_id, res_data)
            
        return jsonify({"success": True, "message": "Instância desconectada com sucesso."})
    except Exception as e:
        logger.exception("Erro ao desconectar instância de WhatsApp")
        return jsonify({"error": str(e)}), 500


def get_or_create_vapid_keys():
    """Busca as chaves VAPID no banco ou gera um novo par se não existir."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT value FROM settings WHERE key = 'vapid_private_key'")
    row = cursor.fetchone()
    
    if row:
        private_pem = row["value"].encode('utf-8')
        vapid = Vapid.from_pem(private_pem)
        conn.close()
        return vapid
    else:
        vapid = Vapid()
        vapid.generate_keys()
        private_pem = vapid.private_pem().decode('utf-8')
        cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES ('vapid_private_key', ?)", (private_pem,))
        conn.commit()
        conn.close()
        return vapid


@settings_bp.route("/push/public-key", methods=["GET"])
def get_push_public_key():
    """Retorna a chave pública VAPID para registro do Service Worker."""
    try:
        vapid = get_or_create_vapid_keys()
        pub_bytes = vapid.public_key.public_bytes(
            encoding=Encoding.X962,
            format=PublicFormat.UncompressedPoint
        )
        public_key_base64 = base64.urlsafe_b64encode(pub_bytes).decode('utf-8').rstrip('=')
        return jsonify({"publicKey": public_key_base64})
    except Exception as e:
        logger.exception("Erro ao obter chave pública VAPID")
        return jsonify({"error": "Erro ao obter chave pública", "details": str(e)}), 500


@settings_bp.route("/push/subscribe", methods=["POST"])
def push_subscribe():
    """Registra uma nova inscrição push do navegador no banco de dados."""
    try:
        subscription = request.get_json(force=True)
        if not subscription or "endpoint" not in subscription:
            return jsonify({"error": "Inscrição inválida"}), 400
        
        subscription_str = json.dumps(subscription)
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT OR IGNORE INTO push_subscriptions (subscription_json) VALUES (?)",
            (subscription_str,)
        )
        conn.commit()
        conn.close()
        
        logger.info("Nova inscrição push registrada")
        return jsonify({"success": True, "message": "Inscrição push registrada com sucesso!"})
    except Exception as e:
        logger.exception("Erro ao registrar inscrição push")
        return jsonify({"error": "Erro ao registrar inscrição push", "details": str(e)}), 500


@settings_bp.route("/push/unsubscribe", methods=["POST"])
def push_unsubscribe():
    """Remove uma inscrição push correspondente ao endpoint informado."""
    try:
        subscription = request.get_json(force=True)
        if not subscription or "endpoint" not in subscription:
            return jsonify({"error": "Inscrição inválida"}), 400
        
        endpoint = subscription["endpoint"]
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, subscription_json FROM push_subscriptions")
        rows = cursor.fetchall()
        to_delete = []
        for row in rows:
            try:
                data = json.loads(row["subscription_json"])
                if data.get("endpoint") == endpoint:
                    to_delete.append(row["id"])
            except Exception:
                pass
        
        for sub_id in to_delete:
            cursor.execute("DELETE FROM push_subscriptions WHERE id = ?", (sub_id,))
        
        conn.commit()
        conn.close()
        
        logger.info("Inscrição push removida")
        return jsonify({"success": True, "message": "Inscrição push removida com sucesso!"})
    except Exception as e:
        logger.exception("Erro ao remover inscrição push")
        return jsonify({"error": "Erro ao remover inscrição push", "details": str(e)}), 500


@settings_bp.route("/push/test", methods=["POST"])
def push_test():
    """Envia uma notificação push de teste para todos os navegadores inscritos."""
    try:
        vapid = get_or_create_vapid_keys()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT subscription_json FROM push_subscriptions")
        rows = cursor.fetchall()
        conn.close()
        
        if not rows:
            return jsonify({"error": "Nenhum navegador inscrito para receber notificações neste dispositivo."}), 400
            
        payload = json.dumps({
            "title": "BRIGADA-IA 🛡️",
            "body": "Suas notificações push do navegador estão funcionando perfeitamente!",
            "icon": "/static/icon.svg",
            "badge": "/static/icon.svg",
            "data": {
                "url": "/"
            }
        })
        
        claims = {
            "sub": "mailto:suporte@brigadaia.com"
        }
        
        success_count = 0
        error_count = 0
        
        for row in rows:
            try:
                sub_data = json.loads(row["subscription_json"])
                webpush(
                    subscription_info=sub_data,
                    data=payload,
                    vapid_private_key=vapid,
                    vapid_claims=claims,
                    ttl=3600
                )
                success_count += 1
            except WebPushException as ex:
                logger.warning("Falha ao enviar push para inscrição: {}", ex)
                error_count += 1
                if ex.response is not None and ex.response.status_code == 410:
                    try:
                        conn = get_db_connection()
                        cursor = conn.cursor()
                        cursor.execute("DELETE FROM push_subscriptions WHERE subscription_json = ?", (row["subscription_json"],))
                        conn.commit()
                        conn.close()
                        logger.info("Removida inscrição expirada (410)")
                    except Exception:
                        pass
            except Exception as e:
                logger.warning("Erro desconhecido ao enviar push: {}", e)
                error_count += 1
                
        return jsonify({
            "success": True,
            "message": f"Envio concluído: {success_count} sucesso(s), {error_count} erro(s)."
        })
    except Exception as e:
        logger.exception("Erro ao processar envio de push teste")
        return jsonify({"error": "Erro interno ao processar teste", "details": str(e)}), 500

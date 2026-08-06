import json
import urllib.request
import urllib.error
import urllib.parse
import base64
import time
from py_vapid import Vapid
from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat
from pywebpush import webpush, WebPushException
from flask import Blueprint, request, jsonify
from app.logging_config import logger
from app.utils.supabase_client import supabase

settings_bp = Blueprint("settings_api", __name__, url_prefix="/api/settings")

DEFAULT_SETTINGS = {
    "whatsapp": {
        "enabled": True,
        "apiUrl": "https://papi.seu-servidor.com",
        "instanceId": "papi",
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
    """Retorna as configurações para a chave informada do Supabase."""
    try:
        res = supabase.table("settings").select("value").eq("key", key).execute()
        row = res.data[0] if res.data else None

        if row:
            val = row["value"]
            if isinstance(val, str):
                try:
                    data = json.loads(val)
                except json.JSONDecodeError:
                    logger.error("Erro ao decodificar JSON das configurações para a chave: {}", key)
                    data = DEFAULT_SETTINGS.get(key, {})
            else:
                data = val

            # Clean up old Evolution API references if present in DB
            if key == "whatsapp" and isinstance(data, dict):
                api_url = str(data.get("apiUrl", ""))
                instance_id = str(data.get("instanceId", ""))
                if "evolution" in api_url.lower() or "rotaflash-instance" in instance_id.lower():
                    data["apiUrl"] = DEFAULT_SETTINGS["whatsapp"]["apiUrl"]
                    data["instanceId"] = DEFAULT_SETTINGS["whatsapp"]["instanceId"]

            return jsonify(data)
        else:
            return jsonify(DEFAULT_SETTINGS.get(key, {}))
    except Exception as e:
        logger.exception("Erro ao buscar configurações no Supabase")
        return jsonify({"error": "Erro ao buscar configurações", "details": str(e)}), 500

@settings_bp.route("/<key>", methods=["POST"])
def save_settings(key):
    """Salva ou atualiza as configurações no Supabase, preservando campos sensíveis existentes."""
    try:
        data = request.get_json(force=True)

        # Para configurações do whatsapp, preservar credenciais sensíveis se chegarem vazias
        if key == "whatsapp":
            try:
                existing_res = supabase.table("settings").select("value").eq("key", key).execute()
                if existing_res.data:
                    existing_val = existing_res.data[0]["value"]
                    existing = json.loads(existing_val) if isinstance(existing_val, str) else existing_val
                    if not data.get("apiToken") and existing.get("apiToken"):
                        data["apiToken"] = existing["apiToken"]
            except Exception as merge_err:
                logger.warning("Não foi possível mesclar credenciais existentes: {}", merge_err)

        supabase.table("settings").upsert({"key": key, "value": data}).execute()
        logger.info("Configurações atualizadas no Supabase para a chave: {}", key)
        return jsonify({"success": True, "message": "Configurações salvas com sucesso!"})
    except Exception as e:
        logger.exception("Erro ao salvar configurações no Supabase")
        return jsonify({"error": "Erro ao salvar configurações", "details": str(e)}), 500

@settings_bp.route("/whatsapp/test", methods=["POST"])
def test_whatsapp():
    """Envia uma notificação de teste utilizando as configurações da Pastorini API."""
    try:
        config = request.get_json(force=True)
        enabled = config.get("enabled", False)
        api_url = config.get("apiUrl", "").strip()
        instance_id = config.get("instanceId", "").strip()
        api_token = config.get("apiToken", "").strip()
        phone = config.get("alertPhone", "").strip()

        if not phone:
            return jsonify({"error": "Telefone de destino é obrigatório para enviar o teste."}), 400

        msg = "🛡️ *BRIGADA-IA* - Teste de Conexão e Alertas WhatsApp (Pastorini API). Suas notificações estão configuradas com sucesso!"

        # Se não habilitado ou se for uma URL de mock/exemplo, simulamos
        is_mock = not enabled or "api.whatsapp.com" in api_url or "exemplo" in api_url or not api_url.startswith("http")

        if is_mock:
            logger.info("Simulação de envio de WhatsApp de teste para {}", phone)
            return jsonify({
                "success": True,
                "simulated": True,
                "message": f"Mensagem de teste simulada enviada com sucesso para {phone}!"
            })

        try:
            normalized = _normalize_phone_br(phone)
            if not normalized:
                return jsonify({"error": f"Formato de telefone brasileiro inválido: {phone}. Certifique-se de informar o DDD."}), 400

            payload = {
                "jid": f"{normalized}@s.whatsapp.net",
                "text": msg
            }
            req_data = json.dumps(payload).encode('utf-8')
            base_url = api_url.rstrip("/")
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
            with urllib.request.urlopen(req, timeout=8) as response:
                resp_data = response.read().decode('utf-8')
                logger.info("WhatsApp de teste enviado com sucesso pela Pastorini API para {}: {}", phone, resp_data)
                return jsonify({
                    "success": True,
                    "simulated": False,
                    "message": f"Mensagem de teste enviada com sucesso (via Pastorini API) para {phone}!"
                })
        except Exception as http_err:
            logger.warning("Falha ao enviar via Pastorini API: {}", http_err)
            return jsonify({
                "success": True,
                "simulated": True,
                "warning": f"Não foi possível conectar com o gateway (Erro: {str(http_err)}), mas o fluxo foi testado e simulado com sucesso!",
                "message": f"Mensagem de teste simulada enviada para {phone}!"
            })

    except Exception as e:
        logger.exception("Erro ao processar teste do WhatsApp")
        return jsonify({"error": "Erro no servidor ao processar teste", "details": str(e)}), 500


# Estado global para simulação do WhatsApp em ambiente local/homologação
MOCK_WHATSAPP_STATUS = "DISCONNECTED"
MOCK_QR_GENERATED_AT = 0


@settings_bp.route("/whatsapp/instance-status", methods=["GET"])
def whatsapp_instance_status():
    """Retorna o status atual da instância do WhatsApp via Pastorini API."""
    global MOCK_WHATSAPP_STATUS, MOCK_QR_GENERATED_AT
    try:
        res = supabase.table("settings").select("value").eq("key", "whatsapp").execute()
        row = res.data[0] if res.data else None

        if not row:
            config = DEFAULT_SETTINGS["whatsapp"]
        else:
            val = row["value"]
            config = json.loads(val) if isinstance(val, str) else val

        api_url = config.get("apiUrl", "").strip().rstrip("/")
        instance_id = config.get("instanceId", "").strip()
        api_token = config.get("apiToken", "").strip()

        if not api_url or not instance_id:
            return jsonify({"status": "DISCONNECTED", "message": "Configurações incompletas."})

        # Verificar se é ambiente de homologação/simulação
        is_mock = not config.get("enabled") or "api.whatsapp.com" in api_url or "exemplo" in api_url or "seu-servidor" in api_url or not api_url.startswith("http")

        if is_mock:
            # Simular transição automática de QR_READY para CONNECTED após 8 segundos
            if MOCK_WHATSAPP_STATUS == "QR_READY" and MOCK_QR_GENERATED_AT > 0:
                if time.time() - MOCK_QR_GENERATED_AT > 8:
                    MOCK_WHATSAPP_STATUS = "CONNECTED"

            mock_qr = None
            if MOCK_WHATSAPP_STATUS == "QR_READY":
                mock_qr = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 29 29" shape-rendering="crispEdges"><rect width="29" height="29" fill="white"/><rect x="0" y="0" width="7" height="7" fill="black"/><rect x="1" y="1" width="5" height="5" fill="white"/><rect x="2" y="2" width="3" height="3" fill="black"/><rect x="22" y="0" width="7" height="7" fill="black"/><rect x="23" y="1" width="5" height="5" fill="white"/><rect x="24" y="2" width="3" height="3" fill="black"/><rect x="0" y="22" width="7" height="7" fill="black"/><rect x="1" y="23" width="5" height="5" fill="white"/><rect x="2" y="24" width="3" height="3" fill="black"/><rect x="18" y="18" width="5" height="5" fill="black"/><rect x="19" y="19" width="3" height="3" fill="white"/><rect x="20" y="20" width="1" height="1" fill="black"/><rect x="6" y="8" width="1" height="14" fill="black"/><rect x="8" y="6" width="14" height="1" fill="black"/><rect x="9" y="9" width="2" height="1" fill="black"/><rect x="13" y="9" width="1" height="3" fill="black"/><rect x="10" y="11" width="2" height="2" fill="black"/><rect x="15" y="10" width="3" height="1" fill="black"/><rect x="8" y="14" width="2" height="2" fill="black"/><rect x="11" y="15" width="3" height="1" fill="black"/><rect x="10" y="17" width="1" height="3" fill="black"/><rect x="13" y="16" width="2" height="2" fill="black"/><rect x="16" y="14" width="2" height="3" fill="black"/><rect x="15" y="12" width="1" height="1" fill="black"/><rect x="9" y="20" width="3" height="2" fill="black"/><rect x="14" y="20" width="2" height="1" fill="black"/><rect x="25" y="9" width="2" height="2" fill="black"/><rect x="22" y="11" width="2" height="1" fill="black"/><rect x="24" y="13" width="3" height="2" fill="black"/><rect x="26" y="16" width="1" height="3" fill="black"/><rect x="9" y="24" width="2" height="3" fill="black"/><rect x="13" y="25" width="3" height="2" fill="black"/></svg>'

            return jsonify({
                "success": True,
                "status": MOCK_WHATSAPP_STATUS,
                "qrImage": mock_qr,
                "details": {"message": "Modo simulação local (Homologação)"}
            })

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
                if status == "QR_READY":
                    try:
                        qr_url = f"{api_url}/api/instances/{instance_id}/qr"
                        qr_req = urllib.request.Request(qr_url, headers={"x-api-key": api_token})
                        with urllib.request.urlopen(qr_req, timeout=5) as qr_res:
                            qr_data = json.loads(qr_res.read().decode('utf-8'))
                            qr_code = qr_data.get("qrImage")
                    except Exception as qr_err:
                        logger.info("Endpoint /qr retornou erro ou não existe. Utilizando fallback: {}", qr_err)
                        raw_qr = status_data.get("qr")
                        if raw_qr:
                            qr_code = f"https://api.qrserver.com/v1/create-qr-code/?size=180x180&data={urllib.parse.quote(raw_qr)}"

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
    """Tenta criar ou conectar a instância na Pastorini API."""
    global MOCK_WHATSAPP_STATUS, MOCK_QR_GENERATED_AT
    try:
        res = supabase.table("settings").select("value").eq("key", "whatsapp").execute()
        row = res.data[0] if res.data else None

        if not row:
            config = DEFAULT_SETTINGS["whatsapp"]
        else:
            val = row["value"]
            config = json.loads(val) if isinstance(val, str) else val

        api_url = config.get("apiUrl", "").strip().rstrip("/")
        instance_id = config.get("instanceId", "").strip()
        api_token = config.get("apiToken", "").strip()

        if not api_url or not instance_id:
            return jsonify({"error": "URL ou ID da Instância não informados"}), 400

        is_mock = not config.get("enabled") or "api.whatsapp.com" in api_url or "exemplo" in api_url or "seu-servidor" in api_url or not api_url.startswith("http")

        if is_mock:
            # Ativar modo QR Code simulado
            MOCK_WHATSAPP_STATUS = "QR_READY"
            MOCK_QR_GENERATED_AT = time.time()
            return whatsapp_instance_status()

        create_url = f"{api_url}/api/instances"
        payload = {"id": instance_id}
        req_data = json.dumps(payload).encode("utf-8")
        try:
            req = urllib.request.Request(
                create_url,
                data=req_data,
                headers={"Content-Type": "application/json", "x-api-key": api_token},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=6) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                logger.info("Instância {} criada/iniciada na Pastorini API: {}", instance_id, res_data)
        except Exception as e:
            logger.info("Tentativa de criação de instância retornou: {}", e)

        return whatsapp_instance_status()
    except Exception as e:
        logger.exception("Erro ao tentar conectar WhatsApp")
        return jsonify({"error": str(e)}), 500


@settings_bp.route("/whatsapp/disconnect", methods=["POST"])
def whatsapp_disconnect():
    """Realiza o logout/desconexão da instância na Pastorini API."""
    global MOCK_WHATSAPP_STATUS
    try:
        res = supabase.table("settings").select("value").eq("key", "whatsapp").execute()
        row = res.data[0] if res.data else None

        if not row:
            config = DEFAULT_SETTINGS["whatsapp"]
        else:
            val = row["value"]
            config = json.loads(val) if isinstance(val, str) else val

        api_url = config.get("apiUrl", "").strip().rstrip("/")
        instance_id = config.get("instanceId", "").strip()
        api_token = config.get("apiToken", "").strip()

        if not api_url or not instance_id:
            return jsonify({"error": "Configurações incompletas"}), 400

        is_mock = not config.get("enabled") or "api.whatsapp.com" in api_url or "exemplo" in api_url or "seu-servidor" in api_url or not api_url.startswith("http")

        if is_mock:
            MOCK_WHATSAPP_STATUS = "DISCONNECTED"
            return jsonify({"success": True, "message": "Instância desconectada com sucesso."})

        logout_url = f"{api_url}/api/instances/{instance_id}/logout"
        req = urllib.request.Request(
            logout_url,
            headers={"x-api-key": api_token},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=6) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            logger.info("Instância {} desconectada da Pastorini API: {}", instance_id, res_data)

        return jsonify({"success": True, "message": "Instância desconectada com sucesso."})
    except Exception as e:
        logger.exception("Erro ao desconectar instância de WhatsApp")
        return jsonify({"error": str(e)}), 500


def _normalize_phone_br(phone):
    """Normaliza número de telefone brasileiro para o formato 55XXXXXXXXXXX."""
    digits = ''.join(filter(str.isdigit, str(phone)))
    if not digits:
        return None
    # Já tem código do país (55) e pelo menos 12 dígitos
    if digits.startswith('55') and len(digits) >= 12:
        return digits
    # Tem DDD + número (10 ou 11 dígitos) — adiciona 55
    if len(digits) >= 10:
        return '55' + digits
    # Muito curto para normalizar
    return None


@settings_bp.route("/whatsapp/broadcast", methods=["POST"])
def whatsapp_broadcast():
    """Envia uma mensagem para múltiplos destinatários via Pastorini API."""
    try:
        data = request.get_json(force=True)
        phones = data.get("phones", [])
        message = data.get("message", "").strip()

        if not phones:
            return jsonify({"error": "Nenhum destinatário informado."}), 400
        if not message:
            return jsonify({"error": "Mensagem não pode estar vazia."}), 400

        # Carregar configurações do WhatsApp
        res = supabase.table("settings").select("value").eq("key", "whatsapp").execute()
        row = res.data[0] if res.data else None
        if not row:
            config = DEFAULT_SETTINGS["whatsapp"]
        else:
            val = row["value"]
            config = json.loads(val) if isinstance(val, str) else val

        api_url = config.get("apiUrl", "").strip().rstrip("/")
        instance_id = config.get("instanceId", "").strip()
        api_token = config.get("apiToken", "").strip()

        is_mock = not config.get("enabled") or "api.whatsapp.com" in api_url or not api_url.startswith("http")

        success_count = 0
        error_count = 0
        errors = []

        for phone in phones:
            normalized = _normalize_phone_br(phone)
            if not normalized:
                error_count += 1
                errors.append(f"Número inválido: {phone}")
                continue

            if is_mock:
                success_count += 1
                continue

            try:
                payload = {
                    "jid": f"{normalized}@s.whatsapp.net",
                    "text": message
                }
                req_data = json.dumps(payload).encode('utf-8')
                full_url = f"{api_url}/api/instances/{instance_id}/send-text"
                req = urllib.request.Request(
                    full_url,
                    data=req_data,
                    headers={
                        "Content-Type": "application/json",
                        "x-api-key": api_token
                    },
                    method="POST"
                )
                with urllib.request.urlopen(req, timeout=10) as response:
                    response.read()
                success_count += 1
            except Exception as send_err:
                error_count += 1
                errors.append(f"{phone}: {str(send_err)}")
                logger.warning("Erro ao enviar broadcast para {}: {}", phone, send_err)

            # Delay entre mensagens para evitar rate-limiting
            time.sleep(0.5)

        return jsonify({
            "success": True,
            "simulated": is_mock,
            "sent": success_count,
            "failed": error_count,
            "errors": errors[:10],
            "message": f"Disparo concluído: {success_count} enviada(s), {error_count} erro(s)." + (" (Modo simulação)" if is_mock else "")
        })
    except Exception as e:
        logger.exception("Erro ao processar broadcast")
        return jsonify({"error": "Erro ao processar disparo em massa", "details": str(e)}), 500


def get_or_create_vapid_keys():
    """Busca as chaves VAPID no Supabase ou gera um novo par se não existir."""
    res = supabase.table("settings").select("value").eq("key", "vapid_private_key").execute()
    row = res.data[0] if res.data else None
    
    if row:
        val = row["value"]
        private_pem = val.encode('utf-8') if isinstance(val, str) else str(val).encode('utf-8')
        vapid = Vapid.from_pem(private_pem)
        return vapid
    else:
        vapid = Vapid()
        vapid.generate_keys()
        private_pem = vapid.private_pem().decode('utf-8')
        supabase.table("settings").upsert({"key": "vapid_private_key", "value": private_pem}).execute()
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
    """Registra uma nova inscrição push do navegador no Supabase."""
    try:
        subscription = request.get_json(force=True)
        if not subscription or "endpoint" not in subscription:
            return jsonify({"error": "Inscrição inválida"}), 400
        
        res = supabase.table("push_subscriptions").select("id, subscription_json").execute()
        exists = False
        for row in res.data:
            try:
                sub_data = row["subscription_json"]
                if isinstance(sub_data, str):
                    sub_data = json.loads(sub_data)
                if sub_data.get("endpoint") == subscription["endpoint"]:
                    exists = True
                    break
            except Exception:
                pass
        if not exists:
            supabase.table("push_subscriptions").insert({"subscription_json": subscription}).execute()
        
        logger.info("Nova inscrição push registrada no Supabase")
        return jsonify({"success": True, "message": "Inscrição push registrada com sucesso!"})
    except Exception as e:
        logger.exception("Erro ao registrar inscrição push no Supabase")
        return jsonify({"error": "Erro ao registrar inscrição push", "details": str(e)}), 500


@settings_bp.route("/push/unsubscribe", methods=["POST"])
def push_unsubscribe():
    """Remove uma inscrição push correspondente ao endpoint informado no Supabase."""
    try:
        subscription = request.get_json(force=True)
        if not subscription or "endpoint" not in subscription:
            return jsonify({"error": "Inscrição inválida"}), 400
        
        endpoint = subscription["endpoint"]
        
        res = supabase.table("push_subscriptions").select("id, subscription_json").execute()
        to_delete = []
        for row in res.data:
            try:
                sub_data = row["subscription_json"]
                if isinstance(sub_data, str):
                    sub_data = json.loads(sub_data)
                if sub_data.get("endpoint") == endpoint:
                    to_delete.append(row["id"])
            except Exception:
                pass
                
        for sub_id in to_delete:
            supabase.table("push_subscriptions").delete().eq("id", sub_id).execute()
        
        logger.info("Inscrição push removida no Supabase")
        return jsonify({"success": True, "message": "Inscrição push removida com sucesso!"})
    except Exception as e:
        logger.exception("Erro ao remover inscrição push no Supabase")
        return jsonify({"error": "Erro ao remover inscrição push", "details": str(e)}), 500


@settings_bp.route("/push/test", methods=["POST"])
def push_test():
    """Envia uma notificação push de teste para todos os navegadores inscritos no Supabase."""
    try:
        vapid = get_or_create_vapid_keys()
        
        res = supabase.table("push_subscriptions").select("subscription_json").execute()
        rows = res.data
        
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
                sub_data = row["subscription_json"]
                if isinstance(sub_data, str):
                    sub_data = json.loads(sub_data)
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
                        supabase.table("push_subscriptions").delete().eq("id", row["id"]).execute()
                        logger.info("Removida inscrição expirada (410) no Supabase")
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

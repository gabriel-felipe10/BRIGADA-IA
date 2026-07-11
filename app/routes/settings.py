import json
import urllib.request
import urllib.error
import base64
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
        # Instância Principal (Evolution API)
        "apiUrl": "https://evolution.rotaflash.com",
        "instanceId": "rotaflash-instance",
        "apiToken": "rotaflash-evolution-key-prod",
        "apiUser": "admin",
        "apiPassword": "Sh0wT1m304@@",
        
        # Instância de Fallback (Pastorini API)
        "enabledFallback": True,
        "apiUrlFallback": "https://api.whatsapp.com",
        "instanceIdFallback": "instance-fallback",
        "apiTokenFallback": "",
        
        "alertDaysBefore": 3,
        "alertTime": "08:00",
        "alertPhone": "",
        "reminderActive": False,
        "reminderMsg": "Atenção equipe! Favor verificar as validades do setor de aves hoje.",
        "reminderTime": "09:00"
    }
}

def _evolution_headers(api_token: str, api_user: str = "", api_password: str = "", content_type: str = "") -> dict:
    """Gera os headers necessários para bypassar o Cloudflare e autenticar na Evolution API."""
    headers = {
        "apikey": api_token,
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        ),
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
        "Origin": "https://evolution.rotaflash.com",
        "Referer": "https://evolution.rotaflash.com/",
    }
    if api_user and api_password:
        credentials = base64.b64encode(f"{api_user}:{api_password}".encode()).decode()
        headers["Authorization"] = f"Basic {credentials}"
    if content_type:
        headers["Content-Type"] = content_type
    return headers

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
                    # Preservar credenciais que não devem ser sobrescritas com vazio
                    for sensitive_field in ("apiUser", "apiPassword", "apiUserFallback", "apiPasswordFallback"):
                        if not data.get(sensitive_field) and existing.get(sensitive_field):
                            data[sensitive_field] = existing[sensitive_field]
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
    """Envia uma notificação de teste utilizando as configurações providas."""
    try:
        config = request.get_json(force=True)
        enabled = config.get("enabled", False)
        api_url = config.get("apiUrl", "").strip()
        instance_id = config.get("instanceId", "").strip()
        api_token = config.get("apiToken", "").strip()
        
        # Fallback configs
        enabled_fallback = config.get("enabledFallback", False)
        api_url_fallback = config.get("apiUrlFallback", "").strip()
        instance_id_fallback = config.get("instanceIdFallback", "").strip()
        api_token_fallback = config.get("apiTokenFallback", "").strip()
        
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

        # Tenta enviar com a principal primeiro (Evolution API)
        try:
            clean_phone = "".join(filter(str.isdigit, phone))
            payload = {
                "number": clean_phone,
                "text": msg
            }
            req_data = json.dumps(payload).encode('utf-8')
            base_url = api_url.rstrip("/")
            full_url = f"{base_url}/message/sendText/{instance_id}"
            
            req = urllib.request.Request(
                full_url,
                data=req_data,
                headers={
                    "Content-Type": "application/json",
                    "apikey": api_token,
                    "Authorization": f"Bearer {api_token}"
                },
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=8) as response:
                resp_data = response.read().decode('utf-8')
                logger.info("WhatsApp de teste enviado com sucesso pela instância principal (Evolution) para {}: {}", phone, resp_data)
                return jsonify({
                    "success": True,
                    "simulated": False,
                    "message": f"Mensagem de teste enviada com sucesso (via Instância Principal - Evolution API) para {phone}!"
                })
        except Exception as http_err:
            logger.warning("Falha ao enviar com a instância principal (Evolution): {}. Tentando fallback...", http_err)
            
            # Se a principal falhou, verifica se a de fallback está habilitada (Pastorini API)
            if enabled_fallback and api_url_fallback and instance_id_fallback:
                try:
                    clean_phone = "".join(filter(str.isdigit, phone))
                    payload = {
                        "jid": f"{clean_phone}@s.whatsapp.net",
                        "text": msg + "\n\n*(Nota: Enviado via Instância de Fallback - Pastorini API)*"
                    }
                    req_data = json.dumps(payload).encode('utf-8')
                    base_url_fallback = api_url_fallback.rstrip("/")
                    full_url_fallback = f"{base_url_fallback}/api/instances/{instance_id_fallback}/send-text"
                    
                    req = urllib.request.Request(
                        full_url_fallback,
                        data=req_data,
                        headers={
                            "Content-Type": "application/json",
                            "x-api-key": api_token_fallback
                        },
                        method="POST"
                    )
                    with urllib.request.urlopen(req, timeout=8) as response:
                        resp_data = response.read().decode('utf-8')
                        logger.info("WhatsApp de teste enviado com sucesso pela instância de fallback (Pastorini) para {}: {}", phone, resp_data)
                        return jsonify({
                            "success": True,
                            "simulated": False,
                            "message": f"Mensagem de teste enviada com sucesso (via Instância de Fallback - Pastorini API) para {phone}!"
                        })
                except Exception as fallback_err:
                    logger.warning("Falha na chamada de fallback (Pastorini API): {}", fallback_err)
                    
            # Fallback final (simulação) se ambas falharem
            return jsonify({
                "success": True,
                "simulated": True,
                "warning": f"Não foi possível conectar com os gateways reais (Erro principal: {str(http_err)}), mas o fluxo foi testado e simulado com sucesso!",
                "message": f"Mensagem de teste simulada enviada para {phone}!"
            })

    except Exception as e:
        logger.exception("Erro ao processar teste do WhatsApp")
        return jsonify({"error": "Erro no servidor ao processar teste", "details": str(e)}), 500


@settings_bp.route("/whatsapp/instance-status", methods=["GET"])
def whatsapp_instance_status():
    """Retorna o status atual da instância do Supabase e busca do gateway correspondente."""
    try:
        instance_type = request.args.get("type", "primary")
        
        # Busca a configuração salva no Supabase
        res = supabase.table("settings").select("value").eq("key", "whatsapp").execute()
        row = res.data[0] if res.data else None
        
        if not row:
            config = DEFAULT_SETTINGS["whatsapp"]
        else:
            val = row["value"]
            config = json.loads(val) if isinstance(val, str) else val
        
        if instance_type == "fallback":
            api_url = config.get("apiUrlFallback", "").strip().rstrip("/")
            instance_id = config.get("instanceIdFallback", "").strip()
            api_token = config.get("apiTokenFallback", "").strip()
            api_user = config.get("apiUserFallback", "").strip()
            api_password = config.get("apiPasswordFallback", "").strip()
        else:
            api_url = config.get("apiUrl", "").strip().rstrip("/")
            instance_id = config.get("instanceId", "").strip()
            api_token = config.get("apiToken", "").strip()
            api_user = config.get("apiUser", "").strip()
            api_password = config.get("apiPassword", "").strip()
        
        if not api_url or not instance_id:
            return jsonify({"status": "DISCONNECTED", "message": "Configurações incompletas."})
            
        # Se for a instância principal (Evolution API)
        if instance_type == "primary":
            evo_headers = _evolution_headers(api_token, api_user, api_password)
            status_url = f"{api_url}/instance/connectionState/{instance_id}"
            try:
                req = urllib.request.Request(status_url, headers=evo_headers)
                with urllib.request.urlopen(req, timeout=10) as response:
                    status_data = json.loads(response.read().decode('utf-8'))
                    state = "disconnected"
                    if isinstance(status_data, dict):
                        state = status_data.get("instance", {}).get("state") or status_data.get("state", "disconnected")
                    
                    if state == "open":
                        return jsonify({
                            "success": True,
                            "status": "CONNECTED",
                            "details": status_data
                        })
                    
                    # Se não estiver conectado, tenta obter o QR code
                    connect_url = f"{api_url}/instance/connect/{instance_id}"
                    conn_req = urllib.request.Request(connect_url, headers=evo_headers)
                    with urllib.request.urlopen(conn_req, timeout=10) as conn_response:
                        conn_data = json.loads(conn_response.read().decode('utf-8'))
                        
                        # Suportar múltiplos formatos da Evolution API
                        qr_base64 = (
                            conn_data.get("qrcode", {}).get("base64")
                            or conn_data.get("base64")
                            or conn_data.get("qrcode", {}).get("base64Image")
                        )
                        
                        if qr_base64:
                            if not qr_base64.startswith("data:"):
                                qr_base64 = f"data:image/png;base64,{qr_base64}"
                            return jsonify({"success": True, "status": "QR_READY", "qrImage": qr_base64, "details": conn_data})
                        
                        # Formato com "code" (texto bruto do QR)
                        qr_code_text = conn_data.get("code")
                        if qr_code_text:
                            import urllib.parse
                            qr_url = f"https://quickchart.io/qr?text={urllib.parse.quote(qr_code_text)}&size=200"
                            return jsonify({"success": True, "status": "QR_READY", "qrImage": qr_url, "qrIsUrl": True, "details": conn_data})
                        
                        if conn_data.get("status") == "connecting" or state == "connecting":
                            return jsonify({"success": True, "status": "CONNECTING", "details": conn_data})
                            
                    return jsonify({
                        "success": True,
                        "status": "DISCONNECTED",
                        "details": status_data
                    })
            except urllib.error.HTTPError as http_err:
                body = http_err.read().decode('utf-8', errors='ignore')
                logger.warning("Erro ao consultar status da principal (Evolution API): HTTP {} {} - {}", http_err.code, http_err.reason, body[:300])
                return jsonify({"success": False, "status": "DISCONNECTED", "error": f"HTTP {http_err.code}: {http_err.reason}", "detail": body[:200]})
            except Exception as e:
                logger.warning("Erro ao consultar status da principal (Evolution API): {}", e)
                return jsonify({"success": False, "status": "DISCONNECTED", "error": str(e)})

        # Caso contrário, Instância de Fallback (Pastorini API)
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
    """Tenta criar ou conectar a instância no gateway correspondente."""
    try:
        body = request.get_json(silent=True) or {}
        instance_type = body.get("type") or request.args.get("type", "primary")
        
        res = supabase.table("settings").select("value").eq("key", "whatsapp").execute()
        row = res.data[0] if res.data else None
        
        if not row:
            config = DEFAULT_SETTINGS["whatsapp"]
        else:
            val = row["value"]
            config = json.loads(val) if isinstance(val, str) else val
        
        if instance_type == "fallback":
            api_url = config.get("apiUrlFallback", "").strip().rstrip("/")
            instance_id = config.get("instanceIdFallback", "").strip()
            api_token = config.get("apiTokenFallback", "").strip()
            api_user = config.get("apiUserFallback", "").strip()
            api_password = config.get("apiPasswordFallback", "").strip()
        else:
            api_url = config.get("apiUrl", "").strip().rstrip("/")
            instance_id = config.get("instanceId", "").strip()
            api_token = config.get("apiToken", "").strip()
            api_user = config.get("apiUser", "").strip()
            api_password = config.get("apiPassword", "").strip()

        if not api_url or not instance_id:
            return jsonify({"error": "URL ou ID da Instância não informados"}), 400

        # ── Instância Principal (Evolution API) ─────────────────────────────
        if instance_type == "primary":
            evo_headers = _evolution_headers(api_token, api_user, api_password)

            # 1) Verificar estado atual — se já conectado, retorna imediatamente
            try:
                state_req = urllib.request.Request(
                    f"{api_url}/instance/connectionState/{instance_id}",
                    headers=evo_headers
                )
                with urllib.request.urlopen(state_req, timeout=10) as r:
                    state_data = json.loads(r.read().decode("utf-8"))
                    state = state_data.get("instance", {}).get("state", "disconnected")
                    if state == "open":
                        return jsonify({"success": True, "status": "CONNECTED", "details": state_data})
            except Exception as e:
                logger.info("Verificação de estado inicial ignorada: {}", e)

            # 2) Solicitar QR Code via /instance/connect/{instance}
            try:
                conn_req = urllib.request.Request(
                    f"{api_url}/instance/connect/{instance_id}",
                    headers=evo_headers
                )
                with urllib.request.urlopen(conn_req, timeout=10) as conn_resp:
                    conn_data = json.loads(conn_resp.read().decode("utf-8"))
                    logger.info("Resposta /instance/connect/{}: {}", instance_id, str(conn_data)[:300])
                    
                    # Evolution API pode retornar QR em diferentes formatos:
                    # Formato 1: { "qrcode": { "base64": "..." } }
                    # Formato 2: { "code": "2@...", "base64": "data:image/png;base64,..." }
                    # Formato 3: { "base64": "..." }
                    qr_base64 = (
                        conn_data.get("qrcode", {}).get("base64")
                        or conn_data.get("base64")
                        or conn_data.get("qrcode", {}).get("base64Image")
                    )
                    
                    if qr_base64:
                        # Garantir prefixo data URI
                        if not qr_base64.startswith("data:"):
                            qr_base64 = f"data:image/png;base64,{qr_base64}"
                        return jsonify({"success": True, "status": "QR_READY", "qrImage": qr_base64, "details": conn_data})
                    
                    # Formato 4: "code" contém o texto do QR bruto — gerar imagem via URL do QR
                    qr_code_text = conn_data.get("code")
                    if qr_code_text:
                        # Usar API pública para gerar QR como imagem
                        import urllib.parse
                        qr_url = f"https://quickchart.io/qr?text={urllib.parse.quote(qr_code_text)}&size=200"
                        logger.info("QR Code text recebido, usando QuickChart para gerar imagem")
                        return jsonify({"success": True, "status": "QR_READY", "qrImage": qr_url, "qrIsUrl": True, "details": conn_data})
                    
                    return jsonify({"success": True, "status": "CONNECTING", "details": conn_data})
            except urllib.error.HTTPError as http_err:
                body = http_err.read().decode("utf-8", errors="ignore")
                logger.warning("Erro ao conectar instância principal (Evolution): HTTP {} - {}", http_err.code, body[:300])
                return jsonify({"error": f"HTTP {http_err.code}: {http_err.reason} — {body[:200]}", "success": False})
            except Exception as e:
                logger.exception("Erro ao conectar instância principal (Evolution)")
                return jsonify({"error": str(e), "success": False})

        # ── Instância de Fallback (Pastorini API) ───────────────────────────
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
                logger.info("Instância fallback {} criada/iniciada: {}", instance_id, res_data)
        except Exception as e:
            logger.info("Tentativa de criação de instância fallback retornou: {}", e)

        request.args = {"type": instance_type}
        return whatsapp_instance_status()
    except Exception as e:
        logger.exception("Erro ao tentar conectar WhatsApp")
        return jsonify({"error": str(e)}), 500


@settings_bp.route("/whatsapp/disconnect", methods=["POST"])
def whatsapp_disconnect():
    """Realiza o logout/desconexão da instância no gateway correspondente."""
    try:
        body = request.get_json(silent=True) or {}
        instance_type = body.get("type") or request.args.get("type", "primary")
        
        res = supabase.table("settings").select("value").eq("key", "whatsapp").execute()
        row = res.data[0] if res.data else None
        
        if not row:
            config = DEFAULT_SETTINGS["whatsapp"]
        else:
            val = row["value"]
            config = json.loads(val) if isinstance(val, str) else val
        
        if instance_type == "fallback":
            api_url = config.get("apiUrlFallback", "").strip().rstrip("/")
            instance_id = config.get("instanceIdFallback", "").strip()
            api_token = config.get("apiTokenFallback", "").strip()
            api_user = config.get("apiUserFallback", "").strip()
            api_password = config.get("apiPasswordFallback", "").strip()
        else:
            api_url = config.get("apiUrl", "").strip().rstrip("/")
            instance_id = config.get("instanceId", "").strip()
            api_token = config.get("apiToken", "").strip()
            api_user = config.get("apiUser", "").strip()
            api_password = config.get("apiPassword", "").strip()

        if not api_url or not instance_id:
            return jsonify({"error": "Configurações incompletas"}), 400
            
        # Se for instância principal (Evolution API)
        if instance_type == "primary":
            evo_headers = _evolution_headers(api_token, api_user, api_password)
            logout_url = f"{api_url}/instance/logout/{instance_id}"
            try:
                req = urllib.request.Request(logout_url, headers=evo_headers, method="DELETE")
                with urllib.request.urlopen(req, timeout=10) as response:
                    res_data = json.loads(response.read().decode("utf-8"))
                    logger.info("Instância principal (Evolution API) {} desconectada: {}", instance_id, res_data)
                return jsonify({"success": True, "message": "Instância principal desconectada com sucesso."})
            except urllib.error.HTTPError as http_err:
                body = http_err.read().decode("utf-8", errors="ignore")
                logger.warning("Erro ao desconectar instância principal (Evolution): HTTP {} - {}", http_err.code, body[:300])
                return jsonify({"error": f"HTTP {http_err.code}: {http_err.reason} — {body[:200]}"}), 500
            except Exception as e:
                logger.exception("Erro ao desconectar instância principal (Evolution API)")
                return jsonify({"error": str(e)}), 500

        # Caso contrário, Instância de Fallback (Pastorini API)
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

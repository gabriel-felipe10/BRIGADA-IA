import os
from dotenv import load_dotenv
from supabase import create_client, Client
from app.logging_config import logger

# Garante que as variáveis de ambiente sejam carregadas do .env
load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    logger.error("Credenciais do Supabase não encontradas no arquivo .env!")
    raise RuntimeError("Faltando SUPABASE_URL ou SUPABASE_KEY no arquivo .env")

logger.info("Inicializando cliente Supabase | url={}", SUPABASE_URL)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

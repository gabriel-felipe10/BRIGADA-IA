import sys
import os

# Adiciona o diretório raiz ao sys.path para garantir que o módulo 'app' seja importado corretamente
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app

app = create_app()

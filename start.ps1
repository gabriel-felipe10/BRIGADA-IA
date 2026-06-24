# BRIGADA-IA - Script de Inicialização para PowerShell
$Host.UI.RawUI.WindowTitle = "BRIGADA-IA - Servidor"
Clear-Host

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "INICIALIZANDO O SISTEMA BRIGADA-IA..." -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# Determina qual comando Python utilizar (prefere 'py' que escolhe a versão do Windows e ignora o MSYS)
if (Get-Command py -ErrorAction SilentlyContinue) {
    $PyCmd = "py"
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
    $PyCmd = "python"
} else {
    Write-Host "[ERRO] Python ou Launcher 'py' não foi encontrado no sistema. Instale o Python oficial do Windows." -ForegroundColor Red
    Read-Host "Pressione Enter para sair..."
    exit
}

# Se a venv existe mas está corrompida (sem o script de ativação), apaga para recriar
if (Test-Path venv) {
    if (-not (Test-Path venv\Scripts\Activate.ps1)) {
        Write-Host "[INFO] Detectada venv corrompida ou incompleta. Removendo para recriar..." -ForegroundColor Yellow
        Remove-Item -Path venv -Recurse -Force
    }
}

# Cria o ambiente virtual se não existir
if (-not (Test-Path venv)) {
    Write-Host "[INFO] Criando ambiente virtual (venv) usando $PyCmd..." -ForegroundColor Yellow
    Start-Process -FilePath $PyCmd -ArgumentList "-m venv venv" -NoNewWindow -Wait
    if (-not (Test-Path venv\Scripts\Activate.ps1)) {
        Write-Host "[ERRO] Falha ao criar o ambiente virtual corretamente." -ForegroundColor Red
        Read-Host "Pressione Enter para sair..."
        exit
    }
}

# Ativa o ambiente virtual
Write-Host "[INFO] Ativando ambiente virtual..." -ForegroundColor Yellow
. .\venv\Scripts\Activate.ps1

# Instala dependências
Write-Host "[INFO] Verificando e instalando dependências..." -ForegroundColor Yellow
python -m pip install --upgrade pip | Out-Null
pip install -r requirements.txt

Write-Host "====================================================" -ForegroundColor Green
Write-Host "Servidor pronto! Iniciando a aplicação..." -ForegroundColor Green
Write-Host "A aplicação estará disponível em: http://localhost:5000" -ForegroundColor Green
Write-Host "Pressione CTRL+C para encerrar o servidor." -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host ""

python run.py

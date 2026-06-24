@echo off
:: BRIGADA-IA - Script de Inicializacao para CMD
title BRIGADA-IA - Servidor
cls

echo ====================================================
echo INICIALIZANDO O SISTEMA BRIGADA-IA...
echo ====================================================

:: Determina qual comando usar (prefere 'py' para ignorar o MSYS)
set PY_CMD=
where py >nul 2>nul
if %errorlevel% equ 0 (
    set PY_CMD=py
) else (
    where python >nul 2>nul
    if %errorlevel% equ 0 (
        set PY_CMD=python
    ) else (
        echo [ERRO] Python ou o launcher 'py' nao foi encontrado.
        pause
        exit /b
    )
)

:: Se venv existe mas esta corrompida, apaga
if exist venv (
    if not exist venv\Scripts\activate.bat (
        echo [INFO] Detectada venv incompleta. Removendo para recriar...
        rmdir /s /q venv
    )
)

:: Cria o ambiente virtual venv se nao existir
if not exist venv (
    echo [INFO] Criando ambiente virtual (venv) com %PY_CMD%...
    %PY_CMD% -m venv venv
    if not exist venv\Scripts\activate.bat (
        echo [ERRO] Falha ao criar o ambiente virtual.
        pause
        exit /b
    )
)

:: Ativa o ambiente virtual
echo [INFO] Ativando ambiente virtual...
call venv\Scripts\activate

:: Instala ou atualiza as dependencias
echo [INFO] Verificando e instalando dependencias...
python -m pip install --upgrade pip > nul
pip install -r requirements.txt

:: Inicializa o servidor Flask
echo ====================================================
echo Servidor pronto! Iniciando a aplicacao...
echo A aplicacao estara disponivel em: http://localhost:5000
echo Pressione CTRL+C para encerrar o servidor.
echo ====================================================
echo.

python run.py

pause

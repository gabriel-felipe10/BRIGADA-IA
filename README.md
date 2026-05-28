# 🛡️ BRIGADA-IA (Brigada de Validade)

O **BRIGADA-IA** é um sistema multiagente inteligente projetado para receber demandas de usuários, validar dados ou requisitos e encaminhá-los para processamento em agentes especializados. 

O objetivo principal é automatizar e padronizar fluxos de validação de dados (como arquivos CSV, payloads JSON e regras de negócio complexas), fornecendo auditoria e respostas rápidas e estruturadas.

---

## 🏗️ Arquitetura e Papéis

O sistema é composto por agentes com responsabilidades bem definidas:

*   **Mister**: O agente de interface e comunicação. Ele realiza a saudação inicial ao usuário, captura a demanda, classifica o tipo de validação necessária e despacha a tarefa para o agente correspondente.
*   **Agente de Validação (Python Agent)**: O executor técnico da validação. Recebe a carga útil (payload), valida regras de consistência, formatos e regras de negócio, e retorna um relatório estruturado no formato JSON.
*   **Agente de Log**: Responsável por auditar e registrar todos os eventos e resultados para fins de segurança e histórico.
*   **Outros Agentes (Futuros)**: Agentes adicionais de notificação (e-mail, Slack) ou agregação de dados.

---

## 📂 Estrutura do Projeto

```text
BRIGADA-IA/
├── agents/
│   └── python_agent/          # Agente validador em Python
│       ├── main.py            # Ponto de entrada do agente
│       ├── validator.py       # Lógica e regras de validação (CSV, JSON, Business Rules)
│       ├── requirements.txt   # Dependências do agente
│       └── tests/             # Testes unitários e de integração
├── skills/
│   └── mister/                # Habilidade (Skill) do agente Mister
│       ├── SKILL.md           # Definição e metadados da skill
│       ├── README.md          # Instruções específicas da skill
│       └── dispatch/          # Scripts de despacho
│           └── validate_request.py
├── brigada_de_validade.md     # Documentação e Playbook original do projeto
└── README.md                  # Este arquivo de documentação principal
```

---

## 🚀 Como Executar o Agente de Validação

O **Agente de Validação Python** pode ser executado diretamente por linha de comando de duas maneiras:

### 1. Passando um arquivo JSON como argumento
```bash
python agents/python_agent/main.py caminho/para/o/payload.json
```

### 2. Passando o JSON via Entrada Padrão (stdin)
```bash
echo '{"type": "json", "data": {"status": "ok"}}' | python agents/python_agent/main.py
```

### Tipos de Validação Suportados:
*   `csv`: Valida se os dados são uma lista de listas (linhas).
*   `json`: Valida se o conteúdo é um objeto válido com chaves do tipo string.
*   `business_rule`: Executa regras de negócio customizadas (por exemplo, exige os campos `id` como inteiro e `value` como numérico).

---

## 🧠 Como Usar o Script de Despacho (Mister Skill Dispatch)

O script de dispatch faz a ponte entre a inteligência do agente **Mister** e o **Agente de Validação**.

### Execução via Linha de Comando:
```bash
python skills/mister/dispatch/validate_request.py '{"type": "business_rule", "data": {"id": 10, "value": 99.9}}'
```

ou utilizando redirecionamento de input:

```bash
echo '{"type": "csv", "data": [[1, 2], [3, 4]]}' | python skills/mister/dispatch/validate_request.py
```

### Resposta JSON Esperada:
```json
{
  "status": "success",
  "details": [],
  "input": {
    "type": "csv",
    "data": [
      [1, 2],
      [3, 4]
    ]
  }
}
```

Se houver erros de validação, a resposta retornará com `"status": "error"` e detalhará os problemas no array `"details"`.

---

## 🧪 Rodando os Testes do Agente

Para garantir que as validações estejam corretas, instale as dependências e rode os testes utilizando o `pytest`:

```bash
# Navegar até o diretório do agente
cd agents/python_agent

# Instalar dependências
pip install -r requirements.txt

# Executar os testes unitários
pytest
```

---

## 📝 Próximos Passos
1. Integrar e automatizar o fluxo completo do Mister com o dispatcher do terminal.
2. Implementar o **Agente de Log** para salvar o histórico de validações.
3. Adicionar mais regras de negócio complexas no arquivo `validator.py`.

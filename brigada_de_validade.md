# Brigada de Validade

## Visão Geral
A Brigada de Validade tem como objetivo receber demandas dos usuários, validar dados ou requisitos e encaminhá‑los aos agentes especializados para processamento.

## Papéis
- **Mister**: Agente de comunicação que recebe a demanda, saudação inicial e dispata o trabalho para agentes especializados.
- **Agente de Validação**: Responsável por validar regras de negócio, formatos, consistência etc.
- **Agente de Log**: Registra eventos e resultados para auditoria.
- **Outros Agentes**: Podem ser criados conforme necessidade (ex.: agente de notificação, agente de agregação).

## Fluxo de Trabalho (Playbook)
1. **Saudação** – Mister inicia a conversa com o usuário.
2. **Captura da Demanda** – O usuário descreve o que precisa validar.
3. **Classificação** – Mister identifica o tipo de validação (ex.: formato CSV, consistência de campos, regras de negócio).
4. **Dispatch** – Mister encaminha a tarefa ao agente apropriado via mecanismo de dispatch definido no skill.
5. **Processamento** – Agente especializado executa a validação e devolve o resultado.
6. **Retorno ao Usuário** – Mister apresenta o resultado ao usuário, podendo incluir recomendações.

## Skill para Mister
*(já criada em `skills/mister/SKILL.md`)*  
A skill define o contrato de dispatch e o ponto de entrada para os scripts de validação.

## Primeiro Agente – Agente Python
### Objetivo
Implementar um agente Python que recebe tarefas de validação específicas (ex.: validar CSV, JSON, regras de negócio) e devolve um relatório estruturado.

### Responsabilidades
- Receber o payload da tarefa via API ou arquivo.
- Aplicar regras de validação definidas.
- Retornar um relatório JSON contendo:
  - `status`: \"success\" ou \"error\"
  - `details`: lista de mensagens de erro ou sucesso
  - `input`: dados recebidos (para rastreamento)

### Interface
- **Entrada**: JSON via POST (ou arquivo texto).
- **Saída**: JSON com o relatório.

### Estrutura de Diretórios Proposta
```
agents/python_agent/
├── __init__.py
├── main.py          # ponto de entrada (CLI ou servidor)
├── validator.py     # lógica de validação
├── utils.py         # funções auxiliares
├── tests/
│   ├── __init__.py
│   └── test_validator.py
├── requirements.txt
└── README.md
```

### Ambiente de Desenvolvimento
- Python 3.11+
- Dependências: `pydantic` (validação de dados), `pytest` (testes), `loguru` (logging)
- Configuração de ambiente virtual (`venv` ou `poetry`).

### Testes
- Cobertura mínima de 80%.
- Testes unitários para cada regra de validação.
- Testes de integração para o fluxo completo (Mister → agente → resultado).

## Próximos Passos
1. Revisar e aprovar este plano.
2. Implementar o agente Python conforme a estrutura acima.
3. Criar scripts de dispatch para os casos de uso identificados.
4. Integrar Mister ao fluxo de trabalho.
5. Executar testes e ajustar documentação.

## Documentação Adicional
- `README.md` na raiz explicando como iniciar a aplicação.
- `CHANGELOG.md` para versionamento.
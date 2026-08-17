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

## Esquema de Verificação de Validade dos Freezers (Piso de Loja)

**Ciclo único — Domingo a Sábado | 31 Freezers**

| Dia | Freezers Auditados | Total | Categorias |
| :--- | :--- | :---: | :--- |
| **Domingo** | 42, 43, 44, 45, 46 | 5 | Pescados |
| **Segunda** | 47, 48, 34, 35 | 4 | Pescados e Suínos |
| **Terça** | 36, 37, 38, 39, 40 | 5 | Misto (Bovino / Suíno / Aves) e Bovino |
| **Quarta** | 41, 17, 18, 19 | 4 | Bovino e Aves |
| **Quinta** | 20, 21, 22, 23, 24 | 5 | Aves |
| **Sexta** | 25, 26, 27, 28 | 4 | Aves e Bovino |
| **Sábado** | 29, 30, 31, 32 | 4 | Aves |
| **TOTAL** | **31 Freezers** | **31** | *Ciclo 100% Completo Sem Repetição* |

- **Sequência:** `42–48` ➔ `34–41` ➔ `17–25` ➔ `26–32`
- **Objetivo:** Verificar todos os 31 freezers exatamente uma única vez durante o ciclo semanal, garantindo conformidade total e zero rupturas de validade.

## Esquema de Verificação — Câmara Congelada

**Ciclo único — Domingo a Sábado | 16 Colunas (Racks)**

| Dia | Colunas Auditadas | Total |
| :--- | :--- | :---: |
| **Domingo** | 1, 2, 3 | 3 |
| **Segunda** | 4, 5, 6 | 3 |
| **Terça** | 7, 8, 9 | 3 |
| **Quarta** | 10, 11 | 2 |
| **Quinta** | 12, 13 | 2 |
| **Sexta** | 14, 15 | 2 |
| **Sábado** | 16 | 1 |
| **TOTAL** | **16 Colunas** | **16** |

- **Sequência:** `1–3` ➔ `4–6` ➔ `7–9` ➔ `10–11` ➔ `12–13` ➔ `14–15` ➔ `16`
- **Objetivo:** Verificar todas as 16 colunas da câmara congelada uma única vez durante o ciclo semanal, sem repetir nenhuma coluna.

## Documentação Adicional
- `README.md` na raiz explicando como iniciar a aplicação.
- `CHANGELOG.md` para versionamento.
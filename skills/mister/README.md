# Mister Skill

Esta skill fornece ao agente **Mister** a capacidade de despachar solicitações de validação do usuário para o **Agente de Validação Python**.

## Estrutura
- `SKILL.md`: Metadados e visão geral do playbook da Skill.
- `dispatch/validate_request.py`: Script Python que executa o dispatch. Ele encaminha solicitações de validação de dados para o agente de validação (`agents/python_agent/main.py`).

## Como Usar o Dispatch
O script pode ser executado passando um JSON diretamente como argumento ou via redirecionamento de arquivos / entrada padrão (stdin).

### Exemplo 1: Passando JSON por argumento
```bash
python skills/mister/dispatch/validate_request.py '{"type": "business_rule", "data": {"id": 10, "value": 99.9}}'
```

### Exemplo 2: Passando JSON via stdin (redirecionamento de pipe)
```bash
echo '{"type": "json", "data": {"status": "ok"}}' | python skills/mister/dispatch/validate_request.py
```

## Resposta Esperada
O retorno será um JSON estruturado contendo o resultado da validação, por exemplo:
```json
{
  "status": "success",
  "details": [],
  "input": {
    "type": "json",
    "data": {
      "status": "ok"
    }
  }
}
```

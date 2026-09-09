# 📊 BRIGADA-IA no Power BI — Guia Completo

> [!IMPORTANT]
> O servidor local (`http://localhost:5000`) precisa estar rodando antes de abrir o Power BI.

---

## Passo 1 — Conectar cada fonte de dados (Web)

No **Power BI Desktop**, repita os passos abaixo para cada URL:

1. Clique em **Página Inicial → Obter Dados → Web**
2. Cole a URL e clique **OK**
3. Na janela do Navegador, clique em **Lista** (ou **Record**) → **Transformar Dados**
4. No **Power Query Editor**, clique em **Em Coluna → Expandir** para achatar o JSON
5. Renomeie a consulta com o nome sugerido abaixo
6. Clique em **Fechar e Aplicar**

### URLs e nomes das consultas

| Nome da Consulta | URL |
|---|---|
| `Quebras` | `http://localhost:5000/api/powerbi/quebras` |
| `QubrasPorSetor` | `http://localhost:5000/api/powerbi/quebras-por-setor` |
| `QuebrasPorMes` | `http://localhost:5000/api/powerbi/quebras-por-mes` |
| `ProdutosSemNota` | `http://localhost:5000/api/powerbi/produtos-sem-nota` |
| `Crachas` | `http://localhost:5000/api/powerbi/crachas` |
| `Logs` | `http://localhost:5000/api/powerbi/logs` |
| `Resumo` | `http://localhost:5000/api/powerbi/resumo` |

---

## Passo 2 — Ajustar tipos de dados no Power Query

Após importar cada tabela, selecione as colunas e defina os tipos corretos:

### Tabela `Quebras`
| Coluna | Tipo |
|---|---|
| `id` | Número Inteiro |
| `quantity` | Número Decimal |
| `occurrence_date` | Data |
| `created_at` | Data/Hora |
| demais | Texto |

### Tabela `Crachas`
| Coluna | Tipo |
|---|---|
| `expiry_date` | Data |
| `quantity` | Número Decimal |
| `created_at` | Data/Hora |

### Tabela `ProdutosSemNota`
| Coluna | Tipo |
|---|---|
| `arrival_date` | Data |
| `quantity` | Número Decimal |
| `created_at` | Data/Hora |

### Tabela `Logs`
| Coluna | Tipo |
|---|---|
| `timestamp` | Data/Hora |
| `duration_ms` | Número Decimal |

---

## Passo 3 — Modelo de Dados (Relacionamentos)

Vá em **Exibição de Modelo** (ícone de diagrama na barra lateral).

As tabelas `Resumo`, `QubrasPorSetor` e `QuebrasPorMes` são **independentes** (sem chave estrangeira) — use-as direto em cartões e gráficos.

```
Quebras ──(sem join direto, usar filtros de data)── QuebrasPorMes
Quebras ──(sem join direto, usar filtros de setor)── QubrasPorSetor
```

> [!TIP]
> Como os dados vêm de endpoints separados e não há FK entre tabelas, use **filtros de segmentação (Slicers)** no relatório para filtrar por data, setor, responsável etc.

---

## Passo 4 — Medidas DAX sugeridas

No painel **Campos**, clique com botão direito na tabela `Quebras` → **Nova Medida**:

```dax
// Total de quantidade em quebras (kg)
Total KG Quebrado = SUM(Quebras[quantity])

// Média de quantidade por quebra
Media KG por Quebra = AVERAGE(Quebras[quantity])

// Quantidade de quebras no mês atual
Quebras Este Mês =
CALCULATE(
    COUNT(Quebras[id]),
    MONTH(Quebras[occurrence_date]) = MONTH(TODAY()),
    YEAR(Quebras[occurrence_date])  = YEAR(TODAY())
)
```

```dax
// Crachás vencendo nos próximos 7 dias
Crachas Vencendo =
CALCULATE(
    COUNT(Crachas[id]),
    Crachas[expiry_date] >= TODAY(),
    Crachas[expiry_date] <= TODAY() + 7
)
```

```dax
// Taxa de sucesso de validações
Taxa Sucesso Logs =
DIVIDE(
    CALCULATE(COUNT(Logs[id]), Logs[status] = "success"),
    COUNT(Logs[id]),
    0
)
```

---

## Passo 5 — Visuais recomendados por página

### Página 1 — "Visão Geral" (KPIs)
Use a tabela `Resumo` para os cartões:

| Visual | Campo |
|---|---|
| 🃏 Cartão | `total_quebras` |
| 🃏 Cartão | `quantidade_total_quebras_kg` |
| 🃏 Cartão | `total_produtos_sem_nota` |
| 🃏 Cartão | `total_crachas` |
| 🃏 Cartão | `percentual_sucesso` (formatar como %) |

---

### Página 2 — "Quebras & Avarias"

| Visual | Eixo | Valor |
|---|---|---|
| 📊 Gráfico de Barras | `sector` (de `QubrasPorSetor`) | `total_quantidade_kg` |
| 📈 Gráfico de Linha | `ano_mes` (de `QuebrasPorMes`) | `total_quantidade_kg` |
| 📋 Tabela | todos campos de `Quebras` | — |
| 🔽 Segmentação | `Quebras[sector]` | — |
| 🔽 Segmentação | `Quebras[occurrence_date]` (range) | — |

---

### Página 3 — "Crachás (Validade)"

| Visual | Eixo | Valor |
|---|---|---|
| 📊 Gráfico de Barras | `expiry_date` (agrupado por mês) | `COUNT(id)` |
| 📋 Tabela condicional | `product_name`, `expiry_date`, `quantity` | cor vermelha se vencendo |
| 🃏 Cartão | Medida `Crachas Vencendo` | — |

> [!TIP]
> Para colorir linhas vencidas: selecione a coluna `expiry_date` → **Formatação Condicional → Cor do Plano de Fundo** → regra: se valor < HOJE(), vermelho.

---

### Página 4 — "Produtos Sem Nota"

| Visual | Eixo | Valor |
|---|---|---|
| 📊 Gráfico de Barras | `arrival_date` (por mês) | `SUM(quantity)` |
| 📋 Tabela | `plu`, `name`, `quantity`, `arrival_date`, `responsible_name` | — |

---

### Página 5 — "Logs de Validação"

| Visual | Eixo | Valor |
|---|---|---|
| 🍩 Gráfico de Rosca | `status` | `COUNT(id)` |
| 📈 Gráfico de Linha | `timestamp` (por dia) | `COUNT(id)` |
| 🃏 Cartão | Medida `Taxa Sucesso Logs` | — |

---

## Passo 6 — Atualizar dados automaticamente

Por padrão o Power BI não atualiza automaticamente no modo local.

**Para atualizar manualmente:** `Página Inicial → Atualizar`

**Para atualização automática (opcional):**
- Publique o relatório no **Power BI Service** (nuvem)
- Configure um **Gateway de Dados** apontando para `localhost:5000`
- Defina um agendamento de atualização (ex: a cada hora)

> [!NOTE]
> Como o servidor roda localmente, o Power BI Service precisa de um **Gateway On-Premises** instalado no mesmo PC para acessar `localhost:5000`.

---

## Resumo dos endpoints

```
http://localhost:5000/api/powerbi/resumo
http://localhost:5000/api/powerbi/quebras
http://localhost:5000/api/powerbi/quebras-por-setor
http://localhost:5000/api/powerbi/quebras-por-mes
http://localhost:5000/api/powerbi/produtos-sem-nota
http://localhost:5000/api/powerbi/crachas
http://localhost:5000/api/powerbi/logs
```

# Especificação — Sistema de Controle de Consumo de Água

## 1. Visão geral

Aplicação web para uso pessoal (sem login) que permite registrar leituras do hidrômetro, acompanhar o consumo diário e visualizar o consumo acumulado desde a última leitura oficial da Sanepar, que serve de referência para o ciclo de faturamento.

## 2. Stack tecnológica

- **Frontend:** Expo (React Native Web), export estático
- **Backend:** Hono, rodando em Cloudflare Workers
- **Banco de dados:** Cloudflare D1 (SQLite), acessado via binding nativo do Worker
- **Hospedagem:**
  - Frontend → Cloudflare Pages
  - Backend → Cloudflare Workers
  - Banco → Cloudflare D1 (mesma conta Cloudflare, sem connection string/secret — acesso via binding declarado em `wrangler.toml`)

Tudo na mesma conta Cloudflare, o que simplifica o gerenciamento e elimina a necessidade de variáveis de ambiente sensíveis para o banco.

Como não há autenticação, a arquitetura fica simples: SPA consumindo uma API REST sem camada de sessão/usuário.

> Histórico: a versão original (até ago/2026) rodava em React + Express + Postgres, hospedados em
> Render (frontend/backend) e Neon (banco). Migrado para Cloudflare porque NestJS/Express não roda
> nativamente em Workers (modelo `fetch` handler, sem bind de porta) — Hono foi feito para esse ambiente.
> Dados existentes foram migrados do Neon para o D1 via replay das leituras pela própria API (inserts via
> binding aceitam payloads de vários MB sem problema; só a ferramenta de import em massa do D1 tem um
> limite de tamanho de statement bem mais restrito).

**Repositório:** https://github.com/rodrigobaruffi-byte/LeituraAgua

## 3. Modelo de dados

Duas tabelas: `leitura` (conferências do usuário) e `leiturasanepar` (referência oficial de faturamento).

### 3.1 Tabela `leitura`

| Campo         | Tipo            | Observação |
|---------------|-----------------|------------|
| `id`          | INTEGER         | Chave primária, `AUTOINCREMENT` |
| `dataleitura` | TEXT            | Data em que a leitura foi feita, formato `YYYY-MM-DD` |
| `valorleitura`| REAL            | Leitura do hidrômetro; formatada com 2 casas decimais na resposta da API |
| `fotoleitura` | TEXT            | Foto da leitura em base64 (data URI, ex: `data:image/jpeg;base64,...`). Campo opcional. |

```sql
CREATE TABLE leitura (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dataleitura TEXT NOT NULL,
  valorleitura REAL NOT NULL,
  fotoleitura TEXT
);
```

**Trade-off assumido:** salvar a foto como base64 direto no D1 é a opção mais simples de implementar. Um
insert via binding do Worker (`.prepare().bind()`) aceita tranquilamente payloads de vários MB — testado
com fotos de ~4MB sem problema. A única ferramenta que tem um limite bem mais restrito é o importador em
massa via CLI (`wrangler d1 execute --file`, que embute tudo como texto SQL literal), irrelevante para o
uso normal do app. Se o volume de fotos crescer muito no D1 (limite de storage da conta), dá para migrar
`fotoleitura` para guardar só uma URL de storage externo (Cloudflare R2), sem mudar o resto do sistema.

### 3.2 Tabela `leiturasanepar`

Referência oficial: a data e o valor que a Sanepar efetivamente considera para o faturamento. Serve de marco-zero para a projeção mensal (item 4.3).

| Campo         | Tipo            | Observação |
|---------------|-----------------|------------|
| `id`          | INTEGER         | Chave primária, `AUTOINCREMENT` |
| `datasanepar` | TEXT            | Data em que a Sanepar realizou a leitura para faturamento, formato `YYYY-MM-DD` |
| `valorsanepar`| REAL            | Valor do hidrômetro registrado pela Sanepar nessa data; formatado com 2 casas decimais na resposta da API |

```sql
CREATE TABLE leiturasanepar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  datasanepar TEXT NOT NULL,
  valorsanepar REAL NOT NULL
);
```

## 4. Telas / Funcionalidades

### 4.1 Tela inicial

**Cabeçalho:** ícone + título "Controle de Consumo de Água" + subtítulo.

**Painel de indicadores** (4 campos, no topo da tela):
- **Leituras registradas** — contagem total de registros na tabela `leitura`
- **Dt última leitura Sanepar** — `datasanepar` do registro mais recente em `leiturasanepar`
- **Valor leitura Sanepar** — `valorsanepar` do registro mais recente em `leiturasanepar`
- **Consumo até hoje** — consumo acumulado desde a referência Sanepar:
  ```
  consumo_ate_hoje = valorleitura_mais_recente - valorsanepar_referencia
  ```

**Botão "Leitura Sanepar"** — roteia para a tela descrita em 4.2.

**Card "Nova leitura"** — formulário para registrar uma conferência do usuário:
- **Data**: preenchida por padrão com a data de hoje (editável)
- **Leitura (m³)**: campo numérico com 2 casas decimais
- **Foto**: botão para tirar foto da leitura (usa câmera do dispositivo via `<input type="file" accept="image/*" capture="environment">`), com preview da imagem antes de salvar
- Botão **Adicionar**

Ao salvar, a foto é convertida para base64 no próprio frontend antes de enviar para a API.

**Gráfico de consumo diário** — gráfico de linhas mostrando a média de consumo diário (m³/dia) de cada intervalo entre leituras consecutivas, em ordem cronológica (mais antiga → mais recente) no eixo X.

**Histórico de leituras** — tabela com todas as leituras em ordem decrescente de data (mais recente primeiro), mostrando:
- Data
- Leitura (m³)
- Miniatura da foto (se houver, com opção de ampliar)
- Consumo do período (em relação à leitura anterior)
- Ação de excluir

### 4.2 Tela "Leitura Sanepar"

Acessada pelo botão da tela inicial. Contém:

**Formulário de registro:**
- **Data da leitura Sanepar**
- **Valor da leitura Sanepar (m³)**, 2 casas decimais
- Botão **Salvar**, gravando em `leiturasanepar`

**Histórico de leituras Sanepar** — listagem em ordem decrescente de data, com opção de excluir.

## 5. API (backend Node)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/leituras` | Lista todas as leituras (ordenadas por data) |
| POST | `/api/leituras` | Cria nova leitura `{ dataleitura, valorleitura, fotoleitura }` |
| DELETE | `/api/leituras/:id` | Remove uma leitura |
| GET | `/api/leiturassanepar` | Lista todos os registros oficiais da Sanepar (ordenados por data) |
| POST | `/api/leiturassanepar` | Cria novo registro `{ datasanepar, valorsanepar }` |
| DELETE | `/api/leiturassanepar/:id` | Remove um registro |

## 6. Fora do escopo

- Alerta de consumo alto / meta mensal: removido a pedido — não faz parte desta versão.
- Autenticação/login: não há.

## 7. Ambiente de deploy

Tudo na conta Cloudflare (rodrigo.baruffi@gmail.com), sem variáveis de ambiente sensíveis — o banco é
acessado via binding, não connection string.

- **Cloudflare Workers** — projeto `leitura-agua-api`, deploy via `wrangler deploy` (dentro de `apps/api`).
  URL: `https://leitura-agua-api.rodrigo-baruffi.workers.dev`.
- **Cloudflare D1** — banco `leitura-agua`, binding `DB` declarado em `apps/api/wrangler.toml`
  (`database_id` fica no próprio arquivo, versionado — não é secreto, só identifica o recurso na conta).
- **Cloudflare Pages** — projeto `leitura-agua`, deploy via `wrangler pages deploy apps/web/dist
  --project-name=leitura-agua`. Produção em `https://leitura-agua.pages.dev` (branch `main`); outros
  branches geram preview deployments em `https://<branch>.leitura-agua.pages.dev`.

### Setup local do Wrangler

```
npx wrangler login
```

### Deploy

```
pnpm --filter web run build && npx wrangler pages deploy apps/web/dist --project-name=leitura-agua
cd apps/api && npx wrangler deploy
```

### Histórico (stack anterior, até ago/2026)

Render (frontend + backend) e Neon (Postgres) — descontinuados após a migração para Cloudflare. A
connection string do Neon não é mais usada por nenhum serviço ativo.

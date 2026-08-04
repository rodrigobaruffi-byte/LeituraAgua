# Especificação — Sistema de Controle de Consumo de Água

## 1. Visão geral

Aplicação web para uso pessoal (sem login) que permite registrar leituras do hidrômetro, acompanhar o consumo diário e visualizar o consumo acumulado desde a última leitura oficial da Sanepar, que serve de referência para o ciclo de faturamento.

## 2. Stack tecnológica

- **Frontend:** React
- **Backend:** Node.js (API REST, ex: Express)
- **Banco de dados:** PostgreSQL
- **Hospedagem gratuita sugerida:**
  - Frontend → Render (Static Site)
  - Backend → Render (Web Service)
  - Banco → Neon (Postgres serverless, free tier, sem expiração)

Frontend e backend ficam na mesma conta/painel do Render, o que simplifica o gerenciamento. O Postgres fica no Neon em vez do Render porque o banco gratuito do Render expira em 30 dias (dados apagados depois); o Neon não tem esse limite. A integração entre backend e banco é feita via connection string do Neon, configurada como variável de ambiente no serviço Node do Render.

Como não há autenticação, a arquitetura fica simples: SPA React consumindo uma API REST sem camada de sessão/usuário.

**Repositório:** https://github.com/rodrigobaruffi-byte/LeituraAgua

## 3. Modelo de dados

Duas tabelas: `leitura` (conferências do usuário) e `leiturasanepar` (referência oficial de faturamento).

### 3.1 Tabela `leitura`

| Campo         | Tipo            | Observação |
|---------------|-----------------|------------|
| `id`          | SERIAL          | Chave primária, autoincrementável pelo banco |
| `dataleitura` | DATE            | Data em que a leitura foi feita |
| `valorleitura`| NUMERIC(10,2)   | Leitura do hidrômetro, 2 casas decimais |
| `fotoleitura` | TEXT            | Foto da leitura em base64 (data URI, ex: `data:image/jpeg;base64,...`). Campo opcional. |

```sql
CREATE TABLE leitura (
  id SERIAL PRIMARY KEY,
  dataleitura DATE NOT NULL,
  valorleitura NUMERIC(10,2) NOT NULL,
  fotoleitura TEXT
);
```

**Trade-off assumido:** salvar a foto como base64 direto no Postgres é a opção mais simples de implementar, mas faz a tabela crescer rápido e pode deixar consultas mais lentas conforme o histórico aumenta. Se isso virar problema no futuro, dá para migrar `fotoleitura` para armazenar apenas uma URL de storage externo (Cloudflare R2 / Supabase Storage), sem mudar o resto do sistema.

### 3.2 Tabela `leiturasanepar`

Referência oficial: a data e o valor que a Sanepar efetivamente considera para o faturamento. Serve de marco-zero para a projeção mensal (item 4.3).

| Campo         | Tipo            | Observação |
|---------------|-----------------|------------|
| `id`          | SERIAL          | Chave primária, autoincrementável pelo banco |
| `datasanepar` | DATE            | Data em que a Sanepar realizou a leitura para faturamento |
| `valorsanepar`| NUMERIC(10,2)   | Valor do hidrômetro registrado pela Sanepar nessa data |

```sql
CREATE TABLE leiturasanepar (
  id SERIAL PRIMARY KEY,
  datasanepar DATE NOT NULL,
  valorsanepar NUMERIC(10,2) NOT NULL
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

Contas já criadas (cadastro inicial, sem serviços configurados ainda porque não há código):

- **Render** — conta criada, login via GitHub. Serviços (Static Site + Web Service) serão criados só quando o repositório `LeituraAgua` tiver código para conectar. Ambos devem usar o tipo de instância **Free**.
- **Neon** — conta criada, projeto `leitura-agua` provisionado.

### Variáveis de ambiente necessárias

| Variável | Onde configurar | Valor |
|----------|------------------|-------|
| `DATABASE_URL` | Render → Web Service → aba **Environment** | `postgresql://neondb_owner:npg_PxvCAw9B3cdG@ep-long-rain-acvs592s.sa-east-1.aws.neon.tech/neondb?sslmode=require` |

### Neon CLI (setup local)
Para inicializar a integração do projeto com o Neon via linha de comando:

```
npx neonctl@latest init
```

### Observação
Projeto pessoal simples, sem requisitos formais de segurança — a connection string está registrada diretamente aqui por decisão do autor. Ainda assim, o ideal é não versionar este arquivo publicamente com o valor real preenchido, já que ele dá acesso de escrita ao banco.

# LeituraAgua

Controle pessoal de consumo de água: registro de leituras do hidrômetro e acompanhamento do consumo desde a última leitura oficial da Sanepar. Ver [espec.md](./espec.md) para a especificação completa.

## Estrutura

```
LeituraAgua/
├── apps/
│   ├── web/   → frontend Expo (web), deploy no Cloudflare Pages
│   └── api/   → backend Hono, deploy no Cloudflare Workers + D1
├── pnpm-workspace.yaml
└── package.json
```

## Requisitos

- Node.js >= 20
- pnpm (`corepack enable` habilita a versão travada em `packageManager`)
- Conta Cloudflare com Wrangler CLI autenticado (`npx wrangler login`)

## Setup

```bash
pnpm install
```

O banco (D1) é acessado via binding no `apps/api/wrangler.toml` — não precisa de connection string/`.env`.

## Rodando em desenvolvimento

```bash
pnpm dev:api   # Worker local (wrangler dev) em http://localhost:8787/api
pnpm dev:web   # Expo web em http://localhost:8081
```

`pnpm dev` roda os dois em paralelo.

O frontend lê a URL da API da variável `EXPO_PUBLIC_API_URL` (ver `apps/web/.env.example`).

## Deploy

Ver `espec.md`, seção 7 — Cloudflare Pages (frontend), Workers (backend) e D1 (banco).

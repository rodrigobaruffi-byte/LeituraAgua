# LeituraAgua

Controle pessoal de consumo de água: registro de leituras do hidrômetro e acompanhamento do consumo desde a última leitura oficial da Sanepar. Ver [espec.md](./espec.md) para a especificação completa.

## Estrutura

```
LeituraAgua/
├── apps/
│   ├── web/   → frontend Expo (web)
│   └── api/   → backend NestJS
├── pnpm-workspace.yaml
└── package.json
```

## Requisitos

- Node.js >= 20
- pnpm (`corepack enable` habilita a versão travada em `packageManager`)
- Um banco Postgres acessível (Neon) com as tabelas `leitura` e `leiturasanepar` já criadas (ver `espec.md`, seção 3)

## Setup

```bash
pnpm install
cp apps/api/.env.example apps/api/.env   # preencher DATABASE_URL
```

## Rodando em desenvolvimento

```bash
pnpm dev:api   # NestJS em http://localhost:3000/api
pnpm dev:web   # Expo web em http://localhost:8081
```

`pnpm dev` roda os dois em paralelo.

O frontend lê a URL da API da variável `EXPO_PUBLIC_API_URL` (ver `apps/web/.env.example`).

## Deploy

Ver `espec.md`, seção 7 — Render (frontend + backend) e Neon (Postgres).

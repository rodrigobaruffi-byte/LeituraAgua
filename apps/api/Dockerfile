FROM node:22-alpine AS builder
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .
RUN pnpm --filter api run build

FROM node:22-alpine
WORKDIR /app
RUN corepack enable

COPY --from=builder /app ./

WORKDIR /app/apps/api
EXPOSE 4001
CMD ["node", "dist/main.js"]

FROM node:22-alpine AS builder
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .

ARG EXPO_PUBLIC_API_URL=/api
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL

RUN pnpm --filter web run build

FROM node:22-alpine
WORKDIR /app
RUN npm install -g serve

COPY --from=builder /app/apps/web/dist ./dist

EXPOSE 3001
CMD ["serve", "-s", "dist", "-l", "3001"]

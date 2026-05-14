# ============================================================
# Stage 1: deps — 本番依存関係のインストール
# ============================================================
FROM oven/bun:1-alpine AS deps
WORKDIR /app

COPY package.json bun.lock bunfig.toml ./
RUN bun install --frozen-lockfile --production

# ============================================================
# Stage 2: builder — Next.js アプリのビルド
# ============================================================
FROM oven/bun:1-alpine AS builder
WORKDIR /app

COPY package.json bun.lock bunfig.toml ./
# devDependencies を含む全依存関係をインストール（ビルド時に必要）
RUN bun install --frozen-lockfile

COPY . .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN bun run build

# ============================================================
# Stage 3: runner — 最小本番イメージ (Node 22 Alpine)
# ============================================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# standalone の server.js は PORT / HOSTNAME 環境変数を参照する
ENV PORT=3000
# 0.0.0.0 にバインドしないとコンテナ外からアクセス不可になる
ENV HOSTNAME=0.0.0.0

# セキュリティ強化: 非 root ユーザーで実行
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# standalone バンドル・静的ファイル・public をコピー
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public           ./public

USER nextjs

EXPOSE 3000

# next standalone は Node.js の server.js を生成する
# Bun ではなく node で実行して ABI 互換性を保証する
CMD ["node", "server.js"]

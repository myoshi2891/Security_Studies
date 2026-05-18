# Makefile — Security Studies Docker ワークフロー
# プロジェクトルート (Security_Studies/) から実行すること

.PHONY: dev dev-recreate build up down logs shell test clean help

COMPOSE    := docker compose
IMAGE_NAME := security-studies:prod

## ── 開発 ─────────────────────────────────────────────────────────────────────

dev: ## 開発サーバー起動（ホットリロード, http://localhost:3000）
	@echo "Starting dev server on http://localhost:3000 ..."
	$(COMPOSE) up dev

dev-recreate: ## docker-compose.yml 変更後の強制再作成（ボリューム含めて作り直す）
	@echo "Recreating dev container from scratch ..."
	$(COMPOSE) down --remove-orphans
	$(COMPOSE) up dev --force-recreate --renew-anon-volumes

## ── 本番ビルド ───────────────────────────────────────────────────────────────

build: ## 本番 Docker イメージのビルド
	@echo "Building production image: $(IMAGE_NAME) ..."
	$(COMPOSE) build prod

## ── 本番起動 ─────────────────────────────────────────────────────────────────

up: build ## 本番イメージをビルドしてコンテナを起動（バックグラウンド）
	@echo "Starting production server on http://localhost:3000 ..."
	$(COMPOSE) --profile prod up -d prod

## ── ライフサイクル ───────────────────────────────────────────────────────────

down: ## すべてのコンテナを停止・削除
	$(COMPOSE) --profile prod down

## ── ログ ─────────────────────────────────────────────────────────────────────

logs: ## ログを追跡（make logs SERVICE=prod で本番ログ）
	$(COMPOSE) logs -f $(or $(SERVICE),dev)

## ── デバッグ ─────────────────────────────────────────────────────────────────

shell: ## 実行中の dev コンテナにシェルで接続
	$(COMPOSE) exec dev sh

## ── テスト ───────────────────────────────────────────────────────────────────

test: ## Bun テストスイートをコンテナ内で実行
	$(COMPOSE) run --rm dev sh -c "bun install --frozen-lockfile && bun test"

## ── クリーンアップ ───────────────────────────────────────────────────────────

clean: ## コンテナ・イメージ・ボリュームをすべて削除
	$(COMPOSE) --profile prod down --rmi all --volumes --remove-orphans
	@echo "Clean complete."

## ── ヘルプ ───────────────────────────────────────────────────────────────────

help: ## コマンド一覧を表示
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help

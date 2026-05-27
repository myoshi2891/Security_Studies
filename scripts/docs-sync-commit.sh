#!/bin/bash
set -e

# プロジェクトルートにいることを確認
cd "$(dirname "$0")/.."

echo "===> 仕様書およびスキル関連ファイルの自動ステージングを開始します..."

# 1. 関連ファイルをステージ
git add \
  CLAUDE.md GEMINI.md README.md \
  docs/progress.md docs/test-coverage-dashboard.html \
  security-docs/CLAUDE.md security-docs/README.md \
  .gemini/skills/ .claude/skills/ .gemini/rules/ .claude/rules/ scripts/ 2>/dev/null || true

# 2. ステージングされた差分があるか確認
if git diff --cached --quiet; then
  echo "===> 差分はありません。コミットをスキップします。"
  exit 0
fi

# 3. テスト数の実測値を取得してコミットメッセージを動的に生成
echo "===> テスト結果の集計値を確認しています..."
# テスト結果出力を取得して "Ran X tests" を探す
if [ -d "security-docs" ]; then
  # bun が利用可能か確認
  if command -v bun &> /dev/null; then
    TEST_OUT=$(cd security-docs && bun test 2>&1 || true)
    TEST_COUNT=$(echo "$TEST_OUT" | grep -oE "Ran [0-9]+ tests" | awk '{print $2}')
  fi
fi

if [ -n "$TEST_COUNT" ]; then
  COMMIT_MSG="chore(docs): sync spec files (reflects $TEST_COUNT test cases)"
else
  COMMIT_MSG="chore(docs): sync spec files — update progress tracker and metadata"
fi

# 4. コミット実行
echo "===> コミットを実行します: $COMMIT_MSG"
git commit -m "$COMMIT_MSG"
echo "===> コミットが正常に完了しました！"

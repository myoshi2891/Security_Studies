# リポジトリ内ファイルへの絶対パス記載禁止ルール

## ルール

コミット対象のファイル（ドキュメント、設定ファイル、コードのコメント等）に
ユーザー名を含む絶対パスを記載してはならない。

**禁止例**:

```text
/Users/johndoe/.claude/plans/my-plan.md
/home/johndoe/workspace/project/...
C:\Users\johndoe\...
```

**許可例**:

```text
.claude/plans/my-plan.md        （リポジトリルートからの相対パス）
~/.claude/plans/my-plan.md      （チルダ展開形式、リポジトリ内ではなくローカルを示すときのみ）
```

## 適用対象

- `docs/progress.md` などのドキュメント
- `.claude/rules/` や `.claude/skills/` 内のファイル
- `.gemini/rules/` や `.gemini/skills/` 内のファイル
- コードのコメント・JSDoc
- 設定ファイル（`.claude/settings.json` 等）

## 外部ファイルを参照したい場合

`~/.claude/skills/` や `~/.gemini/` 等のリポジトリ外ファイルをコミット対象のドキュメントから
参照したい場合は、そのファイルを先にリポジトリ内（`.claude/` や `.gemini/` 内）へコピーしてから
相対パスで参照する。

```bash
cp ~/.gemini/skills/some-skill.md .gemini/skills/some-skill.md
git add .gemini/skills/some-skill.md
```

## 理由

絶対パスにはOS上のユーザー名が含まれ、パブリックリポジトリや
チームへのプッシュ時に個人情報を晒すリスクがある。

## AI エージェント向けの検証手順（必須）

AI エージェントは、`git commit` などのコミットを行う前に、必ずステージングされた変更差分（`git diff --cached`）に対して、ローカル絶対パスやユーザー名が含まれていないかを機械的に確認しなければなりません。

具体的には、コミット前に以下の検証用の検索コマンド（または同等の差分走査）を自律的に実行し、PII が混入していないことを検証してください。

```bash
# コミット対象の差分にローカル絶対パス（Users/ や home/）が含まれていないかチェック
# プレースホルダー（johndoe）を除く絶対パスが検出された場合はコミットを中止する
git diff --cached | grep -E '^\+[^+]' | grep -E '(/Users/|/home/|C:\\Users\\)' | grep -vE 'johndoe'
```

このチェックで結果（追加行）が出力された場合は、該当箇所を削除または相対パスに変更し、クリーンであることを確認した上でコミットを実行してください。

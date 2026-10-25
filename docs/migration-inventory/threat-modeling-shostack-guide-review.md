# Threat Modeling (Shostack) 移行の目視確認表

最終更新: 2026-10-25

対象: `/docs/threat-modeling-shostack-guide`。目視はユーザー担当・未確認。Next.jsビルドは禁止・未実行。

| 対象 | 自動照合の範囲 |
|---|---|
| 本文 | 全17章（`ch1`〜`ch17`）・82見出し（`h1`: 1, `h2`: 17, `h3`: 60, `h4`: 4） |
| 構造 | 全17章＋ヒーロー・ブランド・目次・サイドバーフッター・本文フッターの22固定SHA-256 |
| 表 | 52表・944セル（`th`: 152, `td`: 792、空セル16個を含む）・全表と全ページのhydration |
| 図 | 9定義（フローチャート8・シーケンス1）の原文・構文・設定・遅延描画・再試行・テキスト説明・自然幅 |
| コード | 2例（`markdown`・`python`）の改行/空白を生テキストSHA-256とhighlight.js構文ハイライトで照合 |
| リスト・バッジ | `ul`丸点（`disc`）・`ol`連番（`decimal`）・章番号バッジ1〜17・目次番号1〜17・参考番号1〜22 |
| 演習・注意欄 | 第15章の2つの解答`<details>`開閉、全12注意欄（`note`/`point`/`caution`） |
| 出典 | 22参考文献カード・全番号・タイトル・説明・URL・`rel="noopener noreferrer"` |
| 表示 | 全CSS宣言/media・5幅（375/640/768/1024/1440px）×明暗・2幅×明暗の全944セルホバー（`#0b1a2e`） |
| 統合 | 34ページの共通ナビ（Security Guides）・ホーム・静的/動的検索・全82見出し |

- [ ] PCとスマートフォンで、ヒーロー・メタ情報・位置づけ注意欄を確認
- [ ] 第1〜8章（定義、2026年の文脈、4つの質問、Step 0〜Step 4）の本文・表・図を確認
- [ ] 第9〜17章（ハンズオン、LINDDUN、AI/LLM・エージェント、ツール/pytm、Manifesto、失敗例、演習、用語集、参考文献）を確認
- [ ] 52表の長文・空セル（16箇所）・横スクロール・最終行の罫線を確認
- [ ] 明暗両設定で表をホバーした際、原本どおり `#0b1a2e` 背景・`#c6d0e3` 文字色が維持され白飛びしないことを確認
- [ ] 17章見出しバッジ（`.num`）、17目次番号（`.nav-link .n`）、22参考文献番号（`.ref-num`）の連続性を確認
- [ ] 第7章のMarkdownテンプレートと第12章のPython（`pytm`）コードの色分け・横スクロールを確認
- [ ] 9図（`d1`〜`d9`）のノード・矢印・信頼境界サブグラフ・シーケンス図を確認。小図の中央寄せと幅広図の左端からのスクロールを確認
- [ ] サイドバーの章別サブメニュー展開（`.nav-group.active`）・スクロール追従・モバイルドロワー開閉（`#navToggle`）・Escape・背景クリック・見出しフォーカス移動を確認
- [ ] 第15章の2つの「解答の目安」`<details>`の独立した開閉を確認
- [ ] 375/640/768/1024/1440pxでヒーロー・見出し・参考文献カードと共通ヘッダーを確認
- [ ] ホーム・Security Guidesナビ・検索から `/docs/threat-modeling-shostack-guide` へ移動できることを確認

原本は `archive/security-guides/Threat-modeling-shostack-guide.html` / `archive/security-guides/Threat-modeling-shostack-guide.md` へバイト不変で移動済み（Git管理外）。両SHA-256は `docs/migration-inventory/threat-modeling-shostack-guide.json` に記録。原本なし環境（CI）でも22構造ハッシュ・2コードハッシュ・操作・ホバー・Hydration等の60件が成功し、原本依存38件のみスキップする。

最終自動検証: 専用98件（12ファイル）成功。全体2018成功/0skip/0失敗（264ファイル、544,760 expect）。原本なし隔離環境で専用60成功/38skip/0失敗。npm経由のlint・型チェック成功。

再実行（`security-docs`内）:

```sh
npm test -- --timeout 30000 src/app/docs/threat-modeling-shostack-guide
```

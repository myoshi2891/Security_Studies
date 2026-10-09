# CCIE Security 移行・目視確認表

最終更新日: 2026-10-09

確認URL: `/docs/ccie-security`。新カテゴリー: **Security Certifications**（Resourcesの直前）。
元資料の作成基準日は2026-10-04のまま保持しています。HTMLとMarkdown原稿は変更していません。

## 自動検証結果

- `bun test`: **154 pass / 0 fail、28ファイル、5,326アサーション**。
- `bun run lint` / `bun run types:check`: 成功。
- 本文見出し139個＋ページタイトル1個、13章、85表、61図、34コード、49リスト・196項目、7チェック、59参考文献を検証。
- 章単位のDOM構造・全文・全表セル・リスト階層・強調・アンカーを元HTMLと比較。コードは空白・改行を含め一致。
- 図は61定義すべてが元資料と一致し、Mermaid 11.12.0の実パーサーを通過。描画部品のSVGサイズ補正・ID一意性・失敗表示・非同期更新も検証。
- 点・番号のCSSを元資料と比較し、項目・セル・強調・マーカーを欠落させた検体で検出できることを確認。
- npm・Next.jsビルド・公開は未実施。実ブラウザーでの描画結果はユーザー確認待ち。

## 章別確認

各章のチェック欄は、ユーザーによる目視確認後に更新してください。

| 確認 | 章 | 表 | 図 | コード | リスト |
|---|---|---:|---:|---:|---:|
| 未確認 | [1. このガイドの使い方と最初に知っておくべき注意点](/docs/ccie-security#s1) | 2 | 0 | 0 | 1 |
| 未確認 | [2. CCIE Security 認定の全体像](/docs/ccie-security#s2) | 3 | 2 | 0 | 0 |
| 未確認 | [3. 製品名の新旧対照表](/docs/ccie-security#s3) | 1 | 0 | 0 | 0 |
| 未確認 | [4. 学習ロードマップ](/docs/ccie-security#s4) | 1 | 2 | 0 | 0 |
| 未確認 | [5. Domain 1: Perimeter Security and Intrusion Prevention（20%）](/docs/ccie-security#s5) | 14 | 8 | 8 | 12 |
| 未確認 | [6. Domain 2: Secure Connectivity and Segmentation（20%）](/docs/ccie-security#s6) | 12 | 8 | 6 | 7 |
| 未確認 | [7. Domain 3: Security Infrastructure（15%）](/docs/ccie-security#s7) | 12 | 9 | 12 | 5 |
| 未確認 | [8. Domain 4: Identity Management, Information Exchange, and Access Control（25%）](/docs/ccie-security#s8) | 24 | 18 | 5 | 15 |
| 未確認 | [9. Domain 5: Advanced Threat Protection and Content Security（20%）](/docs/ccie-security#s9) | 11 | 11 | 3 | 7 |
| 未確認 | [10. 横断ベストプラクティス集](/docs/ccie-security#s10) | 3 | 2 | 0 | 0 |
| 未確認 | [11. ラボ試験の戦い方](/docs/ccie-security#s11) | 1 | 1 | 0 | 1 |
| 未確認 | [12. 用語集](/docs/ccie-security#s12) | 1 | 0 | 0 | 0 |
| 未確認 | [13. 参考文献・ソース URL 一覧](/docs/ccie-security#s13) | 0 | 0 | 0 | 1 |

## 共通チェック

- [ ] 新カテゴリーとCCIEリンク、現在ページ表示、AppSecページの既存位置。
- [ ] 元HTMLの配色・見出し・注意枠・「やさしい説明」・欧文フォント。
- [ ] 角形の点、丸囲みの番号、注意枠ごとの点の色。点や番号の重複・消失がない。
- [ ] デスクトップと狭い画面（320px・375px・768px）で表・コード・図・URLが読める。ページ全体が横にはみ出さない。
- [ ] フローチャート・シーケンス図・円グラフの61図が描画され、ラベルや図の下端が切れない。
- [ ] CLI32件とPython2件の色分け・改行・空白。
- [ ] ページ内目次をキーボードで開き、各リンクから見出しに移動できる。
- [ ] 7チェックがクリック・Tab・Spaceで独立操作でき、番号・チェック印・取り消し線・フォーカス表示が出る。
- [ ] 参考文献59件の番号・タイトル・URL・状態表示が常時見える。
- [ ] 検索で「CCIE Security」が見つかり、ページへ移動できる。

## 保守上の注意

ページ内の `E.*` はHTML要素の別名です。既存のMDX要素マッピングが元の表・点・番号を上書きすることを防いでいます。
本文はJSX文字列として保持し、設定例の波括弧や山括弧をMDXとして解釈させません。
CSSは `.ccie-guide.ccie-guide` の内部に限定しています。通常のMDXページには影響しません。
Mermaidとフォントはローカル依存で配信し、元HTMLのCDNスクリプトは実行しません。
自動テストは実ブラウザーのレイアウト・描画を保証するものではありません。

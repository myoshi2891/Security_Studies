# Security Studies — Progress Tracker

> **最終更新**: 2026-10-25（Hacking: The Art of Exploitation移行・原本アーカイブRed・新規4件すべて失敗。移動前のHTML/Markdown SHA-256を固定。本文専用79件＋既存ISO基盤5件成功（前記8件は集計記載誤りのため訂正）。全登録2192件/281ファイル。原本移動・遅延参照切替・原本なし隔離テストを次に実施）
> **ブランチ**: `dev` → `main` マージ済み (#34)
> **デプロイ**: Netlify 自動デプロイ（`main` push トリガー）

---

## カテゴリー別ステータス

### 🧪 テスト

| 指標 | 状態 | 詳細 |
|---|---|---|
| テストケース総数 | **2109成功 / 0 skip / 0失敗** | npm test実測（2026-10-25）・272ファイル・2109件（548,280 expect）。Ghost専用91件を含む。 |
| テストファイル数 | **272ファイル** | 原本比較・ページ移行・配色回帰を含む |
| File Unit Coverage | **108/108 (100%)** | 従来105 + Ghost部品3（GuideSidebar / GuideIcon / MermaidFigure）。純粋データ・MDXは分母外。全272テストファイルとは別集計 |
| Strategy Coverage | **17.5%** | 40カテゴリ×ドメインセル中 7セル相当 |
| CI | ✅ **稼働中** | Ghost原本なし隔離環境は55成功/36 skip/0失敗。 Threat Modeling (Shostack) 原本なし隔離環境は60成功/38 skip/0失敗。CyberOps Professional原本なし隔離環境は173成功/155 skip/0失敗。 CyberOps原本なし隔離環境は51成功/32 skip/0失敗。lint/types/coverage設定は維持。全体の原本なしCI再実行は今回未実施。移行前1052件時点の実測は576成功/476 skip/0失敗。CISSPは原本なし隔離環境で55成功/42skip/0失敗。ISO27001は原本なし隔離環境で59成功/41skip/0失敗。CSSLPは原本なし隔離環境で62成功/34skip/0失敗。ISC2 CCはGit管理外のarchiveへ移動。原本なし隔離環境で専用30成功/29skip/0失敗を確認。 |
| カバレッジレポート | ✅ **設定済み** | CIはlcov生成・Codecov送信を試行（continue-on-error）。`bunfig.toml` の `coveragePathIgnorePatterns` で原本依存テスト基盤 `fidelity-helpers.ts` を対象外（CIでは構造的に未実行のため）。archive/なしworktreeでISO3ガイドのMermaidFigure未カバー行0を確認 |

#### ファイル別テスト数（既存行は各移行時の記録。最新実測は上記の指標表およびCSSLP完了欄）

| ファイル | テスト数 | 備考 |
|---|---|---|
| `src/app/docs/ghost-in-the-wires-guide/archive.test.ts` | 4 | ✅ 2026-10-25 原文・固定構造・装飾・操作・アーカイブ検証 |
| `src/app/docs/ghost-in-the-wires-guide/foundation.test.tsx` | 11 | ✅ 2026-10-25 原文・固定構造・装飾・操作・アーカイブ検証 |
| `src/app/docs/ghost-in-the-wires-guide/chapters.test.tsx` | 34 | ✅ 2026-10-25 原文・固定構造・装飾・操作・アーカイブ検証 |
| `src/app/docs/ghost-in-the-wires-guide/integration.test.tsx` | 7 | ✅ 2026-10-25 原文・固定構造・装飾・操作・アーカイブ検証 |
| `src/app/docs/ghost-in-the-wires-guide/styles.test.tsx` | 13 | ✅ 2026-10-25 原文・固定構造・装飾・操作・アーカイブ検証 |
| `src/app/docs/ghost-in-the-wires-guide/hydration.test.tsx` | 4 | ✅ 2026-10-25 原文・固定構造・装飾・操作・アーカイブ検証 |
| `src/app/docs/ghost-in-the-wires-guide/sidebar.test.tsx` | 7 | ✅ 2026-10-25 原文・固定構造・装飾・操作・アーカイブ検証 |
| `src/app/docs/ghost-in-the-wires-guide/runtime.test.tsx` | 11 | ✅ 2026-10-25 原文・固定構造・装飾・操作・アーカイブ検証 |
| `src/app/docs/threat-modeling-shostack-guide/archive.test.ts` | 4 | ✅ 2026-10-25 段階4 原本HTML/MDのSHA-256一致・ルート除去・比較参照Green |
| `src/app/docs/threat-modeling-shostack-guide/rear.test.tsx` | 18 | ✅ 2026-10-25 段階3 第9章〜第17章（ch9〜ch17）構造SHA-256＋原本比較Green |
| `src/app/docs/threat-modeling-shostack-guide/interactions.test.tsx` | 2 | ✅ 2026-10-25 段階3 演習解答details開閉・バッジ番号・参考URL安全性Green |
| `src/app/docs/threat-modeling-shostack-guide/hydration.test.tsx` | 4 | ✅ 2026-10-25 段階3 全52表・ページ全体のHydration回帰Green |
| `src/app/docs/threat-modeling-shostack-guide/integration.test.tsx` | 8 | ✅ 2026-10-25 段階3 全要素数・81 ID・82見出し検索・2コードSHA・変異プローブGreen |
| `src/app/docs/threat-modeling-shostack-guide/styles.test.tsx` | 13 | ✅ 2026-10-25 段階3 5幅×明暗CSS比較・リスト点/番号・バッジ・空セル・図スクロールGreen |
| `src/app/docs/threat-modeling-shostack-guide/readability.test.tsx` | 7 | ✅ 2026-10-25 段階3 全944セルホバー（#0b1a2e）・インラインcode・Mermaid設定Green |
| `src/app/docs/threat-modeling-shostack-guide/front.test.tsx` | 16 | ✅ 2026-10-25 段階2 第1章〜第8章（ch1〜ch8）構造SHA-256＋原本比較Green |
| `src/app/docs/threat-modeling-shostack-guide/foundation.test.tsx` | 4 | ✅ 2026-10-25 段階1 表示基盤・CSS宣言・ナビ登録・9図定義Green |
| `src/app/docs/threat-modeling-shostack-guide/static.test.tsx` | 5 | ✅ 2026-10-25 段階1 固定構造SHA-256（.hero/.brand/.sidebar nav/.sidebar-foot/.footer）Green |
| `src/app/docs/threat-modeling-shostack-guide/sidebar.test.tsx` | 6 | ✅ 2026-10-25 段階1 モバイル目次・フォーカストラップ・hashchange・スクロールスパイGreen |
| `src/app/docs/threat-modeling-shostack-guide/runtime.test.tsx` | 11 | ✅ 2026-10-25 段階1 Mermaid描画・110px余白・再試行・テキスト説明・9図パースGreen |
| `src/app/docs/cyberops-professional-guide/archive.test.ts` | 4 | ✅ 2026-10-25 原文/固定構造/コード/操作/スタイル/アーカイブ検証 |
| `src/app/docs/cyberops-professional-guide/foundation.test.tsx` | 4 | ✅ 2026-10-25 原文/固定構造/コード/操作/スタイル/アーカイブ検証 |
| `src/app/docs/cyberops-professional-guide/front.test.tsx` | 156 | ✅ 2026-10-25 原文/固定構造/コード/操作/スタイル/アーカイブ検証 |
| `src/app/docs/cyberops-professional-guide/rear.test.tsx` | 112 | ✅ 2026-10-25 原文/固定構造/コード/操作/スタイル/アーカイブ検証 |
| `src/app/docs/cyberops-professional-guide/static.test.tsx` | 3 | ✅ 2026-10-25 原文/固定構造/コード/操作/スタイル/アーカイブ検証 |
| `src/app/docs/cyberops-professional-guide/runtime.test.tsx` | 11 | ✅ 2026-10-25 原文/固定構造/コード/操作/スタイル/アーカイブ検証 |
| `src/app/docs/cyberops-professional-guide/sidebar.test.tsx` | 6 | ✅ 2026-10-25 原文/固定構造/コード/操作/スタイル/アーカイブ検証（hashchange/フォーカス確認を含む） |
| `src/app/docs/cyberops-professional-guide/integration.test.tsx` | 8 | ✅ 2026-10-25 原文/固定構造/コード/操作/スタイル/アーカイブ検証 |
| `src/app/docs/cyberops-professional-guide/hydration.test.tsx` | 4 | ✅ 2026-10-25 原文/固定構造/コード/操作/スタイル/アーカイブ検証 |
| `src/app/docs/cyberops-professional-guide/quiz.test.tsx` | 3 | ✅ 2026-10-25 原文/固定構造/コード/操作/スタイル/アーカイブ検証 |
| `src/app/docs/cyberops-professional-guide/styles.test.tsx` | 12 | ✅ 2026-10-25 原文/固定構造/コード/操作/スタイル/アーカイブ検証 |
| `src/app/docs/cyberops-professional-guide/readability.test.tsx` | 7 | ✅ 2026-10-25 原文/固定構造/コード/操作/スタイル/アーカイブ検証 |
| `src/app/docs/cyberops-associate-guide/archive.test.ts` | 4 | ✅ 2026-10-24 移行/操作/スタイル/原本アーカイブ検証 |
| `src/app/docs/cyberops-associate-guide/foundation.test.tsx` | 4 | ✅ 2026-10-24 移行/操作/スタイル/原本アーカイブ検証 |
| `src/app/docs/cyberops-associate-guide/chapters.test.tsx` | 12 | ✅ 2026-10-24 移行/操作/スタイル/原本アーカイブ検証 |
| `src/app/docs/cyberops-associate-guide/hydration.test.tsx` | 4 | ✅ 2026-10-24 移行/操作/スタイル/原本アーカイブ検証 |
| `src/app/docs/cyberops-associate-guide/integration.test.tsx` | 6 | ✅ 2026-10-24 移行/操作/スタイル/原本アーカイブ検証 |
| `src/app/docs/cyberops-associate-guide/interactions.test.tsx` | 12 | ✅ 2026-10-25 移行/操作/スタイル/原本アーカイブ検証（モーダルフォーカス復帰等5件追加） |
| `src/app/docs/cyberops-associate-guide/runtime.test.tsx` | 11 | ✅ 2026-10-24 移行/操作/スタイル/原本アーカイブ検証 |
| `src/app/docs/cyberops-associate-guide/readability.test.tsx` | 7 | ✅ 2026-10-25 未解決importを除去・共通CSS読込ガード・375/1440px×明暗の全2706セル |
| `src/app/docs/cyberops-associate-guide/snapshot.test.tsx` | 16 | ✅ 2026-10-24 移行/操作/スタイル/原本アーカイブ検証 |
| `src/app/docs/cyberops-associate-guide/styles.test.tsx` | 12 | ✅ 2026-10-24 移行/操作/スタイル/原本アーカイブ検証 |
| `src/app/docs/csslp-guide/design.test.tsx` | 9 | ✅ 2026-10-24 10問40選択肢・16図・3幅・コントラスト・開閉を検証 |
| `src/app/docs/csslp-guide/archive.test.ts` | 4 | ✅ 2026-10-24 CSSLP移行・原本アーカイブ・ホバー回帰Green |
| `src/app/docs/csslp-guide/foundation.test.tsx` | 5 | ✅ 2026-10-24 CSSLP移行・原本アーカイブ・ホバー回帰Green |
| `src/app/docs/csslp-guide/hydration.test.tsx` | 4 | ✅ 2026-10-24 CSSLP移行・原本アーカイブ・ホバー回帰Green |
| `src/app/docs/csslp-guide/integration.test.tsx` | 6 | ✅ 2026-10-24 CSSLP移行・原本アーカイブ・ホバー回帰Green |
| `src/app/docs/csslp-guide/readability.test.tsx` | 4 | ✅ 2026-10-24 CSSLP移行・原本アーカイブ・ホバー回帰Green |
| `src/app/docs/csslp-guide/runtime.test.tsx` | 11 | ✅ 2026-10-24 CSSLP移行・原本アーカイブ・ホバー回帰Green |
| `src/app/docs/csslp-guide/sections-0-7.test.tsx` | 8 | ✅ 2026-10-24 CSSLP移行・原本アーカイブ・ホバー回帰Green |
| `src/app/docs/csslp-guide/sections-8-15.test.tsx` | 8 | ✅ 2026-10-24 CSSLP移行・原本アーカイブ・ホバー回帰Green |
| `src/app/docs/csslp-guide/sidebar.test.tsx` | 6 | ✅ 2026-10-24 CSSLP移行・原本アーカイブ・ホバー回帰Green |
| `src/app/docs/csslp-guide/snapshot.test.tsx` | 19 | ✅ 2026-10-24 CSSLP移行・原本アーカイブ・ホバー回帰Green |
| `src/app/docs/csslp-guide/styles.test.tsx` | 12 | ✅ 2026-10-24 CSSLP移行・原本アーカイブ・ホバー回帰Green |
| `src/app/docs/iso-iec-27001-2022-guide/archive.test.ts` | 5 | ✅ 2026-10-24 HTML画面更新・原本アーカイブ後Green |
| `src/app/docs/iso-iec-27001-2022-guide/foundation.test.tsx` | 5 | ✅ 2026-10-24 HTML画面更新・原本アーカイブ後Green |
| `src/app/docs/iso-iec-27001-2022-guide/hydration.test.tsx` | 4 | ✅ 2026-10-24 HTML画面更新・原本アーカイブ後Green |
| `src/app/docs/iso-iec-27001-2022-guide/integration.test.tsx` | 5 | ✅ 2026-10-24 HTML画面更新・原本アーカイブ後Green |
| `src/app/docs/iso-iec-27001-2022-guide/interactions.test.tsx` | 2 | ✅ 2026-10-24 HTML画面更新・原本アーカイブ後Green |
| `src/app/docs/iso-iec-27001-2022-guide/page.test.ts` | 6 | ✅ 2026-10-24 HTML画面更新・原本アーカイブ後Green |
| `src/app/docs/iso-iec-27001-2022-guide/runtime.test.tsx` | 11 | ✅ 2026-10-24 HTML画面更新・原本アーカイブ後Green |
| `src/app/docs/iso-iec-27001-2022-guide/sections-0-5.test.tsx` | 6 | ✅ 2026-10-24 HTML画面更新・原本アーカイブ後Green |
| `src/app/docs/iso-iec-27001-2022-guide/sections-6-16.test.tsx` | 11 | ✅ 2026-10-24 HTML画面更新・原本アーカイブ後Green |
| `src/app/docs/iso-iec-27001-2022-guide/sidebar.test.tsx` | 6 | ✅ 2026-10-24 HTML画面更新・原本アーカイブ後Green |
| `src/app/docs/iso-iec-27001-2022-guide/snapshot.test.tsx` | 22 | ✅ 2026-10-24 HTML画面更新・原本アーカイブ後Green |
| `src/app/docs/iso-iec-27001-2022-guide/styles.test.tsx` | 17 | ✅ 2026-10-24 HTML画面更新・原本アーカイブ後Green |
| `src/app/docs/cissp-guide/archive.test.ts` | 4 | ✅ 2026-10-24追加・原本アーカイブ後Green |
| `src/app/docs/cissp-guide/foundation.test.tsx` | 6 | ✅ 2026-10-24追加・原本アーカイブ後Green |
| `src/app/docs/cissp-guide/hydration.test.tsx` | 4 | ✅ 2026-10-24追加・原本アーカイブ後Green |
| `src/app/docs/cissp-guide/integration.test.tsx` | 5 | ✅ 2026-10-24追加・原本アーカイブ後Green |
| `src/app/docs/cissp-guide/interactions.test.tsx` | 3 | ✅ 2026-10-24追加・原本アーカイブ後Green |
| `src/app/docs/cissp-guide/runtime.test.tsx` | 11 | ✅ 2026-10-24追加・原本アーカイブ後Green |
| `src/app/docs/cissp-guide/sections-0-8.test.tsx` | 9 | ✅ 2026-10-24追加・原本アーカイブ後Green |
| `src/app/docs/cissp-guide/sections-9-appendix.test.tsx` | 9 | ✅ 2026-10-24追加・原本アーカイブ後Green |
| `src/app/docs/cissp-guide/sidebar.test.tsx` | 6 | ✅ 2026-10-24追加・原本アーカイブ後Green |
| `src/app/docs/cissp-guide/snapshot.test.tsx` | 22 | ✅ 2026-10-24追加・原本アーカイブ後Green |
| `src/app/docs/cissp-guide/styles.test.tsx` | 18 | ✅ 2026-10-24追加・原本アーカイブ後Green |
| `src/app/docs/cc-certified-in-cybersecurity-guide/readability.test.tsx` | 23 | ✅ 2026-10-24最終検証・実ホバー相当/明暗/全セル/他ガイド/変異検証 |
| `src/app/docs/ccsp-study-guide/archive.test.ts` | 4 | ✅ 2026-10-23追加・Green |
| `src/app/docs/ccsp-study-guide/foundation.test.tsx` | 6 | ✅ 2026-10-23追加・Green |
| `src/app/docs/ccsp-study-guide/hydration.test.tsx` | 4 | ✅ 2026-10-23追加・Green |
| `src/app/docs/ccsp-study-guide/integration.test.tsx` | 5 | ✅ 2026-10-23追加・Green |
| `src/app/docs/ccsp-study-guide/interactions.test.tsx` | 3 | ✅ 2026-10-23追加・Green |
| `src/app/docs/ccsp-study-guide/runtime.test.tsx` | 11 | ✅ 2026-10-23追加・Green |
| `src/app/docs/ccsp-study-guide/sections-0-6.test.tsx` | 7 | ✅ 2026-10-23追加・Green |
| `src/app/docs/ccsp-study-guide/sections-7-sources.test.tsx` | 5 | ✅ 2026-10-23追加・Green |
| `src/app/docs/ccsp-study-guide/sidebar.test.tsx` | 6 | ✅ 2026-10-23追加・Green |
| `src/app/docs/ccsp-study-guide/styles.test.tsx` | 18 | ✅ 2026-10-23追加・Green |
| `src/app/docs/cc-certified-in-cybersecurity-guide/archive.test.ts` | 4 | ✅ 2026-10-23追加・ルート残存/比較パス/HTML・MDハッシュGreen |
| `src/app/docs/cc-certified-in-cybersecurity-guide/migration.test.tsx` | 20 | ✅ 2026-10-23追加・Green |
| `src/app/docs/cc-certified-in-cybersecurity-guide/cascade.test.tsx` | 13 | ✅ 2026-10-23追加・Green |
| `src/app/docs/cc-certified-in-cybersecurity-guide/sidebar.test.tsx` | 6 | ✅ 2026-10-23追加・Green |
| `src/app/docs/cc-certified-in-cybersecurity-guide/runtime.test.tsx` | 12 | ✅ 2026-10-23追加・Green |
| `src/app/docs/cc-certified-in-cybersecurity-guide/hydration.test.tsx` | 4 | ✅ 2026-10-23追加・Green |
| `src/lib/archive-categories.test.ts` | 13 | 2026-10-23追加・10ハッシュ/旧フォルダー/参照先整合Green |
| `src/app/docs/secrets-and-lies-guide/foundation.test.tsx` | 4 | 2026-10-23追加・Green |
| `src/app/docs/secrets-and-lies-guide/sections-0-4.test.tsx` | 5 | 2026-10-23追加・Green |
| `src/app/docs/secrets-and-lies-guide/sections-5-sources.test.tsx` | 6 | 2026-10-23追加・Green |
| `src/app/docs/secrets-and-lies-guide/GuideIcon.test.tsx` | 1 | 2026-10-23追加・Green |
| `src/app/docs/secrets-and-lies-guide/cascade.test.tsx` | 9 | 2026-10-23追加・Green |
| `src/app/docs/secrets-and-lies-guide/sidebar.test.tsx` | 5 | 2026-10-23追加・Green |
| `src/app/docs/secrets-and-lies-guide/runtime.test.tsx` | 10 | 2026-10-23追加・Green |
| `src/app/docs/secrets-and-lies-guide/interactions.test.tsx` | 1 | 2026-10-23追加・Green |
| `src/app/docs/secrets-and-lies-guide/hydration.test.tsx` | 4 | 2026-10-23追加・Green |
| `src/app/docs/secrets-and-lies-guide/integration.test.tsx` | 6 | 2026-10-23追加・Green |
| `src/app/docs/secrets-and-lies-guide/archive.test.ts` | 4 | 2026-10-23追加・Green |
| `src/app/docs/zero-trust-networks-2nd-edition-guide/presentation.test.tsx` | 2 | 2026-10-23追加・Green |
| `src/app/docs/zero-trust-networks-2nd-edition-guide/GuideIcon.test.tsx` | 1 | 2026-10-23追加・Green |
| `src/app/docs/zero-trust-networks-2nd-edition-guide/foundation.test.tsx` | 3 | 2026-10-23追加・Green |
| `src/app/docs/zero-trust-networks-2nd-edition-guide/sections-intro-ch6.test.tsx` | 11 | 2026-10-23追加・Green |
| `src/app/docs/zero-trust-networks-2nd-edition-guide/sections-ch7-sources.test.tsx` | 14 | 2026-10-23追加・Green |
| `src/app/docs/zero-trust-networks-2nd-edition-guide/cascade.test.tsx` | 8 | 2026-10-23追加・Green |
| `src/app/docs/zero-trust-networks-2nd-edition-guide/sidebar.test.tsx` | 5 | 2026-10-23追加・Green |
| `src/app/docs/zero-trust-networks-2nd-edition-guide/runtime.test.tsx` | 11 | 2026-10-23追加・Green |
| `src/app/docs/zero-trust-networks-2nd-edition-guide/interactions.test.tsx` | 1 | 2026-10-23追加・Green |
| `src/app/docs/zero-trust-networks-2nd-edition-guide/hydration.test.tsx` | 4 | 2026-10-23追加・Green |
| `src/app/docs/zero-trust-networks-2nd-edition-guide/integration.test.tsx` | 4 | 2026-10-23追加・Green |
| `src/app/docs/zero-trust-networks-2nd-edition-guide/archive.test.ts` | 4 | 2026-10-23追加・Green |
| `src/app/docs/bulletproof-tls-pki-guide/archive.test.ts` | 4 | 2026-10-23追加・カテゴリー別アーカイブGreen |
| `src/app/docs/bulletproof-tls-pki-guide/migration.test.tsx` | 19 | 2026-10-23追加・Green |
| `src/app/docs/bulletproof-tls-pki-guide/sidebar.test.tsx` | 5 | 2026-10-23追加・Green |
| `src/app/docs/bulletproof-tls-pki-guide/runtime.test.tsx` | 9 | 2026-10-23追加・Green |
| `src/app/docs/bulletproof-tls-pki-guide/cascade.test.tsx` | 2 | 2026-10-23追加・Green |
| `src/app/docs/bulletproof-tls-pki-guide/interactions.test.tsx` | 2 | 2026-10-23追加・Green |
| `src/app/docs/bulletproof-tls-pki-guide/hydration.test.tsx` | 4 | 2026-10-23追加・Green |
| `src/app/docs/iso-iec-18045-2026-guide/foundation.test.tsx` | 4 | 2026-10-22追加・原本比較/装飾/図/操作/統合/アーカイブGreen |
| `src/app/docs/iso-iec-18045-2026-guide/sidebar.test.tsx` | 5 | 2026-10-22追加・原本比較/装飾/図/操作/統合/アーカイブGreen |
| `src/app/docs/iso-iec-18045-2026-guide/runtime.test.tsx` | 9 | 2026-10-22追加・原本比較/装飾/図/操作/統合/アーカイブGreen |
| `src/app/docs/iso-iec-18045-2026-guide/sections-00-06.test.tsx` | 7 | 2026-10-22追加・原本比較/装飾/図/操作/統合/アーカイブGreen |
| `src/app/docs/iso-iec-18045-2026-guide/sections-07-13.test.tsx` | 7 | 2026-10-22追加・原本比較/装飾/図/操作/統合/アーカイブGreen |
| `src/app/docs/iso-iec-18045-2026-guide/sections-14-20.test.tsx` | 7 | 2026-10-22追加・原本比較/装飾/図/操作/統合/アーカイブGreen |
| `src/app/docs/iso-iec-18045-2026-guide/integration.test.tsx` | 8 | 2026-10-22追加・原本比較/装飾/図/操作/統合/アーカイブGreen |
| `src/app/docs/iso-iec-18045-2026-guide/hydration.test.tsx` | 4 | 2026-10-22追加・原本比較/装飾/図/操作/統合/アーカイブGreen |
| `src/app/docs/iso-iec-18045-2026-guide/style-isolation.test.tsx` | 1 | 2026-10-22追加・原本比較/装飾/図/操作/統合/アーカイブGreen |
| `src/app/docs/iso-iec-18045-2026-guide/archive.test.ts` | 4 | 2026-10-22追加・原本比較/装飾/図/操作/統合/アーカイブGreen |
| `src/app/docs/iso-iec-27017-2026-guide/foundation.test.tsx` | 4 | 2026-10-22追加・原本比較/装飾/操作/統合/アーカイブGreen |
| `src/app/docs/iso-iec-27017-2026-guide/sidebar.test.tsx` | 5 | 2026-10-22追加・原本比較/装飾/操作/統合/アーカイブGreen |
| `src/app/docs/iso-iec-27017-2026-guide/runtime.test.tsx` | 8 | 2026-10-22追加・原本比較/装飾/操作/統合/アーカイブGreen |
| `src/app/docs/iso-iec-27017-2026-guide/sections-00-05.test.tsx` | 6 | 2026-10-22追加・原本比較/装飾/操作/統合/アーカイブGreen |
| `src/app/docs/iso-iec-27017-2026-guide/sections-06-11.test.tsx` | 6 | 2026-10-22追加・原本比較/装飾/操作/統合/アーカイブGreen |
| `src/app/docs/iso-iec-27017-2026-guide/GuideCode.test.tsx` | 2 | 2026-10-22追加・原本比較/装飾/操作/統合/アーカイブGreen |
| `src/app/docs/iso-iec-27017-2026-guide/sections-12-16.test.tsx` | 5 | 2026-10-22追加・原本比較/装飾/操作/統合/アーカイブGreen |
| `src/app/docs/iso-iec-27017-2026-guide/interactions.test.tsx` | 2 | 2026-10-22追加・原本比較/装飾/操作/統合/アーカイブGreen |
| `src/app/docs/iso-iec-27017-2026-guide/integration.test.tsx` | 8 | 2026-10-22追加・原本比較/装飾/操作/統合/アーカイブGreen |
| `src/app/docs/iso-iec-27017-2026-guide/hydration.test.tsx` | 4 | 2026-10-22追加・原本比較/装飾/操作/統合/アーカイブGreen |
| `src/app/docs/iso-iec-27017-2026-guide/style-isolation.test.tsx` | 1 | 2026-10-22追加・原本比較/装飾/操作/統合/アーカイブGreen |
| `src/app/docs/iso-iec-27017-2026-guide/archive.test.ts` | 4 | 2026-10-22追加・原本比較/装飾/操作/統合/アーカイブGreen |
| `src/app/docs/iso-iec-15408-1-2026-guide/archive.test.ts` | 4 | 2026-10-22追加・原本ハッシュ一致/ルート除去/比較参照を検証・Green |
| `src/app/docs/iso-iec-15408-1-2026-guide/foundation.test.tsx` | 4 | 2026-10-22追加・Green |
| `src/app/docs/iso-iec-15408-1-2026-guide/sidebar.test.tsx` | 5 | 2026-10-22追加・Green |
| `src/app/docs/iso-iec-15408-1-2026-guide/runtime.test.tsx` | 8 | 2026-10-22追加・Green |
| `src/app/docs/iso-iec-15408-1-2026-guide/sections-00-06.test.tsx` | 7 | 2026-10-22追加・Green |
| `src/app/docs/iso-iec-15408-1-2026-guide/sections-07-13.test.tsx` | 7 | 2026-10-22追加・Green |
| `src/app/docs/iso-iec-15408-1-2026-guide/sections-14-20.test.tsx` | 7 | 2026-10-22追加・Green |
| `src/app/docs/iso-iec-15408-1-2026-guide/hydration.test.tsx` | 4 | 2026-10-22追加・Green |
| `src/app/docs/iso-iec-15408-1-2026-guide/integration.test.tsx` | 8 | 2026-10-22追加・Green |
| `src/app/docs/iso-iec-15408-1-2026-guide/style-isolation.test.tsx` | 1 | 2026-10-22追加・Green |
| `src/app/docs/threat-modeling-guide/archive.test.ts` | 5 | 2026-10-18 追加・原本比較/装飾/操作/統合/アーカイブGreen |
| `src/app/docs/threat-modeling-guide/integration.test.tsx` | 9 | 2026-10-18 追加・原本比較/装飾/操作/統合/アーカイブGreen |
| `src/app/docs/threat-modeling-guide/sidebar.test.tsx` | 5 | 2026-10-18 追加・原本比較/装飾/操作/統合/アーカイブGreen |
| `src/app/docs/threat-modeling-guide/interactions.test.tsx` | 2 | 2026-10-18 追加・原本比較/装飾/操作/統合/アーカイブGreen |
| `src/app/docs/threat-modeling-guide/runtime.test.tsx` | 10 | 2026-10-18 追加・原本比較/装飾/操作/統合/アーカイブGreen。レビュー対応でスタジアム形/円柱形ノードのラベル抽出1件追加 |
| `src/app/docs/threat-modeling-guide/hydration.test.tsx` | 4 | 2026-10-18 追加・原本比較/装飾/操作/統合/アーカイブGreen |
| `src/app/docs/threat-modeling-guide/cascade.test.tsx` | 7 | 2026-10-18 追加・原本比較/装飾/操作/統合/アーカイブGreen |
| `src/app/docs/threat-modeling-guide/chapters-16-18.test.tsx` | 3 | 2026-10-18 追加・原本比較/装飾/操作/統合/アーカイブGreen |
| `src/app/docs/threat-modeling-guide/chapters-13-15.test.tsx` | 3 | 2026-10-18 追加・原本比較/装飾/操作/統合/アーカイブGreen |
| `src/app/docs/threat-modeling-guide/chapters-9-12.test.tsx` | 4 | 2026-10-18 追加・原本比較/装飾/操作/統合/アーカイブGreen |
| `src/app/docs/threat-modeling-guide/chapters-5-8.test.tsx` | 4 | 2026-10-18 追加・原本比較/装飾/操作/統合/アーカイブGreen |
| `src/app/docs/threat-modeling-guide/chapters-1-4.test.tsx` | 4 | 2026-10-18 追加・原本比較/装飾/操作/統合/アーカイブGreen |
| `src/app/docs/threat-modeling-guide/foundation.test.tsx` | 2 | 2026-10-18 追加・原本比較/装飾/操作/統合/アーカイブGreen |
| `src/app/docs/applied-cryptography-guide/archive.test.ts` | 5 | 2026-10-18 追加・原本バイト一致/ルート原本除去/台帳/比較参照のGreen |
| `src/app/docs/applied-cryptography-guide/cascade.test.tsx` | 4 | 2026-10-18 追加・原本との完全比較/スタイル/操作/統合検証Green |
| `src/app/docs/applied-cryptography-guide/foundation.test.tsx` | 2 | 2026-10-18 追加・原本との完全比較/スタイル/操作/統合検証Green |
| `src/app/docs/applied-cryptography-guide/hydration.test.tsx` | 4 | 2026-10-18 追加・原本との完全比較/スタイル/操作/統合検証Green |
| `src/app/docs/applied-cryptography-guide/integration.test.tsx` | 9 | 2026-10-18 追加・原本との完全比較/スタイル/操作/統合検証Green |
| `src/app/docs/applied-cryptography-guide/runtime.test.tsx` | 9 | 2026-10-18 追加・原本との完全比較/スタイル/操作/統合検証Green。レビュー対応で図9の引用符なし点線ラベル1件追加 |
| `src/app/docs/applied-cryptography-guide/sections-1-4.test.tsx` | 4 | 2026-10-18 追加・原本との完全比較/スタイル/操作/統合検証Green |
| `src/app/docs/applied-cryptography-guide/sections-13-16.test.tsx` | 4 | 2026-10-18 追加・原本との完全比較/スタイル/操作/統合検証Green |
| `src/app/docs/applied-cryptography-guide/sections-5-8.test.tsx` | 4 | 2026-10-18 追加・原本との完全比較/スタイル/操作/統合検証Green |
| `src/app/docs/applied-cryptography-guide/sections-9-12.test.tsx` | 4 | 2026-10-18 追加・原本との完全比較/スタイル/操作/統合検証Green |
| `src/app/docs/applied-cryptography-guide/sidebar.test.tsx` | 5 | 2026-10-18 追加・原本との完全比較/スタイル/操作/統合検証Green |
| `src/app/docs/applied-cryptography-guide/style-isolation.test.tsx` | 7 | 2026-10-18 追加・原本との完全比較/スタイル/操作/統合検証Green |
| `src/components/docs/DocsHeaderNav.test.tsx` | 9 | 2026-10-16 実測・ホーム/docs共通ガイド一覧・絞り込み・97ページ拡張・狭幅表示・可視ラベル由来のアクセシブルネームGreen |
| `src/app/docs/web-application-hackers-handbook/archive.test.ts` | 5 | 2026-10-15 更新・移行・共通ナビGreen・ホームとdocsのガイド一覧/絞り込み・移行完了時点の全538件成功・lint/型検査成功 |
| `src/app/page.test.tsx` | 3 | 2026-10-15 追加・ホーム一覧・統計・共通ヘッダー/登録件数追従Green |
| `src/app/docs/web-application-hackers-handbook/contrast.test.tsx` | 5 | 2026-10-15 更新・移行・共通ナビGreen・ホームとdocsのガイド一覧/絞り込み・移行完了時点の全538件成功・lint/型検査成功 |
| `src/app/docs/web-application-hackers-handbook/hydration.test.tsx` | 4 | 2026-10-15 更新・移行・共通ナビGreen・ホームとdocsのガイド一覧/絞り込み・移行完了時点の全538件成功・lint/型検査成功 |
| `src/app/docs/web-application-hackers-handbook/cascade.test.tsx` | 7 | 2026-10-15 更新・移行・共通ナビGreen・ホームとdocsのガイド一覧/絞り込み・移行完了時点の全538件成功・lint/型検査成功 |
| `src/app/docs/web-application-hackers-handbook/integration.test.tsx` | 11 | 2026-10-15 更新・移行・共通ナビGreen・ホームとdocsのガイド一覧/絞り込み・移行完了時点の全538件成功・lint/型検査成功 |
| `src/app/docs/web-application-hackers-handbook/sections-06-appendix.test.tsx` | 8 | 2026-10-15 更新・移行・共通ナビGreen・ホームとdocsのガイド一覧/絞り込み・移行完了時点の全538件成功・lint/型検査成功 |
| `src/app/docs/web-application-hackers-handbook/steps-12-13.test.tsx` | 4 | 2026-10-15 更新・移行・共通ナビGreen・ホームとdocsのガイド一覧/絞り込み・移行完了時点の全538件成功・lint/型検査成功 |
| `src/app/docs/web-application-hackers-handbook/steps-09-11.test.tsx` | 3 | 2026-10-15 更新・移行・共通ナビGreen・ホームとdocsのガイド一覧/絞り込み・移行完了時点の全538件成功・lint/型検査成功 |
| `src/app/docs/web-application-hackers-handbook/steps-05-08.test.tsx` | 4 | 2026-10-15 更新・移行・共通ナビGreen・ホームとdocsのガイド一覧/絞り込み・移行完了時点の全538件成功・lint/型検査成功 |
| `src/app/docs/web-application-hackers-handbook/steps-01-04.test.tsx` | 4 | 2026-10-15 更新・移行・共通ナビGreen・ホームとdocsのガイド一覧/絞り込み・移行完了時点の全538件成功・lint/型検査成功 |
| `src/app/docs/web-application-hackers-handbook/sections-00-04.test.tsx` | 5 | 2026-10-15 更新・移行・共通ナビGreen・ホームとdocsのガイド一覧/絞り込み・移行完了時点の全538件成功・lint/型検査成功 |
| `src/app/docs/web-application-hackers-handbook/sidebar.test.tsx` | 5 | 2026-10-15 更新・Codecov未カバー行/再試行テスト追加・全543件成功（2026-10-17実測で+1） |
| `src/app/docs/web-application-hackers-handbook/runtime.test.tsx` | 8 | 2026-10-15 更新・Mermaid baseテーマの検証を追加・全543件成功（2026-10-17実測で+1） |
| `src/app/docs/web-application-hackers-handbook/foundation.test.tsx` | 7 | 2026-10-15 更新・移行・共通ナビGreen・ホームとdocsのガイド一覧/絞り込み・移行完了時点の全538件成功・lint/型検査成功 |
| `src/app/docs/hacking-kubernetes/archive.test.ts` | 5 | 2026-10-15 更新・原本アーカイブGreen・全452件成功・lint/型検査成功 |
| `src/app/docs/hacking-kubernetes/contrast.test.tsx` | 3 | 2026-10-15 更新・原本アーカイブGreen・全452件成功・lint/型検査成功 |
| `src/app/docs/hacking-kubernetes/hydration.test.tsx` | 4 | 2026-10-15 更新・原本アーカイブGreen・全452件成功・lint/型検査成功 |
| `src/app/docs/hacking-kubernetes/integration.test.tsx` | 10 | 2026-10-15 更新・原本アーカイブGreen・全452件成功・lint/型検査成功 |
| `src/app/docs/hacking-kubernetes/sections-16-17.test.tsx` | 2 | 2026-10-15 更新・原本アーカイブGreen・全452件成功・lint/型検査成功 |
| `src/app/docs/hacking-kubernetes/sections-12-15.test.tsx` | 4 | 2026-10-15 更新・原本アーカイブGreen・全452件成功・lint/型検査成功 |
| `src/app/docs/hacking-kubernetes/sections-08-11.test.tsx` | 4 | 2026-10-15 更新・原本アーカイブGreen・全452件成功・lint/型検査成功 |
| `src/app/docs/hacking-kubernetes/sections-04-07.test.tsx` | 4 | 2026-10-15 更新・原本アーカイブGreen・全452件成功・lint/型検査成功 |
| `src/app/docs/hacking-kubernetes/sections-00-03.test.tsx` | 4 | 2026-10-15 更新・原本アーカイブGreen・全452件成功・lint/型検査成功 |
| `src/app/docs/hacking-kubernetes/interaction.test.tsx` | 11 | 2026-10-15 更新・Codecov未カバー行/再試行テスト追加・全543件成功（2026-10-17実測で+1） |
| `src/app/docs/hacking-kubernetes/foundation.test.tsx` | 7 | 2026-10-15 更新・原本アーカイブGreen・全452件成功・lint/型検査成功 |
| `src/components/docs/Callout.test.tsx` | 4 | 4 pass / 0 fail |
| `src/components/docs/DocsSubheading.test.tsx` | 4 | 4 pass / 0 fail |
| `src/components/docs/SectionCard.test.tsx` | 3 | 3 pass / 0 fail |
| `src/components/docs/AttackFlow.test.tsx` | 2 | 2 pass / 0 fail |
| `src/components/docs/DefenseList.test.tsx` | 2 | 2 pass / 0 fail |
| `src/components/docs/RiskBadge.test.tsx` | 2 | 2 pass / 0 fail |
| `src/components/docs/Terminal.test.tsx` | 2 | 2 pass / 0 fail |
| `src/components/docs/Checklist.test.tsx` | 5 | 5 pass / 0 fail |
| `src/components/docs/CompareGrid.test.tsx` | 4 | 4 pass / 0 fail |
| `src/components/docs/DataTable.test.tsx` | 4 | 4 pass / 0 fail |
| `src/components/docs/HeroSection.test.tsx` | 3 | 3 pass / 0 fail |
| `src/components/docs/HighlightBox.test.tsx` | 7 | 7 pass / 0 fail |
| `src/components/docs/SourceReferences.test.tsx` | 4 | 4 pass / 0 fail |
| `src/components/docs/StepTimeline.test.tsx` | 4 | 4 pass / 0 fail |
| `src/components/docs/Tag.test.tsx` | 7 | 7 pass / 0 fail |
| `src/components/docs/ThreatCard.test.tsx` | 7 | 7 pass / 0 fail |
| `src/components/disclaimer-modal.test.tsx` | 9 | 9 pass / 0 fail |
| `src/components/search-modal.test.tsx` | 18 | 18 pass / 0 fail |
| `src/lib/search.test.ts` | 23 | 23 pass / 0 fail |
| `src/app/api/search/route.test.ts` | 3 | 3 pass / 0 fail |
| `src/app/docs/layout.test.tsx` | 12 | 12 pass / 0 fail |
| `src/proxy.test.ts` | 6 | 6 pass / 0 fail |
| `src/app/docs/ccie-security/foundation.test.tsx` | 16 | 16 pass / 0 fail |
| `src/app/docs/ccie-security/chapters-01-04.test.tsx` | 6 | 6 pass / 0 fail |
| `src/app/docs/ccie-security/chapters-05-07.test.tsx` | 4 | 4 pass / 0 fail |
| `src/app/docs/ccie-security/chapters-08-09.test.tsx` | 2 | 2 pass / 0 fail |
| `src/app/docs/ccie-security/chapters-10-13.test.tsx` | 7 | 7 pass / 0 fail |
| `src/app/docs/ccie-security/integration.test.tsx` | 9 | 9 pass / 0 fail |
| `src/app/docs/ccie-security/hydration.test.tsx` | 3 | 3 pass / 0 fail |
| `src/app/docs/ccie-security/GuideSidebar.test.tsx` | 10 | 10 pass / 0 fail |
| `src/app/docs/secure-by-design/foundation.test.tsx` | 12 | 12 pass / 0 fail |
| `src/app/docs/secure-by-design/sections-00-04.test.tsx` | 6 | 6 pass / 0 fail |
| `src/app/docs/secure-by-design/sections-05-09.test.tsx` | 5 | 5 pass / 0 fail |
| `src/app/docs/secure-by-design/sections-10-16.test.tsx` | 8 | 8 pass / 0 fail |
| `src/app/docs/secure-by-design/integration.test.tsx` | 12 | 12 pass / 0 fail |
| `src/app/docs/secure-by-design/hydration.test.tsx` | 3 | 3 pass / 0 fail |
| `src/app/docs/mitre-atlas/foundation.test.tsx` | 12 | 12 pass / 0 fail |
| `src/app/docs/mitre-atlas/sections-01-04.test.tsx` | 5 | 5 pass / 0 fail |
| `src/app/docs/mitre-atlas/sections-05-08.test.tsx` | 4 | 4 pass / 0 fail |
| `src/app/docs/mitre-atlas/sections-09-13.test.tsx` | 7 | 7 pass / 0 fail |
| `src/app/docs/mitre-atlas/integration.test.tsx` | 11 | 11 pass / 0 fail |
| `src/app/docs/mitre-atlas/hydration.test.tsx` | 3 | 3 pass / 0 fail |
| `src/app/docs/secure-by-design/sidebar-a11y.test.tsx` | 2 | 2 pass / 0 fail |
| `src/app/docs/mitre-atlas/sidebar-a11y.test.tsx` | 1 | 1 pass / 0 fail |
| `src/app/docs/ccie-security/archive.test.ts` | 5 | 5 pass / 0 fail |
| `src/app/docs/ccie-security/table-cascade.test.tsx` | 5 | 5 pass / 0 fail |
| `src/app/docs/ccst-cybersecurity/foundation.test.tsx` | 7 | 7 pass / 0 fail |
| `src/app/docs/ccst-cybersecurity/sections-00-03.test.tsx` | 4 | 4 pass / 0 fail |
| `src/app/docs/ccst-cybersecurity/MermaidFigure.test.tsx` | 9 | 9 pass / 0 fail |
| `src/app/docs/ccst-cybersecurity/chapters-01-02.test.tsx` | 11 | 11 pass / 0 fail |
| `src/app/docs/ccst-cybersecurity/chapter-03.test.tsx` | 7 | 7 pass / 0 fail |
| `src/app/docs/ccst-cybersecurity/chapters-04-05.test.tsx` | 10 | 10 pass / 0 fail |
| `src/app/docs/ccst-cybersecurity/chapter-06-references.test.tsx` | 17 | 17 pass / 0 fail |
| `src/app/docs/ccst-cybersecurity/hydration.test.tsx` | 3 | 3 pass / 0 fail |
| `src/app/docs/ccst-cybersecurity/integration.test.tsx` | 8 | 8 pass / 0 fail |
| `src/app/docs/ccst-cybersecurity/style-cascade.test.tsx` | 15 | 15 pass / 0 fail |
| `src/app/docs/ccst-cybersecurity/GuideSidebar.test.tsx` | 8 | 8 pass / 0 fail |
| `src/app/docs/ccst-cybersecurity/archive.test.ts` | 5 | 5 pass / 0 fail |
| `src/app/docs/hacking-kubernetes/GuideCode.test.tsx` | 3 | 2026-10-17 実測で追記・GuideCodeフォールバック |
| `src/app/docs/web-application-hackers-handbook/GuideCode.test.tsx` | 3 | 2026-10-17 実測で追記・GuideCodeフォールバック |
| `src/app/docs/iso-iec-27000-2026-guide/page.test.ts` | 5 | 2026-10-17 追加・ISO/IEC 27000:2026ページ登録・検索契約（Red `7795079` → Green `c8ae34d`） |

---

### 🔐 セキュリティ / CSP

| 項目 | 状態 | 詳細 |
|---|---|---|
| CSP 基本構成 | ✅ **完了** | `proxy.ts` で静的 CSP 付与 |
| nonce 問題（Issue #32） | ✅ **解消** | `'unsafe-inline'` ベースへ移行 |
| Netlify CDP スクリプト | ✅ **解消** | nonce 廃止により衝突なし |
| API セキュリティヘッダー | ❌ **未検証** | `GET /api/search` の CSP 応用未テスト |
| 入力サニタイズ | ❌ **未テスト** | SearchModal XSS 耐性テストなし |
| 依存関係監査 | ✅ **稼働中** | `bun audit --audit-level=high` を独立 job として CI 実行。加えて `bun audit --prod --audit-level=high`（除外指定なし）で本番依存を監査 |
| next RCE（GHSA-vcvr-r3jv-pc5j） | ✅ **解消** | 2026-10-05: `next` / `eslint-config-next` を 16.3.5 → 16.3.8 へ更新 |
| next RCE/DoS（GHSA-2464-fhr4-w9xw・GHSA-673q-mjm6-r5xr・GHSA-p3m5-59mp-jv5r） | ✅ **解消** | 2026-10-23: `next` / `@next/mdx` / `eslint-config-next` を 16.4.2 へ更新（`62a4951`）。同梱の `eslint-plugin-react-hooks` 7.1.1 の新ルールに合わせ `Checklist` の effect 内 setState を描画中の同期へ変更（`5c85320`） |
| dompurify（GHSA-cg2g-xh64-v4q7・GHSA-mrv2-3pqr-j5jr） | ✅ **解消** | 2026-10-23: mermaid 経由の推移依存を overrides で 3.4.17 に固定（mermaid の `^3.2.5` 範囲内） |
| toml DoS（GHSA-4qx8-w7c3-pj3p・GHSA-9j65-hcg3-gc64・GHSA-9qmh-m7c6-f92p） | ✅ **解消** | 2026-10-23: remark-mdx-frontmatter 経由。overrides の固定値を 4.3.0 → 5.0.1 へ更新し、`parse` の名前付き import が動作することを確認 |
| braces DoS（GHSA-vfj7-8cjw-p6xm） | ⚠️ **一時除外** | パッチ未提供（<=3.0.3 全版が対象）。`eslint-config-next` 経由の dev 依存のみで、本番バンドル・ユーザー入力経路に含まれない。CI で `--ignore` 指定、**期限 2026-11-05** までに修正版の有無を再確認 |

#### CSP 現行構成（2026-05-20）

```
default-src 'self'
script-src  'self' 'unsafe-inline'              # prod
            'self' 'unsafe-inline' 'unsafe-eval' # dev のみ
style-src   'self' 'unsafe-inline'
img-src     'self' data:
font-src    'self'
connect-src 'self'                               # prod
            'self' ws://localhost:* ws://127.0.0.1:* # dev のみ
frame-ancestors 'none'
base-uri    'self'
form-action 'self'
```

> **トレードオフ**: `'unsafe-inline'` により inline script XSS 防御は後退。
> `default-src 'self'` で第三者ドメインからの script ロードは遮断済み。
> 将来 `@netlify/plugin-nextjs` が CSP nonce API を公開した場合、nonce + `'strict-dynamic'` 理想形への復帰を検討。

---

### 🏗️ 実装 / 機能追加

| 項目 | 状態 | 完了日 |
|---|---|---|
| シンタックスハイライト (`shiki` → `highlight.js`) | ✅ 完了 | 2026-05-19 |
| `Terminal` 同期 Server Component 化 | ✅ 完了 | 2026-05-19 |
| 検索インデックス (`src/lib/search.ts`) | ✅ 稼働中 | — |
| 検索 UI (`SearchModal`) | ✅ 稼働中 | — |
| DisclaimerModal | ✅ 稼働中 | — |
| Docs ページ (14ページ、Archive含む) | ✅ 稼働中 | — |
| Standalone Docker モード | ✅ 稼働中 | — |
| MITRE ATLAS全13節・11表・4図・6手順カード・29参考文献移行 | ✅ 自動検証完了・目視確認待ち | 2026-10-12 |
| Secure by Design全17節・35表・15図・8 Java例・32参考文献移行 | ✅ 自動検証完了・目視確認待ち | 2026-10-12 |
| DocsHeaderNavへのグローバルナビ移設・CCIE元サイドバー復元・全幅本文・table hydration修正 | ✅ 完了 | 2026-10-09 |

---

### 📄 仕様書 / ドキュメント更新

| ファイル | 最終更新 | 内容 |
|---|---|---|
| `docs/migration-inventory/ccsp-study-guide.json` | 2026-10-23 | 原本ハッシュ・全件数・アーカイブ先・検証結果 |
| `docs/migration-inventory/ccsp-study-guide-review.md` | 2026-10-23 | ユーザー目視確認表 |
| `CLAUDE.md` | 2026-10-25 | Ghost移行・専用91件/全2109件成功・原本アーカイブ・実配信検証を同期 |
| `GEMINI.md` | 2026-10-25 | Ghost移行・専用91件/全2109件成功・原本アーカイブ・実配信検証を同期 |
| `README.md` | 2026-10-25 | Ghost移行・専用91件/全2109件成功・原本アーカイブ・実配信検証を同期 |
| `security-docs/CLAUDE.md` | 2026-10-25 | Ghost移行・専用91件/全2109件成功・原本アーカイブ・実配信検証を同期 |
| `security-docs/README.md` | 2026-10-25 | Ghost移行・専用91件/全2109件成功・原本アーカイブ・実配信検証を同期 |
| `docs/test-coverage-dashboard.html` | 2026-10-25 | Ghost移行・専用91件/全2109件成功・原本アーカイブ・実配信検証を同期 |
| `docs/progress.md` | 2026-10-25 | Ghost移行・専用91件/全2109件成功・原本アーカイブ・実配信検証を同期 |
| `security-docs/src/app/docs/approach/page.mdx` | 2026-05-27 | P-08 サプライチェーンセキュリティ＆SCS評価制度内容統合 |
| `.claude/skills/test-dashboard-updater/SKILL.md` | 2026-05-20 | ダッシュボード更新スキル 新規作成 |
| `.claude/skills/docs-sync/SKILL.md` | 2026-05-27 | 他プロジェクトから移植・本プロジェクト向けに調整 |
| `.gemini/skills/docs-sync/SKILL.md` | 2026-05-27 | プロジェクトローカルの .gemini/skills に移行し適用 |
| `.claude/skills/markdown-formatter/SKILL.md` | 2026-05-27 | マークダウンフォーマッタ規約スキルファイル |
| `.gemini/skills/markdown-formatter/SKILL.md` | 2026-05-27 | 新規作成、プロジェクトローカル .gemini/skills に移行し適用 |

---

### 🚀 CI / CD・インフラ

| 項目 | 状態 | 詳細 |
|---|---|---|
| GitHub Actions CI | ✅ **稼働中** | lint / types / test（PR・push トリガー） |
| 原本比較テスト | ✅ **原本の存在で条件分岐** | ディレクトリ・パス単位のCI除外なし。sourceTestが原本不在時だけskip。ISO15408原本はarchive/へ移動済み（Git管理外） |
| Netlify 自動デプロイ | ✅ **稼働中** | `main` push でビルド・デプロイ |
| Docker 本番ビルド | ✅ **稼働中** | 3ステージ Dockerfile |
| カバレッジ CI 連携 | ✅ **設定済み** | bun test --coverageでlcov生成。codecov-actionの送信はcontinue-on-errorで非致命。今回リモート送信の到達確認は未実施 |
| `bun audit` CI 組み込み | ✅ **稼働中** | `audit` job として並列実行（`--audit-level=high`、高・重大のみ failure 扱い） |
| E2E テスト CI | ❌ **未設定** | Playwright 未導入 |

---

## 次のアクション

### ✅ 完了済み

| # | タスク | 完了日 |
|---|---|---|
| GHOST-MIG | Ghost in the Wires: 全17節・6図・原本アーカイブ・91専用テストと実配信検証、全2109件成功 | 2026-10-25 |
| REVIEW-1025 | **CyberOps Associateレビュー2件の対応** — 1024px以下で`hidden`の背景が`display:block`に上書きされる問題を`.backdrop[hidden]{display:none}`で修正。図コンテナのrole（img→group）を修正し、内側の`.diagram-viewport`はimgを維持。Red `12d298a` → Green `25edecc`。全1920件成功（未コミットの既存テスト追加分を含む）、lint・型チェック成功。ビルド禁止・未実行。 | 2026-10-25 |
| REVIEW-1024 | **依存監査とレビュー3件の対応** — happy-dom 21.0.4・zod 4.6.7でhigh 2件を解消。CISSP図説明の引用符なし日本語中間ラベル、ISO27001目次ボタンの`menu-btn`クラス、ISO27001統合テストの全体件数依存、ISO27001図コンテナのrole（img→group）を修正。全1502件成功。 | 2026-10-24 |
| CSSLP-DESIGN | **練習問題・全16図のデザイン改善** — 10問40選択肢をカード化。図番号・タイトル・新テーマと補助文字コントラストを検証。専用96件成功、目視待ち。 | 2026-10-24 |
| CSSLP | **CSSLP全16章移行・両原本アーカイブ** — 専用87件成功、全97表のホバー回帰も修正。目視待ち。 | 2026-10-24 |
| ISO27001-HTML | **既存ISO27001画面をHTML全17章で更新・新旧原本保存** — 専用100件成功。丸点/丸囲み番号・13図・36表845セル・43出典・16チェックを検証。目視待ち。 | 2026-10-24 |
| CISSP | **CISSP全18節移行・原本アーカイブ** — 専用97件成功。5幅×明暗・丸点/番号/カウンター・42図・143表・検索/操作/hydration検証。目視待ち。 | 2026-10-24 |
| GUIDE-READABILITY | **ISC2 CC表ホバー・参照コード配色と同種の7ガイドを修正** — 新規23件/全1212件成功。Chrome4条件と16ガイド比較。ビルド未実行。 | 2026-10-24 |
| CCSP | **CCSP全12節移行・原本アーカイブ** — 115見出し・78表1216セル・16図・219リスト項目を原本照合。専用69件・全1189件成功。lint/型検査成功・ビルド未実行・目視待ち。 | 2026-10-23 |
| ISC2-CC | **ISC2 CC全11章移行** — 専用55件/全1116件成功。リストの点・番号、85表1520セル、23図、54目次リンクを検証。目視待ち。 | 2026-10-23 |
| REVIEW-DIAGRAM-CORRECTIONS | **レビュー指摘対応** — 原本の図定義から意図して変える箇所を各ガイドの `fidelity-helpers.ts` の `diagramCorrections` に登録し、原本照合は訂正後の定義と比較する方式を導入。Bulletproof d16: チケット鍵漏えいで復号される範囲を新たな (EC)DHE を伴わない再開（TLS 1.2 の再開と発行元セッション、TLS 1.3 の psk_ke）に限定し、psk_dhe_ke は前方秘匿性を保つ分岐（0-RTT 除く）を追加。ZTN d12: 手順6をクライアント宛てメッセージから `Note over F` へ変更（日本語の手順文は保持）。スキップ: d6「Main Secret」（原本本文が RFC 8446bis の名称と明記）、theme dark→base（Mermaid 11 の dark も themeVariables を反映、原本も dark）。Red `1f69909` → Green `f747cf1` → 台帳 `640556b`（両台帳に `diagramCorrections` を記録）。全1061件/179ファイル成功、24図の Mermaid 構文解析成功、lint/型検査成功。ビルド禁止・未実行、目視はユーザー担当 | 2026-10-23 |
| CI-K8S-CONTRAST-TIMEOUT | **CI失敗対応** — PR CI（run 39939392410）で `hacking-kubernetes/contrast.test.tsx` の「supporting labels…4.5:1 contrast」が5080msでBun既定の5秒タイムアウトを超過（アサーション失敗ではない。同一コミットのpush CIは成功）。ローカル実測2.8〜3.8秒と余裕がないため、重い2テストに既存慣例どおり `20000` msのテスト別タイムアウトを設定（`5844027`）。WAHH版は最大1.5秒のため変更せず。全1057件/177ファイル成功、lint/型検査成功。ビルド禁止・未実行 | 2026-10-23 |
| REVIEW-HLJS-CORE | **レビュー指摘対応** — Bulletproofの `GuideCode` を `highlight.js` 全言語バンドルから `highlight.js/lib/core` へ切替え、page.mdxで使う python・http・nginx・bash の4言語のみ静的登録（他ガイドの既存方式に統一、ハイライト出力は不変）。リファクタリングのため既存テストで検証: Bulletproof 48件/7ファイル成功、lint/型検査成功（`0f5d81b`）。ビルド禁止・未実行 | 2026-10-23 |
| REVIEW-MERMAID-SSR | **レビュー指摘対応** — Bulletproofの図のテキスト説明（折りたたみ）を描画結果に関わらずサーバー描画にも含め、JavaScript無効時も読めるようにした。Secrets and Liesの遅延読み込みで `mermaid.startOnLoad=false` を設定し、load時の自動描画（`mermaid.run`）が `.mermaid` コンテナを書き換えないようにした（`initialize` は呼ばない）。Zero Trustの統合テストは静的索引を `import.meta.url` 基準、Secrets and Liesの統合テストは `import.meta.dir` 基準で読む（`f603c39`）。BulletproofとZero Trustの遅延読み込みでも `mermaid.startOnLoad=false` を設定（Red `75cfd6f` → Green `63a813f`、全1057件/177ファイル成功）。Zero Trust d12の `F-->>C: 6 時間経過で穴は閉じる` は原本どおりのため変更せず。`getSearchIndex()` の `process.cwd()` は本番の `/api/search` でバンドル後に `import.meta.url` が `.next/server` を指すため変更せず。Red `334280b` → テスト調整 `b75007e`・`b385159` → Green `3e86aff`。全1055件/177ファイル成功、lint/型検査成功。ビルド禁止・未実行 | 2026-10-23 |
| AUDIT-2026-10-23 | **依存関係の脆弱性解消** — CIの `bun audit --audit-level=high` が critical 3件・high 5件で失敗。next系3パッケージを 16.4.2、overrides で dompurify 3.4.17・toml 5.0.1 に更新。lint の新ルール対応で `Checklist` をリファクタリング（`5c85320` → `62a4951`）。両 audit ステップが exit 0（残りは既存の一時除外 braces のみ）。全1053件/177ファイル成功、lint/型検査成功。ビルド禁止・未実行 | 2026-10-23 |
| REVIEW-MERMAID-ARCHIVE | **レビュー指摘対応** — Bulletproofの図説明が引用符なしパイプラベル（`-->|通信|`）の接続を落としていた不具合を修正。Secrets and Liesの図設定から、frontmatterでは無視される `startOnLoad`・`securityLevel` を削除。archive移動検証は `archive/` がない場合だけスキップし、移動先の欠落を失敗として検出。Red `b444fa6`・テスト `8d15148` → Green `6d322a3`。全1053件/177ファイル成功、lint/型検査成功。ビルド禁止・未実行 | 2026-10-23 |
| CI-ARCHIVE | **原本比較テストのCI除外** — `archive/` 未追跡化（`2930942`）後にCIが ENOENT で92件失敗。`ci.yml` の Test ステップに `--path-ignore-patterns` を追加し、原本依存の8ガイド＋ISO 2件をCIのみ除外（`1ce9728`）。`archive/` なしのクリーン worktree で 147 pass / 0 fail を確認 | 2026-10-18 |
| THREAT-MODELING | **Threat Modeling忠実移行** — `/docs/threat-modeling-guide`。全18章・42表・839表セル・9図・2コード・17チェック・5解答・41参考文献・89見出しを保持。専用61件/13ファイル、全685件成功、lint/型検査成功。原本HTML/MDアーカイブ済み・ユーザー目視待ち | 2026-10-18 |
| APPLIED-CRYPTO | **Applied Cryptography忠実移行** — `/docs/applied-cryptography-guide`。全16節・28表・475表セル・10コード・14図・26参考文献・8問の解答・丸点/連番を保持。専用60件、全624件成功（移行完了時点の件数。現在の実測値は冒頭のテスト表を参照）、lint/型検査成功。原本をarchive/html・archive/mdに移動済み。ユーザー目視待ち | 2026-10-18 |
| ISO-27001 | **ISO/IEC 27001:2022初学者向けガイドページ追加** — `/docs/iso-iec-27001-2022-guide`（タイトル「ISO/IEC 27001:2022 初学者向けガイド」）をSecurity Guidesの27000ガイド直後に登録、静的検索は19ページ。既存27000ガイドは変更なし。Mermaid図は共通部品（DataTable/StepTimeline）で表現、出典URL全件を保持。Red `bc8b7b2` → Green `3061d16`。ダッシュボードの集計を実測値（564件/89ファイル/59,760 expect、DocsHeaderNav 9件）へ同期。lint/型検査成功、ビルド未実行（禁止）・ユーザー目視待ち・push未実施。再開時は目視指摘を再現する失敗テストから対応する | 2026-10-17 |
| ISO-27000 | **ISO/IEC 27000:2026ガイドページ追加** — `/docs/iso-iec-27000-2026-guide` をSecurity Guidesに登録、静的検索は18ページ。Mermaid図は共通部品（DataTable/StepTimeline）で表現。Red `7795079` → Green `c8ae34d`。同時にISOガイド2件とprogressのレビュー指摘を修正（`4f80c90`）。全558件/88ファイル・lint/型検査成功、ビルド未実行（禁止）・ユーザー目視待ち・push未実施 | 2026-10-17 |
| WAHH-THEME | **WAHH Mermaidテーマ修正**<br>themeVariablesの配色が全面反映されるよう `theme` を `dark` → `base` に変更（Red `10c4494` → Green `9cce30d`）。全543件・lint・型検査成功、ビルド未実行（禁止）、push未実施 | 2026-10-15 |
| PR47-COV | **PR #47 Codecov指摘対応**<br>WAHH GuideSidebarのヘッダーpointerdown・MermaidFigureのラベル付きノード説明をテストで網羅（行100%）。K8s MermaidFigureに描画失敗時の再試行ボタンを追加（Red `9ab673e` → Green `857c5fb`）。Ghost in the Wires/ISO 27001ガイドの書誌・6.2記述を修正（`9b41869`）。全543件・lint・型検査成功、ビルド未実行（禁止）、push未実施 | 2026-10-15 |
| P-01 | **カバレッジレポート追加（bun test --coverage, bunfig.toml, ci.yml and Codecov integration）**<br>CIが整備されたため、`bun test --coverage` で lcov レポートを生成し、Codecov へアップロードしてPRごとのカバレッジ差分を可視化する構成を導入。<br>**タグ**: `bun --coverage` \| **コスト**: 小 \| **効果**: 行カバレッジの数値化 | 2026-05-20 |
| P-02 | **Search API Contract テスト**<br>`GET /api/search` を提供する `route.ts` ハンドラを実装し、戻り値の型（`SearchResult[]`）やキャッシュヘッダー（`Cache-Control: s-maxage=3600`）を HTTP レベルで検証するテスト `route.test.ts` を追加しました。<br>**タグ**: `API Contract` \| **コスト**: 小 \| **効果**: API 契約の回帰防止 | 2026-05-21 |
| P-03 | **DisclaimerModal A11y テスト**<br>`DisclaimerModal` に Escape キーによるクローズ、フォーカストラップ、ボディスクロールロック制御の機能を実装し、`disclaimer-modal.test.tsx` に WCAG 2.1 AA 準拠のテストを追加しました。<br>**タグ**: `A11y` \| **コスト**: 小 \| **効果**: WCAG 2.1 AA 達成 | 2026-05-21 |
| P-04 | **smoke テストコンポーネントの深化**<br>Checklist, CompareGrid, DataTable など 9 つのコンポーネントに対し、prop variation, ReactNode レンダリング, カラーバリアント, エッジケース等の検証テストを追加・深化させました。<br>**タグ**: `Unit Test` \| **コスト**: 中 \| **効果**: リグレッション検出精度向上 | 2026-05-21 |
| P-05 | **CSP ヘッダー検証テスト**<br>`src/proxy.ts` の CSP ディレクティブ（`script-src` の env 分岐、`frame-ancestors`/`base-uri`/`form-action`/`default-src`）を `src/proxy.test.ts` で固定化。`NODE_ENV` を切り替えながらディレクティブ単位でアサートし、意図しない緩和をリグレッション検出可能に。<br>**タグ**: `CSP` / `Unit Test` \| **コスト**: 小 \| **効果**: XSS 防御後退の即時検知 | 2026-05-23 |
| P-06 | **Integration テスト（docs layout + MDX）**<br>サイドバーコンポーネント `DocsSidebar` の切り出しを行い、アクティブなドキュメントページに `aria-current="page"` を動的に付与し、アクティブ用のCSSクラススタイルを適用。`layout.test.tsx` で全サイドバー要素の描画、セクション見出し、アクティブ状態、モバイル折りたたみのクラス適用を検証するテストを追加しました。<br>**タグ**: `Integration Test` \| **コスト**: 小 \| **効果**: ナビゲーションの動作保証 | 2026-05-23 |
| P-07 | **`bun audit` CI 組み込み**<br>`.github/workflows/ci.yml` に `audit` job を追加し、`bun audit --audit-level=high` を `quality` job と並列に実行。高・重大レベルの脆弱性のみ CI 失敗扱いとし、moderate / low はレポートのみで通過させる方針を YAML コメントで明文化（修正手順・`--ignore` 運用・npm フォールバック含む）。<br>**タグ**: `Security` / `CI` \| **コスト**: 小 \| **効果**: 依存脆弱性の即時検知 | 2026-05-23 |
| P-08 | **最新セキュリティアプローチ統合（/docs/approach）**<br>準備中の approach ページに、2026年サプライチェーンセキュリティとSCS評価制度のドキュメント内容をもれなく統合し、検索インデックスのチェックテストを追加しました。<br>**タグ**: `Documentation` / `Unit Test` \| **コスト**: 中 \| **効果**: サプライチェーンセキュリティ解説の完成 | 2026-05-27 |
| P-17 | **WAHHモバイル目次のフォーカス移動** — 開いた目次でリンクを選ぶと移動先の節見出し（h2/h3、`tabindex="-1"`）へフォーカス。Escape・背景クリックは従来どおりメニューボタンへ戻す。Red `5b9c247` → Green `593e17d`。全546件/85ファイル/59,483 expect・lint/型検査成功、ビルド未実行（禁止）・ユーザー目視待ち。 | 2026-10-16 |
| P-16 | **共通ナビ切替ボタンの読み上げ名** — 固定 `aria-label` を削除し、デスクトップ「ガイド一覧」/スマートフォン「ガイド」の可視ラベルをアクセシブルネームに統一。Red `8df4d96` → Green `ca47fca`。全544件/85ファイル/59,474 expect・lint/型検査成功、ビルド未実行（禁止）・ユーザー目視待ち。 | 2026-10-16 |
| P-15 | **共通ガイド一覧メニュー** — ホーム/docsで共通化、絞り込み・カテゴリ別表示・画面内スクロール・狭幅対応。97ページ拡張と8件の操作/表示テスト、ホーム3件、設定由来の件数検証。全538件成功、ビルド未実行・ユーザー目視待ち。 | 2026-10-15 |
| P-14 | **WAHH全13主要節・14ステップ節移行** — `/docs/web-application-hackers-handbook`、専用74件 + ホーム3件 + layout1件追加。53表・16図・7コード・30チェック項目・28参考文献・丸点/番号を保持。全538件とlint/型検査成功、原本HTML/MDアーカイブ済み、ビルド未実行・ユーザー目視待ち。 | 2026-10-15 |
| P-13 | **Hacking Kubernetes全18章・82小節移行** — `/docs/hacking-kubernetes`、専用56件 + 既存レイアウト1件追加。52表・24コード・12図・24チェック項目・35出典カードを保持。補足/注意本文のコントラスト9.04〜9.76:1へ改善。全452件・lint・型検査成功、原本アーカイブ済み、ビルド未実行・ユーザー目視待ち。 | 2026-10-15 |
| P-12 | **CCST Cybersecurity全46節移行** — `/docs/ccst-cybersecurity`、104件の移行/表示テスト追加。163表・50図・73リスト/344項目・25問・60参考文献保持。全395件とlint/型検査成功、原本アーカイブ済み、ビルド未実行・目視待ち。 | 2026-10-13 |
| P-11 | **MITRE ATLAS全13節移行** — `/docs/mitre-atlas`、42移行・表示テストと4検索テスト追加。全277件・lint・型検査成功。原本アーカイブ済み、ビルド未実行・ユーザー目視待ち。 | 2026-10-12 |
| P-10 | **Secure by Design全17節移行** — `/docs/secure-by-design`。45件の移行・表示テスト、全231件成功。lint・型検査成功、ビルド未実行・目視確認待ち。 | 2026-10-12 |
| P-09 | **CCIE Security全13章移行** — `/docs/ccie-security`、Security Certifications新設。50件の移行・描画・目次・hydrationテストと10件のナビ検証、全170件成功（当時。現在の実測は冒頭のテスト表を参照）。ビルド未実施・ユーザー目視確認待ち。 | 2026-10-09 |

---

### 🔴 HIGH — 即対応

---

### 🟡 MEDIUM — 次スプリント

#### 5. SearchModal A11y テスト追加

18件の Unit テストに加え、Escape 閉じる・フォーカス管理を WCAG 2.1 観点で検証。

#### 11. Codecov 復旧後の対応（2026-10-05 起票）

**経緯**: 2026-10-05、`codecov/codecov-action@v4` が `cli.codecov.io` からの CLI 取得時に `SSL alert number 40`（handshake_failure）で失敗し、`quality` job が落ちた。ローカルの `curl` / `openssl s_client` でも同じ症状が再現し、`ingest.codecov.io` は証明書の期限切れを返していたため、Codecov 側の障害と判断した。Codecov のサイトにも接続できない状態。

**実施済み（`ci.yml`）**: `codecov-action` を v7.1.1（SHA 固定）へ更新、トークンを `token:` 入力で渡すよう変更、`continue-on-error: true` を追加（カバレッジ送信は品質ゲートではないため）。

**Codecov 復旧後に行うこと**:

- [ ] `curl -sS -o /dev/null -w '%{http_code}\n' https://cli.codecov.io/` で TLS 接続の復旧を確認する
- [ ] https://app.codecov.io/gh/myoshi2891/Security_Studies/config/general から Repository upload token を取得し、`gh secret set CODECOV_TOKEN -R myoshi2891/Security_Studies` で登録する（現状シークレット未登録で、`dev` は protected branch のためトークンなしの送信は警告対象）
- [ ] CI を再実行し、Codecov ステップのログでアップロード成功と、Codecov 上でのカバレッジ反映を確認する
- [ ] 代替案の検討: トークン管理を不要にする OIDC（`use_oidc: true` + `permissions: id-token: write`）。ワークフロー権限の拡大を伴うため要判断
- [ ] 完了後、`continue-on-error` を残すか判断し、上記「CI / CD・インフラ」表のステータスを ✅ に戻す

---

### 🟢 LOW — 中長期

#### 8. E2E テスト（Playwright）

ナビゲーション・検索・DisclaimerModal のフルユーザーシナリオ。Netlify Deploy Preview との連携も可能。

#### 9. Visual / Snapshot 回帰テスト

`Callout`・`AttackFlow`・`RiskBadge` の variant 変更を Playwright スクリーンショット比較で検出。

#### 10. Bundle Size モニタリング

`@next/bundle-analyzer` + `size-limit` を CI に追加。

---

## プロンプト集

各アクションをそのまま Claude に貼り付けて使うプロンプト。

---

### P-08: E2E テスト導入（Playwright）

```
security-docs/ に Playwright E2E テストを導入し、主要ユーザーシナリオを検証してください。

セットアップ:
1. bun add -D @playwright/test を実行
2. playwright.config.ts を作成（baseURL: http://localhost:3000、ブラウザ: chromium のみ）
3. tests/e2e/ ディレクトリに以下のテストファイルを作成:

テストシナリオ:
- tests/e2e/navigation.spec.ts
  → トップページからサイドバー経由で各 docs ページへ遷移できること
  → ページタイトルが frontmatter の title と一致すること

- tests/e2e/search.spec.ts
  → Cmd+K（Mac）/ Ctrl+K（Windows）でSearchModal が開くこと
  → クエリを入力すると結果が表示されること
  → 結果クリックで対応ページへ遷移すること

- tests/e2e/disclaimer.spec.ts
  → 初回訪問時に DisclaimerModal が表示されること
  → 同意ボタンクリックでモーダルが閉じること
  → 2回目訪問（localStorage に consent 済み）でモーダルが表示されないこと

4. package.json の scripts に "test:e2e": "playwright test" を追加
5. .github/workflows/ci.yml に E2E job を追加（bun run dev でサーバー起動後に実行）

実装前に既存の src/components/search-modal.tsx と disclaimer-modal.tsx の実装を確認し、
実際の動作に合わせてセレクターを決定してください。
```

---

*プロンプトは実行前に必要に応じてリポジトリ名・ブランチ名・パスを確認・調整してください。*


## CCIE Security 移行記録

- 2026-10-09: 表示基盤Red・6件の期待どおりの失敗。118 pass / 6 fail、23テストファイル。npm・Next.jsビルド未実行。
- 2026-10-09: 表示基盤Green・124件成功・lintと型検査成功。124 pass / 0 fail、23テストファイル。npm・Next.jsビルド未実行。
- 2026-10-09: 第1〜4章Red・5件の期待どおりの失敗。125 pass / 5 fail、24テストファイル。npm・Next.jsビルド未実行。
- 2026-10-09: 比較基盤補正・130件成功・第1〜4章実装検証中。130 pass / 0 fail、24テストファイル。npm・Next.jsビルド未実行。
- 2026-10-09: 第1〜4章Green・130件成功・lintと型検査成功。130 pass / 0 fail、24テストファイル。npm・Next.jsビルド未実行。
- 2026-10-09: 第5〜7章Red・Python強調を含む4件の期待どおりの失敗。130 pass / 4 fail、25テストファイル。npm・Next.jsビルド未実行。
- 2026-10-09: 第5〜7章Green・134件成功・lintと型検査成功。134 pass / 0 fail、25テストファイル。npm・Next.jsビルド未実行。
- 2026-10-09: 第8〜9章Red・2件の期待どおりの失敗。134 pass / 2 fail、26テストファイル。npm・Next.jsビルド未実行。
- 2026-10-09: 第8〜9章Green・136件成功・lintと型検査成功。136 pass / 0 fail、26テストファイル。npm・Next.jsビルド未実行。
- 2026-10-09: 第10〜13章Red・参考文献とチェックを含む7件の期待どおりの失敗。136 pass / 7 fail、27テストファイル。npm・Next.jsビルド未実行。
- 2026-10-09: 全13章Green・143件成功・lintと型検査成功。143 pass / 0 fail、27テストファイル。npm・Next.jsビルド未実行。
- 2026-10-09: 統合Red・カテゴリーとメタデータとテーマ等8件の期待どおりの失敗。146 pass / 8 fail、28テストファイル。npm・Next.jsビルド未実行。
- 2026-10-09: 統合Green・154件成功・lintと型検査成功・目視確認待ち。154 pass / 0 fail、28テストファイル。npm・Next.jsビルド未実行。
- 2026-10-09: 移行・整理完了・154件成功・lintと型検査成功・目視確認待ち。154 pass / 0 fail、28テストファイル。npm・Next.jsビルド未実行。

### CCIE Security 再開・目視確認

- 実装HEAD: `96cc635`。テスト170 pass / 0 fail、30ファイル（当時。最新は下記時系列の186件）。lint・型検査成功。
- 全13章の自動検証完了。次はユーザーによる目視確認。`docs/migration-inventory/ccie-security-review.md` の章別表と共通チェックを使用する。
- 再開時はnpmを使用し、ビルドは禁止。表示修正は再現テストを先にコミットする。元HTML・Markdownはarchiveに保持する。
- 2026-10-09: レイアウト再構成Red・hydration再現を含む15件の失敗。152 pass / 15 fail、30テストファイル。npm・Next.jsビルド未実行。
- 2026-10-09: ヘッダーナビ・左端の元サイドバー・全幅本文・table hydration修正Green。170 pass / 0 fail、30テストファイル。npm・Next.jsビルド未実行。
- 2026-10-09: 検索インデックスのMDX import/export除去（`search.test.ts` +1）。171 pass / 0 fail、30テストファイル。
- 2026-10-09: 見出しベース検索索引（`search.test.ts` +1、`search-modal.test.tsx` +1）。173 pass / 0 fail、30テストファイル。
- 2026-10-09: レビュー対応（Mermaid遅延描画・図説明の縦積み: `foundation.test.tsx` +2、Markdown見出し索引: `search.test.ts` +1）。176 pass / 0 fail、30テストファイル。
- 2026-10-09: Codecov `codecov/patch` 失敗（96.19% < 目標98.57%）対応。既定Mermaidエンジンの初期化・描画（`foundation.test.tsx` +1）とJSON非対応エスケープの見出し（`search.test.ts` +1）をテスト化し、`MermaidFigure.tsx`・`search.ts` の行カバレッジ100%。**178 pass / 0 fail、30テストファイル（当時の最新実測・5,966 expect。CSS比較ヘルパー共通化後）**。
- 件数の推移: 167件は表示レイアウト再構成前の旧同期値、170件はレイアウト修正Green時点、171件・173件はその後の検索改修、176件はレビュー対応（Mermaid遅延描画・図レイアウト・Markdown見出し索引）、178件はCodecovパッチカバレッジ対応による追加。185件は2026-10-10のレビュー対応（コードフェンス索引）による追加。186件は hydrateRoot の recoverable error 検証による追加。CCIE移行時点の基準値は186件。現在の実測値は冒頭のテスト表を参照。
- 2026-10-10: レビュー対応（実装HEAD: `bd664b3`）。フローチャート説明を接続と向き（→ / ↔ / —）で列挙、Mermaid `import` 失敗時にキャッシュを破棄して再試行、`.eyebrow` / `a:hover` / `.hljs-literal` を `--gold-d` に変更、コードフェンス内のJSX見出しを検索索引から除外（`foundation.test.tsx` +3、`search.test.ts` +1）。**182 pass / 0 fail、30テストファイル、5,978 expect**。lint・型検査・`bun run build` 成功。CLAUDE.md・GEMINI.md・README.md・security-docs/{CLAUDE,README}.md・ダッシュボード・移行確認表も182件・ビルド成功へ同期済み（`8b27aae`）。続けてガイド修正（Trivy影響範囲、ephemeralContainersのSecret検査、型の取り違え検出範囲、TM-012の期限付き受容）を `7f5d793` で反映。
- 2026-10-10: レビュー対応（Red: `c2378eb` / Green: `2e17306`）。検索索引に素のテキストのJSX見出し（`<h3>3. VEX…</h3>`）と、見出しを描画するdocsコンポーネント（`HeroSection` / `SectionCard` / `ThreatCard` の `title`、`DocsSubheading` の子テキスト）を追加し、`public/search-index.json` を再生成。Mermaid SVG の `max-width: 100%` を外し、幅の広い図は自然な px 幅のまま横スクロールで読めるようにした（`search.test.ts` +2、`foundation.test.tsx` は既存テストのアサーション変更）。**184 pass / 0 fail、30テストファイル、6,301 expect**（索引テストが見出しごとに検証するため expect が増加）。lint・型検査・`bun run build` 成功。ガイド修正（v1.37 ストレージ機能のAlphaとフィーチャーゲート、シークレット管理基盤の優先、OIDCシーケンスへのPKCEとnonce照合の追加）を `2bff45d` で反映。
- 2026-10-10: レビュー対応。検索索引のコードフェンスを開きフェンスの文字と長さで管理し、同じ文字・同じ長さ以上・info string なしのフェンスでのみ閉じるよう修正（```` ````md ```` 内の ```` ``` ```` で外側ブロックが終了しない。`search.test.ts` +1）。`Hacking-kubernetes-guide.md` の PSA `audit` モードを「監査イベントへの注釈付与」と明記し、監査ログ記録には kube-apiserver の監査機能設定が必要である旨を追記。目視確認ステータスを全仕様書で「pending」に統一。**185 pass / 0 fail、30テストファイル、6,302 expect**。lint・型検査・`bun run build` 成功（185件時点で再実行し確認）。
- 2026-10-11: レビュー対応（Red: `a814df4` / Green: `ba26742`）。`MermaidFigure` の描画完了・失敗処理で `active` を先に確認し、定義変更やアンマウント後に完了した古い描画では `sizeSvg` と `console.error` を実行しないよう修正（`foundation.test.tsx` の既存 stale テストにアサーション追加、件数増減なし）。**186 pass / 0 fail、30テストファイル、6,304 expect**。lint・型検査成功。

## Secure by Design 移行（2026-10-12）

原本は `archive/security-guides/Secure-by-design-guide.html` と `archive/security-guides/Secure-by-design-guide.md` に内容変更なしで保存。npm経由でBunを実行。ビルド禁止。目視確認はユーザー担当。

### 実行履歴
- 2026-10-12: 棚卸し完了・表示基盤着手前（直前HEAD `0be26b2`）。186 pass / 0 fail、30ファイル、6,304 expect。ビルド未実行。
- 2026-10-12: 表示基盤Red・9件の期待どおりの失敗（直前HEAD `0be26b2`）。186 pass / 9 fail、31ファイル、6,304 expect。ビルド未実行。
- 2026-10-12: 表示基盤Redコミット済み・実装開始前（直前HEAD `a69e3ee`）。186 pass / 9 fail、31ファイル、6,304 expect。ビルド未実行。
- 2026-10-12: 表示基盤Green・本文は未移行・lintと型検査成功（直前HEAD `741bcd6`）。195 pass / 0 fail、31ファイル、6,593 expect。ビルド未実行。
- 2026-10-12: ヒーロー・0〜4節Red・6件の期待どおりの失敗（直前HEAD `a5598dd`）。195 pass / 6 fail、32ファイル、6,593 expect。ビルド未実行。
- 2026-10-12: ヒーロー・0〜4節Green・5〜16節は未移行（直前HEAD `c609180`）。201 pass / 0 fail、32ファイル、6,685 expect。ビルド未実行。
- 2026-10-12: 5〜9節Red・5件の期待どおりの失敗（直前HEAD `3363ae3`）。201 pass / 5 fail、33ファイル、6,690 expect。ビルド未実行。
- 2026-10-12: 5〜9節Green・10〜16節は未移行（直前HEAD `3d46938`）。206 pass / 0 fail、33ファイル、6,766 expect。ビルド未実行。
- 2026-10-12: 10〜16節・フッターRed・8件の期待どおりの失敗（直前HEAD `7f2a7bb`）。206 pass / 8 fail、34ファイル、6,774 expect。ビルド未実行。
- 2026-10-12: 全17節・フッターGreen・ナビ登録と統合検証は未完了（直前HEAD `1093285`）。214 pass / 0 fail、34ファイル、6,877 expect。ビルド未実行。
- 2026-10-12: 統合Red・目次・ナビ登録・検索で4件失敗・35表hydrationと15図構文は成功（直前HEAD `09b4622`）。224 pass / 4 fail、36ファイル、8,660 expect。ビルド未実行。
- 2026-10-12: 統合Green検証・既存ナビ契約13件へ同期・実装は未コミット（直前HEAD `23708f9`）。228 pass / 0 fail、36ファイル、8,841 expect。ビルド未実行。
- 2026-10-12: 統合Greenコミット済み・全228件成功・最終監査へ（直前HEAD `e7da4dc`）。228 pass / 0 fail、36ファイル、8,841 expect。ビルド未実行。
- 2026-10-12: 最終監査Red・文書スクロール契約1件失敗・モバイルフォーカスと解除は成功（直前HEAD `d619294`）。229 pass / 1 fail、36ファイル、8,848 expect。ビルド未実行。
- 2026-10-12: 最終監査Green・230件成功・lintと型検査成功（直前HEAD `a2c908e`）。230 pass / 0 fail、36ファイル、8,850 expect。ビルド未実行。

### 最終状態・再開手順

- 実装HEAD: `0ee9b6d`（原本アーカイブ、本文全幅 `12c926d`、スクロール補正 `a2c908e`、本文統合 `e7da4dc`、表示基盤 `741bcd6`）。全231件成功・0失敗、36ファイル、9,070 expect。lint・型検査成功。
- ヒーロー・0〜16節・フッターの自動比較完了。既存ナビは13リンク、静的検索アセットも13ページ。ロジック単位29/29、戦略セル7/40=17.5%（増減なし）。
- 各段階でtest→実装→docsを分離してコミット済み。Red段階の失敗は上の時系列参照。最終整理では追加のリファクタリングは不要。
- 未実施: Next.jsビルド（禁止）、ブラウザ目視（ユーザー担当）、push・公開。
- 次のアクション: ユーザーが `docs/migration-inventory/secure-by-design-review.md` に沿って目視確認する。
- 再開プロンプト: 「Secure by Designのユーザー目視結果を確認し、指摘がある場合はnpm・ビルド禁止を維持して失敗テスト→testコミット→修正→Greenコミット→仕様書同期を実施する。元HTML・Markdownは保存する。」
- 2026-10-12: 本文全幅Red・共通proseの800px制限を再現（直前HEAD `572f97e`）。230 pass / 1 fail、36ファイル、8,852 expect。ビルド未実行。
- 2026-10-12: 本文全幅Green・全17節を1440px/900px/375pxで計算済みCSS検証・lintと型検査成功（直前HEAD `12c926d`）。231 pass / 0 fail、36ファイル、9,070 expect。ビルド未実行。

本文全幅補正: 元の本文には変更なし。共通 `.prose` の800px制限と左右auto余白を解除し、17節をデスクトップ・タブレット・スマートフォンで全幅にする計算済みCSSテストを追加（Red `572f97e` / Green `12c926d`）。
- 2026-10-12: 元HTML・MDをarchiveへ移動・原本バイト一致・全231件とlint/型検査成功（直前HEAD `0ee9b6d`）。231 pass / 0 fail、36ファイル、9,070 expect。ビルド未実行。

原本保存先: `archive/security-guides/Secure-by-design-guide.html` / `archive/security-guides/Secure-by-design-guide.md`。Next.js本文・検索アセットは変更なし。今後の移行比較はarchiveのHTMLを正本として実行する。配置換えのためTDD規約のリファクタリング手順を適用し、移動前後に既存全テストを実行した。

## MITRE ATLAS 移行（2026-10-12）

ルート `/docs/mitre-atlas`。元HTML正本。npm経由Bun・ビルド禁止・目視はユーザー担当。既存の未コミット原稿2件は作業対象外。

### 実行履歴
- 2026-10-12: 棚卸し完了・表示基盤着手前（直前HEAD `ca2fff9`）。231 pass / 0 fail、36ファイル、9,070 expect。ビルド未実行。
- 2026-10-12: 表示基盤Red・8件の期待どおりの失敗（直前HEAD `c2dfcea`）。231 pass / 8 fail、37ファイル、9,070 expect。ビルド未実行。
- 2026-10-12: 表示基盤Green・本文は未移行・lintと型検査成功（直前HEAD `cb740cb`）。239 pass / 0 fail、37ファイル、9,287 expect。ビルド未実行。
- 2026-10-12: ヒーロー・1〜4節Red・5件の期待どおりの失敗（直前HEAD `cb740cb`）。239 pass / 5 fail、38ファイル、9,287 expect。ビルド未実行。
- 2026-10-12: 表示基盤Green・本文は未移行・lintと型検査成功（直前HEAD `ee8b6ac`）。239 pass / 0 fail、37ファイル、9,287 expect。ビルド未実行。
- 2026-10-12: ヒーロー・1〜4節Red・5件の期待どおりの失敗（直前HEAD `8e1d3e2`）。239 pass / 5 fail、38ファイル、9,287 expect。ビルド未実行。
- 2026-10-12: 本文前半比較基盤補正・1〜4節は4件失敗（当時のGreen表記を訂正）・本文は未コミット（直前HEAD `57d71a7`）。240 pass / 4 fail、38ファイル、9,359 expect。ビルド未実行。
- 2026-10-12: ヒーロー・1〜4節は4件失敗（Green表記を訂正）・5〜13節は未移行（直前HEAD `9c42449`）。240 pass / 4 fail、38ファイル、9,359 expect。ビルド未実行。

復旧承認（2026-10-12）: ユーザーの「対応して」により履歴を残して復旧。`9c42449` は4件失敗中に作成され、`dddf9c4` のGreen記録は誤り。失敗原因はSVGライブラリの追加クラスを原本クラス全体と比較したこと。元のti装飾クラスは保持し、追加lucideクラスのみ許容する比較へ訂正する。
- 2026-10-12: 復旧開始・本文前半4件失敗の状態へ記録訂正（直前HEAD `0170b4c`）。240 pass / 4 fail、38ファイル、9,359 expect。ビルド未実行。
- 2026-10-12: 承認済み復旧完了・ヒーローと1〜4節Green・lintと型検査成功（直前HEAD `4603722`）。244 pass / 0 fail、38ファイル、9,361 expect。ビルド未実行。
- 2026-10-12: 5〜8節Red・4件の期待どおりの失敗（直前HEAD `5e98624`）。244 pass / 4 fail、39ファイル、9,365 expect。ビルド未実行。
- 2026-10-12: 5〜8節Green・9〜13節は未移行（直前HEAD `78439d5`）。248 pass / 0 fail、39ファイル、9,435 expect。ビルド未実行。
- 2026-10-12: 9〜13節・手順カード・参考文献Red・7件の期待どおりの失敗（直前HEAD `76e6ebd`）。248 pass / 7 fail、40ファイル、9,442 expect。ビルド未実行。
- 2026-10-12: 全13節・手順・参考文献・フッターGreen・検索と統合は未完了（直前HEAD `d738d40`）。255 pass / 0 fail、40ファイル、9,529 expect。ビルド未実行。
- 2026-10-12: 統合Red・検索/ナビ/索引8件失敗・11表hydrationと4図構文は成功（直前HEAD `37f1d7a`）。266 pass / 8 fail、42ファイル、10,510 expect。ビルド未実行。
- 2026-10-12: 統合Green・全274件成功・14ページと全34見出しを静的検索へ反映・lint/型検査成功（直前HEAD `0553651`）。274 pass / 0 fail、42ファイル、10,569 expect。ビルド未実行。
- 2026-10-12: 原本アーカイブ完了・バイト一致・全274件成功・目視確認待ち（直前HEAD `aa90484`）。274 pass / 0 fail、42ファイル、10,569 expect。ビルド未実行。
- 2026-10-12: 原本アーカイブ完了・バイト一致・全274件成功・目視確認待ち（直前HEAD `201ae15`）。274 pass / 0 fail、42ファイル、10,569 expect。ビルド未実行。
- 2026-10-12: 原本保存完了・全274件成功・最終CSS監査でリスト余白を追加確認中（直前HEAD `201ae15`）。274 pass / 0 fail、42ファイル、10,569 expect。ビルド未実行。
- 2026-10-12: 最終CSS監査Red・共通リスト余白混入の1件失敗（直前HEAD `5fefecf`）。273 pass / 1 fail、42ファイル、10,546 expect。ビルド未実行。
- 2026-10-12: 最終CSS監査Green・全274件成功・元CSS実効値308項目照合・lint/型検査成功（直前HEAD `f7feeb0`）。274 pass / 0 fail、42ファイル、10,581 expect。ビルド未実行。

### 最終状態・目視確認の再開

- 実装HEAD: `f7feeb0`（リスト項目余白）。統合実装 `0553651`、原本アーカイブ `201ae15`。全274件成功・0失敗、42ファイル、10,581 expect。lint・型検査成功。
- HTML/MD原本は `archive/advanced-topics/Mitre-atlas.html` / `archive/advanced-topics/Mitre-atlas.md`。SHA-256一致、本文・情報基準日変更なし。新規6テストファイルに39件、既存searchテストに4件追加。
- ナビ14ページ、ATLAS検索見出し34件、ロジック単位32/32。戦略セル7/40=17.5%は増減なし。
- 元CSS実効値の追加監査は14セレクタ×11プロパティ×2画面サイズの308項目。DOM実装が省略するブラウザ既定値（リストの点・番号・40px字下げ・1em余白・0px項目余白）を明示して照合した。実ブラウザの描画はユーザー目視待ち。
- TDD復旧: 早すぎた `9c42449` と誤った `dddf9c4` の記録は、ユーザー承認により履歴を残して訂正（`0170b4c` / `c57579d`）。`4603722` で元アイコンのti装飾用クラスを厳密に保持する比較へ訂正し、`2d54f7f` で244件成功を記録。それ以降のRed→実装→docsは分離済み。
- 次のアクション: ユーザーが `docs/migration-inventory/mitre-atlas-review.md` に沿って目視確認する。ビルドは禁止、push・公開は未実施。
- 再開プロンプト: 「MITRE ATLASの目視結果を確認し、指摘があればnpm・ビルド禁止を維持して失敗テスト→testコミット→修正→成功確認→実装コミット→仕様書同期を実施する。原本はarchiveのHTML/MDを保持し、関係しない未コミット原稿を変更しない。」
- 2026-10-12: 図の可読性Red・18px/コントラスト/縮小防止の6件失敗（直前HEAD `9037a98`）。271 pass / 6 fail、42ファイル、10,564 expect。ビルド未実行。
- 2026-10-12: 図の可読性Green・全277件成功・18px/コントラスト7以上/縮小防止・lint/型検査成功（直前HEAD `a9a21d7`）。277 pass / 0 fail、42ファイル、10,627 expect。ビルド未実行。

### 図の可読性改善（2026-10-12）

- ラベル18px・日本語向けフォント・明るい文字色、ノード／サブグラフ／接続ラベルでコントラスト比7以上を検証。
- viewBoxの自然幅を維持し、横長の図を縮小せず図だけ横スクロール。1800px幅SVGの縮小防止・ラベル／説明の保持・キーボード操作を検証。キャプション・説明文は14px。
- 全277件成功・0失敗、42ファイル、10,627 expect。ATLASは42件、searchは23件。lint・型検査成功。ビルド未実行・目視確認はユーザー担当。
- 元図定義・本文・原本ハッシュは不変。元テーマとの差分はユーザー依頼による文字・線のコントラスト／文字サイズ・図サイズ・キャプションの改善。

## CCIE Security 移行（2026-10-12）

ルート `/docs/ccie-security`。元HTML正本。npm経由Bun・ビルド禁止・目視はユーザー担当。既存の未コミット原稿2件は作業対象外。

### 実行履歴
- 2026-10-12: 表のCSSカスケードRed・ホバー背景と上下余白の3件失敗（直前HEAD `db686d8`）。277 pass / 3 fail、43ファイル、10,633 expect。ビルド未実行。
- 2026-10-12: 表の比較テスト補正・全280件成功・実ブラウザ85表確認済み・実装は未コミット（直前HEAD `bfa7fd9`）。280 pass / 0 fail、43ファイル、12,169 expect。ビルド未実行。
- 2026-10-12: 表のCSSカスケードGreen・全280件成功・実画面85表の白背景/上下0px確認・lint/型検査成功（直前HEAD `6a6d1d4`）。280 pass / 0 fail、43ファイル、12,169 expect。ビルド未実行。
- 2026-10-12: コード背景Red・280成功2失敗・実装前（直前HEAD `1d2a72e`）。280 pass / 2 fail、43ファイル、12,173 expect。ビルド未実行。
- 2026-10-12: コード背景Green・全282件成功・lint/型検査成功・実ブラウザー34コード/85表検証済み（直前HEAD `6203e86`）。282 pass / 0 fail、43ファイル、12,582 expect。ビルド未実行。

- 2026-10-13: CCIE Security 事前監査・既存移行の全テスト成功、原本アーカイブは次ステップ。286 pass / 0 fail、45ファイル、12,603 expect。ビルド未実行。

- 2026-10-13: CCIE Security アーカイブRed・原本移動前の契約5件が期待どおり失敗。286 pass / 5 fail、46ファイル、12,608 expect。ビルド未実行。

- 2026-10-13: CCIE Security 原本HTML・MDのアーカイブ完了・バイト一致・全テストとlint/型検査成功。291 pass / 0 fail、46ファイル、12,618 expect。ビルド未実行。

### CCIE Security 原本アーカイブ完了（2026-10-13）

既存Next.js移行を再検証し、未対応だった原本保存を完了。公開ルート `/docs/ccie-security` は変更なし。
原本: `archive/security-certifications/Ccie-security-guide.html` / `archive/security-certifications/Ccie-security-guide.md`。HTML・MD双方のSHA-256が移動前後で一致。
事前仕様書補正 `547774b` → Red `d4f11e6`（286成功・5失敗）→ Red記録 `f76e3ef` → Green `7782eb1`（291成功・0失敗）。
46テストファイル・12,618 expect、npm run lint / types:check成功。ビルド・今回の目視確認・push・公開は未実施。
全13章・85表・61図・34コード・49リスト/196項目・7チェック・59参考文献とマーカーCSSをアーカイブ原本と継続比較。
再開時はユーザーの目視指摘を再現する失敗テストから対応する。

- 2026-10-13: CCST 事前棚卸し完了・本文未移行。291 pass / 0 fail、46ファイル、12,618 expect。ビルド未実行。

- 2026-10-13: CCST 表示基盤Red・未実装による7件の失敗を確認。291 pass / 7 fail、47ファイル、12,618 expect。ビルド未実行。

- 2026-10-13: CCST 表示基盤Green・298件成功・lint/型検査成功・本文は次ステップ。298 pass / 0 fail、47ファイル、12,834 expect。ビルド未実行。

- 2026-10-13: CCST 導入・図Red・追加10件のみ期待どおり失敗（実行上限30秒）。298 pass / 10 fail、49ファイル、12,842 expect。ビルド未実行。

- 2026-10-13: CCST 導入Green・308件成功・50図パーサー検証・lint/型検査成功。308 pass / 0 fail、49ファイル、13,076 expect。ビルド未実行。

- 2026-10-13: CCST 第1〜2章Red・対象11節が未移行として失敗。308 pass / 11 fail、50ファイル、13,096 expect。ビルド未実行。

- 2026-10-13: CCST 第1〜2章Green・319件成功・lint/型検査成功。319 pass / 0 fail、50ファイル、13,418 expect。ビルド未実行。

- 2026-10-13: CCST 第3章Red・対象7節が未移行として失敗。319 pass / 7 fail、51ファイル、13,432 expect。ビルド未実行。

- 2026-10-13: CCST 第3章Green・326件成功・lint/型検査成功。326 pass / 0 fail、51ファイル、13,618 expect。ビルド未実行。

- 2026-10-13: CCST 第4〜5章Red・対象10節が未移行として失敗。326 pass / 10 fail、52ファイル、13,638 expect。ビルド未実行。

- 2026-10-13: CCST 第4〜5章Green・336件成功・lint/型検査成功。336 pass / 0 fail、52ファイル、13,944 expect。ビルド未実行。

- 2026-10-13: CCST 第6章・参考文献Red・対象14節と25問/25チェック/60参考文献の17件失敗。336 pass / 17 fail、53ファイル、13,975 expect。ビルド未実行。

- 2026-10-13: CCST 全46節Green・353件成功・lint/型検査成功・統合監査は次ステップ。353 pass / 0 fail、53ファイル、14,301 expect。ビルド未実行。

- 2026-10-13: CCST 統合Red・ナビ登録と静的検索の4件失敗・全量比較と163表hydration成功。360 pass / 4 fail、55ファイル、19,434 expect。ビルド未実行。

- 2026-10-13: CCST 統合追加Red・既存ATLAS契約も15件へ同期・登録前の6件失敗。358 pass / 6 fail、55ファイル、19,433 expect。ビルド未実行。

- 2026-10-13: CCST 統合Green・364件成功・15リンク/検索227見出し/163表hydration・lint/型検査成功。364 pass / 0 fail、55ファイル、19,443 expect。ビルド未実行。

- 2026-10-13: CCST CSS監査Red・フォント/見出し/番号項目余白/狭幅カードの5件失敗・163表と3コードの色は成功。374 pass / 5 fail、57ファイル、23,060 expect。ビルド未実行。

- 2026-10-13: CCST CSS監査Red補正・happy-dom normalキーワード欠落を最小再現・元CSSで5件失敗。374 pass / 5 fail、57ファイル、23,060 expect。ビルド未実行。

- 2026-10-13: CCST CSS監査Green・379件成功・全163表/3コード/丸点/番号・3画面幅と両テーマ・lint/型検査成功。379 pass / 0 fail、57ファイル、24,987 expect。ビルド未実行。

- 2026-10-13: CCST 原本アーカイブRed・移動前の保存先/ハッシュ/旧パス/台帳/比較参照5件失敗。379 pass / 5 fail、58ファイル、24,992 expect。ビルド未実行。

- 2026-10-13: CCST 原本アーカイブGreen・両SHA-256一致・384件成功・lint/型検査成功。384 pass / 0 fail、58ファイル、25,000 expect。ビルド未実行。

- 2026-10-13: CCST 最終監査Red・元のアンカースクロールを実viewportへ適用する契約1件失敗。384 pass / 1 fail、58ファイル、25,001 expect。ビルド未実行。

- 2026-10-13: CCST 移行完了・全385件/58ファイル/25,003expect・lint/型検査成功・原本アーカイブ済み・目視待ち。385 pass / 0 fail、58ファイル、25,003 expect。ビルド未実行。

## CCST Cybersecurity 最終状態（2026-10-13）

- ルート `/docs/ccst-cybersecurity`、Security CertificationsのCCIE直後に登録。15件のナビ・静的検索索引へ反映済み。
- 全46節をHTML正本と比較。元の丸点・番号・階層・カウンター・175アイコン、表・コード・注意枠・質問・参考文献を保持。
- CCST 12テストファイル・104件追加。全395 pass / 0 fail、58ファイル、25,099 expect。npm run lint / types:check成功。
- 原本はarchive/htmlとarchive/mdの `Ccst-cybersecurity-guide` ファイル。両ハッシュ一致、元情報基準日2026-10-05を保持。
- ロジック単位の追跡対象は36/36（既存32 + CCST GuideSidebar / GuideIcon / GuideCode / MermaidFigure）。MDX、静的データ、テストヘルパーは別集計。戦略セル7/40=17.5%は変更なし。
- 既存ナビ・静的索引の14件固定契約も15件へ同期。happy-domのletter-spacing:normal欠落は最小再現で確認し、宣言と計算済み書体を併せて検証するテストへ補正。
- Red / Green / docsを分離コミット。整理監査とlint/型検査を実施。ビルド・ブラウザー目視・push・公開は未実施。
- 次のアクション: ユーザーが `docs/migration-inventory/ccst-cybersecurity-review.md` に沿って目視確認する。指摘の修正は失敗テストのコミットから開始する。

- 2026-10-13: CCST 図中央寄せRed・小図/2400pxの幅広SVGと左端スクロール契約2件失敗。385 pass / 2 fail、58ファイル、25,009 expect。ビルド未実行。

- 2026-10-13: CCST 図中央寄せGreen・全387件成功・小図は中央/幅広図は左端から左右スクロール・lint/型検査成功。387 pass / 0 fail、58ファイル、25,032 expect。ビルド未実行。

図中央寄せ追加: Red `78997af` → Green `7c54fac`。小図は中央、幅広SVGは縮小せず左端から左右にスクロール。CCST96件、全387件成功、lint/型検査成功。今後の移行でも左端を切らない方針をsecurity-docs/AGENTS.mdへ追記。ビルド未実行。

- 2026-10-14: CCST 目次スクロール追跡（レビュー対応）。交差中の節の古い通知位置をMapに保持していたため、Setで交差中の節だけを保持し、通知ごとに全節の現在位置を取得して最上部を選ぶよう修正。Red `b43485b` → Green `00bdb04`。394 pass / 0 fail、58ファイル、25,095 expect。lint/型検査成功。ビルド未実行。

- 2026-10-14: CCST Codecov patch対応（PR #46: 94.87% < 目標99.37%）。MermaidFigure.tsx の getEngine / renderDiagram（25-41, 45-46行）が未到達だったため、mermaid をモックして初期化1回・strict設定・テーマ・描画委譲を検証するテストを追加（`2fdb908`）。MermaidFigure.tsx 行100%、全体行99.57%。395 pass / 0 fail、58ファイル、25,099 expect。lint/型検査成功。ビルド未実行。

## Hacking Kubernetes 移行記録

- 2026-10-14: 事前監査。既存395 pass / 0 fail、58ファイル、25,099 expect。HTML・Markdown原本は保持。npm経由で検証、Next.jsビルド禁止、目視確認はユーザー担当。
- 2026-10-14: Hacking Kubernetes: 表示基盤Green・lint/型検査成功。405 pass / 0 fail、60ファイル、25,485 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-14: Hacking Kubernetes: 第0〜3章Red・4件の期待どおりの失敗。405 pass / 4 fail、61ファイル、25,493 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-14: Hacking Kubernetes: 第0〜3章Green・lint/型検査成功。409 pass / 0 fail、61ファイル、25,593 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-14: Hacking Kubernetes: 第4〜7章Red・4件の期待どおりの失敗。409 pass / 4 fail、62ファイル、25,601 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-14: Hacking Kubernetes: 第4〜7章Green・lint/型検査成功。413 pass / 0 fail、62ファイル、25,722 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-14: Hacking Kubernetes: 第8〜11章Red・4件の期待どおりの失敗。413 pass / 4 fail、63ファイル、25,730 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-14: Hacking Kubernetes: 第8〜11章Green・lint/型検査成功。417 pass / 0 fail、63ファイル、25,841 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-14: Hacking Kubernetes: 第12〜15章Red・4件の期待どおりの失敗。417 pass / 4 fail、64ファイル、25,849 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-14: Hacking Kubernetes: 第12〜15章Green・lint/型検査成功。421 pass / 0 fail、64ファイル、25,925 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-14: Hacking Kubernetes: 第16〜17章Red・2件の期待どおりの失敗。421 pass / 2 fail、65ファイル、25,929 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-14: Hacking Kubernetes: 全18章Green・lint/型検査成功。423 pass / 0 fail、65ファイル、25,971 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-14: Hacking Kubernetes: 統合Red・図属性/ナビ/静的検索/フォーカス等15件の失敗。426 pass / 15 fail、67ファイル、29,247 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-14: Hacking Kubernetes: 統合/コントラストRed・10件の期待どおりの失敗（注意本文3.13:1）。435 pass / 10 fail、68ファイル、29,476 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-14: Hacking Kubernetes: 統合/コントラストGreen・全445件成功・lint/型検査成功。445 pass / 0 fail、68ファイル、30,563 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-14: Hacking Kubernetes: Refactor完了・全445件成功・lint/型検査成功。445 pass / 0 fail、68ファイル、30,563 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-14: Hacking Kubernetes: 最終表示監査Red・文書スクロールとアイコン寸法の2件失敗。445 pass / 2 fail、68ファイル、30,565 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-15: Hacking Kubernetes: 最終Green・全447件成功・lint/型検査成功・目視確認待ち。447 pass / 0 fail、68ファイル、30,576 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。

### Hacking Kubernetes 最終引き継ぎ（2026-10-15）

- 実装HEAD: `396ea93`（最終表示調整）。統合・注意文字色: `da7cf00`、Refactor: `3c4f432`。各章は失敗テストのコミットから順に実装し、テスト・実装・仕様書を別コミット。
- 専用11テストファイル・56件、既存layoutテスト1件追加。全452 pass / 0 fail、69ファイル、30,591 expect。npm run lint / npm run types:check成功。
- 元HTMLの全18章・82小節・103見出し・52表・24コード・12図・24チェック項目・35出典・全140 IDを保持。目次100項目、本文リスト15項目、引用・外部リンク・全コードの改行/空白を照合。
- 共通blockquoteの灰色と斜体が補足/注意の可読性を落としていたため、ページ専用CSSで明示的に修正。本文9.04〜9.76:1、補助ラベル等4.5:1以上。light/dark・desktop/phoneで検証。
- テスト用DOMが:has()を子要素削除後もキャッシュするため、要素の削除と独立文書のセレクタ・計算済みスタイルでスクロールのページ限定適用を検証。ブラウザーでの見え方は未確認。
- HTML/Markdown原本は `archive/security-guides/Hacking-kubernetes-guide.html` / `archive/security-guides/Hacking-kubernetes-guide.md` に移動し、ハッシュ不変を検証。原本アーカイブHEAD: `25a5ea1`。棚卸し: `docs/migration-inventory/hacking-kubernetes.json`。
- 次のアクション: ユーザーが `docs/migration-inventory/hacking-kubernetes-review.md` に沿って目視確認。Next.jsビルドは禁止、push・公開は未実施。
- 2026-10-15: Hacking Kubernetes: 原本アーカイブRed・5件の期待どおりの失敗。447 pass / 5 fail、69ファイル、30,581 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-15: Hacking Kubernetes: 原本アーカイブGreen・全452件成功・lint/型検査成功。452 pass / 0 fail、69ファイル、30,591 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。

- 2026-10-15: 原本HTML/MDを既存archive構成へ移動完了（`25a5ea1`、両ファイル100% rename）。全452件成功・lint/型検査成功。比較テストはarchiveのみ参照し、ルートへのフォールバックなし。
- 2026-10-15: WAHH: 表示基盤Red・11新規テストと検索17件契約が期待どおり失敗。451 pass / 12 fail、71ファイル、30,590 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-15: WAHH: 表示基盤・目次Red・失敗テスト13件を実装前にコミット済み。451 pass / 14 fail、72ファイル、30,590 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-15: WAHH: 表示基盤Green・全465件成功・lint/型検査成功・本文節は未移行。465 pass / 0 fail、72ファイル、31,061 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-15: WAHH: 第0〜4節Red・5件の期待どおりの失敗。465 pass / 5 fail、73ファイル、31,071 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-15: WAHH: 第0〜4節Green・全470件成功・lint/型検査成功。470 pass / 0 fail、73ファイル、31,178 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-15: WAHH: Step 1〜4 Red・4件の期待どおりの失敗。470 pass / 4 fail、74ファイル、31,186 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-15: WAHH: Step 1〜4 Green・全474件成功・lint/型検査成功。474 pass / 0 fail、74ファイル、31,299 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-15: WAHH: Step 5〜8 Red・4件の期待どおりの失敗。474 pass / 4 fail、75ファイル、31,307 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-15: WAHH: Step 5〜8 Green・全478件成功・lint/型検査成功。478 pass / 0 fail、75ファイル、31,427 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-15: WAHH: Step 9〜11 Red・3件の期待どおりの失敗。478 pass / 3 fail、76ファイル、31,433 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-15: WAHH: Step 9〜11 Green・全481件成功・lint/型検査成功。481 pass / 0 fail、76ファイル、31,511 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-15: WAHH: Step 12・補足コラム・13と第5節全体Red・4件失敗。481 pass / 4 fail、77ファイル、31,520 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-15: WAHH: 第5節・全14ステップ節Green・全485件成功・lint/型検査成功。485 pass / 0 fail、77ファイル、31,607 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-15: WAHH: 第6〜11節・付録・フッターRed・8件失敗。485 pass / 8 fail、78ファイル、31,621 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-15: WAHH: 全文Green・13主要節と14ステップ節・全493件成功・lint/型検査成功。493 pass / 0 fail、78ファイル、31,748 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-15: WAHH: 統合・表示監査Red・ホームとグローバルナビを含む14件失敗・53表hydration成功。507 pass / 14 fail、83ファイル、45,274 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-15: WAHH: 統合Green・ホーム/グローバルナビ17件・全521件成功・lint/型検査成功。521 pass / 0 fail、83ファイル、58,939 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-15: WAHH: 原本アーカイブRed・5件の期待どおりの失敗・図の狭幅/広幅と遅延描画検証成功。523 pass / 5 fail、84ファイル、58,977 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-15: WAHH: コード表示監査Red・共通CSSの背景/枠線/角丸混入を1件で再現・原本アーカイブ済み。528 pass / 1 fail、84ファイル、58,997 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-15: WAHH: コード表示Green・全529件成功・lint/型検査成功・原本アーカイブ済み・ナビ表示指摘を調査中。529 pass / 0 fail、84ファイル、59,355 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。

- ナビ表示問題を修正済み。ホーム上部とdocsヘッダーに共通のガイド一覧を表示。配信HTMLで両画面の入口・絞り込み・17リンク・WAHHを確認。
- 2026-10-15: WAHH: 共通ナビ拡張Red・ホーム上部メニュー欠落と絞り込み/97ページ対応の7件失敗。530 pass / 7 fail、85ファイル、59,361 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-15: WAHH: 共通ナビ表示名・狭幅ヘッダーRed・メニューの読み上げ名と320px検索幅を検証。519 pass / 19 fail、85ファイル、59,287 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。
- 2026-10-15: WAHH: 移行・共通ナビGreen・ホームとdocsのガイド一覧/絞り込み・全538件成功・lint/型検査成功。538 pass / 0 fail、85ファイル、59,406 expect。npm経由・ビルド未実行（禁止）・目視確認はユーザー担当／未完了。

### WAHH 移行完了・目視待ち（2026-10-15）

- 全文の原本比較、53表とページ全体のhydration、127見出しの検索、55ID/リンク、注意文字のコントラスト検証完了。ホームとグローバルナビに登録済み。
- 実装HEAD: `81c6dc1`。アーカイブHEAD: `56faff0`（HTML/MDとも100% rename）。専用74件/14ファイル、全体538 pass / 0 fail、85ファイル、59,406 expect。
- 原本: `archive/security-guides/Web-application-hackers-handbook-guide.html` / `archive/security-guides/Web-application-hackers-handbook-guide.md`。インベントリ: `docs/migration-inventory/web-application-hackers-handbook.json`。
- 残り: ユーザーが `docs/migration-inventory/web-application-hackers-handbook-review.md` に沿って目視確認。指摘があれば失敗テスト→testコミット→修正→成功確認→実装コミット→文書同期を継続。npm使用・Next.jsビルド禁止・push/公開未実施。

<!-- shared-guide-navigation-status -->

## 共通ガイドナビゲーション（2026-10-15）

- 表示問題の原因: ホーム上部はLibrary/Documentationだけの別ナビで、WAHHは一覧カードにのみ表示されていた。ホームとドキュメントヘッダーで `src/components/docs/DocsHeaderNav.tsx` を共有する構成へ修正（HEAD `81c6dc1`）。
- 入口: デスクトップは「ガイド一覧」、スマートフォンは「ガイド」。現在24ページをカテゴリ別に表示し、ガイド名・カテゴリで絞り込める。絞り込み欄は固定し、増えた項目はメニュー内で縦スクロールする。
- 拡張: `src/config/docs.ts` の `sidebarNav` がホーム一覧・共通メニュー・件数の共通設定。ページ追加時はMDX作成と設定登録を行い、検索インデックスを更新する。ナビコンポーネントにページごとの追記は不要。80ページ/新カテゴリを追加した97ページのテストと、設定に追従する件数・既存順序・重複検出テストで検証。
- 補足: 拡張テストは「登録ページ数＋テスト用の仮ページ80件」を描画するため、97ページ（当時17+80）や現在の104ページ（24+80）はテスト値であり、実際のページ数（現在24ページ）とは異なる。17リンクは共通ナビ完了時点の実ページ数。
- 操作: 開いたら絞り込み欄へフォーカス、Escapeで閉じて入口へ戻る。リンク選択・外側クリックで閉じる。表示名と読み上げ名を一致させ、320px/375pxではヘッダー検索をコンパクトにする。
- 検証（共通ナビ完了時点の記録）: 共通ナビ8件・ホーム3件・docs layout12件。全538件/85ファイル/59,406 expect成功、`npm run lint`・`npm run types:check` 成功。localhost:3000が返すホームとdocsのHTMLで共通入口・絞り込み欄・17リンク・WAHHを確認。ユーザー目視は未完了。
- npm使用・Next.jsビルド未実行（禁止）・push/公開未実施。目視確認表: `docs/migration-inventory/web-application-hackers-handbook-review.md`。

<!-- /shared-guide-navigation-status -->

- 2026-10-18: Applied Cryptography: 表示基盤Red・2件失敗・実装前。564 pass / 2 fail、90ファイル。npm経由・Next.jsビルド未実行（禁止）・目視確認はユーザー担当／未完了。直前コードHEAD `af86f10`。

- 2026-10-18: Applied Cryptography: 表示基盤Green・専用2件成功・本文と図は未完了。566 pass / 0 fail、90ファイル。npm経由・Next.jsビルド未実行（禁止）・目視確認はユーザー担当／未完了。直前コードHEAD `bf56515`。

- 2026-10-18: Applied Cryptography: 第1〜4節Red・4件失敗。566 pass / 4 fail、91ファイル。npm経由・Next.jsビルド未実行（禁止）・目視確認はユーザー担当／未完了。直前コードHEAD `d43d95d`。

- 2026-10-18: Applied Cryptography: 第1〜4節Green・第1〜4節の原本構造一致。570 pass / 0 fail、91ファイル。npm経由・Next.jsビルド未実行（禁止）・目視確認はユーザー担当／未完了。直前コードHEAD `5715336`。

- 2026-10-18: Applied Cryptography: 第5〜8節Red・4件失敗。570 pass / 4 fail、92ファイル。npm経由・Next.jsビルド未実行（禁止）・目視確認はユーザー担当／未完了。直前コードHEAD `3db6265`。

- 2026-10-18: Applied Cryptography: 第5〜8節Green・第1〜8節の原本構造一致。574 pass / 0 fail、92ファイル。npm経由・Next.jsビルド未実行（禁止）・目視確認はユーザー担当／未完了。直前コードHEAD `316cd96`。

- 2026-10-18: Applied Cryptography: 第9〜12節Red・4件失敗。574 pass / 4 fail、93ファイル。npm経由・Next.jsビルド未実行（禁止）・目視確認はユーザー担当／未完了。直前コードHEAD `576ee6c`。

- 2026-10-18: Applied Cryptography: 第9〜12節Green・第1〜12節の原本構造一致。578 pass / 0 fail、93ファイル。npm経由・Next.jsビルド未実行（禁止）・目視確認はユーザー担当／未完了。直前コードHEAD `9c419ac`。

- 2026-10-18: Applied Cryptography: 第13〜16節Red・4件失敗。578 pass / 4 fail、94ファイル。npm経由・Next.jsビルド未実行（禁止）・目視確認はユーザー担当／未完了。直前コードHEAD `9b30e3a`。

- 2026-10-18: Applied Cryptography: 第13〜16節Green・第1〜16節の原本構造一致。582 pass / 0 fail、94ファイル。npm経由・Next.jsビルド未実行（禁止）・目視確認はユーザー担当／未完了。直前コードHEAD `e1ac1cd`。

- 2026-10-18: Applied Cryptography: 装飾・Mermaid・hydration Red・12件失敗。586 pass / 12 fail、97ファイル。npm経由・Next.jsビルド未実行（禁止）・目視確認はユーザー担当／未完了。直前コードHEAD `be3a040`。

- 2026-10-18: Applied Cryptography: 装飾・図のテスト期待値補正・34件成功・実装修正は未コミット。598 pass / 0 fail、97ファイル。npm経由・Next.jsビルド未実行（禁止）・目視確認はユーザー担当／未完了。直前コードHEAD `3a722f1`。

- 2026-10-18: Applied Cryptography: 装飾・Mermaid・hydration Green・専用34件と型検査成功。598 pass / 0 fail、97ファイル。npm経由・Next.jsビルド未実行（禁止）・目視確認はユーザー担当／未完了。直前コードHEAD `1e9cd71`。

- 2026-10-18: Applied Cryptography: 復旧開始・Green誤記訂正・専用33成功1失敗・ユーザー承認済み。597 pass / 1 fail、97ファイル。npm経由・Next.jsビルド未実行（禁止）・目視確認はユーザー担当／未完了。直前コードHEAD `57fd5a1`。

- 2026-10-18 訂正: `1e9cd71` と `57fd5a1` 時点は専用33 pass / 1 fail。直前の専用34件成功・Green記録は誤り。テスト失敗後のコミットをユーザーへ報告し、履歴保持での修正継続を承認済み。履歴のreset/rebaseは行わない。

- 2026-10-18: Applied Cryptography: 復旧Green・不足アイコン修正・専用34件成功。598 pass / 0 fail、97ファイル。npm経由・Next.jsビルド未実行（禁止）・目視確認はユーザー担当／未完了。直前コードHEAD `473fc14`。

- 2026-10-18: Applied Cryptography: 統合・共通CSS隔離Red・専用46成功6失敗。610 pass / 6 fail、100ファイル。npm経由・Next.jsビルド未実行（禁止）・目視確認はユーザー担当／未完了。直前コードHEAD `2877e69`。

- 2026-10-18: Applied Cryptography: CSS既定値のテスト正規化・専用52件成功・統合実装は未コミット。616 pass / 0 fail、100ファイル。npm経由・Next.jsビルド未実行（禁止）・目視確認はユーザー担当／未完了。直前コードHEAD `9b99f6d`。

- 2026-10-18: Applied Cryptography: 統合Green・ナビ/検索/共通CSS隔離・専用52件成功。616 pass / 0 fail、100ファイル。npm経由・Next.jsビルド未実行（禁止）・目視確認はユーザー担当／未完了。直前コードHEAD `c500ddc`。

- 2026-10-18: Applied Cryptography: 最終スタイル監査Red・ブランド/コード継承書体1件失敗・全表セル照合追加。618 pass / 1 fail、100ファイル。npm経由・Next.jsビルド未実行（禁止）・目視確認はユーザー担当／未完了。直前コードHEAD `7fc208f`。

- 2026-10-18: Applied Cryptography: 最終スタイル監査Green・専用55件成功・全見出し/全表セル/書体一致。619 pass / 0 fail、100ファイル。npm経由・Next.jsビルド未実行（禁止）・目視確認はユーザー担当／未完了。直前コードHEAD `bdbc21f`。

- 2026-10-18: Applied Cryptography: 原本図定義の節別照合を追加・専用55件成功・最終全体検証へ。619 pass / 0 fail、100ファイル。npm経由・Next.jsビルド未実行（禁止）・目視確認はユーザー担当／未完了。直前コードHEAD `836e173`。

- 2026-10-18: Applied Cryptography: 専用55件成功・CSS比較の型検査エラー修正・型検査成功・全体検証中。619 pass / 0 fail、100ファイル。npm経由・Next.jsビルド未実行（禁止）・目視確認はユーザー担当／未完了。直前コードHEAD `0015790`。

- 2026-10-18: Applied Cryptography: 自動検証完了・全619件/専用55件成功・lint/型検査成功・目視待ち。619 pass / 0 fail、100ファイル。npm経由・Next.jsビルド未実行（禁止）・目視確認はユーザー担当／未完了。同期前HEAD `d6cb2b1`。

## Applied Cryptography 最終確認・再開情報（2026-10-18）

- 実装HEAD: `bdbc21f`。検証テストHEAD: `0015790`。最終検証: 619 pass / 0 fail、100ファイル、77,735 expect。専用55件/11ファイル。
- `npm test`・`npm run lint`・`npm run types:check` 成功。検索索引20ページ・65見出しを検証。Next.jsビルド禁止・未実行。push・公開未実施。
- 残る確認はユーザーの目視: `docs/migration-inventory/applied-cryptography-guide-review.md`。自動検証済みと目視未確認を区別する。指摘時は失敗テスト→testコミット→修正→成功確認→実装コミット→仕様書同期を継続。
- 手順違反からの復旧はユーザー承認済み。`dbace04`で誤記訂正、`473fc14`で不足アイコンを修正。履歴は保持。

- 2026-10-18: Applied Cryptography: 原本アーカイブRed・専用55成功5失敗・移動未実施（台帳に移動予定先を記録）。619 pass / 5 fail、101ファイル（開始時619件成功＋アーカイブ5件失敗）。同期前HEAD `5691ce9`。npm使用・ビルド禁止・未実行。

- 2026-10-18: Applied Cryptography: 原本アーカイブGreen・全624件/専用60件成功・lint/型検査成功・目視待ち。624 pass / 0 fail、101ファイル。同期前HEAD `7627df6`。npm使用・ビルド禁止・未実行。

## Applied Cryptography 原本アーカイブ（2026-10-18）

- HTML: `archive/security-guides/Applied-cryptography-guide.html`
- MD: `archive/security-guides/Applied-cryptography-guide.md`
- 原本のSHA-256とバイト一致を維持。ルート原本なし。原本比較テストはアーカイブを直接参照。
- 最終全体: 624 pass / 0 fail、101ファイル、77,750 expect。専用60件/12ファイル。
- `npm test`・`npm run lint`・`npm run types:check` 成功。ビルド禁止・未実行。目視はユーザー担当・未完了。

- 2026-10-18: Threat Modeling: 表示基盤Red・2件失敗・実装前。624 pass / 2 fail、102ファイル。専用0成功/2失敗の実測＋開始時624件。npm使用・ビルド禁止/未実行・目視はユーザー担当/未完了。同期前HEAD `4efba0b`。

- 2026-10-18: Threat Modeling: 表示基盤Green・本文と図描画は未完了。626 pass / 0 fail、102ファイル。専用2成功/0失敗の実測＋開始時624件。npm使用・ビルド禁止/未実行・目視はユーザー担当/未完了。同期前HEAD `bd1df4a`。

- 2026-10-18: Threat Modeling: 第1〜4章Red・4件失敗。626 pass / 4 fail、103ファイル。専用2成功/4失敗の実測＋開始時624件。npm使用・ビルド禁止/未実行・目視はユーザー担当/未完了。同期前HEAD `3b12ffc`。

- 2026-10-18: Threat Modeling: 第1〜4章Green・第1〜4章の原本構造一致。630 pass / 0 fail、103ファイル。専用6成功/0失敗の実測＋開始時624件。npm使用・ビルド禁止/未実行・目視はユーザー担当/未完了。同期前HEAD `d55ba7c`。

- 2026-10-18: Threat Modeling: 第5〜8章Red・4件失敗。630 pass / 4 fail、104ファイル。専用6成功/4失敗の実測＋開始時624件。npm使用・ビルド禁止/未実行・目視はユーザー担当/未完了。同期前HEAD `6e529e6`。

- 2026-10-18: Threat Modeling: 第5〜8章Green・第1〜8章の原本構造一致。634 pass / 0 fail、104ファイル。専用10成功/0失敗の実測＋開始時624件。npm使用・ビルド禁止/未実行・目視はユーザー担当/未完了。同期前HEAD `b76be8b`。

- 2026-10-18: Threat Modeling: 第9〜12章Red・4件失敗。634 pass / 4 fail、105ファイル。専用10成功/4失敗の実測＋開始時624件。npm使用・ビルド禁止/未実行・目視はユーザー担当/未完了。同期前HEAD `04a0d2d`。

- 2026-10-18: Threat Modeling: 第9〜12章Green・第1〜12章の原本構造一致。638 pass / 0 fail、105ファイル。専用14成功/0失敗の実測＋開始時624件。npm使用・ビルド禁止/未実行・目視はユーザー担当/未完了。同期前HEAD `03f69a8`。

- 2026-10-18: Threat Modeling: 第13〜15章Red・3件失敗。638 pass / 3 fail、106ファイル。専用14成功/3失敗の実測＋開始時624件。npm使用・ビルド禁止/未実行・目視はユーザー担当/未完了。同期前HEAD `1553a3a`。

- 2026-10-18: Threat Modeling: 第13〜15章Green・第1〜15章の原本構造一致。641 pass / 0 fail、106ファイル。専用17成功/0失敗の実測＋開始時624件。npm使用・ビルド禁止/未実行・目視はユーザー担当/未完了。同期前HEAD `2a4ad3c`。

- 2026-10-18: Threat Modeling: 第16〜18章Red・3件失敗。641 pass / 3 fail、107ファイル。専用17成功/3失敗の実測＋開始時624件。npm使用・ビルド禁止/未実行・目視はユーザー担当/未完了。同期前HEAD `b394669`。

- 2026-10-18: Threat Modeling: 第16〜18章Green・第1〜18章の原本構造一致。644 pass / 0 fail、107ファイル。専用20成功/0失敗の実測＋開始時624件。npm使用・ビルド禁止/未実行・目視はユーザー担当/未完了。同期前HEAD `a018e3a`。

- 2026-10-18: Threat Modeling: 装飾・図・hydration Red・13件失敗。651 pass / 13 fail、110ファイル。専用27成功/13失敗の実測＋開始時624件。npm使用・ビルド禁止/未実行・目視はユーザー担当/未完了。同期前HEAD `317d6e7`。

- 2026-10-18: Threat Modeling: CSS比較の単位正規化・専用40件成功・図/装飾実装は未コミット。664 pass / 0 fail、110ファイル。専用40成功/0失敗の実測＋開始時624件。npm使用・ビルド禁止/未実行・目視はユーザー担当/未完了。同期前HEAD `2cad1a5`。

- 2026-10-18: Threat Modeling: 装飾・Mermaid・hydration Green・専用40件成功。664 pass / 0 fail、110ファイル。専用40成功/0失敗の実測＋開始時624件。npm使用・ビルド禁止/未実行・目視はユーザー担当/未完了。同期前HEAD `51e15d2`。

- 2026-10-18: Threat Modeling: ナビ・検索統合Red・専用53成功3失敗・17チェック/5解答/目次操作成功。677 pass / 3 fail、113ファイル。専用53成功/3失敗の実測＋開始時624件。npm使用・ビルド禁止/未実行・目視はユーザー担当/未完了。同期前HEAD `dda342b`。

- 2026-10-18: Threat Modeling: 目次fixtureの型修正・型検査と専用56件成功・ナビ実装未コミット。680 pass / 0 fail、113ファイル。専用56成功/0失敗の実測＋開始時624件。npm使用・ビルド禁止/未実行・目視はユーザー担当/未完了。同期前HEAD `609fea7`。

- 2026-10-18: Threat Modeling: 統合Green・専用56件成功・ナビと89見出しの検索登録。680 pass / 0 fail、113ファイル。専用56成功/0失敗の実測＋開始時624件。npm使用・ビルド禁止/未実行・目視はユーザー担当/未完了。同期前HEAD `9fcbc72`。

- 2026-10-18: Threat Modeling: 原本アーカイブRed・5件失敗・移動未実施。680 pass / 5 fail、114ファイル。専用56成功/5失敗の実測＋開始時624件。npm使用・ビルド禁止/未実行・目視はユーザー担当/未完了。同期前HEAD `12eca0b`。

- アーカイブ台帳にHTML/MDの移動予定先を記録。原本移動・参照先更新は次の実装段階で実施する。

- 2026-10-18: Threat Modeling: 原本アーカイブGreen・専用61件成功・両SHA-256一致。685 pass / 0 fail、114ファイル。専用61成功/0失敗の実測＋開始時624件。npm使用・ビルド禁止/未実行・目視はユーザー担当/未完了。同期前HEAD `1afadef`。

- 2026-10-18: Threat Modeling: 最終全体再検証中・前回1失敗・画面幅fixture修正（専用61件とlint/型検査成功）。684 pass / 1 fail、114ファイル。全体実測。npm使用・ビルド禁止/未実行・目視はユーザー担当/未完了。同期前HEAD `09993be`。

- 2026-10-18: Threat Modeling: 最終自動検証完了・原本アーカイブ済み・全685件/専用61件成功・lint/型検査成功・目視待ち。685 pass / 0 fail、114ファイル。全体実測。npm使用・ビルド禁止/未実行・目視はユーザー担当/未完了。同期前HEAD `701a8e1`。

## Threat Modeling 最終確認・再開情報（2026-10-18）

- 最終コード/テストHEAD: `09993be`。全体685 pass / 0 fail、114ファイル、118,043 expect。専用61件/13ファイル。
- 原本HTML/MDは `archive/security-guides/Threat-modeling-guide.html`・`archive/security-guides/Threat-modeling-guide.md` にバイト一致で移動。比較テストはアーカイブを直接参照。Shostack版は変更しない。
- `npm test`・`npm run lint`・`npm run types:check` 成功。静的検索21ページ・原本89見出しを検証。ビルド禁止・未実行。push・公開未実施。
- 残る確認はユーザーの目視: `docs/migration-inventory/threat-modeling-guide-review.md`。指摘時は失敗テスト→testコミット→修正→成功確認→実装コミット→仕様書同期を継続。

## 原本比較テストの CI 除外（2026-10-18）

- 背景: `2930942` で移行済みガイドの原本を `archive/` へ整理し追跡対象外にした結果、CI のチェックアウトに原本がなく、原本比較テストが ENOENT で失敗（CI: 230 pass / 92 fail / 71 errors）。各ガイドの `fidelity-helpers.ts` はモジュール読み込み時に原本を読むため、同ディレクトリの全テストが巻き込まれる。
- 対応: `.github/workflows/ci.yml` の Test ステップに `--path-ignore-patterns` を追加（`1ce9728`）。対象は8ガイドのディレクトリと ISO 27000/27001 の `page.test.ts`。`bunfig.toml` は変更しないため、ローカルの `bun test` / `npm test` は原本比較を含む全件を実行する。
- 検証: `archive/` なしのクリーン worktree で CI と同じコマンドを実行し 147 pass / 0 fail（24ファイル）。
- **今後の移行作業での必須手順**: 原本を `archive/` へ移動し、原本を読むテストを追加・変更したら、同じコミット系列で `ci.yml` の除外パターンへ該当ディレクトリを追記する。完了前にクリーン worktree で CI コマンドを実行して 0 fail を確認する。
- 改修（2026-10-18、レビュー対応）: ディレクトリ単位の除外を廃止。8ガイドの `fidelity-helpers.ts` を遅延読み込みにし、`hasSource` / `sourceTest`（`test.skipIf`）を追加。原本を参照するテストのみ `sourceTest` に切り替え、モジュールレベルの即時評価（CCIE sidebar/foundation、Hacking Kubernetes・WAHH integration）を関数化。`archive.test.ts` はバイト一致のみスキップ対象。検証: ローカル 687 pass / 0 fail、`archive/` なしのクリーン worktree で 364 pass / 312 skip / 0 fail（112ファイル）。lint・型検査成功。ビルド未実行。

## レビュー対応（2026-10-18）

- 図のテキスト説明: Applied Cryptography の `EDGE_PATTERN` が引用符なし点線ラベル（図9「影響を受ける」）を読み取るよう修正。Threat Modeling の `NODE_PATTERN` がスタジアム形 `([..])`・円柱形 `[(..)]` のラベルを抽出するよう修正。Red `1917a9a` → Green `e6be2b3`。
- ガイド本文（`c51e3d7`）: ISO 27017 の全デプロイメントモデル表記、ISO/IEC 18045 ロードマップの AVA 位置、ISO/IEC 29100 の Third party 定義、ISSAP の目次アンカー・問題形式・NIST IR 8547 強度区分・Kerberos 相互認証。
- 仕様書: File Unit Coverage 内訳（46 + 4 + 4）、Applied Cryptography 記録の当時件数注記、ナビ拡張テスト値（登録ページ＋仮80件）の注記、ダッシュボードの移行状況セクションを履歴領域へ移動。
- 全体: 687 pass / 0 fail、114ファイル、118,047 expect。lint/型検査成功。ビルド禁止・未実行。
- 見送り: `archive/` の再追跡（ユーザー判断で意図的に未追跡、CI除外で対応済み）、Applied Cryptography CSS の `body.drawer-open` 3ルール削除（`foundation.test.tsx` が原本CSSの全ルール保持を契約として検証するため）、MermaidFigure/GuideSidebar の共通モジュール化（大規模リファクタリングのため要確認）。

<!-- iso15408-status -->

ISO/IEC 15408-1:2026: 原本アーカイブと最終自動検証完了・専用55件成功・lint/型検査成功・目視待ち。npm test: 457 pass / 297 skip / 0 fail、124ファイル。原本の有無でskip件数は変動。ビルド禁止・未実行、目視はユーザー担当・未完了。

移行先: `security-docs/src/app/docs/iso-iec-15408-1-2026-guide/page.mdx`（URL `/docs/iso-iec-15408-1-2026-guide`）。原本は `archive/standards/Iso-15408-1-2026-guide.html` / `archive/standards/Iso-15408-1-2026-guide.md` にバイト一致で移動済み。`archive/` は既存規約どおりGit管理外。

全21節・81見出し・31表（509セル）・17図・88リスト項目・10解答・19参考文献を原本と比較。点の疑似要素、番号、全CSS宣言、375/900/1440pxの計算済みスタイル、両配色、目次操作、図の再試行、表・全ページhydrationを検証。ナビ・ホーム一覧・静的検索22ページに登録。原本HTML/MDはSHA-256一致でアーカイブ済み。専用55件/10ファイル、全体457 pass / 297 skip / 0 fail（754件/124ファイル、41,155 expect）。npm test・npm run lint・npm run types:check成功。push・公開未実施。台帳: `docs/migration-inventory/iso-iec-15408-1-2026-guide.json`、目視確認表: `docs/migration-inventory/iso-iec-15408-1-2026-guide-review.md`。

<!-- /iso15408-status -->

### ISO15408 完了・目視引継ぎ（2026-10-22）

- Red/Greenは表示基盤・0〜6節・7〜13節・14〜20節・ナビ検索・装飾回帰の各段階で分離コミット済み。
- 次の対応: 専用目視確認表に沿うユーザー確認。指摘は失敗テストから対応する。ビルド・push・公開は未実施。

### ISO15408 原本アーカイブ Red（2026-10-22）

専用テスト実測: 51 pass / 2 skip / 2 fail、10ファイル（55件）。ルート原本の残存と比較テスト参照先の未更新を再現。アーカイブ2件のバイト比較は移動前のためskip。全体の最新実測は移行完了時の453成功/297 skip/0失敗・123ファイル。アーカイブ後に全体を再検証する。

### ISO15408 原本アーカイブ Green（2026-10-22）

- HTML/MDをarchive/html・archive/mdへ移動。両SHA-256は移動前と一致。原本比較はarchiveだけを参照。
- 専用55件/10ファイル成功。全体: 457 pass / 297 skip / 0 fail、124ファイル（754件、41,155 expect）。npm test・lint・型検査成功。ビルド禁止・未実行。
- archive/は既存規約どおりGit管理外。目視はユーザー担当・未完了。push・公開未実施。

<!-- iso27017-status -->

ISO/IEC 27017:2026: 移行・原本アーカイブ・最終自動検証完了。専用55件/12ファイル成功。全体512 pass / 297 skip / 0 fail、136ファイル（809件、84,599 expect）。npm test・npm run lint・npm run types:check成功。Next.jsビルド禁止・未実行。目視はユーザー担当・未完了。push・公開未実施。

移行先: `security-docs/src/app/docs/iso-iec-27017-2026-guide/page.mdx`（URL `/docs/iso-iec-27017-2026-guide`）。全17節・57見出し・30表（463セル）・10図・2コード・44リスト項目・7チェック項目・7 Q&A・18参考文献を原本と照合。全CSS宣言と375/1100/1440px・両配色の本文/表/リスト等の計算済みスタイルを比較。箇条書きの点、番号、チェックカウンター、選択/フォーカス表示、コード文字列とローカルハイライト、目次操作、図の描画/再試行、表・全ページhydrationを検証。原本: `archive/standards/Iso-27017-2026-guide.html` / `archive/standards/Iso-27017-2026-guide.md`（SHA-256一致・既存規約どおりGit管理外）。ナビと検索23ページに登録。台帳: `docs/migration-inventory/iso-iec-27017-2026-guide.json`。目視確認表: `docs/migration-inventory/iso-iec-27017-2026-guide-review.md`。

<!-- /iso27017-status -->

### ISO27017 完了・目視引継ぎ（2026-10-22）

- 表示基盤・0〜5節・6〜11節・12〜16節・ナビ検索・原本アーカイブごとにRed→テストコミット→Green→実装コミット→別の文書同期コミットを実施。
- 次の対応: 専用目視確認表に沿ってユーザー確認。指摘があれば失敗テストから修正。ビルド・push・公開は未実施。

<!-- iso18045-status -->

ISO/IEC 18045:2026: 移行・原本アーカイブ・最終自動検証完了。専用56件/10ファイル成功。全体568 pass / 297 skip / 0 fail、146ファイル（865件、158,174 expect）。npm test・npm run lint・npm run types:check成功。Next.jsビルド禁止・未実行。目視はユーザー担当・未完了。push・公開未実施。

移行先: `security-docs/src/app/docs/iso-iec-18045-2026-guide/page.mdx`（URL `/docs/iso-iec-18045-2026-guide`）。全21節・77見出し・40表（830セル）・18図・98信頼度タグ・28参考文献を原本と照合。全CSS宣言、375/1100/1440px・両配色の本文/全表セル/タグ等の計算済みスタイル、リストの点・番号の定義を検証。18図の定義・配色・sequence/pie設定・円グラフ全11値、目次操作、図の描画/再試行、表・全ページhydrationを検証。共通CSSによるダーク配色の見出し色混入を修正。原本: `archive/standards/Iso-iec-18045-2026-guide.html` / `archive/standards/Iso-iec-18045-2026-guide.md`（SHA-256一致・既存規約どおりGit管理外）。ナビと検索24ページに登録。台帳: `docs/migration-inventory/iso-iec-18045-2026-guide.json`。目視確認表: `docs/migration-inventory/iso-iec-18045-2026-guide-review.md`。

<!-- /iso18045-status -->

### ISO18045 完了・目視引継ぎ（2026-10-22）

- 表示基盤・0〜6節・7〜13節・14〜20節・ナビ検索/見出し色・原本アーカイブごとにRed→テストコミット→Green→実装コミット→別の文書同期コミットを実施。
- 次の対応: 専用目視確認表に沿ってユーザー確認。指摘があれば失敗テストから修正。ビルド・push・公開は未実施。


## Bulletproof TLS and PKI 移行（2026-10-23）

Bulletproof TLS and PKI: `/docs/bulletproof-tls-pki-guide` へ移行。全15節・57表868セル・24図・12コード・10チェック項目・4解答を原本照合。専用41件/6ファイル成功。全体615 pass / 297 skip / 0 fail（912件・152ファイル・160,218 expect）。npm test・npm run lint・npm run types:check成功。Next.jsビルド禁止・未実行。目視はユーザー担当・未完了。原本HTML/MDは `archive/security-guides/` にカテゴリー別で保存（両SHA-256一致）。

- Red `65cbdea`: 原本照合19件失敗 → Green `0ec3286`: 全15節・CSS・ナビ検索移行。
- Red `a7ad9fd`: 図の配色・sequence設定欠落を再現 → Green `da37f69`: 原本設定復元、41件成功。
- Refactor検証: npm run lint / npm run types:check成功。追加リファクタリング不要。
- レビュー対応（2026-10-23）: CSS照合テストをセレクター＋@media祖先一致に強化（`590cb69`、media除去の変異で失敗を確認）。台帳のlistItems 72を節57＋サイドバー15に分解（`3972202`）。d6「Main Secret」（原本がRFC 8446bis名と明記）、d16の定義、theme 'dark'（原本設定・cascadeテストで固定）は原本忠実のため変更なし。専用41件成功・lint/型検査成功。ビルド未実行（禁止）。
- 24図のMermaid構文を実エンジンで解析成功。375/768/1024/1025/1440pxのリスト番号・余白・目次・図スクロール、操作とhydrationを自動検証。
- 作業開始時の実測は574成功/297 skip/0失敗・146ファイル（871件）。旧トップ集計571件との差分も今回の最終実測で同期。過去の移行記録の数値は当時の実測として保持。
- 仕様書7ファイル・台帳・目視確認表を同期。目視確認後の公開は未実施。


<!-- zero-trust-stage -->
Zero Trust Networks, 2nd Edition: /docs/zero-trust-networks-2nd-edition-guide へ移行・原本アーカイブ完了。全25節・83表（1344セル）・17図・3コード・90 STEP・36解答・20出典を原本と照合。専用68件/12ファイル成功。全体683 pass / 297 skip / 0 fail（980件・164ファイル・327,505 expect）。npm test・npm run lint・npm run types:check成功。Next.jsビルド禁止・未実行。目視はユーザー担当・未完了。push・公開未実施。
<!-- /zero-trust-stage -->


## Zero Trust Networks 第2版 移行（2026-10-23）

Zero Trust Networks, 2nd Edition: /docs/zero-trust-networks-2nd-edition-guide へ移行・原本アーカイブ完了。全25節・83表（1344セル）・17図・3コード・90 STEP・36解答・20出典を原本と照合。専用68件/12ファイル成功。全体683 pass / 297 skip / 0 fail（980件・164ファイル・327,505 expect）。npm test・npm run lint・npm run types:check成功。Next.jsビルド禁止・未実行。目視はユーザー担当・未完了。push・公開未実施。

- 表示基盤: Red `5faf664` → Green `11656ef`。
- 導入〜第6章: Red `8acf2ea` → Green `7438ab6`。原本リンク間の空白欠落も検出・修正。
- 第7章〜出典: Red `92b4b29` → Green `79688b8`。全25節を照合。
- 操作・スタイル・統合: Red `eff62f3` → Green `54f684a`。表文字サイズの混入、図のsequence余白・LR→TB再配置、ナビ/検索未登録を検出・修正。CSSの等価単位、原本ハイライト適用状態、500文字スニペットの既存仕様をテストに反映。
- 原本アーカイブ: Red `d1e6468` → Green `5d116d6`。HTML/MDのSHA-256一致・ルート除去・比較参照切替を検証。archive/は既存規約どおりGit管理外。
- アイコン最終照合: Red `82c3e58` → Green `197a8fa`。盾＋錠前をローカルSVGで保持し、7種類の意味を検証。
- 動的表示最終照合: Red `b8936cc` → Green `c2c6314`。原本headのcolor-schemeと動的スクロール案内を保持。
- Refactor検証: npm lint / types:check成功。追加リファクタリング不要。
- 仕様書7ファイル・移行台帳・目視確認表を同期。次の対応: ユーザーによる目視確認。

台帳: `docs/migration-inventory/zero-trust-networks-2nd-edition-guide.json`。目視確認表: `docs/migration-inventory/zero-trust-networks-2nd-edition-guide-review.md`。


<!-- secrets-stage -->
Secrets and Lies: /docs/secrets-and-lies-guide へ移行・原本アーカイブ完了。全11節・24表627セル・12図・31演習・8チェック項目・21出典を原本照合。専用55件/11ファイル成功。全体738 pass / 297 skip / 0 fail（1035件・175ファイル・410,413 expect）。npm test・npm run lint・npm run types:check成功。Next.jsビルド禁止・未実行。目視はユーザー担当・未完了。push・公開未実施。
<!-- /secrets-stage -->


## Secrets and Lies 移行（2026-10-23）

Secrets and Lies: /docs/secrets-and-lies-guide へ移行・原本アーカイブ完了。全11節・24表627セル・12図・31演習・8チェック項目・21出典を原本照合。専用55件/11ファイル成功。全体738 pass / 297 skip / 0 fail（1035件・175ファイル・410,413 expect）。npm test・npm run lint・npm run types:check成功。Next.jsビルド禁止・未実行。目視はユーザー担当・未完了。push・公開未実施。

- 表示基盤: Red `6e6de4c` → Green `ded38af`。
- Step 0〜4: Red `d4240da` → Green `eab2ee4`。
- Step 5〜出典: Red `58268e8` → Green `3c6742b`。
- 操作・スタイル・ナビ検索: Red `8b4f89a` → Green `9f0f675`。リスト種別を明示し、点/演習番号とネイティブ番号の重複を防止。全59見出しの索引一致、CIでも残る固定件数の検査と欠落検出のmutation probesを追加。
- 原本アーカイブ: Red `2337f91` → Green `80fc1f8`。両原本SHA-256一致・ルート除去・参照切替を検証。archive/は既存規約でGit管理外。
- Refactor `e59fc2d`: Happy DOMの入力要素に対応するテスト型へ整理。最終lint・型検査成功。
- 開始時監査: 683成功/297 skip/0失敗・164ファイル（980件）で仕様書と一致。
- 仕様書7ファイル・台帳・目視確認表を同期。次の対応: ユーザーによる目視確認。

台帳: `docs/migration-inventory/secrets-and-lies-guide.json`。目視確認表: `docs/migration-inventory/secrets-and-lies-guide-review.md`。


<!-- bulletproof-archive-stage -->
Bulletproof TLS and PKIのHTML・Markdown原本を内容別カテゴリー archive/security-guides/ にアーカイブ。両SHA-256一致、ルート原本を除去、比較テストの参照先を更新。専用45件/7ファイル成功。全体742 pass / 297 skip / 0 fail（1039件・176ファイル・410,418 expect）。npm test・npm run lint・npm run types:check成功。ビルド禁止・未実行。archive/は既存設定でGit管理外。
<!-- /bulletproof-archive-stage -->


### Bulletproof内容別アーカイブ（2026-10-23）

Bulletproof TLS and PKIのHTML・Markdown原本を内容別カテゴリー archive/security-guides/ にアーカイブ。両SHA-256一致、ルート原本を除去、比較テストの参照先を更新。専用45件/7ファイル成功。全体742 pass / 297 skip / 0 fail（1039件・176ファイル・410,418 expect）。npm test・npm run lint・npm run types:check成功。ビルド禁止・未実行。archive/は既存設定でGit管理外。

Red `a9bf4d7` → Green `a31d97d`。移動先: `archive/security-guides/Bulletproof-tls-pki-guide.html` / `archive/security-guides/Bulletproof-tls-pki-guide.md`。形式別ではなく内容別の既存カテゴリーへ両原本をまとめる。


<!-- archive-categories-stage -->
アーカイブを内容別カテゴリーへ統一。archive/html・archive/mdに残っていた10原本を移動し、全10件のSHA-256一致を確認。ISO3組はarchive/standards、Secrets and Lies・Zero Trust Networksの2組はarchive/security-guides。空の形式別フォルダーを除去し、すでに分類済みの原本を含む比較テスト・台帳の旧パスも修正。ローカル全体1052 pass / 0 skip / 0 fail（1052件・177ファイル・489,759 expect）。旧パスでスキップされていた297件の原本比較が復帰。CI相当576 pass / 476 skip / 0 fail（1052件・177ファイル、archive/なし・npm test -- --coverage）。lint・型チェック成功。ビルド禁止・未実行。
<!-- /archive-categories-stage -->


## 内容別アーカイブ統一（2026-10-23）

アーカイブを内容別カテゴリーへ統一。archive/html・archive/mdに残っていた10原本を移動し、全10件のSHA-256一致を確認。ISO3組はarchive/standards、Secrets and Lies・Zero Trust Networksの2組はarchive/security-guides。空の形式別フォルダーを除去し、すでに分類済みの原本を含む比較テスト・台帳の旧パスも修正。ローカル全体1052 pass / 0 skip / 0 fail（1052件・177ファイル・489,759 expect）。旧パスでスキップされていた297件の原本比較が復帰。CI相当576 pass / 476 skip / 0 fail（1052件・177ファイル、archive/なし・npm test -- --coverage）。lint・型チェック成功。ビルド禁止・未実行。

- Red `20a3093`: カテゴリー別保存、全10ハッシュ、旧フォルダー空、全参照整合の失敗を確認。
- Green `91f2fcc`: 10原本を移動し12個の比較ヘルパーの参照先を修正。関連テスト16ファイルと台帳・文書も同期。
- 文書同期 `6f69b37`: 原本の保存先と移動前ハッシュを追跡可能に記録。
- 全体検証: 1052 pass / 0 skip / 0 fail（1052件・177ファイル・489,759 expect）。原本不在CI条件: 576 pass / 476 skip / 0 fail（1052件・177ファイル、archive/なし・npm test -- --coverage）。npm lint・types:check成功。
- ロジックファイルの分母75は変更なし。追加13件はアーカイブ保全とパス整合の契約。
- 台帳: `docs/migration-inventory/archive-category-reorganization.json`。archive/は引き続きGit管理外。

## ISC2 CC 移行（2026-10-23・Red）

原本台帳: `docs/migration-inventory/cc-certified-in-cybersecurity-guide.json`。11章・120見出し・85表1520セル・239リスト項目・23図・53出典カード・75注意欄。原本は保持。Red `1 pass / 46 fail / 1 import error`（5ファイル、sidebar import errorで未登録の5件は別途Greenで実行）。実装前テストコミット `562a0ad`。全体の成功件数1061は移行前の実測であり、現在は移行中。npm使用・ビルド禁止・目視はユーザー担当。

### ISC2 CC テスト補正（2026-10-23）

Happy DOMの`list-style`略記未展開を補い、ブラウザー既定の丸点/番号を比較。目次fixtureを原本どおりのh2構造へ変更。図の全設定比較を追加（専用52件）。共通CSSによる`.brand`色混入を375pxで検出しRed維持。本文11章の構造比較・全85表のhydration・23図の構文は通過。次にブランド色を補正し全体を再検証。

### ISC2 CC 図配置Red（2026-10-23）

5画面幅×両配色で本文・リスト・全1520表セルの比較を通過。54目次リンクと円グラフ説明を追加（専用54件）。幅広図の左端を保持するblock配置の追加テストで原本由来のflexを検出して失敗。次に図コンテナーをblock化する。

### ISC2 CC フォントRed（2026-10-23）

図配置を補正し専用54件成功。追加監査で、ローカルSource Serif 4パッケージのfamily名が`Source Serif 4 Variable`であることを確認。元CDN名のみの見出し・ブランド指定を検出する失敗テストを追加（専用55件）。次にローカルfamilyを優先指定する。

### ISC2 CC 最終検証準備（2026-10-23）

フォントfamilyのCSSOM引用符正規化をテストに反映し、フォント専用検証は成功。専用55件と全体の最終再実行へ進む。ビルド禁止・未実行。

### ISC2 CC 全体回帰・資格ナビ期待値（2026-10-23）

専用55件/5ファイルは成功。全体初回は1114成功/2失敗（1116件/184ファイル）。CCIE・CCSTの資格ナビ完全一致が従来3件固定のため失敗したので、新規ISC2 CCを含む4件のタイトル・URL・順序を完全一致で検証するよう更新。該当2件は再検証成功。全体再実行へ進む。

### ISC2 CC OS配色監査（2026-10-23）

全体1116件/184ファイル成功を確認後、明暗比較でHTMLクラスだけでなくHappy DOMのOS配色設定も変更し、`prefers-color-scheme`の実際の切替を検証。5画面幅×両配色を含むcascade13件成功。テスト数は55件のまま。全体の最終再実行中。lint/型検査成功・ビルド未実行。


## ISC2 CC 移行（2026-10-23・自動検証完了）

ISC2 CCを `/docs/cc-certified-in-cybersecurity-guide` へ移行。11章・120見出し・85表1520セル・239リスト項目・23図・54目次リンク・53出典カード・75注意欄を原本と照合。丸点・番号・全CSS宣言とmedia条件、5画面幅×明暗両配色、目次操作、図の再試行・説明・配色、全表とページのhydrationを検証。専用59件/6ファイル成功。全体1120成功/0失敗（185ファイル、494,572 expect）。npm test・npm run lint・npm run types:check成功。Next.jsビルドは禁止・未実行。目視はユーザー担当・未確認。

配置: `security-docs/src/app/docs/cc-certified-in-cybersecurity-guide/page.mdx`。Security Certifications（資格・学習）の共通ナビ・ホーム・静的検索28件に登録。HTML・Markdown原本は `archive/security-certifications/` へバイト一致でアーカイブ済み。ローカルSource Serif 4 Variableとアイコン・Mermaidを使用。共有ヘッダーを避けた目次配置と幅広図の左右スクロールに対応。台帳: `docs/migration-inventory/cc-certified-in-cybersecurity-guide.json`。目視確認表: `docs/migration-inventory/cc-certified-in-cybersecurity-guide-review.md`。実装コミット `58e8b43`。

### ISC2 CC 再開時のアクション

1. ユーザーが目視確認表で表示を確認する。
2. 指摘があれば失敗テストのコミットから修正する。

再開プロンプト: 「ISC2 CCの目視指摘に対応。実装コミット `58e8b43`、専用55件・全1116件成功。原本を保持し、TDDのテスト/実装/仕様書コミットを分割。npm使用・ビルド禁止を継続。」

## ISC2 CC 原本アーカイブ（2026-10-23・Red）

ユーザー指示により移行後は元HTML/Markdownを必ず内容別アーカイブへ移す。資格原本は`archive/security-certifications/`。新規4件のテストで、ルート残存・比較パスの2失敗と未移動原本の2skipを確認。次にバイト一致で移動し比較パスを更新する。全体1116件成功の記載は移動前の実測。npm使用・ビルド禁止を継続。


## ISC2 CC 原本アーカイブ（2026-10-23・Green）

ISC2 CCの元HTMLとMarkdownを `archive/security-certifications/` へアーカイブ（両SHA-256一致、ルート残存なし）。原本比較はアーカイブ参照へ変更。専用59件/6ファイル・全1120件/185ファイル成功、494,572 expect。原本のない隔離環境は専用30成功/29skip/0失敗で、原本非依存の検証は継続。npm test・lint・型チェック成功。ビルド未実行、目視はユーザー担当。実装コミット `c1e0da3`。

再開時: 移行完了後は、元HTMLと対応するMarkdownを必ず同じ内容別カテゴリーのarchiveへ移動する。資格は`archive/security-certifications/`。移動前後のSHA-256一致・ルート残存なし・比較パス更新を検証し、原本を上書き・消失させない。 ビルド禁止・npm使用を継続し、目視指摘があれば失敗テストから対応する。

## CCSP移行（2026-10-23・基盤Red）

移行前の全体1120件/185ファイル成功を実測。原本は12節・115見出し・78表1216セル・16図・219リスト項目・10解答・6チェック・38出典カード。基盤の新規4テストファイルは26失敗/1 import error（sidebar未登録5件）を確認。台帳: docs/migration-inventory/ccsp-study-guide.json。次にヒーロー・目次・ローカル描画・全CSSを実装する。

直前コミット `dbba5cc`。npm使用・ビルド禁止・目視はユーザー担当。最終段階でHTML/Markdownを`archive/security-certifications/`へバイト一致で移動する。

## CCSP移行（2026-10-23・基盤テスト補正）

目次IDを原本のmenu-btnへ合わせ、clamp式を原本と移行先で同一評価する比較を追加。基盤30件は24成功/6失敗で、残る失敗は共通CSS下のeyebrowの字間。型注釈も補正。次に字間を明示し基盤をGreenにする。

直前コミット `75e8d93`。npm使用・ビルド禁止・目視はユーザー担当。最終段階でHTML/Markdownを`archive/security-certifications/`へバイト一致で移動する。


<!-- ccsp-migration-status -->
## CCSP移行（2026-10-23）

CCSP: 全12節移行・原本アーカイブGreen・目視待ち。全12節・115見出し・78表1216セル・16図・219リスト項目・10解答・6チェック・38出典カードを原本と照合。丸点/番号/カウンター、全CSS/media、5画面幅×両OS配色、図・目次・チェック/解答操作、全表と全ページのhydrationを検証。HTML/Markdownは両SHA-256一致でarchive/security-certificationsへ移動済み。原本なし隔離環境は専用33成功/36skip/0失敗。 専用69件/10ファイル・全体1189成功/0skip/0失敗（195ファイル、499,087 expect）。npm test・lint・型チェック成功。ビルド禁止・未実行。目視はユーザー担当。直前実装コミット `bac8c7a`。

配置: `security-docs/src/app/docs/ccsp-study-guide/page.mdx`、URL `/docs/ccsp-study-guide`。Security Certifications（資格・学習）へ登録。台帳: `docs/migration-inventory/ccsp-study-guide.json`。原本: `archive/security-certifications/Ccsp-study-guide.html` / `archive/security-certifications/Ccsp-study-guide.md`（バイト一致でアーカイブ済み）。目視確認表: `docs/migration-inventory/ccsp-study-guide-review.md`。
<!-- /ccsp-migration-status -->

## CCSP移行（2026-10-23・Step 0〜6 Red）

Step 0〜6の7件の原本構造比較がすべて失敗し、現在は見出しのみであることを検出。次に7節の全文、表、リスト、注記、図、リンクを移植する。直前の全体1150件は基盤Green時の実測。

直前コミット `9d71130`。npm使用・ビルド禁止・目視はユーザー担当。最終段階でHTML/Markdownを`archive/security-certifications/`へバイト一致で移動する。

## CCSP移行（2026-10-23・残り5節・全体照合Red）

専用65件/9ファイルは41成功/24失敗。後半5節と全件数・115見出し・全78表のhydration・5画面幅×両OS配色・10解答/6チェックの操作を厳格化。目次追従で固定asideではなく実際の内側navをスクロールする契約も失敗を検出。次に後半全文とnav追従を実装する。

直前コミット `538ba63`。npm使用・ビルド禁止・目視はユーザー担当。最終段階でHTML/Markdownを`archive/security-certifications/`へバイト一致で移動する。

## CCSP移行（2026-10-23・原本アーカイブRed）

原本のルート残存と比較パスの2件が失敗、未移動のHTML/Markdownハッシュ2件はskip。次に両原本をarchive/security-certificationsへバイト一致で移し、比較参照を更新する。本文検証は専用65件・全1185件成功済み。

直前コミット `9dcbdfe`。npm使用・ビルド禁止・目視はユーザー担当。最終段階でHTML/Markdownを`archive/security-certifications/`へバイト一致で移動する。

### CCSP 再開時のアクション

1. ユーザーが目視確認表に沿って表示を確認する。
2. 指摘があれば失敗テストを先にコミットして修正する。

再開プロンプト: 「CCSPの目視指摘に対応。全12節・原本アーカイブ済み。専用69件・全1189件成功。npm使用・ビルド禁止、テスト/実装/仕様書コミットの分割を継続。原本比較はarchive/security-certifications/Ccsp-study-guide.htmlを参照する。」

## ガイド配色レビュー対応（2026-10-23・Red）

ISC2 CCの表ホバーと[S番号]等6コードの配色問題をChromeで再現。17ガイドの実描画HTMLを比較し、他6ガイドの表ホバーとApplied Cryptographyの[S1]にも共通prose CSSの干渉を確認。通常/ホバー・明暗・375/1440px・全85表1520セル・同種ガイドを検証する新規22件は全件Red。次に各ガイドのスコープ内で原本の背景と継承文字色を保持する。前回の全体実測は1189件成功。npm使用・ビルド禁止。

### 配色回帰テストのブラウザー整合（2026-10-23）

ChromeとHappy DOMのinherit・背景ショートハンド・透明色の評価差をテスト基盤で補い、23件成功。修正ルールを除去すると元の2症状が戻る変異検証と、Appliedの既存インライン/コードブロック配色を維持する確認を追加。実画面は375/1440px×明暗の4条件で全85表と全6コードが成功。描画HTMLの比較対象は16ガイド（初期の17という記載を訂正）。次に全体回帰テストを実行する。


## ガイドの表ホバー・参照コード配色修正（2026-10-24）

配色レビュー修正完了。共通proseのOSダーク配色が固定配色のガイドへ混入することが原因。ISC2 CCの全85表ホバーと[S番号]・プライベートIP・CIDR・マスク記号の6コード、他6ガイドの表ホバー、Applied Cryptographyの[S1]を修正。各ガイドのスコープ内のみ変更し、原本の縞模様と既存コードテーマを保持。新規回帰23件と全1212件/196ファイル成功（499,187 expect）、lint・型チェック成功。原本なし環境でも新規23件成功。Chrome実画面375/1440px×明暗4条件で全85表と6コードを確認。16ガイド×明暗の共通CSS比較は差分0。さらに修正7ガイドの全表セルを明暗14条件（8146セル評価）で検証し、固有の背景・縞模様の変化なし。ビルド未実行。修正コミット `6399898`。

調査記録: `docs/migration-inventory/guide-readability-review.json`。

再開時: ユーザーの実画面で残る指摘があれば再現テストを先に追加。npm使用・ビルド禁止を継続する。


## CISSP移行履歴

CISSP移行Red（2026-10-24）: 原本の棚卸し完了。18節・147見出し・143表2214セル・42図・108リスト項目・15解答・11チェック・25参考文献。専用9ファイル・66件を追加し、未実装による65失敗/1成功・1ロードエラーを確認。実装は未着手。npm使用・ビルド禁止・目視はユーザー担当。

CISSPの追加検証（2026-10-24）: 原本のないCIでも移行漏れを検出できるよう、全18節とヒーロー・ブランド・目次・フッターの構造SHA-256を固定した22テストを追加。専用テストは合計93件/10ファイル。追加22件成功。


<!-- cissp-migration-status -->
## CISSP移行（2026-10-24）

CISSP: `/docs/cissp-guide` へ全18節・147見出し・143表2214セル・42図・108リスト項目・15解答・11チェック項目・25参考文献を移行し、HTML/Markdown原本を `archive/security-certifications/` へ両SHA-256一致でアーカイブ済み。専用97件/11ファイル成功。原本なし隔離環境でも55成功/42skip/0失敗（全18節とヒーロー・目次等の構造ハッシュ22件を含む）。全CSS宣言とmedia条件、5幅×明暗の計算済みCSS、丸点・番号・カウンター・図の自然幅と横スクロール、全143表と全ページのhydration、目次・図・確認問題・チェック操作を検証。全体1309成功/0skip/0失敗（207ファイル、503,825 expect）。共通ナビ・ホーム・静的検索は30ページ。既存CCIE/CCSTの資格ナビ期待値もCISSP登録に同期。npm経由のテスト・lint・型チェック成功。Next.js開発サーバーでHTTP 200と配信本文の件数一致を確認。Next.jsビルド禁止・未実行、目視はユーザー担当・未確認。移行Green `4c9fbee`、アーカイブGreen `2e279ff`。

配置: `security-docs/src/app/docs/cissp-guide/page.mdx`。台帳: `docs/migration-inventory/cissp-guide.json`。目視確認表: `docs/migration-inventory/cissp-guide-review.md`。原本: `archive/security-certifications/Cissp-guide.html` / `archive/security-certifications/Cissp-guide.md`（Git管理外）。
<!-- /cissp-migration-status -->

CISSP原本アーカイブRed（2026-10-24）: 移動前に4テストを追加し、ルート残存と比較パスの2失敗・原本移動待ちの独立ハッシュ2skipを確認。専用登録97件/11ファイル。次にHTML・Markdownを内容不変でarchive/security-certificationsへ移動する。

CISSP全体検証の履歴（2026-10-24）: 初回1306成功/3失敗の内訳は、既存CCIE/CCSTナビの固定期待値2件と、並行負荷時の既存Applied Cryptography CSSテストの5秒タイムアウト1件。ナビは既存項目の順序・内容を維持してCISSPを追加し、独立テスト13件＋8件で成功を確認。最終実行はアサーションを変更せず `npm test -- --timeout 30000` で全1309件/207ファイル成功・0skip・0失敗、503,825 expect。lint・型チェック成功。ビルド未実行。


## ISO27001 HTML更新履歴

ISO27001 HTML更新・前半Red（2026-10-24）: 既存 /docs/iso-iec-27001-2022-guide の更新。HTML棚卸し17章・66見出し・36表845セル・13図・40リスト項目・16チェック・43出典。前半0〜5章と表示基盤の新規28件/4ファイル（既存6件を含め専用34件登録）。失敗実行は1成功/22失敗/1ロードエラー、目次6件は未実装モジュールのため未ロード。全体登録1337件/211ファイル、直前の全体Greenは1309件/207ファイル。HTML正本で既存画面を更新し、旧Markdown原本を保護する版別archiveを使用。npm指定・ビルド禁止・目視はユーザー担当。


<!-- iso27001-html-status -->
## ISO27001 HTML画面更新（2026-10-24）

ISO27001 HTML更新: 既存 `/docs/iso-iec-27001-2022-guide` を元HTMLの全17章・66見出し・36表845セル・13図・40リスト項目・16チェック項目・43出典カードで更新。独自の丸点・丸囲み番号とグループ別チェック番号、全CSS/media、5幅×明暗のCSS、全845セルのホバー、全表とページのhydration、目次・図・チェック操作を検証。全17章とヒーロー/目次/フッター等22構造SHA-256は原本なしでも検証する。専用100件/12ファイル成功。原本なし隔離環境59成功/41skip/0失敗。全体1403成功/0skip/0失敗（218ファイル、507,982 expect）。既存30ルートとナビ表示名を維持し、静的/動的検索の66見出しを同期。原本は `archive/standards/iso-iec-27001-2022-guide-2026-10-24/` 内へHTML/Markdownを両SHA-256一致でアーカイブ済み。内容の異なる以前のMarkdown（`archive/standards/Iso-27001-2022-beginner-guide.md`）もハッシュ不変で保持。npm経由のテスト・lint・型チェック成功。既存開発サーバーのHTTP 200で全件数と22構造ハッシュの一致も確認。ビルド禁止・未実行、目視はユーザー担当・未確認。前半Green `05756c9`、後半Green `db5f859`、アーカイブGreen `a213e46`。

配置: `security-docs/src/app/docs/iso-iec-27001-2022-guide/page.mdx`。原本のdark配色を専用CSSで保持。台帳: `docs/migration-inventory/iso-iec-27001-2022-guide.json`。目視確認表: `docs/migration-inventory/iso-iec-27001-2022-guide-review.md`。
<!-- /iso27001-html-status -->

ISO27001 HTML更新・後半Red（2026-10-24）: 後半6〜16章、全章構造の固定SHA-256、全36表845セル、出典/引用/強調/リンク、16チェック操作、全ページhydration、5画面幅×明暗CSSと表ホバーの新規61件を追加。既存Markdown用の2テストもHTML正本の主要事実・URL検証へ更新。専用95件/11ファイルは49成功/46失敗。全体登録1398件/217ファイル、未移行の後半・共有CSS混入・検索索引未更新を検出。次に後半全文とCSS隔離を実装。

ISO27001 HTML更新・アーカイブRed（2026-10-24）: 原本アーカイブ5件を追加。ルート残存・比較パス2失敗、移動先のHTML/Markdownハッシュ2skip、既存Markdown非上書き1成功。専用100件/12ファイル登録、全体1403件/218ファイル登録。新しい版別フォルダーへ今回のHTML/Markdownを移し、内容の異なる既存Markdownを保持する。

<!-- csslp-status -->
## CSSLP移行（2026-10-24・移行完了時の記録。最新デザインと実測は次節）

CSSLP: `/docs/csslp-guide` へ全16章・130見出し・97表1566セル・16図・3コード・16参考ソースを移行し、HTML/Markdown原本を `archive/security-certifications/` へ両SHA-256一致でアーカイブ済み。専用87件/11ファイル成功。原本なし隔離環境53成功/34skip/0失敗（全16章とブランド/ヒーロー/目次の19構造ハッシュは原本なしでも検証）。全CSS宣言/media、5幅×明暗のCSS、丸点・番号・参考番号、全97表のホバー、目次/図操作、全表とページのhydrationを検証。全体1490成功/0skip/0失敗（229ファイル、510,667 expect）。資格ナビ・ホーム・静的/動的検索は31ページ・CSSLPの130見出しを収録。npm経由テスト・lint・型チェック成功。Next.js開発サーバーのHTTP 200で全15件数項目と19構造ハッシュの一致も確認。ビルド禁止・未実行、目視はユーザー担当・未確認。移行Green `d53c0ed`、アーカイブGreen `db89d6e`、ホバー修正Green `4565411`。

TDD履歴: 移行Red `26841dc` → Green `d53c0ed`、アーカイブRed `eb7bb8f`（2失敗/2skip）→ Green `db89d6e`、全表ホバーRed `4e122e9`（4失敗）→ Green `4565411`。テスト・実装・文書同期を分離コミット。

次の確認: ユーザーが `docs/migration-inventory/csslp-guide-review.md` に沿って目視。原本の番号付き本文リストは0個。本文の丸点5リスト16項目・目次章番号・16参考ソース番号を保持し、ネイティブ番号の表示も検証。原本の不正なヒーローp入れ子は、ブラウザーの修復結果と同じ兄弟要素へ正規化して全テキストを保持。
<!-- /csslp-status -->

<!-- csslp-design-status -->
## CSSLP練習問題・図解デザイン改善（2026-10-24）

CSSLPデザイン改善: 第13章の全10問を番号・設問・40選択肢に分けたカードへ整理。スマートフォンは1列、768px以上は2列の選択肢。解答欄はネイティブdetailsの開閉を保持し、正解バッジと内部フォーカスリングを整備。全16図へ図番号・内容別タイトル・種類表示を追加し、描画面・角丸ノード・曲線の矢印・サンセリフ体・配色を統一。小さい補助文字のコントラスト比4.5以上を検証。図の自然幅・中央寄せ・左端からの横スクロール・遅延描画・再試行・テキスト説明を保持。原文・正解・図定義・両原本のSHA-256は不変。第13章の装飾spanのみ透過した全19構造ハッシュ、問題文10件の固定ハッシュ、全40選択肢、3幅のデザインを検証。他章は5幅×明暗の原本CSS比較を継続。専用96件/12ファイル成功、原本なし隔離環境62成功/34skip/0失敗。全体1499成功/0skip/0失敗（230ファイル、511,065 expect）。npm test・lint・型チェック成功。HTTP 200の配信HTMLで40選択肢・16図見出しと全件数・19構造ハッシュの一致を確認。Red `047a0b7` → Green `173382a`、文字コントラストRed `395d578` → Green `6c2ef93`。ビルド禁止・未実行、目視はユーザー担当・未確認。
<!-- /csslp-design-status -->

## 依存監査・レビュー対応（2026-10-24）

- CI `bun audit` のhigh 2件を解消: `happy-dom` / `@happy-dom/global-registrator` を `^21.0.4`（GHSA-834v-8h66-3h79）、`overrides` に `zod` 4.6.7（GHSA-mrhx-c7xc-m3w5、`eslint-config-next` 経由）。コミット `11fd629`。
- CISSP: `describeDiagram` が `G -- はい --> C` のような引用符なしの日本語中間ラベルを読めず、d0の分岐2本が説明から欠落していた。ノード置換後に中間ラベルを引用符付きへ正規化。全42図の説明を修正前と比較し、変化はd0のみ。Red `5a23b04` → Green `3b52839`。
- ISO27001: 目次ボタンのクラスが `menuBtn` で、原本HTMLとCSSの `.menu-btn`（デスクトップ非表示・モバイル浮動表示）が適用されていなかった。Red `c2998ec` → Green `5ca6874`。
- ISO27001統合テスト: 検索インデックス全体の件数（31件）とCSSLP依存の件数検証を削除し、当該ルートの項目一致のみ検証（`628fe12`）。
- ISO27001図: 外側 `.mmd` の `role="img"` が内部のテキスト説明 `<details>` と描画状態を読み上げから隠していた。外側を常に `role="group"`＋aria-label、描画済みSVGの表示領域に `role="img"`＋aria-label。原本は13図とも `role="img"` のため、台帳 `allowedDifferences` に意図的なa11y差分として記録し、比較処理は原本側の img のみ group へ読み替え。固定構造ハッシュ10章（ch0/1/3/5/7〜12）を再計算し、group→img の逆変換で旧ハッシュ22件すべてと一致（変化はroleのみ）を確認。原本なし隔離環境61成功/41skip/0失敗。Red `b997359` → Green `dd0edee`。
- 全体1502成功/0失敗（230ファイル、511,077 expect）。lint・型チェック成功。ビルド禁止・未実行。push未実施。

<!-- cyberops-migration-status -->

## CyberOps Associate移行（2026-10-24）

移行・アーカイブ完了: `/docs/cyberops-associate-guide`。全12章・76小節（section計88）・153見出し・135表2706セル・42図・6コード・本文26リスト118項目・36チェック・25問100選択肢を保持。全CSS/media・丸点/番号カウンター・5幅×明暗・全セルホバー・全表/ページhydration・採点3評価帯/解答表示/両リセット・目次/チェック/図操作を検証。専用80件/10ファイル、原本なし隔離環境48成功/32skip/0失敗。全体1582成功/0skip/0失敗（240ファイル、534,027 expect）。資格ナビ・ホーム・静的/動的検索は32ページ（全153見出しを収録）。ロジック単位96/96（従来91＋GuideSidebar/GuideRuntime/MermaidFigure/GuideIcon/CodeSample）。HTML/Markdownを `archive/security-certifications/` へ両SHA-256一致でアーカイブ済み（Git管理外）。npm test・lint・型チェック成功。HTTP 200配信HTMLも16件数/16構造ハッシュ一致。表示基盤Red e694e3e→Green a8caf1e、本文Red b407224・ホバーRed d17d525→Green 451d28d、アーカイブRed 9b206d1→Green 8980a07。目視確認表: `docs/migration-inventory/cyberops-associate-guide-review.md`。ビルド禁止/未実行、目視はユーザー担当/未確認。

配置: `security-docs/src/app/docs/cyberops-associate-guide/page.mdx`。台帳: `docs/migration-inventory/cyberops-associate-guide.json`。npm使用・ビルド禁止/未実行・目視はユーザー担当/未確認。

<!-- /cyberops-migration-status -->

<!-- cyberops-hover-status -->

## CyberOps表ホバー修正（2026-10-25）

ホバー修正完了。Red 17a2859 → Green 38f4aba（専用CSSのみ）。強化した単体7件成功、CyberOps専用83件/10ファイルを含む全体1585成功/0skip/0失敗（240ファイル、520,277 expect）。原本なし隔離環境51成功/32skip/0失敗。実Chromeは375/1440px×明暗4条件・全135表2706セル（合計10824セル条件）の背景/文字/罫線変化0セル、実ポインターの奇数/偶数行12チェックも成功。修正前は全4条件で各1253セルの背景変化を検出。未解決Tailwind importをテスト用CSSから除去し、共通ホバールールの読込ガードを追加。製品CSSのimportや共通ホバーは変更せず、他ガイドへの適用もない。HTML/Markdown原本・本文・構造ハッシュは不変。npm test・lint・型チェック成功。ビルド未実行。

共通 `.prose tr:hover td` が専用 `td` より高い詳細度を持つため、OSダーク設定で背景 #18181b / 文字 #161B26 となっていた。Happy DOM用CSSに未解決のTailwind importを残すと共通ルールを評価できないため、テスト用にimportだけを除去する。実ブラウザー検証: Playwrightが利用可能な環境で `npm exec --package=playwright --call "node src/app/docs/cyberops-associate-guide/hover.browser.mjs"`（security-docs内、起動済み開発サーバーを使用）。`PLAYWRIGHT_MODULE_PATH` / `CHROME_PATH` / `DOCS_BASE_URL` も指定可。npm使用・ビルド禁止/未実行・目視はユーザー担当。

<!-- /cyberops-hover-status -->

<!-- cyberops-professional-status -->

## CyberOps Professional移行（2026-10-25）

移行・アーカイブ完了: `/docs/cyberops-professional-guide`。全134本文ブロック・135見出し・122表2051セル・42図・20コード（8言語表記）・15確認問題と解答・61参考文献・57ul/14ol/190項目を保持。原本比較＋全137固定構造SHA-256・全20コードの改行/空白SHA・全CSS/media・5幅×明暗の計算済みCSS・全表/ページhydration・目次と問題の個別/一括開閉を検証。Chromeは375/1440px×明暗4条件で全2051セルのホバー変化0、全190項目の金色丸点/丸囲み番号/14カウンターリセット、実ポインター12チェックが成功。専用330件/12ファイルを含む全体1920成功/0skip/0失敗（252ファイル、526,543 expect）。原本なし隔離環境175成功/155skip/0失敗。資格ナビ・ホーム・静的/動的検索は33ページ（全135見出しを収録）。ロジック単位101/101（従来96＋GuideSidebar/GuideRuntime/GuideIcon/MermaidFigure/CodeSample）。HTML/Markdownを `archive/security-certifications/` へ両SHA-256一致でアーカイブ済み（Git管理外）。HTTP 200実配信も16件数/137構造ハッシュ/20コードハッシュ一致。npm test・lint・型チェック成功。TDD: 表示基盤adf5aee→2fc814b、前半0eccd25→a3c179f、後半ae61e93→676fba2、アーカイブf427b65→c97a37d。目視確認表: `docs/migration-inventory/cyberops-professional-guide-review.md`。ビルド禁止/未実行、目視はユーザー担当/未確認。

配置: `security-docs/src/app/docs/cyberops-professional-guide/page.mdx`。台帳: `docs/migration-inventory/cyberops-professional-guide.json`。npm使用・ビルド禁止/未実行・目視はユーザー担当/未確認。

<!-- /cyberops-professional-status -->

<!-- threat-modeling-shostack-status -->

## Threat Modeling (Shostack) 移行（2026-10-25）

移行・アーカイブ完了: `/docs/threat-modeling-shostack-guide`。全17章（`section.chapter` 17）・82見出し（h1:1 / h2:17 / h3:60 / h4:4）・52表944セル（th:152 / td:792）・9図・2コード（JSON / YAML）・2演習解答（`details.answer`）・12注意欄（`.callout`）・22参考文献（`.ref-card`）・77目次リンク（17グループ）・81固有IDを保持。原本比較＋全22固定構造SHA-256（`.hero`/`.brand`/`.sidebar nav`/`.sidebar-foot`/`.footer`＋17章）・全2コードの改行/空白SHA・全CSS/media・5画面幅（375/768/980/1024/1440px）×明暗両配色の計算済みCSS・リスト丸点（`ul li::before`）と番号（`ol`）・ステップバッジ・空セルダッシュ表示・全944セルホバー（`#0b1a2e`）・インラインcode継承・全52表とページ全体のhydration・目次操作/フォーカストラップ/hashchange/スクロールスパイ・Mermaid遅延描画/110px余白/再試行/テキスト説明を検証。専用98件/12ファイルを含む全体2018成功/0skip/0失敗（264ファイル、544,760 expect）。原本なし隔離環境は専用60成功/38skip/0失敗。Security Guidesナビ・ホーム・静的/動的検索は34ページ（全82見出しを収録）。ロジック単位105/105（従来101＋GuideSidebar/GuideIcon/MermaidFigure/CodeSample）。HTML/Markdownを `archive/security-guides/` へ両SHA-256一致でアーカイブ済み（Git管理外）。npm test・lint・型チェック成功。TDD: 段階1（表示基盤）Red `aede778` → Green `ea1c415`、段階2（第1〜8章）Red `0c3a089` → Green `c36c81d`、段階3（第9〜17章・統合・スタイル・可読性）Red `39158e8` → Green `5259c9e`、段階4（原本アーカイブ）Red `b0cde59` → Green `37b12b2`。目視確認表: `docs/migration-inventory/threat-modeling-shostack-guide-review.md`。ビルド禁止/未実行、目視はユーザー担当/未確認。

配置: `security-docs/src/app/docs/threat-modeling-shostack-guide/page.mdx`。台帳: `docs/migration-inventory/threat-modeling-shostack-guide.json`。原本: `archive/security-guides/Threat-modeling-shostack-guide.html` / `archive/security-guides/Threat-modeling-shostack-guide.md`。npm使用・ビルド禁止/未実行・目視はユーザー担当/未確認。

<!-- /threat-modeling-shostack-status -->

## Ghost in the Wires 移行（2026-10-25）

2026-10-25 Ghost in the Wires: `/docs/ghost-in-the-wires-guide` 移行・原本アーカイブ完了。全17節・58見出し・20表332セル・65リスト項目・年表10項目・8解答・41出典・6図を保持。専用91件/8ファイルを含む全体2109成功/0skip/0失敗（272ファイル、548,280 expect）。原本なし隔離環境55成功/36skip/0失敗。実配信HTTP 200で16件数/21構造SHA-256一致。Chrome 5幅×明暗10条件で文字・リスト点/番号・年表・全332セルホバー差分0。375/1440pxで6図の実SVG描画と左右スクロール、目次、8解答、smooth/reduced-motionを操作し実行時エラー0。原本HTML/Markdownは `archive/security-guides/` に両SHA-256一致で保存（Git管理外）。Security Guides・ホーム・静的/動的検索35ページへ登録。ロジック単位108/108。npm test・lint・型チェック成功。ビルド禁止/未実行・目視はユーザー担当/未確認。

配置: `security-docs/src/app/docs/ghost-in-the-wires-guide/page.mdx`。TDD: 表示基盤cd22987→b82025d、本文9110dd5/8d8ef36→d2b15dc、アーカイブ3ddf7b5→23c8512、目次補完801f666→8b993ad。台帳: `docs/migration-inventory/ghost-in-the-wires-guide.json`。目視確認表: `docs/migration-inventory/ghost-in-the-wires-guide-review.md`。

<!-- hacking-exploitation-status -->
## Hacking: The Art of Exploitation移行（2026-10-25）

2026-10-25 Hacking: The Art of Exploitation: 原本アーカイブRed・新規4件すべて失敗。移動前のHTML/Markdown SHA-256を固定。本文専用79件＋既存ISO基盤5件成功（前記8件は集計記載誤りのため訂正）。全登録2192件/281ファイル。原本移動・遅延参照切替・原本なし隔離テストを次に実施。原本は12章・68見出し・20表341セル・8図・Cコード2件・参考文献21件・7注意欄・18リスト項目。npm使用、ビルド禁止/未実行、目視はユーザー担当/未確認。

配置予定: `security-docs/src/app/docs/hacking-art-of-exploitation-guide/page.mdx`。台帳: `docs/migration-inventory/hacking-art-of-exploitation-guide.json`。
<!-- /hacking-exploitation-status -->

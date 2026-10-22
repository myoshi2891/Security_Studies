# Security Studies — Progress Tracker

> **最終更新**: 2026-10-23（Bulletproof TLS and PKI移行・専用41件成功・全体615成功/297 skip/0失敗）
> **ブランチ**: `dev` → `main` マージ済み (#34)
> **デプロイ**: Netlify 自動デプロイ（`main` push トリガー）

---

## カテゴリー別ステータス

### 🧪 テスト

| 指標 | 状態 | 詳細 |
|---|---|---|
| テストケース総数 | **615成功 / 297 skip / 0失敗** | npm test実測（2026-10-23）・152ファイル・912件・160,218 expect。297 skipは既存ガイド原本不在による。 |
| テストファイル数 | **152ファイル** | 原本比較・ページ移行テストを含む |
| File Unit Coverage | **68/68 (100%)** | 従来64 + TLS/PKI部品4（GuideSidebar / MermaidFigure / GuideIcon / GuideCode）。純粋データ・MDXは分母外。全152テストファイルとは別集計 |
| Strategy Coverage | **17.5%** | 40カテゴリ×ドメインセル中 7セル相当 |
| CI | ✅ **稼働中** | GitHub Actions（lint / types / test --coverage）。パス除外なし。原本がない場合のみsourceTestがskip。今回の297 skipは既存ガイド原本不在による |
| カバレッジレポート | ✅ **設定済み** | CIはlcov生成・Codecov送信を試行（continue-on-error）。`bunfig.toml` の `coveragePathIgnorePatterns` で原本依存テスト基盤 `fidelity-helpers.ts` を対象外（CIでは構造的に未実行のため）。archive/なしworktreeでISO3ガイドのMermaidFigure未カバー行0を確認 |

#### ファイル別テスト数（既存行は各移行時の記録。最新実測は上記およびISO18045欄）

| ファイル | テスト数 | 備考 |
|---|---|---|
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
| `src/app/docs/iso-iec-27001-2022-guide/page.test.ts` | 6 | 2026-10-17 追加・ISO/IEC 27001:2022ページ登録・検索契約（Red `bc8b7b2` → Green `3061d16`） |

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

| `CLAUDE.md` | 2026-10-15 | WAHH全節・ホーム/ナビ/検索・原本アーカイブ・WAHH完了時点の538件/専用74件を同期 |
| `GEMINI.md` | 2026-10-15 | WAHH全節・ホーム/ナビ/検索・原本アーカイブ・WAHH完了時点の538件/専用74件を同期 |
| `README.md` | 2026-10-15 | WAHH全節・ホーム/ナビ/検索・原本アーカイブ・WAHH完了時点の538件/専用74件を同期 |
| `security-docs/CLAUDE.md` | 2026-10-15 | WAHH全節・ホーム/ナビ/検索・原本アーカイブ・WAHH完了時点の538件/専用74件を同期 |
| `security-docs/README.md` | 2026-10-15 | WAHH全節・ホーム/ナビ/検索・原本アーカイブ・WAHH完了時点の538件/専用74件を同期 |
| `docs/test-coverage-dashboard.html` | 2026-10-15 | WAHH全節・ホーム/ナビ/検索・原本アーカイブ・WAHH完了時点の538件/専用74件を同期 |
| `docs/progress.md` (本ファイル) | 2026-10-15 | WAHH完了、WAHH完了時点の538件・全85ファイルの実測件数と目視待ちを同期 |
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

原本は `archive/html/Secure-by-design-guide.html` と `archive/md/Secure-by-design-guide.md` に内容変更なしで保存。npm経由でBunを実行。ビルド禁止。目視確認はユーザー担当。

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

原本保存先: `archive/html/Secure-by-design-guide.html` / `archive/md/Secure-by-design-guide.md`。Next.js本文・検索アセットは変更なし。今後の移行比較はarchiveのHTMLを正本として実行する。配置換えのためTDD規約のリファクタリング手順を適用し、移動前後に既存全テストを実行した。

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
- HTML/MD原本は `archive/html/Mitre-atlas.html` / `archive/md/Mitre-atlas.md`。SHA-256一致、本文・情報基準日変更なし。新規6テストファイルに39件、既存searchテストに4件追加。
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
原本: `archive/html/Ccie-security-guide.html` / `archive/md/Ccie-security-guide.md`。HTML・MD双方のSHA-256が移動前後で一致。
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
- HTML/Markdown原本は `archive/html/Hacking-kubernetes-guide.html` / `archive/md/Hacking-kubernetes-guide.md` に移動し、ハッシュ不変を検証。原本アーカイブHEAD: `25a5ea1`。棚卸し: `docs/migration-inventory/hacking-kubernetes.json`。
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
- 原本: `archive/html/Web-application-hackers-handbook-guide.html` / `archive/md/Web-application-hackers-handbook-guide.md`。インベントリ: `docs/migration-inventory/web-application-hackers-handbook.json`。
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

- HTML: `archive/html/Applied-cryptography-guide.html`
- MD: `archive/md/Applied-cryptography-guide.md`
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
- 原本HTML/MDは `archive/html/Threat-modeling-guide.html`・`archive/md/Threat-modeling-guide.md` にバイト一致で移動。比較テストはアーカイブを直接参照。Shostack版は変更しない。
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

移行先: `security-docs/src/app/docs/iso-iec-15408-1-2026-guide/page.mdx`（URL `/docs/iso-iec-15408-1-2026-guide`）。原本は `archive/html/Iso-15408-1-2026-guide.html` / `archive/md/Iso-15408-1-2026-guide.md` にバイト一致で移動済み。`archive/` は既存規約どおりGit管理外。

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

移行先: `security-docs/src/app/docs/iso-iec-27017-2026-guide/page.mdx`（URL `/docs/iso-iec-27017-2026-guide`）。全17節・57見出し・30表（463セル）・10図・2コード・44リスト項目・7チェック項目・7 Q&A・18参考文献を原本と照合。全CSS宣言と375/1100/1440px・両配色の本文/表/リスト等の計算済みスタイルを比較。箇条書きの点、番号、チェックカウンター、選択/フォーカス表示、コード文字列とローカルハイライト、目次操作、図の描画/再試行、表・全ページhydrationを検証。原本: `archive/html/Iso-27017-2026-guide.html` / `archive/md/Iso-27017-2026-guide.md`（SHA-256一致・既存規約どおりGit管理外）。ナビと検索23ページに登録。台帳: `docs/migration-inventory/iso-iec-27017-2026-guide.json`。目視確認表: `docs/migration-inventory/iso-iec-27017-2026-guide-review.md`。

<!-- /iso27017-status -->

### ISO27017 完了・目視引継ぎ（2026-10-22）

- 表示基盤・0〜5節・6〜11節・12〜16節・ナビ検索・原本アーカイブごとにRed→テストコミット→Green→実装コミット→別の文書同期コミットを実施。
- 次の対応: 専用目視確認表に沿ってユーザー確認。指摘があれば失敗テストから修正。ビルド・push・公開は未実施。

<!-- iso18045-status -->

ISO/IEC 18045:2026: 移行・原本アーカイブ・最終自動検証完了。専用56件/10ファイル成功。全体568 pass / 297 skip / 0 fail、146ファイル（865件、158,174 expect）。npm test・npm run lint・npm run types:check成功。Next.jsビルド禁止・未実行。目視はユーザー担当・未完了。push・公開未実施。

移行先: `security-docs/src/app/docs/iso-iec-18045-2026-guide/page.mdx`（URL `/docs/iso-iec-18045-2026-guide`）。全21節・77見出し・40表（830セル）・18図・98信頼度タグ・28参考文献を原本と照合。全CSS宣言、375/1100/1440px・両配色の本文/全表セル/タグ等の計算済みスタイル、リストの点・番号の定義を検証。18図の定義・配色・sequence/pie設定・円グラフ全11値、目次操作、図の描画/再試行、表・全ページhydrationを検証。共通CSSによるダーク配色の見出し色混入を修正。原本: `archive/html/Iso-iec-18045-2026-guide.html` / `archive/md/Iso-iec-18045-2026-guide.md`（SHA-256一致・既存規約どおりGit管理外）。ナビと検索24ページに登録。台帳: `docs/migration-inventory/iso-iec-18045-2026-guide.json`。目視確認表: `docs/migration-inventory/iso-iec-18045-2026-guide-review.md`。

<!-- /iso18045-status -->

### ISO18045 完了・目視引継ぎ（2026-10-22）

- 表示基盤・0〜6節・7〜13節・14〜20節・ナビ検索/見出し色・原本アーカイブごとにRed→テストコミット→Green→実装コミット→別の文書同期コミットを実施。
- 次の対応: 専用目視確認表に沿ってユーザー確認。指摘があれば失敗テストから修正。ビルド・push・公開は未実施。


## Bulletproof TLS and PKI 移行（2026-10-23）

Bulletproof TLS and PKI: `/docs/bulletproof-tls-pki-guide` へ移行。全15節・57表868セル・24図・12コード・10チェック項目・4解答を原本照合。専用41件/6ファイル成功。全体615 pass / 297 skip / 0 fail（912件・152ファイル・160,218 expect）。npm test・npm run lint・npm run types:check成功。Next.jsビルド禁止・未実行。目視はユーザー担当・未完了。原本HTML/MDはルートに保持。

- Red `65cbdea`: 原本照合19件失敗 → Green `0ec3286`: 全15節・CSS・ナビ検索移行。
- Red `a7ad9fd`: 図の配色・sequence設定欠落を再現 → Green `da37f69`: 原本設定復元、41件成功。
- Refactor検証: npm run lint / npm run types:check成功。追加リファクタリング不要。
- 24図のMermaid構文を実エンジンで解析成功。375/768/1024/1025/1440pxのリスト番号・余白・目次・図スクロール、操作とhydrationを自動検証。
- 作業開始時の実測は574成功/297 skip/0失敗・146ファイル（871件）。旧トップ集計571件との差分も今回の最終実測で同期。過去の移行記録の数値は当時の実測として保持。
- 仕様書7ファイル・台帳・目視確認表を同期。目視確認後の公開は未実施。


<!-- zero-trust-stage -->
Zero Trust本文全節Green（2026-10-23）: 専用28成功/0失敗・3ファイル。全25節・83表1344セル・17図・3コード・90STEP・36解答・20出典を原本と構造比較。次に操作・適用スタイル・hydration・ナビ検索を統合検証。全体の最終Greenは615成功/297 skip/0失敗・152ファイル。ビルド未実行。
<!-- /zero-trust-stage -->

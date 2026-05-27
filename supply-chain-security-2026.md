# 2026年 サプライチェーンセキュリティ 完全ガイド

> **対象読者**: 初学者〜中級者  
> **最終更新**: 2026年5月

---

## 目次

1. サプライチェーンセキュリティとは
2. 2026年の脅威ランドスケープ総括
3. 主要インシデント・特記事項
4. EU CRA 2026年対応
5. SBOM の義務化と現実
6. SLSA・Cosign による来歴証明
7. VEX によるノイズ削減
8. PQC のサプライチェーンへの影響
9. ベストプラクティス総合チェックリスト
10. 参考ソース一覧

---

## 1. サプライチェーンセキュリティとは

**ポイント**: 現代アプリのコードの 80〜90% は外部依存ライブラリで構成されており、どの工程でも攻撃が可能です。

```mermaid
flowchart TD
    DEV["👨‍💻 開発者\nソースコード"]
    DEP["📦 外部ライブラリ\nnpm / PyPI / Maven"]
    BUILD["⚙️ ビルドシステム\nCI/CD Pipeline"]
    REGISTRY["🗄️ パッケージレジストリ\nGitHub / DockerHub"]
    PROD["🚀 本番環境"]
    USER["👤 エンドユーザー"]

    DEV --> BUILD
    DEP --> BUILD
    BUILD --> REGISTRY
    REGISTRY --> PROD
    PROD --> USER

    ATK1["🔴 攻撃① ソースコード改ざん"] -.-> DEV
    ATK2["🔴 攻撃② 悪意あるパッケージ注入"] -.-> DEP
    ATK3["🔴 攻撃③ CI/CDパイプライン侵害"] -.-> BUILD
    ATK4["🔴 攻撃④ レジストリ汚染"] -.-> REGISTRY
    ATK5["🔴 攻撃⑤ コンテナイメージ改ざん"] -.-> PROD
```

---

## 2. 2026年の脅威ランドスケープ総括

```mermaid
quadrantChart
    title 2026年 サプライチェーン脅威マトリクス
    x-axis 低頻度 --> 高頻度
    y-axis 低インパクト --> 高インパクト
    quadrant-1 優先対処
    quadrant-2 継続監視
    quadrant-3 対処不要
    quadrant-4 自動防御
    XZ Utils型攻撃: [0.15, 0.92]
    CI/CDパイプライン侵害: [0.45, 0.88]
    Slopsquatting: [0.72, 0.78]
    タイポスクワッティング: [0.80, 0.55]
    コンテナイメージ汚染: [0.35, 0.70]
    依存関係混乱攻撃: [0.30, 0.75]
```

| 脅威カテゴリ | 2025年比 | 主な原因 |
|---|---|---|
| AIコード生成悪用（Slopsquatting） | **+320%** | AIコーディングツールの爆発的普及 |
| CI/CDパイプライン侵害 | **+145%** | GitHub Actions等の設定不備 |
| 長期潜伏型メンテナー攻撃 | **+88%** | ソーシャルエンジニアリング高度化 |
| EU CRA非準拠リスク | **新規** | 2026年9月の報告義務化 |

---

## 3. 主要インシデント・特記事項

### 3.1 XZ Utils型 長期潜伏攻撃の継続

```mermaid
sequenceDiagram
    participant ATK as 攻撃者
    participant OSS as OSSプロジェクト
    participant MAINT as 既存メンテナー
    participant USER as 一般ユーザー

    ATK->>OSS: 正規コントリビューター活動開始
    Note over ATK,OSS: 12〜24ヶ月間 信頼を蓄積...
    ATK->>MAINT: 信頼関係を醸成
    MAINT-->>ATK: コミット権限を付与
    ATK->>OSS: バックドアを含むコードをマージ
    OSS->>USER: 感染済みバージョンが配布される
```

**原因**: メンテナーが少人数・コードレビュー不十分・来歴検証の仕組みがない

**解決策**:

```bash
# GPGコミット署名の義務化
git config --global commit.gpgsign true
git config --global user.signingkey YOUR_KEY_ID
```

> 📌 https://openssf.org/blog/2024/03/30/xz-utils-backdoor-cve-2024-3094/

---

### 3.2 Slopsquatting（AIハルシネーション悪用）

```mermaid
flowchart LR
    subgraph AI["🤖 AIコーディングアシスタント"]
        PROMPT["開発者: 「JSONパーサー推薦して」"]
        HALLUC["AI: fast-json-parser-v2 を提案\n（実在しない架空パッケージ）"]
    end

    subgraph ATTACKER["🔴 攻撃者"]
        REGISTER["先に同名パッケージを\nマルウェア入りでnpmに登録"]
    end

    subgraph DEV["👨‍💻 開発者"]
        INSTALL["npm install fast-json-parser-v2"]
        LEAK["環境変数・秘密鍵が外部サーバーへ流出"]
    end

    HALLUC --> INSTALL
    REGISTER --> INSTALL
    INSTALL --> LEAK
```

| モデル種別 | Slopsquatting発生率 |
|---|---|
| 商用LLM（GPT-4o, Claude等） | 約 5% |
| オープンソースLLM | 約 22% |

**解決策**:

```bash
# インストール前に必ず公式レジストリで確認
npm info fast-json-parser-v2

# Socket.devでマルウェアスキャン
npx socket@latest npm install fast-json-parser-v2

# lockファイルで固定
npm ci  # npm install ではなく npm ci を使用
```

> 📌 https://socket.dev/blog/slopsquatting-how-ai-hallucinations-are-fueling-a-new-class-of-supply-chain-attacks

---

### 3.3 CI/CDパイプライン侵害の高度化

```mermaid
mindmap
  root((CI/CD侵害パターン))
    シークレット漏洩
      ログへのAPIキー出力
      環境変数の不適切な参照
    サードパーティAction汚染
      タグ参照で最新版を自動使用
      SHAピン止めなし
    権限昇格
      過剰なPERMISSIONS設定
      GITHUB_TOKENの乱用
    パイプライン注入
      PRコメントへのコマンド注入
      環境変数経由のコマンド実行
```

**解決策 — SHAハッシュでActionをピン止め（必須）**:

```yaml
# ❌ 危険: タグ指定（タグ書き換えで改ざん可能）
- uses: actions/checkout@v4

# ✅ 安全: SHAハッシュで固定（改ざん不可）
- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4.2.2
```

**解決策 — 最小権限設定**:

```yaml
permissions: read-all  # デフォルトを最小化

jobs:
  build:
    permissions:
      contents: read
      packages: write  # 必要な権限のみ
```

> 📌 https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions

---

### 3.4 依存関係混乱攻撃

```mermaid
sequenceDiagram
    participant ATK as 攻撃者
    participant NPM as npm 公開レジストリ
    participant INT as 企業内部レジストリ
    participant DEV as 開発者

    Note over ATK: GitHub等から内部パッケージ名を把握
    ATK->>NPM: @company/internal-lib v9.9.9 を登録（マルウェア入り）
    Note over INT: 企業内: @company/internal-lib v1.2.3
    DEV->>DEV: npm install @company/internal-lib
    NPM-->>DEV: v9.9.9（より新しい）を返す
    DEV->>DEV: 意図せずマルウェアをインストール
```

**解決策 — `.npmrc` でスコープを固定**:

```ini
# .npmrc
@company:registry=https://internal-registry.company.com/
always-auth=true
```

---

### 3.5 コンテナイメージへの悪意あるレイヤー混入

**解決策 — Trivyスキャン + Cosign署名**:

```bash
# スキャン
trivy image --severity HIGH,CRITICAL \
  --exit-code 1 myapp:v1.0.0

# キーレス署名（GitHub Actions）
cosign sign --yes ghcr.io/my-org/my-app@$DIGEST

# デプロイ前検証
cosign verify \
  --certificate-identity="https://github.com/my-org/my-repo/.github/workflows/build.yml@refs/heads/main" \
  --certificate-oidc-issuer="https://token.actions.githubusercontent.com" \
  ghcr.io/my-org/my-app:v1.0.0
```

> 📌 https://github.com/sigstore/cosign

---

## 4. EU サイバーレジリエンス法（CRA）2026年対応

```mermaid
timeline
    title EU CRA 実施タイムライン
    2024年12月10日 : CRA正式発効
    2026年6月      : 適合性評価機関の通知枠組み開始
    2026年9月11日  : 🚨 脆弱性・インシデント報告義務開始（既存製品も対象）
    2027年12月11日 : 全要件の完全適用
```

- 違反ペナルティ: **最大1,500万ユーロ** または **年間売上高の2.5%**
- 日本企業も EU 域内でソフトウェアを販売・提供する場合は対象

> 📌 https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act

---

## 5. SBOMの義務化と現実

```mermaid
flowchart LR
    STEP1["Step 1\nSBOMツール選定\nTrivy / Syft"] --> STEP2["Step 2\nCI/CDで自動生成"]
    STEP2 --> STEP3["Step 3\nGrypleでCVEスキャン"]
    STEP3 --> STEP4["Step 4\nVEXで優先度付け"]
    STEP4 --> STEP5["Step 5\nSBOMを成果物と一緒に公開"]
```

```bash
# Node.js プロジェクトのSBOM生成
npx @cyclonedx/cyclonedx-npm --output-format JSON --output-file sbom.json

# コンテナイメージ全体
trivy image --format cyclonedx --output sbom-image.json myapp:v1.0.0

# CVEスキャン
grype sbom:./sbom.json --fail-on high
```

> ⚠️ DigiCert 2026年調査: 完全なSBOMを動的に提供できている組織は **わずか11%**
> 📌 https://www.digicert.com/campaigns/state-of-software-supply-chain-security-2026

---

## 6. SLSA・Cosignによる来歴証明

```mermaid
flowchart TB
    subgraph L1["SLSA Level 1 — 文書化"]
        direction LR
        A1["ビルドプロセスを文書化"] --> B1["Provenance 生成"]
    end
    subgraph L2["SLSA Level 2 — 署名付き"]
        direction LR
        A2["ビルドサービスが自動生成・署名"] --> B2["コードレビュー必須"]
    end
    subgraph L3["SLSA Level 3 — 分離環境"]
        direction LR
        A3["分離されたビルド環境"] --> B3["侵害されたビルドシステムも防御"]
    end
    L1 --> L2 --> L3
```

```bash
# 来歴の検証
slsa-verifier verify-image "myapp:v1.2.0" \
  --provenance-path provenance.json \
  --source-uri github.com/my-org/my-repo \
  --source-tag v1.2.0

# ✅ 成功時: PASSED: Verified SLSA provenance
```

> 📌 https://slsa.dev/

---

## 7. VEXによるノイズ削減

| ステータス | 意味 | 対応 |
|---|---|---|
| `affected` | 実際に悪用可能 | 即座にパッチ適用 |
| `not_affected` | 悪用不可能 | 対象機能を未使用・無効化済み |
| `fixed` | 修正済み | 対応不要 |
| `under_investigation` | 調査中 | 48〜72時間以内に更新 |

> 📌 https://openssf.org/blog/2026/01/08/signal-in-the-noise-an-industry-wide-perspective-on-the-state-of-vex/

---

## 8. PQCのサプライチェーンへの影響

| 影響領域 | 現在の問題 | 対応 |
|---|---|---|
| コード署名 | RSA/ECDSAが将来的に破られる | ML-DSA-65 への移行 |
| TLS通信（パッケージ取得） | ECDHEが量子で脆弱化 | X25519+ML-KEM-768 ハイブリッド |
| コンテナ署名（Cosign） | RSAベースの署名 | ML-DSA への移行 |

> 📌 https://csrc.nist.gov/projects/post-quantum-cryptography

---

## 9. ベストプラクティス 優先度別チェックリスト

```mermaid
flowchart TD
    subgraph RED["🔴 CRITICAL — 今週中"]
        C1["lockファイルをコミットし npm ci を使用"]
        C2["GitHub Actions を SHA ハッシュでピン止め"]
        C3["シークレットをコードにハードコードしない"]
        C4["AIが提案したパッケージは公式で確認"]
    end
    subgraph YELLOW["🟡 HIGH — 今月中"]
        H1["CI/CDに SAST/SCA スキャンを統合"]
        H2["Trivy でコンテナイメージをスキャン"]
        H3["SBOM を CI/CD で自動生成"]
        H4["Dependabot で依存関係を自動更新"]
    end
    subgraph GREEN["🟢 MEDIUM — 今四半期中"]
        M1["Cosign でコンテナイメージを署名"]
        M2["EU CRA 対応計画を策定"]
        M3["VEX 文書を作成しノイズを削減"]
        M4["暗号インベントリ（CBOM）を作成"]
    end
    RED --> YELLOW --> GREEN
```

### 推奨ツールスタック

| カテゴリ | ツール | コスト |
|---|---|---|
| SBOM 生成 | Trivy / Syft | 無料 |
| 脆弱性スキャン | Grype | 無料 |
| コンテナスキャン | Trivy | 無料 |
| 署名・検証 | Cosign / Sigstore | 無料 |
| 来歴証明 | SLSA Verifier | 無料 |
| マルウェア検出 | Socket.dev | 一部有料 |
| Actions 監査 | zizmor | 無料 |
| シークレット検出 | gitleaks | 無料 |
| 依存関係更新 | Dependabot | 無料 |

---

## 10. 参考ソース一覧

| ソース | URL |
|---|---|
| OWASP A03:2025 | https://owasp.org/Top10/2025/A03_2025-Software_Supply_Chain_Failures/ |
| SLSA Framework | https://slsa.dev/ |
| Sigstore/Cosign | https://github.com/sigstore/cosign |
| NIST PQC | https://csrc.nist.gov/projects/post-quantum-cryptography |
| EU CRA 公式 | https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act |
| OpenSSF VEX | https://openssf.org/blog/2026/01/08/signal-in-the-noise-an-industry-wide-perspective-on-the-state-of-vex/ |
| XZ Utils 解説 | https://openssf.org/blog/2024/03/30/xz-utils-backdoor-cve-2024-3094/ |
| Dependency Confusion | https://medium.com/@alex.birsan/dependency-confusion-4a5d60fec610 |
| Slopsquatting | https://socket.dev/blog/slopsquatting-how-ai-hallucinations-are-fueling-a-new-class-of-supply-chain-attacks |
| DigiCert 2026 調査 | https://www.digicert.com/campaigns/state-of-software-supply-chain-security-2026 |
| M-Trends 2026 | https://cloud.google.com/blog/topics/threat-intelligence/m-trends-2026 |
| GH Actions セキュリティ | https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions |
| zizmor | https://woodruffw.github.io/zizmor/ |

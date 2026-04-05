# 2026年 ソフトウェアサプライチェーン攻撃 完全記録

> **最終更新**: 2026年4月4日  
> **対象期間**: 2026年2月〜4月  
> **重要度**: CRITICAL — 現在進行形の脅威

---

## 概要

2026年第1四半期、ソフトウェア開発エコシステムを標的にした史上最大規模のサプライチェーン攻撃が相次いで発生した。特に3月は、セキュリティスキャナー・AIライブラリ・通信SDK・そして週間1億ダウンロードを誇るHTTPクライアントが立て続けに侵害される前例のない事態となった。

### 被害規模サマリー

| インシデント | 影響パッケージ | 露出時間 | 推定影響環境数 |
|---|---|---|---|
| Trivy (GitHub Actions) | `trivy-action` 全76タグ | ~72時間 | 1,000+クラウド環境 |
| Checkmarx KICS | KICS全35タグ + AST Action | ~48時間 | 不明（大規模） |
| LiteLLM (PyPI) | `litellm==1.82.7/8` | ~5時間 | 95万+日次DL影響 |
| Telnyx Python SDK | `telnyx==4.87.1/2` | ~6時間 | 不明 |
| axios (npm) | `axios@1.14.1`, `axios@0.30.4` | ~3時間 | 135+ C2接触確認 |

攻撃者グループ **TeamPCP**（Trivy・LiteLLM・Telnyx・Checkmarx）と北朝鮮国家支援グループ **Sapphire Sleet**（axios）による2系統の攻撃が確認されている。

---

## 1. axios npm サプライチェーン攻撃（2026年3月31日）

### 基本情報

| 項目 | 詳細 |
|---|---|
| **攻撃日時** | 2026年3月31日 00:21〜03:15 UTC（約3時間） |
| **悪意あるバージョン** | `axios@1.14.1`、`axios@0.30.4` |
| **安全なバージョン** | `axios@1.14.0`、`axios@0.30.3` |
| **週間ダウンロード数** | 約1億回 |
| **帰属** | Sapphire Sleet（北朝鮮国家支援）/ UNC1069 / STARDUST CHOLLIMA / BlueNoroff |

### 攻撃の手口

#### Step 1 — メンテナーアカウントの乗っ取り

axiosのリードメンテナー `jasonsaayman` のnpmアカウントが侵害された。アカウントに紐付けられたメールアドレスが `ifstap@proton.me`（Protonmail）に変更され、攻撃者が完全な発行権限を取得した。MFAの状況は公式発表では明確にされていないが、フィッシングまたはクレデンシャルスタッフィングによるものとみられている。

#### Step 2 — 偽装依存関係の事前設置

攻撃の18時間前、`plain-crypto-js@4.2.0`（無害のデコイバージョン）がnpmレジストリに公開された。レジストリ履歴を持たせることで、後続の`@4.2.1`（悪意あるバージョン）の出現を自然に見せる目的があったと考えられる。

#### Step 3 — バックドアバージョンの公開

`axios@1.14.1`および`axios@0.30.4`が同時に公開された。両バージョンには`plain-crypto-js@4.2.1`への依存関係が追加されており、`package.json`の`postinstall`フックが`node setup.js`を自動実行する仕組みになっていた。

**重要**: 悪意あるコードは`plain-crypto-js`のインストールスクリプトに存在し、axiosのソースコード本体には含まれていない。しかし`npm install axios`を実行するだけで自動的にトリガーされる。

#### Step 4 — ペイロードの実行（難読化の解除）

マルウェアは2層の難読化が施されていた：

1. **第1層**: Base64エンコードの逆順（reversed Base64）
2. **第2層**: XOR暗号（鍵: `OrDeR_7077`）

難読化を解除すると、OS別に異なるRAT（Remote Access Trojan）が展開される：

- **Windows**: PowerShellスクリプト → C2へ接続
- **macOS**: C++コンパイル済みバイナリ
- **Linux**: Pythonスクリプト

#### Step 5 — C2通信とアンチフォレンジック

- C2サーバー: `sfrclak[.]com:8000` / IP: `142.11.206.73`
- 初回感染から**89秒後**にC2接続が確認された（Huntress調べ）
- 実行後、マルウェアは自身を削除し`package.json`を正規のコピーで上書き（証拠隠滅）

### マルウェアのIOC（侵害指標）

```
# 悪意あるパッケージのハッシュ
axios@1.14.1       SHA1: d6f3f62fd3b9f5432f5782b62d8cfd5247d5ee71
plain-crypto-js@4.2.1 SHA1: 07d889e2dadce6f3910dcbc253317d28ca61c766

# ネットワークIOC
C2ドメイン: sfrclak[.]com
C2 IP:      142.11.206.73
C2ポート:   8000

# ファイルシステムIOC（感染確認用）
~/.npm/_logs/ 内に異常なpostinstallログ
/tmp/ 配下に一時的な実行ファイル（削除済みの場合あり）
```

### 影響を受けるか確認する方法

```bash
# 1. インストール済みaxiosのバージョンを確認
npm list axios

# 2. ロックファイルで悪意あるバージョンを検索
grep -r "1\.14\.1\|0\.30\.4" package-lock.json yarn.lock pnpm-lock.yaml

# 3. plain-crypto-jsの混入確認
npm list plain-crypto-js

# 4. C2への通信記録を確認（Linuxの場合）
ss -tnp | grep 142.11.206.73
grep sfrclak /var/log/syslog 2>/dev/null
```

### 緊急対応手順

```bash
# 安全なバージョンへダウングレード
npm install axios@1.14.0

# キャッシュのクリア（汚染されたキャッシュを除去）
npm cache clean --force

# 全依存関係を再インストール
rm -rf node_modules package-lock.json
npm ci  # または npm install

# CI/CD環境でのシークレットローテーション（必須）
# - npm tokens
# - AWS/GCP/Azure credentials
# - GitHub Personal Access Tokens
# - データベースパスワード
# - APIキー全般
```

### 帰属分析

MicrosoftおよびGoogle脅威インテリジェンスチームによる分析により、本攻撃は**Sapphire Sleet**（北朝鮮国家支援の金銭目的APT）に帰属された。Google TIGがこのバックドアを**WAVESHAPER.V2**と命名。Sapphire Sleetは過去にもnpmパッケージを通じた暗号資産窃取を行ってきた実績がある。

### 参照URL

- [StepSecurity: axios compromised on npm — malicious versions drop RAT](https://www.stepsecurity.io/blog/axios-compromised-on-npm-malicious-versions-drop-remote-access-trojan)
- [Microsoft Security Blog: Mitigating the axios npm Supply Chain Compromise](https://www.microsoft.com/en-us/security/blog/2026/04/01/mitigating-the-axios-npm-supply-chain-compromise/)
- [Google Cloud / GTIG: North Korea Threat Actor Targets axios npm Package](https://cloud.google.com/blog/topics/threat-intelligence/north-korea-threat-actor-targets-axios-npm-package)
- [Elastic Security Labs: axios — One RAT to Rule Them All](https://www.elastic.co/security-labs/axios-one-rat-to-rule-them-all)
- [Snyk Blog: axios npm package compromised — supply chain attack delivers cross-platform malware](https://snyk.io/blog/axios-npm-package-compromised-supply-chain-attack-delivers-cross-platform/)
- [Huntress: Supply Chain Compromise — axios npm Package](https://www.huntress.com/blog/supply-chain-compromise-axios-npm-package)
- [Socket.dev: axios npm package compromised](https://socket.dev/blog/axios-npm-package-compromised)
- [SANS: axios npm Supply Chain Compromise — Malicious Packages Remote Access Trojan](https://www.sans.org/blog/axios-npm-supply-chain-compromise-malicious-packages-remote-access-trojan)
- [Malwarebytes: axios supply chain attack chops away at npm trust](https://www.malwarebytes.com/blog/news/2026/03/axios-supply-chain-attack-chops-away-at-npm-trust)
- [Sophos: axios npm package compromised to deploy malware](https://www.sophos.com/en-us/blog/axios-npm-package-compromised-to-deploy-malware)

---

## 2. LiteLLM PyPI サプライチェーン攻撃（2026年3月24日）

### 基本情報

| 項目 | 詳細 |
|---|---|
| **攻撃日時** | 2026年3月24日 10:39〜16:00 UTC（PyPI隔離: 11:25 UTC） |
| **悪意あるバージョン** | `litellm==1.82.7`、`litellm==1.82.8` |
| **安全なバージョン** | `litellm<=1.82.6`、`litellm>=1.82.9` |
| **月間ダウンロード数** | 約9,500〜9,700万回（約340万回/日） |
| **CVE** | CVE-2026-33634（CVSS4B: 9.4） |
| **攻撃者** | TeamPCP（PCPcat / ShellForce / DeadCatx3） |
| **根本原因** | CI/CDパイプラインでバージョン固定なしのTrivy使用 → Trivy侵害によるPYPI_PUBLISHトークン流出 |

### 攻撃の連鎖（サプライチェーン of サプライチェーン）

LiteLLM攻撃の特徴は、**別のサプライチェーン攻撃（Trivy侵害）を起点としている**点にある。

```
TeamPCP → Trivy侵害（3月19日）
         → GitHub Actions CIランナーから PYPI_PUBLISH トークン窃取
         → 盗んだトークンで litellm 悪意バージョンを直接PyPIに公開（3月24日）
```

### バージョン別ペイロード詳細

#### v1.82.7 — プロキシインポート時の実行

悪意あるコードが `litellm/proxy/proxy_server.py` に埋め込まれた。

- **実行条件**: `import litellm.proxy` または `from litellm.proxy import ...` 時
- **難読化**: 二重Base64エンコード
- **動作**: インポート時にデコードして即時実行

#### v1.82.8 — Pythonプロセス全起動時の実行（より危険）

`.pth`ファイルを悪用した持続的実行メカニズムが追加された。

- **配置先**: `{site-packages}/litellm_init.pth`
- **実行条件**: **Pythonが起動するたびに自動実行**（importが一切不要）
  - `pip install`実行時
  - `pytest`実行時  
  - Jupyter Notebookの起動時
  - Ansible Playbookの実行時
  - 単体テストの実行時
  - その他すべてのPythonプロセス
- **影響**: litellmをアンインストールしても`.pth`ファイルが残存すれば継続して実行される

### クレデンシャルスティーラーの動作

```
1. 標的データの収集
   - SSHプライベートキー (~/.ssh/)
   - AWSクレデンシャル (~/.aws/credentials)
   - GCPサービスアカウントキー
   - Azureクレデンシャル
   - Kubernetesコンフィグ (~/.kube/config)
   - GitHub/GitLab トークン
   - CI/CDシークレット（環境変数）
   - .envファイル
   - データベース接続文字列
   - 暗号資産ウォレット

2. データの暗号化
   - AES-256で収集データを暗号化
   - RSA公開鍵で暗号化キーをラップ

3. C2への送信
   - v1.82.7: checkmarx[.]zone
   - v1.82.8: models.litellm[.]cloud

4. Kubernetesへの持続化（Kubernetes環境のみ）
   - 特権Pod: node-setup-* を kube-system 名前空間に展開
```

### 感染確認と除去手順

```bash
# 1. インストール済みバージョンの確認
pip show litellm | grep Version

# 2. .pthファイルの確認（最重要）
python -c "import site; print(site.getsitepackages())"
# 出力されたパスで確認:
find /usr/local/lib/python*/site-packages -name "litellm_init.pth" 2>/dev/null
find ~/.local/lib/python*/site-packages -name "litellm_init.pth" 2>/dev/null

# 3. 持続化マルウェアの確認
ls -la ~/.config/sysmon/sysmon.py 2>/dev/null

# 4. Kubernetes環境での確認
kubectl get pods -n kube-system | grep node-setup

# 5. 安全なバージョンへ更新
pip install litellm==1.82.9  # または最新の安全バージョン

# 6. .pthファイルの手動削除（pip uninstallでは除去されない場合がある）
# ※ find で特定したパスのファイルを削除

# 7. 全シークレットのローテーション（必須）
# SSHキーの再生成、クラウドクレデンシャルの無効化と再発行
```

### LiteLLM公式の対応

- LiteLLM CEOのKrish Dholakia氏のGitHubアカウントも同時に侵害された
- クラウドサービス利用者（SaaS版）と公式Dockerイメージ利用者は影響を受けていない（固定された依存関係を使用）
- PyPIは報告から約46分後（11:25 UTC）に問題のバージョンを隔離

### 参照URL

- [FutureSearch: LiteLLM PyPI Supply Chain Attack](https://futuresearch.ai/blog/litellm-pypi-supply-chain-attack/)
- [LiteLLM公式: Security Update March 2026](https://docs.litellm.ai/blog/security-update-march-2026)
- [Wiz: Three's a Crowd — TeamPCP Trojanizes LiteLLM](https://www.wiz.io/blog/threes-a-crowd-teampcp-trojanizes-litellm-in-continuation-of-campaign)
- [Snyk: Poisoned Security Scanner — Backdooring LiteLLM](https://snyk.io/blog/poisoned-security-scanner-backdooring-litellm/)
- [DreamFactory: The LiteLLM Supply Chain Attack — Complete Technical Breakdown](https://blog.dreamfactory.com/the-litellm-supply-chain-attack-a-complete-technical-breakdown-of-what-happened-who-is-affected-and-what-comes-next)
- [Kaspersky: Critical supply chain attack — Trivy, LiteLLM, Checkmarx, TeamPCP](https://www.kaspersky.com/blog/critical-supply-chain-attack-trivy-litellm-checkmarx-teampcp/55510/)
- [ReversingLabs: TeamPCP supply chain attack spreads](https://www.reversinglabs.com/blog/teampcp-supply-chain-attack-spreads)
- [InfoQ: LiteLLM Supply Chain Attack](https://www.infoq.com/news/2026/03/litellm-supply-chain-attack/)
- [HeroDevs: The LiteLLM Supply Chain Attack — What Happened, Why It Matters](https://www.herodevs.com/blog-posts/the-litellm-supply-chain-attack-what-happened-why-it-matters-and-what-to-do-next)

---

## 3. TeamPCP キャンペーン全体像（2026年2月〜4月）

### 攻撃グループのプロファイル

**TeamPCP**（別名: PCPcat / ShellForce / DeadCatx3）は、2026年に急浮上した高度なサプライチェーン攻撃グループ。ランサムウェアグループ **Vect**、**CipherForce**、**Lapsus$** と連携し、300GB超のデータを窃取、50万件超のクレデンシャルを盗んだと主張している。

### 攻撃タイムライン

#### フェーズ1: Trivy（Aqua Security）の侵害（2026年3月19日）

**CVE-2026-33634**（CVSS4B: 9.4）

Aqua Securityが開発するコンテナ・依存関係スキャナー **Trivy** のGitHub Actionsインフラが侵害された。

**攻撃手法**:

1. 事前に `aqua-bot` サービスアカウントを侵害（`pull_request_target` ワークフローの設定ミスを悪用）
2. 取得したPATを使い、`trivy-action`リポジトリの全76タグと`setup-trivy`の7タグを悪意あるコミットに強制プッシュ
3. `trivy@v0.69.4`を GitHub Releases、Docker Hub、GHCR、ECRに同時公開

**マルウェア（TeamPCP Cloud Stealer）の動作**:

- `Runner.Worker`プロセスのメモリをダンプしてGitHub ActionsのシークレットをRAMから直接抽出
- SSH鍵、AWSトークン、GCPサービスアカウント、K8sコンフィグ等を収集
- AES-256 + RSA-4096で暗号化し `scan.aquasecurtiy[.]org`（typosquat）へ送信
- フォールバック: 被害者のGitHub組織に非公開リポジトリ（`tpcp-docs` / `docs-tpcp`）を作成してデータを押し込む
- 副次的被害: `tfsec`、`traceeshark`、`trivy-action` への悪意あるワークフロー注入; GPGキー、Docker Hub、Twitter、Slackクレデンシャルも窃取

**影響**: 1,000以上のクラウド環境が感染。Trivyを使用するCI/CDパイプラインすべてが潜在的影響を受けた。

```
悪意あるC2:
  scan.aquasecurtiy[.]org  ← "security" のtyposquat
  checkmarx[.]zone
  models.litellm[.]cloud
```

**参照URL**:
- [Wiz: Trivy compromised — TeamPCP supply chain attack](https://www.wiz.io/blog/trivy-compromised-teampcp-supply-chain-attack)
- [Palo Alto Unit 42: TeamPCP Supply Chain Attacks](https://unit42.paloaltonetworks.com/teampcp-supply-chain-attacks/)
- [StepSecurity: 10 Layers Deep — How StepSecurity Stops TeamPCP's Trivy Attack](https://www.stepsecurity.io/blog/10-layers-deep-how-stepsecurity-stops-teampcps-trivy-supply-chain-attack-on-github-actions)
- [Oligo Security: TeamPCP Campaign — The Evolution of Modern Supply Chain Attacks](https://www.oligo.security/blog/teampcp-campaign-the-evolution-of-modern-supply-chain-attacks)

---

#### フェーズ2: Checkmarx KICS & AST GitHub Action（2026年3月21〜23日）

Trivyから盗んだPATを転用し、Checkmarxのオープンソースセキュリティツールを侵害した。

**影響コンポーネント**:

| コンポーネント | 侵害内容 |
|---|---|
| `checkmarx/kics` | 全35タグを悪意あるコミットに強制プッシュ |
| `checkmarx/ast-github-action@2.3.28` | ペイロードを注入 |
| OpenVSX拡張 `cx-dev-assist@1.7.0` | 侵害版を公開 |
| OpenVSX拡張 `ast-results` | 侵害版を公開 |

ペイロードはLiteLLM/Trivyと同一のクレデンシャルスティーラー。C2は `checkmarx[.]zone`。

**参照URL**:
- [Kaspersky: Critical supply chain attack](https://www.kaspersky.com/blog/critical-supply-chain-attack-trivy-litellm-checkmarx-teampcp/55510/)
- [Cato Networks: TeamPCP Supply Chain Attack](https://www.catonetworks.com/blog/teampcp-supply-chain-attack/)

---

#### フェーズ3: Telnyx Python SDK（2026年3月27日）

通信APIプロバイダー **Telnyx** のPython SDKがPyPIで侵害された。

**悪意あるバージョン**: `telnyx==4.87.1`、`telnyx==4.87.2`

**技術的特徴**:
- **WAVステガノグラフィー**: 悪意あるコードをWAVオーディオファイルに埋め込む手法を使用（他のインシデントと異なる手口）
- 3ステージのペイロード構造
- 最終ペイロードはLiteLLM/Trivyと同一のクレデンシャルスティーラー

**参照URL**:
- [Akamai: Telnyx PyPI 2026 — TeamPCP Supply Chain Attacks](https://www.akamai.com/blog/security-research/2026/mar/telnyx-pypi-2026-teampcp-supply-chain-attacks)

---

### TeamPCP 攻撃の根本的教訓

**なぜTrivy侵害が連鎖的被害を生んだか**:

```text
Trivy侵害
  → CI/CDランナーのメモリからトークン窃取
     → PYPI_PUBLISHトークン（LiteLLM）
     → Checkmarx PAT
     → その他多数のCI/CDシークレット
        → 各プロジェクトへの悪意あるバージョン公開
```

多くのプロジェクトが`trivy-action@v0.29`（タグ参照）を使用しており、タグが強制上書きされた際に**コードを変更せず**に侵害された。SHAピン止めを使用していたプロジェクトは影響を受けなかった。

---

## 4. 攻撃から組織を守る具体的対策

### 即時実施（今すぐ）

```yaml
# GitHub Actions: タグではなくSHAでピン止め（最重要）

# ❌ 危険（タグ参照 — 強制プッシュで上書き可能）
- uses: aquasecurity/trivy-action@v0.29
- uses: actions/checkout@v4

# ✅ 安全（SHAピン止め — 強制上書き不可）
- uses: aquasecurity/trivy-action@6c175e9c4083a92bbca2b9a8e08e9b40af4a1e1e
- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683
```

```bash
# Dependabotでpinningを自動管理
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    # SHAピン止めのPRを自動作成
```

### CI/CDシークレットの保護

```yaml
# GitHub Actionsのシークレット露出を最小化

permissions:
  contents: read  # 必要最小限のみ

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      # OIDC（一時トークン）を使用 — 長期シークレットをランナーに渡さない
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789:role/GitHubActionsRole
          aws-region: us-east-1
          # secretsを直接渡す代わりにOIDCで一時クレデンシャルを取得
```

### 依存関係の固定とスキャン

```bash
# Node.js: lockファイルを必ずコミット
npm ci  # npm installではなくnpm ciを使用

# Python: requirements.txtでハッシュ固定
pip-compile --generate-hashes requirements.in
pip install --require-hashes -r requirements.txt

# package.jsonから ^ と ~ を除去（自動アップデート無効化）
# "axios": "^1.14.0"  → "axios": "1.14.0"

# SCAスキャンをCIに統合
- name: Scan dependencies
  run: |
    npm audit --audit-level=critical
    # または Socket.dev でSlopsquatting・マルウェア検出
    npx socket@latest npm check --strict
```

### GitHubアカウントのMFA強化

```
推奨設定:
- FIDO2ハードウェアキー（YubiKey等）を必須化
- SMS OTPは無効化（SIMスワッピング対策）
- Organization全体でMFA必須化ポリシーを適用
- npm、PyPI等のパッケージレジストリも同様に設定
```

---

## 5. 検出・モニタリング

### SBOMによる影響範囲の即時把握

Log4Shell（2021年）およびaxios/LiteLLM事件が示したように、**SBOMがなければ「どのシステムが影響を受けるか」を即座に把握できない**。

```bash
# CycloneDX形式でSBOMを生成
npx @cyclonedx/cyclonedx-npm --output-file sbom.json

# SBOMを使って悪意あるバージョンを全プロジェクトで検索
grype sbom:./sbom.json --add-cpes-if-none 2>/dev/null | grep axios
grype sbom:./sbom.json --add-cpes-if-none 2>/dev/null | grep litellm
```

### リアルタイム監視

```yaml
# GitHub Advanced Security / Dependabot アラートを有効化
security:
  dependabot:
    security-updates: enabled
  code-scanning:
    enabled: true

# Socket.devによるリアルタイムnpm監視
# → インストール前にマルウェア・タイポスクワッティングを検出
```

---

## 6. まとめ：2026年第1四半期が示したこと

2026年第1四半期の攻撃は、現代のソフトウェアサプライチェーンが抱える構造的脆弱性を白日の下にさらした。

**3つの核心的教訓**:

1. **開発ツール自体が最高価値のターゲット**  
   セキュリティスキャナー（Trivy）が侵害されることで、そのツールを使う組織のCI/CDシークレットが連鎖的に流出した。「セキュリティツールだから安全」という前提は成立しない。

2. **タグ参照は信頼の根拠にならない**  
   `@v0.29`のようなタグ参照は強制プッシュで上書き可能。SHAピン止めのみが暗号学的に安全な参照方法である。

3. **サプライチェーン攻撃の工業化**  
   TeamPCPの手口は、1つの侵害から得たクレデンシャルを別の攻撃に転用する高度に効率化されたオペレーションだった。単発のインシデントとして扱うのではなく、相互接続された攻撃キャンペーンとして認識する必要がある。

---

## 参照URL一覧（全インシデント）

### axios（npm）

- https://www.stepsecurity.io/blog/axios-compromised-on-npm-malicious-versions-drop-remote-access-trojan
- https://www.microsoft.com/en-us/security/blog/2026/04/01/mitigating-the-axios-npm-supply-chain-compromise/
- https://cloud.google.com/blog/topics/threat-intelligence/north-korea-threat-actor-targets-axios-npm-package
- https://www.elastic.co/security-labs/axios-one-rat-to-rule-them-all
- https://snyk.io/blog/axios-npm-package-compromised-supply-chain-attack-delivers-cross-platform/
- https://www.huntress.com/blog/supply-chain-compromise-axios-npm-package
- https://socket.dev/blog/axios-npm-package-compromised
- https://www.sans.org/blog/axios-npm-supply-chain-compromise-malicious-packages-remote-access-trojan
- https://www.malwarebytes.com/blog/news/2026/03/axios-supply-chain-attack-chops-away-at-npm-trust
- https://www.sophos.com/en-us/blog/axios-npm-package-compromised-to-deploy-malware

### LiteLLM（PyPI）

- https://futuresearch.ai/blog/litellm-pypi-supply-chain-attack/
- https://docs.litellm.ai/blog/security-update-march-2026
- https://www.wiz.io/blog/threes-a-crowd-teampcp-trojanizes-litellm-in-continuation-of-campaign
- https://snyk.io/blog/poisoned-security-scanner-backdooring-litellm/
- https://blog.dreamfactory.com/the-litellm-supply-chain-attack-a-complete-technical-breakdown-of-what-happened-who-is-affected-and-what-comes-next
- https://www.kaspersky.com/blog/critical-supply-chain-attack-trivy-litellm-checkmarx-teampcp/55510/
- https://www.reversinglabs.com/blog/teampcp-supply-chain-attack-spreads
- https://www.infoq.com/news/2026/03/litellm-supply-chain-attack/
- https://www.herodevs.com/blog-posts/the-litellm-supply-chain-attack-what-happened-why-it-matters-and-what-to-do-next

### Trivy / TeamPCPキャンペーン全体

- https://www.wiz.io/blog/trivy-compromised-teampcp-supply-chain-attack
- https://unit42.paloaltonetworks.com/teampcp-supply-chain-attacks/
- https://www.akamai.com/blog/security-research/2026/mar/telnyx-pypi-2026-teampcp-supply-chain-attacks
- https://www.oligo.security/blog/teampcp-campaign-the-evolution-of-modern-supply-chain-attacks
- https://www.catonetworks.com/blog/teampcp-supply-chain-attack/
- https://www.stepsecurity.io/blog/10-layers-deep-how-stepsecurity-stops-teampcps-trivy-supply-chain-attack-on-github-actions
- https://www.theregister.com/2026/04/02/mercor_supply_chain_attack/
- https://www.kaspersky.com/blog/critical-supply-chain-attack-trivy-litellm-checkmarx-teampcp/55510/

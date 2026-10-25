export const diagrams: Record<string, string> = {
  d1: `flowchart TD
A["準備: スコープ・参加者・目的を決める"] --> Q1["Q1: What are we working on?<br/>図やモデルで対象を表す"]
Q1 --> Q2["Q2: What can go wrong?<br/>STRIDE等で脅威を洗い出す"]
Q2 --> Q3["Q3: What are we going to do about it?<br/>緩和・排除・移転・受容を決める"]
Q3 --> Q4["Q4: Did we do a good enough job?<br/>レビュー・テスト・振り返り"]
Q4 -->|"不足あり"| Q1
Q4 -->|"十分"| R["記録して共有し、変更時に再実施"]
R -.->|"設計変更・新機能・新たな脅威情報"| Q1`,
  d2: `flowchart LR
U["User<br/>外部エンティティ"]
subgraph TB1["信頼境界A: インターネット側"]
U
end
subgraph TB2["信頼境界B: 自社バックエンド"]
W["Web/API<br/>プロセス"]
end
subgraph TB4["信頼境界D: データ層"]
DB[("Database<br/>データストア")]
end
subgraph TB3["信頼境界C: 外部サービス"]
IDP["外部IdP<br/>外部エンティティ"]
end
U -->|"1 HTTPS リクエスト"| W
W -->|"2 SQL"| DB
W -->|"3 OIDC 認証"| IDP`,
  d3: `flowchart TD
S1["DFDの部品を1つ選ぶ"] --> S2{"部品の種類は?"}
S2 -->|"外部エンティティ"| E1["S と R を検討"]
S2 -->|"プロセス"| E2["S T R I D E 全て検討"]
S2 -->|"データストア"| E3["T I D(ログならRも)を検討"]
S2 -->|"データフロー"| E4["T I D を検討"]
E1 --> S3["見つけた脅威を1行で記録"]
E2 --> S3
E3 --> S3
E4 --> S3
S3 --> S4{"信頼境界を越えるか?"}
S4 -->|"はい"| S5["重点的に深掘りする"]
S4 -->|"いいえ"| S6["次の部品へ"]
S5 --> S6
S6 --> S1`,
  d4: `flowchart TD
G["目標: 他人の非公開メモを読む"]
G --> O1["OR: 共有リンク経由"]
G --> O2["OR: アカウント乗っ取り"]
G --> O3["OR: API の認可不備"]
O1 --> L1["リンクIDを推測する"]
O1 --> L2["共有されたリンクが転送・公開される"]
O2 --> A1["AND: パスワード使い回し攻撃"]
O2 --> A2["フィッシングでセッションを盗む"]
A1 --> A11["漏えいした認証情報リストを入手"]
A1 --> A12["MFAが無効または未設定"]
O3 --> Z1["メモIDを他人のIDに書き換える(IDOR)"]`,
  d5: `flowchart TD
T["脅威を1つ選ぶ"] --> Q1{"その機能やデータは<br/>本当に必要?"}
Q1 -->|"不要"| EL["Eliminate: なくす"]
Q1 -->|"必要"| Q2{"技術的に<br/>対策できる?"}
Q2 -->|"できる"| MI["Mitigate: 対策を設計に入れる"]
Q2 -->|"難しい"| Q3{"契約・保険で<br/>責任を移せる?"}
Q3 -->|"できる"| TR["Transfer: 移す責任と<br/>残る管理策・リスクを明記"]
Q3 -->|"できない"| AC["Accept: 理由と承認者を記録"]
EL --> REC["記録: 判断理由・担当・期限"]
MI --> REC
TR --> REC
AC --> REC`,
  d6: `flowchart LR
subgraph NET["信頼境界A: インターネット"]
U["ユーザー<br/>(ブラウザ)"]
V["リンクを受け取った第三者"]
end
subgraph APP["信頼境界B: 自社バックエンド"]
API["Web/API"]
DB[("メモDB")]
OBJ[("添付ファイル<br/>ストレージ")]
LOG[("監査ログ")]
end
subgraph EXT["信頼境界C: 外部サービス"]
IDP["外部IdP"]
end
U -->|"1 ログイン要求"| IDP
IDP -->|"2 認証結果 トークン"| U
U -->|"3 メモ操作 HTTPS"| API
V -->|"4 共有リンク閲覧 HTTPS"| API
API -->|"5 メモの読み書き SQL"| DB
API -->|"6 添付の保存と取得"| OBJ
API -->|"7 操作ログの記録"| LOG`,
  d7: `sequenceDiagram
participant F as ファシリテーター
participant D as 開発者
participant S as セキュリティ担当
participant Q as QA
F->>D: 10分 システムの説明と図の作成
D->>F: 部品・フロー・境界を確認
F->>S: 30分 STRIDEで脅威を出す
S->>Q: ここは異常系でどうなる?
Q->>S: 想定外の入力パターンを提案
F->>D: 20分 対応方針を決める
D->>F: 実装コストの見積もり
F->>Q: 10分 テスト観点に変換する
Q->>F: 検証方法を確認
F->>D: 10分 記録と次回の見直し条件の確認`,
  d8: `flowchart LR
subgraph USR["信頼境界A: ユーザー側"]
U["ユーザー"]
end
subgraph APPB["信頼境界B: アプリ"]
ORCH["オーケストレーター<br/>プロンプト組み立て"]
MEM[("会話履歴・メモリ")]
end
subgraph MOD["信頼境界C: モデル提供"]
LLM["LLM"]
end
subgraph TOOLS["信頼境界D: ツール・外部データ"]
RAG[("RAG 文書ストア")]
WEB["Web・メール等の外部コンテンツ"]
API["業務API(更新系)"]
end
U -->|"1 質問"| ORCH
ORCH -->|"2 プロンプト"| LLM
LLM -->|"3 応答・ツール呼び出し案"| ORCH
ORCH -->|"4 検索"| RAG
ORCH <-->|"5 取得(外部コンテンツ＝信頼できない入力)"| WEB
ORCH -->|"6 実行(要承認?)"| API
ORCH <-->|"7 保存と参照"| MEM`,
  d9: `flowchart LR
P1["第1段階<br/>1チーム・1機能で<br/>60分の試行"] --> P2["第2段階<br/>スプリントごとに<br/>短く実施"]
P2 --> P3["第3段階<br/>テンプレートと<br/>記録の標準化"]
P3 --> P4["第4段階<br/>CI・設計レビューに<br/>組み込む"]
P4 --> P5["第5段階<br/>経験を共有し、<br/>チャンピオンを育成"]`,
};

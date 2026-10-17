/** Unmodified definitions extracted from the original HTML. */
export const diagrams: Record<string, string> = {
  "1": "flowchart LR\nA[\"暗号の部品<br/>ブロック暗号 ハッシュ 署名\"] --> C[\"組み合わせ方<br/>プロトコル\"]\nB[\"現実の落とし穴<br/>乱数 鍵管理 実装\"] --> C\nC --> D[\"安全なシステム設計\"]",
  "2": "flowchart TD\nGoal[\"守りたいもの\"] --> Q1{\"内容を<br/>隠したい?\"}\nGoal --> Q2{\"改ざんを<br/>検知したい?\"}\nGoal --> Q3{\"誰が作ったか<br/>証明したい?\"}\nQ1 -->|はい| S[\"共通鍵暗号 AEAD<br/>鍵共有は公開鍵方式\"]\nQ2 -->|共有鍵あり| M[\"MAC / HMAC\"]\nQ2 -->|共有鍵なし| H[\"デジタル署名\"]\nQ3 --> H",
  "3": "flowchart LR\nP[\"平文\"] --> E[\"AEAD 暗号化\"]\nK[\"鍵\"] --> E\nN[\"nonce<br/>使い捨ての値\"] --> E\nA[\"付随データ AAD<br/>ヘッダなど 暗号化はしない\"] --> E\nE --> C[\"暗号文 + 認証タグ\"]\nC --> D[\"AEAD 復号\"]\nK --> D\nN --> D\nA --> D\nD -->|タグが正しい| OK[\"平文\"]\nD -->|タグが不正| NG[\"エラー 平文は返さない\"]",
  "4": "sequenceDiagram\nparticipant A as 送信者\nparticipant B as 受信者\nNote over A,B: 事前に共有鍵を持っている\nA->>B: メッセージ + HMAC タグ\nB->>B: 受け取ったメッセージから HMAC を再計算\nB->>B: 定数時間で比較\nalt 一致\nB-->>A: 受理\nelse 不一致\nB-->>A: 破棄\nend",
  "5": "sequenceDiagram\nparticipant A as Alice\nparticipant B as Bob\nA->>A: 一時的な鍵ペアを生成\nB->>B: 一時的な鍵ペアを生成\nA->>B: Alice の公開鍵\nB->>A: Bob の公開鍵\nA->>A: 自分の秘密鍵 + Bob の公開鍵 から共有秘密\nB->>B: 自分の秘密鍵 + Alice の公開鍵 から共有秘密\nNote over A,B: 同じ共有秘密になる\nA->>A: HKDF で暗号鍵を導出\nB->>B: HKDF で暗号鍵を導出\nA->>B: AEAD で暗号化したデータ",
  "6": "flowchart LR\nG[\"生成<br/>十分な乱数\"] --> S[\"保管<br/>KMS HSM 金庫\"]\nS --> U[\"利用<br/>最小権限\"]\nU --> R[\"ローテーション<br/>定期更新\"]\nR --> X[\"廃棄<br/>確実に消去\"]\nX --> G",
  "7": "flowchart TD\nA[\"ユーザーがパスワードを入力\"] --> B[\"ランダムなソルトを生成\"]\nB --> C[\"Argon2id で計算<br/>遅く メモリを多く使う\"]\nC --> D[\"ハッシュ文字列を保存<br/>ソルトとパラメータを含む\"]\nD --> E[\"ログイン時に同じ手順で検証\"]",
  "8": "sequenceDiagram\nparticipant C as クライアント\nparticipant S as サーバー\nC->>S: ClientHello(対応する暗号スイートと鍵共有値 key_share)\nS->>C: ServerHello(選んだ方式と鍵共有値)\nNote over C,S: ここから先のメッセージは暗号化される\nS->>C: EncryptedExtensions\nS->>C: Certificate(サーバー証明書)\nS->>C: CertificateVerify(署名で秘密鍵の所有を証明)\nS->>C: Finished\nC->>S: Finished\nNote over C,S: アプリケーションデータを AEAD で暗号化して送受信",
  "9": "flowchart LR\nA[\"現在<br/>暗号化通信を傍受して保存\"] --> B[\"数年後<br/>量子コンピュータが実用化\"]\nB --> C[\"保存した通信を解読\"]\nD[\"長期間 秘密にしたいデータ\"] -. 影響を受ける .-> C",
  "10": "flowchart TD\nA[\"X25519 の共有秘密\"] --> K[\"鍵導出で結合\"]\nB[\"ML-KEM-768 の共有秘密\"] --> K\nK --> S[\"セッション鍵\"]\nS --> E[\"AEAD で通信を暗号化\"]",
  "11": "flowchart LR\nDR[\"Double Ratchet<br/>従来方式 X25519\"] --> M[\"鍵の混合 KDF\"]\nPQ[\"SPQR<br/>ML-KEM に基づく\"] --> M\nM --> MK[\"メッセージ鍵\"]",
  "12": "flowchart TD\nA[\"1 暗号の棚卸し<br/>どこで何を使っているか\"] --> B[\"2 長期秘匿が必要なデータを特定\"]\nB --> C[\"3 鍵交換から優先してハイブリッド化\"]\nC --> D[\"4 署名と証明書の移行計画\"]\nD --> E[\"5 暗号アルゴリズムを差し替えやすい設計に<br/>暗号アジリティ\"]",
  "13": "flowchart TD\nStart[\"何をしたい?\"] --> A{\"通信を<br/>保護したい\"}\nStart --> B{\"データを<br/>保存時に暗号化\"}\nStart --> C{\"パスワードを<br/>保存したい\"}\nStart --> D{\"改ざんを<br/>検知したい\"}\nA -->|はい| A1[\"TLS 1.3 を使う<br/>PQ ハイブリッド対応を確認\"]\nB -->|はい| B1[\"AEAD + KMS で鍵管理\"]\nC -->|はい| C1[\"Argon2id\"]\nD -->|共有鍵あり| D1[\"HMAC\"]\nD -->|共有鍵なし| D2[\"デジタル署名 Ed25519<br/>PQ なら ML-DSA を検討\"]",
  "14": "flowchart TD\nS1[\"Level 1<br/>用語と全体像<br/>この文書の1〜3章\"] --> S2[\"Level 2<br/>部品を理解<br/>AEAD ハッシュ 署名 4〜7章\"]\nS2 --> S3[\"Level 3<br/>ライブラリで実装<br/>Python cryptography libsodium\"]\nS3 --> S4[\"Level 4<br/>プロトコルを読む<br/>TLS 1.3 Signal\"]\nS4 --> S5[\"Level 5<br/>ポスト量子と移行<br/>NIST IETF\"]\nS5 --> S6[\"Level 6<br/>書籍 Applied Cryptography を<br/>歴史と設計思想として読む\"]"
};

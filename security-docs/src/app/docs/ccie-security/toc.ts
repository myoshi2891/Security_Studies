import type { GuideChapter } from './GuideSidebar';

// Original chapter/subsection order and labels, extracted from the source HTML.
export const toc: readonly GuideChapter[] = [
  {
    "id": "s1",
    "title": "1. このガイドの使い方と最初に知っておくべき注意点",
    "children": [
      {
        "id": "s1-1",
        "title": "1.1 読み方（初学者向け 3 ステップ）"
      },
      {
        "id": "s1-2",
        "title": "1.2  最初に確認すべき「情報の鮮度」に関する注意"
      },
      {
        "id": "s1-3",
        "title": "1.3 本ガイドの「ベストプラクティス」の位置づけ"
      }
    ]
  },
  {
    "id": "s2",
    "title": "2. CCIE Security 認定の全体像",
    "children": [
      {
        "id": "s2-1",
        "title": "2.1 取得までの流れ"
      },
      {
        "id": "s2-2",
        "title": "2.2 ラボ試験の 5 つのドメインと配点"
      },
      {
        "id": "s2-3",
        "title": "2.3 クオリファイ試験（SCOR）とラボ試験の関係"
      }
    ]
  },
  {
    "id": "s3",
    "title": "3. 製品名の新旧対照表",
    "children": []
  },
  {
    "id": "s4",
    "title": "4. 学習ロードマップ",
    "children": [
      {
        "id": "s4-1",
        "title": "4.1 おすすめの学習順序"
      },
      {
        "id": "s4-2",
        "title": "4.2 学習環境（ラボ）の用意"
      },
      {
        "id": "s4-3",
        "title": "4.3 各項目の学習サイクル"
      }
    ]
  },
  {
    "id": "s5",
    "title": "5. Domain 1: Perimeter Security and Intrusion Prevention（20%）",
    "children": [
      {
        "id": "s5-1",
        "title": "5.0 まず押さえる全体像"
      },
      {
        "id": "s5-2",
        "title": "5.1 【1.1】ASA / FTD の展開モード"
      },
      {
        "id": "s5-3",
        "title": "5.2 【1.2】ASA / FTD のファイアウォール機能"
      },
      {
        "id": "s5-4",
        "title": "5.3 【1.3】Cisco IOS / IOS XE のセキュリティ機能"
      },
      {
        "id": "s5-5",
        "title": "5.4 【1.4】Cisco FMC の機能"
      },
      {
        "id": "s5-6",
        "title": "5.5 【1.5】Cisco NGIPS の展開モード"
      },
      {
        "id": "s5-7",
        "title": "5.6 【1.6】Cisco NGFW の機能"
      },
      {
        "id": "s5-8",
        "title": "5.7 【1.7】一般的な攻撃の検知と緩和"
      },
      {
        "id": "s5-9",
        "title": "5.8 【1.8】クラスタリングと高可用性（HA）"
      },
      {
        "id": "s5-10",
        "title": "5.9 【1.9】トラフィック制御のポリシーとルール"
      },
      {
        "id": "s5-11",
        "title": "5.10 【1.10】ルーティングプロトコルのセキュリティ"
      },
      {
        "id": "s5-12",
        "title": "5.11 【1.11】ASA／FTD 経由のネットワーク接続"
      },
      {
        "id": "s5-13",
        "title": "5.12 【1.12】FMC の相関ルールとリメディエーション"
      }
    ]
  },
  {
    "id": "s6",
    "title": "6. Domain 2: Secure Connectivity and Segmentation（20%）",
    "children": [
      {
        "id": "s6-1",
        "title": "6.0 全体像"
      },
      {
        "id": "s6-2",
        "title": "6.1 【2.1】Cisco Secure Client（旧 AnyConnect）によるリモートアクセス VPN"
      },
      {
        "id": "s6-3",
        "title": "6.2 【2.2】Cisco IOS CA による VPN 認証"
      },
      {
        "id": "s6-4",
        "title": "6.3 【2.3】FlexVPN、DMVPN、IPsec L2L トンネル"
      },
      {
        "id": "s6-5",
        "title": "6.4 【2.4】VPN の高可用性"
      },
      {
        "id": "s6-6",
        "title": "6.5 【2.5】インフラのセグメンテーション手法"
      },
      {
        "id": "s6-7",
        "title": "6.6 【2.6】Cisco TrustSec によるマイクロセグメンテーション（SGT と SXP）"
      }
    ]
  },
  {
    "id": "s7",
    "title": "7. Domain 3: Security Infrastructure（15%）",
    "children": [
      {
        "id": "s7-1",
        "title": "7.0 3 つのプレーンという考え方"
      },
      {
        "id": "s7-2",
        "title": "7.1 【3.1】デバイスハードニングと制御プレーン保護"
      },
      {
        "id": "s7-3",
        "title": "7.2 【3.2】管理プレーン保護"
      },
      {
        "id": "s7-4",
        "title": "7.3 【3.3】データプレーン保護"
      },
      {
        "id": "s7-5",
        "title": "7.4 【3.4】Layer 2 セキュリティ技術"
      },
      {
        "id": "s7-6",
        "title": "7.5 【3.5】ワイヤレスセキュリティ技術"
      },
      {
        "id": "s7-7",
        "title": "7.6 【3.6】監視プロトコル"
      },
      {
        "id": "s7-8",
        "title": "7.7 【3.7】組織のセキュリティポリシー・標準への準拠"
      },
      {
        "id": "s7-9",
        "title": "7.8 【3.8】Cisco SAFE モデルによる設計検証と脅威特定"
      },
      {
        "id": "s7-10",
        "title": "7.9 【3.9】API を使った機器操作（基本的な Python スクリプト）"
      },
      {
        "id": "s7-11",
        "title": "7.10 【3.10】Cisco Catalyst Center（旧 DNAC）の Northbound API ユースケース"
      }
    ]
  },
  {
    "id": "s8",
    "title": "8. Domain 4: Identity Management, Information Exchange, and Access Control（25%）",
    "children": [
      {
        "id": "s8-1",
        "title": "8.0 全体像：ISE を中心にした情報の流れ"
      },
      {
        "id": "s8-2",
        "title": "8.1 【4.1】ISE のスケーラビリティ（複数ノードとペルソナ）"
      },
      {
        "id": "s8-3",
        "title": "8.2 【4.2】スイッチと WLC のネットワークアクセス AAA（ISE 連携）"
      },
      {
        "id": "s8-4",
        "title": "8.3 【4.3】ISE による機器の管理アクセス（TACACS+）"
      },
      {
        "id": "s8-5",
        "title": "8.4 【4.4】802.1X と MAB による有線／無線のネットワークアクセス AAA"
      },
      {
        "id": "s8-6",
        "title": "8.5 【4.5】ゲストライフサイクル管理（ISE と WLC）"
      },
      {
        "id": "s8-7",
        "title": "8.6 【4.6】BYOD オンボーディングとネットワークアクセスフロー"
      },
      {
        "id": "s8-8",
        "title": "8.7 【4.7】ISE と外部 ID ソースの統合"
      },
      {
        "id": "s8-9",
        "title": "8.8 【4.8】ISE と ASA による AnyConnect（Secure Client）のプロビジョニング"
      },
      {
        "id": "s8-10",
        "title": "8.9 【4.9】ISE によるポスチャ評価"
      },
      {
        "id": "s8-11",
        "title": "8.10 【4.10】ISE によるエンドポイントのプロファイリング（デバイスセンサー含む）"
      },
      {
        "id": "s8-12",
        "title": "8.11 【4.11】MDM と ISE の統合"
      },
      {
        "id": "s8-13",
        "title": "8.12 【4.12】証明書ベース認証"
      },
      {
        "id": "s8-14",
        "title": "8.13 【4.13】認証方式（EAP チェイニング、TEAP、MAR）"
      },
      {
        "id": "s8-15",
        "title": "8.14 【4.14】ID マッピング（ASA、ISE、WSA、FTD）"
      },
      {
        "id": "s8-16",
        "title": "8.15 【4.15】pxGrid による ISE・WSA・FMC の連携"
      },
      {
        "id": "s8-17",
        "title": "8.16 【4.16】ISE と多要素認証（MFA）の統合"
      },
      {
        "id": "s8-18",
        "title": "8.17 【4.17】Cisco Duo によるアクセス制御とシングルサインオン（SSO）"
      },
      {
        "id": "s8-19",
        "title": "8.18 【4.18】Cisco IBNS 2.0（C3PL）による認証・アクセス制御・ユーザポリシー適用"
      }
    ]
  },
  {
    "id": "s9",
    "title": "9. Domain 5: Advanced Threat Protection and Content Security（20%）",
    "children": [
      {
        "id": "s9-1",
        "title": "9.0 全体像"
      },
      {
        "id": "s9-2",
        "title": "9.1 【5.1】AMP（Advanced Malware Protection）：ネットワーク／エンドポイント／コンテンツセキュリティ"
      },
      {
        "id": "s9-3",
        "title": "9.2 【5.2】マルウェアインシデントの検知・分析・緩和"
      },
      {
        "id": "s9-4",
        "title": "9.3 【5.3】パケットキャプチャと解析（Wireshark、tcpdump、SPAN、ERSPAN、RSPAN）"
      },
      {
        "id": "s9-5",
        "title": "9.4 【5.4】クラウドセキュリティ（Cisco Umbrella）"
      },
      {
        "id": "s9-6",
        "title": "9.5 【5.5】Web フィルタリング、ユーザ識別、AVC（FTD と WSA）"
      },
      {
        "id": "s9-7",
        "title": "9.6 【5.6】WCCP リダイレクション"
      },
      {
        "id": "s9-8",
        "title": "9.7 【5.7】メールセキュリティ機能"
      },
      {
        "id": "s9-9",
        "title": "9.8 【5.8】HTTP(S) 復号と検査（FTD、WSA、Umbrella）"
      },
      {
        "id": "s9-10",
        "title": "9.9 【5.9】Cisco SMA による一元的なコンテンツセキュリティ管理"
      },
      {
        "id": "s9-11",
        "title": "9.10 【5.10】Cisco 高度脅威ソリューションとその連携"
      }
    ]
  },
  {
    "id": "s10",
    "title": "10. 横断ベストプラクティス集",
    "children": [
      {
        "id": "s10-1",
        "title": "10.1 設計原則"
      },
      {
        "id": "s10-2",
        "title": "10.2 導入の進め方（共通パターン）"
      },
      {
        "id": "s10-3",
        "title": "10.3 検証・トラブルシュートの共通手順"
      },
      {
        "id": "s10-4",
        "title": "10.4 ISE トラブルシュートの定番コマンド／画面"
      },
      {
        "id": "s10-5",
        "title": "10.5 自動化（ブループリントの前提）"
      }
    ]
  },
  {
    "id": "s11",
    "title": "11. ラボ試験の戦い方",
    "children": [
      {
        "id": "s11-1",
        "title": "11.1 試験の構造（公式情報から確認できること）"
      },
      {
        "id": "s11-2",
        "title": "11.2 時間管理の基本戦略"
      },
      {
        "id": "s11-3",
        "title": "11.3 準備のチェックリスト"
      }
    ]
  },
  {
    "id": "s12",
    "title": "12. 用語集",
    "children": []
  },
  {
    "id": "s13",
    "title": "13. 参考文献・ソース URL 一覧",
    "children": [
      {
        "id": "s13-1",
        "title": "13.1 認定・試験の公式情報"
      },
      {
        "id": "s13-2",
        "title": "13.2 Domain 1: 境界防御・IPS（FW / FTD / FMC）"
      },
      {
        "id": "s13-3",
        "title": "13.3 Domain 2: セキュア接続・セグメンテーション"
      },
      {
        "id": "s13-4",
        "title": "13.4 Domain 3: セキュリティインフラ"
      },
      {
        "id": "s13-5",
        "title": "13.5 Domain 4: アイデンティティ・アクセス制御"
      },
      {
        "id": "s13-6",
        "title": "13.6 Domain 5: 高度な脅威防御・コンテンツセキュリティ"
      },
      {
        "id": "s13-7",
        "title": "13.7 本ガイドの限界と、次にやるべきこと"
      }
    ]
  }
];

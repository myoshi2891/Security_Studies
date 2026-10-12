import type { TocGroup } from './GuideSidebar';

export const toc: readonly TocGroup[] = [
  {
    "title": "基礎",
    "items": [
      {
        "id": "sec1",
        "title": "1. ATLASとは何か",
        "icon": "ti-info-circle"
      },
      {
        "id": "sec2",
        "title": "2. ATT&CKとの違い",
        "icon": "ti-arrows-diff"
      },
      {
        "id": "sec3",
        "title": "3. 全体構造",
        "icon": "ti-hierarchy-3"
      }
    ]
  },
  {
    "title": "戦術と技術",
    "items": [
      {
        "id": "sec4",
        "title": "4. 16のTactics",
        "icon": "ti-list-numbers"
      },
      {
        "id": "sec5",
        "title": "5. 重要Techniques解説",
        "icon": "ti-bug"
      },
      {
        "id": "sec6",
        "title": "6. 攻撃チェーン例",
        "icon": "ti-route"
      }
    ]
  },
  {
    "title": "防御と事例",
    "items": [
      {
        "id": "sec7",
        "title": "7. Mitigations",
        "icon": "ti-shield-check"
      },
      {
        "id": "sec8",
        "title": "8. Case Studies",
        "icon": "ti-file-text"
      }
    ]
  },
  {
    "title": "実践",
    "items": [
      {
        "id": "sec9",
        "title": "9. 導入ステップ",
        "icon": "ti-checklist"
      },
      {
        "id": "sec10",
        "title": "10. 他フレームワーク",
        "icon": "ti-stack-2"
      },
      {
        "id": "sec11",
        "title": "11. ツールとリソース",
        "icon": "ti-tools"
      },
      {
        "id": "sec12",
        "title": "12. まとめ",
        "icon": "ti-flag-check"
      },
      {
        "id": "sec13",
        "title": "13. 参考URL一覧",
        "icon": "ti-link"
      }
    ]
  }
];

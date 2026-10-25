import { expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { getSearchIndex } from '../../../lib/search';
import { diagrams } from './diagrams';
import { sourceTest, sourceHtml, sourceDocument, definitions, definitionOverrides, expectedDefinition, canonical, renderedPage } from './fidelity-helpers';

const counts = {
  'section.chapter': 17,
  'main h1,main h2,main h3,main h4': 82,
  'main h1': 1,
  'main h2': 17,
  'main h3': 60,
  'main h4': 4,
  table: 52,
  'th,td': 944,
  th: 152,
  td: 792,
  '.mermaid-target[data-diagram]': 9,
  'pre code': 2,
  details: 2,
  '.callout': 12,
  '.ref-card': 22,
  '.sidebar nav a': 77,
  '.nav-group': 17,
  input: 0,
  img: 0,
  form: 0,
};

test('immutable inventory retains all chapters, headings, tables, 944 cells (including 16 empty cells), diagrams, code, callouts, details and references', async () => {
  const page = await renderedPage();
  for (const [s, n] of Object.entries(counts)) {
    expect(page.querySelectorAll(s.replace(/(?<![-.])\bmain\b/g, '.guide-content')).length, s).toBe(n);
  }
  expect([...page.querySelectorAll('td')].filter(td => td.textContent === '')).toHaveLength(16);
});

sourceTest('all original IDs and internal links retain unique valid destinations', async () => {
  const page = await renderedPage();
  const ids = (d: Document) => [...d.querySelectorAll('[id]')].map(e => e.id);
  for (const id of ids(sourceDocument)) {
    expect(page.getElementById(id), id).not.toBeNull();
  }
  for (const link of page.querySelectorAll('a[href^="#"]')) {
    expect(page.getElementById(link.getAttribute('href')!.slice(1))).not.toBeNull();
  }
});

test('compiled page contains only safe elements and attributes', async () => {
  const page = await renderedPage();
  expect(page.querySelector('script,style,iframe,form,link')).toBeNull();
  const ids = [...page.querySelectorAll('[id]')].map(e => e.id);
  expect(new Set(ids).size).toBe(ids.length);
  for (const e of page.querySelectorAll('*')) {
    for (const a of e.attributes) {
      expect(a.name).not.toMatch(/^on/i);
      if (['href', 'src'].includes(a.name)) {
        expect(a.value).not.toMatch(/^(javascript:|data:text\/html)/i);
      }
    }
  }
});

test('static and dynamic search contain every complete source heading', async () => {
  const href = '/docs/threat-modeling-shostack-guide';
  const result = (await getSearchIndex()).find(p => p.href === href);
  expect(result).toBeDefined();
  expect(result!.headings).toEqual([
    '脅威モデリング（Threat Modeling）入門ガイド',
    '1脅威モデリングとは何か',
    '1.1 一文での定義',
    '1.2 日常の例え：家の防犯',
    '1.3 脅威モデリングが「やらないこと」',
    '1.4 書籍の位置づけ',
    '2なぜ今、脅威モデリングなのか（2026年の文脈）',
    '2.1 設計の欠陥は「コードがきれいでも」起こる',
    '2.2 AI が開発を加速しても、問いは変わらない',
    '2.3 規制・ガイダンスの流れ',
    '3全体像：4つの質問（Four Question Framework）',
    '3.1 4つの質問',
    '3.2 質問文の「言葉選び」にも意味がある',
    '3.3 プロセス全体のフロー',
    '4Step 0：準備（スコープ・参加者・成果物）',
    '4.1 スコープを決める',
    '4.2 参加者',
    '4.3 成果物の最小セット',
    '5Step 1：What are we working on?（システムをモデル化する）',
    '5.1 データフロー図（DFD）の5つの部品',
    '5.2 信頼境界（Trust Boundary）：最重要の概念',
    '5.3 DFD の例（Mermaid）',
    '5.4 良い図の条件',
    '5.5 「図」と「モデル」の違い（Shostack 氏の2026年の整理）',
    '5.6 クラウド環境での注意',
    '6Step 2：What can go wrong?（脅威を見つける）',
    '6.1 3つの切り口（書籍の整理）',
    '6.2 STRIDE：6種類の脅威',
    'STRIDE の覚え方（実務のコツ）',
    '6.3 STRIDE per element：図の部品ごとに当てはめる',
    '6.4 攻撃木（Attack Tree）',
    '6.5 攻撃ライブラリ（Attack Libraries）とキルチェーン',
    '6.6 カードゲーム：Elevation of Privilege（EoP）',
    '6.7 どの手法を選ぶか',
    '7Step 3：What are we going to do about it?（対処する）',
    '7.1 4つの対応方針',
    '7.2 優先順位の付け方',
    '7.3 「性質」から「対策」を引く表',
    '7.4 脅威を記録する（テンプレート）',
    '8Step 4：Did we do a good enough job?（検証する）',
    '8.1 検証の3つの観点',
    '8.2 部品 × STRIDE のチェック表（例）',
    '8.3 脅威モデルをテストにつなげる',
    '8.4 いつやり直すか',
    '9ハンズオン：メモ共有アプリを脅威モデリングする',
    '9.1 題材',
    '9.2 Q1：何に取り組んでいるか（DFD）',
    '9.3 Q2：何が起こりうるか（STRIDE per element）',
    '9.4 Q3：どう対処するか',
    '9.5 Q4：十分にできたか',
    '9.6 会議の進め方（60〜90分の例）',
    '10プライバシーの脅威モデリング（LINDDUN）',
    '10.1 LINDDUN の7種類',
    '10.2 STRIDE と LINDDUN の使い分け',
    '11AI・LLM・エージェントシステムの脅威モデリング',
    '11.1 基本姿勢：問いは変わらない、境界が増える',
    '11.2 LLM アプリの DFD（例）',
    '11.3 STRIDE を LLM に当てはめる',
    '11.4 参照すべき公開フレームワーク',
    '11.5 AI を「使って」脅威モデリングする場合',
    '12ツールとコードによる脅威モデリング',
    '12.1 主なツール',
    '12.2 pytm の最小例',
    '12.3 「コードとしての脅威モデル」の利点と注意',
    '13組織に根づかせる（Manifesto と Capabilities）',
    '13.1 Threat Modeling Manifesto',
    '価値観（左を右より重んじる）',
    'パターン（良い習慣）',
    'アンチパターン（避けたい習慣）',
    '13.2 Threat Modeling Capabilities',
    '13.3 小さく始めるためのロードマップ',
    '14初学者がやりがちな失敗',
    '15学習ロードマップと演習問題',
    '15.1 4週間の学習プラン',
    '15.2 演習問題',
    '16用語集',
    '17参考文献（情報源 URL）',
    '17.1 書籍',
    '17.2 実践者・コミュニティの一次情報',
    '17.3 脅威・攻撃の知識ベース',
    '17.4 ツール',
    '17.5 この資料の確からしさに関する注意',
  ]);
  const index = JSON.parse(readFileSync(new URL('../../../../public/search-index.json', import.meta.url), 'utf8'));
  expect(index.find((p: { href: string }) => p.href === href)).toEqual(result);
});

sourceTest('all 9 diagram attributes and definitions match the source containers', async () => {
  const page = await renderedPage();
  const actual = [...page.querySelectorAll('.mermaid-target[data-diagram]')];
  expect(actual).toHaveLength(9);
  for (const el of actual) {
    expect(el.getAttribute('data-definition')).toBe(expectedDefinition(el.getAttribute('data-diagram')!));
  }
  // 原本からの差分は明示した d8 の1件だけ
  expect([...definitions].filter(([id, source]) => diagrams[id] !== source).map(([id]) => id)).toEqual(Object.keys(definitionOverrides));
});

test('LLM DFD shows retrieved external content flowing back from WEB to ORCH as untrusted input (11.2)', () => {
  expect(diagrams.d8).toContain('ORCH <-->|"5 取得(外部コンテンツ＝信頼できない入力)"| WEB');
  expect(diagrams.d8).not.toContain('ORCH -->|"5 取得"| WEB');
});

test('both code examples preserve exact whitespace, source bytes, language classes and syntax spans', async () => {
  const page = await renderedPage();
  const blocks = [...page.querySelectorAll('pre code')];
  expect(blocks.map(e => e.className)).toEqual(['language-markdown', 'language-python']);
  expect(blocks.map(e => createHash('sha256').update(e.textContent ?? '').digest('hex'))).toEqual([
    '795d3f7be81067f4b1d5c44988640a91c7ac21572dccaf0e6dd6a64f5b08e272',
    'c795b2aa80c32030b0911fc242b7773e48b2d76170a2a76455eb59234acec65f',
  ]);
  for (const block of blocks) {
    expect(block.querySelectorAll('[class^="hljs-"]').length).toBeGreaterThan(0);
  }
});

sourceTest('mutation probes reject deleted cells, callouts, emphasis, code, details and reference cards', async () => {
  const page = await renderedPage();
  for (const selector of ['td', '.callout', 'strong', 'pre code', '.ref-card', '#ch15 details', 'h2 .num', '.nav-link .n']) {
    const original = page.querySelector(selector)!;
    expect(original).not.toBeNull();
    const before = canonical(original);
    const clone = original.cloneNode(true) as Element;
    clone.replaceChildren();
    expect(canonical(clone)).not.toEqual(before);
  }
});

sourceTest('original HTML remains byte exact', () =>
  expect(createHash('sha256').update(sourceHtml).digest('hex')).toBe(
    '4691e6eaab79de3ded984591781fc0e9e9f09a07746231369d248e3ca3ba2d3d',
  ),
);

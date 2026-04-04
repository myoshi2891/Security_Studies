✦ 承知いたしました。次回再開時にスムーズに作業を引き継げるよう、
現在発生している問題の原因と、承認済みの修正プラン（対応方針）
をまとめました。

---

【引き継ぎ事項：Hydrationエラーの修正について】

1. 発生している問題
Security Approach 2026（approach/page.mdx）および Security
Architecture（architecture/page.mdx）の画面において、ブラウザ
のコンソールに以下のHydrationエラーが発生しています。

> [browser] <p> cannot contain a nested <h3>.
[browser] Uncaught Error: Hydration failed because the
server rendered HTML didn't match the client.
>
1. 根本原因（Root Cause）
前回の修正で文章を省略せずに <SectionCard>
コンポーネント内に完全なテキストとして復元した際、カード内の「
素のテキスト段落」と「明示的なHTMLタグである <h3
className="...">」が混在する状態になりました。
Next.jsのMDXパーサーの仕様上、JSXコンポーネント（<SectionCard>
）の内側にあるテキストの塊は自動的に段落（<p>タグ）でラップさ
れますが、インデントや改行の解釈の都合で、自動生成された <p>
タグの中に直接 <h3>
タグが入れ子になってしまう（<p>...<h3>...</h3>...</p>）という
不正なHTML構造が生成されてしまい、これがReactのHydration（サー
バーとクライアントのHTMLの一致確認）で弾かれています。
2. 次回行う修正プラン（承認済み）
このパーサーの入れ子問題を最も安全に回避するため、対象の2ファ
イル内に記述されているすべての見出し用タグ（<h3>）を、セマンテ
ィックな問題を起こさない <div> タグに変更します。
- 変更前: <h3 className="flex items-center gap-2.5
...">見出しテキスト</h3>
- 変更後: <div className="flex items-center gap-2.5
...">見出しテキスト</div>
※
クラス名（Tailwindのスタイル指定）はそのまま維持されるため、画
面上の見た目（青や緑のアクセントラインが付いた見出しのデザイン
）は全く変わりません。
1. 次回のアクション
作業を再開する際は、以下のパスに保存されている承認済みのプラン
ファイルに沿って自動修正（Replace）を実行します。
.../plans/fix-h3-hydration.md

---

次回、「引き継ぎ内容をもとに修正を実行してください」とお声がけ
いただければ、直ちに2つのファイル（approach/page.mdx と
architecture/page.mdx）の <h3> を <div>
に置換する作業を実行し、エラーを解消いたします。よろしくお願い
いたします。

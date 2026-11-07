import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
hljs.registerLanguage('python', python);

/** 原本のコード文字列と属性を保ったまま、サーバー側でハイライトする */
export function CodeSample({ code, className }: { code: string; className: string }) {
  return (
    <code
      className={`${className} hljs`}
      dangerouslySetInnerHTML={{ __html: hljs.highlight(code, { language: 'python' }).value }}
    />
  );
}

import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import javascript from 'highlight.js/lib/languages/javascript';
hljs.registerLanguage('python', python); hljs.registerLanguage('javascript', javascript);
/** Server highlighting preserves the exact escaped source text and source language class. */
export function GuideCode({ code, language }: { code: string; language: string }) {
  if (language === 'plain') return <code>{code}</code>;
  return <code className={`language-${language}`} dangerouslySetInnerHTML={{ __html: hljs.highlight(code, { language }).value }} />;
}

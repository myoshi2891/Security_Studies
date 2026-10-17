import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import bash from 'highlight.js/lib/languages/bash';
hljs.registerLanguage('python', python); hljs.registerLanguage('bash', bash);
/** Server highlighting preserves the exact escaped source text and source language class. */
export function GuideCode({ code, language }: { code: string; language: string }) {
  if (language === 'plain' || !hljs.getLanguage(language)) return <code>{code}</code>;
  return <code className={`language-${language}`} dangerouslySetInnerHTML={{ __html: hljs.highlight(code, { language }).value }} />;
}

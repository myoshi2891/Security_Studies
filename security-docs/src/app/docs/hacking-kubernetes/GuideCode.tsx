import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import yaml from 'highlight.js/lib/languages/yaml';
import json from 'highlight.js/lib/languages/json';
import python from 'highlight.js/lib/languages/python';
hljs.registerLanguage('bash', bash); hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('json', json); hljs.registerLanguage('python', python);
/** Server highlighting preserves the exact escaped source text and source language class. */
export function GuideCode({ code, language }: { code: string; language: string }) {
  if (language === 'plain') return <code>{code}</code>;
  return <code className={`language-${language}`} dangerouslySetInnerHTML={{ __html: hljs.highlight(code, { language }).value }} />;
}

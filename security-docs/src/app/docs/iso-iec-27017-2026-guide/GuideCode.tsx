import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import yaml from 'highlight.js/lib/languages/yaml';

hljs.registerLanguage('python', python);
hljs.registerLanguage('yaml', yaml);

/** Server highlighting retains the source text and original language hooks. */
export function GuideCode({ code, language }: { code: string; language: string }) {
  return <code className={`language-${language}`} dangerouslySetInnerHTML={{ __html: hljs.highlight(code, { language }).value }} />;
}

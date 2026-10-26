import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import plaintext from 'highlight.js/lib/languages/plaintext';
hljs.registerLanguage('python', python);
hljs.registerLanguage('json', json);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('plaintext', plaintext);

/** Highlight code server-side while retaining exact text and original attributes. */
export function CodeSample({ code, className }: { code: string; className: string }) {
  const language = className.replace('language-', '');
  return (
    <code
      className={`${className} hljs`}
      dangerouslySetInnerHTML={{
        __html: hljs.highlight(code, { language: hljs.getLanguage(language) ? language : 'plaintext' }).value,
      }}
    />
  );
}

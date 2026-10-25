import hljs from 'highlight.js/lib/core';
import markdown from 'highlight.js/lib/languages/markdown';
import python from 'highlight.js/lib/languages/python';
import plaintext from 'highlight.js/lib/languages/plaintext';

for (const [name, language] of Object.entries({ markdown, python, plaintext })) {
  hljs.registerLanguage(name, language);
}

/** Highlight code server-side while retaining exact text and original attributes. */
export function CodeSample({ code, className }: { code: string; className: string }) {
  const language = className.replace('language-', '');
  return (
    <code
      className={className}
      dangerouslySetInnerHTML={{
        __html: hljs.highlight(code, { language: hljs.getLanguage(language) ? language : 'plaintext' }).value,
      }}
    />
  );
}

import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';

hljs.registerLanguage('python', python);

/** Server-side highlighting escapes the source and avoids legacy CDN scripts. */
export function PythonCode({ code }: { code: string }) {
  return <code className="language-python" dangerouslySetInnerHTML={{ __html: hljs.highlight(code, { language: 'python' }).value }} />;
}

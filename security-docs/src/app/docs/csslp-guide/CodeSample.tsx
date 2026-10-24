import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
hljs.registerLanguage('python', python);
/** Highlight locally while retaining the source code text and escaping embedded HTML. */
export function CodeSample({ code }: { code: string }) {
 return <code className="language-python" dangerouslySetInnerHTML={{ __html: hljs.highlight(code, { language: 'python' }).value }} />;
}

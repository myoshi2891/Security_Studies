import hljs from 'highlight.js/lib/core';
import java from 'highlight.js/lib/languages/java';

hljs.registerLanguage('java', java);

/** Trusted highlighter escapes source code while retaining every literal character. */
export function JavaCode({ code }: { code: string }) {
  return <code className="language-java" dangerouslySetInnerHTML={{ __html: hljs.highlight(code, { language: 'java' }).value }} />;
}

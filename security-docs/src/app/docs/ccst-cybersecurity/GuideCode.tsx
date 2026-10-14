import hljs from 'highlight.js/lib/core';
import powershell from 'highlight.js/lib/languages/powershell';

hljs.registerLanguage('powershell', powershell);
hljs.registerLanguage('ccst-ios', () => ({
  name: 'ios', keywords: { $pattern: /[\w-]+/, keyword: 'ip access-list access-group extended standard permit deny interface remark log in out eq any host', literal: 'tcp udp icmp' },
  contains: [{ className: 'number', begin: /\b\d{1,3}(?:\.\d{1,3}){3}\b/ }, { className: 'number', begin: /\b\d+\b/ }, { className: 'comment', begin: /^!/, end: /$/ }],
}));
/** Highlight on the server; the source text is escaped by highlight.js. */
export function GuideCode({ code, language }: { code: string; language: 'ios' | 'powershell' | 'plain' }) {
  if (language === 'plain') return <code className="nohighlight">{code}</code>;
  return <code className={`language-${language}`} dangerouslySetInnerHTML={{ __html: hljs.highlight(code, { language: language === 'ios' ? 'ccst-ios' : language }).value }} />;
}

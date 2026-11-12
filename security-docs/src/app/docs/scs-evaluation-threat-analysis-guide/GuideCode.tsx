import core from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
// Keep the source guide's Bash highlighting private to this page.
const hljs = core.newInstance();
hljs.registerLanguage('bash', bash);
/** Highlight locally while retaining exact source whitespace and copyable text. */
export function GuideCode({source,className}:{source:string;className:string}){
 const language=/language-([\w-]+)/.exec(className)?.[1];
 if(!language||!hljs.getLanguage(language))return <code className={className}>{source}</code>;
 return <code className={`${className} hljs`} dangerouslySetInnerHTML={{__html:hljs.highlight(source,{language}).value}}/>;
}

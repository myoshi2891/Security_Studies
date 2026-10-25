import hljs from 'highlight.js/lib/core';
import plaintext from 'highlight.js/lib/languages/plaintext';
hljs.registerLanguage('plaintext',plaintext);
import bash from 'highlight.js/lib/languages/bash';
hljs.registerLanguage('bash',bash);
/** Local highlighting retains the exact source text and escapes HTML. */
export function CodeSample({code,language}:{code:string;language:string}){return <code className={'language-'+language} dangerouslySetInnerHTML={{__html:hljs.getLanguage(language)?hljs.highlight(code,{language}).value:hljs.highlight(code,{language:'plaintext'}).value}} />;}

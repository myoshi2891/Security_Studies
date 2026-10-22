import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import nginx from 'highlight.js/lib/languages/nginx';
import bash from 'highlight.js/lib/languages/bash';
hljs.registerLanguage('python',python);hljs.registerLanguage('nginx',nginx);hljs.registerLanguage('bash',bash);
/** Server highlighting retains exact source code and avoids executable CDN scripts. */
export function GuideCode({code,language}:{code:string;language:string}){return <code className={`language-${language} hljs`} dangerouslySetInnerHTML={{__html:hljs.highlight(code,{language,ignoreIllegals:true}).value}} />;}

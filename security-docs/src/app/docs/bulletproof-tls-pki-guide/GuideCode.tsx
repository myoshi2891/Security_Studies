import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import http from 'highlight.js/lib/languages/http';
import nginx from 'highlight.js/lib/languages/nginx';
import bash from 'highlight.js/lib/languages/bash';
hljs.registerLanguage('python',python);hljs.registerLanguage('http',http);hljs.registerLanguage('nginx',nginx);hljs.registerLanguage('bash',bash);
/** Highlight on the server while retaining exact source code text. */
export function GuideCode({code,language}:{code:string;language:string}){return <code className={`language-${language} hljs`} dangerouslySetInnerHTML={{__html:hljs.highlight(code,{language,ignoreIllegals:true}).value}} />;}

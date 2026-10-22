import hljs from 'highlight.js';
/** Highlight on the server while retaining exact source code text. */
export function GuideCode({code,language}:{code:string;language:string}){return <code className={`language-${language} hljs`} dangerouslySetInnerHTML={{__html:hljs.highlight(code,{language,ignoreIllegals:true}).value}} />;}

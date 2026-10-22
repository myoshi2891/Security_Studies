import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import yaml from 'highlight.js/lib/languages/yaml';
hljs.registerLanguage('python',python);hljs.registerLanguage('yaml',yaml);
/** Highlight on the server while keeping original source bytes and language hooks. */
export function GuideCode({code,language}:{code:string;language:string}){return <code className={`language-${language}`} dangerouslySetInnerHTML={{__html:hljs.highlight(code,{language}).value}} />;}

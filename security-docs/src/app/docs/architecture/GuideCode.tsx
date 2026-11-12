import core from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import python from 'highlight.js/lib/languages/python';
import yaml from 'highlight.js/lib/languages/yaml';
const hljs = core.newInstance();
for (const [name, language] of Object.entries({ javascript, json, python, yaml })) {
 hljs.registerLanguage(name, language);
}
/** Highlight locally while retaining exact source whitespace and copyable text. */
export function GuideCode({source,className}:{source:string;className:string}){
 const language=/language-([\w-]+)/.exec(className)?.[1];
 if(!language||!hljs.getLanguage(language))return <code className={className}>{source}</code>;
 return <code className={`${className} hljs`} dangerouslySetInnerHTML={{__html:hljs.highlight(source,{language}).value}}/>;
}

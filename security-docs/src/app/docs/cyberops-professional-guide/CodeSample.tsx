import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import http from 'highlight.js/lib/languages/http';
import bash from 'highlight.js/lib/languages/bash';
import yaml from 'highlight.js/lib/languages/yaml';
import powershell from 'highlight.js/lib/languages/powershell';
import json from 'highlight.js/lib/languages/json';
import plaintext from 'highlight.js/lib/languages/plaintext';
for(const [name,language] of Object.entries({python,http,bash,yaml,powershell,json,plaintext}))hljs.registerLanguage(name,language);
/** Unsupported source languages retain exact escaped text and original attributes. */
export function CodeSample({code,className,dataHl}:{code:string;className:string;dataHl?:string}){
 const language=className.replace('language-','');
 return <code className={className} data-hl={dataHl} dangerouslySetInnerHTML={{__html:hljs.highlight(code,{language:hljs.getLanguage(language)?language:'plaintext'}).value}} />;
}

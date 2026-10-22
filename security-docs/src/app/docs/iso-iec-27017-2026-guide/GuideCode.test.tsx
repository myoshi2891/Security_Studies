import { expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { sourceTest, sourceDocument } from './fidelity-helpers';
sourceTest('both source snippets retain every character, language and local syntax highlighting',async()=>{
 const {GuideCode}=await import(new URL('./GuideCode.tsx',import.meta.url).href);
 const samples=[...sourceDocument.querySelectorAll('pre code')];expect(samples).toHaveLength(2);
 for(const sample of samples){const language=sample.className.replace('language-','');const html=renderToStaticMarkup(createElement(GuideCode,{code:sample.textContent!,language}));const doc=new DOMParser().parseFromString(html,'text/html');expect(doc.querySelector('code')!.textContent).toBe(sample.textContent);expect(doc.querySelector('code')!.className).toBe(sample.className);expect(doc.querySelector('[class^="hljs-"]')).not.toBeNull();}
});
test('syntax highlighting escapes markup and retains Python and YAML whitespace',async()=>{
 const {GuideCode}=await import(new URL('./GuideCode.tsx',import.meta.url).href);
 for(const language of ['python','yaml']){const code='  # <script>alert("x")</script>\nvalue: "<&>"\n';const html=renderToStaticMarkup(createElement(GuideCode,{code,language}));const doc=new DOMParser().parseFromString(html,'text/html');expect(doc.querySelector('script')).toBeNull();expect(doc.querySelector('code')!.textContent).toBe(code);}
});

import {expect,test} from 'bun:test';
import {spawnSync} from 'node:child_process';

test('Architecture highlights all four source languages without changing the shared registry',()=>{
 const samples={javascript:'const answer = true;',json:'{"answer": true}',python:'def answer():\n    return True',yaml:'answer: true'};
 const probe=spawnSync(process.execPath,['--eval',`
  const shared=(await import('highlight.js/lib/core')).default;
  const before=shared.listLanguages().sort();
  const {GuideCode}=await import('./GuideCode.tsx');
  const {createElement}=await import('react');
  const {renderToStaticMarkup}=await import('react-dom/server');
  const markup=Object.entries(${JSON.stringify(samples)}).map(([language,source])=>renderToStaticMarkup(createElement(GuideCode,{source,className:'language-'+language})));
  console.log(JSON.stringify({before,after:shared.listLanguages().sort(),markup}));
 `],{cwd:import.meta.dir,encoding:'utf8',timeout:10000});
 expect(probe.error).toBeUndefined();expect(probe.status,probe.stderr).toBe(0);
 const {before,after,markup}=JSON.parse(probe.stdout);expect(after).toEqual(before);
 for(const [i,[language,source]] of Object.entries(samples).entries()){
  const code=new DOMParser().parseFromString(markup[i],'text/html').querySelector('code')!;
  expect(code.classList.contains('language-'+language)).toBe(true);
  expect(code.textContent).toBe(source);expect(code.querySelector('span[class^="hljs-"]')).not.toBeNull();
 }
});

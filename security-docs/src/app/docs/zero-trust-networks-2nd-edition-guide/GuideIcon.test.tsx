import {expect,test} from 'bun:test';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {GuideIcon} from './GuideIcon';
test('all seven original icon meanings retain bundled SVG equivalents including the shield lock',()=>{
 const icons={'ti-shield-lock':'shield-lock','ti-book-2':'book-open','ti-info-circle':'info','ti-list-details':'list','ti-help-circle':'circle-help','ti-chevron-down':'chevron-down','ti-external-link':'external-link'} as const;
 for(const [name,svg] of Object.entries(icons)){
  const html=renderToStaticMarkup(createElement(GuideIcon,{name:name as keyof typeof icons,className:`ti ${name}`}));
  expect(html).toContain(`lucide-${svg}`);expect(html).toContain('aria-hidden="true"');
 }
});

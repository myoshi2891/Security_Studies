import {expect,test} from 'bun:test';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {GuideIcon} from './GuideIcon';
test('all seven source icon meanings are bundled as decorative SVGs with original class hooks',()=>{
 const icons={'ti-lock-square':'lock-square','ti-bulb':'lightbulb','ti-info-circle':'info','ti-alert-triangle':'triangle-alert','ti-check':'check','ti-external-link':'external-link','ti-calendar':'calendar'} as const;
 for(const [name,svg] of Object.entries(icons)){const html=renderToStaticMarkup(createElement(GuideIcon,{name:name as keyof typeof icons,className:`ti ${name}`}));expect(html).toContain(`lucide-${svg}`);expect(html).toContain(`ti ${name}`);expect(html).toContain('aria-hidden="true"');}
});

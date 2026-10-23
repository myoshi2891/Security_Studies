import {afterEach,expect,test} from 'bun:test';
import {createElement} from 'react';
import {cleanup,fireEvent,render} from '@testing-library/react';
import {evaluatedPage} from './fidelity-helpers';
afterEach(cleanup);
test('all eight original checklist labels toggle independently and leave exercise and checklist numbering intact',async()=>{
 const {default:Page}=await evaluatedPage();const saved=globalThis.IntersectionObserver;globalThis.IntersectionObserver=class{observe(){}disconnect(){}} as unknown as typeof IntersectionObserver;
 try{const view=render(createElement(Page));const labels=[...view.container.querySelectorAll<HTMLLabelElement>('.checklist label')];const boxes=[...view.container.querySelectorAll<HTMLInputElement>('.checklist input')];expect(labels).toHaveLength(8);expect(boxes).toHaveLength(8);
 for(const [i,label] of labels.entries()){expect(boxes[i]).toHaveAccessibleName(/\S/);expect(boxes[i].checked).toBe(false);fireEvent.click(label);expect(boxes[i].checked).toBe(true);expect(boxes.filter(b=>b.checked)).toHaveLength(i+1);}
 fireEvent.click(labels[0]);expect(boxes[0].checked).toBe(false);expect(boxes.slice(1).every(b=>b.checked)).toBe(true);boxes[0].focus();expect(document.activeElement).toBe(boxes[0]);expect(view.container.querySelectorAll('h3.ex + ol > li')).toHaveLength(31);expect(view.container.querySelectorAll('.chk-num')).toHaveLength(8);
 }finally{globalThis.IntersectionObserver=saved;}
});

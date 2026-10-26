import {expect,test} from 'bun:test';
import {createHash} from 'node:crypto';
import inventory from '../../../../../docs/migration-inventory/cgrc-guide.json';
import {chapterContracts,canonical,renderedPage} from './fidelity-helpers';
const ids=['reading','ch0','ch1','ch2','ch3'];
chapterContracts(ids);
for(const id of ids)test(id+': frozen complete source structure survives without the original',async()=>{
 const selector='#'+id,node=(await renderedPage()).querySelector(selector);expect(node).not.toBeNull();
 expect(createHash('sha256').update(JSON.stringify(canonical(node!))).digest('hex')).toBe(inventory.structures[selector as keyof typeof inventory.structures]);
});

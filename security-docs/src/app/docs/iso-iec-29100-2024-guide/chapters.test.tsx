import {expect,test} from 'bun:test';
import {createHash} from 'node:crypto';
import inventory from '../../../../../docs/migration-inventory/iso-iec-29100-2024-guide.json';
import {chapterContracts,renderedPage,canonical} from './fidelity-helpers';
const selectors=Object.keys(inventory.structures).filter(s=>s.startsWith('[id='));
chapterContracts(selectors.map(s=>s.slice(5,-2)));
for(const selector of selectors)test(selector+': fixed complete structural SHA-256 (also without originals)',async()=>{
 const node=(await renderedPage()).querySelector(selector);expect(node).not.toBeNull();
 expect(createHash('sha256').update(JSON.stringify(canonical(node!))).digest('hex')).toBe(inventory.structures[selector as keyof typeof inventory.structures]);
});

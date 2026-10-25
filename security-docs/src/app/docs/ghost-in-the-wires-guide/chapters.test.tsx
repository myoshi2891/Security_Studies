import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import inventory from '../../../../../docs/migration-inventory/ghost-in-the-wires-guide.json';
import {chapterContracts, renderedPage, canonical} from './fidelity-helpers';
const ids = Array.from({length:17},(_,i)=>'step-'+i);
chapterContracts(ids);
for(const id of ids) test(`${id}: fixed structure hash covers every cell, list item, reference, date and answer without source archive`,async()=>{
 const node=(await renderedPage()).getElementById(id);
 expect(node).not.toBeNull();
 expect(createHash('sha256').update(JSON.stringify(canonical(node!))).digest('hex')).toBe(inventory.structures[('#'+id) as keyof typeof inventory.structures]);
});

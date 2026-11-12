import {expect,test} from 'bun:test';
import {renderedPage,sourceTest,sourceDocument,canonical,structure,inventory} from './fidelity-helpers';
for(const id of ["ch-0", "s-0-1", "s-0-2", "s-0-3", "ch-1", "s-1-1", "s-1-2", "s-1-3", "ch-2", "s-2-1", "s-2-2", "s-2-3", "ch-3", "step-1", "step-2", "step-3", "ch-4", "step-4", "step-5", "step-6"]) {
 test(`${id}: fixed complete source structure`,async()=>{const el=(await renderedPage()).getElementById(id);expect(el).not.toBeNull();expect(structure(el!)).toBe(inventory.structures[('#'+id) as keyof typeof inventory.structures]);});
 sourceTest(`${id}: independent full original DOM comparison`,async()=>expect(canonical((await renderedPage()).getElementById(id)!)).toEqual(canonical(sourceDocument.getElementById(id)!)));
}

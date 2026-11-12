import {expect,test} from 'bun:test';
import {renderedPage,sourceTest,sourceDocument,canonical,structure,inventory} from './fidelity-helpers';
for(const id of ["ch-5", "step-7", "step-8", "step-9", "ch-6", "step-10", "step-11", "ch-7", "s-7-1", "s-7-2", "ch-8", "s-8-1", "s-8-2", "s-8-3", "ch-9", "s-9-1", "s-9-2", "s-9-3", "s-9-4"]) {
 test(`${id}: fixed complete source structure`,async()=>{const el=(await renderedPage()).getElementById(id);expect(el).not.toBeNull();expect(structure(el!)).toBe(inventory.structures[('#'+id) as keyof typeof inventory.structures]);});
 sourceTest(`${id}: independent full original DOM comparison`,async()=>expect(canonical((await renderedPage()).getElementById(id)!)).toEqual(canonical(sourceDocument.getElementById(id)!)));
}

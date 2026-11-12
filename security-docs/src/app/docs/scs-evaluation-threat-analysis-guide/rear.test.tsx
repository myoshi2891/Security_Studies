import {expect,test} from 'bun:test';
import {renderedPage,sourceTest,sourceDocument,canonical,structure,inventory} from './fidelity-helpers';
for(const id of ["s58", "s59", "s60", "s61", "s62", "s63", "s64", "s65", "s66", "s67", "s68", "s69", "s70", "s71", "s72", "s73", "s74", "s75", "s76", "s77", "s78", "s79", "s80", "s81", "s82", "s83", "s84", "s85"]) {
 test(`${id}: fixed complete source structure`,async()=>{const el=(await renderedPage()).getElementById(id);expect(el).not.toBeNull();expect(structure(el!)).toBe(inventory.structures[('#'+id) as keyof typeof inventory.structures]);});
 sourceTest(`${id}: independent full original DOM comparison`,async()=>expect(canonical((await renderedPage()).getElementById(id)!)).toEqual(canonical(sourceDocument.getElementById(id)!)));
}

import {expect,test} from 'bun:test';
import {renderedPage,sourceTest,sourceDocument,canonical,structure,inventory} from './fidelity-helpers';
for(const id of ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s10", "s11", "s12", "s13", "s14", "s15", "s16", "s17", "s18", "s19", "s20", "s21", "s22", "s23", "s24", "s25", "s26", "s27", "s28"]) {
 test(`${id}: fixed complete source structure`,async()=>{const el=(await renderedPage()).getElementById(id);expect(el).not.toBeNull();expect(structure(el!)).toBe(inventory.structures[('#'+id) as keyof typeof inventory.structures]);});
 sourceTest(`${id}: independent full original DOM comparison`,async()=>expect(canonical((await renderedPage()).getElementById(id)!)).toEqual(canonical(sourceDocument.getElementById(id)!)));
}

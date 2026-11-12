import {expect,test} from 'bun:test';
import {renderedPage,sourceTest,sourceDocument,canonical,structure,inventory} from './fidelity-helpers';
for(const id of ["s29", "s30", "s31", "s32", "s33", "s34", "s35", "s36", "s37", "s38", "s39", "s40", "s41", "s42", "s43", "s44", "s45", "s46", "s47", "s48", "s49", "s50", "s51", "s52", "s53", "s54", "s55", "s56", "s57"]) {
 test(`${id}: fixed complete source structure`,async()=>{const el=(await renderedPage()).getElementById(id);expect(el).not.toBeNull();expect(structure(el!)).toBe(inventory.structures[('#'+id) as keyof typeof inventory.structures]);});
 sourceTest(`${id}: independent full original DOM comparison`,async()=>expect(canonical((await renderedPage()).getElementById(id)!)).toEqual(canonical(sourceDocument.getElementById(id)!)));
}

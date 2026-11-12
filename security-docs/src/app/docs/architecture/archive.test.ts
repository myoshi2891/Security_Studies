import {expect,test} from 'bun:test';
import {existsSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import inventory from '../../../../../docs/migration-inventory/architecture.json';
for(const ext of ['html','md'] as const){
 const filename=`Security-architecture-implementation-guide.${ext}`,original=resolve(import.meta.dir,'../../../../../',filename),archived=resolve(import.meta.dir,'../../../../../archive/security-guides',filename);
 test(`root ${ext} original is archived instead of left behind`,()=>expect(existsSync(original)).toBe(false));
 test.skipIf(!existsSync(original)&&!existsSync(archived))(`archived ${ext} retains original bytes independently`,()=>{
  expect(existsSync(archived)).toBe(true);expect(createHash('sha256').update(readFileSync(archived)).digest('hex')).toBe(inventory.originals[ext]);
 });
}
test('comparison helper uses only the content-category archive after migration',()=>{
 const helper=readFileSync(new URL('./fidelity-helpers.ts',import.meta.url),'utf8');
 expect(helper).toContain('archive/security-guides/Security-architecture-implementation-guide.html');
 expect(helper).not.toContain("'../../../../../Security-architecture-implementation-guide.html'");
});

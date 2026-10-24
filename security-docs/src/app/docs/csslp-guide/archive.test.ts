import {expect,test} from 'bun:test';
import {existsSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(import.meta.dir,'../../../../..');
const name='Csslp-guide';
const archive=resolve(root,'archive/security-certifications');
test('migrated HTML and Markdown no longer remain at repository root',()=>{
 for(const ext of ['html','md'])expect(existsSync(resolve(root,`${name}.${ext}`))).toBe(false);
});
test('source comparisons only read the certification archive lazily without root fallback',()=>{
 const helper=readFileSync(new URL('./fidelity-helpers.ts',import.meta.url),'utf8');
 expect(helper).toContain('../../../../../archive/security-certifications/Csslp-guide.html');
 expect(helper).not.toContain('../../../../../Csslp-guide.html');
 expect(helper.indexOf("readFileSync(sourcePath, 'utf8')")).toBeGreaterThan(helper.indexOf('function loadSource()'));
});
test.skipIf(!existsSync(resolve(archive,`${name}.html`)))('archived html matches original SHA-256 byte for byte',()=>{
 expect(createHash('sha256').update(readFileSync(resolve(archive,`${name}.html`))).digest('hex')).toBe('584a20254a4a3be8f9818983a84df8ce4aeb33ae19003b4fe85a589e5c3027c4');
});
test.skipIf(!existsSync(resolve(archive,`${name}.md`)))('archived md matches original SHA-256 byte for byte',()=>{
 expect(createHash('sha256').update(readFileSync(resolve(archive,`${name}.md`))).digest('hex')).toBe('0ee920d47e422e6098d7431207b2bf46c640ff8500ddc917339a4395ec5429b1');
});

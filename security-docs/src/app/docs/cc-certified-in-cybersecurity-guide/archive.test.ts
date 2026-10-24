import {expect,test} from 'bun:test';
import {existsSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(import.meta.dir,'../../../../..');
const name='Cc-certified-in-cybersecurity-guide';
const archive=resolve(root,'archive/security-certifications');
test('migrated HTML and Markdown originals no longer remain at repository root',()=>{
 for(const ext of ['html','md'])expect(existsSync(resolve(root,`${name}.${ext}`))).toBe(false);
});
test('source comparisons use only the certification archive',()=>{
 expect(readFileSync(new URL('./fidelity-helpers.ts',import.meta.url),'utf8')).toContain('../../../../../archive/security-certifications/Cc-certified-in-cybersecurity-guide.html');
});
test.skipIf(!existsSync(resolve(archive,`${name}.html`)))('archived html matches the original SHA-256 byte for byte',()=>{
 expect(createHash('sha256').update(readFileSync(resolve(archive,`${name}.html`))).digest('hex')).toBe('6f4dda98c1b49fa1710a3a66849247e6717f7640e23782af4f14d211f094d399');
});
test.skipIf(!existsSync(resolve(archive,`${name}.md`)))('archived md matches the original SHA-256 byte for byte',()=>{
 expect(createHash('sha256').update(readFileSync(resolve(archive,`${name}.md`))).digest('hex')).toBe('07d32f20279db4775a4a36905e217b8c5ef2c384617e635bd6ec1837612f4406');
});

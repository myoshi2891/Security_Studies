import {expect,test} from 'bun:test';
import {existsSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(import.meta.dir,'../../../../..');
const name='Cissp-guide';
const archive=resolve(root,'archive/security-certifications');
test('migrated HTML and Markdown originals no longer remain at repository root',()=>{
 for(const ext of ['html','md'])expect(existsSync(resolve(root,`${name}.${ext}`))).toBe(false);
});
test('source comparisons use only the certification archive',()=>{
 expect(readFileSync(new URL('./fidelity-helpers.ts',import.meta.url),'utf8')).toContain('../../../../../archive/security-certifications/Cissp-guide.html');
});
test.skipIf(!existsSync(resolve(archive,`${name}.html`)))('archived html matches the original SHA-256 byte for byte',()=>{
 expect(createHash('sha256').update(readFileSync(resolve(archive,`${name}.html`))).digest('hex')).toBe('31fd243bc181fa3b276bb89d3a7e8d2ed618559a5a1ff2c85365c3f994405155');
});
test.skipIf(!existsSync(resolve(archive,`${name}.md`)))('archived md matches the original SHA-256 byte for byte',()=>{
 expect(createHash('sha256').update(readFileSync(resolve(archive,`${name}.md`))).digest('hex')).toBe('26ace31c4f8257fa6b306e6cd64c96e048beaa7ace66161520c0de66083ba94b');
});

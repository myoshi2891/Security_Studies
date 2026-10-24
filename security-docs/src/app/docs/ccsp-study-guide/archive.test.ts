import {expect,test} from 'bun:test';
import {existsSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(import.meta.dir,'../../../../..');
const name='Ccsp-study-guide';
const archive=resolve(root,'archive/security-certifications');
test('migrated HTML and Markdown originals no longer remain at repository root',()=>{
 for(const ext of ['html','md'])expect(existsSync(resolve(root,`${name}.${ext}`))).toBe(false);
});
test('source comparisons use only the certification archive',()=>{
 expect(readFileSync(new URL('./fidelity-helpers.ts',import.meta.url),'utf8')).toContain('../../../../../archive/security-certifications/Ccsp-study-guide.html');
});
test.skipIf(!existsSync(resolve(archive,`${name}.html`)))('archived html matches the original SHA-256 byte for byte',()=>{
 expect(createHash('sha256').update(readFileSync(resolve(archive,`${name}.html`))).digest('hex')).toBe('a5f3879d83cf8096347cdb44fffd93dd2e6d1e8eab21c5ec1da4e9fe0420b979');
});
test.skipIf(!existsSync(resolve(archive,`${name}.md`)))('archived md matches the original SHA-256 byte for byte',()=>{
 expect(createHash('sha256').update(readFileSync(resolve(archive,`${name}.md`))).digest('hex')).toBe('e092328c9671e0100e7ae74911c36f04b3e75c6d43b31a374fc1b00f3ebe9505');
});

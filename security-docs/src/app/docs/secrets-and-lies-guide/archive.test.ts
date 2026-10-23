import {expect,test} from 'bun:test';
import {existsSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(import.meta.dir,'../../../../..');
const name='Secrets-and-lies-guide';
test('original HTML and Markdown no longer remain at repository root',()=>{
 for(const ext of ['html','md'])expect(existsSync(resolve(root,`${name}.${ext}`))).toBe(false);
});
test('fidelity tests read only the archived HTML source',()=>{
 expect(readFileSync(new URL('./fidelity-helpers.ts',import.meta.url),'utf8')).toContain('../../../../../archive/security-guides/Secrets-and-lies-guide.html');
});
test.skipIf(!existsSync(resolve(root,'archive/security-guides/Secrets-and-lies-guide.html')))('archived html exactly matches original SHA-256',()=>{
 expect(createHash('sha256').update(readFileSync(resolve(root,'archive/security-guides/Secrets-and-lies-guide.html'))).digest('hex')).toBe('8f0c4769761cda8724df25eeb5cb38940173e2b80e17235b9ae43f1b5506a7fa');
});
test.skipIf(!existsSync(resolve(root,'archive/security-guides/Secrets-and-lies-guide.md')))('archived md exactly matches original SHA-256',()=>{
 expect(createHash('sha256').update(readFileSync(resolve(root,'archive/security-guides/Secrets-and-lies-guide.md'))).digest('hex')).toBe('454a0cfd4dc2af047790fbfb496aafac1189907696acb709238c74abaea65799');
});

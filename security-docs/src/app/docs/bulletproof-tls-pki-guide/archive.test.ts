import {expect,test} from 'bun:test';
import {existsSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(import.meta.dir,'../../../../..');
const name='Bulletproof-tls-pki-guide';
test('original HTML and Markdown no longer remain at repository root',()=>{
 for(const ext of ['html','md'])expect(existsSync(resolve(root,`${name}.${ext}`))).toBe(false);
});
test('fidelity tests read only the archived HTML source',()=>{
 expect(readFileSync(new URL('./fidelity-helpers.ts',import.meta.url),'utf8')).toContain('../../../../../archive/security-guides/Bulletproof-tls-pki-guide.html');
});
test.skipIf(!existsSync(resolve(root,'archive/security-guides/Bulletproof-tls-pki-guide.html')))('archived html exactly matches original SHA-256',()=>{
 expect(createHash('sha256').update(readFileSync(resolve(root,'archive/security-guides/Bulletproof-tls-pki-guide.html'))).digest('hex')).toBe('c4e4b78c5afd7a034a496125f728cbcbc5d95855cd7ba017601c68cd6086e5c2');
});
test.skipIf(!existsSync(resolve(root,'archive/security-guides/Bulletproof-tls-pki-guide.md')))('archived md exactly matches original SHA-256',()=>{
 expect(createHash('sha256').update(readFileSync(resolve(root,'archive/security-guides/Bulletproof-tls-pki-guide.md'))).digest('hex')).toBe('b41995bc83a7b7939530f178a421184149652811e8d470f436b097282c021172');
});

import {expect,test} from 'bun:test';
import {existsSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(import.meta.dir,'../../../../..');
const name='Zero-trust-networks-2nd-edition-guide';
test('original HTML and Markdown no longer remain at repository root',()=>{
 for(const ext of ['html','md'])expect(existsSync(resolve(root,`${name}.${ext}`))).toBe(false);
});
test('fidelity tests read only the archived HTML source',()=>{
 expect(readFileSync(new URL('./fidelity-helpers.ts',import.meta.url),'utf8')).toContain('../../../../../archive/html/Zero-trust-networks-2nd-edition-guide.html');
});
test.skipIf(!existsSync(resolve(root,'archive/html/Zero-trust-networks-2nd-edition-guide.html')))('archived html exactly matches original SHA-256',()=>{
 expect(createHash('sha256').update(readFileSync(resolve(root,'archive/html/Zero-trust-networks-2nd-edition-guide.html'))).digest('hex')).toBe('cce81fd5082ade340d7f45d73e1ae1450f4f3cc3434f038dbc63d15c3d4bdee1');
});
test.skipIf(!existsSync(resolve(root,'archive/md/Zero-trust-networks-2nd-edition-guide.md')))('archived md exactly matches original SHA-256',()=>{
 expect(createHash('sha256').update(readFileSync(resolve(root,'archive/md/Zero-trust-networks-2nd-edition-guide.md'))).digest('hex')).toBe('bf6465894a2167faa9339a86f60e05d09c7e56762dd56769ee298c8fd3867127');
});

import {expect,test} from 'bun:test';
import {existsSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(import.meta.dir,'../../../../..');
test('original HTML and Markdown leave the repository root after migration',()=>{for(const ext of ['html','md'])expect(existsSync(resolve(root,'Cyberops-associate-guide.'+ext))).toBe(false);});
for(const [ext,digest] of Object.entries({html:'bec5c90a6ac8a9f5f2261fb1336e9df8cca300ee4a4100932025a68d3ba25187',md:'6da18571339753120fd15d138dd6e572a61620e855b7b7309456d6528d6d0efa'})){
 const original=resolve(root,'Cyberops-associate-guide.'+ext),archive=resolve(root,'archive/security-certifications/Cyberops-associate-guide.'+ext);
 test.skipIf(!existsSync(original)&&!existsSync(archive))('archive '+ext+' independently retains byte-exact SHA-256',()=>{expect(existsSync(archive)).toBe(true);expect(createHash('sha256').update(readFileSync(archive)).digest('hex')).toBe(digest);});
}
test('source comparison reads only the final archive lazily and skips only source-dependent tests',()=>{const helper=readFileSync(new URL('./fidelity-helpers.ts',import.meta.url),'utf8');expect(helper).toContain('archive/security-certifications/Cyberops-associate-guide.html');expect(helper).not.toContain('const originalPath');expect(helper).toContain('test.skipIf(!hasSource)');expect(helper.indexOf("readFileSync(sourcePath, 'utf8')")).toBeGreaterThan(helper.indexOf('function loadSource()'));});

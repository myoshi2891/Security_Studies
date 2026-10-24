import {expect,test} from 'bun:test';
import {existsSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(import.meta.dir,'../../../../..');
test('original HTML and Markdown leave the repository root after migration',()=>{for(const ext of ['html','md'])expect(existsSync(resolve(root,'Cyberops-professional-guide.'+ext))).toBe(false);});
for(const [ext,digest] of Object.entries({html:'aa2fbd621d46cf8146d828dacd39c7143738c415afba799338863ca842477f61',md:'e1924c866f58836b46a1dc3219768e46b84019e17ca562b8c711644e90abdcf8'})){
 const original=resolve(root,'Cyberops-professional-guide.'+ext),archive=resolve(root,'archive/security-certifications/Cyberops-professional-guide.'+ext);
 test.skipIf(!existsSync(original)&&!existsSync(archive))('archive '+ext+' independently retains byte-exact SHA-256',()=>{expect(existsSync(archive)).toBe(true);expect(createHash('sha256').update(readFileSync(archive)).digest('hex')).toBe(digest);});
}
test('source comparison reads only the final archive lazily and skips only source-dependent tests',()=>{const helper=readFileSync(new URL('./fidelity-helpers.ts',import.meta.url),'utf8');expect(helper).toContain('archive/security-certifications/Cyberops-professional-guide.html');expect(helper).not.toContain('const originalPath');expect(helper).toContain('test.skipIf(!hasSource)');expect(helper.indexOf("readFileSync(sourcePath, 'utf8')")).toBeGreaterThan(helper.indexOf('function loadSource()'));});

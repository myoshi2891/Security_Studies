import {expect,test} from 'bun:test';
import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(import.meta.dir,'../../..');
const moves=[
  {
    "from": "archive/html/Iso-15408-1-2026-guide.html",
    "to": "archive/standards/Iso-15408-1-2026-guide.html",
    "sha256": "d8f5e8f9e5dbda86cb87917d9dc3bf1a2c89ec35fcf7567a9f4303fa5cf6a172"
  },
  {
    "from": "archive/html/Iso-27017-2026-guide.html",
    "to": "archive/standards/Iso-27017-2026-guide.html",
    "sha256": "febe0dab1f1796d0cd80a7700a0bade732f51266f45262193afcf0934c414c32"
  },
  {
    "from": "archive/html/Iso-iec-18045-2026-guide.html",
    "to": "archive/standards/Iso-iec-18045-2026-guide.html",
    "sha256": "1ea7a3a4aac88d5bc70e5f568385ce1ee7967095655c91c43f2c282b622b4062"
  },
  {
    "from": "archive/html/Secrets-and-lies-guide.html",
    "to": "archive/security-guides/Secrets-and-lies-guide.html",
    "sha256": "8f0c4769761cda8724df25eeb5cb38940173e2b80e17235b9ae43f1b5506a7fa"
  },
  {
    "from": "archive/html/Zero-trust-networks-2nd-edition-guide.html",
    "to": "archive/security-guides/Zero-trust-networks-2nd-edition-guide.html",
    "sha256": "cce81fd5082ade340d7f45d73e1ae1450f4f3cc3434f038dbc63d15c3d4bdee1"
  },
  {
    "from": "archive/md/Iso-15408-1-2026-guide.md",
    "to": "archive/standards/Iso-15408-1-2026-guide.md",
    "sha256": "b9a2fd23da47e1f745ab809966cc6d0ce303fb256a0c06c6022dce1f68092bc6"
  },
  {
    "from": "archive/md/Iso-27017-2026-guide.md",
    "to": "archive/standards/Iso-27017-2026-guide.md",
    "sha256": "9e02a328e4cd257b6579761ab0d49a21f403ca3c040b1fc97352b7080440bcd6"
  },
  {
    "from": "archive/md/Iso-iec-18045-2026-guide.md",
    "to": "archive/standards/Iso-iec-18045-2026-guide.md",
    "sha256": "e06ac5e84a7bcd889a13d28d54bf2e04de4e428fdb11a315db3397808713f269"
  },
  {
    "from": "archive/md/Secrets-and-lies-guide.md",
    "to": "archive/security-guides/Secrets-and-lies-guide.md",
    "sha256": "454a0cfd4dc2af047790fbfb496aafac1189907696acb709238c74abaea65799"
  },
  {
    "from": "archive/md/Zero-trust-networks-2nd-edition-guide.md",
    "to": "archive/security-guides/Zero-trust-networks-2nd-edition-guide.md",
    "sha256": "bf6465894a2167faa9339a86f60e05d09c7e56762dd56769ee298c8fd3867127"
  }
] as const;
function sourceFiles(dir=resolve(root,'security-docs/src/app/docs')):string[]{return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?sourceFiles(resolve(dir,e.name)):/\.tsx?$/.test(e.name)?[resolve(dir,e.name)]:[]);}
test('legacy format directories contain no remaining archive files',()=>{
 for(const dir of ['archive/html','archive/md'])expect(existsSync(resolve(root,dir))?readdirSync(resolve(root,dir)):[]).toEqual([]);
});
// archive/ 自体がない CI だけスキップし、ローカルでは移動先の欠落を失敗として検出する
for(const item of moves)test.skipIf(!existsSync(resolve(root,'archive')))(`preserves source bytes in correct category: ${item.to}`,()=>{
 expect(existsSync(resolve(root,item.to))).toBe(true);expect(existsSync(resolve(root,item.from))).toBe(false);expect(createHash('sha256').update(readFileSync(resolve(root,item.to))).digest('hex')).toBe(item.sha256);
});
test('all page tests and fidelity helpers use category archive paths',()=>{
 const legacy=sourceFiles().filter(file=>/archive\/(?:html|md)\//.test(readFileSync(file,'utf8')));expect(legacy).toEqual([]);
});
test.skipIf(!existsSync(resolve(root,'archive')))('all referenced original files exist in the local category archive',()=>{
 const references=new Set(sourceFiles().flatMap(file=>[...readFileSync(file,'utf8').matchAll(/archive\/[a-z-]+\/[A-Za-z0-9_.-]+\.(?:html|md)/g)].map(m=>m[0])));
 const missing=[...references].filter(path=>!existsSync(resolve(root,path)));expect(missing).toEqual([]);
});

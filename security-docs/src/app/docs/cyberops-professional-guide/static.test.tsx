import {expect,test} from 'bun:test';
import {createHash} from 'node:crypto';
import {canonical,renderedPage} from './fidelity-helpers';
const hashes={".hero": "f2025ae936e642d4d3ce800c179a625394ab6c85d80793cda7c97cdffc88c723", ".brand": "7514321e223168a27850b50fc0222b3e0dc13f48a562795fded48625f178cc91", ".sidebar nav": "61b95ee1564182e82ae34503100c816e2b96d26a0cc03c4c3f9102ac330dd481"};
for(const [selector,hash] of Object.entries(hashes))test(selector+': fixed full structure survives without source originals',async()=>{const el=(await renderedPage()).querySelector(selector);expect(el).not.toBeNull();expect(createHash('sha256').update(JSON.stringify(canonical(el!))).digest('hex')).toBe(hash);});

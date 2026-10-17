import {sectionContracts,canonical,renderedPage,sourceDocument} from './fidelity-helpers';
import {expect,test} from 'bun:test';
sectionContracts(['sec-6', 'sec-7', 'sec-8', 'sec-9', 'sec-10', 'sec-11', 'sec-appendix']);
test('preserves every footer notice and source date',async()=>{expect(canonical((await renderedPage()).querySelector('footer')!)).toEqual(canonical(sourceDocument.querySelector('footer')!));});

import {expect,test} from 'bun:test';
import {createHash} from 'node:crypto';
import {canonical,renderedPage} from './fidelity-helpers';
const hashes={
  ".brand": "2e27eeaeb5947dd01b10a1ac2f680b721cfd586078562c680794a569e5f4bd1e",
  ".hero": "d92aea8ab470e15cb77bf7b10879db8d823950aaca1423fec2db24915f25b6df",
  ".sidebar nav": "49d79d9ea0a12ff3b312202542936d0691f8aa71d628ec381c2351bbeb352fa8",
  "#s0": "ba7f06c36681f5d4ab4f5a10542c79331065a8619b4194b5f9efa06c5a30e7ba",
  "#s1": "dbf507921799652b20ed3e396326c2d9ebde34aafdf486b767020f6575b5e146",
  "#s2": "1c2b6b7b379d237fd143061a7a209f96986288a7aecf7cfbb41b4e49aec2db14",
  "#s3": "25fa66352fa7d5f94ce231fe2cabca9c4c86bc50cc4ffd80dbdedd81050d20eb",
  "#s4": "832e6adaafd620fbfbaa2776b23322256701e69cab13227dce6124bf9c9f615d",
  "#s5": "615ba255304332fc7a6fe3ee7db7a2c9897e2e752038e57fb7b4b5d0c1ebb7ee",
  "#s6": "e5c3970c0d3d66720aa98953d7963ab2ae3cf442253d668a2e09e0e96d05b688",
  "#s7": "250c2cb7fdf3f537847a306241d15ceb35c00d2e7c03d3d6afdf59c02bfcaa81",
  "#s8": "b03a41057c92ee9d335307e690d1186daf03417f6c889bafcd23314b987374ae",
  "#s9": "254d2d3927d4e30bf9cb0d81b3e64e50145c578371964d6bd3332d0e288a59c0",
  "#s10": "d48f94ad3b2a95aa0a1e708b498eb0db0cb78e11b09c05b805898426f2b28e62",
  "#s11": "c508f1ef0a0ba24834db15ce118e17235fefa4d679e9aa9a9fd96db8aba43143",
  "#s12": "176c0e1afbe9b4085d25fabe254a05f168197f0fabfc2804368e0d59b832f87e",
  "#s13": "6420e8de70f2ab726a84159c652631d87bed58321da8b54a27bf42104b6b36d8",
  "#s14": "833f6d10005f7860f0c5b87d8d5ef04058c37c6462a580dabe608b428655663a",
  "#s15": "eaef7cd11940548b573ff4ca89f65f433757d475b292f83091c5b03e455a3512"
};
for(const [selector,digest] of Object.entries(hashes))test(selector+': complete source structure persists without archive originals',async()=>{const element=(await renderedPage()).querySelector(selector);expect(element).not.toBeNull();expect(createHash('sha256').update(JSON.stringify(canonical(element!))).digest('hex')).toBe(digest);});

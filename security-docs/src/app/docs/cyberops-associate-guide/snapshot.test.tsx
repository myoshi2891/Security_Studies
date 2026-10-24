import {expect,test} from 'bun:test';
import {createHash} from 'node:crypto';
import {canonical,renderedPage} from './fidelity-helpers';
const hashes={
  ".brand": "fd6daa9d93114e7cf5e1953806f193108f26d231b69db05e7f68746cdd50b8a1",
  ".hero": "096c2bd77bb724178a7bf1c337a59206a4a74509d6a70279a90b79d115df1c85",
  ".sidebar nav": "6573182223cb3a4362e7ff954f2b38c0dcda3859fa30706963bd94375b1a4b17",
  ".footer": "724cfe2d9d4211fc12679417f58b886871485cc5d8de130b4e0ef2db3bebc844",
  "#ch0": "49cc2d235c41178e91e63017e8c185253267ed449849553805dd3064beb547dc",
  "#ch1": "34886f461a7db8cf4b51478e5f09df2f710cfc3ba264a221479ff41c9666fa38",
  "#ch2": "31193b1f7aba46ae3223e7e72e1467c82423bf59057addb72ff698117545daf0",
  "#ch3": "391520fdf28af63d93327df046f260b78d5a480954949978441f179afffc3c32",
  "#ch4": "12784819dadd9ac08e09707ab7bc8fddb29249a67a9b7b097afe2691b81e56d9",
  "#ch5": "fcad9980d08cea7bf895a0df493e1df35466f11e8fc61134eff57a4ecc0e9f41",
  "#ch6": "aba2cc9c22d4e9618077c30cfc28a47760a7b418c24519171098b8dd60a1857f",
  "#ch7": "e62a1960a0aa457554d33178cc2f9bc7b32650f3f45994b19dc2e9a330e363aa",
  "#ch8": "73c7fb1b857fad2b42910dc76dfabf63f45dda23b07b244c932f008152acc94a",
  "#ch9": "c556f396f3f2e73ed665f27d77f26d65cf0a7861fc4bbf9c91ca250a9fcfee0d",
  "#ch10": "f298b539cf7eedd391034f782de6737b99d87d7be39a057ad416bab55e2b86b5",
  "#ch11": "c203ee7777176e452f462e7764e7652e9bb759c173f137c7bffea3755148392a"
};
for(const [selector,digest] of Object.entries(hashes))test(selector+': immutable structure without originals',async()=>{const el=(await renderedPage()).querySelector(selector);expect(el).not.toBeNull();expect(createHash('sha256').update(JSON.stringify(canonical(el!))).digest('hex')).toBe(digest);});

import {expect,test} from 'bun:test';
import {createHash} from 'node:crypto';
import {canonical,renderedPage} from './fidelity-helpers';
const hashes={
  ".brand": "c1f5514ec8a6ab408f14ab8fda4cb91e7c35c85023498f463d0e7597347cf23f",
  ".sidebar nav": "99cf5f4830fe9fd0162cb7bb2c4646b1c53914ed92818d5092b761482e927936",
  ".side-foot": "438bbef37ebee39b8cc16c44ea329737b828bcb9b45b360aa462e666abe4d050",
  ".hero": "f32ebaef1b3feacf17aefe9e842ef4b4c0f225af81c0699d57f5377d0aa51619",
  "#ch0": "bebcce50ac2f3069a2054ee9262678b4b5ba619a49ce5f06bda357b93d63861e",
  "#ch1": "d7ad0aae4b6d5595afe471e66acb497cc247af2feded3eb9868929fe15c35a26",
  "#ch2": "a334697cc17ff05101d2c59c57dc4d6f7db1d06ea8dd1c625ef0c9c6c0d6bae8",
  "#ch3": "88f4b97f2f0a7c35409d24b4f42a352330fcef5dbbe0e70f42c1637ed9fe7ea6",
  "#ch4": "8b11f20f065a30671de96a53f49a3b5408e98ade08f528575da1116fd5620aa7",
  "#ch5": "7bacf83156eddb66c48f597c733144877369ee5e1fcfd249ecb2965042755d91",
  "#ch6": "2b110a8fc6a3bbb8fd55cc2e8a85f9d01e8b12d928af8900aeac1271a8137063",
  "#ch7": "e5fa04dff357dcea0864dd21924cb0061aea5fc9e8c7b76e172b1d0d44381899",
  "#ch8": "de327d9bd15bdc6e948395fc1cf3c9c14f04c137d03c0af954f1afd758ab9e93",
  "#ch9": "558a25e40aa625425fab1f3409bbdea4a19fad18da89651689500b28ec290d35",
  "#ch10": "f94aff1a3dc716303b8f499652acb00ffff08585bd4f7e931c747cd2967a536d",
  "#ch11": "a11d7f22e3cf80e4d5113675a23b5f4a005f902e1d6b6d35107853c4ee4d5238",
  "#ch12": "3f6bda62cd66b8082e80ef0cdbeaaa46d825349dcf9102979d317e56b61ba93a",
  "#ch13": "921f5ae22be0f186d5b3428b21e09fb667a685a43f097a279baebb3a044bb353",
  "#ch14": "588fa7de845d5e91bd2bd735528a4f9b2d6c335f2fe558154619e085a26e2af6",
  "#ch15": "8cb36682ae6e11316fb946f8f2af2372c7ffeb4ad33685ad7863a0a0109f0c9a",
  "#ch16": "b6d67e9ab638a618dfa0c0cceec046f35c1ed3a3122311f4ea05e093c6917574",
  ".footer": "1849946b6080b02d680fb7c03b4c1095bdeca4e7ae2608f88a881303181b205f"
};
for(const [selector,digest] of Object.entries(hashes))test(selector+': immutable full original structure without archive dependency',async()=>{const element=(await renderedPage()).querySelector(selector);expect(element).not.toBeNull();expect(createHash('sha256').update(JSON.stringify(canonical(element!))).digest('hex')).toBe(digest);});

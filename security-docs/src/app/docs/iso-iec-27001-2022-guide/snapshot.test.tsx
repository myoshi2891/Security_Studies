import {expect,test} from 'bun:test';
import {createHash} from 'node:crypto';
import {canonical,renderedPage} from './fidelity-helpers';
const hashes={
  ".brand": "c1f5514ec8a6ab408f14ab8fda4cb91e7c35c85023498f463d0e7597347cf23f",
  ".sidebar nav": "99cf5f4830fe9fd0162cb7bb2c4646b1c53914ed92818d5092b761482e927936",
  ".side-foot": "438bbef37ebee39b8cc16c44ea329737b828bcb9b45b360aa462e666abe4d050",
  ".hero": "f32ebaef1b3feacf17aefe9e842ef4b4c0f225af81c0699d57f5377d0aa51619",
  "#ch0": "097fc28b61292b21ceccbf81799e69c022682d5c18f9a8a25f5ccef861c5f267",
  "#ch1": "25d2b65cd1df5b5d6002d67fadcf0e892cb8d4f1405d5b8241e85575123d9f8e",
  "#ch2": "a334697cc17ff05101d2c59c57dc4d6f7db1d06ea8dd1c625ef0c9c6c0d6bae8",
  "#ch3": "c7fdba0912ad679b5c448a1f394c4330d7db857e942c3f13bd668e0759885724",
  "#ch4": "8b11f20f065a30671de96a53f49a3b5408e98ade08f528575da1116fd5620aa7",
  "#ch5": "844cd8575fb1c0ea142ce46633131f77a7b0fdf24e6015a5e6710ee0946b4e14",
  "#ch6": "2b110a8fc6a3bbb8fd55cc2e8a85f9d01e8b12d928af8900aeac1271a8137063",
  "#ch7": "ab1eb6f7cd35b73281ef14886f9fa28741e27e2a77c50befd2355671f2ba2a9a",
  "#ch8": "4ef738f7252738945fdbc1c111f2046202232116972180b09d131b0377524454",
  "#ch9": "774daf1a6a04ae4d1b96230f9f5738d1c733da5ceeb6cc70ed95c51bd57b4095",
  "#ch10": "1c28bdeb6695f56e238007a91642c8fa167b3883abf46820152aca872cc6ab34",
  "#ch11": "bc1f5ce4b3f06d5759de620b81e83f7db0232f34e2753763393a6dbadc61a72a",
  "#ch12": "056a097cad3a8efcea45167f55716938955c2a2e0dbedd4871fbf8bdb43daec0",
  "#ch13": "921f5ae22be0f186d5b3428b21e09fb667a685a43f097a279baebb3a044bb353",
  "#ch14": "588fa7de845d5e91bd2bd735528a4f9b2d6c335f2fe558154619e085a26e2af6",
  "#ch15": "8cb36682ae6e11316fb946f8f2af2372c7ffeb4ad33685ad7863a0a0109f0c9a",
  "#ch16": "b6d67e9ab638a618dfa0c0cceec046f35c1ed3a3122311f4ea05e093c6917574",
  ".footer": "1849946b6080b02d680fb7c03b4c1095bdeca4e7ae2608f88a881303181b205f"
};
for(const [selector,digest] of Object.entries(hashes))test(selector+': immutable full original structure without archive dependency',async()=>{const element=(await renderedPage()).querySelector(selector);expect(element).not.toBeNull();expect(createHash('sha256').update(JSON.stringify(canonical(element!))).digest('hex')).toBe(digest);});

import {expect,test} from 'bun:test';
import {createHash} from 'node:crypto';
import {canonical,renderedPage} from './fidelity-helpers';
const hashes = {
  ".brand": "321bc2ae0fe472a8abe8c8e2658d6a3a0842896d9c6cb1e64d3eff12eb69732b",
  ".sidebar nav": "c67f94a276764db8edbc896b9827204454ff0d05e88746ea70a89eea0acbd405",
  ".hero": "2c4109730ca39705ef6cf6468d5b81905d92efc41ef033896a30fa5d0f587636",
  "#ch0": "5afe519125d61072b5b5b919cfc62abca62657e2d7b46b3491f436fa92c934ad",
  "#ch1": "5068572d47c867bc614c269ead7ad459394d8283323c94604fc2a63aca3dbdd7",
  "#ch2": "91416c36edd57b98355d985aee6d301a83d7c946442363edd099a4c7cee339e2",
  "#ch3": "104ac7b5d0294df35b612cc4e13218614a055f6603cb2f63e207f59a36ae26d6",
  "#ch4": "2c925edb11d998531ee88707c2eaf397e8280fb2b2c35bee741de07c5f2e312d",
  "#ch5": "b1c717d3c8ea91677508ea98173262acb90ebc861efaa2fd002bf065675b2fc3",
  "#ch6": "ba6ffcb2ff8408f4aae2171ad929141b7e791060888732a884c9f07c59cd5ebc",
  "#ch7": "cbd06964dfd27bb20765a00acb2a85fe6f4730a9d4ddb9e8a1238e4c249600ef",
  "#ch8": "32d3735847d7a53f075da933b29c821fa07f348d384b481d2ca2fcc54a2a1ee0",
  "#ch9": "06aa684962a51edb89a6c8512923d2e742a3ed88b13e8032597fbc6eb494f2d7",
  "#ch10": "ec383c257ee2222772a4b69bf25f518a01c6b263996a2643d27802f3e1c47be8",
  "#ch11": "b0e1ee17f4ebcbe5c9ec7a6f8d7f15fd58626193a566b89f9c2b5619521e405f",
  "#ch12": "7dbe88da2b22673bc62f83975e9b0bd4c7fc5d888c71cfe23fac1cca6d78ecb7",
  "#ch13": "7d5d8e5e925301c307f75b6d8ca1cd9e1f92e85e3953b09d249b7bc761be310f",
  "#ch14": "f5e047dd01da1981626f012561e0814f677e3af01f7fc3a304562a0a7be4d49a",
  "#ch15": "fc8d20ba08c143c7e8f32cea90e84f0008697350dec233fecfde95fc768ee7dc",
  "#ch16": "94c77482dd6de077b86d89b88d73c3d86a8083ed19342ad65b23f1aeb30a82c1",
  "#appendix": "224933c51ac257ca271621b22457f03e789813730e8b8cb6dfae58046e22140a",
  ".footer": "6c2dc25761074b074c16b6e0daae353d25f0f93d51015908c6d7856e3a87a6e4"
};
for(const [selector,digest] of Object.entries(hashes))test(selector+': exact complete source structure survives even without archive originals',async()=>{const page=await renderedPage();const element=page.querySelector(selector);expect(element).not.toBeNull();expect(createHash('sha256').update(JSON.stringify(canonical(element!))).digest('hex')).toBe(digest);});

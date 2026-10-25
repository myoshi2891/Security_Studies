import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { canonical, renderedPage } from './fidelity-helpers';

const hashes = {
  '.hero': 'dfc3b134e16efad320c34021b2a9bb5956cd9be6eeec0c7c66f12c36acbaecb2',
  '.brand': '47045c5a0abdf931e5f15aa62afb85966ae4195cdf2b2dad6d393ee3d8dda432',
  '.sidebar nav': '2216c3c50564c1ece953282f8154be9caf620b4ef0f3256fe648531e64bae28d',
  '.sidebar-foot': '045982670c5a7c859ff35755aa026429387c145b7d1072001609c6248ba19b84',
  '.footer': '74fb3a983ec0cbd3f2c7c4356fe850b6524e972ec6a7b1d034cff3102451f25e',
};

for (const [selector, hash] of Object.entries(hashes)) {
  test(selector + ': fixed full structure survives without source originals', async () => {
    const el = (await renderedPage()).querySelector(selector);
    expect(el).not.toBeNull();
    expect(createHash('sha256').update(JSON.stringify(canonical(el!))).digest('hex')).toBe(hash);
  });
}

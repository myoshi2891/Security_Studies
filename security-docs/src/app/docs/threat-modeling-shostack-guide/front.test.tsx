import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { canonical, chapterContracts, renderedPage } from './fidelity-helpers';

const hashes = {
  ch1: 'cdab815f348073fd45d67bd995f4308c1efabb1b94babc2979d2d67f51a9ab15',
  ch2: 'fa065a21c9a8e9646c1156937627a27fa109ab5fe45e0bf6836396ce344aa89d',
  ch3: 'd6adb07d881e2654496c82e1f80ae0602dd2e6f97485c70c03bb27ca031c8a88',
  ch4: '331df9fd9bd912ca380ef7f1d74133b1487049292823733a8450bb53c846a209',
  ch5: 'd46ef5754c1e458f3b609e042e874d44cc85dbe2fba17285819febcaebd65001',
  ch6: 'ad9a96c2ca6e2397fb66de69f28b556723a952549965cc60abef91866e9a8960',
  ch7: '81a91e7d3c948e98cdf2f4e172df088d8e440fe171270abe2ba230501183a4b1',
  ch8: 'fd40fdfd503214d1bb32190641702c7fae2bfebf2a73248a5a931c734b0e96f4',
};

for (const [id, hash] of Object.entries(hashes)) {
  test(id + ': fixed full structure survives without source originals', async () => {
    const page = await renderedPage();
    const el = page.getElementById(id);
    expect(el).not.toBeNull();
    expect(createHash('sha256').update(JSON.stringify(canonical(el!))).digest('hex')).toBe(hash);
  });
}

chapterContracts(Object.keys(hashes));

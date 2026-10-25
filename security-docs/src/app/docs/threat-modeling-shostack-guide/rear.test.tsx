import { expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { canonical, chapterContracts, renderedPage } from './fidelity-helpers';

const hashes = {
  ch9: '3dd5cb206461c05ccfe5617eaa4fcea14f3b7b49a77f86f74e98167778659db2',
  ch10: 'b76d04c10fc0c3f646c75da6f7fbf3e19afb33f6d2f7c411cadfd8c4de66f5f9',
  ch11: 'b8c1b2f7521b3d9b65be7b45b215edb84131085dbe4e20589d765d61f3c2a2a3',
  ch12: '9bcc7d7e8359f1e19ec3df877c4c3b8727ecc70be7a2ae3b1f8f2f0384975608',
  ch13: 'b707034541d64b37f4a8e49c9dea85c2a0c6b5ed60df820286c986c04c7e4164',
  ch14: '140e149c2470175a33f78777531daca713de057cacb26784d8a5f01d863a20e2',
  ch15: '3270fee4c07424bc91c4b1551a03ced7c8619149372e57eb23f2de18f9174444',
  ch16: '04e1317b9fba2179a236dc4a51191fb28d4ae48db5f206b047b46ac300fdf4d4',
  ch17: 'a8f097f34abc466fc88b0c345ada2c34b54842902c8570320dbe7ae72a0f9594',
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

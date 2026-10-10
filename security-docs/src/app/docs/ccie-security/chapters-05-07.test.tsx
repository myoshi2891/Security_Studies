import { describe, expect, test } from 'bun:test';
import { chapterContracts, renderedPage, sourceDocument } from './fidelity-helpers';

describe('CCIE chapters 5–7', () => {
  chapterContracts(5, 7);
  test('preserves both Python examples with syntax highlighting and exact whitespace', async () => {
    const examples = [...(await renderedPage()).querySelectorAll('code.language-python')];
    const originals = [...sourceDocument.querySelectorAll('code.language-python')];
    expect(examples).toHaveLength(2);
    expect(examples.map(el => el.textContent)).toEqual(originals.map(el => el.textContent));
    for (const example of examples) expect(example.querySelector('.hljs-keyword')).not.toBeNull();
  });
});

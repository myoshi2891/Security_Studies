import { expect, test } from 'bun:test';
import { diagrams } from './diagrams';
import { diagramCorrections, sourceTest, sourceHtml } from './fidelity-helpers';

// 原本の図定義から意図して変えた箇所だけを、原本の有無に関わらず検証する
test('diagram corrections are applied to the migrated definitions', () => {
  for (const [id, { from, to }] of Object.entries(diagramCorrections)) {
    const definition: string = diagrams[id as keyof typeof diagrams];
    expect(definition).toContain(to);
    expect(definition).not.toContain(from);
  }
});

sourceTest('each corrected passage occurs exactly once in the archived original', () => {
  for (const { from } of Object.values(diagramCorrections)) expect(sourceHtml.split(from)).toHaveLength(2);
});

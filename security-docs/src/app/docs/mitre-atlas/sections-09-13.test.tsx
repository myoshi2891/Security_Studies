import { expect } from 'bun:test';
import { canonical, renderedPage, sectionContracts, sourceDocument, sourceTest } from './fidelity-helpers';

sectionContracts(9, 13);
sourceTest('retains all six deployment steps and their original numbered cards', async () => {
  const steps = [...(await renderedPage()).querySelectorAll('.step-card')];
  expect(steps).toHaveLength(6);
  expect(steps.map(canonical)).toEqual([...sourceDocument.querySelectorAll('.step-card')].map(canonical));
  expect(steps.map(el => el.querySelector('.num')?.textContent)).toEqual(['1', '2', '3', '4', '5', '6']);
});
sourceTest('retains all 29 reference descriptions, original links and the information-date footer', async () => {
  const page = await renderedPage();
  expect(page.querySelectorAll('.ref-list li')).toHaveLength(29);
  expect([...page.querySelectorAll('.ref-list li')].map(canonical)).toEqual([...sourceDocument.querySelectorAll('.ref-list li')].map(canonical));
  expect(page.querySelector('footer')).not.toBeNull();
  expect(canonical(page.querySelector('footer')!)).toEqual(canonical(sourceDocument.querySelector('footer')!));
});

import { expect } from 'bun:test';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

// @testing-library/jest-dom@6.10.0+ eagerly requires @testing-library/dom at
// import time, which computes its `screen` singleton from `document` on first
// load. A static import here would be hoisted ahead of GlobalRegistrator.register()
// below, so document wouldn't exist yet and `screen` would be poisoned for the
// whole test run. Dynamic imports are not hoisted, so this ordering is explicit.
const { GlobalRegistrator } = await import('@happy-dom/global-registrator');
GlobalRegistrator.register();

const matchers: typeof import('@testing-library/jest-dom/matchers') = await import(
  '@testing-library/jest-dom/matchers'
);
expect.extend(matchers);

declare module "bun:test" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Matchers<T = unknown>
    extends TestingLibraryMatchers<typeof expect.stringContaining, T> {}
}

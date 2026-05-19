import "@testing-library/jest-dom";

declare module "bun:test" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Matchers<T> extends jest.Matchers<void, T> {}
}

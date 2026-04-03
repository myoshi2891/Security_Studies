import "@testing-library/jest-dom";

declare module "bun:test" {
  interface Matchers<T> extends jest.Matchers<void, T> {}
}

import { afterEach, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { cleanup, render } from '@testing-library/react';
import { GuideCode } from './GuideCode';

afterEach(cleanup);

describe('GuideCode', () => {
  test('登録済み言語はハイライトし、元のテキストと言語クラスを保持する', () => {
    // Arrange
    const code = 'print("hello")';
    // Act
    const { container } = render(createElement(GuideCode, { code, language: 'python' }));
    // Assert
    const element = container.querySelector('code')!;
    expect(element.className).toBe('language-python');
    expect(element.textContent).toBe(code);
    expect(element.querySelector('[class^="hljs-"]')).not.toBeNull();
  });

  test('plain はハイライトせず平文で描画する', () => {
    // Arrange
    const code = '<plain> & text';
    // Act
    const { container } = render(createElement(GuideCode, { code, language: 'plain' }));
    // Assert
    const element = container.querySelector('code')!;
    expect(element.textContent).toBe(code);
    expect(element.querySelector('[class^="hljs-"]')).toBeNull();
  });

  test('未登録言語は例外を投げず、エスケープされた平文で描画する', () => {
    // Arrange
    const code = '<script>alert(1)</script>';
    // Act
    const { container } = render(createElement(GuideCode, { code, language: 'rust' }));
    // Assert
    const element = container.querySelector('code')!;
    expect(element.textContent).toBe(code);
    expect(element.querySelector('script')).toBeNull();
    expect(element.querySelector('[class^="hljs-"]')).toBeNull();
  });
});

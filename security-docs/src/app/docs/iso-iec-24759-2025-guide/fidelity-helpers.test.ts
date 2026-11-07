import { expect, test } from 'bun:test';
import { sourcePath, sourceStyleText } from './fidelity-helpers';

/** HTML 文字列を比較元と同じ方法で解析する。 */
const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

test('source style text is returned unchanged for parsing', () => {
  expect(sourceStyleText(parse('<style>.a{color:red}</style>'))).toBe('.a{color:red}');
});
test('a source without a style element fails explicitly and names the source path', () => {
  expect(() => sourceStyleText(parse('<main>本文</main>'))).toThrow(sourcePath);
});
test('an empty style element is not substituted with empty CSS', () => {
  expect(() => sourceStyleText(parse('<style>  \n </style>'))).toThrow(sourcePath);
});

import { expect, test } from 'bun:test';
import { highlight } from '../src/ui/tree/highlight';

function shape(text: string, query: string): string {
  return highlight(text, query)
    .map((seg) => (seg.match ? `[${seg.text}]` : seg.text))
    .join('');
}

test('wraps the matched substring', () => {
  expect(shape('README.md', 'me')).toBe('READ[ME].md');
});

test('matches case-insensitively and keeps original casing', () => {
  expect(shape('AppController.ts', 'app')).toBe('[App]Controller.ts');
});

test('handles multiple occurrences', () => {
  expect(shape('a.a.a', 'a')).toBe('[a].[a].[a]');
});

test('returns a single plain segment when query is empty', () => {
  expect(highlight('file.ts', '  ')).toEqual([{ text: 'file.ts', match: false }]);
});

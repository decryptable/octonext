export interface HighlightSegment {
  text: string;
  match: boolean;
}

export function highlight(text: string, query: string): HighlightSegment[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [{ text, match: false }];

  const segments: HighlightSegment[] = [];
  const lower = text.toLowerCase();
  let cursor = 0;
  let index = lower.indexOf(needle, cursor);

  while (index !== -1) {
    if (index > cursor) segments.push({ text: text.slice(cursor, index), match: false });
    segments.push({ text: text.slice(index, index + needle.length), match: true });
    cursor = index + needle.length;
    index = lower.indexOf(needle, cursor);
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), match: false });
  return segments;
}

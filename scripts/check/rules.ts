import ts from 'typescript';

export const MAX_LINES = 130;

export interface Violation {
  file: string;
  message: string;
}

export function checkLineCount(file: string, source: string): Violation[] {
  const lines = source.replace(/\n$/, '').split('\n').length;
  if (lines <= MAX_LINES) return [];
  return [{ file, message: `${lines} lines exceeds the ${MAX_LINES}-line limit` }];
}

export function checkTsComments(file: string, source: string): Violation[] {
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const positions = new Set<number>();
  const visit = (node: ts.Node): void => {
    for (const range of ts.getLeadingCommentRanges(source, node.getFullStart()) ?? [])
      positions.add(range.pos);
    for (const range of ts.getTrailingCommentRanges(source, node.getEnd()) ?? [])
      positions.add(range.pos);
    node.forEachChild(visit);
  };
  visit(sourceFile);
  return [...positions]
    .sort((a, b) => a - b)
    .map((pos) => ({
      file,
      message: `comment found on line ${source.slice(0, pos).split('\n').length}`,
    }));
}

export function checkCssComments(file: string, source: string): Violation[] {
  const withoutStrings = source.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, '');
  const index = withoutStrings.indexOf('/*');
  if (index === -1) return [];
  const line = withoutStrings.slice(0, index).split('\n').length;
  return [{ file, message: `comment found on line ${line}` }];
}

export function checkFileName(file: string): Violation[] {
  const name = file.split('/').pop() ?? file;
  if (!/^[a-z0-9.-]+$/.test(name)) {
    return [{ file, message: 'filename must be lowercase kebab-case' }];
  }
  if (file.includes('/styles/') && /^\d/.test(name)) {
    return [{ file, message: 'style files must not use numeric prefixes' }];
  }
  return [];
}

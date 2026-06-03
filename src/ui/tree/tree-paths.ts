export function ancestorsOf(path: string): string[] {
  if (!path) return [];
  const parts = path.split('/');
  parts.pop();
  const result: string[] = [];
  parts.reduce((prefix, part) => {
    const next = prefix ? `${prefix}/${part}` : part;
    result.push(next);
    return next;
  }, '');
  return result;
}

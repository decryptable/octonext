import type { RepoContext } from '../types';

const RESERVED_OWNERS = new Set([
  'settings',
  'marketplace',
  'notifications',
  'explore',
  'topics',
  'trending',
  'collections',
  'events',
  'sponsors',
  'about',
  'pricing',
  'features',
  'login',
  'join',
  'new',
  'organizations',
  'dashboard',
  'search',
  'codespaces',
  'apps',
  'account',
  'orgs',
  'pulls',
  'issues',
]);

const TREE_TABS = new Set(['tree', 'blob']);

export function parseRepoContext(url: URL, host: string): RepoContext | null {
  if (url.hostname !== host) return null;
  const segments = url.pathname.split('/').filter(Boolean);
  if (segments.length < 2) return null;

  const [owner, repo, tab, ...rest] = segments;
  if (!owner || !repo || RESERVED_OWNERS.has(owner)) return null;

  const base = { host, owner, repo };
  if (tab === 'pull' && rest[0]) {
    const pullNumber = Number.parseInt(rest[0], 10);
    if (Number.isFinite(pullNumber)) return { ...base, view: 'pull', rawRef: '', pullNumber };
  }
  if (!tab || TREE_TABS.has(tab)) {
    return { ...base, view: 'tree', rawRef: rest.join('/'), pullNumber: null };
  }
  return { ...base, view: 'other', rawRef: '', pullNumber: null };
}

export function repoKey(context: RepoContext | null): string | null {
  if (!context) return null;
  return `${context.host}/${context.owner}/${context.repo}`;
}

export function sameRepoTarget(a: RepoContext | null, b: RepoContext | null): boolean {
  if (!a || !b) return a === b;
  return repoKey(a) === repoKey(b) && a.rawRef === b.rawRef && a.pullNumber === b.pullNumber;
}

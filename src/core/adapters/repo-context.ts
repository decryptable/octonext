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

const NON_TREE_TABS = new Set([
  'issues',
  'pull',
  'pulls',
  'actions',
  'projects',
  'wiki',
  'settings',
]);

export function parseRepoContext(url: URL, host: string): RepoContext | null {
  if (url.hostname !== host) return null;
  const segments = url.pathname.split('/').filter(Boolean);
  if (segments.length < 2) return null;

  const [owner, repo, tab, branch, ...rest] = segments;
  if (!owner || !repo || RESERVED_OWNERS.has(owner)) return null;
  if (tab && NON_TREE_TABS.has(tab)) return null;

  const onTreeView = tab === 'tree' || tab === 'blob';
  return {
    host,
    owner,
    repo,
    branch: onTreeView && branch ? branch : '',
    currentPath: onTreeView ? rest.join('/') : '',
  };
}

export function sameRepo(a: RepoContext | null, b: RepoContext | null): boolean {
  if (!a || !b) return a === b;
  return a.host === b.host && a.owner === b.owner && a.repo === b.repo && a.branch === b.branch;
}

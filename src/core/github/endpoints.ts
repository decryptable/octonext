import { GITHUB_API_ORIGIN, GITHUB_HOST } from '../../shared/constants';

export function apiBase(host: string): string {
  return host === GITHUB_HOST ? GITHUB_API_ORIGIN : `https://${host}/api/v3`;
}

function repo(host: string, owner: string, name: string): string {
  return `${apiBase(host)}/repos/${owner}/${name}`;
}

export function repoEndpoint(host: string, owner: string, name: string): string {
  return repo(host, owner, name);
}

export function treeEndpoint(host: string, owner: string, name: string, ref: string): string {
  return `${repo(host, owner, name)}/git/trees/${encodeURIComponent(ref)}?recursive=1`;
}

export function matchingRefsEndpoint(
  host: string,
  owner: string,
  name: string,
  kind: 'heads' | 'tags',
  prefix: string,
): string {
  return `${repo(host, owner, name)}/git/matching-refs/${kind}/${encodeURIComponent(prefix)}`;
}

export function blobEndpoint(host: string, owner: string, name: string, sha: string): string {
  return `${repo(host, owner, name)}/git/blobs/${sha}`;
}

export function pullsListEndpoint(host: string, owner: string, name: string): string {
  return `${repo(host, owner, name)}/pulls?state=open&per_page=30&sort=updated&direction=desc`;
}

export function pullEndpoint(host: string, owner: string, name: string, n: number): string {
  return `${repo(host, owner, name)}/pulls/${n}`;
}

export function pullFilesEndpoint(
  host: string,
  owner: string,
  name: string,
  n: number,
  page = 1,
): string {
  return `${repo(host, owner, name)}/pulls/${n}/files?per_page=100&page=${page}`;
}

export function pullCommentsEndpoint(host: string, owner: string, name: string, n: number): string {
  return `${repo(host, owner, name)}/pulls/${n}/comments?per_page=100`;
}

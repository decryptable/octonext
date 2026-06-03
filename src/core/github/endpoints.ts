import { GITHUB_API_ORIGIN, GITHUB_HOST } from '../../shared/constants';

export function apiBase(host: string): string {
  return host === GITHUB_HOST ? GITHUB_API_ORIGIN : `https://${host}/api/v3`;
}

export function repoEndpoint(host: string, owner: string, repo: string): string {
  return `${apiBase(host)}/repos/${owner}/${repo}`;
}

export function treeEndpoint(host: string, owner: string, repo: string, ref: string): string {
  const sha = encodeURIComponent(ref);
  return `${apiBase(host)}/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`;
}

import type { RepoContext, ResolvedRef } from '../types';
import { getJson } from './client';
import { matchingRefsEndpoint, repoEndpoint } from './endpoints';

export interface NamedRef {
  name: string;
  commit: { sha: string };
}

interface MatchingRef {
  ref: string;
  object: { sha: string };
}

export async function resolveRef(context: RepoContext, token?: string): Promise<ResolvedRef> {
  const { host, owner, repo } = context;
  if (!context.rawRef) {
    const info = await getJson<{ default_branch: string }>(repoEndpoint(host, owner, repo), token);
    return { branch: info.default_branch, sha: info.default_branch, path: '' };
  }

  const prefix = context.rawRef.split('/')[0]!;
  const refs = await listRefs(context, prefix, token);
  const match = matchRef(refs, context.rawRef);
  if (match) {
    return {
      branch: match.name,
      sha: match.commit.sha,
      path: context.rawRef.slice(match.name.length + 1),
    };
  }

  const [first, ...rest] = context.rawRef.split('/');
  return { branch: first ?? '', sha: first ?? '', path: rest.join('/') };
}

async function listRefs(context: RepoContext, prefix: string, token?: string): Promise<NamedRef[]> {
  const { host, owner, repo } = context;
  const [heads, tags] = await Promise.all([
    getMatching(matchingRefsEndpoint(host, owner, repo, 'heads', prefix), 'refs/heads/', token),
    getMatching(matchingRefsEndpoint(host, owner, repo, 'tags', prefix), 'refs/tags/', token),
  ]);
  return [...heads, ...tags];
}

async function getMatching(url: string, strip: string, token?: string): Promise<NamedRef[]> {
  try {
    const refs = await getJson<MatchingRef[]>(url, token);
    return refs.map((ref) => ({
      name: ref.ref.replace(strip, ''),
      commit: { sha: ref.object.sha },
    }));
  } catch {
    return [];
  }
}

export function matchRef(refs: NamedRef[], rawRef: string): NamedRef | undefined {
  return refs
    .filter((ref) => rawRef === ref.name || rawRef.startsWith(`${ref.name}/`))
    .sort((a, b) => b.name.length - a.name.length)[0];
}

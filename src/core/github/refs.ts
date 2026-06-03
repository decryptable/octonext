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

const defaultBranchCache = new Map<string, string>();

export async function resolveRef(context: RepoContext, token?: string): Promise<ResolvedRef> {
  const branch = await defaultBranch(context, token);
  if (!context.rawRef) return { branch, sha: branch, path: '' };

  if (context.rawRef === branch || context.rawRef.startsWith(`${branch}/`)) {
    return { branch, sha: branch, path: context.rawRef.slice(branch.length + 1) };
  }

  const prefix = context.rawRef.split('/')[0]!;
  const match = matchRef(await listRefs(context, prefix, token), context.rawRef);
  if (match) {
    return {
      branch: match.name,
      sha: match.commit.sha,
      path: context.rawRef.slice(match.name.length + 1),
    };
  }

  const [first, ...rest] = context.rawRef.split('/');
  return { branch: first ?? branch, sha: first ?? branch, path: rest.join('/') };
}

async function defaultBranch(context: RepoContext, token?: string): Promise<string> {
  const key = `${context.host}/${context.owner}/${context.repo}`;
  const cached = defaultBranchCache.get(key);
  if (cached) return cached;
  const url = repoEndpoint(context.host, context.owner, context.repo);
  const info = await getJson<{ default_branch: string }>(url, token);
  defaultBranchCache.set(key, info.default_branch);
  return info.default_branch;
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

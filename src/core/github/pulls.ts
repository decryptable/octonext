import type { PullData, RepoContext } from '../types';
import { getJson } from './client';
import { pullEndpoint } from './endpoints';
import { fetchPullComments, fetchPullFiles } from './pull-files';
import { type PullInfo, toPullData } from './pull-map';

export async function loadPull(
  context: RepoContext,
  pullNumber: number,
  token?: string,
): Promise<PullData> {
  const { host, owner, repo } = context;
  const info = await getJson<PullInfo>(pullEndpoint(host, owner, repo, pullNumber), token);
  const [files, comments] = await Promise.all([
    fetchPullFiles(context, pullNumber, info.changed_files, token),
    fetchPullComments(context, pullNumber, token),
  ]);
  return toPullData(pullNumber, info, files, comments);
}

export async function diffAnchor(path: string): Promise<string> {
  const bytes = new TextEncoder().encode(path);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `diff-${hex}`;
}

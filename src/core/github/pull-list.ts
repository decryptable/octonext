import type { PullSummary, RepoContext } from '../types';
import { getJson } from './client';
import { pullsListEndpoint } from './endpoints';
import { type ListItem, toSummary } from './pull-map';

export async function loadPullList(context: RepoContext, token?: string): Promise<PullSummary[]> {
  const { host, owner, repo } = context;
  const items = await getJson<ListItem[]>(pullsListEndpoint(host, owner, repo), token);
  return items.map(toSummary);
}

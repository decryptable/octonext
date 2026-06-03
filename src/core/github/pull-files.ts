import type { PullComment, PullFile, RepoContext } from '../types';
import { getJson } from './client';
import { pullCommentsEndpoint, pullFilesEndpoint } from './endpoints';
import { type CommentResponse, type FileResponse, toComment, toFile } from './pull-map';

const PAGE_SIZE = 100;
const MAX_PAGES = 6;

export async function fetchPullFiles(
  context: RepoContext,
  pullNumber: number,
  total: number,
  token?: string,
): Promise<PullFile[]> {
  const { host, owner, repo } = context;
  const pages = Math.min(MAX_PAGES, Math.max(1, Math.ceil(total / PAGE_SIZE)));
  const requests: Promise<FileResponse[]>[] = [];
  for (let page = 1; page <= pages; page += 1) {
    requests.push(
      getJson<FileResponse[]>(pullFilesEndpoint(host, owner, repo, pullNumber, page), token),
    );
  }
  const results = await Promise.all(requests);
  return results.flat().map(toFile);
}

export async function fetchPullComments(
  context: RepoContext,
  pullNumber: number,
  token?: string,
): Promise<PullComment[]> {
  const { host, owner, repo } = context;
  const url = pullCommentsEndpoint(host, owner, repo, pullNumber);
  const comments = await getJson<CommentResponse[]>(url, token);
  return comments.map(toComment);
}

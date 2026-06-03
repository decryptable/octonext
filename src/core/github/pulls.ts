import type { PullComment, PullData, PullFile, RepoContext } from '../types';
import { getJson } from './client';
import { pullCommentsEndpoint, pullEndpoint, pullFilesEndpoint } from './endpoints';

interface FileResponse {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
}

interface CommentResponse {
  path?: string;
  body: string;
  html_url: string;
  user: { login: string } | null;
}

export async function loadPull(
  context: RepoContext,
  pullNumber: number,
  token?: string,
): Promise<PullData> {
  const { host, owner, repo } = context;
  const [info, files, comments] = await Promise.all([
    getJson<{ title: string }>(pullEndpoint(host, owner, repo, pullNumber), token),
    getJson<FileResponse[]>(pullFilesEndpoint(host, owner, repo, pullNumber), token),
    getJson<CommentResponse[]>(pullCommentsEndpoint(host, owner, repo, pullNumber), token),
  ]);
  return {
    number: pullNumber,
    title: info.title,
    files: files.map(toFile),
    comments: comments.map(toComment),
  };
}

function toFile(file: FileResponse): PullFile {
  return {
    path: file.filename,
    status: file.status,
    additions: file.additions,
    deletions: file.deletions,
  };
}

function toComment(comment: CommentResponse): PullComment {
  return {
    path: comment.path ?? null,
    body: comment.body,
    author: comment.user?.login ?? 'unknown',
    url: comment.html_url,
  };
}

export async function diffAnchor(path: string): Promise<string> {
  const bytes = new TextEncoder().encode(path);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const hex = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `diff-${hex}`;
}

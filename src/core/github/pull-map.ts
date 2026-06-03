import type { PullComment, PullData, PullFile, PullLabel, PullState, PullSummary } from '../types';

export interface FileResponse {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
}

export interface CommentResponse {
  path?: string;
  body: string;
  html_url: string;
  user: { login: string } | null;
}

export interface PullInfo {
  title: string;
  state: string;
  draft?: boolean;
  merged?: boolean;
  user: { login: string } | null;
  base: { ref: string };
  head: { ref: string };
  additions: number;
  deletions: number;
  changed_files: number;
  commits: number;
  review_comments: number;
  labels: { name: string; color: string }[];
  requested_reviewers: { login: string }[] | null;
}

function resolveState(info: PullInfo): PullState {
  if (info.merged) return 'merged';
  if (info.state === 'closed') return 'closed';
  if (info.draft) return 'draft';
  return 'open';
}

export function toFile(file: FileResponse): PullFile {
  return {
    path: file.filename,
    status: file.status,
    additions: file.additions,
    deletions: file.deletions,
  };
}

export function toComment(comment: CommentResponse): PullComment {
  return {
    path: comment.path ?? null,
    body: comment.body,
    author: comment.user?.login ?? 'unknown',
    url: comment.html_url,
  };
}

function toLabel(label: { name: string; color: string }): PullLabel {
  return { name: label.name, color: `#${label.color || '8b949e'}` };
}

export interface ListItem {
  number: number;
  title: string;
  draft?: boolean;
  user: { login: string } | null;
  head: { ref: string };
  labels: { name: string; color: string }[];
}

export function toSummary(item: ListItem): PullSummary {
  return {
    number: item.number,
    title: item.title,
    author: item.user?.login ?? 'unknown',
    state: item.draft ? 'draft' : 'open',
    headRef: item.head.ref,
    labels: item.labels.map(toLabel),
  };
}

export function toPullData(
  numberValue: number,
  info: PullInfo,
  files: PullFile[],
  comments: PullComment[],
): PullData {
  return {
    number: numberValue,
    title: info.title,
    state: resolveState(info),
    author: info.user?.login ?? 'unknown',
    baseRef: info.base.ref,
    headRef: info.head.ref,
    additions: info.additions,
    deletions: info.deletions,
    changedFiles: info.changed_files,
    commits: info.commits,
    reviewComments: info.review_comments,
    labels: info.labels.map(toLabel),
    reviewers: (info.requested_reviewers ?? []).map((reviewer) => reviewer.login),
    files,
    comments,
  };
}

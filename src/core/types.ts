export type NodeType = 'blob' | 'tree';
export type RepoView = 'tree' | 'pull' | 'other';

export interface RepoRef {
  host: string;
  owner: string;
  repo: string;
  branch: string;
}

export interface RepoContext {
  host: string;
  owner: string;
  repo: string;
  view: RepoView;
  rawRef: string;
  pullNumber: number | null;
}

export interface ResolvedRef {
  branch: string;
  sha: string;
  path: string;
}

export interface FlatTreeItem {
  path: string;
  type: NodeType;
  sha: string;
  size?: number;
}

export interface TreeNode {
  name: string;
  path: string;
  type: NodeType;
  sha: string;
  size?: number;
  children: TreeNode[];
}

export interface RepoTree {
  ref: RepoRef;
  root: TreeNode;
  currentPath: string;
  truncated: boolean;
}

export type PullState = 'open' | 'merged' | 'closed' | 'draft';

export interface PullFile {
  path: string;
  status: string;
  additions: number;
  deletions: number;
}

export interface PullComment {
  path: string | null;
  body: string;
  author: string;
  url: string;
}

export interface PullLabel {
  name: string;
  color: string;
}

export interface PullSummary {
  number: number;
  title: string;
  author: string;
  state: PullState;
  headRef: string;
  labels: PullLabel[];
}

export interface PullData {
  number: number;
  title: string;
  state: PullState;
  author: string;
  baseRef: string;
  headRef: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  commits: number;
  reviewComments: number;
  labels: PullLabel[];
  reviewers: string[];
  files: PullFile[];
  comments: PullComment[];
}

export interface Bookmark {
  id: string;
  type: NodeType | 'repo';
  label: string;
  url: string;
  addedAt: number;
}

export class GitHubApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly isRateLimit = false,
  ) {
    super(message);
    this.name = 'GitHubApiError';
  }
}

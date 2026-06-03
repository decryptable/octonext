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

export interface PullData {
  number: number;
  title: string;
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

export type NodeType = 'blob' | 'tree';

export interface RepoRef {
  host: string;
  owner: string;
  repo: string;
  branch: string;
}

export interface RepoContext extends RepoRef {
  currentPath: string;
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
  truncated: boolean;
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

import type { Adapter } from './adapter';
import type { Settings } from '../../shared/settings';
import type { FlatTreeItem, RepoContext, RepoRef, RepoTree, TreeNode } from '../types';
import { getJson } from '../github/client';
import { repoEndpoint, treeEndpoint } from '../github/endpoints';
import { buildTree } from '../github/tree-builder';
import { parseRepoContext } from './repo-context';

interface RepoResponse {
  default_branch: string;
}

interface TreeResponse {
  tree: FlatTreeItem[];
  truncated: boolean;
}

export class GitHubAdapter implements Adapter {
  constructor(readonly host: string) {}

  getContext(url: URL): RepoContext | null {
    return parseRepoContext(url, this.host);
  }

  async loadTree(context: RepoContext, settings: Settings): Promise<RepoTree> {
    const token = settings.accessToken || undefined;
    const branch = context.branch || (await this.defaultBranch(context, token));
    const ref: RepoRef = { ...context, branch };
    const url = treeEndpoint(context.host, context.owner, context.repo, branch);
    const response = await getJson<TreeResponse>(url, token);
    const root = buildTree(response.tree, settings.collapseDirectories);
    return { ref, root, truncated: response.truncated };
  }

  nodeUrl(node: TreeNode, ref: RepoRef): string {
    const view = node.type === 'tree' ? 'tree' : 'blob';
    return `https://${ref.host}/${ref.owner}/${ref.repo}/${view}/${ref.branch}/${node.path}`;
  }

  private async defaultBranch(context: RepoContext, token?: string): Promise<string> {
    const url = repoEndpoint(context.host, context.owner, context.repo);
    const repo = await getJson<RepoResponse>(url, token);
    return repo.default_branch;
  }
}

import type { Settings } from '../../shared/settings';
import type { Adapter } from './adapter';
import type {
  FlatTreeItem,
  PullData,
  PullSummary,
  RepoContext,
  RepoRef,
  RepoTree,
  TreeNode,
} from '../types';
import { GitHubApiError } from '../types';
import { getJson } from '../github/client';
import { treeEndpoint } from '../github/endpoints';
import { resolveRef } from '../github/refs';
import { loadPull } from '../github/pulls';
import { loadPullList } from '../github/pull-list';
import { buildTree } from '../github/tree-builder';
import { parseRepoContext } from './repo-context';

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
    const resolved = await resolveRef(context, token);
    const ref: RepoRef = {
      host: context.host,
      owner: context.owner,
      repo: context.repo,
      branch: resolved.branch,
    };
    const url = treeEndpoint(context.host, context.owner, context.repo, resolved.sha);
    const response = await getJson<TreeResponse>(url, token);
    const root = buildTree(response.tree, settings.collapseDirectories);
    return { ref, root, currentPath: resolved.path, truncated: response.truncated };
  }

  async loadPull(context: RepoContext, settings: Settings): Promise<PullData> {
    if (context.pullNumber == null) throw new GitHubApiError('No pull request in context', 0);
    return loadPull(context, context.pullNumber, settings.accessToken || undefined);
  }

  async loadPullList(context: RepoContext, settings: Settings): Promise<PullSummary[]> {
    return loadPullList(context, settings.accessToken || undefined);
  }

  nodeUrl(node: TreeNode, ref: RepoRef): string {
    const view = node.type === 'tree' ? 'tree' : 'blob';
    return `https://${ref.host}/${ref.owner}/${ref.repo}/${view}/${ref.branch}/${node.path}`;
  }
}

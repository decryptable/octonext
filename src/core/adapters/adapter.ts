import type { Settings } from '../../shared/settings';
import type { PullData, PullSummary, RepoContext, RepoRef, RepoTree, TreeNode } from '../types';

export interface Adapter {
  readonly host: string;
  getContext(url: URL): RepoContext | null;
  loadTree(context: RepoContext, settings: Settings): Promise<RepoTree>;
  loadPull(context: RepoContext, settings: Settings): Promise<PullData>;
  loadPullList(context: RepoContext, settings: Settings): Promise<PullSummary[]>;
  nodeUrl(node: TreeNode, ref: RepoRef): string;
}

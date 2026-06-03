import type { Settings } from '../../shared/settings';
import type { PullData, RepoContext, RepoRef, RepoTree, TreeNode } from '../types';

export interface Adapter {
  readonly host: string;
  getContext(url: URL): RepoContext | null;
  loadTree(context: RepoContext, settings: Settings): Promise<RepoTree>;
  loadPull(context: RepoContext, settings: Settings): Promise<PullData>;
  nodeUrl(node: TreeNode, ref: RepoRef): string;
}

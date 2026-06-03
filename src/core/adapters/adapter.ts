import type { RepoContext, RepoTree, TreeNode } from '../types';
import type { Settings } from '../../shared/settings';

export interface Adapter {
  readonly host: string;
  getContext(url: URL): RepoContext | null;
  loadTree(context: RepoContext, settings: Settings): Promise<RepoTree>;
  nodeUrl(node: TreeNode, ref: RepoTree['ref']): string;
}

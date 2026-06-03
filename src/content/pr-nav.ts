import type { RepoContext } from '../core/types';
import { navigateTo } from './navigate';

export function openDiffFile(context: RepoContext, anchor: string): void {
  const filesPath = `/${context.owner}/${context.repo}/pull/${context.pullNumber}/files`;
  if (location.pathname === filesPath) {
    location.hash = anchor;
    document.getElementById(anchor)?.scrollIntoView({ block: 'start' });
    return;
  }
  navigateTo(`https://${context.host}${filesPath}#${anchor}`);
}

import type { DockSide } from '../../shared/settings';
import type { TabId } from './tabs';

export interface SidebarCallbacks {
  onBookmark: () => void;
  onRefresh: () => void;
  onSettings: () => void;
  onTabChange: (id: TabId) => void;
  onDockChange: (dock: DockSide) => void;
  onWidthCommit: (width: number) => void;
  onToggleOffsetCommit: (offset: number) => void;
  onPinnedChange: (pinned: boolean) => void;
  onOpenChange: (open: boolean) => void;
}

import { ROOT_CLASS } from '../shared/constants';
import { resolveFont } from '../shared/fonts';
import type { Settings } from '../shared/settings';
import { applyTheme } from '../shared/theme';
import type { Sidebar } from '../ui/sidebar/sidebar';

export function applyAppearance(sidebar: Sidebar, settings: Settings): void {
  applyTheme(sidebar.root, settings.theme);
  const font = resolveFont(settings.font);
  sidebar.setFont(font.stack, settings.fontSize);
  sidebar.setDock(settings.dock);
  sidebar.setToggleOffset(settings.toggleOffset);
  sidebar.setWidth(settings.sidebarWidth);
  sidebar.setPinned(settings.pinned);
  if (!settings.pinned) sidebar.restoreOpen(settings.sidebarOpen);
  document.documentElement.classList.toggle(ROOT_CLASS.repoOnly, settings.showInRepoOnly);
}

import type { DockSide } from '../../shared/settings';
import type { RepoRef } from '../../core/types';
import { CSS_PREFIX, CSS_VARS, ELEMENT_IDS, ROOT_CLASS } from '../../shared/constants';
import { clear, h } from '../dom';
import { type SidebarHeader, createHeader } from './header';
import { createResizer } from './resizer';
import { TabBar, type TabId } from './tabs';
import { type ToggleButton, createToggle } from './toggle';

export interface SidebarCallbacks {
  onBookmark: () => void;
  onRefresh: () => void;
  onSettings: () => void;
  onTabChange: (id: TabId) => void;
  onDockChange: (dock: DockSide) => void;
  onWidthCommit: (width: number) => void;
  onToggleOffsetCommit: (offset: number) => void;
}

export class Sidebar {
  readonly root: HTMLElement;
  private readonly aside: HTMLElement;
  private readonly header: SidebarHeader;
  private readonly tabs: TabBar;
  private readonly toggle: ToggleButton;
  private readonly panels: Record<TabId, HTMLElement>;
  private width = 0;
  private dock: DockSide = 'left';
  private open = false;
  private pinned = false;

  constructor(callbacks: SidebarCallbacks) {
    this.header = createHeader({
      onBookmark: callbacks.onBookmark,
      onDock: () => callbacks.onDockChange(this.dock === 'left' ? 'right' : 'left'),
      onRefresh: callbacks.onRefresh,
      onSettings: callbacks.onSettings,
      onClose: () => this.setOpen(false),
    });
    this.tabs = new TabBar((id) => callbacks.onTabChange(id));
    this.panels = {
      files: h('div', { class: `${CSS_PREFIX}-panel` }),
      pr: h('div', { class: `${CSS_PREFIX}-panel`, attrs: { hidden: 'true' } }),
      bookmarks: h('div', { class: `${CSS_PREFIX}-panel`, attrs: { hidden: 'true' } }),
    };
    const body = h('div', { class: `${CSS_PREFIX}-sidebar__body` }, ...Object.values(this.panels));
    const resizer = createResizer({
      getWidth: () => this.width,
      getDock: () => this.dock,
      onResize: (width) => this.applyWidth(width),
      onCommit: (width) => callbacks.onWidthCommit(width),
    });
    this.aside = h(
      'aside',
      { class: `${CSS_PREFIX}-sidebar`, attrs: { id: ELEMENT_IDS.sidebar } },
      this.header.el,
      this.tabs.el,
      body,
      resizer,
    );
    this.toggle = createToggle({
      onClick: () => this.setOpen(!this.open),
      onOffsetCommit: (offset) => callbacks.onToggleOffsetCommit(offset),
    });
    this.root = h('div', { attrs: { id: ELEMENT_IDS.root } }, this.aside, this.toggle.el);
    this.showTab('files');
  }

  setRepo(ref: RepoRef): void {
    this.header.setRepo(ref);
  }

  setBookmarked(active: boolean): void {
    this.header.setBookmarked(active);
  }

  setPanel(id: TabId, node: Node): void {
    clear(this.panels[id]);
    this.panels[id].appendChild(node);
  }

  showTab(id: TabId): void {
    this.tabs.setActive(id);
    for (const [tabId, panel] of Object.entries(this.panels)) panel.hidden = tabId !== id;
  }

  setTabVisible(id: TabId, visible: boolean): void {
    this.tabs.setVisible(id, visible);
  }

  setFont(stack: string, size: number): void {
    this.aside.style.setProperty(CSS_VARS.fontFamily, stack);
    this.aside.style.setProperty(CSS_VARS.fontSize, `${size}px`);
  }

  setDock(dock: DockSide): void {
    this.dock = dock;
    document.documentElement.classList.toggle(ROOT_CLASS.dockRight, dock === 'right');
  }

  setToggleOffset(offset: number): void {
    this.toggle.setOffset(offset);
  }

  setWidth(width: number): void {
    this.applyWidth(width);
  }

  setPinned(pinned: boolean): void {
    this.pinned = pinned;
    document.documentElement.classList.toggle(ROOT_CLASS.pinned, pinned);
    if (pinned) this.setOpen(true);
  }

  setOpen(open: boolean): void {
    if (this.open === open) return;
    this.open = open;
    document.documentElement.classList.toggle(ROOT_CLASS.open, open);
    this.toggle.setOpen(open);
  }

  isOpen(): boolean {
    return this.open || this.pinned;
  }

  private applyWidth(width: number): void {
    this.width = width;
    this.aside.style.width = `${width}px`;
    document.documentElement.style.setProperty(CSS_VARS.sidebarWidth, `${width}px`);
  }
}

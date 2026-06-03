import type { RepoRef } from '../../core/types';
import { CSS_PREFIX, CSS_VARS, ELEMENT_IDS } from '../../shared/constants';
import { clear, h } from '../dom';
import { type SidebarHeader, createHeader } from './header';
import { createResizer } from './resizer';
import { type ToggleButton, createToggle } from './toggle';

export interface SidebarCallbacks {
  onRefresh: () => void;
  onSettings: () => void;
  onWidthCommit: (width: number) => void;
  onOpenChange: (open: boolean) => void;
}

export class Sidebar {
  readonly root: HTMLElement;
  private readonly aside: HTMLElement;
  private readonly body: HTMLElement;
  private readonly header: SidebarHeader;
  private readonly toggle: ToggleButton;
  private width = 0;
  private open = false;
  private pinned = false;

  constructor(private readonly callbacks: SidebarCallbacks) {
    this.header = createHeader({
      onRefresh: callbacks.onRefresh,
      onSettings: callbacks.onSettings,
      onClose: () => this.setOpen(false),
    });
    this.body = h('div', { class: `${CSS_PREFIX}-sidebar__body` });
    const resizer = createResizer({
      getWidth: () => this.width,
      onResize: (width) => this.applyWidth(width),
      onCommit: (width) => callbacks.onWidthCommit(width),
    });
    this.aside = h(
      'aside',
      { class: `${CSS_PREFIX}-sidebar`, attrs: { id: ELEMENT_IDS.sidebar } },
      this.header.el,
      this.body,
      resizer,
    );
    this.toggle = createToggle(() => this.setOpen(!this.open));
    this.root = h('div', { attrs: { id: ELEMENT_IDS.root } }, this.aside, this.toggle.el);
  }

  setRepo(ref: RepoRef): void {
    this.header.setRepo(ref);
  }

  setWidth(width: number): void {
    this.width = width;
    this.applyWidth(width);
  }

  setPinned(pinned: boolean): void {
    this.pinned = pinned;
    document.documentElement.classList.toggle(`${CSS_PREFIX}-pinned`, pinned);
    if (pinned) this.setOpen(true);
  }

  setOpen(open: boolean): void {
    if (this.open === open) return;
    this.open = open;
    document.documentElement.classList.toggle(`${CSS_PREFIX}-open`, open);
    this.toggle.setOpen(open);
    this.callbacks.onOpenChange(open);
  }

  isOpen(): boolean {
    return this.open || this.pinned;
  }

  setContent(node: Node): void {
    clear(this.body);
    this.body.appendChild(node);
  }

  private applyWidth(width: number): void {
    this.width = width;
    this.aside.style.width = `${width}px`;
    document.documentElement.style.setProperty(CSS_VARS.sidebarWidth, `${width}px`);
  }
}

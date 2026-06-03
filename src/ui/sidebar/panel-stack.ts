import { CSS_PREFIX } from '../../shared/constants';
import { clear, h } from '../dom';
import type { TabId } from './tabs';

export class PanelStack {
  readonly el: HTMLElement;
  private readonly panels: Record<TabId, HTMLElement>;

  constructor() {
    this.panels = {
      files: h('div', { class: `${CSS_PREFIX}-panel` }),
      pr: h('div', { class: `${CSS_PREFIX}-panel`, attrs: { hidden: 'true' } }),
      bookmarks: h('div', { class: `${CSS_PREFIX}-panel`, attrs: { hidden: 'true' } }),
    };
    this.el = h('div', { class: `${CSS_PREFIX}-sidebar__body` }, ...Object.values(this.panels));
  }

  set(id: TabId, node: Node): void {
    clear(this.panels[id]);
    this.panels[id].appendChild(node);
  }

  show(id: TabId): void {
    for (const [tabId, panel] of Object.entries(this.panels)) panel.hidden = tabId !== id;
  }
}

import { CSS_PREFIX } from '../../shared/constants';
import { h } from '../dom';

export type TabId = 'files' | 'pr' | 'bookmarks';

interface TabSpec {
  id: TabId;
  label: string;
}

const TABS: TabSpec[] = [
  { id: 'files', label: 'Files' },
  { id: 'pr', label: 'Pull Request' },
  { id: 'bookmarks', label: 'Bookmarks' },
];

export class TabBar {
  readonly el: HTMLElement;
  private readonly buttons = new Map<TabId, HTMLButtonElement>();

  constructor(onSelect: (id: TabId) => void) {
    this.el = h('div', { class: `${CSS_PREFIX}-tabs`, attrs: { role: 'tablist' } });
    for (const tab of TABS) {
      const button = h('button', {
        class: `${CSS_PREFIX}-tab`,
        type: 'button',
        text: tab.label,
        title: tab.label,
        attrs: { role: 'tab' },
        on: { click: () => onSelect(tab.id) },
      });
      this.buttons.set(tab.id, button);
      this.el.appendChild(button);
    }
  }

  setActive(id: TabId): void {
    for (const [tabId, button] of this.buttons)
      button.classList.toggle(`${CSS_PREFIX}-tab--active`, tabId === id);
  }

  setVisible(id: TabId, visible: boolean): void {
    const button = this.buttons.get(id);
    if (button) button.hidden = !visible;
  }
}

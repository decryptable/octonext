import type { PullFile } from '../../core/types';
import { CSS_PREFIX } from '../../shared/constants';
import { clear, h } from '../dom';
import { prFileRow } from './pr-file-row';

const PAGE_SIZE = 25;

export interface PrFilesOptions {
  files: PullFile[];
  onOpen: (path: string) => void;
}

export class PrFiles {
  readonly el: HTMLElement;
  private readonly list: HTMLElement;
  private readonly pager: HTMLElement;
  private query = '';
  private page = 0;
  private filtered: PullFile[];
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor(private readonly options: PrFilesOptions) {
    this.filtered = options.files;
    this.list = h('div', { class: `${CSS_PREFIX}-pr__files` });
    this.pager = h('div', { class: `${CSS_PREFIX}-pr__pager` });
    this.el = h(
      'section',
      { class: `${CSS_PREFIX}-pr__section` },
      this.toolbar(),
      this.list,
      this.pager,
    );
    this.render();
  }

  private toolbar(): HTMLElement {
    const input = h('input', {
      class: `${CSS_PREFIX}-search__input`,
      type: 'search',
      attrs: {
        placeholder: 'Filter changed files…',
        'aria-label': 'Filter changed files',
        spellcheck: 'false',
      },
      on: { input: () => this.schedule(input.value) },
    });
    return h(
      'div',
      { class: `${CSS_PREFIX}-pr__toolbar` },
      h('span', {
        class: `${CSS_PREFIX}-pr__heading`,
        text: `Changed files (${this.options.files.length})`,
      }),
      h('div', { class: `${CSS_PREFIX}-search` }, input),
    );
  }

  private schedule(value: string): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.applySearch(value), 120);
  }

  private applySearch(value: string): void {
    this.query = value.trim();
    const needle = this.query.toLowerCase();
    this.filtered = needle
      ? this.options.files.filter((file) => file.path.toLowerCase().includes(needle))
      : this.options.files;
    this.page = 0;
    this.render();
  }

  private render(): void {
    clear(this.list);
    if (this.filtered.length === 0) {
      this.list.appendChild(
        h('p', { class: `${CSS_PREFIX}-pr__empty`, text: 'No matching files' }),
      );
      clear(this.pager);
      return;
    }
    const start = this.page * PAGE_SIZE;
    for (const file of this.filtered.slice(start, start + PAGE_SIZE)) {
      this.list.appendChild(prFileRow(file, this.query, this.options.onOpen));
    }
    this.renderPager();
  }

  private renderPager(): void {
    clear(this.pager);
    const pages = Math.ceil(this.filtered.length / PAGE_SIZE);
    if (pages <= 1) return;
    const start = this.page * PAGE_SIZE + 1;
    const end = Math.min(this.filtered.length, start + PAGE_SIZE - 1);
    this.pager.append(
      this.navButton('Prev', this.page > 0, -1),
      h('span', {
        class: `${CSS_PREFIX}-pr__range`,
        text: `${start}–${end} of ${this.filtered.length}`,
      }),
      this.navButton('Next', this.page < pages - 1, 1),
    );
  }

  private navButton(label: string, enabled: boolean, delta: number): HTMLButtonElement {
    return h('button', {
      class: `${CSS_PREFIX}-pr__nav`,
      type: 'button',
      text: label,
      attrs: enabled ? {} : { disabled: 'true' },
      on: { click: () => this.go(delta) },
    });
  }

  private go(delta: number): void {
    this.page += delta;
    this.render();
  }
}

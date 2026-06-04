import { CSS_PREFIX, ELEMENT_IDS } from '../shared/constants';
import { injectFontFaces, resolveFont } from '../shared/fonts';
import type { IconPack } from '../shared/settings';
import { applyTheme } from '../shared/theme';
import { IconResolver } from '../core/icons/icon-resolver';
import { clear, h, svg } from '../ui/dom';
import { ICONS } from '../ui/icons';

const P = CSS_PREFIX;

const LOGO =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38v-1.34c-2.23.49-2.7-1.08-2.7-1.08-.36-.92-.89-1.16-.89-1.16-.73-.5.05-.49.05-.49.81.06 1.23.83 1.23.83.72 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.13 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.03 2.2-.82 2.2-.82.44 1.11.16 1.93.08 2.13.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.74.54 1.49v2.2c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>';

interface Item {
  name: string;
  folder: boolean;
  depth: number;
  active?: boolean;
}

const ITEMS: Item[] = [
  { name: 'src', folder: true, depth: 0 },
  { name: 'core', folder: true, depth: 1 },
  { name: 'client.ts', folder: false, depth: 2 },
  { name: 'tree-builder.ts', folder: false, depth: 2, active: true },
  { name: 'app.ts', folder: false, depth: 1 },
  { name: 'README.md', folder: false, depth: 0 },
];

function header(): HTMLElement {
  return h(
    'div',
    { class: `${P}-header` },
    svg(LOGO, `${P}-header__logo`),
    h('span', { class: `${P}-header__title`, text: 'OctoNext' }),
    h('span', { class: `${P}-header__size`, text: '4.2 MB' }),
  );
}

function tabs(): HTMLElement {
  const tab = (label: string, active = false) =>
    h('span', { class: `${P}-tab${active ? ` ${P}-tab--active` : ''}`, text: label });
  return h(
    'div',
    { class: `${P}-tabs` },
    tab('Files', true),
    tab('Pull Request'),
    tab('Bookmarks'),
  );
}

function inlineIcon(item: Item): SVGElement {
  const variant = item.folder ? 'folder' : 'file';
  return svg(ICONS[variant], `${P}-node__icon ${P}-node__icon--${variant}`);
}

function paintIcon(box: HTMLElement, item: Item, resolver: IconResolver): void {
  clear(box);
  const url = item.folder ? resolver.folderUrl(item.name, true) : resolver.fileUrl(item.name);
  if (!url) return void box.appendChild(inlineIcon(item));
  const fallback = item.folder ? resolver.fallbackFolderUrl(true) : resolver.fallbackFileUrl();
  const img = h('img', {
    class: `${P}-node__icon`,
    attrs: { src: url, alt: '', loading: 'lazy', decoding: 'async' },
  });
  img.addEventListener('error', () => void (img.src !== fallback && (img.src = fallback)), {
    once: true,
  });
  box.appendChild(img);
}

export class Preview {
  private readonly root: HTMLElement;
  private readonly sidebar: HTMLElement;
  private readonly boxes: HTMLElement[] = [];
  private resolver: IconResolver | undefined;

  constructor(mount: HTMLElement) {
    injectFontFaces(document);
    this.sidebar = h('div', { class: `${P}-sidebar` }, header(), tabs(), this.tree());
    this.root = h('div', { attrs: { id: ELEMENT_IDS.root } }, this.sidebar);
    mount.appendChild(this.root);
  }

  private tree(): HTMLElement {
    const rows = ITEMS.map((item) => {
      const box = h('span', { class: `${P}-node__icon-box` });
      this.boxes.push(box);
      return h(
        'div',
        {
          class: `${P}-node${item.active ? ` ${P}-node--active` : ''}`,
          style: { paddingLeft: `${10 + item.depth * 16}px` },
        },
        box,
        h('span', { class: `${P}-node__label`, text: item.name }),
      );
    });
    return h('div', { class: `${P}-preview__tree` }, ...rows);
  }

  select(key: string, id: string): void {
    if (key === 'theme') this.setTheme(id);
    else if (key === 'font') this.setFont(id);
    else if (key === 'iconPack') void this.setIconPack(id as IconPack);
  }

  setTheme(theme: string): void {
    applyTheme(this.root, theme);
  }

  setFont(id: string): void {
    this.sidebar.style.fontFamily = resolveFont(id).stack;
  }

  setFontSize(size: number): void {
    this.sidebar.style.fontSize = `${size}px`;
  }

  async setIconPack(pack: IconPack): Promise<void> {
    this.resolver = await IconResolver.create(pack);
    ITEMS.forEach((item, i) => paintIcon(this.boxes[i]!, item, this.resolver!));
  }
}

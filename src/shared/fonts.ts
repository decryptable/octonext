import { browser } from './browser';
import { ASSET_PATHS, ELEMENT_IDS } from './constants';

export interface FontOption {
  id: string;
  label: string;
  stack: string;
  file?: string;
}

const SYSTEM_STACK = `ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace`;

export const FONTS: FontOption[] = [
  { id: 'system', label: 'System monospace', stack: SYSTEM_STACK },
  {
    id: 'sans',
    label: 'System sans-serif',
    stack: `-apple-system, BlinkMacSystemFont, sans-serif`,
  },
  {
    id: 'jetbrains-mono',
    label: 'JetBrains Mono',
    stack: `'JetBrains Mono', ${SYSTEM_STACK}`,
    file: 'jetbrains-mono.woff2',
  },
  {
    id: 'fira-code',
    label: 'Fira Code',
    stack: `'Fira Code', ${SYSTEM_STACK}`,
    file: 'fira-code.woff2',
  },
  {
    id: 'source-code-pro',
    label: 'Source Code Pro',
    stack: `'Source Code Pro', ${SYSTEM_STACK}`,
    file: 'source-code-pro.woff2',
  },
  {
    id: 'cascadia-code',
    label: 'Cascadia Code',
    stack: `'Cascadia Code', ${SYSTEM_STACK}`,
    file: 'cascadia-code.woff2',
  },
  {
    id: 'iosevka',
    label: 'Iosevka',
    stack: `'Iosevka', ${SYSTEM_STACK}`,
    file: 'iosevka-regular.woff2',
  },
  {
    id: 'ubuntu-mono',
    label: 'Ubuntu Mono',
    stack: `'Ubuntu Mono', ${SYSTEM_STACK}`,
    file: 'ubuntu-mono.woff2',
  },
];

const FONT_BY_ID = new Map(FONTS.map((font) => [font.id, font]));

export function resolveFont(id: string): FontOption {
  return FONT_BY_ID.get(id) ?? FONTS[0]!;
}

function faceFor(font: FontOption): string {
  if (!font.file) return '';
  const family = font.stack.split(',')[0]!.trim().replace(/'/g, '');
  const url = browser.runtime.getURL(`${ASSET_PATHS.fontsDir}/${font.file}`);
  return `@font-face{font-family:'${family}';font-display:swap;src:url('${url}') format('woff2');}`;
}

export function injectFontFaces(doc: Document = document): void {
  if (doc.getElementById(ELEMENT_IDS.fontStyle)) return;
  const style = doc.createElement('style');
  style.id = ELEMENT_IDS.fontStyle;
  style.textContent = FONTS.map(faceFor).join('');
  doc.head.appendChild(style);
}

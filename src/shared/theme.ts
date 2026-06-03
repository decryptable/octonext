import { DATA_ATTR } from './constants';

export interface ThemeOption {
  id: string;
  label: string;
}

export const THEMES: ThemeOption[] = [
  { id: 'auto', label: 'Auto (system)' },
  { id: 'light', label: 'GitHub Light' },
  { id: 'dark', label: 'GitHub Dark' },
  { id: 'dark-dimmed', label: 'GitHub Dark Dimmed' },
  { id: 'one-dark', label: 'One Dark' },
  { id: 'dracula', label: 'Dracula' },
  { id: 'nord', label: 'Nord' },
  { id: 'monokai', label: 'Monokai' },
  { id: 'solarized-light', label: 'Solarized Light' },
  { id: 'solarized-dark', label: 'Solarized Dark' },
  { id: 'gruvbox-dark', label: 'Gruvbox Dark' },
  { id: 'tokyo-night', label: 'Tokyo Night' },
  { id: 'pixel', label: 'Pixel ✨' },
  { id: 'cute', label: 'Cute 🌸' },
  { id: 'retro', label: 'Retro CRT 📺' },
  { id: 'hacking', label: 'Hacker 💻' },
  { id: 'synthwave', label: 'Synthwave 🌆' },
];

const THEME_IDS = new Set(THEMES.map((theme) => theme.id));

export function isTheme(id: string): boolean {
  return THEME_IDS.has(id);
}

export function applyTheme(element: HTMLElement, theme: string): void {
  if (theme === 'auto' || !isTheme(theme)) element.removeAttribute(DATA_ATTR.theme);
  else element.setAttribute(DATA_ATTR.theme, theme);
}

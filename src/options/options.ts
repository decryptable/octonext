import { validateToken } from '../core/github/auth';
import { FONT_SIZE } from '../shared/constants';
import { FONTS } from '../shared/fonts';
import type { Settings } from '../shared/settings';
import { loadSettings, saveSettings } from '../shared/storage';
import { THEMES } from '../shared/theme';
import { Preview } from './preview';
import { type SelectItem, searchableSelect } from './select';

type SelectKey = 'theme' | 'font' | 'iconPack' | 'dock';
type ToggleKey = 'collapseDirectories' | 'showInRepoOnly' | 'pinned';

const TOGGLES: ToggleKey[] = ['collapseDirectories', 'showInRepoOnly', 'pinned'];

const SELECT_ITEMS: Record<SelectKey, SelectItem[]> = {
  theme: THEMES,
  font: FONTS,
  iconPack: [
    { id: 'material', label: 'Material (VS Code)' },
    { id: 'vira', label: 'Vira' },
    { id: 'minimal', label: 'Minimal' },
  ],
  dock: [
    { id: 'left', label: 'Left' },
    { id: 'right', label: 'Right' },
  ],
};

function byId<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el as T;
}

function flash(text: string): void {
  const status = byId<HTMLParagraphElement>('status');
  status.textContent = text;
  window.setTimeout(() => (status.textContent = ''), 1200);
}

async function commit(patch: Partial<Settings>): Promise<void> {
  await saveSettings(patch);
  flash('Saved');
}

function setTokenStatus(text: string, kind: 'ok' | 'error' | 'pending'): void {
  const status = byId<HTMLParagraphElement>('tokenStatus');
  status.textContent = text;
  status.dataset.kind = kind;
}

async function applyToken(value: string): Promise<void> {
  if (!value) {
    await saveSettings({ accessToken: '' });
    setTokenStatus('No token set — public repositories only.', 'pending');
    return;
  }
  setTokenStatus('Validating…', 'pending');
  const check = await validateToken(value);
  if (!check.ok) {
    setTokenStatus(check.message ?? 'Invalid token.', 'error');
    return;
  }
  await saveSettings({ accessToken: value });
  setTokenStatus(`Signed in as ${check.login}. Token saved.`, 'ok');
}

function bindToken(settings: Settings): void {
  const token = byId<HTMLInputElement>('accessToken');
  token.value = settings.accessToken;
  if (settings.accessToken) setTokenStatus('A token is saved.', 'ok');
  token.addEventListener('change', () => void applyToken(token.value.trim()));
}

function bindFontSize(settings: Settings, preview: Preview): void {
  const range = byId<HTMLInputElement>('fontSize');
  const output = byId<HTMLOutputElement>('fontSizeValue');
  range.min = String(FONT_SIZE.min);
  range.max = String(FONT_SIZE.max);
  range.value = String(settings.fontSize);
  output.textContent = `${settings.fontSize}px`;
  range.addEventListener('input', () => {
    output.textContent = `${range.value}px`;
    preview.setFontSize(Number(range.value));
  });
  range.addEventListener('change', () => void commit({ fontSize: Number(range.value) }));
}

function bindSelects(settings: Settings, preview: Preview): void {
  for (const key of Object.keys(SELECT_ITEMS) as SelectKey[]) {
    const mount = byId<HTMLElement>(key);
    mount.appendChild(
      searchableSelect({
        items: SELECT_ITEMS[key],
        value: String(settings[key]),
        onChange: (id) => {
          preview.select(key, id);
          void commit({ [key]: id });
        },
      }),
    );
  }
}

function bindToggles(settings: Settings): void {
  for (const key of TOGGLES) {
    const input = byId<HTMLInputElement>(key);
    input.checked = settings[key];
    input.addEventListener('change', () => void commit({ [key]: input.checked }));
  }
}

async function main(): Promise<void> {
  const settings = await loadSettings();
  const preview = new Preview(byId<HTMLElement>('preview'));
  preview.setTheme(settings.theme);
  preview.setFont(settings.font);
  preview.setFontSize(settings.fontSize);
  await preview.setIconPack(settings.iconPack);
  bindToken(settings);
  bindSelects(settings, preview);
  bindFontSize(settings, preview);
  bindToggles(settings);
}

void main();

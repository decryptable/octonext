import type { Settings } from '../shared/settings';
import { loadSettings, saveSettings } from '../shared/storage';

type BooleanKey = 'collapseDirectories' | 'showInRepoOnly' | 'pinned';

const BOOLEAN_FIELDS: BooleanKey[] = ['collapseDirectories', 'showInRepoOnly', 'pinned'];

function byId<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el as T;
}

function flash(message: string): void {
  const status = byId<HTMLParagraphElement>('status');
  status.textContent = message;
  window.setTimeout(() => (status.textContent = ''), 1500);
}

async function commit(patch: Partial<Settings>): Promise<void> {
  await saveSettings(patch);
  flash('Saved');
}

function bind(settings: Settings): void {
  const token = byId<HTMLInputElement>('token');
  token.value = settings.accessToken;
  token.addEventListener('change', () => void commit({ accessToken: token.value.trim() }));

  for (const key of BOOLEAN_FIELDS) {
    const input = byId<HTMLInputElement>(key);
    input.checked = settings[key];
    input.addEventListener('change', () => void commit({ [key]: input.checked }));
  }
}

async function main(): Promise<void> {
  bind(await loadSettings());
}

void main();

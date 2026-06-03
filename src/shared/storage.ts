import { browser } from './browser';
import { APP_SLUG } from './constants';
import { type Settings, mergeSettings } from './settings';

const STORAGE_KEY = `${APP_SLUG}:settings`;

export type SettingsListener = (settings: Settings) => void;

export async function loadSettings(): Promise<Settings> {
  try {
    const stored = await browser.storage.sync.get(STORAGE_KEY);
    return mergeSettings(stored[STORAGE_KEY] as Partial<Settings> | undefined);
  } catch {
    return mergeSettings(undefined);
  }
}

export async function saveSettings(patch: Partial<Settings>): Promise<Settings> {
  const next = { ...(await loadSettings()), ...patch };
  try {
    await browser.storage.sync.set({ [STORAGE_KEY]: next });
  } catch {
    void 0;
  }
  return next;
}

interface StorageChange {
  newValue?: unknown;
  oldValue?: unknown;
}

export function watchSettings(listener: SettingsListener): () => void {
  const handler = (changes: Record<string, StorageChange>, area: string) => {
    if (area !== 'sync' || !changes[STORAGE_KEY]) return;
    listener(mergeSettings(changes[STORAGE_KEY].newValue as Partial<Settings> | undefined));
  };
  browser.storage.onChanged.addListener(handler);
  return () => browser.storage.onChanged.removeListener(handler);
}

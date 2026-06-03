import { browser } from '../shared/browser';
import { grantedOrigins } from './permissions';

const SCRIPT_ID = (origin: string) => `octonext-dynamic-${origin}`;
const STATIC_MATCHES = new Set(['https://github.com/*']);

async function register(origin: string): Promise<void> {
  if (STATIC_MATCHES.has(origin)) return;
  try {
    await chrome.scripting.registerContentScripts([
      {
        id: SCRIPT_ID(origin),
        matches: [origin],
        js: ['content.js'],
        css: ['content.css'],
        runAt: 'document_start',
      },
    ]);
  } catch {
    void 0;
  }
}

async function unregister(origin: string): Promise<void> {
  try {
    await chrome.scripting.unregisterContentScripts({ ids: [SCRIPT_ID(origin)] });
  } catch {
    void 0;
  }
}

export async function syncDynamicScripts(): Promise<void> {
  for (const origin of await grantedOrigins()) await register(origin);
}

export function watchPermissionChanges(): void {
  browser.permissions.onAdded.addListener(({ origins }) => origins?.forEach(register));
  browser.permissions.onRemoved.addListener(({ origins }) => origins?.forEach(unregister));
}

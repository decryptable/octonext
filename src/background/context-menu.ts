import { browser } from '../shared/browser';
import { APP_NAME, GITHUB_HOST } from '../shared/constants';
import { hasOrigin, removeOrigin, requestOrigin } from './permissions';

const MENU_ID = 'octonext-enable-domain';

function originOf(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (!parsed.protocol.startsWith('http')) return null;
    if (parsed.hostname === GITHUB_HOST) return null;
    return parsed.origin;
  } catch {
    return null;
  }
}

async function activeTabUrl(): Promise<string | undefined> {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  return tab?.url;
}

async function refresh(url?: string): Promise<void> {
  const origin = originOf(url ?? (await activeTabUrl()));
  chrome.contextMenus.update(MENU_ID, {
    enabled: Boolean(origin),
    checked: origin ? await hasOrigin(origin) : false,
  });
}

async function onClick(
  info: chrome.contextMenus.OnClickData,
  tab?: chrome.tabs.Tab,
): Promise<void> {
  const origin = originOf(tab?.url);
  if (info.menuItemId !== MENU_ID || !origin || tab?.id == null) return;
  const granted = info.checked ? await requestOrigin(origin) : !(await removeOrigin(origin));
  await refresh(tab.url);
  if (granted) void browser.tabs.reload(tab.id);
}

export function setupContextMenu(): void {
  chrome.contextMenus.create(
    {
      id: MENU_ID,
      type: 'checkbox',
      checked: false,
      title: `Enable ${APP_NAME} on this domain`,
      contexts: ['action'],
    },
    () => void chrome.runtime.lastError,
  );
  chrome.contextMenus.onClicked.addListener(onClick);
  browser.tabs.onActivated.addListener(() => void refresh());
  browser.tabs.onUpdated.addListener((_id, info, tab) => {
    if (info.status === 'complete') void refresh(tab.url);
  });
}

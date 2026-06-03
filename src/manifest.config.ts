export type BuildTarget = 'chrome' | 'firefox';

const SHARED = {
  manifest_version: 3 as const,
  name: 'OctoNext — GitHub code tree',
  description:
    'A fast, clean code tree sidebar for GitHub with themes, file icons, search, bookmarks, and PR navigation.',
  homepage_url: 'https://github.com/decryptable/octonext',
  icons: { 16: 'icons/icon16.png', 48: 'icons/icon48.png', 128: 'icons/icon128.png' },
  action: { default_icon: 'icons/icon128.png', default_title: 'OctoNext' },
  options_ui: { page: 'options/index.html', open_in_tab: true },
  permissions: ['storage', 'contextMenus', 'activeTab', 'scripting', 'tabs'],
  host_permissions: ['https://api.github.com/*', 'https://github.com/*'],
  optional_host_permissions: ['http://*/*', 'https://*/*'],
  web_accessible_resources: [
    { resources: ['icons/material/*', 'fonts/*', 'icon.svg'], matches: ['*://*/*'] },
  ],
  content_scripts: [
    {
      matches: ['https://github.com/*'],
      js: ['content.js'],
      css: ['content.css'],
      run_at: 'document_start' as const,
    },
  ],
};

export function buildManifest(
  version: string,
  target: BuildTarget = 'chrome',
): chrome.runtime.ManifestV3 {
  const base = { ...SHARED, version } as chrome.runtime.ManifestV3;
  if (target === 'firefox') {
    return {
      ...base,
      background: { scripts: ['background.js'] },
      browser_specific_settings: {
        gecko: { id: 'octonext@decryptable.github.io', strict_min_version: '128.0' },
      },
    } as unknown as chrome.runtime.ManifestV3;
  }
  return {
    ...base,
    minimum_chrome_version: '102',
    background: { service_worker: 'background.js' },
  };
}

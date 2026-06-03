export function buildManifest(version: string): chrome.runtime.ManifestV3 {
  return {
    manifest_version: 3,
    name: 'OctoNext — GitHub code tree',
    version,
    description: 'A fast, clean code tree sidebar for GitHub.',
    homepage_url: 'https://github.com/decryptable/octonext',
    minimum_chrome_version: '102',
    icons: {
      16: 'icons/icon16.png',
      48: 'icons/icon48.png',
      128: 'icons/icon128.png',
    },
    action: {
      default_icon: 'icons/icon128.png',
      default_title: 'OctoNext',
    },
    options_ui: {
      page: 'options/index.html',
      open_in_tab: true,
    },
    background: {
      service_worker: 'background.js',
      type: 'module',
    },
    permissions: ['storage', 'contextMenus', 'activeTab', 'scripting', 'tabs'],
    host_permissions: ['https://api.github.com/*', 'https://github.com/*'],
    optional_host_permissions: ['http://*/*', 'https://*/*'],
    content_scripts: [
      {
        matches: ['https://github.com/*'],
        js: ['content.js'],
        css: ['content.css'],
        run_at: 'document_start',
      },
    ],
  };
}

export const APP_NAME = 'OctoNext';
export const APP_SLUG = 'octonext';

export const CSS_PREFIX = 'octonext';

export const ELEMENT_IDS = {
  root: `${CSS_PREFIX}-root`,
  sidebar: `${CSS_PREFIX}-sidebar`,
  toggle: `${CSS_PREFIX}-toggle`,
  fontStyle: `${CSS_PREFIX}-font-faces`,
} as const;

export const CSS_VARS = {
  sidebarWidth: `--${CSS_PREFIX}-sidebar-width`,
  fontFamily: `--${CSS_PREFIX}-font-family`,
  fontSize: `--${CSS_PREFIX}-font-size`,
} as const;

export const ROOT_CLASS = {
  open: `${CSS_PREFIX}-open`,
  pinned: `${CSS_PREFIX}-pinned`,
  hasRepo: `${CSS_PREFIX}-has-repo`,
  repoOnly: `${CSS_PREFIX}-repo-only`,
  dockRight: `${CSS_PREFIX}-dock-right`,
} as const;

export const DATA_ATTR = {
  theme: `data-${CSS_PREFIX}-theme`,
} as const;

export const GITHUB_HOST = 'github.com';
export const GITHUB_API_ORIGIN = 'https://api.github.com';

export const SIDEBAR_WIDTH = {
  min: 220,
  max: 920,
  default: 320,
} as const;

export const FONT_SIZE = {
  min: 11,
  max: 18,
  default: 13,
} as const;

export const ASSET_PATHS = {
  iconManifest: 'icons/material/manifest.json',
  materialDir: 'icons/material',
  fontsDir: 'fonts',
} as const;

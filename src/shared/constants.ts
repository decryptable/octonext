export const APP_NAME = 'OctoNext';
export const APP_SLUG = 'octonext';

export const CSS_PREFIX = 'octonext';

export const ELEMENT_IDS = {
  root: `${CSS_PREFIX}-root`,
  sidebar: `${CSS_PREFIX}-sidebar`,
  toggle: `${CSS_PREFIX}-toggle`,
} as const;

export const CSS_VARS = {
  sidebarWidth: `--${CSS_PREFIX}-sidebar-width`,
} as const;

export const BODY_CLASS = {
  enabled: `${CSS_PREFIX}-enabled`,
  pinned: `${CSS_PREFIX}-pinned`,
} as const;

export const GITHUB_HOST = 'github.com';
export const GITHUB_API_ORIGIN = 'https://api.github.com';

export const SIDEBAR_WIDTH = {
  min: 220,
  max: 920,
  default: 320,
} as const;

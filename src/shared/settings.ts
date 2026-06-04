import { FONT_SIZE, SIDEBAR_WIDTH } from './constants';

export type DockSide = 'left' | 'right';
export type IconPack = 'material' | 'vira' | 'minimal';

export interface Settings {
  accessToken: string;
  theme: string;
  font: string;
  fontSize: number;
  iconPack: IconPack;
  dock: DockSide;
  toggleOffset: number;
  sidebarWidth: number;
  sidebarOpen: boolean;
  pinned: boolean;
  showInRepoOnly: boolean;
  collapseDirectories: boolean;
  enterpriseHosts: string[];
}

export const DEFAULT_SETTINGS: Settings = {
  accessToken: '',
  theme: 'auto',
  font: 'system',
  fontSize: FONT_SIZE.default,
  iconPack: 'material',
  dock: 'left',
  toggleOffset: 96,
  sidebarWidth: SIDEBAR_WIDTH.default,
  sidebarOpen: false,
  pinned: false,
  showInRepoOnly: true,
  collapseDirectories: true,
  enterpriseHosts: [],
};

export type SettingsKey = keyof Settings;

export function mergeSettings(stored: Partial<Settings> | undefined): Settings {
  return { ...DEFAULT_SETTINGS, ...(stored ?? {}) };
}

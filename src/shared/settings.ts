import { SIDEBAR_WIDTH } from './constants';

export interface Settings {
  accessToken: string;
  sidebarWidth: number;
  pinned: boolean;
  showInRepoOnly: boolean;
  collapseDirectories: boolean;
  enterpriseHosts: string[];
}

export const DEFAULT_SETTINGS: Settings = {
  accessToken: '',
  sidebarWidth: SIDEBAR_WIDTH.default,
  pinned: false,
  showInRepoOnly: true,
  collapseDirectories: true,
  enterpriseHosts: [],
};

export type SettingsKey = keyof Settings;

export function mergeSettings(stored: Partial<Settings> | undefined): Settings {
  return { ...DEFAULT_SETTINGS, ...(stored ?? {}) };
}

import { browser } from '../shared/browser';

export function originPattern(origin: string): string {
  return `${origin}/*`;
}

export async function hasOrigin(origin: string): Promise<boolean> {
  return browser.permissions.contains({ origins: [originPattern(origin)] });
}

export async function requestOrigin(origin: string): Promise<boolean> {
  return browser.permissions.request({ origins: [originPattern(origin)] });
}

export async function removeOrigin(origin: string): Promise<boolean> {
  return browser.permissions.remove({ origins: [originPattern(origin)] });
}

export async function grantedOrigins(): Promise<string[]> {
  const { origins } = await browser.permissions.getAll();
  return origins ?? [];
}

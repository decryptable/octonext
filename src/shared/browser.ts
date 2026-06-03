import browser from 'webextension-polyfill';

export { browser };

export function runtimeId(): string | undefined {
  return browser.runtime?.id;
}

export function isExtensionContextValid(): boolean {
  return Boolean(runtimeId());
}

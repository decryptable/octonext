import { browser } from '../shared/browser';
import { registerMessageHandler } from '../shared/messaging';
import { setupContextMenu } from './context-menu';
import { syncDynamicScripts, watchPermissionChanges } from './dynamic-scripts';
import { hasOrigin, requestOrigin } from './permissions';

registerMessageHandler({
  'open-options': () => browser.runtime.openOptionsPage(),
  'has-host-permission': ({ origin }) => hasOrigin(origin),
  'request-host-permission': ({ origin }) => requestOrigin(origin),
});

watchPermissionChanges();

function initialize(): void {
  setupContextMenu();
  void syncDynamicScripts();
}

browser.runtime.onInstalled.addListener(initialize);
browser.runtime.onStartup.addListener(initialize);

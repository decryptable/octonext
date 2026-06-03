import { OctoNextApp } from './app';
import { isExtensionContextValid } from '../shared/browser';
import { logger } from '../shared/logger';

declare global {
  interface Window {
    __octonext__?: boolean;
  }
}

function bootstrap(): void {
  if (window.top !== window || window.__octonext__) return;
  if (!isExtensionContextValid()) return;
  window.__octonext__ = true;
  try {
    new OctoNextApp().start().catch((error) => logger.error(error));
  } catch (error) {
    logger.error(error);
  }
}

bootstrap();

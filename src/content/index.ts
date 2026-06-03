import { OctoNextApp } from './app';
import { logger } from '../shared/logger';

declare global {
  interface Window {
    __octonext__?: boolean;
  }
}

function bootstrap(): void {
  if (window.top !== window || window.__octonext__) return;
  window.__octonext__ = true;
  new OctoNextApp().start().catch((error) => logger.error(error));
}

bootstrap();

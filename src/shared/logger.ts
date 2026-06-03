import { APP_NAME } from './constants';

type Level = 'debug' | 'info' | 'warn' | 'error';

const STYLE = 'color:#2dba4e;font-weight:bold';
const PREFIX = `%c${APP_NAME}`;

function emit(level: Level, args: unknown[]): void {
  console[level](PREFIX, STYLE, ...args);
}

export const logger = {
  debug: (...args: unknown[]) => emit('debug', args),
  info: (...args: unknown[]) => emit('info', args),
  warn: (...args: unknown[]) => emit('warn', args),
  error: (...args: unknown[]) => emit('error', args),
};

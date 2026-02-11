import { environment } from '../environments/environment';

type Level = 'debug' | 'info' | 'warn' | 'error';
const levels: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLevel = environment.production ? levels.warn : levels.debug;

export function debug(...args: any[]) {
  if (currentLevel <= levels.debug) console.debug(...args);
}

export function info(...args: any[]) {
  if (currentLevel <= levels.info) console.info(...args);
}

export function warn(...args: any[]) {
  if (currentLevel <= levels.warn) console.warn(...args);
}

export function error(...args: any[]) {
  // Always surface errors regardless of environment
  console.error(...args);
}

export default { debug, info, warn, error };

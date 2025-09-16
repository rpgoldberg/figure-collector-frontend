/**
 * Production-safe debug logging utility for Frontend
 * Enable debug logs with localStorage or environment variables:
 * - localStorage.setItem('DEBUG', 'true')
 * - localStorage.setItem('DEBUG_LEVEL', 'verbose|info|warn')
 * - localStorage.setItem('DEBUG_MODULES', 'auth,api,state')
 *
 * Or in development:
 * - REACT_APP_DEBUG=true
 * - REACT_APP_DEBUG_LEVEL=verbose
 */

const isDevelopment = process.env.NODE_ENV === 'development';

// Check both localStorage and environment variables
const DEBUG =
  (typeof window !== 'undefined' && localStorage.getItem('DEBUG') === 'true') ||
  process.env.REACT_APP_DEBUG === 'true' ||
  isDevelopment;

const DEBUG_LEVEL =
  (typeof window !== 'undefined' && localStorage.getItem('DEBUG_LEVEL')) ||
  process.env.REACT_APP_DEBUG_LEVEL ||
  (isDevelopment ? 'info' : 'error');

const DEBUG_MODULES =
  (typeof window !== 'undefined' && localStorage.getItem('DEBUG_MODULES')?.split(',')) ||
  process.env.REACT_APP_DEBUG_MODULES?.split(',') ||
  [];

type LogLevel = 'verbose' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  verbose: 0,
  info: 1,
  warn: 2,
  error: 3
};

class Logger {
  private module: string;
  private enabled: boolean;
  private level: number;

  constructor(module: string) {
    this.module = module;
    this.enabled = DEBUG || DEBUG_MODULES.includes(module) || DEBUG_MODULES.includes('*');
    this.level = LOG_LEVELS[DEBUG_LEVEL as LogLevel] || LOG_LEVELS.error;
  }

  private format(...args: any[]): any[] {
    return [`[${this.module}]`, new Date().toISOString(), ...args];
  }

  verbose(...args: any[]) {
    if (this.enabled && this.level <= LOG_LEVELS.verbose) {
      console.log(...this.format(...args));
    }
  }

  info(...args: any[]) {
    if (this.enabled && this.level <= LOG_LEVELS.info) {
      console.info(...this.format(...args));
    }
  }

  warn(...args: any[]) {
    if (this.enabled && this.level <= LOG_LEVELS.warn) {
      console.warn(...this.format(...args));
    }
  }

  error(...args: any[]) {
    // Always log errors in development, configurable in production
    if (isDevelopment || this.enabled) {
      console.error(...this.format(...args));
    }
  }

  debug(...args: any[]) {
    if (this.enabled) {
      console.log(...this.format(...args));
    }
  }
}

// Factory function
export const createLogger = (module: string): Logger => {
  return new Logger(module);
};

// Pre-configured loggers
export const authLogger = createLogger('AUTH');
export const apiLogger = createLogger('API');
export const stateLogger = createLogger('STATE');
export const registrationLogger = createLogger('REGISTRATION');

// Helper to enable debug in browser console
if (typeof window !== 'undefined') {
  (window as any).enableDebug = (modules?: string) => {
    localStorage.setItem('DEBUG', 'true');
    if (modules) {
      localStorage.setItem('DEBUG_MODULES', modules);
    }
    console.log('Debug logging enabled. Refresh page to see logs.');
  };

  (window as any).disableDebug = () => {
    localStorage.removeItem('DEBUG');
    localStorage.removeItem('DEBUG_LEVEL');
    localStorage.removeItem('DEBUG_MODULES');
    console.log('Debug logging disabled. Refresh page to hide logs.');
  };
}

export default Logger;
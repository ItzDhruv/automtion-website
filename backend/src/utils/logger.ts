const prefix = '[tg-live-backend]';

export const log = {
  info: (message: string, meta?: unknown) => {
    console.log(`${prefix} INFO: ${message}`, meta ?? '');
  },
  warn: (message: string, meta?: unknown) => {
    console.warn(`${prefix} WARN: ${message}`, meta ?? '');
  },
  error: (message: string, meta?: unknown) => {
    console.error(`${prefix} ERROR: ${message}`, meta ?? '');
  },
};

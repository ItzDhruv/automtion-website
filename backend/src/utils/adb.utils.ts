import { DeviceStatus } from '../types/device';

export const parseAdbDevices = (output: string): Array<{ id: string; status: DeviceStatus }> => {
  return output
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const [id, status] = line.split(/\s+/);
      return {
        id,
        status: (status === 'device' || status === 'offline' || status === 'unauthorized' ? status : 'unknown') as DeviceStatus,
      };
    });
};

export const parseWmSize = (output: string): { width: number; height: number } => {
  const match = output.match(/Physical size:\s*(\d+)x(\d+)/i);
  if (!match) {
    throw new Error('Unable to parse device screen resolution');
  }

  return {
    width: Number(match[1]),
    height: Number(match[2]),
  };
};

export const sanitizeTextForAdb = (text: string): string => {
  const escaped = text.replace(/(["'%\\])/g, '\\$1');
  return escaped.replace(/\s/g, '%s');
};

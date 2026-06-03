import dotenv from 'dotenv';

dotenv.config();

const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const config = {
  port: parseNumber(process.env.PORT, 4000),
  adbPath: process.env.ADB_PATH || 'adb',
  scrcpyPath: process.env.SCRCPY_PATH || 'scrcpy',
  bitRate: process.env.BIT_RATE || '2M',
  maxFps: parseNumber(process.env.MAX_FPS, 15),
  frameQuality: parseNumber(process.env.FRAME_QUALITY, 60),
  allowedOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()) : ['*'],
};

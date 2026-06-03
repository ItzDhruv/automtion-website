export type DeviceStatus = 'device' | 'offline' | 'unauthorized' | 'unknown';

export interface Resolution {
  width: number;
  height: number;
}

export interface DeviceInfo {
  id: string;
  model: string;
  androidVersion: string;
  resolution: Resolution;
  batteryLevel: number | null;
  status: DeviceStatus;
  connectedAt: string;
}

export interface ScreenCoordinatePayload {
  deviceId: string;
  x: number;
  y: number;
  screenWidth: number;
  screenHeight: number;
  orientation?: 'portrait' | 'landscape';
}

export interface SwipePayload extends ScreenCoordinatePayload {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration?: number;
}

export interface TextInputPayload {
  deviceId: string;
  text: string;
}

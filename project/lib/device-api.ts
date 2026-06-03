'use client';

export type DeviceStatus = 'device' | 'offline' | 'unauthorized' | 'unknown';

export interface LiveDevice {
  id: string;
  model: string;
  androidVersion: string;
  resolution: {
    width: number;
    height: number;
  };
  batteryLevel: number | null;
  status: DeviceStatus;
  connectedAt: string;
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ||
  '';

export const SOCKET_BASE_URL =
  process.env.NEXT_PUBLIC_SOCKET_BASE_URL?.replace(/\/$/, '') ||
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ||
  'http://localhost:4000';

export async function apiRequest<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed with ${response.status}`;

    try {
      const body = await response.json();
      message = body.error || body.message || message;
    } catch {
      // Keep the HTTP status message when the backend returns non-JSON.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function listDevices(): Promise<LiveDevice[]> {
  return apiRequest<LiveDevice[]>('/api/devices').then((devices) => {
    if (!Array.isArray(devices)) {
      throw new Error('Backend did not return a device list');
    }

    return devices;
  });
}

export function getDevice(deviceId: string): Promise<LiveDevice> {
  return apiRequest<LiveDevice>(`/api/devices/${encodeURIComponent(deviceId)}`);
}

export function startDevice(deviceId: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(
    `/api/devices/${encodeURIComponent(deviceId)}/start`,
    { method: 'POST' }
  );
}

export function stopDevice(deviceId: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(
    `/api/devices/${encodeURIComponent(deviceId)}/stop`,
    { method: 'POST' }
  );
}

export async function captureScreenshot(deviceId: string): Promise<Blob> {
  const response = await fetch(
    `${API_BASE_URL}/api/devices/${encodeURIComponent(deviceId)}/screenshot`,
    { method: 'POST', cache: 'no-store' }
  );

  if (!response.ok) {
    throw new Error(`Screenshot failed with ${response.status}`);
  }

  return response.blob();
}

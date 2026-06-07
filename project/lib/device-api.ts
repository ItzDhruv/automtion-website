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

export const SOCKET_BASE_URL = (() => {
  // Prefer the current page origin for remote domains (ngrok). For local
  // development (browser on localhost) keep the previous default of
  // http://localhost:4000 so the client connects to the backend running on
  // port 4000 when Next dev server runs on 3000.
  const envSocket = process.env.NEXT_PUBLIC_SOCKET_BASE_URL?.replace(/\/$/, '');

  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    const origin = window.location.origin.replace(/\/$/, '');

    // If the page is served from localhost, prefer explicit backend env
    // or localhost:4000 so local dev keeps working.
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return envSocket || process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:4000';
    }

    // Remote clients (ngrok domain) should connect back to the page origin.
    return origin;
  }

  return envSocket || process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:4000';
})();

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

export interface InstallApkResponse {
  message: string;
  deviceId: string;
  fileName: string;
  adbOutput?: string;
}

export interface RunTestResponse {
  message: string;
  deviceId: string;
  fileName: string;
  output?: string;
}

export function installApk(
  deviceId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<InstallApkResponse> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open('POST', `${API_BASE_URL}/api/devices/${encodeURIComponent(deviceId)}/install-apk`);
    request.setRequestHeader('Content-Type', 'application/vnd.android.package-archive');
    request.setRequestHeader('x-apk-filename', encodeURIComponent(file.name));

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 85));
      }
    };

    request.onload = () => {
      let body: any = null;

      try {
        body = request.responseText ? JSON.parse(request.responseText) : null;
      } catch {
        body = null;
      }

      if (request.status >= 200 && request.status < 300) {
        onProgress?.(100);
        resolve(body as InstallApkResponse);
        return;
      }

      reject(new Error(body?.error || body?.message || `Install failed with ${request.status}`));
    };

    request.onerror = () => reject(new Error('Install request failed'));
    request.upload.onload = () => onProgress?.(90);
    request.send(file);
  });
}

export interface RunTestOptions {
  testClass?: string;
  appPackage?: string;
  appActivity?: string;
}

export function runTestFile(
  deviceId: string,
  file: File,
  onProgress?: (progress: number) => void,
  options?: RunTestOptions,
): Promise<RunTestResponse> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('POST', `${API_BASE_URL}/api/devices/${encodeURIComponent(deviceId)}/run-test`);
    request.setRequestHeader('Content-Type', file.name.toLowerCase().endsWith('.jar') ? 'application/java-archive' : 'text/x-java-source');
    request.setRequestHeader('x-test-filename', encodeURIComponent(file.name));
    if (options?.testClass) {
      request.setRequestHeader('x-test-class', encodeURIComponent(options.testClass));
    }
    if (options?.appPackage) {
      request.setRequestHeader('x-app-package', encodeURIComponent(options.appPackage));
    }
    if (options?.appActivity) {
      request.setRequestHeader('x-app-activity', encodeURIComponent(options.appActivity));
    }

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 85));
      }
    };

    request.onload = () => {
      let body: any = null;

      try {
        body = request.responseText ? JSON.parse(request.responseText) : null;
      } catch {
        body = null;
      }

      if (request.status >= 200 && request.status < 300) {
        onProgress?.(100);
        resolve(body as RunTestResponse);
        return;
      }

      reject(new Error(body?.error || body?.message || `Test run failed with ${request.status}`));
    };

    request.onerror = () => reject(new Error('Test execution request failed'));
    request.upload.onload = () => onProgress?.(90);
    request.send(file);
  });
}

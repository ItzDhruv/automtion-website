export interface Device {
  id: string;
  name: string;
  os: 'iOS' | 'Android';
  osVersion: string;
  status: 'available' | 'busy' | 'offline';
  image?: string;
  specs: {
    ram: string;
    storage: string;
    processor: string;
  };
  location?: string;
}

export interface TestSession {
  id: string;
  deviceId: string;
  deviceName: string;
  appName: string;
  duration: string;
  startTime: string;
  endTime?: string;
  status: 'running' | 'completed' | 'failed';
  logs?: string[];
}

export interface UploadedApp {
  id: string;
  name: string;
  version: string;
  platform: 'iOS' | 'Android';
  size: string;
  uploadedAt: string;
  status: 'ready' | 'processing' | 'failed';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  organization?: string;
}

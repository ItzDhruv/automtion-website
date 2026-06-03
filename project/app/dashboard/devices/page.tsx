'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { DeviceCard } from '@/components/device-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { API_BASE_URL, listDevices, LiveDevice, SOCKET_BASE_URL } from '@/lib/device-api';
import { RefreshCw, Search, Smartphone } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function DevicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [devices, setDevices] = useState<LiveDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDevices = async () => {
    setLoading(true);
    setError(null);

    try {
      setDevices(await listDevices());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load devices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const filteredDevices = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return devices.filter((device) =>
      device.model.toLowerCase().includes(term) ||
      device.id.toLowerCase().includes(term) ||
      device.androidVersion.toLowerCase().includes(term) ||
      device.status.toLowerCase().includes(term)
    );
  }, [devices, searchTerm]);

  return (
    <DashboardLayout>
      <div className="flex flex-col">
        <div className="border-b px-6 py-4">
          <h1 className="text-3xl font-bold">Available Devices</h1>
          <p className="text-sm text-muted-foreground">
            Live Android devices detected by ADB
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            API {API_BASE_URL || 'Next proxy'} • Socket {SOCKET_BASE_URL}
          </p>
        </div>

        <div className="flex-1 space-y-6 p-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search devices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={loadDevices} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-56 animate-pulse rounded-lg border bg-muted/40" />
              ))}
            </div>
          ) : filteredDevices.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredDevices.map((device) => (
                <DeviceCard key={device.id} device={device} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Smartphone className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-4 text-muted-foreground">
                {devices.length === 0 ? 'No ADB devices found' : 'No devices found matching your search'}
              </p>
              {devices.length === 0 ? (
                <Button variant="outline" onClick={loadDevices}>Refresh Devices</Button>
              ) : (
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

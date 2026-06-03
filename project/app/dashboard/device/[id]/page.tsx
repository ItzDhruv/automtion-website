'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Battery, MonitorSmartphone, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { RemoteDeviceViewer } from '@/components/remote-device-viewer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDevice, LiveDevice } from '@/lib/device-api';

interface DevicePageProps {
  params: {
    id: string;
  };
}

const statusLabel = {
  device: 'Connected',
  offline: 'Offline',
  unauthorized: 'Unauthorized',
  unknown: 'Unknown',
};

export default function DevicePage({ params }: DevicePageProps) {
  const [device, setDevice] = useState<LiveDevice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDevice = async () => {
    setLoading(true);
    setError(null);

    try {
      setDevice(await getDevice(params.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load device');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevice();
  }, [params.id]);

  return (
    <DashboardLayout>
      <div className="flex flex-col">
        <div className="border-b px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard/devices">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold">{device?.model || 'Device'}</h1>
                <p className="text-sm text-muted-foreground">
                  {device ? `Android ${device.androidVersion} • ${device.id}` : params.id}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={loadDevice} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="flex-1 space-y-6 p-6">
          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {loading && !device ? (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="h-[720px] animate-pulse rounded-lg border bg-muted/40 lg:col-span-2" />
              <div className="h-80 animate-pulse rounded-lg border bg-muted/40" />
            </div>
          ) : device ? (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <RemoteDeviceViewer device={device} onDeviceUpdate={setDevice} />
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Device Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className="mt-1" variant={device.status === 'device' ? 'default' : 'secondary'}>
                        {statusLabel[device.status]}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Android Version</p>
                      <p className="font-medium">{device.androidVersion}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ADB ID</p>
                      <p className="break-all font-medium">{device.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Connected At</p>
                      <p className="font-medium">{new Date(device.connectedAt).toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Screen</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">
                        {device.resolution.width} x {device.resolution.height}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Battery className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">
                        {device.batteryLevel === null ? 'Battery unavailable' : `${device.batteryLevel}% battery`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 py-12">
              <p className="text-lg font-medium">Device not found</p>
              <Button asChild>
                <Link href="/dashboard/devices">Back to Devices</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

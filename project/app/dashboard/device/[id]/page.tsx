'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { RemoteDeviceViewer } from '@/components/remote-device-viewer';
import { dummyDevices } from '@/lib/dummy-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DevicePageProps {
  params: {
    id: string;
  };
}

export default function DevicePage({ params }: DevicePageProps) {
  const device = dummyDevices.find(d => d.id === params.id);

  if (!device) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
          <p className="text-lg font-medium">Device not found</p>
          <Button asChild>
            <Link href="/dashboard/devices">Back to Devices</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col">
        <div className="border-b px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/devices">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{device.name}</h1>
              <p className="text-sm text-muted-foreground">
                {device.os} {device.osVersion} • {device.location}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-6 p-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RemoteDeviceViewer deviceName={device.name} isConnected={device.status === 'available'} />
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Device Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className="mt-1" variant={
                      device.status === 'available' ? 'default' :
                      device.status === 'busy' ? 'secondary' :
                      'outline'
                    }>
                      {device.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Operating System</p>
                    <p className="font-medium">{device.os} {device.osVersion}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{device.location}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Specifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Processor</p>
                    <p className="font-medium">{device.specs.processor}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">RAM</p>
                    <p className="font-medium">{device.specs.ram}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Storage</p>
                    <p className="font-medium">{device.specs.storage}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

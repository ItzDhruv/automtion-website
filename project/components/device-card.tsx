import Link from 'next/link';
import { Battery, CalendarClock, MonitorSmartphone, Smartphone } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LiveDevice } from '@/lib/device-api';
import { cn } from '@/lib/utils';

interface DeviceCardProps {
  device: LiveDevice;
}

export function DeviceCard({ device }: DeviceCardProps) {
  const canConnect = device.status === 'device';
  const statusColors = {
    device: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    offline: 'border-slate-200 bg-slate-50 text-slate-600',
    unauthorized: 'border-amber-200 bg-amber-50 text-amber-700',
    unknown: 'border-slate-200 bg-slate-50 text-slate-600',
  };

  const dotColors = {
    device: 'bg-emerald-500',
    offline: 'bg-slate-400',
    unauthorized: 'bg-amber-500',
    unknown: 'bg-slate-400',
  };

  const statusLabels = {
    device: 'Connected',
    offline: 'Offline',
    unauthorized: 'Unauthorized',
    unknown: 'Unknown',
  };

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <CardContent className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Smartphone className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{device.model}</h3>
              <p className="text-sm text-muted-foreground">
                Android {device.androidVersion}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn('gap-1', statusColors[device.status])}
          >
            <div
              className={cn('h-2 w-2 rounded-full', dotColors[device.status])}
            />
            {statusLabels[device.status]}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MonitorSmartphone className="h-4 w-4" />
            <span>
              {device.resolution.width} x {device.resolution.height}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Battery className="h-4 w-4" />
            <span>
              {device.batteryLevel === null ? 'Battery unavailable' : `${device.batteryLevel}% battery`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarClock className="h-4 w-4" />
            <span>{new Date(device.connectedAt).toLocaleString()}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t bg-muted/50 p-4">
        {canConnect ? (
          <Button asChild className="w-full">
            <Link href={`/dashboard/device/${device.id}`}>Connect</Link>
          </Button>
        ) : (
          <Button className="w-full" disabled>
            Unavailable
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

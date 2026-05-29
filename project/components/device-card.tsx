import Link from 'next/link';
import { Smartphone, Cpu, HardDrive, Radio } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Device } from '@/lib/types';
import { cn } from '@/lib/utils';

interface DeviceCardProps {
  device: Device;
}

export function DeviceCard({ device }: DeviceCardProps) {
  const statusColors = {
    available: 'bg-green-500',
    busy: 'bg-yellow-500',
    offline: 'bg-gray-500',
  };

  const statusLabels = {
    available: 'Available',
    busy: 'In Use',
    offline: 'Offline',
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
              <h3 className="font-semibold">{device.name}</h3>
              <p className="text-sm text-muted-foreground">
                {device.os} {device.osVersion}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn('gap-1', statusColors[device.status])}
          >
            <div
              className={cn('h-2 w-2 rounded-full', statusColors[device.status])}
            />
            {statusLabels[device.status]}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Cpu className="h-4 w-4" />
            <span>{device.specs.processor}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <HardDrive className="h-4 w-4" />
            <span>
              {device.specs.ram} RAM • {device.specs.storage}
            </span>
          </div>
          {device.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Radio className="h-4 w-4" />
              <span>{device.location}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t bg-muted/50 p-4">
        <Button
          asChild
          className="w-full"
          disabled={device.status !== 'available'}
        >
          <Link href={`/dashboard/device/${device.id}`}>
            {device.status === 'available' ? 'Connect' : 'Unavailable'}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

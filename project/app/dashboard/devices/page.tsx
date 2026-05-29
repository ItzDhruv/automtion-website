'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { DeviceCard } from '@/components/device-card';
import { dummyDevices } from '@/lib/dummy-data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Search } from 'lucide-react';

export default function DevicesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDevices = dummyDevices.filter(device =>
    device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.os.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col">
        <div className="border-b px-6 py-4">
          <h1 className="text-3xl font-bold">Available Devices</h1>
          <p className="text-sm text-muted-foreground">Access and test on real devices in the cloud</p>
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
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredDevices.map(device => (
              <DeviceCard
                key={device.id}
                device={device}
              />
            ))}
          </div>

          {filteredDevices.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No devices found matching your search</p>
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

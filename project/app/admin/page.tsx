'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { dummyDevices } from '@/lib/dummy-data';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const dummyUsers = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', plan: 'Professional', status: 'active' },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', plan: 'Starter', status: 'active' },
  { id: '3', name: 'Carol White', email: 'carol@example.com', plan: 'Enterprise', status: 'active' },
  { id: '4', name: 'David Brown', email: 'david@example.com', plan: 'Starter', status: 'inactive' },
];

export default function AdminPage() {
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [deviceOS, setDeviceOS] = useState('');

  const handleAddDevice = () => {
    if (deviceName && deviceOS) {
      setShowAddDevice(false);
      setDeviceName('');
      setDeviceOS('');
    }
  };

  const deviceStats = {
    total: dummyDevices.length,
    available: dummyDevices.filter(d => d.status === 'available').length,
    busy: dummyDevices.filter(d => d.status === 'busy').length,
    offline: dummyDevices.filter(d => d.status === 'offline').length,
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col">
        <div className="border-b px-6 py-4">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Manage devices and users</p>
        </div>

        <div className="flex-1 space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Devices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{deviceStats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Available</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{deviceStats.available}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>In Use</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{deviceStats.busy}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Offline</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{deviceStats.offline}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Manage Devices</CardTitle>
                  <CardDescription>Add and manage cloud devices</CardDescription>
                </div>
                <Dialog open={showAddDevice} onOpenChange={setShowAddDevice}>
                  <DialogTrigger asChild>
                    <Button>Add Device</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Device</DialogTitle>
                      <DialogDescription>Add a new device to the cloud testing platform</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="device-name">Device Name</Label>
                        <Input
                          id="device-name"
                          placeholder="iPhone 15 Pro"
                          value={deviceName}
                          onChange={(e) => setDeviceName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="device-os">OS Version</Label>
                        <Input
                          id="device-os"
                          placeholder="iOS 17.2"
                          value={deviceOS}
                          onChange={(e) => setDeviceOS(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleAddDevice} className="w-full">Add Device</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>OS</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dummyDevices.slice(0, 5).map(device => (
                    <TableRow key={device.id}>
                      <TableCell className="font-medium">{device.name}</TableCell>
                      <TableCell>{device.os} {device.osVersion}</TableCell>
                      <TableCell>
                        <Badge variant={
                          device.status === 'available' ? 'default' :
                          device.status === 'busy' ? 'secondary' :
                          'outline'
                        }>
                          {device.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{device.location}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage platform users</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dummyUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.plan}</TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">Manage</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

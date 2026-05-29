'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/navbar';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Smartphone, ChartBar as BarChart3, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { dummyDevices, dummySessions, dummyApps } from '@/lib/dummy-data';

export default function DashboardPage() {
  const availableDevices = dummyDevices.filter(d => d.status === 'available').length;
  const totalSessions = dummySessions.length;
  const activeSessions = dummySessions.filter(s => s.status === 'running').length;

  return (
    <DashboardLayout>
      <div className="flex flex-col">
        <div className="border-b px-6 py-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back! Here's your testing overview</p>
        </div>

        <div className="flex-1 space-y-8 p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Available Devices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{availableDevices}</div>
                <p className="text-xs text-muted-foreground">Out of {dummyDevices.length} total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Active Sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeSessions}</div>
                <p className="text-xs text-muted-foreground">Currently running</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Total Sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSessions}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Apps Uploaded
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dummyApps.length}</div>
                <p className="text-xs text-muted-foreground">Ready to test</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/dashboard/devices">View All Devices</Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/dashboard/upload">Upload New App</Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/dashboard/sessions">View Sessions</Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href="/dashboard/settings">Manage Settings</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
                <CardDescription>Your latest test runs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dummySessions.slice(0, 3).map(session => (
                    <div key={session.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{session.deviceName}</p>
                        <p className="text-xs text-muted-foreground">{session.appName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium">{session.duration}</p>
                        <p className={`text-xs ${
                          session.status === 'completed' ? 'text-green-600' :
                          session.status === 'running' ? 'text-blue-600' :
                          'text-red-600'
                        }`}>
                          {session.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

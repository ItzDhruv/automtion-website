'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { SessionTable } from '@/components/session-table';
import { dummySessions } from '@/lib/dummy-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SessionsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col">
        <div className="border-b px-6 py-4">
          <h1 className="text-3xl font-bold">Test Sessions</h1>
          <p className="text-sm text-muted-foreground">View and manage your test sessions</p>
        </div>

        <div className="flex-1 space-y-6 p-6">
          <Card>
            <CardHeader>
              <CardTitle>Session History</CardTitle>
              <CardDescription>All your test sessions and their results</CardDescription>
            </CardHeader>
            <CardContent>
              <SessionTable sessions={dummySessions} />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

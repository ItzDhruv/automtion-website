'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dummySessions } from '@/lib/dummy-data';

export default function LogsPage() {
  const sessionWithLogs = dummySessions.find(s => s.logs && s.logs.length > 0);

  return (
    <DashboardLayout>
      <div className="flex flex-col">
        <div className="border-b px-6 py-4">
          <h1 className="text-3xl font-bold">Test Logs</h1>
          <p className="text-sm text-muted-foreground">View detailed logs from your test sessions</p>
        </div>

        <div className="flex-1 space-y-6 p-6">
          <Card>
            <CardHeader>
              <CardTitle>Session Logs</CardTitle>
              <CardDescription>
                {sessionWithLogs ? `Logs from ${sessionWithLogs.deviceName}` : 'No logs available'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessionWithLogs && sessionWithLogs.logs ? (
                <div className="space-y-2 font-mono text-sm">
                  {sessionWithLogs.logs.map((log, index) => (
                    <div key={index} className="flex items-start gap-3 border-l-2 border-primary pl-3 py-1">
                      <span className="text-muted-foreground">[{new Date().toLocaleTimeString()}]</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No logs available for this session</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dummySessions.slice(0, 5).map(session => (
                  <div key={session.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{session.deviceName}</p>
                      <p className="text-xs text-muted-foreground">{session.appName}</p>
                    </div>
                    <Badge variant={
                      session.status === 'completed' ? 'default' :
                      session.status === 'running' ? 'secondary' :
                      'destructive'
                    }>
                      {session.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

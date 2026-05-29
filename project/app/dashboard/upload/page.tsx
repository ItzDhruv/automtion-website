'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { UploadComponent } from '@/components/upload-component';
import { dummyApps } from '@/lib/dummy-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function UploadPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col">
        <div className="border-b px-6 py-4">
          <h1 className="text-3xl font-bold">Upload App</h1>
          <p className="text-sm text-muted-foreground">Upload your APK or IPA files for testing</p>
        </div>

        <div className="flex-1 space-y-6 p-6">
          <UploadComponent />

          <Card>
            <CardHeader>
              <CardTitle>Uploaded Apps</CardTitle>
              <CardDescription>Your previously uploaded applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dummyApps.map(app => (
                  <div key={app.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex-1">
                      <p className="font-medium">{app.name}</p>
                      <div className="flex gap-3 text-sm text-muted-foreground">
                        <span>v{app.version}</span>
                        <span>{app.platform}</span>
                        <span>{app.size}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={app.status === 'ready' ? 'default' : 'secondary'}>
                        {app.status}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {new Date(app.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
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

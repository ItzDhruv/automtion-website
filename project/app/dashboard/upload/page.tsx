'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { UploadComponent } from '@/components/upload-component';

export default function UploadPage() {
  return (
    <DashboardLayout> 
      <div className="flex flex-col">
        <div className="border-b px-6 py-4">
          <h1 className="text-3xl font-bold">Upload and Run Tests</h1>
          <p className="text-sm text-muted-foreground">
            Upload an APK or a Java automation test file and execute it on a connected Android device.
          </p>
        </div>

        <div className="flex-1 space-y-6 p-6">
          <UploadComponent />
        </div>
      </div>
    </DashboardLayout>
  );
}

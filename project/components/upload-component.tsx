'use client';

import { useState, useCallback, useEffect } from 'react';
import { Upload, File, X, CircleCheck as CheckCircle, RefreshCw, Smartphone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { installApk, listDevices, runTestFile, LiveDevice } from '@/lib/device-api';
import { cn } from '@/lib/utils';

interface UploadComponentProps {
  acceptedTypes?: string[];
  onUpload?: (file: File) => void;
}

export function UploadComponent({
  acceptedTypes = ['.apk'],
  onUpload,
}: UploadComponentProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<'apk' | 'test'>('apk');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [devices, setDevices] = useState<LiveDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [installOutput, setInstallOutput] = useState<string | null>(null);
  const [testClass, setTestClass] = useState('');
  const [appPackage, setAppPackage] = useState('');
  const [appActivity, setAppActivity] = useState('');

  const connectedDevices = devices.filter((device) => device.status === 'device');
  const acceptedTypesByMode = uploadMode === 'apk' ? ['.apk'] : ['.jar', '.java'];

  const loadDevices = useCallback(async () => {
    setLoadingDevices(true);
    setError(null);

    try {
      const nextDevices = await listDevices();
      const availableDevices = nextDevices.filter((device) => device.status === 'device');
      setDevices(nextDevices);

      setSelectedDeviceId((currentDeviceId) => {
        if (availableDevices.some((device) => device.id === currentDeviceId)) {
          return currentDeviceId;
        }

        return availableDevices[0]?.id || '';
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load devices');
    } finally {
      setLoadingDevices(false);
    }
  }, []);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  const setSelectedFile = (nextFile: File) => {
    setError(null);
    setInstallOutput(null);
    setIsComplete(false);

    const lowerName = nextFile.name.toLowerCase();
    if (uploadMode === 'apk') {
      if (!lowerName.endsWith('.apk')) {
        setError('Only .apk files can be installed on Android devices');
        return;
      }
    } else {
      if (!lowerName.endsWith('.jar') && !lowerName.endsWith('.java')) {
        setError('Only .jar or .java test files are supported for Java automation tests');
        return;
      }
    }

    setFile(nextFile);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setSelectedFile(droppedFile);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setSelectedFile(selectedFile);
    }
  };

  const executeAction = async () => {
    if (!file || !selectedDeviceId) {
      setError(
        uploadMode === 'apk'
          ? 'Choose a connected device and APK first'
          : 'Choose a connected device and Java test file first',
      );
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    setInstallOutput(null);

    try {
      const result =
        uploadMode === 'apk'
          ? await installApk(selectedDeviceId, file, setUploadProgress)
          : await runTestFile(selectedDeviceId, file, setUploadProgress, {
              testClass: testClass.trim(),
              appPackage: appPackage.trim(),
              appActivity: appActivity.trim(),
            });

      setIsComplete(true);
      if (uploadMode === 'apk') {
        const apkResult = result as Awaited<ReturnType<typeof installApk>>;
        setInstallOutput(apkResult.adbOutput || apkResult.message);
      } else {
        const testResult = result as Awaited<ReturnType<typeof runTestFile>>;
        setInstallOutput(testResult.output || testResult.message);
      }
      onUpload?.(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setUploadProgress(0);
    setIsComplete(false);
    setIsUploading(false);
    setError(null);
    setInstallOutput(null);
    setTestClass('');
    setAppPackage('');
    setAppActivity('');
  };

  return (
    <Card>
      <CardContent className="p-6">
          <div className="mb-5 flex flex-wrap items-center gap-2">
          <Button
            variant={uploadMode === 'apk' ? 'secondary' : 'outline'}
            onClick={() => {
              setUploadMode('apk');
              handleReset();
            }}
            disabled={isUploading}
          >
            Install APK
          </Button>
          <Button
            variant={uploadMode === 'test' ? 'secondary' : 'outline'}
            onClick={() => {
              setUploadMode('test');
              handleReset();
            }}
            disabled={isUploading}
          >
            Run Java Test
          </Button>
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-[1fr_auto]">
          <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId} disabled={loadingDevices || isUploading}>
            <SelectTrigger>
              <SelectValue placeholder={loadingDevices ? 'Loading devices...' : 'Choose target device'} />
            </SelectTrigger>
            <SelectContent>
              {connectedDevices.map((device) => (
                <SelectItem key={device.id} value={device.id}>
                  {device.model} ({device.id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadDevices} disabled={loadingDevices || isUploading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {!loadingDevices && connectedDevices.length === 0 && (
          <div className="mb-5 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <Smartphone className="h-4 w-4" />
            No connected ADB devices found.
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {!file ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            )}
          >
            <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">
              Drop your {uploadMode === 'apk' ? 'APK' : 'Java test'} file here
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              or click to browse files
            </p>
            <input
              type="file"
              accept={acceptedTypesByMode.join(',')}
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <Button asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                Choose File
              </label>
            </Button>
            <p className="mt-4 text-xs text-muted-foreground">
              Supported formats: {acceptedTypesByMode.join(', ')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <File className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              {!isUploading && !isComplete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleReset}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              {isComplete && (
                <CheckCircle className="h-6 w-6 text-green-500" />
              )}
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    {uploadMode === 'apk'
                      ? uploadProgress < 90
                        ? 'Uploading APK...'
                        : 'Installing on device...'
                      : uploadProgress < 90
                      ? 'Uploading test file...'
                      : 'Executing test on device...'}
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            {isComplete && (
              <div className="rounded-lg bg-green-500/10 p-4 text-center">
                <p className="font-medium text-green-600 dark:text-green-400">
                  {uploadMode === 'apk' ? 'APK installed successfully.' : 'Java test executed successfully.'}
                </p>
                {installOutput && (
                  <p className="mt-1 break-words text-xs text-green-700 dark:text-green-300">
                    {installOutput}
                  </p>
                )}
              </div>
            )}

            {uploadMode === 'test' && !isUploading && !isComplete && (
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="space-y-1 text-sm">
                    <span>Fully qualified test class</span>
                    <input
                      value={testClass}
                      onChange={(e) => setTestClass(e.target.value)}
                      placeholder="org.example.AlarmClockCtTest"
                      className="w-full rounded border px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span>App package</span>
                    <input
                      value={appPackage}
                      onChange={(e) => setAppPackage(e.target.value)}
                      placeholder="com.coloros.alarmclock"
                      className="w-full rounded border px-3 py-2 text-sm"
                    />
                  </label>
                </div>
                <label className="space-y-1 text-sm">
                  <span>App activity (optional)</span>
                  <input
                    value={appActivity}
                    onChange={(e) => setAppActivity(e.target.value)}
                    placeholder=".AlarmClock"
                    className="w-full rounded border px-3 py-2 text-sm"
                  />
                </label>
              </div>
            )}

            {!isUploading && !isComplete && (
              <div className="flex gap-2">
                <Button onClick={executeAction} disabled={!selectedDeviceId} className="flex-1">
                  {uploadMode === 'apk' ? 'Install APK' : 'Run Test'}
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Cancel
                </Button>
              </div>
            )}

            {isComplete && (
              <Button onClick={handleReset} variant="outline" className="w-full">
                {uploadMode === 'apk' ? 'Install Another APK' : 'Run Another Test'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

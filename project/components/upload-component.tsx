'use client';

import { useState, useCallback, useEffect } from 'react';
import { Upload, File, X, CircleCheck as CheckCircle, RefreshCw, Smartphone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { installApk, listDevices, LiveDevice } from '@/lib/device-api';
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [devices, setDevices] = useState<LiveDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [installOutput, setInstallOutput] = useState<string | null>(null);

  const connectedDevices = devices.filter((device) => device.status === 'device');

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

  const setSelectedApk = (nextFile: File) => {
    setError(null);
    setInstallOutput(null);
    setIsComplete(false);

    if (!nextFile.name.toLowerCase().endsWith('.apk')) {
      setError('Only .apk files can be installed on Android devices');
      return;
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
      setSelectedApk(droppedFile);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setSelectedApk(selectedFile);
    }
  };

  const installSelectedApk = async () => {
    if (!file || !selectedDeviceId) {
      setError('Choose a connected device and APK first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    setInstallOutput(null);

    try {
      const result = await installApk(selectedDeviceId, file, setUploadProgress);
      setIsComplete(true);
      setInstallOutput(result.adbOutput || result.message);
      onUpload?.(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'APK install failed');
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
  };

  return (
    <Card>
      <CardContent className="p-6">
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
              Drop your APK file here
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              or click to browse files
            </p>
            <input
              type="file"
              accept={acceptedTypes.join(',')}
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
              Supported formats: {acceptedTypes.join(', ')}
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
                  <span>{uploadProgress < 90 ? 'Uploading APK...' : 'Installing on device...'}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            {isComplete && (
              <div className="rounded-lg bg-green-500/10 p-4 text-center">
                <p className="font-medium text-green-600 dark:text-green-400">
                  APK installed successfully.
                </p>
                {installOutput && (
                  <p className="mt-1 break-words text-xs text-green-700 dark:text-green-300">
                    {installOutput}
                  </p>
                )}
              </div>
            )}

            {!isUploading && !isComplete && (
              <div className="flex gap-2">
                <Button onClick={installSelectedApk} disabled={!selectedDeviceId} className="flex-1">
                  Install APK
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Cancel
                </Button>
              </div>
            )}

            {isComplete && (
              <Button onClick={handleReset} variant="outline" className="w-full">
                Install Another APK
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

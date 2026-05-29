'use client';

import { useState, useCallback } from 'react';
import { Upload, File, X, CircleCheck as CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface UploadComponentProps {
  acceptedTypes?: string[];
  onUpload?: (file: File) => void;
}

export function UploadComponent({
  acceptedTypes = ['.apk', '.ipa'],
  onUpload,
}: UploadComponentProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

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
      setFile(droppedFile);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const simulateUpload = () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setIsComplete(true);
          onUpload?.(file);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleReset = () => {
    setFile(null);
    setUploadProgress(0);
    setIsComplete(false);
    setIsUploading(false);
  };

  return (
    <Card>
      <CardContent className="p-6">
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
              Drop your APK or IPA file here
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
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            {isComplete && (
              <div className="rounded-lg bg-green-500/10 p-4 text-center">
                <p className="font-medium text-green-600 dark:text-green-400">
                  Upload complete!
                </p>
              </div>
            )}

            {!isUploading && !isComplete && (
              <div className="flex gap-2">
                <Button onClick={simulateUpload} className="flex-1">
                  Upload
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Cancel
                </Button>
              </div>
            )}

            {isComplete && (
              <Button onClick={handleReset} variant="outline" className="w-full">
                Upload Another File
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

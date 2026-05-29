'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Square, Camera, Video, RotateCw, Volume2, Chrome as Home, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RemoteDeviceViewerProps {
  deviceName: string;
  isConnected?: boolean;
}

export function RemoteDeviceViewer({
  deviceName,
  isConnected = false,
}: RemoteDeviceViewerProps) {
  const [sessionActive, setSessionActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Remote Device Control</CardTitle>
          <Badge variant={isConnected ? 'default' : 'secondary'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{deviceName}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-[9/19] overflow-hidden rounded-lg border-4 border-muted bg-black">
          <div className="flex h-full items-center justify-center">
            {sessionActive ? (
              <div className="text-center">
                <div className="mb-4 h-24 w-24 animate-pulse rounded-full bg-primary/20" />
                <p className="text-sm text-white">
                  Device screen streaming...
                </p>
              </div>
            ) : (
              <div className="text-center">
                <Play className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Start session to view device
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            {!sessionActive ? (
              <Button
                onClick={() => setSessionActive(true)}
                className="flex-1"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Session
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setSessionActive(false);
                  setIsRecording(false);
                }}
                variant="destructive"
                className="flex-1"
              >
                <Square className="mr-2 h-4 w-4" />
                Stop Session
              </Button>
            )}
          </div>

          {sessionActive && (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" disabled={!sessionActive}>
                <Camera className="mr-2 h-4 w-4" />
                Screenshot
              </Button>
              <Button
                variant={isRecording ? 'destructive' : 'outline'}
                onClick={() => setIsRecording(!isRecording)}
                disabled={!sessionActive}
              >
                <Video className="mr-2 h-4 w-4" />
                {isRecording ? 'Stop Recording' : 'Record'}
              </Button>
              <Button variant="outline" disabled={!sessionActive}>
                <RotateCw className="mr-2 h-4 w-4" />
                Rotate
              </Button>
              <Button variant="outline" disabled={!sessionActive}>
                <Volume2 className="mr-2 h-4 w-4" />
                Audio
              </Button>
            </div>
          )}
        </div>

        {sessionActive && (
          <div className="rounded-lg border bg-muted p-4">
            <h4 className="mb-3 text-sm font-semibold">Device Controls</h4>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">
                <Home className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="sm" className="flex-1">
                Menu
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

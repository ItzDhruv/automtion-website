'use client';

import { FormEvent, PointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  ArrowLeft,
  Camera,
  Home,
  Keyboard,
  Play,
  Power,
  RotateCw,
  Square,
  SwitchCamera,
  Volume1,
  Volume2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { captureScreenshot, LiveDevice, SOCKET_BASE_URL, startDevice, stopDevice } from '@/lib/device-api';
import { cn } from '@/lib/utils';

interface RemoteDeviceViewerProps {
  device: LiveDevice;
  onDeviceUpdate?: (device: LiveDevice) => void;
}

type StreamState = 'idle' | 'connecting' | 'live' | 'stopped' | 'error';

interface Point {
  x: number;
  y: number;
}

export function RemoteDeviceViewer({ device, onDeviceUpdate }: RemoteDeviceViewerProps) {
  const socketRef = useRef<Socket | null>(null);
  const screenRef = useRef<HTMLDivElement | null>(null);
  const pointerStartRef = useRef<(Point & { at: number }) | null>(null);
  const [streamState, setStreamState] = useState<StreamState>('idle');
  const [frame, setFrame] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const isConnected = device.status === 'device';
  const isStreaming = streamState === 'connecting' || streamState === 'live';
  const aspectRatio = useMemo(
    () => `${device.resolution.width} / ${device.resolution.height}`,
    [device.resolution.height, device.resolution.width]
  );

  useEffect(() => {
    const socket = io(SOCKET_BASE_URL, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setMessage('Socket connected');
    });

    socket.on('disconnect', () => {
      setStreamState((current) => (current === 'live' ? 'stopped' : current));
      setMessage('Socket disconnected');
    });

    socket.on('streamStarted', ({ deviceId }: { deviceId: string }) => {
      if (deviceId === device.id) {
        setStreamState('live');
        setMessage('Stream is live');
      }
    });

    socket.on('streamStopped', ({ deviceId }: { deviceId: string }) => {
      if (deviceId === device.id) {
        setStreamState('stopped');
        setFrame(null);
        setMessage('Stream stopped');
      }
    });

    socket.on('screenFrame', (payload: { deviceId: string; frameBase64: string }) => {
      if (payload.deviceId === device.id) {
        setFrame(payload.frameBase64);
        setStreamState('live');
      }
    });

    socket.on('streamError', (payload: { deviceId?: string; message: string }) => {
      if (!payload.deviceId || payload.deviceId === device.id) {
        setStreamState('error');
        setMessage(payload.message);
      }
    });

    socket.on('deviceInfo', (payload: LiveDevice | LiveDevice[]) => {
      if (Array.isArray(payload)) {
        const nextDevice = payload.find((item) => item.id === device.id);
        if (nextDevice) {
          onDeviceUpdate?.(nextDevice);
        }
        return;
      }

      if (payload.id === device.id) {
        onDeviceUpdate?.(payload);
      }
    });

    return () => {
      socket.emit('leaveDevice', { deviceId: device.id });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [device.id, onDeviceUpdate]);

  const startSession = async () => {
    setBusyAction('start');
    setMessage(null);

    try {
      setStreamState('connecting');
      await startDevice(device.id);
      socketRef.current?.emit('joinDevice', { deviceId: device.id });
    } catch (err) {
      setStreamState('error');
      setMessage(err instanceof Error ? err.message : 'Could not start stream');
    } finally {
      setBusyAction(null);
    }
  };

  const stopSession = async () => {
    setBusyAction('stop');

    try {
      socketRef.current?.emit('leaveDevice', { deviceId: device.id });
      await stopDevice(device.id);
      setStreamState('stopped');
      setFrame(null);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not stop stream');
    } finally {
      setBusyAction(null);
    }
  };

  const getScreenPoint = (event: PointerEvent<HTMLDivElement>): Point | null => {
    const screen = screenRef.current;
    if (!screen) {
      return null;
    }

    const rect = screen.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(event.clientX - rect.left, rect.width)),
      y: Math.max(0, Math.min(event.clientY - rect.top, rect.height)),
    };
  };

  const screenPayload = (point: Point) => {
    const rect = screenRef.current?.getBoundingClientRect();

    return {
      deviceId: device.id,
      x: point.x,
      y: point.y,
      screenWidth: rect?.width ?? device.resolution.width,
      screenHeight: rect?.height ?? device.resolution.height,
      orientation: device.resolution.width > device.resolution.height ? 'landscape' : 'portrait',
    };
  };

  const emitControl = (event: string, payload: unknown = { deviceId: device.id }) => {
    if (!isStreaming) {
      setMessage('Start the stream before sending controls');
      return;
    }

    socketRef.current?.emit(event, payload);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!isStreaming) {
      return;
    }

    const point = getScreenPoint(event);
    if (!point) {
      return;
    }

    pointerStartRef.current = { ...point, at: Date.now() };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointerStartRef.current;
    const end = getScreenPoint(event);
    pointerStartRef.current = null;

    if (!start || !end || !isStreaming) {
      return;
    }

    const rect = screenRef.current?.getBoundingClientRect();
    const distance = Math.hypot(end.x - start.x, end.y - start.y);
    const duration = Date.now() - start.at;
    const base = {
      deviceId: device.id,
      screenWidth: rect?.width ?? device.resolution.width,
      screenHeight: rect?.height ?? device.resolution.height,
      orientation: device.resolution.width > device.resolution.height ? 'landscape' : 'portrait',
    };

    if (distance > 14) {
      emitControl('swipe', {
        ...base,
        x: start.x,
        y: start.y,
        startX: start.x,
        startY: start.y,
        endX: end.x,
        endY: end.y,
        duration: Math.max(120, Math.min(duration, 900)),
      });
      return;
    }

    emitControl(duration > 550 ? 'longPress' : 'tap', {
      ...screenPayload(end),
      duration,
    });
  };

  const downloadScreenshot = async () => {
    setBusyAction('screenshot');

    try {
      const blob = await captureScreenshot(device.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${device.model}-${Date.now()}.png`;
      link.click();
      URL.revokeObjectURL(url);
      setMessage('Screenshot saved');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Screenshot failed');
    } finally {
      setBusyAction(null);
    }
  };

  const sendText = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!text.trim()) {
      return;
    }

    emitControl('textInput', { deviceId: device.id, text });
    setText('');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Remote Device Control</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{device.id}</p>
          </div>
          <Badge variant={isConnected ? 'default' : 'secondary'}>
            {isConnected ? 'Connected' : device.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-[minmax(280px,420px)_1fr]">
        <div className="mx-auto w-full max-w-[420px]">
          <div
            ref={screenRef}
            className={cn(
              'relative mx-auto overflow-hidden rounded-lg border-4 border-muted bg-black shadow-inner',
              isStreaming && 'cursor-crosshair'
            )}
            style={{ aspectRatio }}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
          >
            {frame ? (
              <img
                src={frame}
                alt={`${device.model} screen`}
                className="h-full w-full select-none object-fill"
                draggable={false}
              />
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-center">
                <div>
                  <Play className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {streamState === 'connecting' ? 'Starting stream...' : 'Start session to view device'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            {!isStreaming ? (
              <Button onClick={startSession} disabled={!isConnected || busyAction === 'start'} className="flex-1">
                <Play className="mr-2 h-4 w-4" />
                Start Session
              </Button>
            ) : (
              <Button onClick={stopSession} variant="destructive" disabled={busyAction === 'stop'} className="flex-1">
                <Square className="mr-2 h-4 w-4" />
                Stop Session
              </Button>
            )}
            <Button variant="outline" onClick={downloadScreenshot} disabled={!isConnected || busyAction === 'screenshot'}>
              <Camera className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" onClick={() => emitControl('back')} disabled={!isStreaming}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button variant="outline" onClick={() => emitControl('home')} disabled={!isStreaming}>
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
            <Button variant="outline" onClick={() => emitControl('recentApps')} disabled={!isStreaming}>
              <SwitchCamera className="mr-2 h-4 w-4" />
              Recents
            </Button>
            <Button variant="outline" onClick={() => emitControl('rotate')} disabled={!isStreaming}>
              <RotateCw className="mr-2 h-4 w-4" />
              Rotate
            </Button>
            <Button variant="outline" onClick={() => emitControl('volumeDown')} disabled={!isStreaming}>
              <Volume1 className="mr-2 h-4 w-4" />
              Down
            </Button>
            <Button variant="outline" onClick={() => emitControl('volumeUp')} disabled={!isStreaming}>
              <Volume2 className="mr-2 h-4 w-4" />
              Up
            </Button>
            <Button variant="outline" onClick={() => emitControl('power')} disabled={!isStreaming} className="col-span-3">
              <Power className="mr-2 h-4 w-4" />
              Power
            </Button>
          </div>

          <form className="flex gap-2" onSubmit={sendText}>
            <div className="relative flex-1">
              <Keyboard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Send text to device"
                className="pl-10"
                disabled={!isStreaming}
              />
            </div>
            <Button type="submit" disabled={!isStreaming || !text.trim()}>
              Send
            </Button>
          </form>

          <div className="rounded-md border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            <div className="font-medium text-foreground">Stream status: {streamState}</div>
            {message && <div className="mt-1">{message}</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

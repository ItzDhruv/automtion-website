'use client';

import { useState } from 'react';
import { TestSession } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SessionTableProps {
  sessions: TestSession[];
}

export function SessionTable({ sessions }: SessionTableProps) {
  const getStatusColor = (status: TestSession['status']) => {
    switch (status) {
      case 'running':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Session ID</TableHead>
            <TableHead>Device</TableHead>
            <TableHead>App Name</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Start Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session.id}>
              <TableCell className="font-mono text-sm">
                {session.id}
              </TableCell>
              <TableCell>{session.deviceName}</TableCell>
              <TableCell>{session.appName}</TableCell>
              <TableCell>{session.duration}</TableCell>
              <TableCell>{formatDate(session.startTime)}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn('gap-1', getStatusColor(session.status))}
                >
                  <div
                    className={cn(
                      'h-2 w-2 rounded-full',
                      getStatusColor(session.status)
                    )}
                  />
                  {session.status.charAt(0).toUpperCase() +
                    session.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  {session.status === 'completed' && (
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

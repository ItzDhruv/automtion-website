import { NextRequest } from 'next/server';
import { proxyDeviceRequest } from '../proxy';

interface RouteContext {
  params: {
    path: string[];
  };
}

export const dynamic = 'force-dynamic';

const getPath = (context: RouteContext): string => {
  return context.params.path.map((part) => encodeURIComponent(part)).join('/');
};

export async function GET(request: NextRequest, context: RouteContext): Promise<Response> {
  return proxyDeviceRequest(request, getPath(context));
}

export async function POST(request: NextRequest, context: RouteContext): Promise<Response> {
  return proxyDeviceRequest(request, getPath(context));
}

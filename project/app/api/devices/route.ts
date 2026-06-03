import { NextRequest } from 'next/server';
import { proxyDeviceRequest } from './proxy';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<Response> {
  return proxyDeviceRequest(request);
}

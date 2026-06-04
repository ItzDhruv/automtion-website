import { NextRequest } from 'next/server';

const BACKEND_BASE_URL =
  process.env.BACKEND_BASE_URL?.replace(/\/$/, '') ||
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ||
  'http://localhost:4000';

const copyResponseHeaders = (headers: Headers): Headers => {
  const nextHeaders = new Headers();

  headers.forEach((value, key) => {
    if (!['content-encoding', 'content-length'].includes(key.toLowerCase())) {
      nextHeaders.set(key, value);
    }
  });

  return nextHeaders;
};

export async function proxyDeviceRequest(
  request: NextRequest,
  path = ''
): Promise<Response> {
  const targetPath = path ? `/api/devices/${path}` : '/api/devices';
  const targetUrl = `${BACKEND_BASE_URL}${targetPath}${request.nextUrl.search}`;
  const headers = new Headers(request.headers);

  headers.delete('host');
  headers.delete('content-length');

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: 'no-store',
  };

  if (!['GET', 'HEAD'].includes(request.method)) {
    init.body = await request.arrayBuffer();
  }

  try {
    const response = await fetch(targetUrl, init);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: copyResponseHeaders(response.headers),
    });
    console.log('BACKEND_BASE_URL=', BACKEND_BASE_URL);
console.log('TARGET_URL=', targetUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Backend is unavailable';

    return Response.json(
      { error: `Could not reach backend at ${BACKEND_BASE_URL}: ${message}` },
      { status: 502 }
    );
  }
}

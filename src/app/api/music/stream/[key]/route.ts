import { NextRequest, NextResponse } from 'next/server';
import { getStreamUrl } from '@/lib/s3';

/**
 * GET /api/music/stream/[key]
 * 
 * Proxies audio from S3 through our server to avoid CORS issues.
 * The [key] is the full S3 key encoded as a URL path segment.
 * Example: /api/music/stream/en%2Fjazz%2Fvelvet-dusk.mp3
 * 
 * Supports range requests for seeking.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  try {
    const { key } = await params;
    const decodedKey = decodeURIComponent(key);

    if (!decodedKey) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Track key is required' } },
        { status: 400 },
      );
    }

    const streamUrl = await getStreamUrl(decodedKey);

    // Forward range header for seeking support
    const headers: Record<string, string> = {};
    const rangeHeader = request.headers.get('range');
    if (rangeHeader) {
      headers['Range'] = rangeHeader;
    }

    // Proxy the audio data through our server to avoid CORS issues
    const s3Response = await fetch(streamUrl, { headers });

    if (!s3Response.ok && s3Response.status !== 206) {
      return NextResponse.json(
        { error: { code: 'STREAM_ERROR', message: 'Failed to stream from S3' } },
        { status: s3Response.status },
      );
    }

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', s3Response.headers.get('content-type') || 'audio/mpeg');
    responseHeaders.set('Accept-Ranges', 'bytes');
    responseHeaders.set('Cache-Control', 'public, max-age=3600');

    const contentLength = s3Response.headers.get('content-length');
    if (contentLength) responseHeaders.set('Content-Length', contentLength);

    const contentRange = s3Response.headers.get('content-range');
    if (contentRange) responseHeaders.set('Content-Range', contentRange);

    return new Response(s3Response.body, {
      status: s3Response.status,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error('Stream proxy failed:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to stream audio' } },
      { status: 500 },
    );
  }
}

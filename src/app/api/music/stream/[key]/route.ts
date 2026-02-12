import { NextRequest, NextResponse } from 'next/server';
import { getStreamUrl } from '@/lib/s3';

/**
 * GET /api/music/stream/[key]
 * 
 * Returns a redirect to the streaming URL (CloudFront or presigned S3).
 * The [key] is the full S3 key encoded as a URL path segment.
 * Example: /api/music/stream/en%2Fjazz%2Fvelvet-dusk.mp3
 * 
 * Supports range requests for seeking (handled by S3/CloudFront).
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

    // Redirect to the actual streaming URL (CloudFront or presigned S3)
    // This keeps the S3 URL hidden from the client and allows caching
    return NextResponse.redirect(streamUrl, 302);
  } catch (err) {
    console.error('Stream URL generation failed:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to generate stream URL' } },
      { status: 500 },
    );
  }
}

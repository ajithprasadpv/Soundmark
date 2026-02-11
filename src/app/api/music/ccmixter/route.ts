import { NextRequest, NextResponse } from 'next/server';

const CCMIXTER_BASE = 'http://ccmixter.org/api/query';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get('genre') || 'ambient';
  const limit = searchParams.get('limit') || '10';
  const offset = searchParams.get('offset') || '0';

  try {
    const url = `${CCMIXTER_BASE}?tags=${encodeURIComponent(genre)}&type=instrumentals&format=json&limit=${limit}&offset=${offset}&sort=rank`;

    const res = await fetch(url);

    if (!res.ok) {
      const text = await res.text();
      console.error('ccMixter API error:', res.status, text);
      return NextResponse.json({ results: [] }, { status: res.status });
    }

    const data = await res.json();

    // Normalize ccMixter response to a common track format
    const results = (Array.isArray(data) ? data : []).map((track: Record<string, unknown>) => {
      const files = (track.files as Array<Record<string, unknown>>) || [];
      const mp3File = files.find((f) => f.file_nicname === 'mp3');
      const downloadUrl = (mp3File?.download_url as string) || '';

      return {
        id: `ccm-${track.upload_id}`,
        name: track.upload_name || 'Unknown',
        duration: 0, // ccMixter doesn't return duration in the API
        artist_id: '',
        artist_name: track.user_name || track.user_real_name || 'Unknown',
        album_name: '',
        album_id: '',
        album_image: '',
        audio: downloadUrl,
        audiodownload: downloadUrl,
        image: '',
        shareurl: (track.file_page_url as string) || '',
        releasedate: '',
        license_name: (track.license_name as string) || 'CC Attribution',
        license_url: (track.license_url as string) || '',
        source: 'ccMixter',
      };
    }).filter((t: { audio: string }) => t.audio); // Only include tracks with audio URLs

    return NextResponse.json({ results });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('ccMixter proxy error:', message);
    return NextResponse.json({ results: [], error: message }, { status: 500 });
  }
}

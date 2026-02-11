import { NextRequest, NextResponse } from 'next/server';

const JAMENDO_CLIENT_ID = '2c9a11b9';
const JAMENDO_BASE = 'https://api.jamendo.com/v3.0';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const genre = searchParams.get('genre') || 'ambient';
  const limit = searchParams.get('limit') || '10';
  const offset = searchParams.get('offset') || '0';
  const featured = searchParams.get('featured');

  try {
    let url: string;

    if (featured === '1') {
      url = `${JAMENDO_BASE}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=${limit}&featured=1&order=popularity_total&audioformat=ogg&imagesize=400&include=musicinfo`;
    } else {
      url = `${JAMENDO_BASE}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=${limit}&offset=${offset}&tags=${genre}&include=musicinfo&groupby=artist_id&order=popularity_total&audioformat=ogg&imagesize=400`;
    }

    const res = await fetch(url);

    if (!res.ok) {
      const text = await res.text();
      console.error('Jamendo API error:', res.status, text);
      return NextResponse.json({ results: [], error: `Jamendo API error: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Jamendo proxy error:', message);
    return NextResponse.json({ results: [], error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { listTracks, listAllTracks, getStorageStats, getStreamUrl, deleteTrack, LANGUAGES, GENRES_BY_LANGUAGE, LanguageCode } from '@/lib/s3';
import { verifyToken } from '@/lib/auth';

/**
 * GET /api/music/library
 * 
 * Browse the S3 music library. Supports filtering by language and genre.
 * 
 * Query params:
 *   - language: Filter by language code (en, hi, es, ar, af, in-regional, in-instrumental)
 *   - genre: Filter by genre within the language
 *   - limit: Max results (default 100)
 *   - cursor: Pagination token
 *   - stats: If "true", return storage stats instead of tracks
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') as LanguageCode | null;
    const genre = searchParams.get('genre');
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const cursor = searchParams.get('cursor') || undefined;
    const wantStats = searchParams.get('stats') === 'true';

    // Return storage stats
    if (wantStats) {
      const stats = await getStorageStats();
      return NextResponse.json({ data: { stats, languages: LANGUAGES, genresByLanguage: GENRES_BY_LANGUAGE } });
    }

    // Build prefix
    let prefix = '';
    if (language) {
      prefix = `${language}/`;
      if (genre) {
        const safeGenre = genre.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        prefix = `${language}/${safeGenre}/`;
      }
    }

    const result = await listTracks(prefix, limit, cursor);

    // Generate stream URLs for each track
    const tracksWithUrls = await Promise.all(
      result.tracks.map(async (track) => ({
        ...track,
        streamUrl: await getStreamUrl(track.key),
        languageName: LANGUAGES[track.language as LanguageCode] || track.language,
      })),
    );

    return NextResponse.json({
      data: {
        tracks: tracksWithUrls,
        nextCursor: result.nextToken,
        count: result.totalCount,
        languages: LANGUAGES,
        genresByLanguage: GENRES_BY_LANGUAGE,
      },
    });
  } catch (err) {
    console.error('Library fetch failed:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch music library' } },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/music/library
 * 
 * Delete a track from S3. Super admin only.
 * Body: { key: "en/jazz/track.mp3" }
 */
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Missing authorization token' } },
        { status: 401 },
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'super_admin') {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Only super admins can delete music' } },
        { status: 403 },
      );
    }

    const { key } = await request.json();
    if (!key) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Track key is required' } },
        { status: 400 },
      );
    }

    await deleteTrack(key);

    return NextResponse.json({ data: { deleted: key } });
  } catch (err) {
    console.error('Delete failed:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to delete track' } },
      { status: 500 },
    );
  }
}

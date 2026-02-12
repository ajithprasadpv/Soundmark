import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getPresignedUploadUrl, getBulkUploadUrls, buildS3Key, LANGUAGES, GENRES_BY_LANGUAGE, LanguageCode } from '@/lib/s3';

/**
 * POST /api/music/upload
 * 
 * Generate presigned S3 upload URLs. Supports single and bulk uploads.
 * Only super_admin can upload tracks.
 * 
 * Body (single):
 *   { language: "en", genre: "jazz", filename: "track.mp3", contentType: "audio/mpeg" }
 * 
 * Body (bulk):
 *   { files: [{ language: "en", genre: "jazz", filename: "track1.mp3", contentType: "audio/mpeg" }, ...] }
 */
export async function POST(request: NextRequest) {
  try {
    // Auth check — super_admin only
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
        { error: { code: 'FORBIDDEN', message: 'Only super admins can upload music' } },
        { status: 403 },
      );
    }

    const body = await request.json();

    // Bulk upload
    if (body.files && Array.isArray(body.files)) {
      const files = body.files as Array<{ language: LanguageCode; genre: string; filename: string; contentType: string }>;

      // Validate all files
      for (const file of files) {
        if (!file.language || !file.genre || !file.filename || !file.contentType) {
          return NextResponse.json(
            { error: { code: 'VALIDATION_ERROR', message: `Missing fields for file: ${file.filename}` } },
            { status: 400 },
          );
        }
        if (!(file.language in LANGUAGES)) {
          return NextResponse.json(
            { error: { code: 'VALIDATION_ERROR', message: `Invalid language: ${file.language}` } },
            { status: 400 },
          );
        }
      }

      const urls = await getBulkUploadUrls(files);
      return NextResponse.json({ data: { uploads: urls } });
    }

    // Single upload
    const { language, genre, filename, contentType } = body;

    if (!language || !genre || !filename || !contentType) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'language, genre, filename, and contentType are required' } },
        { status: 400 },
      );
    }

    if (!(language in LANGUAGES)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: `Invalid language: ${language}. Valid: ${Object.keys(LANGUAGES).join(', ')}` } },
        { status: 400 },
      );
    }

    const key = buildS3Key(language, genre, filename);
    const result = await getPresignedUploadUrl(key, contentType);

    return NextResponse.json({
      data: {
        uploadUrl: result.uploadUrl,
        key: result.key,
        language,
        genre,
        filename,
      },
    });
  } catch (err) {
    console.error('Upload URL generation failed:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to generate upload URL' } },
      { status: 500 },
    );
  }
}

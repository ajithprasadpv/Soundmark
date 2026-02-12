import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// ─── S3 Client ──────────────────────────────────────────────────

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET = process.env.AWS_S3_BUCKET || 'soundmark-music';
const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN || '';

// ─── Language & Genre Definitions ───────────────────────────────

export const LANGUAGES = {
  en: 'English',
  hi: 'Hindi',
  es: 'Spanish',
  ar: 'Arabic',
  af: 'African',
  'in-regional': 'Indian Regional',
  'in-instrumental': 'Indian Instrumental',
} as const;

export type LanguageCode = keyof typeof LANGUAGES;

export const GENRES_BY_LANGUAGE: Record<LanguageCode, string[]> = {
  en: ['jazz', 'lounge', 'ambient', 'electronic', 'pop', 'rock', 'classical', 'chill', 'acoustic', 'folk', 'indie', 'soul', 'r&b', 'deep house', 'country'],
  hi: ['bollywood', 'devotional', 'ghazal', 'sufi', 'indie-hindi', 'retro', 'romantic', 'party', 'lofi-hindi'],
  es: ['latin', 'reggaeton', 'flamenco', 'bossa nova', 'salsa', 'bachata'],
  ar: ['arabic-pop', 'oud', 'khaleeji', 'andalusian', 'sufi-arabic'],
  af: ['afrobeats', 'highlife', 'amapiano', 'soukous', 'afro-jazz'],
  'in-regional': ['tamil', 'telugu', 'kannada', 'malayalam', 'bengali', 'marathi', 'gujarati', 'punjabi'],
  'in-instrumental': ['wedding', 'ceremony', 'classical-indian', 'fusion', 'shehnai', 'sitar', 'tabla', 'flute'],
};

// ─── S3 Key Helpers ─────────────────────────────────────────────

/**
 * Build the S3 object key for a track.
 * Format: {language}/{genre}/{filename}
 */
export function buildS3Key(language: LanguageCode, genre: string, filename: string): string {
  const safeGenre = genre.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${language}/${safeGenre}/${safeFilename}`;
}

// ─── Presigned Upload URL ───────────────────────────────────────

/**
 * Generate a presigned PUT URL for direct browser → S3 upload.
 * The client uploads directly to S3, bypassing the server (fast, no memory pressure).
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600,
): Promise<{ uploadUrl: string; key: string }> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });
  return { uploadUrl, key };
}

// ─── Presigned Download / Stream URL ────────────────────────────

/**
 * Get a streaming URL for a track.
 * If CloudFront is configured, returns a CloudFront URL (cached at edge, fast).
 * Otherwise, returns a presigned S3 URL.
 */
export async function getStreamUrl(key: string, expiresIn: number = 3600): Promise<string> {
  if (CLOUDFRONT_DOMAIN) {
    // CloudFront URL — cached globally, supports range requests
    return `https://${CLOUDFRONT_DOMAIN}/${key}`;
  }

  // Fallback: presigned S3 URL
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

// ─── List Objects ───────────────────────────────────────────────

export interface S3Track {
  key: string;
  size: number;
  lastModified: Date;
  language: string;
  genre: string;
  filename: string;
}

/**
 * List all tracks under a given prefix (e.g., "en/jazz/").
 * Supports pagination via continuationToken.
 */
export async function listTracks(
  prefix: string,
  maxKeys: number = 100,
  continuationToken?: string,
): Promise<{ tracks: S3Track[]; nextToken?: string; totalCount: number }> {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET,
    Prefix: prefix,
    MaxKeys: maxKeys,
    ContinuationToken: continuationToken,
  });

  const response = await s3Client.send(command);

  const tracks: S3Track[] = (response.Contents || [])
    .filter(obj => obj.Key && !obj.Key.endsWith('/')) // skip folder markers
    .map(obj => {
      const parts = (obj.Key || '').split('/');
      return {
        key: obj.Key || '',
        size: obj.Size || 0,
        lastModified: obj.LastModified || new Date(),
        language: parts[0] || '',
        genre: parts[1] || '',
        filename: parts.slice(2).join('/'),
      };
    });

  return {
    tracks,
    nextToken: response.NextContinuationToken,
    totalCount: response.KeyCount || 0,
  };
}

/**
 * List all tracks across all languages and genres.
 */
export async function listAllTracks(maxKeys: number = 1000): Promise<S3Track[]> {
  const allTracks: S3Track[] = [];
  let continuationToken: string | undefined;

  do {
    const result = await listTracks('', maxKeys, continuationToken);
    allTracks.push(...result.tracks);
    continuationToken = result.nextToken;
  } while (continuationToken);

  return allTracks;
}

// ─── Head Object (metadata) ────────────────────────────────────

export async function getTrackMetadata(key: string) {
  const command = new HeadObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  const response = await s3Client.send(command);
  return {
    contentType: response.ContentType,
    contentLength: response.ContentLength,
    lastModified: response.LastModified,
    metadata: response.Metadata,
  };
}

// ─── Delete Object ──────────────────────────────────────────────

export async function deleteTrack(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  await s3Client.send(command);
}

// ─── Bulk Upload Presigned URLs ─────────────────────────────────

/**
 * Generate presigned upload URLs for multiple files at once.
 * Used by the admin bulk upload feature.
 */
export async function getBulkUploadUrls(
  files: Array<{ language: LanguageCode; genre: string; filename: string; contentType: string }>,
): Promise<Array<{ filename: string; uploadUrl: string; key: string }>> {
  const results = await Promise.all(
    files.map(async (file) => {
      const key = buildS3Key(file.language, file.genre, file.filename);
      const { uploadUrl } = await getPresignedUploadUrl(key, file.contentType);
      return { filename: file.filename, uploadUrl, key };
    }),
  );

  return results;
}

// ─── Storage Stats ──────────────────────────────────────────────

export async function getStorageStats(): Promise<Record<string, { count: number; sizeBytes: number }>> {
  const stats: Record<string, { count: number; sizeBytes: number }> = {};

  for (const lang of Object.keys(LANGUAGES) as LanguageCode[]) {
    const tracks = await listTracks(`${lang}/`, 1000);
    stats[lang] = {
      count: tracks.tracks.length,
      sizeBytes: tracks.tracks.reduce((sum, t) => sum + t.size, 0),
    };
  }

  return stats;
}

export { s3Client, BUCKET };

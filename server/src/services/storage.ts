import path from 'path';
import fs from 'fs';
import { Storage } from '@google-cloud/storage';
import type { Express } from 'express';

const bucketName = process.env.GCS_BUCKET || '';
const storage = bucketName ? new Storage() : null;
const bucket = storage ? storage.bucket(bucketName) : null;
const localUploadsDir = path.join(process.cwd(), 'data/uploads');

export function isGcsEnabled(): boolean {
  return !!bucketName;
}

export async function uploadPropertyPhoto(file: Express.Multer.File): Promise<string> {
  if (!file.buffer) {
    throw new Error('Uploaded file buffer is missing');
  }

  const ext = path.extname(file.originalname);
  const filename = `property-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

  if (bucket) {
    const gcsFile = bucket.file(filename);
    await gcsFile.save(file.buffer, {
      resumable: false,
      metadata: {
        contentType: file.mimetype || 'application/octet-stream',
        cacheControl: 'public, max-age=31536000',
      },
      predefinedAcl: 'publicRead',
    });
    return `https://storage.googleapis.com/${bucketName}/${filename}`;
  }

  await fs.promises.mkdir(localUploadsDir, { recursive: true });
  await fs.promises.writeFile(path.join(localUploadsDir, filename), file.buffer);
  return `/uploads/${filename}`;
}

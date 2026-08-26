import { NextResponse } from 'next/server';

/**
 * Returns a presigned PUT URL for direct client upload to S3.
 * Expects JSON: { filename: string, contentType?: string }
 * Returns { url, key, publicUrl }
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const filename = typeof body?.filename === 'string' ? body.filename : `upload-${Date.now()}`;
    const contentType = typeof body?.contentType === 'string' ? body.contentType : 'application/octet-stream';

    const bucket = process.env.S3_BUCKET;
    const region = process.env.AWS_REGION;
    const accessKey = process.env.AWS_ACCESS_KEY_ID;
    const secretKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!(bucket && region && accessKey && secretKey)) {
      return NextResponse.json({ error: 'S3 not configured' }, { status: 501 });
    }

    try {
      // dynamic require to avoid hard dependency at build time
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

      const s3 = new S3Client({ region, credentials: { accessKeyId: accessKey, secretAccessKey: secretKey } });
      const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
      const key = `uploads/${Date.now()}-${safeName}`;
      const cmd = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
      const url = await getSignedUrl(s3, cmd, { expiresIn: 60 * 5 }); // 5 minutes
      const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
      return NextResponse.json({ url, key, publicUrl });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Presign failed', err);
      return NextResponse.json({ error: 'Presign failed' }, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create presign' }, { status: 400 });
  }
}

import { NextResponse } from 'next/server';

/**
 * Admin uploads endpoint — supports S3 when credentials and SDK are available.
 */

export async function POST(request: Request) {
  try {
    // Access form data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const form = await (request as any).formData();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const file = form.get('file') as any;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // If S3 is configured, attempt to upload using @aws-sdk/client-s3
    const bucket = process.env.S3_BUCKET;
    const region = process.env.AWS_REGION;
    const accessKey = process.env.AWS_ACCESS_KEY_ID;
    const secretKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (bucket && region && accessKey && secretKey) {
      try {
        // dynamic import to avoid hard dependency if not installed
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
        const s3 = new S3Client({ region, credentials: { accessKeyId: accessKey, secretAccessKey: secretKey } });

        // file is a File-like object; get ArrayBuffer
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filename = (file as any).name || `upload-${Date.now()}`;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const arrayBuffer = await (file as any).arrayBuffer();
        const body = Buffer.from(arrayBuffer);
        const key = `uploads/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

        await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: (file as any).type || 'application/octet-stream' }));

        const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
        return NextResponse.json({ url });
      } catch (err) {
        // If S3 upload fails, return 500
        // eslint-disable-next-line no-console
        console.error('S3 upload failed', err);
        return NextResponse.json({ error: 'S3 upload failed' }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'Server upload not configured' }, { status: 501 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to process upload' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';

/**
 * Admin uploads endpoint scaffold.
 * - If S3 environment is configured and AWS SDK is installed, this can be extended
 *   to upload to S3 and return a permanent URL.
 * - For now, the endpoint expects a FormData with a 'file' entry and returns 501
 *   if server-side upload is not configured. The editor will fall back to data-URL.
 */

export async function POST(request: Request) {
  try {
    // Attempt to access form data
    // Note: in Vercel, depending on runtime, Request.formData() should work
    // Use any to avoid TS mismatch in this scaffold
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const form = await (request as any).formData();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const file = form.get('file') as any;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // If S3 is configured (placeholder), implement upload here.
    if (process.env.S3_BUCKET && process.env.AWS_REGION) {
      // Implement S3 upload logic when AWS SDK is available and configured.
      // For now, return 501 to indicate server-side upload not set up.
      return NextResponse.json({ error: 'Server upload not configured' }, { status: 501 });
    }

    return NextResponse.json({ error: 'Server upload not configured' }, { status: 501 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to process upload' }, { status: 500 });
  }
}

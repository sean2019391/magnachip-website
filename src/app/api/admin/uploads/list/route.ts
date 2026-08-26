import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  // If S3 is configured, return 501 (server-side listing requires AWS creds)
  const bucket = process.env.S3_BUCKET;
  if (!bucket) {
    // Fallback: read data/uploads.json if present
    try {
      const uploadsPath = path.join(process.cwd(), 'data', 'uploads.json');
      if (fs.existsSync(uploadsPath)) {
        const raw = fs.readFileSync(uploadsPath, 'utf-8');
        const parsed = JSON.parse(raw);
        const items: string[] = (parsed.items ?? []).slice().reverse();
        return NextResponse.json({ items });
      }
    } catch (err) {
      // ignore
    }
    return NextResponse.json({ items: [] });
  }

  // If S3 is configured but AWS SDK is not available here, return not implemented
  return new NextResponse(JSON.stringify({ error: 'S3 listing not implemented in runtime' }), { status: 501 });
}

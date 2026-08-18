import { NextRequest, NextResponse } from 'next/server';
import { getSiteContent } from '@/lib/site-content.server';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    const content = getSiteContent();
    return NextResponse.json({ content });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to read site content';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

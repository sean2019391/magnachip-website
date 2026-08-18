import { NextRequest, NextResponse } from 'next/server';
import { getSiteContentSection, saveSiteContentSection } from '@/lib/site-content.server';
import { SITE_CONTENT_SECTIONS } from '@/lib/site-content-shared';

export const dynamic = 'force-dynamic';

function isValidSection(value: string): value is (typeof SITE_CONTENT_SECTIONS)[number] {
  return (SITE_CONTENT_SECTIONS as readonly string[]).includes(value);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ section: string }> },
) {
  const { section } = await params;
  if (!isValidSection(section)) {
    return NextResponse.json(
      { error: `Unknown section: ${section}` },
      { status: 400 },
    );
  }
  try {
    const value = getSiteContentSection(section);
    return NextResponse.json({ section, value });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to read section';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ section: string }> },
) {
  const { section } = await params;
  if (!isValidSection(section)) {
    return NextResponse.json(
      { error: `Unknown section: ${section}` },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Body must be an object with a `value` field that is the section payload.
  const obj =
    body !== null && typeof body === 'object' ? (body as Record<string, unknown>) : null;
  const value = obj?.value;
  if (value === undefined) {
    return NextResponse.json(
      { error: 'Body must be { value: <section data> }' },
      { status: 400 },
    );
  }

  try {
    const next = saveSiteContentSection(section, value);
    return NextResponse.json({ section, value: next[section], updatedAt: next.updatedAt });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save section';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

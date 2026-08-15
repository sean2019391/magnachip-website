import { NextRequest, NextResponse } from 'next/server';
import type { DatasheetBody } from '@/types/datasheet';
import {
  getDatasheets,
  getAllDatasheets,
  getDatasheetByPartNumber,
  createDatasheet,
} from '@/lib/datasheets';

/**
 * SECURITY NOTE: this project currently has NO authentication (no middleware,
 * no tokens/sessions, no ADMIN_ env config). Any anonymous visitor can pass
 * ?admin=true to read drafts/unpublished records. Behavior is kept per review;
 * when an auth system is added, gate this check behind it and return 401
 * instead of admin data.
 */
function isAdminRequest(request: NextRequest): boolean {
  return request.nextUrl.searchParams.get('admin') === 'true';
}

export async function GET(request: NextRequest) {
  try {
    const partNumber = request.nextUrl.searchParams.get('partNumber');
    if (partNumber) {
      const datasheet = getDatasheetByPartNumber(partNumber);
      if (!datasheet) {
        return NextResponse.json({ error: 'Datasheet not found' }, { status: 404 });
      }
      return NextResponse.json({ datasheet });
    }
    const datasheets = isAdminRequest(request) ? getAllDatasheets() : getDatasheets();
    const publishedParam = request.nextUrl.searchParams.get('published');
    const filtered =
      publishedParam === 'true'
        ? datasheets.filter((d) => d.published !== false)
        : publishedParam === 'false'
          ? datasheets.filter((d) => d.published === false)
          : datasheets;
    return NextResponse.json({ datasheets: filtered });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch datasheets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const rawBody: unknown = await request.json();
    if (typeof rawBody !== 'object' || rawBody === null) {
      return NextResponse.json(
        { error: 'Invalid datasheet: request body must be an object.' },
        { status: 400 },
      );
    }
    const body = rawBody as Record<string, unknown>;
    const meta = body.meta;
    if (
      typeof meta !== 'object' ||
      meta === null ||
      typeof (meta as Record<string, unknown>).partNumber !== 'string' ||
      ((meta as Record<string, unknown>).partNumber as string).trim() === ''
    ) {
      return NextResponse.json(
        { error: 'Invalid datasheet: meta.partNumber must be a non-empty string.' },
        { status: 400 },
      );
    }
    if (!Array.isArray(body.sections)) {
      return NextResponse.json(
        { error: 'Invalid datasheet: sections must be an array.' },
        { status: 400 },
      );
    }
    if (body.published !== undefined && typeof body.published !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid datasheet: published must be a boolean.' },
        { status: 400 },
      );
    }
    const datasheet = createDatasheet(body as unknown as DatasheetBody & { published?: boolean });
    return NextResponse.json({ datasheet }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create datasheet' }, { status: 500 });
  }
}

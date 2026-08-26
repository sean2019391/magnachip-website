import { NextResponse } from 'next/server';
import type { DatasheetBody } from '@/types/datasheet';
import { getAllDatasheets, createDatasheet } from '@/lib/datasheets';

export async function GET() {
  try {
    const datasheets = getAllDatasheets();
    return NextResponse.json({ datasheets });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to load datasheets' }, { status: 500 });
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
    // basic validation left to lib/createDatasheet
    const datasheet = createDatasheet(body as unknown as DatasheetBody & { published?: boolean });
    return NextResponse.json({ datasheet }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create datasheet' }, { status: 500 });
  }
}

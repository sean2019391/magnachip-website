import { NextRequest, NextResponse } from 'next/server';
import { getDatasheets, getDatasheetByPartNumber } from '@/lib/datasheets';
import { hasRawDatasheetData } from '@/types/datasheet';

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

    const datasheets = getDatasheets();
    const publishedParam = request.nextUrl.searchParams.get('published');
    const filtered =
      publishedParam === 'true'
        ? datasheets.filter((d) => d.published !== false)
        : publishedParam === 'false'
        ? datasheets.filter((d) => d.published === false)
        : datasheets;
    const visibleOnlyWithRawData =
      request.nextUrl.searchParams.get('withRawData') === 'true'
        ? filtered.filter((d) => hasRawDatasheetData(d))
        : filtered;
    return NextResponse.json({ datasheets: visibleOnlyWithRawData });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch datasheets' }, { status: 500 });
  }
}

export async function POST() {
  // Public write not allowed — use admin-protected /api/admin/datasheets for writes
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}

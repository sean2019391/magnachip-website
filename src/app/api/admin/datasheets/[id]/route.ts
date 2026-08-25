import { NextResponse } from 'next/server';
import { getDatasheet, updateDatasheet, deleteDatasheet } from '@/lib/datasheets';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const datasheet = getDatasheet(id);
    if (!datasheet) return NextResponse.json({ error: 'Datasheet not found' }, { status: 404 });
    return NextResponse.json({ datasheet });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch datasheet' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rawBody: unknown = await request.json();
    if (typeof rawBody !== 'object' || rawBody === null) {
      return NextResponse.json({ error: 'Invalid datasheet: request body must be an object.' }, { status: 400 });
    }
    const body = rawBody as Record<string, unknown>;
    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...data } = body;
    const datasheet = updateDatasheet(id, data as any);
    if (!datasheet) return NextResponse.json({ error: 'Datasheet not found' }, { status: 404 });
    return NextResponse.json({ datasheet });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update datasheet' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const deleted = deleteDatasheet(id);
    if (!deleted) return NextResponse.json({ error: 'Datasheet not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete datasheet' }, { status: 500 });
  }
}

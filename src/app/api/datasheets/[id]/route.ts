import { NextResponse } from 'next/server'
import type { DatasheetRecord } from '@/types/datasheet'
import { getDatasheet, updateDatasheet, deleteDatasheet } from '@/lib/datasheets'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const datasheet = getDatasheet(id)
    if (!datasheet) {
      return NextResponse.json(
        { error: 'Datasheet not found' },
        { status: 404 }
      )
    }
    return NextResponse.json({ datasheet })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch datasheet' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const rawBody: unknown = await request.json()
    if (typeof rawBody !== 'object' || rawBody === null) {
      return NextResponse.json(
        { error: 'Invalid datasheet: request body must be an object.' },
        { status: 400 }
      )
    }
    const body = rawBody as Record<string, unknown>
    const meta = body.meta
    if (
      meta !== undefined &&
      (typeof meta !== 'object' ||
        meta === null ||
        typeof (meta as Record<string, unknown>).partNumber !== 'string' ||
        ((meta as Record<string, unknown>).partNumber as string).trim() === '')
    ) {
      return NextResponse.json(
        { error: 'Invalid datasheet: meta.partNumber must be a non-empty string.' },
        { status: 400 }
      )
    }
    if (body.sections !== undefined && !Array.isArray(body.sections)) {
      return NextResponse.json(
        { error: 'Invalid datasheet: sections must be an array.' },
        { status: 400 }
      )
    }
    if (body.curves !== undefined && !Array.isArray(body.curves)) {
      return NextResponse.json(
        { error: 'Invalid datasheet: curves must be an array.' },
        { status: 400 }
      )
    }
    if (body.published !== undefined && typeof body.published !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid datasheet: published must be a boolean.' },
        { status: 400 }
      )
    }
    const {
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      ...data
    } = body
    const datasheet = updateDatasheet(
      id,
      data as Partial<Omit<DatasheetRecord, 'id' | 'createdAt'>>
    )
    if (!datasheet) {
      return NextResponse.json(
        { error: 'Datasheet not found' },
        { status: 404 }
      )
    }
    return NextResponse.json({ datasheet })
  } catch {
    return NextResponse.json(
      { error: 'Failed to update datasheet' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const deleted = deleteDatasheet(id)
    if (!deleted) {
      return NextResponse.json(
        { error: 'Datasheet not found' },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete datasheet' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { deleteDevice, getDevice, updateDevice } from '@/lib/soa-devices'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const device = getDevice(id)
    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 })
    }
    return NextResponse.json(device)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch device' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const device = updateDevice(id, body)
    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 })
    }
    return NextResponse.json(device)
  } catch {
    return NextResponse.json({ error: 'Failed to update device' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const deleted = deleteDevice(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete device' }, { status: 500 })
  }
}

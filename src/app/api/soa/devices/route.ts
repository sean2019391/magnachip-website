import { NextResponse } from 'next/server';
import { createDevice, getAllDevices, searchDevices } from '@/lib/soa-devices';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query')?.trim() ?? '';
    const devices = query ? searchDevices(query) : getAllDevices();
    return NextResponse.json(devices);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch devices' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const device = createDevice(body);
    return NextResponse.json(device, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create device' }, { status: 500 });
  }
}

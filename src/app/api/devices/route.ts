import { NextRequest, NextResponse } from 'next/server';
import {
  registerDevice,
  getDevicesByOrg,
  getAllDevices,
  removeDevice,
  assignVenue,
  unassignVenue,
  sendCommand,
  cleanupStaleDevices,
} from '@/lib/device-store';

// GET /api/devices?orgId=1 — list devices for an org, or all if orgId=all
export async function GET(req: NextRequest) {
  cleanupStaleDevices();
  const orgId = req.nextUrl.searchParams.get('orgId');
  const devices = orgId === 'all' ? getAllDevices() : getDevicesByOrg(orgId || '1');
  return NextResponse.json({ devices });
}

// POST /api/devices — register a new device
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, organizationId } = body;

  if (!name) {
    return NextResponse.json({ error: 'Device name is required' }, { status: 400 });
  }

  const device = registerDevice(name, organizationId || '1');
  return NextResponse.json({ device });
}

// DELETE /api/devices?id=xxx — remove a device
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Device ID is required' }, { status: 400 });
  }
  const ok = removeDevice(id);
  return NextResponse.json({ success: ok });
}

// PATCH /api/devices — assign/unassign venue or send command
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { deviceId, action, venueId, commandType, commandPayload } = body;

  if (!deviceId) {
    return NextResponse.json({ error: 'deviceId is required' }, { status: 400 });
  }

  if (action === 'assign_venue' && venueId) {
    const ok = assignVenue(deviceId, venueId);
    return NextResponse.json({ success: ok });
  }

  if (action === 'unassign_venue') {
    const ok = unassignVenue(deviceId);
    return NextResponse.json({ success: ok });
  }

  if (action === 'send_command' && commandType) {
    const cmd = sendCommand(deviceId, commandType, commandPayload || {});
    if (!cmd) {
      return NextResponse.json({ error: 'Failed to send command' }, { status: 400 });
    }
    return NextResponse.json({ command: cmd });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

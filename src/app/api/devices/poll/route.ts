import { NextRequest, NextResponse } from 'next/server';
import {
  pairDeviceByCode,
  pollCommand,
  acknowledgeCommand,
  updateDeviceStatus,
  heartbeat,
  getDevice,
} from '@/lib/device-store';

// POST /api/devices/poll — called by Android TV box every 2-3 seconds
// Handles: pairing, heartbeat, status reporting, command polling
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  // ─── Pair by code ───────────────────────────────────────────
  if (action === 'pair') {
    const { pairingCode } = body;
    if (!pairingCode) {
      return NextResponse.json({ error: 'pairingCode is required' }, { status: 400 });
    }
    const device = pairDeviceByCode(pairingCode);
    if (!device) {
      return NextResponse.json({ error: 'Invalid pairing code' }, { status: 404 });
    }
    return NextResponse.json({
      deviceId: device.id,
      venueId: device.venueId,
      name: device.name,
      paired: true,
    });
  }

  // ─── Heartbeat + poll for commands ──────────────────────────
  if (action === 'poll') {
    const { deviceId, status } = body;
    if (!deviceId) {
      return NextResponse.json({ error: 'deviceId is required' }, { status: 400 });
    }

    // Update heartbeat
    heartbeat(deviceId);

    // Update status if provided
    if (status) {
      updateDeviceStatus(deviceId, {
        isPlaying: status.isPlaying ?? false,
        trackName: status.trackName ?? null,
        artistName: status.artistName ?? null,
        albumImage: status.albumImage ?? null,
        genre: status.genre ?? null,
        volume: status.volume ?? 50,
        currentTime: status.currentTime ?? 0,
        duration: status.duration ?? 0,
        source: status.source ?? null,
        updatedAt: Date.now(),
      });
    }

    // Check for pending command
    const command = pollCommand(deviceId);

    // Get device info for venue assignment changes
    const device = getDevice(deviceId);

    return NextResponse.json({
      command: command || null,
      venueId: device?.venueId || null,
    });
  }

  // ─── Acknowledge command ────────────────────────────────────
  if (action === 'ack') {
    const { deviceId, commandId } = body;
    if (!deviceId || !commandId) {
      return NextResponse.json({ error: 'deviceId and commandId are required' }, { status: 400 });
    }
    const ok = acknowledgeCommand(deviceId, commandId);
    return NextResponse.json({ success: ok });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

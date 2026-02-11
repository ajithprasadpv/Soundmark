// ─── In-memory device store (replace with DB in production) ─────
// This manages Android TV box devices, their pairing, commands, and status.

export interface DeviceRecord {
  id: string;
  name: string;
  pairingCode: string;
  venueId: string | null;
  organizationId: string;
  paired: boolean;
  online: boolean;
  lastHeartbeat: number;
  registeredAt: string;
  // Current command the device should execute
  pendingCommand: DeviceCommand | null;
  // Last reported status from the device
  status: DeviceStatus | null;
}

export interface DeviceCommand {
  id: string;
  type: 'play' | 'pause' | 'stop' | 'skip_next' | 'skip_prev' | 'set_volume' | 'set_genre' | 'set_playlist';
  payload: Record<string, unknown>;
  issuedAt: number;
  acknowledged: boolean;
}

export interface DeviceStatus {
  isPlaying: boolean;
  trackName: string | null;
  artistName: string | null;
  albumImage: string | null;
  genre: string | null;
  volume: number;
  currentTime: number;
  duration: number;
  source: string | null;
  updatedAt: number;
}

// ─── In-memory store ────────────────────────────────────────────

const devices: Map<string, DeviceRecord> = new Map();
const pairingCodes: Map<string, string> = new Map(); // code -> deviceId

function generateId(): string {
  return `dev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function generatePairingCode(): string {
  // 6-digit numeric code for easy TV input
  return String(Math.floor(100000 + Math.random() * 900000));
}

function generateCommandId(): string {
  return `cmd_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

// ─── Public API ─────────────────────────────────────────────────

export function registerDevice(name: string, organizationId: string): DeviceRecord {
  const id = generateId();
  const pairingCode = generatePairingCode();

  const device: DeviceRecord = {
    id,
    name,
    pairingCode,
    venueId: null,
    organizationId,
    paired: false,
    online: false,
    lastHeartbeat: 0,
    registeredAt: new Date().toISOString(),
    pendingCommand: null,
    status: null,
  };

  devices.set(id, device);
  pairingCodes.set(pairingCode, id);

  return device;
}

export function pairDeviceByCode(code: string): DeviceRecord | null {
  const deviceId = pairingCodes.get(code);
  if (!deviceId) return null;

  const device = devices.get(deviceId);
  if (!device) return null;

  device.paired = true;
  device.online = true;
  device.lastHeartbeat = Date.now();

  return device;
}

export function getDevice(deviceId: string): DeviceRecord | null {
  return devices.get(deviceId) || null;
}

export function getDevicesByOrg(organizationId: string): DeviceRecord[] {
  return Array.from(devices.values()).filter(d => d.organizationId === organizationId);
}

export function assignVenue(deviceId: string, venueId: string): boolean {
  const device = devices.get(deviceId);
  if (!device) return false;
  device.venueId = venueId;
  return true;
}

export function unassignVenue(deviceId: string): boolean {
  const device = devices.get(deviceId);
  if (!device) return false;
  device.venueId = null;
  return true;
}

export function sendCommand(deviceId: string, type: DeviceCommand['type'], payload: Record<string, unknown> = {}): DeviceCommand | null {
  const device = devices.get(deviceId);
  if (!device || !device.paired) return null;

  const command: DeviceCommand = {
    id: generateCommandId(),
    type,
    payload,
    issuedAt: Date.now(),
    acknowledged: false,
  };

  device.pendingCommand = command;
  return command;
}

export function pollCommand(deviceId: string): DeviceCommand | null {
  const device = devices.get(deviceId);
  if (!device) return null;

  const cmd = device.pendingCommand;
  if (cmd && !cmd.acknowledged) {
    return cmd;
  }
  return null;
}

export function acknowledgeCommand(deviceId: string, commandId: string): boolean {
  const device = devices.get(deviceId);
  if (!device || !device.pendingCommand) return false;
  if (device.pendingCommand.id === commandId) {
    device.pendingCommand.acknowledged = true;
    return true;
  }
  return false;
}

export function updateDeviceStatus(deviceId: string, status: DeviceStatus): boolean {
  const device = devices.get(deviceId);
  if (!device) return false;
  device.status = status;
  device.online = true;
  device.lastHeartbeat = Date.now();
  return true;
}

export function heartbeat(deviceId: string): boolean {
  const device = devices.get(deviceId);
  if (!device) return false;
  device.online = true;
  device.lastHeartbeat = Date.now();
  return true;
}

export function removeDevice(deviceId: string): boolean {
  const device = devices.get(deviceId);
  if (!device) return false;
  pairingCodes.delete(device.pairingCode);
  devices.delete(deviceId);
  return true;
}

// Mark devices offline if no heartbeat in 60 seconds
export function cleanupStaleDevices() {
  const now = Date.now();
  devices.forEach(device => {
    if (device.online && device.lastHeartbeat > 0 && now - device.lastHeartbeat > 60_000) {
      device.online = false;
    }
  });
}

// ─── Seed demo device ───────────────────────────────────────────

const demoDevice = registerDevice('Lobby TV Box', '1');
demoDevice.paired = true;
demoDevice.online = true;
demoDevice.venueId = '1';
demoDevice.lastHeartbeat = Date.now();
demoDevice.status = {
  isPlaying: false,
  trackName: null,
  artistName: null,
  albumImage: null,
  genre: 'jazz',
  volume: 65,
  currentTime: 0,
  duration: 0,
  source: null,
  updatedAt: Date.now(),
};

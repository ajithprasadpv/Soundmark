// ─── Persistent device store ──────────────────────────────────────
// Persists devices to /tmp on Vercel so they survive across warm invocations.
// Falls back to in-memory if /tmp is unavailable.

import fs from 'fs';
import path from 'path';

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
  pendingCommand: DeviceCommand | null;
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

// ─── Persistence layer ──────────────────────────────────────────

const STORE_PATH = path.join('/tmp', 'soundmark-devices.json');

interface StoreData {
  devices: Record<string, DeviceRecord>;
  pairingCodes: Record<string, string>;
}

function loadStore(): StoreData {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      return JSON.parse(raw) as StoreData;
    }
  } catch { /* ignore corrupt file */ }
  return { devices: {}, pairingCodes: {} };
}

function saveStore(data: StoreData): void {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data), 'utf-8');
  } catch { /* ignore write errors */ }
}

// ─── In-memory cache (loaded from disk on cold start) ───────────

let _store: StoreData | null = null;

function getStore(): StoreData {
  if (!_store) {
    _store = loadStore();
    // Seed demo device if store is empty
    if (Object.keys(_store.devices).length === 0) {
      seedDemoDevice(_store);
      saveStore(_store);
    }
  }
  return _store;
}

function persist(): void {
  if (_store) saveStore(_store);
}

function seedDemoDevice(store: StoreData): void {
  // Lobby TV Box — always present for demo org 1
  const id1 = 'dev_demo_lobby';
  const code1 = '000000';
  store.devices[id1] = {
    id: id1,
    name: 'Lobby TV Box',
    pairingCode: code1,
    venueId: '1',
    organizationId: '1',
    paired: true,
    online: true,
    lastHeartbeat: Date.now(),
    registeredAt: new Date().toISOString(),
    pendingCommand: null,
    status: {
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
    },
  };
  store.pairingCodes[code1] = id1;

  // Android TV Box — permanent device for demo org 1
  const id2 = 'dev_android_tv';
  const code2 = '111111';
  store.devices[id2] = {
    id: id2,
    name: 'Android TV Box',
    pairingCode: code2,
    venueId: '1',
    organizationId: '1',
    paired: true,
    online: true,
    lastHeartbeat: Date.now(),
    registeredAt: new Date().toISOString(),
    pendingCommand: null,
    status: {
      isPlaying: false,
      trackName: null,
      artistName: null,
      albumImage: null,
      genre: 'ambient',
      volume: 65,
      currentTime: 0,
      duration: 0,
      source: null,
      updatedAt: Date.now(),
    },
  };
  store.pairingCodes[code2] = id2;
}

// ─── Helpers ────────────────────────────────────────────────────

function generateId(): string {
  return `dev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function generatePairingCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function generateCommandId(): string {
  return `cmd_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

// ─── Public API ─────────────────────────────────────────────────

export function registerDevice(name: string, organizationId: string): DeviceRecord {
  const store = getStore();
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

  store.devices[id] = device;
  store.pairingCodes[pairingCode] = id;
  persist();

  return device;
}

export function pairDeviceByCode(code: string): DeviceRecord | null {
  const store = getStore();
  const deviceId = store.pairingCodes[code];
  if (!deviceId) return null;

  const device = store.devices[deviceId];
  if (!device) return null;

  device.paired = true;
  device.online = true;
  device.lastHeartbeat = Date.now();
  persist();

  return device;
}

export function getDevice(deviceId: string): DeviceRecord | null {
  const store = getStore();
  return store.devices[deviceId] || null;
}

export function getDevicesByOrg(organizationId: string): DeviceRecord[] {
  const store = getStore();
  return Object.values(store.devices).filter(d => d.organizationId === organizationId);
}

export function getAllDevices(): DeviceRecord[] {
  const store = getStore();
  return Object.values(store.devices);
}

export function assignVenue(deviceId: string, venueId: string): boolean {
  const store = getStore();
  const device = store.devices[deviceId];
  if (!device) return false;
  device.venueId = venueId;
  persist();
  return true;
}

export function unassignVenue(deviceId: string): boolean {
  const store = getStore();
  const device = store.devices[deviceId];
  if (!device) return false;
  device.venueId = null;
  persist();
  return true;
}

export function sendCommand(deviceId: string, type: DeviceCommand['type'], payload: Record<string, unknown> = {}): DeviceCommand | null {
  const store = getStore();
  const device = store.devices[deviceId];
  if (!device || !device.paired) return null;

  const command: DeviceCommand = {
    id: generateCommandId(),
    type,
    payload,
    issuedAt: Date.now(),
    acknowledged: false,
  };

  device.pendingCommand = command;
  persist();
  return command;
}

export function pollCommand(deviceId: string): DeviceCommand | null {
  const store = getStore();
  const device = store.devices[deviceId];
  if (!device) return null;

  const cmd = device.pendingCommand;
  if (cmd && !cmd.acknowledged) {
    return cmd;
  }
  return null;
}

export function acknowledgeCommand(deviceId: string, commandId: string): boolean {
  const store = getStore();
  const device = store.devices[deviceId];
  if (!device || !device.pendingCommand) return false;
  if (device.pendingCommand.id === commandId) {
    device.pendingCommand.acknowledged = true;
    persist();
    return true;
  }
  return false;
}

export function updateDeviceStatus(deviceId: string, status: DeviceStatus): boolean {
  const store = getStore();
  const device = store.devices[deviceId];
  if (!device) return false;
  device.status = status;
  device.online = true;
  device.lastHeartbeat = Date.now();
  persist();
  return true;
}

export function heartbeat(deviceId: string): boolean {
  const store = getStore();
  const device = store.devices[deviceId];
  if (!device) return false;
  device.online = true;
  device.lastHeartbeat = Date.now();
  persist();
  return true;
}

export function removeDevice(deviceId: string): boolean {
  const store = getStore();
  const device = store.devices[deviceId];
  if (!device) return false;
  delete store.pairingCodes[device.pairingCode];
  delete store.devices[deviceId];
  persist();
  return true;
}

// Mark devices offline if no heartbeat in 60 seconds
export function cleanupStaleDevices() {
  const store = getStore();
  const now = Date.now();
  let changed = false;
  Object.values(store.devices).forEach(device => {
    if (device.online && device.lastHeartbeat > 0 && now - device.lastHeartbeat > 60_000) {
      device.online = false;
      changed = true;
    }
  });
  if (changed) persist();
}

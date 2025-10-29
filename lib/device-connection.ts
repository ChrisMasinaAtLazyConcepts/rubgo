export interface BluetoothDevice {
  id: string
  name: string
  type: "gate" | "camera"
  rssi: number
  connected: boolean
}

export interface AccessLog {
  id: string
  action: "open" | "close"
  timestamp: Date
  device: string
  success: boolean
}

// Mock Bluetooth devices
export const mockDevices: BluetoothDevice[] = [
  {
    id: "sonoff-gate-001",
    name: "Dam Safe Main Gate",
    type: "gate",
    rssi: -45,
    connected: false,
  },
  {
    id: "sonoff-gate-002",
    name: "Dam Safe Side Gate",
    type: "gate",
    rssi: -62,
    connected: false,
  },
  {
    id: "sonoff-cam-001",
    name: "Unit Camera 1",
    type: "camera",
    rssi: -55,
    connected: false,
  },
]

// Mock access logs
export const mockAccessLogs: AccessLog[] = [
  {
    id: "1",
    action: "open",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    device: "Dam Safe Main Gate",
    success: true,
  },
  {
    id: "2",
    action: "close",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 - 5 * 60 * 1000),
    device: "Dam Safe Main Gate",
    success: true,
  },
  {
    id: "3",
    action: "open",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    device: "Dam Safe Main Gate",
    success: true,
  },
]

export async function scanForDevices(): Promise<BluetoothDevice[]> {
  // Simulate scanning delay
  await new Promise((resolve) => setTimeout(resolve, 2000))
  return mockDevices
}

export async function connectToDevice(deviceId: string): Promise<boolean> {
  // Simulate connection delay
  await new Promise((resolve) => setTimeout(resolve, 1500))
  return true
}

export async function disconnectFromDevice(deviceId: string): Promise<boolean> {
  // Simulate disconnection delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return true
}

export async function sendGateCommand(deviceId: string, command: "open" | "close"): Promise<boolean> {
  // Simulate command delay
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return true
}

export function getSignalStrength(rssi: number): "excellent" | "good" | "fair" | "poor" {
  if (rssi >= -50) return "excellent"
  if (rssi >= -60) return "good"
  if (rssi >= -70) return "fair"
  return "poor"
}

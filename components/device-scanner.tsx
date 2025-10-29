"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { BluetoothDevice } from "@/lib/device-connection"
import { scanForDevices, connectToDevice, getSignalStrength } from "@/lib/device-connection"
import { Bluetooth, Wifi, Loader2, Signal } from "lucide-react"

interface DeviceScannerProps {
  onDeviceConnected: (device: BluetoothDevice) => void
}

export function DeviceScanner({ onDeviceConnected }: DeviceScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [devices, setDevices] = useState<BluetoothDevice[]>([])
  const [connectingId, setConnectingId] = useState<string | null>(null)

  const handleScan = async () => {
    setIsScanning(true)
    setDevices([])

    try {
      const foundDevices = await scanForDevices()
      setDevices(foundDevices)
    } catch (error) {
      console.error("[v0] Scan error:", error)
    } finally {
      setIsScanning(false)
    }
  }

  const handleConnect = async (device: BluetoothDevice) => {
    setConnectingId(device.id)

    try {
      const success = await connectToDevice(device.id)
      if (success) {
        onDeviceConnected({ ...device, connected: true })
      }
    } catch (error) {
      console.error("[v0] Connection error:", error)
    } finally {
      setConnectingId(null)
    }
  }

  const getSignalIcon = (rssi: number) => {
    const strength = getSignalStrength(rssi)
    const colors = {
      excellent: "text-green-500",
      good: "text-green-500",
      fair: "text-yellow-500",
      poor: "text-red-500",
    }
    return <Signal className={`h-4 w-4 ${colors[strength]}`} />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Available Devices</h3>
          <p className="text-sm text-muted-foreground">Scan for nearby Sonoff devices</p>
        </div>
        <Button onClick={handleScan} disabled={isScanning} size="sm" variant="outline" className="gap-2 bg-transparent">
          {isScanning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Bluetooth className="h-4 w-4" />
              Scan
            </>
          )}
        </Button>
      </div>

      {devices.length > 0 && (
        <div className="space-y-2">
          {devices.map((device) => (
            <Card key={device.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {device.type === "gate" ? (
                        <Wifi className="h-5 w-5 text-primary" />
                      ) : (
                        <Bluetooth className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{device.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getSignalIcon(device.rssi)}
                        <span className="text-xs text-muted-foreground capitalize">
                          {getSignalStrength(device.rssi)} signal
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleConnect(device)}
                    disabled={connectingId === device.id}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    {connectingId === device.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Connecting...
                      </>
                    ) : (
                      "Connect"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isScanning && devices.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Bluetooth className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">No devices found. Tap scan to search for nearby devices.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

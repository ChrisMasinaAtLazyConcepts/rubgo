"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { BluetoothDevice } from "@/lib/device-connection"
import { sendGateCommand, disconnectFromDevice } from "@/lib/device-connection"
import { DoorOpen, DoorClosed, Loader2, Wifi, WifiOff } from "lucide-react"

interface GateControlProps {
  device: BluetoothDevice
  onDisconnect: () => void
}

export function GateControl({ device, onDisconnect }: GateControlProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [lastAction, setLastAction] = useState<"open" | "close" | null>(null)
  const [gateStatus, setGateStatus] = useState<"open" | "closed">("closed")

  const handleCommand = async (command: "open" | "close") => {
    setIsLoading(true)
    setLastAction(command)

    try {
      const success = await sendGateCommand(device.id, command)
      if (success) {
        setGateStatus(command === "open" ? "open" : "closed")
      }
    } catch (error) {
      console.error("[v0] Command error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnectFromDevice(device.id)
      onDisconnect()
    } catch (error) {
      console.error("[v0] Disconnect error:", error)
    }
  }

  return (
    <Card className="border-primary/20">
      <CardContent className="p-6 space-y-6">
        {/* Device Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Wifi className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{device.name}</p>
              <Badge variant="secondary" className="mt-1">
                Connected
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleDisconnect} className="gap-2">
            <WifiOff className="h-4 w-4" />
            Disconnect
          </Button>
        </div>

        {/* Gate Status */}
        <div className="p-4 rounded-lg bg-muted/50 text-center">
          <div className="flex justify-center mb-2">
            {gateStatus === "open" ? (
              <DoorOpen className="h-12 w-12 text-primary" />
            ) : (
              <DoorClosed className="h-12 w-12 text-muted-foreground" />
            )}
          </div>
          <p className="text-sm font-medium">Gate Status</p>
          <p className="text-2xl font-bold capitalize mt-1">{gateStatus}</p>
        </div>

        {/* Control Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => handleCommand("open")}
            disabled={isLoading || gateStatus === "open"}
            className="h-16 bg-primary hover:bg-primary/90 text-white"
          >
            {isLoading && lastAction === "open" ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Opening...
              </>
            ) : (
              <>
                <DoorOpen className="h-5 w-5 mr-2" />
                Open Gate
              </>
            )}
          </Button>

          <Button
            onClick={() => handleCommand("close")}
            disabled={isLoading || gateStatus === "closed"}
            variant="outline"
            className="h-16 bg-transparent"
          >
            {isLoading && lastAction === "close" ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Closing...
              </>
            ) : (
              <>
                <DoorClosed className="h-5 w-5 mr-2" />
                Close Gate
              </>
            )}
          </Button>
        </div>

        {/* Safety Notice */}
        <div className="text-xs text-muted-foreground text-center p-3 bg-muted/30 rounded-lg">
          Ensure the gate area is clear before operating. The gate will automatically close after 30 seconds.
        </div>
      </CardContent>
    </Card>
  )
}

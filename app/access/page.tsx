"use client"

import { useState } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { MobileHeader } from "@/components/mobile-header"
import { DeviceScanner } from "@/components/device-scanner"
import { GateControl } from "@/components/gate-control"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { BluetoothDevice, AccessLog } from "@/lib/device-connection"
import { mockAccessLogs } from "@/lib/device-connection"
import { Clock, CheckCircle2, XCircle, Video } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AccessPage() {
  const router = useRouter()
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null)
  const [accessLogs] = useState<AccessLog[]>(mockAccessLogs)

  const handleDeviceConnected = (device: BluetoothDevice) => {
    setConnectedDevice(device)
  }

  const handleDisconnect = () => {
    setConnectedDevice(null)
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
    return "Just now"
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Access Control" />

      <div className="p-4 space-y-6">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Video className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Security Cameras</p>
                  <p className="text-sm text-muted-foreground">View live feeds</p>
                </div>
              </div>
              <Button
                onClick={() => router.push("/cameras")}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white"
              >
                View
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="control" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="control">Gate Control</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="control" className="space-y-6 mt-6">
            {/* Connection Status */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-muted/50 to-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Connection Status</p>
                  <p className="text-lg font-semibold mt-1">
                    {connectedDevice ? connectedDevice.name : "Not Connected"}
                  </p>
                </div>
                <Badge variant={connectedDevice ? "default" : "secondary"}>
                  {connectedDevice ? "Connected" : "Disconnected"}
                </Badge>
              </div>
            </div>

            {/* Gate Control or Device Scanner */}
            {connectedDevice ? (
              <GateControl device={connectedDevice} onDisconnect={handleDisconnect} />
            ) : (
              <DeviceScanner onDeviceConnected={handleDeviceConnected} />
            )}

            {/* Instructions */}
            {!connectedDevice && (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold">How to Connect</h3>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="font-semibold text-foreground">1.</span>
                      <span>Ensure Bluetooth is enabled on your device</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold text-foreground">2.</span>
                      <span>Be within 10 meters of the gate</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold text-foreground">3.</span>
                      <span>Tap "Scan" to search for available devices</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold text-foreground">4.</span>
                      <span>Select your gate and tap "Connect"</span>
                    </li>
                  </ol>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-6">
            <div className="space-y-2">
              <h3 className="font-semibold">Access History</h3>
              <p className="text-sm text-muted-foreground">Your recent gate access activity</p>
            </div>

            {accessLogs.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                      <Clock className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">No access history yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {accessLogs.map((log) => (
                  <Card key={log.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              log.success ? "bg-green-500/10" : "bg-red-500/10"
                            }`}
                          >
                            {log.success ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium capitalize">{log.action} Gate</p>
                            <p className="text-sm text-muted-foreground">{log.device}</p>
                            <p className="text-xs text-muted-foreground mt-1">{formatTime(log.timestamp)}</p>
                          </div>
                        </div>
                        <Badge variant={log.success ? "default" : "destructive"}>
                          {log.success ? "Success" : "Failed"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  )
}

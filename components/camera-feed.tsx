"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Camera } from "@/lib/camera-data"
import { getCameraStatusColor, getCameraStatusText } from "@/lib/camera-data"
import { Maximize2, Download, RotateCw } from "lucide-react"
import Image from "next/image"

interface CameraFeedProps {
  camera: Camera
  onFullscreen?: () => void
}

export function CameraFeed({ camera, onFullscreen }: CameraFeedProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const handleSnapshot = () => {
    // Mock snapshot functionality
    alert("Snapshot saved to your device")
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-black">
        {camera.status === "offline" ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                <span className="text-2xl">📹</span>
              </div>
              <p className="text-sm text-muted-foreground">Camera Offline</p>
            </div>
          </div>
        ) : (
          <>
            <Image
              src={camera.streamUrl || "/placeholder.svg"}
              alt={camera.name}
              fill
              className={`object-cover ${isRefreshing ? "opacity-50" : ""}`}
            />

            {/* Status Badge */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <Badge variant="secondary" className="bg-black/60 text-white border-0">
                <span className={`h-2 w-2 rounded-full mr-2 ${getCameraStatusColor(camera.status)}`} />
                {getCameraStatusText(camera.status)}
              </Badge>
            </div>

            {/* Timestamp */}
            <div className="absolute bottom-3 left-3">
              <Badge variant="secondary" className="bg-black/60 text-white border-0 text-xs">
                {new Date().toLocaleTimeString()}
              </Badge>
            </div>

            {/* Controls */}
            <div className="absolute bottom-3 right-3 flex gap-2">
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 bg-black/60 hover:bg-black/80 text-white border-0"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RotateCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 bg-black/60 hover:bg-black/80 text-white border-0"
                onClick={handleSnapshot}
              >
                <Download className="h-4 w-4" />
              </Button>
              {onFullscreen && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 bg-black/60 hover:bg-black/80 text-white border-0"
                  onClick={onFullscreen}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Camera Info */}
      <div className="p-4 space-y-1">
        <h3 className="font-semibold">{camera.name}</h3>
        <p className="text-sm text-muted-foreground">{camera.location}</p>
      </div>
    </Card>
  )
}

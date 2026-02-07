"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Camera } from "@/lib/camera-data"
import { getCameraStatusColor, getCameraStatusText } from "@/lib/camera-data"
import { X, Download, RotateCw, ZoomIn, ZoomOut } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

interface CameraFullscreenProps {
  camera: Camera
  onClose: () => void
}

export function CameraFullscreen({ camera, onClose }: CameraFullscreenProps) {
  const [zoom, setZoom] = useState(1)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const handleSnapshot = () => {
    alert("Snapshot saved to your device")
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 1))
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-semibold">{camera.name}</h2>
            <p className="text-white/70 text-sm">{camera.location}</p>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose} className="text-white hover:bg-white/20">
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Camera Feed */}
      <div className="absolute inset-0 flex items-center justify-center">
        {camera.status === "offline" ? (
          <div className="text-center space-y-4">
            <div className="h-24 w-24 rounded-full bg-white/10 flex items-center justify-center mx-auto">
              <span className="text-5xl">📹</span>
            </div>
            <p className="text-white/70">Camera Offline</p>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <Image
              src={camera.streamUrl || "/placeholder.svg"}
              alt={camera.name}
              fill
              className={`object-contain ${isRefreshing ? "opacity-50" : ""}`}
              style={{ transform: `scale(${zoom})` }}
            />

            {/* Status Badge */}
            <div className="absolute top-20 left-4">
              <Badge variant="secondary" className="bg-black/60 text-white border-0">
                <span className={`h-2 w-2 rounded-full mr-2 ${getCameraStatusColor(camera.status)}`} />
                {getCameraStatusText(camera.status)}
              </Badge>
            </div>

            {/* Timestamp */}
            <div className="absolute top-20 right-4">
              <Badge variant="secondary" className="bg-black/60 text-white border-0">
                {new Date().toLocaleTimeString()}
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center justify-center gap-4">
          <Button
            size="icon"
            variant="secondary"
            className="h-12 w-12 bg-white/20 hover:bg-white/30 text-white border-0"
            onClick={handleZoomOut}
            disabled={zoom <= 1}
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-12 w-12 bg-white/20 hover:bg-white/30 text-white border-0"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RotateCw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-12 w-12 bg-white/20 hover:bg-white/30 text-white border-0"
            onClick={handleSnapshot}
          >
            <Download className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-12 w-12 bg-white/20 hover:bg-white/30 text-white border-0"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-center text-white/70 text-sm mt-4">Zoom: {Math.round(zoom * 100)}%</p>
      </div>
    </div>
  )
}

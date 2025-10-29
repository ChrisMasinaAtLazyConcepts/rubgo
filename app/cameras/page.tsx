"use client"

import { useState } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { MobileHeader } from "@/components/mobile-header"
import { CameraFeed } from "@/components/camera-feed"
import { CameraFullscreen } from "@/components/camera-fullscreen"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockCameras, type Camera } from "@/lib/camera-data"
import { Video, Grid3x3 } from "lucide-react"

export default function CamerasPage() {
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")

  const onlineCameras = mockCameras.filter((cam) => cam.status !== "offline")
  const myCameras = mockCameras.filter((cam) => cam.unitId)

  const handleFullscreen = (camera: Camera) => {
    setSelectedCamera(camera)
  }

  const handleCloseFullscreen = () => {
    setSelectedCamera(null)
  }

  return (
    <>
      <div className="min-h-screen bg-background pb-20">
        <MobileHeader
          title="Cameras"
          rightAction={
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="h-9 w-9"
            >
              {viewMode === "grid" ? <Video className="h-5 w-5" /> : <Grid3x3 className="h-5 w-5" />}
            </Button>
          }
        />

        <div className="p-4 space-y-6">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">All Cameras</TabsTrigger>
              <TabsTrigger value="my-units">My Units</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Live Feeds</h3>
                  <p className="text-sm text-muted-foreground">{onlineCameras.length} cameras online</p>
                </div>
              </div>

              <div className={viewMode === "grid" ? "grid grid-cols-2 gap-3" : "space-y-4"}>
                {mockCameras.map((camera) => (
                  <CameraFeed key={camera.id} camera={camera} onFullscreen={() => handleFullscreen(camera)} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="my-units" className="space-y-4 mt-6">
              {myCameras.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="flex justify-center">
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                      <Video className="h-10 w-10 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium">No unit cameras</p>
                    <p className="text-sm text-muted-foreground">
                      Cameras will appear here when you book a unit with camera access
                    </p>
                  </div>
                </div>
              ) : (
                <div className={viewMode === "grid" ? "grid grid-cols-2 gap-3" : "space-y-4"}>
                  {myCameras.map((camera) => (
                    <CameraFeed key={camera.id} camera={camera} onFullscreen={() => handleFullscreen(camera)} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <BottomNav />
      </div>

      {/* Fullscreen Camera View */}
      {selectedCamera && <CameraFullscreen camera={selectedCamera} onClose={handleCloseFullscreen} />}
    </>
  )
}

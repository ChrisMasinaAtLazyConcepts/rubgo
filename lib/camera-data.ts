export interface Camera {
  id: string
  name: string
  location: string
  unitId?: string
  status: "online" | "offline" | "recording"
  streamUrl: string
  lastUpdate: Date
}

export const mockCameras: Camera[] = [
  {
    id: "cam-001",
    name: "Main Entrance",
    location: "Front Gate",
    status: "online",
    streamUrl: "/security-camera-entrance-view.jpg",
    lastUpdate: new Date(),
  },
  {
    id: "cam-002",
    name: "Unit A-12 Interior",
    location: "Container Storage",
    unitId: "1",
    status: "online",
    streamUrl: "/storage-unit-interior-camera.jpg",
    lastUpdate: new Date(),
  },
  {
    id: "cam-003",
    name: "Vehicle Bay",
    location: "Vehicle Storage Area",
    status: "recording",
    streamUrl: "/vehicle-storage-security-camera.jpg",
    lastUpdate: new Date(),
  },
  {
    id: "cam-004",
    name: "Perimeter North",
    location: "North Fence",
    status: "offline",
    streamUrl: "/placeholder.svg",
    lastUpdate: new Date(Date.now() - 30 * 60 * 1000),
  },
]

export function getCameraStatusColor(status: Camera["status"]): string {
  switch (status) {
    case "online":
      return "bg-green-500"
    case "recording":
      return "bg-red-500 animate-pulse"
    case "offline":
      return "bg-gray-500"
  }
}

export function getCameraStatusText(status: Camera["status"]): string {
  switch (status) {
    case "online":
      return "Live"
    case "recording":
      return "Recording"
    case "offline":
      return "Offline"
  }
}

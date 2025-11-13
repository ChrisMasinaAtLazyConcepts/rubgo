// components/route-map.tsx
"use client"

import { useEffect, useRef } from 'react'

interface RouteMapProps {
  origin: { lat: number; lng: number }
  destination: { lat: number; lng: number }
  height?: string
}

export default function RouteMap({ origin, destination, height = "400px" }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // This would be replaced with actual Google Maps implementation
    const initMap = async () => {
      // Mock map implementation - in real app, you'd use Google Maps API
      const mapElement = mapRef.current
      if (mapElement) {
        // Simulate map loading
        mapElement.innerHTML = `
          <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #2d3e50 0%, #3a506b 100%); display: flex; align-items: center; justify-content: center; color: white; border-radius: 8px;">
            <div style="text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">🗺️</div>
              <div style="font-weight: bold; margin-bottom: 8px;">Route Map</div>
              <div style="font-size: 14px; opacity: 0.8;">
                Origin: ${origin.lat.toFixed(4)}, ${origin.lng.toFixed(4)}<br/>
                Destination: ${destination.lat.toFixed(4)}, ${destination.lng.toFixed(4)}
              </div>
              <div style="margin-top: 16px; padding: 8px 16px; background: #71CBD1; color: #1a2a3a; border-radius: 20px; font-size: 12px; display: inline-block;">
                Uber-like Route Display
              </div>
            </div>
          </div>
        `
      }
    }

    initMap()
  }, [origin, destination])

  return (
    <div 
      ref={mapRef}
      style={{ height }}
      className="w-full rounded-lg overflow-hidden"
    />
  )
}
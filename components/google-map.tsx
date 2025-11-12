// components/google-map.tsx
"use client"

import { Therapist } from '@/lib/types';
import { useEffect, useRef, useState } from 'react'

interface GoogleMapProps {
  center: { lat: number; lng: number }
  zoom?: number
  therapists?: Therapist[]
  className?: string
}

// Simple loading component
const MapLoading = () => (
  <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
      <p className="text-sm text-gray-600">Loading Map...</p>
    </div>
  </div>
)

export default function GoogleMap({ 
  center, 
  zoom = 12, 
  therapists = [], 
  className = "w-full h-full" 
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const API_KEY = "AIzaSyBgtmDrI8g4cW1Tf9nxnwp1Si8KqEdD-XM"

  useEffect(() => {
    // Check if we're on client side
    if (typeof window === 'undefined') return

    // Load Google Maps script if not already loaded
    if (!window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=geometry,places`
      script.async = true
      script.defer = true
      script.onload = () => {
        console.log('Google Maps script loaded successfully')
        setMapLoaded(true)
      }
      script.onerror = () => {
        console.error('Failed to load Google Maps script')
        setError('Failed to load Google Maps')
      }
      document.head.appendChild(script)
    } else {
      console.log('Google Maps already loaded')
      setMapLoaded(true)
    }
  }, [])

  useEffect(() => {
    // Only initialize map when everything is ready
    if (!mapLoaded || !mapRef.current || typeof window === 'undefined' || !window.google) {
      return
    }

    try {
      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom,
        disableDefaultUI: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          },
          {
            featureType: "transit",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      })

      // Add simple user location marker
      new window.google.maps.Marker({
        position: center,
        map: map,
        title: 'Your Location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#3B82F6',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
        zIndex: 1000
      })

      // Add therapist markers
      therapists.forEach((therapist) => {
        if (!therapist.location || isNaN(therapist.location.lat) || isNaN(therapist.location.lng)) {
          return
        }

        new window.google.maps.Marker({
          position: therapist.location,
          map: map,
          title: therapist.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 6,
            fillColor: '#10B981',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          },
        })
      })

    } catch (err) {
      console.error('Error initializing map:', err)
      setError('Error creating map')
    }
  }, [mapLoaded, center, zoom, therapists])

  if (error) {
    return (
      <div className={`${className} bg-red-50 border border-red-200 rounded-lg flex items-center justify-center`}>
        <div className="text-center text-red-700 p-4">
          <div className="text-lg font-semibold mb-2">Map Error</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    )
  }

  if (!mapLoaded) {
    return <MapLoading />
  }

  return (
    <div className={className}>
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg bg-gray-200"
        style={{ minHeight: '400px' }}
      />
    </div>
  )
}
"use client"

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

interface GoogleMapProps {
  apiKey: string
  center?: { lat: number; lng: number }
  zoom?: number
  height?: string
  width?: string
}

export default function GoogleMap({ 
  apiKey  = 'AIzaSyBp_hrQ6RPWS7CLmKC8bEd-GmbhKIXMLqs', 
  center = { lat: -34.397, lng: 150.644 }, 
  zoom = 8,
  height = '400px',
  width = '100%'
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapError, setMapError] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const scriptLoaded = useRef(false)

  useEffect(() => {
    // Don't run on server side
    if (typeof window === 'undefined') return
    
    // Prevent multiple script loads
    if (scriptLoaded.current) return
    
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      console.log('Google Maps already loaded')
      initMap()
      setIsLoaded(true)
      return
    }

    console.log('Loading Google Maps API...')
    
    // Load Google Maps API
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`
    script.async = true
    script.defer = true
    
    // Set up callback
    window.initMap = () => {
      console.log('Google Maps API loaded successfully')
      scriptLoaded.current = true
      setIsLoaded(true)
      initMap()
    }
    
    script.onerror = (error) => {
      console.error('Failed to load Google Maps API:', error)
      setMapError('Failed to load Google Maps. Check your API key.')
      scriptLoaded.current = false
    }
    
    document.head.appendChild(script)
    scriptLoaded.current = true

    return () => {
      // Clean up
      if (window.initMap) {
        delete window.initMap
      }
    }
  }, [apiKey])

  const initMap = () => {
    try {
      if (!mapRef.current || !window.google) {
        console.warn('Map container or Google not ready')
        return
      }
      
      console.log('Initializing map...')
      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom,
      })
      
      console.log('Map initialized successfully')
    } catch (error) {
      console.error('Error initializing map:', error)
      setMapError('Error loading map. Please try again.')
    }
  }

  // Show error state
  if (mapError) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-yellow-800 font-medium">⚠️ Map unavailable</p>
        <p className="text-yellow-600 text-sm mt-1">{mapError}</p>
        <button 
          onClick={() => setMapError(null)}
          className="mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm hover:bg-yellow-200"
        >
          Try again
        </button>
      </div>
    )
  }

  // Show loading state
  if (!isLoaded) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100"
        style={{ height, width }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={mapRef} 
      style={{ height, width }}
      className="rounded-lg overflow-hidden border border-gray-200"
    />
  )
}
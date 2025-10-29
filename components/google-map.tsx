"use client"

import { Therapist } from '@/lib/types';
import { useEffect, useRef, useState } from 'react'

interface GoogleMapProps {
  center: { lat: number; lng: number }
  zoom?: number
  therapists?: Therapist[]
  className?: string
}

interface TherapistMarker {
  marker: google.maps.Marker
  infoWindow: google.maps.InfoWindow
}

// Stock image URLs based on therapist names and specialties
const therapistAvatars = {
  "Sarah Johnson": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
  "James Mbeki": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  "Priya Singh": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  "David van Niekerk": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  "Lerato Ndlovu": "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=150&h=150&fit=crop&crop=face",
  "Amara Okeke": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
  "Thomas O'Connor": "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face",
  "Zinhle Khumalo": "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face"
}

export default function GoogleMap({ 
  center, 
  zoom = 12, 
  therapists = [], 
  className = "w-full h-full" 
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<TherapistMarker[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const markersInitialized = useRef(false)
  const isInitialMount = useRef(true)

  // Hardcoded API key for testing (replace with your actual key)
  const API_KEY = "AIzaSyBgtmDrI8g4cW1Tf9nxnwp1Si8KqEdD-XM"

  // Function to get avatar URL for therapist
  const getTherapistAvatar = (therapistName: string) => {
    return therapistAvatars[therapistName as keyof typeof therapistAvatars] || 
           "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face"
  }

  // Function to create circular avatar marker
  const createAvatarMarker = (avatarUrl: string, therapistName: string) => {
    return {
      url: avatarUrl,
      scaledSize: new google.maps.Size(40, 40),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(20, 20),
    }
  }

  useEffect(() => {
    // Load Google Maps script if not already loaded
    if (!window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`
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
      setMapLoaded(true)
    }

    // Cleanup function for script
    return () => {
      // Clean up markers when component unmounts
      markersRef.current.forEach(({ marker, infoWindow }) => {
        marker.setMap(null)
        infoWindow.close()
      })
      markersRef.current = []
    }
  }, [])

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return

    console.log('Initializing map with center:', center)

    try {
      const map = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "on" }]
          }
        ]
      })

      mapInstanceRef.current = map
      console.log('Map initialized successfully')

      // Add a marker for user location
      new google.maps.Marker({
        position: center,
        map: map,
        title: 'Your Location',
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#3B82F6" stroke="white" stroke-width="3"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
        }
      })

    } catch (err) {
      console.error('Error initializing map:', err)
      setError('Error creating map: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }, [mapLoaded, center, zoom])

  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || therapists.length === 0) return

    // Prevent double initialization in development mode
    if (markersInitialized.current && isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    console.log('Adding markers for therapists:', therapists.length)
    console.log('Therapist names:', therapists.map(t => t.name))

    // Clear existing markers only if we've already initialized before
    if (markersInitialized.current) {
      markersRef.current.forEach(({ marker, infoWindow }) => {
        marker.setMap(null)
        infoWindow.close()
      })
      markersRef.current = []
    }

    // Add markers for therapists
    therapists.forEach(therapist => {
      try {
        const avatarUrl = getTherapistAvatar(therapist.name)
        console.log(`Creating marker for ${therapist.name} with avatar:`, avatarUrl)

        const marker = new google.maps.Marker({
          position: therapist.location,
          map: mapInstanceRef.current,
          title: therapist.name,
          icon: createAvatarMarker(avatarUrl, therapist.name)
        })

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-3 min-w-48 max-w-xs">
              <div class="flex items-start gap-3">
                <img 
                  src="${avatarUrl}" 
                  alt="${therapist.name}"
                  class="w-12 h-12 rounded-full object-cover border-2 border-green-500"
                  onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'"
                />
                <div class="flex-1">
                  <h3 class="font-bold text-sm mb-1">${therapist.name}</h3>
                  <p class="text-xs text-gray-600 mb-1">${therapist.specialty}</p>
                  <p class="text-xs font-semibold text-green-600 mb-1">R${therapist.price}/hr</p>
                  ${therapist.rating ? `
                    <div class="flex items-center gap-1">
                      <span class="text-xs text-yellow-600">⭐ ${therapist.rating}</span>
                      <span class="text-xs text-gray-500">(${therapist.reviews || '50+'} reviews)</span>
                    </div>
                  ` : ''}
                  ${therapist.distance ? `<p class="text-xs text-gray-500 mt-1">${therapist.distance}km away</p>` : ''}
                </div>
              </div>
              ${therapist.availability ? `
                <div class="mt-2 pt-2 border-t border-gray-200">
                  <p class="text-xs text-green-600 font-medium">${therapist.availability}</p>
                </div>
              ` : ''}
            </div>
          `
        })

        marker.addListener('click', () => {
          // Close all other info windows
          markersRef.current.forEach(({ infoWindow }) => {
            infoWindow.close()
          })
          infoWindow.open(mapInstanceRef.current!, marker)
        })

        markersRef.current.push({ marker, infoWindow })
      } catch (err) {
        console.error('Error creating marker for therapist:', therapist.name, err)
      }
    })

    markersInitialized.current = true
    isInitialMount.current = false

    // No cleanup function here to prevent markers from disappearing
  }, [mapLoaded, therapists])

  if (error) {
    return (
      <div className={`${className} bg-red-50 border border-red-200 rounded-lg flex items-center justify-center`}>
        <div className="text-center text-red-700 p-4">
          <div className="text-lg font-semibold mb-2">Map Error</div>
          <div className="text-sm">{error}</div>
          <div className="text-xs mt-2">Please check your API key and try again</div>
        </div>
      </div>
    )
  }

  if (!mapLoaded) {
    return (
      <div className={`${className} bg-gray-100 rounded-lg flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading Google Maps...</p>
          <p className="text-xs text-gray-500 mt-1">Initializing map</p>
        </div>
      </div>
    )
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
// app/therapist/navigation/page.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Navigation, 
  Clock, 
  MapPin, 
  Phone, 
  MessageCircle, 
  X,
  Car,
  User,
  AlertTriangle,
  Compass
} from "lucide-react"
import { Button } from "@/components/ui/button"
import dynamic from 'next/dynamic'

// Dynamically import GoogleMap with no SSR
const GoogleMap = dynamic(() => import('@/components/google-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-400">Loading Navigation...</p>
      </div>
    </div>
  )
})

interface Session {
  id: string
  clientName: string
  clientImage: string
  service: string
  duration: number
  price: number
  date: Date
  location: string
  coordinates: { lat: number; lng: number }
  status: 'in-progress'
  startTime: Date
  estimatedArrival: Date
}

interface RouteInfo {
  distance: number
  duration: number
  polyline?: any
}

export default function TherapistNavigation() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [currentLocation, setCurrentLocation] = useState({ lat: -26.1076, lng: 28.0567 })
  const [destination, setDestination] = useState({ lat: -26.1076, lng: 28.0567 })
  const [eta, setEta] = useState(0)
  const [distance, setDistance] = useState(0)
  const [isNavigating, setIsNavigating] = useState(true)
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(true)
  const directionsServiceRef = useRef<any>(null)
  const directionsRendererRef = useRef<any>(null)

  useEffect(() => {
    // Get session data from storage
    const sessionData = sessionStorage.getItem('currentSession')
    if (sessionData) {
      const sessionObj = JSON.parse(sessionData)
      setSession(sessionObj)
      
      // Set destination from session coordinates
      if (sessionObj.coordinates) {
        setDestination(sessionObj.coordinates)
      }
    } else {
      router.push('/therapist/dashboard')
    }

    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setCurrentLocation(newLocation)
        },
        (error) => {
          console.error('Geolocation error:', error)
          // Use default location if geolocation fails
          setCurrentLocation({ lat: -26.1076, lng: 28.0567 })
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )

      // Watch position for real-time updates
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setCurrentLocation(newLocation)
          
          // Recalculate route when location changes
          if (session && window.google) {
            calculateRoute(newLocation, destination)
          }
        },
        null,
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      )

      return () => navigator.geolocation.clearWatch(watchId)
    }
  }, [router, session])

  // Calculate route using Google Maps Directions API
  const calculateRoute = (origin: { lat: number; lng: number }, dest: { lat: number; lng: number }) => {
    if (!window.google || !window.google.maps) return

    try {
      setIsCalculatingRoute(true)
      
      if (!directionsServiceRef.current) {
        directionsServiceRef.current = new window.google.maps.DirectionsService()
      }
      
      if (!directionsRendererRef.current) {
        directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
          suppressMarkers: false,
          preserveViewport: true,
          polylineOptions: {
            strokeColor: '#10B981',
            strokeWeight: 6,
            strokeOpacity: 0.8
          }
        })
      }

      const request = {
        origin: new window.google.maps.LatLng(origin.lat, origin.lng),
        destination: new window.google.maps.LatLng(dest.lat, dest.lng),
        travelMode: window.google.maps.TravelMode.DRIVING
      }

      directionsServiceRef.current.route(request, (result: any, status: any) => {
        setIsCalculatingRoute(false)
        
        if (status === window.google.maps.DirectionsStatus.OK) {
          const route = result.routes[0].legs[0]
          const newDistance = route.distance.value / 1000 // Convert to km
          const newDuration = route.duration.value / 60 // Convert to minutes
          
          setDistance(parseFloat(newDistance.toFixed(2)))
          setEta(parseFloat(newDuration.toFixed(1)))
          setRouteInfo({
            distance: newDistance,
            duration: newDuration,
            polyline: result
          })

          // Update the directions renderer
          if (directionsRendererRef.current) {
            const mapElement = document.getElementById('navigation-map')
            if (mapElement) {
              const map = new window.google.maps.Map(mapElement, {
                zoom: 13,
                center: origin,
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
              
              directionsRendererRef.current.setMap(map)
              directionsRendererRef.current.setDirections(result)
            }
          }
        } else {
          console.error('Directions request failed:', status)
          // Fallback to straight-line distance calculation
          calculateStraightLineDistance(origin, dest)
        }
      })
    } catch (error) {
      console.error('Error calculating route:', error)
      setIsCalculatingRoute(false)
      calculateStraightLineDistance(origin, dest)
    }
  }

  // Fallback straight-line distance calculation
  const calculateStraightLineDistance = (origin: { lat: number; lng: number }, dest: { lat: number; lng: number }) => {
    const R = 6371 // Earth's radius in km
    const dLat = (dest.lat - origin.lat) * Math.PI / 180
    const dLon = (dest.lng - origin.lng) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(origin.lat * Math.PI / 180) * Math.cos(dest.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const straightDistance = R * c
    
    // Estimate driving distance (usually 1.3x straight line)
    const estimatedDrivingDistance = straightDistance * 1.3
    // Estimate driving time (assuming 40km/h average in city)
    const estimatedDrivingTime = (estimatedDrivingDistance / 40) * 60
    
    setDistance(parseFloat(estimatedDrivingDistance.toFixed(2)))
    setEta(parseFloat(estimatedDrivingTime.toFixed(1)))
  }

  // Recalculate route when destination changes
  useEffect(() => {
    if (session && session.coordinates && window.google) {
      setDestination(session.coordinates)
      calculateRoute(currentLocation, session.coordinates)
    }
  }, [session, currentLocation])

  const handleArrive = () => {
    setIsNavigating(false)
    // Update session status
    if (session) {
      const updatedSession = { ...session, status: 'arrived' as const }
      sessionStorage.setItem('currentSession', JSON.stringify(updatedSession))
    }
  }

  const handleCallClient = () => {
    window.open('tel:+27123456789', '_blank')
  }

  const handleMessageClient = () => {
    router.push('/therapist/inbox')
  }

  const handleOpenInGoogleMaps = () => {
    if (session?.coordinates) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${session.coordinates.lat},${session.coordinates.lng}&travelmode=driving`
      window.open(url, '_blank')
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#1a2a3a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#71CBD1] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading navigation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1a2a3a] text-white">
      {/* Header */}
      <div className="bg-[#2d3e50] p-4 border-b border-[#3a506b]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/therapist/dashboard')}
              className="text-white hover:bg-[#3a506b]"
            >
              <X size={24} />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">Navigation</h1>
              <p className="text-[#71CBD1] text-sm">En route to session</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[#71CBD1]">
              {isCalculatingRoute ? '...' : eta.toFixed(1)} min
            </div>
            <div className="text-sm text-gray-400">
              {isCalculatingRoute ? 'Calculating...' : `${distance.toFixed(2)} km`}
            </div>
          </div>
        </div>
      </div>

      {/* Real Google Map with Navigation */}
      <div className="flex-1 relative h-96 bg-[#2d3e50]">
        <GoogleMap 
          center={currentLocation}
          zoom={13}
          therapists={[]}
          className="w-full h-full"
        />
        
        {/* Map overlay with navigation info */}
        <div className="absolute top-4 left-4 bg-[#1a2a3a]/90 backdrop-blur-sm rounded-xl p-3 border border-[#3a506b]">
          <div className="flex items-center gap-2 text-[#71CBD1]">
            <Compass className="w-4 h-4" />
            <span className="text-sm font-medium">Navigation Active</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Following route to client
          </div>
        </div>

        {/* Progress indicator */}
        {!isCalculatingRoute && (
          <div className="absolute bottom-4 left-4 right-4 bg-[#1a2a3a]/90 backdrop-blur-sm rounded-xl p-3 border border-[#3a506b]">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>You</span>
              <span>{session.clientName}</span>
            </div>
            <div className="w-full bg-[#3a506b] rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#71CBD1] to-emerald-500 h-2 rounded-full transition-all duration-1000"
                style={{ 
                  width: `${Math.min(100, ((routeInfo?.distance || 0) / (routeInfo?.distance || 1)) * 100)}%` 
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Session Info Card */}
      <div className="bg-[#2d3e50] m-4 rounded-2xl border border-[#3a506b] overflow-hidden">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#71CBD1] to-emerald-600 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">{session.clientName}</h3>
              <p className="text-gray-400 text-sm">{session.service}</p>
            </div>
            <div className="text-right">
              <div className="text-[#71CBD1] font-bold">R{session.price}</div>
              <div className="text-gray-400 text-xs">{session.duration}min</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-400 mb-4">
            <MapPin className="w-4 h-4" />
            <span className="text-sm flex-1">{session.location}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleCallClient}
              className="bg-[#3a506b] hover:bg-[#4a6180] text-white rounded-xl py-3 border border-[#4a6180]"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call
            </Button>
            <Button
              onClick={handleMessageClient}
              className="bg-[#3a506b] hover:bg-[#4a6180] text-white rounded-xl py-3 border border-[#4a6180]"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
          </div>

          {/* Open in Google Maps Button */}
          <Button
            onClick={handleOpenInGoogleMaps}
            variant="outline"
            className="w-full mt-3 bg-transparent border-[#71CBD1] text-[#71CBD1] hover:bg-[#71CBD1] hover:text-[#1a2a3a] rounded-xl py-3"
          >
            <Navigation className="w-4 h-4 mr-2" />
            Open in Google Maps
          </Button>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="p-4 space-y-3">
        {isNavigating ? (
          <Button
            onClick={handleArrive}
            disabled={isCalculatingRoute}
            className="w-full bg-[#71CBD1] hover:bg-[#5bb5c1] disabled:opacity-50 text-[#1a2a3a] font-semibold rounded-2xl py-4 text-lg shadow-lg"
          >
            <Car className="w-5 h-5 mr-2" />
            {isCalculatingRoute ? 'Calculating Route...' : 'I\'ve Arrived'}
          </Button>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-3"
          >
            <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 justify-center text-green-400 mb-2">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">Session Ready to Start</span>
              </div>
              <p className="text-gray-300 text-sm">
                You've arrived at {session.clientName}'s location
              </p>
            </div>
            
            <Button
              onClick={() => router.push(`/therapist/session/${session.id}`)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-4 text-lg font-semibold shadow-lg"
            >
              Start Massage Session
            </Button>
          </motion.div>
        )}

        {/* Emergency Button */}
        <Button
          variant="outline"
          className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-2xl py-3"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Emergency Assistance
        </Button>
      </div>
    </div>
  )
}
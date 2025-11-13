// app/therapist/navigation/page.tsx
"use client"

import { useState, useEffect } from "react"
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
  AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface Session {
  id: string
  clientName: string
  clientImage: string
  service: string
  duration: number
  price: number
  date: Date
  location: string
  status: 'in-progress'
  startTime: Date
  estimatedArrival: Date
}

export default function TherapistNavigation() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [currentLocation, setCurrentLocation] = useState({ lat: -26.1076, lng: 28.0567 })
  const [eta, setEta] = useState(25)
  const [distance, setDistance] = useState(8.2)
  const [isNavigating, setIsNavigating] = useState(true)

  useEffect(() => {
    // Get session data from storage
    const sessionData = sessionStorage.getItem('currentSession')
    if (sessionData) {
      setSession(JSON.parse(sessionData))
    } else {
      router.push('/therapist/dashboard')
    }

    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        }
      )

      // Watch position for real-time updates
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          // Simulate ETA and distance updates
          setEta(prev => Math.max(1, prev - 0.1))
          setDistance(prev => Math.max(0, prev - 0.05))
        },
        null,
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      )

      return () => navigator.geolocation.clearWatch(watchId)
    }
  }, [router])

  const handleArrive = () => {
    setIsNavigating(false)
    // Update session status
    if (session) {
      const updatedSession = { ...session, status: 'arrived' as const }
      sessionStorage.setItem('currentSession', JSON.stringify(updatedSession))
    }
  }

  const handleCallClient = () => {
    // Implement calling logic
    window.open('tel:+27123456789', '_blank')
  }

  const handleMessageClient = () => {
    // Implement messaging logic
    router.push('/therapist/inbox')
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading navigation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/therapist/dashboard')}
              className="text-white hover:bg-white/10"
            >
              <X size={24} />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Navigation</h1>
              <p className="text-gray-400 text-sm">En route to session</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">{eta} min</div>
            <div className="text-sm text-gray-400">{distance.toFixed(1)} km</div>
          </div>
        </div>
      </div>

      {/* Map Area - Simulated */}
      <div className="flex-1 relative h-96 bg-gray-800">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <p className="text-gray-300 text-lg font-semibold">Live Navigation Active</p>
            <p className="text-gray-400 text-sm">Following route to client</p>
            
            {/* Simulated Route Animation */}
            <div className="mt-6 w-64 h-2 bg-gray-600 rounded-full overflow-hidden mx-auto">
              <div 
                className="h-full bg-green-500 rounded-full animate-pulse"
                style={{ width: `${((8.2 - distance) / 8.2) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Current Location Marker */}
        <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
          <div className="text-xs text-white bg-black/50 px-2 py-1 rounded-full mt-2 whitespace-nowrap">
            You are here
          </div>
        </div>

        {/* Destination Marker */}
        <div className="absolute top-1/3 right-1/4 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-lg"></div>
          <div className="text-xs text-white bg-black/50 px-2 py-1 rounded-full mt-2 whitespace-nowrap">
            {session.clientName}
          </div>
        </div>
      </div>

      {/* Session Info Card */}
      <div className="bg-gray-800/50 backdrop-blur-sm m-4 rounded-2xl border border-gray-700 overflow-hidden">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">{session.clientName}</h3>
              <p className="text-gray-400 text-sm">{session.service}</p>
            </div>
            <div className="text-right">
              <div className="text-green-400 font-bold">R{session.price}</div>
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
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3"
            >
              <Phone className="w-4 h-4 mr-2" />
              Call
            </Button>
            <Button
              onClick={handleMessageClient}
              className="bg-gray-700 hover:bg-gray-600 text-white rounded-xl py-3"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="p-4 space-y-3">
        {isNavigating ? (
          <Button
            onClick={handleArrive}
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-2xl py-4 text-lg font-semibold shadow-lg"
          >
            <Car className="w-5 h-5 mr-2" />
            I've Arrived
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
          className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-2xl py-3"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Emergency Assistance
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="px-4 pb-4">
        <div className="bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${((8.2 - distance) / 8.2) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>You</span>
          <span>Client</span>
        </div>
      </div>
    </div>
  )
}
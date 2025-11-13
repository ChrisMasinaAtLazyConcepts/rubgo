// components/therapist-booking-request.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, 
  MapPin, 
  Clock, 
  Calendar, 
  User, 
  Navigation, 
  Phone, 
  MessageCircle, 
  Star, 
  Car,
  Wallet,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Route
} from "lucide-react"
import { Button } from "@/components/ui/button"
import dynamic from 'next/dynamic'

// Dynamically import the map component
const RouteMap = dynamic(() => import('@/components/route-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Loading Route...</p>
      </div>
    </div>
  )
})

interface Client {
  id: string
  name: string
  image: string
  rating: number
  reviews: number
  phone: string
  email: string
  joinDate: Date
}

interface BookingDetails {
  id: string
  client: Client
  service: string
  duration: number
  price: number
  date: Date
  location: string
  address: string
  coordinates: { lat: number; lng: number }
  specialRequests: string
  therapistNotes: string
  distance: number
  estimatedTravelTime: number
  serviceFee: number
  totalAmount: number
}

interface TherapistBookingRequestProps {
  isOpen: boolean
  onClose: () => void
  onAccept: (bookingId: string) => void
  onDecline: (bookingId: string) => void
  onMessage: (clientId: string) => void
  onCall: (phoneNumber: string) => void
  booking: BookingDetails | null
}

export function TherapistBookingRequest({
  isOpen,
  onClose,
  onAccept,
  onDecline,
  onMessage,
  onCall,
  booking
}: TherapistBookingRequestProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)
  const [showRoute, setShowRoute] = useState(true)
  const [currentLocation, setCurrentLocation] = useState({ lat: -26.1076, lng: 28.0567 })
  const [isLoading, setIsLoading] = useState(false)

  // Get therapist's current location
  useEffect(() => {
    if (isOpen && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log("Geolocation error:", error)
          // Use default Johannesburg coordinates as fallback
          setCurrentLocation({ lat: -26.1076, lng: 28.0567 })
        }
      )
    }
  }, [isOpen])

  const handleAccept = async () => {
    if (!booking) return
    
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      onAccept(booking.id)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDecline = async () => {
    if (!booking) return
    
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      onDecline(booking.id)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return `R${amount.toLocaleString()}`
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  if (!booking) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Main Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[90vh] overflow-hidden bg-[#1a2a3a] rounded-2xl shadow-2xl border border-[#2d3e50] flex flex-col"
          >
            {/* Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">New Booking Request</h2>
                    <p className="text-green-100 text-sm mt-1">
                      {formatDate(booking.date)} at {formatTime(booking.date)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-10 w-10 rounded-full hover:bg-white/20 text-white"
                >
                  <X size={20} />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Route Map */}
                {showRoute && (
                  <div className="bg-[#2d3e50] rounded-xl overflow-hidden border border-[#3a506b]">
                    <div className="p-4 border-b border-[#3a506b]">
                      <div className="flex items-center gap-2 text-green-400">
                        <Route className="w-5 h-5" />
                        <h3 className="font-semibold">Route to Client</h3>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        {booking.distance} km • {booking.estimatedTravelTime} min drive
                      </p>
                    </div>
                    <div className="h-48">
                      <RouteMap
                        origin={currentLocation}
                        destination={booking.coordinates}
                        height="100%"
                      />
                    </div>
                  </div>
                )}

                {/* Client Information */}
                <div className="bg-[#2d3e50] rounded-xl p-4 border border-[#3a506b]">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-green-400" />
                    Client Information
                  </h3>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {booking.client.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-white text-lg">{booking.client.name}</h4>
                        <div className="flex items-center gap-1 bg-yellow-900/50 px-2 py-1 rounded-full">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-yellow-400 text-xs font-medium">
                            {booking.client.rating} ({booking.client.reviews} reviews)
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm">
                        Member since {booking.client.joinDate.getFullYear()}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onCall(booking.client.phone)}
                          className="flex items-center gap-2 bg-[#3a506b] border-[#4a6180] text-white hover:bg-[#4a6180]"
                        >
                          <Phone className="w-4 h-4" />
                          Call
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onMessage(booking.client.id)}
                          className="flex items-center gap-2 bg-[#3a506b] border-[#4a6180] text-white hover:bg-[#4a6180]"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="bg-[#2d3e50] rounded-xl p-4 border border-[#3a506b]">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    Booking Details
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-green-400" />
                        <div>
                          <p className="text-gray-400">Duration</p>
                          <p className="text-white font-medium">{formatDuration(booking.duration)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-yellow-400" />
                        <div>
                          <p className="text-gray-400">Service Price</p>
                          <p className="text-white font-medium">{formatCurrency(booking.price)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-400" />
                        <div>
                          <p className="text-gray-400">Location</p>
                          <p className="text-white font-medium">{booking.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-purple-400" />
                        <div>
                          <p className="text-gray-400">Distance</p>
                          <p className="text-white font-medium">{booking.distance} km</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Special Requests */}
                  {booking.specialRequests && (
                    <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        <h4 className="font-semibold text-yellow-400 text-sm">Special Requests</h4>
                      </div>
                      <p className="text-yellow-300 text-sm">{booking.specialRequests}</p>
                    </div>
                  )}
                </div>

                {/* Pricing Breakdown */}
                <div className="bg-[#2d3e50] rounded-xl p-4 border border-[#3a506b]">
                  <h3 className="font-semibold text-white mb-3">Pricing Breakdown</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Service Fee</span>
                      <span className="text-white">{formatCurrency(booking.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Platform Fee</span>
                      <span className="text-white">{formatCurrency(booking.serviceFee)}</span>
                    </div>
                    <div className="border-t border-[#3a506b] pt-2 flex justify-between font-semibold">
                      <span className="text-white">You'll Receive</span>
                      <span className="text-green-400">{formatCurrency(booking.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Expandable Additional Information */}
                <div className="bg-[#2d3e50] rounded-xl border border-[#3a506b] overflow-hidden">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-[#3a506b] transition-colors"
                  >
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-400" />
                      Additional Information
                    </h3>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Navigation className="w-5 h-5 text-gray-400" />
                    </motion.div>
                  </button>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 border-t border-[#3a506b] space-y-3">
                          <div>
                            <h4 className="font-medium text-white text-sm mb-1">Full Address</h4>
                            <p className="text-gray-400 text-sm">{booking.address}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-white text-sm mb-1">Therapist Notes</h4>
                            <p className="text-gray-400 text-sm">
                              {booking.therapistNotes || "No additional notes provided."}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-green-400 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            <span>This client has completed 5+ sessions on MassageMe</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex-shrink-0 p-6 border-t border-[#2d3e50] bg-[#1a2a3a]">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleDecline}
                  disabled={isLoading}
                  className="flex-1 h-12 border-red-500 text-red-500 hover:bg-red-500 hover:text-white disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 mr-2" />
                      Decline
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleAccept}
                  disabled={isLoading}
                  className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-semibold disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Accept Booking
                    </>
                  )}
                </Button>
              </div>
              
              {/* Quick Actions */}
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRoute(!showRoute)}
                  className="flex-1 text-xs h-8 bg-[#2d3e50] border-[#3a506b] text-gray-300 hover:bg-[#3a506b]"
                >
                  <Route className="w-3 h-3 mr-1" />
                  {showRoute ? 'Hide' : 'Show'} Route
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMessage(booking.client.id)}
                  className="flex-1 text-xs h-8 bg-[#2d3e50] border-[#3a506b] text-gray-300 hover:bg-[#3a506b]"
                >
                  <MessageCircle className="w-3 h-3 mr-1" />
                  Ask Questions
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
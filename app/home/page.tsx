// app/home/page.tsx
"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Users, X, Clock, User, Heart, Briefcase, MessageCircle } from "lucide-react"
import { FilterOptions  } from "@/lib/types"
import { therapists, type Therapist, type MassageService } from "@/lib/massage-data"
import { MobileHeader } from "@/components/mobile-header"
import { BookingLoading } from "@/components/booking-loading"
import { BookingRequest } from "@/components/booking-request"

// Simple map fallback component
const MapFallback = () => (
  <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
      <p className="text-sm text-gray-600">Loading Map...</p>
    </div>
  </div>
)


export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedService, setSelectedService] = useState<any| null>(null)
  const [userLocation, setUserLocation] = useState({ lat: -26.1076, lng: 28.0567 })
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null)
  const [showBookingRequest, setShowBookingRequest] = useState(false)
  const [showBookingLoading, setShowBookingLoading] = useState(false)
  
  // Group Booking States
  const [showGroupFab, setShowGroupFab] = useState(true)
  const [showGroupMenu, setShowGroupMenu] = useState(false)
  const [selectedGroupType, setSelectedGroupType] = useState<string>("")
  const [participantCount, setParticipantCount] = useState(1)
  const [sessionDuration, setSessionDuration] = useState<number>(2)
  const [therapistSharing, setTherapistSharing] = useState<"shared" | "individual">("shared")
  const [isSearchingTherapists, setIsSearchingTherapists] = useState(false)
  const [foundTherapists, setFoundTherapists] = useState(0)
  const [requiredTherapists, setRequiredTherapists] = useState(0)
  const [canConfirmBooking, setCanConfirmBooking] = useState(false)

  const [filters, setFilters] = useState<FilterOptions>({
    type: "all",
    serviceType: "all",
    maxPrice: 1000,
    rating: 0,
    genderPreference: "any",
    availableNow: false,
  })

  // Group types with icons
  const groupTypes = [
    { 
      id: "couples", 
      name: "Couples Massage", 
      icon: Heart, 
      description: "Perfect for couples", 
      maxParticipants: 2 
    },
    { 
      id: "family", 
      name: "Family Session", 
      icon: Users, 
      description: "Relax with family", 
      maxParticipants: 6 
    },
    { 
      id: "friends", 
      name: "Friends Group", 
      icon: Users, 
      description: "Massage with friends", 
      maxParticipants: 8 
    },
    { 
      id: "corporate", 
      name: "Corporate Wellness", 
      icon: Briefcase, 
      description: "Team building session", 
      maxParticipants: 10 
    }
  ]

  // Session duration options
  const durationOptions = [
    { hours: 2, label: "2 hours", description: "Standard group session" },
    { hours: 3, label: "3 hours", description: "Extended relaxation" }
  ]

  // Therapist sharing options
  const sharingOptions = [
    { 
      id: "shared", 
      label: "Share Therapists", 
      description: "Therapists work with multiple people simultaneously",
      icon: Users,
      details: "More cost-effective, social experience"
    },
    { 
      id: "individual", 
      label: "Individual Therapists", 
      description: "Each person gets their own dedicated therapist",
      icon: User,
      details: "Personalized attention, higher cost"
    }
  ]

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log("Geolocation error:", error)
          setUserLocation({ lat: -26.1076, lng: 28.0567 })
        }
      )
    }
  }, [])

  // ... rest of your existing logic (filteredTherapists, handlers, etc.)

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Find Therapists" />
      
      <div className="flex flex-col h-[calc(100vh-140px)]">
        {/* Map Section */}
        <div className="flex-1 relative">
          <GoogleMap 
            center={userLocation}
            zoom={13}
            therapists={therapists}
            className="w-full h-full"
          />
          
          {/* Group Booking FAB */}
          {showGroupFab && (
            <button
              onClick={() => setShowGroupMenu(true)}
              className="absolute bottom-4 left-4 w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-30 hover:scale-105 active:scale-95 border-2 border-white"
            >
              <Users className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Therapists List */}
        <div className="h-48 bg-white border-t border-gray-200">
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Available Therapists Nearby</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {therapists.map(therapist => (
                <div 
                  key={therapist.id}
                  className="flex-shrink-0 w-64 bg-gray-50 rounded-lg p-3 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setSelectedTherapist(therapist)
                    setSelectedService(therapist.services?.[0] || null)
                    setShowBookingRequest(true)
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <img
                        src={therapist.image}
                        alt={therapist.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-medium text-sm text-gray-900">{therapist.name}</h4>
                        <p className="text-xs text-gray-600">{therapist.specialty}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">R{therapist.price}</p>
                      <p className="text-xs text-gray-600">{therapist.distance}km</p>
                    </div>
                  </div>
                  <div className="flex items-center mt-2">
                    <div className="flex text-yellow-400">
                      {"★".repeat(Math.floor(therapist.rating || 0))}
                      <span className="text-gray-300">
                        {"★".repeat(5 - Math.floor(therapist.rating || 0))}
                      </span>
                    </div>
                    <span className="text-xs text-gray-600 ml-1">
                      {therapist.rating || "No ratings"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BottomNav />

      {/* Group Booking Modal */}
      {showGroupMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 p-4">
          <div className="bg-white rounded-t-2xl w-full max-w-md max-h-[85vh] overflow-y-auto border border-gray-200 shadow-xl">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">New Group Session</h2>
                  <p className="text-green-100 text-sm mt-1">Book massage for multiple people</p>
                </div>
                <button
                  onClick={() => setShowGroupMenu(false)}
                  className="p-2 hover:bg-green-500 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 text-center">Group booking feature coming soon!</p>
              <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
                Notify Me
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Booking Modals */}
      {selectedTherapist && (
        <>
          <BookingRequest
            therapist={selectedTherapist}
            service={selectedService}
            isOpen={showBookingRequest}
            onClose={() => {
              setShowBookingRequest(false)
              setSelectedTherapist(null)
              setSelectedService(null)
            }}
            onConfirm={() => {
              setShowBookingRequest(false)
              setShowBookingLoading(true)
            }}
          />

          <BookingLoading
            therapist={selectedTherapist}
            service={selectedService}
            isOpen={showBookingLoading}
            onCancel={() => {
              setShowBookingLoading(false)
              setSelectedTherapist(null)
              setSelectedService(null)
            }}
            onContact={() => console.log("Contact therapist")}
            onManagePayment={() => router.push('/payment-methods')}
          />
        </>
      )}
    </div>
  )
}

// Pricing calculation function
function calculatePrice(basePrice: number) {
  const serviceFee = basePrice * 0.20
  const bookingFee = 15
  const subtotal = basePrice + serviceFee + bookingFee
  const vat = subtotal * 0.15
  
  return {
    base: Math.round(basePrice),
    serviceFee: Math.round(serviceFee),
    bookingFee: Math.round(bookingFee),
    vat: Math.round(vat),
    total: Math.round(subtotal + vat)
  }
}
"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { BottomNav } from "@/components/bottom-nav"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Bell, MapPin, Navigation } from "lucide-react"
import { TherapistCard } from "@/components/therapist-card"
import { FilterOptions  } from "@/lib/types"
import { therapists, type Therapist, type MassageService } from "@/lib/massage-data"
import { FilterSheet } from "@/components/filter-sheet"
import { MobileHeader } from "@/components/mobile-header"
import GoogleMap from "@/components/google-map"
import { BookingLoading } from "@/components/booking-loading"
import { BookingRequest } from "@/components/booking-request"

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedService, setSelectedService] = useState<MassageService| null>(null)
  const [userLocation, setUserLocation] = useState({ lat: -26.1076, lng: 28.0567 })
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null)
  const [showBookingRequest, setShowBookingRequest] = useState(false)
  const [showBookingLoading, setShowBookingLoading] = useState(false)

  const [filters, setFilters] = useState<FilterOptions>({
    type: "all", // Add this missing property
    serviceType: "all",
    maxPrice: 1000,
    rating: 0,
    genderPreference: "any",
    availableNow: false,
  })

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
          // Default to Johannesburg coordinates
          setUserLocation({ lat: -26.1076, lng: 28.0567 })
        }
      )
    }
  }, [])

  const filteredTherapists = useMemo(() => {
    return therapists.filter((therapist) => {
      // Search filter
      const matchesSearch =
        therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        therapist.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        therapist.services?.some(service => 
          service.name.toLowerCase().includes(searchQuery.toLowerCase())
        )

      // Service type filter
      const matchesService = filters.serviceType === "all" || 
        therapist.services?.some(service => service.type === filters.serviceType)

      // Price filter
      const matchesPrice = therapist.services?.some(service => 
        service.price <= filters.maxPrice
      )

      // Rating filter
      const matchesRating = therapist.rating? therapist.rating >= filters.rating : therapist.rating;

      // Gender preference filter
      const matchesGender = filters.genderPreference === "any" || 
        therapist.gender === filters.genderPreference

      // Availability filter
      const matchesAvailability = !filters.availableNow || therapist.availability

      return matchesSearch && matchesService && matchesPrice && 
             matchesRating && matchesGender && matchesAvailability
    })
  }, [searchQuery, filters])

  const calculateDistance = (therapist: Therapist) => {
    if (!userLocation) return null
    const R = 6371 // Earth's radius in km
    const dLat = (therapist.location.lat - userLocation.lat) * Math.PI / 180
    const dLon = (therapist.location.lng - userLocation.lng) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.lat * Math.PI / 180) * 
      Math.cos(therapist.location.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return (R * c).toFixed(1) // Distance in km
  }

  const handleBookTherapist = (therapist: Therapist, service: MassageService) => {
    router.push(`/booking/${therapist.id}?service=${service.id}`)
  }

  const estimatedPrice = selectedService ? 
    calculatePrice(selectedService.price, userLocation) : 
    null


   // Handle therapist card click
const handleTherapistClick = (therapist: Therapist, service: any) => {
  setSelectedTherapist(therapist)
  setSelectedService(service)
  setShowBookingRequest(true)
}

  // Handle booking confirmation
  const handleConfirmBooking = () => {
    setShowBookingRequest(false)
    setShowBookingLoading(true)
      if (!selectedTherapist || !selectedService) {
        console.error("Therapist or service not selected")
        return
      }
    
    // Simulate booking process
    setTimeout(() => {
      // In real app, this would navigate to booking success page
    handleBookNow()
    }, 5000) // 5 second delay to simulate waiting
  }

  const handleBookNow = () => {
  if (!selectedTherapist || !selectedService) {
    alert("Please select a therapist and service first")
    return
  }

  const params = new URLSearchParams({
    therapist: selectedTherapist.name,
    service: selectedService.name,
    price: selectedService.price.toString(),
    duration: `${selectedService.duration} minutes`,
  })

  console.log("Navigating to:", `/payment/processing?${params.toString()}`)
  router.push(`/payment/processing?${params.toString()}`)
}

  // Handle booking cancellation
  const handleCancelBooking = () => {
    setShowBookingRequest(false)
    setShowBookingLoading(false)
    setSelectedTherapist(null)
    setSelectedService(null)
  }
  
const handleManagePayment = () => {
  router.push('/payment-methods')
}

  // Handle contact therapist
  const handleContactTherapist = () => {
    // Implement contact logic (call/message)
    console.log("Contacting therapist:", selectedTherapist?.name)
  }

  return (

     <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Find Therapists" />
      
      <div className="flex flex-col h-[calc(100vh-140px)]">
        {/* Map Section - Takes 70% of screen */}
        <div className="flex-1 relative">
          <GoogleMap 
            center={userLocation}
            zoom={13}
            therapists={filteredTherapists}
            className="w-full h-full"
          />
          
          {/* Current Location Marker */}
          <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-lg">
            <p className="text-sm font-medium">Your Location</p>
          </div>
        </div>

        {/* Therapists List - Takes 30% of screen */}
         {/* Therapists List */}
        <div className="h-48 bg-white border-t">
          <div className="p-4">
            <h3 className="font-semibold mb-3">Available Therapists Nearby</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {therapists.map(therapist => (
                <div 
                  key={therapist.id}
                  className="flex-shrink-0 w-64 bg-gray-50 rounded-lg p-3 border cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleTherapistClick(therapist, therapist.services?.[0] || null)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <img
                        src={therapist.image}
                        alt={therapist.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-medium text-sm">{therapist.name}</h4>
                        <p className="text-xs text-muted-foreground">{therapist.specialty}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">R{therapist.price}</p>
                      <p className="text-xs text-muted-foreground">{therapist.distance}km</p>
                    </div>
                  </div>
                  <div className="flex items-center mt-2">
                    <div className="flex text-yellow-400">
                      {"★".repeat(Math.floor(therapist.rating || 0))}
                      <span className="text-gray-300">
                        {"★".repeat(5 - Math.floor(therapist.rating || 0))}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground ml-1">
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
       {/* Booking Request Modal */}
      {selectedTherapist && (
        <>
          <BookingRequest
            therapist={selectedTherapist}
            service={selectedService}
            isOpen={showBookingRequest}
            onClose={handleCancelBooking}
            onConfirm={handleConfirmBooking}
          />

         <BookingLoading
            therapist={selectedTherapist}
            service={selectedService}
            isOpen={showBookingLoading}
            onCancel={handleCancelBooking}
            onContact={handleContactTherapist}
            onManagePayment={handleManagePayment}
          />
        </>
      )}
    </div>
  )
}

// Uber-like pricing calculation
function calculatePrice(basePrice: number, userLocation: { lat: number; lng: number } | null) {
  const serviceFee = basePrice * 0.20 // 20% service fee
  const bookingFee = 15 // Fixed booking fee in Rands
  
  // Simulate surge pricing (1.0x to 2.5x)
  const surgeMultiplier = Math.random() * 1.5 + 1.0
  const surgedPrice = basePrice * surgeMultiplier
  
  const subtotal = surgedPrice + serviceFee + bookingFee
  const vat = subtotal * 0.15 // 15% VAT
  
  return {
    base: Math.round(basePrice),
    surged: Math.round(surgedPrice),
    serviceFee: Math.round(serviceFee),
    bookingFee: Math.round(bookingFee),
    vat: Math.round(vat),
    total: Math.round(subtotal + vat),
    surgeMultiplier: parseFloat(surgeMultiplier.toFixed(1))
  }
}
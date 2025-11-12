// app/home/page.tsx
"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Search, Bell, MapPin, Navigation, Users, Plus, X, Clock, User, Users as UsersIcon, Heart, Users as Family, Briefcase, MessageCircle } from "lucide-react"
import { FilterOptions  } from "@/lib/types"
import { therapists, type Therapist, type MassageService } from "@/lib/massage-data"
import { MobileHeader } from "@/components/mobile-header"
import { BookingLoading } from "@/components/booking-loading"
import { BookingRequest } from "@/components/booking-request"
import dynamic from 'next/dynamic'

// Dynamically import GoogleMap with no SSR
const GoogleMap = dynamic(() => import('@/components/google-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Loading Map...</p>
      </div>
    </div>
  )
})

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedService, setSelectedService] = useState<MassageService| null>(null)
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
      icon: Family, 
      description: "Relax with family", 
      maxParticipants: 6 
    },
    { 
      id: "friends", 
      name: "Friends Group", 
      icon: UsersIcon, 
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
      icon: UsersIcon,
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

  // Calculate required therapists based on sharing preference and participant count
  useEffect(() => {
    if (therapistSharing === "shared") {
      // 1 therapist can handle 2-3 people in shared session
      setRequiredTherapists(Math.ceil(participantCount / 3))
    } else {
      // Individual therapists - one per person
      setRequiredTherapists(participantCount)
    }
  }, [participantCount, therapistSharing])

  // Simulate therapist search process
  useEffect(() => {
    if (isSearchingTherapists) {
      setFoundTherapists(0)
      setCanConfirmBooking(false)

      const searchInterval = setInterval(() => {
        setFoundTherapists(prev => {
          const newCount = prev + 1
          if (newCount >= requiredTherapists) {
            setCanConfirmBooking(true)
            clearInterval(searchInterval)
          }
          return newCount
        })
      }, 1500) // Simulate finding a therapist every 1.5 seconds

      return () => clearInterval(searchInterval)
    }
  }, [isSearchingTherapists, requiredTherapists])

  const filteredTherapists = useMemo(() => {
    return therapists.filter((therapist) => {
      const matchesSearch =
        therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        therapist.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        therapist.services?.some(service => 
          service.name.toLowerCase().includes(searchQuery.toLowerCase())
        )

      const matchesService = filters.serviceType === "all" || 
        therapist.services?.some(service => service.type === filters.serviceType)

      const matchesPrice = therapist.services?.some(service => 
        service.price <= filters.maxPrice
      )

      const matchesRating = therapist.rating? therapist.rating >= filters.rating : therapist.rating;

      const matchesGender = filters.genderPreference === "any" || 
        therapist.gender === filters.genderPreference

      const matchesAvailability = !filters.availableNow || therapist.availability

      return matchesSearch && matchesService && matchesPrice && 
             matchesRating && matchesGender && matchesAvailability
    })
  }, [searchQuery, filters])

  // Calculate pricing based on group booking options
  const calculateGroupPricing = () => {
    const basePricePerPerson = 300 // Base price per person
    let total = basePricePerPerson * participantCount
    
    // Duration multiplier
    if (sessionDuration === 3) {
      total *= 1.4 // 40% more for 3-hour session
    }
    
    // Therapist sharing discount
    if (therapistSharing === "shared") {
      total *= 0.8 // 20% discount for shared therapists
    }
    
    const serviceFee = total * 0.20
    const bookingFee = 25 * requiredTherapists
    const subtotal = total + serviceFee + bookingFee
    const vat = subtotal * 0.15
    
    return {
      baseTotal: Math.round(total),
      serviceFee: Math.round(serviceFee),
      bookingFee: Math.round(bookingFee),
      vat: Math.round(vat),
      total: Math.round(subtotal + vat),
      perPerson: Math.round((subtotal + vat) / participantCount)
    }
  }

  const groupPricing = calculateGroupPricing()

  const calculateDistance = (therapist: Therapist) => {
    if (!userLocation) return null
    const R = 6371
    const dLat = (therapist.location.lat - userLocation.lat) * Math.PI / 180
    const dLon = (therapist.location.lng - userLocation.lng) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.lat * Math.PI / 180) * 
      Math.cos(therapist.location.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return (R * c).toFixed(1)
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
    
    setTimeout(() => {
      handleBookNow()
    }, 5000)
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
    console.log("Contacting therapist:", selectedTherapist?.name)
  }

  // Group Booking Handlers
  const handleGroupFabClick = () => {
    setShowGroupMenu(true)
    setShowGroupFab(false)
  }

  const handleGroupTypeSelect = (groupType: any) => {
    setSelectedGroupType(groupType.id)
    setParticipantCount(2) // Default to minimum for group
  }

  const handleStartGroupBooking = () => {
    if (selectedGroupType && participantCount >= 2) {
      setIsSearchingTherapists(true)
      setShowGroupMenu(false)
    }
  }

  const handleConfirmGroupBooking = () => {
    // Navigate to group booking confirmation with all parameters
    const bookingDetails = {
      type: selectedGroupType,
      participants: participantCount,
      therapists: requiredTherapists,
      duration: sessionDuration,
      sharing: therapistSharing,
      total: groupPricing.total,
      perPerson: groupPricing.perPerson,
      groupName: groupTypes.find(g => g.id === selectedGroupType)?.name || "Group Session"
    }
    
    // Store booking details in session storage for the confirmation page
    sessionStorage.setItem('groupBookingDetails', JSON.stringify(bookingDetails))
    
    router.push('/group-booking/confirmation')
  }

  const handleCancelGroupBooking = () => {
    setIsSearchingTherapists(false)
    setSelectedGroupType("")
    setParticipantCount(1)
    setSessionDuration(2)
    setTherapistSharing("shared")
    setFoundTherapists(0)
    setRequiredTherapists(0)
    setCanConfirmBooking(false)
    setShowGroupFab(true)
  }

  const getMaxParticipants = () => {
    const group = groupTypes.find(g => g.id === selectedGroupType)
    return group?.maxParticipants || 2
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Find Therapists" />
      
      <div className="flex flex-col h-[calc(100vh-140px)]">
        {/* Map Section */}
        <div className="flex-1 relative">
          <GoogleMap 
            center={userLocation}
            zoom={13}
            therapists={filteredTherapists}
            className="w-full h-full"
          />
          
          {/* Current Location Marker */}
          <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-900">Your Location</p>
          </div>

          {/* Group Booking FAB - Positioned in bottom left corner of map */}
          {showGroupFab && (
            <button
              onClick={handleGroupFabClick}
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

      {/* Group Booking Menu Modal */}
      {showGroupMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 p-4">
          <div className="bg-white rounded-t-2xl w-full max-w-md max-h-[85vh] overflow-y-auto border border-gray-200 shadow-xl">
            {/* Header with gradient matching the app theme */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">New Group Session</h2>
                  <p className="text-green-100 text-sm mt-1">Book massage for multiple people</p>
                </div>
                <button
                  onClick={() => {
                    setShowGroupMenu(false)
                    setShowGroupFab(true)
                  }}
                  className="p-2 hover:bg-green-500 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Group Type Selection */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Select Group Type</h3>
                {groupTypes.map((group) => {
                  const GroupIcon = group.icon
                  return (
                    <div
                      key={group.id}
                      onClick={() => handleGroupTypeSelect(group)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedGroupType === group.id
                          ? 'border-green-500 bg-green-50 shadow-sm'
                          : 'border-gray-200 hover:border-green-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          selectedGroupType === group.id
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <GroupIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{group.name}</h4>
                          <p className="text-sm text-gray-600">{group.description}</p>
                        </div>
                        {selectedGroupType === group.id && (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {selectedGroupType && (
                <>
                  {/* Participant Count */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900">Number of People</h3>
                      <span className="text-lg font-bold text-green-600">{participantCount}</span>
                    </div>
                    
                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <button
                        onClick={() => setParticipantCount(prev => Math.max(2, prev - 1))}
                        disabled={participantCount <= 2}
                        className="w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center disabled:opacity-30 hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-lg text-gray-700">-</span>
                      </button>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{participantCount}</div>
                        <div className="text-sm text-gray-600">Participants</div>
                      </div>
                      
                      <button
                        onClick={() => setParticipantCount(prev => Math.min(getMaxParticipants(), prev + 1))}
                        disabled={participantCount >= getMaxParticipants()}
                        className="w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center disabled:opacity-30 hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-lg text-gray-700">+</span>
                      </button>
                    </div>
                  </div>

                  {/* Session Duration */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Session Duration</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {durationOptions.map((duration) => (
                        <div
                          key={duration.hours}
                          onClick={() => setSessionDuration(duration.hours)}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all text-center ${
                            sessionDuration === duration.hours
                              ? 'border-green-500 bg-green-50 shadow-sm'
                              : 'border-gray-200 hover:border-green-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-green-600" />
                            <span className="font-semibold text-gray-900">{duration.label}</span>
                          </div>
                          <p className="text-xs text-gray-600">{duration.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Therapist Sharing Preference */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Therapist Arrangement</h3>
                    <div className="space-y-3">
                      {sharingOptions.map((option) => {
                        const IconComponent = option.icon
                        return (
                          <div
                            key={option.id}
                            onClick={() => setTherapistSharing(option.id as "shared" | "individual")}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              therapistSharing === option.id
                                ? 'border-green-500 bg-green-50 shadow-sm'
                                : 'border-gray-200 hover:border-green-300 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                therapistSharing === option.id
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                <IconComponent className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{option.label}</h4>
                                <p className="text-sm text-gray-600">{option.description}</p>
                                <p className="text-xs text-green-600 mt-1">{option.details}</p>
                              </div>
                              {therapistSharing === option.id && (
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full" />
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Pricing Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">Pricing Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Base ({participantCount} people)</span>
                        <span className="font-medium text-gray-900">R{groupPricing.baseTotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{sessionDuration} hour session</span>
                        <span className="font-medium text-gray-900">
                          {sessionDuration === 3 ? '+40%' : 'Standard'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {therapistSharing === 'shared' ? 'Shared therapists' : 'Individual therapists'}
                        </span>
                        <span className="font-medium text-gray-900">
                          {therapistSharing === 'shared' ? '-20%' : 'Full price'}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="text-gray-600">Service & booking fees</span>
                        <span className="font-medium text-gray-900">
                          R{groupPricing.serviceFee + groupPricing.bookingFee}
                        </span>
                      </div>
                      <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
                        <span className="text-gray-900">Total</span>
                        <span className="text-green-600">R{groupPricing.total}</span>
                      </div>
                      <div className="flex justify-between text-xs pt-1">
                        <span className="text-gray-500">Per person</span>
                        <span className="text-gray-500">R{groupPricing.perPerson}/person</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleStartGroupBooking}
                    className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg font-semibold text-white shadow-sm transition-all duration-200"
                  >
                    Start Group Booking
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Group Booking Search Progress */}
      {isSearchingTherapists && (
        <div className="fixed inset-0 bg-[#0B1F3D] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-gray-200 shadow-xl">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl">
              <h2 className="text-xl font-bold text-center">Finding Therapists</h2>
              <p className="text-green-100 text-sm text-center mt-1">We're searching for available therapists in your area</p>
            </div>

            <div className="p-6">
              {/* Infinity Loading Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-6 overflow-hidden">
                <div 
                  className="bg-green-600 h-2 rounded-full animate-pulse"
                  style={{
                    animation: 'loadingProgress 2s ease-in-out infinite'
                  }}
                />
              </div>

              <div className="text-center mb-6">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {foundTherapists} / {requiredTherapists}
                </div>
                <p className="text-gray-600">Therapists found for your group</p>
                <p className="text-sm text-gray-500 mt-2">
                  {therapistSharing === 'shared' 
                    ? 'Therapists who can handle multiple clients' 
                    : 'Dedicated therapists for each person'
                  }
                </p>
              </div>

              <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Group Type:</span>
                  <span className="font-semibold text-gray-900">
                    {groupTypes.find(g => g.id === selectedGroupType)?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Participants:</span>
                  <span className="font-semibold text-gray-900">{participantCount} people</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Session Duration:</span>
                  <span className="font-semibold text-gray-900">{sessionDuration} hours</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Therapist Arrangement:</span>
                  <span className="font-semibold text-gray-900">
                    {therapistSharing === 'shared' ? 'Shared' : 'Individual'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Therapists Needed:</span>
                  <span className="font-semibold text-gray-900">{requiredTherapists}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                  <span className="text-gray-600">Total Cost:</span>
                  <span className="font-bold text-green-600">R{groupPricing.total}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={handleCancelGroupBooking}
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmGroupBooking}
                  disabled={!canConfirmBooking}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold shadow-sm transition-all duration-200"
                >
                  Confirm Booking
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS for infinity loading animation */}
      <style jsx>{`
        @keyframes loadingProgress {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>

      {/* Existing Booking Modals */}
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
  const serviceFee = basePrice * 0.20
  const bookingFee = 15
  
  const surgeMultiplier = Math.random() * 1.5 + 1.0
  const surgedPrice = basePrice * surgeMultiplier
  
  const subtotal = surgedPrice + serviceFee + bookingFee
  const vat = subtotal * 0.15
  
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
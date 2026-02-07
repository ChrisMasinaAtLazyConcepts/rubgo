"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { Search, Bell, MapPin, Navigation, Plus, X, Clock, User, Users as UsersIcon, Heart, Users as Family, Briefcase, MessageCircle, ShoppingCart } from "lucide-react"
import { FilterOptions  } from "@/lib/types"
import { therapists, type Therapist, type MassageService } from "@/lib/massage-data"
import { MobileHeader } from "@/components/mobile-header"
import { BookingLoading } from "@/components/booking-loading"
import { BookingRequest } from "@/components/booking-request"
import dynamic from 'next/dynamic'
import { NoTherapistsAvailable } from "@/components/no-therapists-available"
import { AreaNotCovered } from "@/components/area-not-covered"

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

// Mock function to check if area is covered
const checkIfAreaIsCovered = (location: { lat: number; lng: number }) => {
  // In production, this would be an API call
  const coveredAreas = [
    { lat: -26.1076, lng: 28.0567, radius: 50 }, // Johannesburg
    { lat: -33.9249, lng: 18.4241, radius: 50 }, // Cape Town
    { lat: -29.8587, lng: 31.0218, radius: 40 }, // Durban
  ]
  
  // Check if location is within any covered area
  for (const area of coveredAreas) {
    const distance = getDistanceFromLatLonInKm(
      location.lat, 
      location.lng, 
      area.lat, 
      area.lng
    )
    if (distance <= area.radius) {
      return true
    }
  }
  return false
}

// Helper function to calculate distance between coordinates
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const distance = R * c // Distance in km
  return distance
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180)
}

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedService, setSelectedService] = useState<MassageService | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null)
  const [showBookingRequest, setShowBookingRequest] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [areaStatus, setAreaStatus] = useState<'covered' | 'not-covered' | 'loading'>('loading')
  
  // Group Booking States
  const [showGroupMenu, setShowGroupMenu] = useState(false)
  const [selectedGroupType, setSelectedGroupType] = useState<string>("")
  const [participantCount, setParticipantCount] = useState(1)
  const [sessionDuration, setSessionDuration] = useState<number>(2)
  const [therapistSharing, setTherapistSharing] = useState<"shared" | "individual">("shared")
  const [isSearchingTherapists, setIsSearchingTherapists] = useState(false)
  const [foundTherapists, setFoundTherapists] = useState(0)
  const [requiredTherapists, setRequiredTherapists] = useState(0)
  const [canConfirmBooking, setCanConfirmBooking] = useState(false)

  // Cart state - unified for both individual and group bookings
  const [cartItems, setCartItems] = useState<Array<{
    id: string;
    type: 'individual' | 'group';
    therapist?: Therapist;
    service?: MassageService;
    groupType?: string;
    participants?: number;
    duration?: number;
    total: number;
    name: string;
    description: string;
  }>>([])
  const [showCart, setShowCart] = useState(false)

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
    setIsLoading(true)
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(location)
          
          // Check if area is covered
          const isCovered = checkIfAreaIsCovered(location)
          setAreaStatus(isCovered ? 'covered' : 'not-covered')
          setIsLoading(false)
        },
        (error) => {
          console.log("Geolocation error:", error)
          // Default to Johannesburg if geolocation fails
          const defaultLocation = { lat: -26.1076, lng: 28.0567 }
          setUserLocation(defaultLocation)
          setAreaStatus('covered') // Default area is covered
          setIsLoading(false)
        }
      )
    } else {
      // Browser doesn't support geolocation
      const defaultLocation = { lat: -26.1076, lng: 28.0567 }
      setUserLocation(defaultLocation)
      setAreaStatus('covered')
      setIsLoading(false)
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
      }, 1500)

      return () => clearInterval(searchInterval)
    }
  }, [isSearchingTherapists, requiredTherapists])

  const filteredTherapists = useMemo(() => {
    if (!userLocation) return []
    
    // Filter therapists by distance from user location (within 50km)
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

      const matchesRating = therapist.rating ? therapist.rating >= filters.rating : true

      const matchesGender = filters.genderPreference === "any" || 
        therapist.gender === filters.genderPreference

      const matchesAvailability = !filters.availableNow || therapist.availability

      // Calculate distance from user
      const distance = getDistanceFromLatLonInKm(
        userLocation.lat,
        userLocation.lng,
        therapist.location.lat,
        therapist.location.lng
      )
      
      const withinRange = distance <= 50 // 50km radius

      return matchesSearch && matchesService && matchesPrice && 
             matchesRating && matchesGender && matchesAvailability &&
             withinRange
    })
  }, [searchQuery, filters, userLocation])

  // Calculate pricing based on group booking options
  const calculateGroupPricing = () => {
    const basePricePerPerson = 300
    let total = basePricePerPerson * participantCount
    
    if (sessionDuration === 3) {
      total *= 1.4
    }
    
    if (therapistSharing === "shared") {
      total *= 0.8
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

  // Calculate individual therapist pricing
  const calculateIndividualPricing = (therapist: Therapist, service: MassageService) => {
    const basePrice = service.price
    const serviceFee = basePrice * 0.20
    const bookingFee = 15
    
    const surgeMultiplier = Math.random() * 0.3 + 1.0
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

  // Handle therapist card click
  const handleTherapistClick = (therapist: Therapist, service: any) => {
    setSelectedTherapist(therapist)
    setSelectedService(service)
    setShowBookingRequest(true)
  }

  // Handle adding individual therapist to cart
  const handleAddToCart = (therapist: Therapist, service: MassageService) => {
    const pricing = calculateIndividualPricing(therapist, service)
    
    const cartItem = {
      id: `individual-${therapist.id}-${service.id}-${Date.now()}`,
      type: 'individual' as const,
      therapist,
      service,
      total: pricing.total,
      name: `${therapist.name} - ${service.name}`,
      description: `${service.duration} min • ${therapist.specialty}`
    }
    
    setCartItems(prev => [...prev, cartItem])
    setShowBookingRequest(false)
    setSelectedTherapist(null)
    setSelectedService(null)
  }

  // Handle booking cancellation
  const handleCancelBooking = () => {
    setShowBookingRequest(false)
    setSelectedTherapist(null)
    setSelectedService(null)
  }

  // Group Booking Handlers
  const handleGroupTypeSelect = (groupType: any) => {
    setSelectedGroupType(groupType.id)
    setParticipantCount(2)
  }

  const handleAddGroupToCart = () => {
    if (selectedGroupType && participantCount >= 2) {
      const groupType = groupTypes.find(g => g.id === selectedGroupType)
      const cartItem = {
        id: `group-${selectedGroupType}-${Date.now()}`,
        type: 'group' as const,
        groupType: selectedGroupType,
        participants: participantCount,
        duration: sessionDuration,
        total: groupPricing.total,
        name: groupType?.name || "Group Session",
        description: `${participantCount} people • ${sessionDuration} hours • ${therapistSharing === 'shared' ? 'Shared therapists' : 'Individual therapists'}`
      }
      
      setCartItems(prev => [...prev, cartItem])
      setShowGroupMenu(false)
      setSelectedGroupType("")
      setParticipantCount(1)
      setSessionDuration(2)
      setTherapistSharing("shared")
    }
  }

  const handleConfirmGroupBooking = () => {
    setIsSearchingTherapists(false)
    
    setTimeout(() => {
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
      
      sessionStorage.setItem('groupBookingDetails', JSON.stringify(bookingDetails))
      router.push('/group-booking/confirmation')
    }, 3000)
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
  }

  const getMaxParticipants = () => {
    const group = groupTypes.find(g => g.id === selectedGroupType)
    return group?.maxParticipants || 2
  }

  // Handle cart click - now only opens/closes cart menu
  const handleCartClick = () => {
    setShowCart(!showCart)
  }

  // Handle group booking FAB click
  const handleGroupBookingClick = () => {
    setShowGroupMenu(true)
  }

  // Remove item from cart
  const handleRemoveFromCart = (index: number) => {
    setCartItems(prev => prev.filter((_, i) => i !== index))
  }

  // Clear entire cart
  const handleClearCart = () => {
    setCartItems([])
    setShowCart(false)
  }

  // Proceed to checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) return
    
    // Store cart items in session storage for checkout page
    sessionStorage.setItem('cartItems', JSON.stringify(cartItems))
    setShowCart(false)
    router.push('/checkout')
  }

  // Calculate cart total
  const cartTotal = cartItems.reduce((total, item) => total + item.total, 0)
  const totalItems = cartItems.reduce((total, item) => 
    total + (item.type === 'group' ? (item.participants || 1) : 1), 0
  )

  // Handle notify me for no therapists
  const handleNotifyMe = () => {
    console.log("User wants to be notified when therapists are available")
    // In production, this would call an API to add user to notification list
    alert("You'll be notified when therapists become available in your area!")
  }

  // Handle area subscription
  const handleAreaSubscribe = () => {
    console.log("User subscribed to area launch notifications")
    // In production, this would call an API
    alert("Thank you! We'll notify you when we launch in your area.")
  }

  // Handle check other areas
  const handleCheckOtherAreas = () => {
    router.push('/areas')
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking service availability in your area...</p>
        </div>
      </div>
    )
  }

  // Show "Area Not Covered" component
  //if (areaStatus === 'not-covered' && filteredTherapists.length === 0) {
  //  return (
  //    <>
  //      <MobileHeader title="Service Area" />
  //      <AreaNotCovered 
  //        onSubscribe={handleAreaSubscribe}
  //        onCheckOtherAreas={handleCheckOtherAreas}
  //        userLocation="Your Location"
  //      />
  //      <BottomNav />
  //    </>
  //  )
  //}

  // Show "No Therapists Available" component
  if (areaStatus === 'covered' && filteredTherapists.length === 0) {
    return (
      <>
        <MobileHeader title="No Therapists Available" />
        <NoTherapistsAvailable 
          onNotifyMe={handleNotifyMe}
          estimatedWaitTime="1-2 hours"
          currentLocation="your area"
        />
        <BottomNav />
      </>
    )
  }

  // Normal home page with therapists available
  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Find Therapists" />
      
      <div className="flex flex-col h-[calc(100vh-140px)]">
        {/* Map Section */}
        <div className="flex-1 relative">
          <GoogleMap 
            center={userLocation || { lat: -26.1076, lng: 28.0567 }}
            zoom={13}
            therapists={filteredTherapists}
            className="w-full h-full"
          />
          
          {/* Current Location Marker */}
          <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-900">Your Location</p>
          </div>

          {/* Green Cart FAB - Positioned in top right corner */}
          <button
            onClick={handleCartClick}
            className="absolute top-4 right-4 w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-30 hover:scale-105 active:scale-95 border-2 border-white"
          >
            <div className="relative">
              <ShoppingCart className="w-6 h-6" />
              {cartItems.length > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {cartItems.length}
                </div>
              )}
            </div>
          </button>

          {/* Group Booking FAB - Positioned below cart FAB */}
          <button
            onClick={handleGroupBookingClick}
            className="absolute top-20 right-4 w-14 h-14 bg-[#71CBD1] hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-30 hover:scale-105 active:scale-95 border-2 border-white"
          >
            <Users className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Therapists List */}
        <div className="h-48 bg-white border-t border-gray-200">
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-900">Available Therapists Nearby</h3>
              <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {filteredTherapists.length} available
              </span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {filteredTherapists.map(therapist => (
                <div 
                  key={therapist.id}
                  className="flex-shrink-0 w-72 bg-white rounded-xl p-4 border border-gray-200 cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-green-200"
                  onClick={() => handleTherapistClick(therapist, therapist.services?.[0] || null)}
                >
                  {/* Header Section */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={therapist.image || "/default-therapist.jpg"}
                        alt={therapist.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-green-200"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-sm text-gray-900 truncate">{therapist.name}</h4>
                        <p className="text-xs text-gray-600 truncate">{therapist.specialty}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 text-sm">R{therapist.price}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{therapist.distance}km away</p>
                    </div>
                  </div>

                  {/* Rating Section */}
                  <div className="flex items-center mb-3">
                    <div className="flex text-yellow-400 text-sm">
                      {"★".repeat(Math.floor(therapist.rating || 0))}
                      <span className="text-gray-300">
                        {"★".repeat(5 - Math.floor(therapist.rating || 0))}
                      </span>
                    </div>
                    <span className="text-xs text-gray-600 ml-2">
                      {therapist.rating ? `(${therapist.reviews || 0})` : "No ratings"}
                    </span>
                  </div>

                  {/* Languages Section */}
                  {therapist.languages && therapist.languages.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center gap-1 mb-2">
                        <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.398.559.813.806 1.243a1 1 0 11-1.72.974 14.93 14.93 0 01-.806-1.243 18.87 18.87 0 01-1.724-4.78H4a1 1 0 110-2h3V3a1 1 0 011-1zm-4 8a1 1 0 011 1v.041a14.87 14.87 0 01-1.299 2.583A1 1 0 01.5 13.5a1 1 0 01.701-.876A12.87 12.87 0 002 11.041V11a1 1 0 011-1zm12 0a1 1 0 011 1v.041a14.87 14.87 0 01-1.299 2.583A1 1 0 0116.5 13.5a1 1 0 01.701-.876A12.87 12.87 0 0018 11.041V11a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-medium text-gray-700">Languages</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {therapist.languages.slice(0, 3).map((language, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                          >
                            {language}
                          </span>
                        ))}
                        {therapist.languages.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                            +{therapist.languages.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Additional Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span>{therapist.responseTime || 15}min response</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                      <span>{therapist.experience || 2}+ years</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BottomNav />

    
      {/* Cart Summary Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-white  flex items-end justify-center z-50 p-4">
          <div className="bg-white rounded-t-2xl w-full max-w-md h-full overflow-y-auto border border-gray-200 shadow-xl">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Your Cart</h2>
                  <p className="text-green-100 text-sm mt-1">{totalItems} massage orders</p>
                </div>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 hover:bg-green-500 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Cart Items */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {cartItems.map((item, index) => (
                  <div key={item.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                        {item.type === 'group' && (
                          <p className="text-xs text-green-600 mt-1">
                            {item.participants} {item.participants === 1 ? 'person' : 'people'}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(index)}
                        className="text-red-500 hover:text-red-700 transition-colors ml-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total</span>
                      <span className="font-bold text-green-600">R{item.total}</span>
                    </div>
                  </div>
                ))}
              </div>

              {cartItems.length === 0 && (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Your cart is empty</p>
                  <Button
                    onClick={() => {
                      setShowCart(false)
                      setShowGroupMenu(true)
                    }}
                    className="mt-3 bg-green-600 hover:bg-green-700"
                  >
                    Start Group Booking
                  </Button>
                </div>
              )}

              {/* Cart Total */}
              {cartItems.length > 0 && (
                <>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-green-600">R{cartTotal}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleClearCart}
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Clear Cart
                    </Button>
                    <Button
                      onClick={handleCheckout}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
                    >
                      Checkout (R{cartTotal})
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Updated BookingRequest with Add to Cart */}
      {selectedTherapist && selectedService && (
        <BookingRequest
          therapist={selectedTherapist}
          service={selectedService}
          isOpen={showBookingRequest}
          onClose={handleCancelBooking}
          onConfirm={() => handleAddToCart(selectedTherapist, selectedService)}
          confirmText="Add to Cart"
        />
      )}

      {/* Group Booking Menu Modal */}
      {showGroupMenu && (
        <div className="fixed inset-0 bg-white h-full flex items-end justify-center z-50 p-4">
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
                    onClick={handleAddGroupToCart}
                    className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg font-semibold text-white shadow-sm transition-all duration-200"
                  >
                    Add to Cart ({participantCount})
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Group Booking Search Progress */}
      {isSearchingTherapists && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md border border-gray-200 shadow-xl">
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl">
              <h2 className="text-xl font-bold text-center">Finding Therapists</h2>
              <p className="text-green-100 text-sm text-center mt-1">We're searching for available therapists in your area</p>
            </div>

            <div className="p-6">
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
    </div>
  )
}
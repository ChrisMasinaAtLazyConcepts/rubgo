"use client"

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Phone, MessageCircle, Navigation, MapPin, Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Booking } from '@/lib/types'

interface TherapistEnRouteProps {
  bookingId: string 
  onClose: () => void
  onTherapistArrived: () => void
}

// Add Google Maps types
declare global {
  interface Window {
    google: any;
  }
}

interface Location {
  lat: number;
  lng: number;
}

// Helper function to fetch booking by ID
async function fetchBookingById(bookingId: string): Promise<Booking> {
  try {
    const response = await fetch(`/api/bookings/${bookingId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to fetch booking: ${response.statusText}`);
    }

    const bookingData: Booking = await response.json();
    
    // Ensure booking has required structure
    if (!bookingData.id || !bookingData.therapist || !bookingData.service) {
      throw new Error('Invalid booking data structure');
    }

    return bookingData;
  } catch (error) {
    console.error('Error fetching booking:', error);
    throw error;
  }
}

export default function TherapistEnRoute({ bookingId, onClose, onTherapistArrived }: TherapistEnRouteProps) {
  const [booking, setBooking] = useState<Booking | null>(null)
  const [therapistLocation, setTherapistLocation] = useState<Location | null>(null)
  const [estimatedArrival, setEstimatedArrival] = useState(5) // minutes
  const [showNotification, setShowNotification] = useState(true)
  const [hasPlayedSound, setHasPlayedSound] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Google Maps refs and state
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userMarker, setUserMarker] = useState<google.maps.Marker | null>(null);
  const [vehicleMarker, setVehicleMarker] = useState<google.maps.Marker | null>(null);

  // Fetch booking data on component mount
  useEffect(() => {
    const loadBookingData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await fetchBookingById(bookingId);
        setBooking(data);
        
        // Set initial therapist location
        if (data.therapist?.location) {
          setTherapistLocation(data.therapist.location);
        }
        
        // Show notification for new bookings
        setShowNotification(true);
        
      } catch (error) {
        console.error('Error loading booking data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load booking data');
      } finally {
        setIsLoading(false);
      }
    };

    loadBookingData();
  }, [bookingId]);

  // Helper function to calculate location 2km away
  const calculateLocation2kmAway = (userLocation: Location): Location => {
    const latOffset = 0.018; // ~2km in latitude
    const lngOffset = 0.018; // ~2km in longitude
    
    return {
      lat: userLocation.lat + latOffset,
      lng: userLocation.lng + lngOffset
    };
  };

  // Function to animate vehicle movement
  const animateVehicle = (marker: google.maps.Marker, destination: Location, map: google.maps.Map) => {
    const startPos = marker.getPosition();
    if (!startPos || !booking || !booking.userLocation) return;

    const steps = 100;
    let step = 0;

    const animate = () => {
      if (step <= steps) {
        const newLat = startPos.lat() + (destination.lat - startPos.lat()) * (step / steps);
        const newLng = startPos.lng() + (destination.lng - startPos.lng()) * (step / steps);
        
        marker.setPosition(new google.maps.LatLng(newLat, newLng));
        step++;
        setTimeout(animate, 3000);
      }
    };
    
    animate();
  };

  // Initialize Google Maps when booking data is loaded
  useEffect(() => {
    if (!booking || !booking.userLocation || !mapRef.current || !window.google) return;

    const userLocation = booking.userLocation;
    
    const mapInstance = new google.maps.Map(mapRef.current, {
      zoom: 14,
      center: userLocation,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ],
      disableDefaultUI: true,
      zoomControl: true,
    });

    setMap(mapInstance);

    // Add user location marker
    const userMarkerInstance = new google.maps.Marker({
      position: userLocation,
      map: mapInstance,
      title: 'Your Location',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#EF4444',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2,
      }
    });

    setUserMarker(userMarkerInstance);

    // Calculate therapist location 2km away
    const therapistStartLocation = calculateLocation2kmAway(userLocation);
    
    // Add vehicle marker for therapist
    const vehicleMarkerInstance = new google.maps.Marker({
      position: therapistStartLocation,
      map: mapInstance,
      title: `${booking.therapist.name}'s Vehicle`,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#3B82F6',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 3,
      }
    });

    setVehicleMarker(vehicleMarkerInstance);

    // Add moving animation for vehicle
    animateVehicle(vehicleMarkerInstance, userLocation, mapInstance);

  }, [booking]);

  // Calm arrival sound
  const playArrivalSound = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.src = '/assets/new.mp3'; 
      audioRef.current.volume = 0.4
    }
    
    if (!hasPlayedSound) {
      audioRef.current.play().catch(() => {
        // Fallback: Create a simple tone using Web Audio API
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.value = 440
        oscillator.type = 'sine'
        gainNode.gain.value = 0.1
        
        oscillator.start()
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 2)
        oscillator.stop(audioContext.currentTime + 2)
        
        setHasPlayedSound(true)
      })
      setHasPlayedSound(true)
    }
  }

  const simulateTherapistMovement = () => {
    if (!booking || !booking.therapist?.location || !booking.userLocation) return;

    const startLat = booking.therapist.location.lat
    const startLng = booking.therapist.location.lng
    const userLoc = booking.userLocation
    const endLat = userLoc.lat
    const endLng = userLoc.lng

    let progress = 0
    let arrivalTime = 5 // minutes

    // Show push notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${booking.therapist.name} is on the way!`, {
        body: `Estimated arrival: ${arrivalTime} minutes`,
        icon: booking.therapist.image,
        tag: 'therapist-en-route'
      })
    }

    // Play arrival sound
    playArrivalSound()

    simulationIntervalRef.current = setInterval(() => {
      progress = Math.min(progress + 0.02, 1) // Complete in ~50 seconds
      arrivalTime = Math.max(0, 5 - Math.floor(progress * 5))

      const newLat = startLat + (endLat - startLat) * progress
      const newLng = startLng + (endLng - startLng) * progress

      setTherapistLocation({ lat: newLat, lng: newLng })
      setEstimatedArrival(arrivalTime)

      // Update vehicle marker position if it exists
      if (vehicleMarker) {
        vehicleMarker.setPosition(new window.google.maps.LatLng(newLat, newLng));
      }

      if (progress >= 1) {
        if (simulationIntervalRef.current) {
          clearInterval(simulationIntervalRef.current)
        }
        onTherapistArrived()
      }
    }, 1000)
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  // Start simulation when booking data is loaded
  useEffect(() => {
    if (!booking) return;

    requestNotificationPermission()
    simulateTherapistMovement()

    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current)
      }
    }
  }, [booking])

  const handleClose = () => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current)
    }
    onClose()
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !booking) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Booking</h2>
          <p className="text-gray-600 mb-6">{error || 'Booking not found'}</p>
          <Button
            onClick={onClose}
            className="bg-green-600 hover:bg-green-700"
          >
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Push Notification Style Alert */}
      <AnimatePresence>
        {showNotification && booking && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.8 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-60 w-11/12 max-w-md"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={booking.therapist.image}
                    alt={booking.therapist.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-green-500"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-6 h-6 flex items-center justify-center">
                    <Bell className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{booking.therapist.name} is on the way</h3>
                  <p className="text-sm text-gray-600">Estimated arrival: {estimatedArrival} min</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNotification(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={16} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Screen En-Route View */}
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-6 border-b z-10">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-bold text-2xl text-gray-900"
              >
                {booking.therapist.name} is on the way
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg text-gray-600 mt-1"
              >
                Estimated arrival: <span className="font-semibold text-green-600">{estimatedArrival} minute{estimatedArrival !== 1 ? 's' : ''}</span>
              </motion.p>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-gray-500 mt-1"
              >
                Service: {booking.service.name} • {booking.duration || booking.service.duration} minutes
              </motion.p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-4 right-4 z-10"
              >
                <X size={24} />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full">
                <Phone className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full">
                <MessageCircle className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative bg-gray-100">
          <div className="absolute inset-0">
            <div 
              ref={mapRef} 
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Bottom Panel */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-6 z-10">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={booking.therapist.image}
              alt={booking.therapist.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-green-500 shadow-lg"
            />
            <div className="flex-1">
              <h3 className="font-bold text-xl text-gray-900">{booking.therapist.name}</h3>
              <div className="flex items-center gap-2 mt-2">
                <Navigation className="w-5 h-5 text-green-500 animate-pulse" />
                <span className="text-sm font-medium text-gray-700">
                  {estimatedArrival > 0 
                    ? `2km away • Arriving in ${estimatedArrival} minute${estimatedArrival !== 1 ? 's' : ''}`
                    : 'Almost there...'
                  }
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{booking.address || 'Your Location'}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-3 py-4 h-auto rounded-xl border-2"
              size="lg"
            >
              <Phone className="w-5 h-5" />
              <span className="font-semibold">Call</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-3 py-4 h-auto rounded-xl border-2"
              size="lg"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">Message</span>
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>On the way</span>
              <span>Almost there</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${(1 - estimatedArrival / 5) * 100}%` }}
                transition={{ duration: 1 }}
                className="bg-green-500 h-2 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
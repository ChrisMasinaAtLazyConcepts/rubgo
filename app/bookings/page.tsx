"use client"

import { BottomNav } from "@/components/bottom-nav"
import { MobileHeader } from "@/components/mobile-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Clock, User, ChevronRight, Phone, MessageCircle, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Navigation, CheckCircle, X } from "lucide-react"

interface Booking {
  id: string
  therapist: {
    id: string
    name: string
    image: string
    rating: number
  }
  service: {
    name: string
    duration: number
    price: number
  }
  date: string
  startTime: string
  endTime: string
  status: 'upcoming' | 'in-progress' | 'completed' | 'therapist-en-route'
  address: string
}

interface BookingViewModalProps {
  bookingId: string
  booking: Booking
  onClose: () => void
}

function BookingViewModal({ bookingId, booking, onClose }: BookingViewModalProps) {
  const [currentView, setCurrentView] = useState<'details' | 'review'>('details')
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [therapistLocation, setTherapistLocation] = useState({ lat: -26.2041, lng: 28.0473 })

  useEffect(() => {
    if (booking.status === 'therapist-en-route') {
      const interval = setInterval(() => {
        setTherapistLocation(prev => ({
          lat: prev.lat + (Math.random() - 0.5) * 0.001,
          lng: prev.lng + (Math.random() - 0.5) * 0.001
        }))
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [booking.status])

  const renderStars = (count: number, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => setRating(star) : undefined}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          >
            <Star
              className={`w-6 h-6 ${
                star <= count 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  const views = {
    'in-progress': (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-blue/20 text-white hover:bg-white/30"
        >
          <X size={24} />
        </Button>
        <div className="flex-1 relative">
          {/* Replace with actual GIF */}
          <div className="w-full h-full bg-white flex items-center justify-center">
            <div className="text-white text-center">
              <img 
                  src="./assets/splash.gif" 
                  alt="Loading..." 
                  className="mx-auto w-full h-full"
                />
              <p className="text-xl ">Massage in Progress</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="text-center ">
              <h2 className="text-2xl font-bold mb-2 text-green/40">Session in Progress</h2>
              <p className="text-lg mb-4">Your massage session with {booking.therapist.name} is ongoing</p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" className="bg-white/20 border-white/30">
                  <Clock className="w-4 h-4 mr-2" />
                  Time Remaining: 45min
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),

    'upcoming': (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-10"
        >
          <X size={24} />
        </Button>
        <div className="flex-1 relative flex items-center justify-center">
          {/* Replace with actual GIF */}
          <div className="max-w-md w-full text-center">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-xl">Upcoming Booking</p>
          </div>
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={booking.therapist.image}
                  alt={booking.therapist.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-lg">{booking.therapist.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{booking.therapist.rating}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span>{new Date(booking.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span>{booking.startTime} - {booking.endTime}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <span className="text-sm">{booking.address}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),

    'completed': (
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
        <div className="max-w-md mx-auto py-8 px-6">
          {currentView === 'details' ? (
            <>
              <div className="text-center mb-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">Session Completed</h1>
                <p className="text-gray-600">How was your experience with {booking.therapist.name}?</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={booking.therapist.image}
                    alt={booking.therapist.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{booking.therapist.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{booking.therapist.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service</span>
                    <span>{booking.service.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date</span>
                    <span>{new Date(booking.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time</span>
                    <span>{booking.startTime} - {booking.endTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span>{booking.service.duration} minutes</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => setCurrentView('review')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Rate & Review Session
              </Button>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold mb-2">Rate Your Session</h1>
                <p className="text-gray-600">Share your experience with {booking.therapist.name}</p>
              </div>

              <div className="bg-white border rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={booking.therapist.image}
                    alt={booking.therapist.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{booking.therapist.name}</h3>
                    <p className="text-sm text-gray-600">{booking.service.name}</p>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <p className="text-lg font-medium mb-4">How would you rate your session?</p>
                  {renderStars(rating, true)}
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Write a review (optional)
                  </label>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Share details about your experience..."
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setCurrentView('details')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={() => {
                    console.log({ rating, review, bookingId })
                    setCurrentView('details')
                  }}
                  disabled={rating === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Submit Review
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    ),

    'therapist-en-route': (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-10"
        >
          <X size={24} />
        </Button>
        <div className="flex-1 relative bg-gray-100">
          <div className="absolute inset-0 bg-blue-50">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100">
              <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-400 transform -translate-y-1/2"></div>
              <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-gray-400 transform -translate-x-1/2"></div>
              
              <motion.div
                animate={{
                  left: `${50 + (therapistLocation.lng * 100)}%`,
                  top: `${50 + (therapistLocation.lat * 100)}%`
                }}
                transition={{ type: "spring", damping: 20 }}
                className="absolute w-12 h-12 -ml-6 -mt-6"
              >
                <div className="relative">
                  <img
                    src={booking.therapist.image}
                    alt={booking.therapist.name}
                    className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
                  />
                  <div className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 flex items-center justify-center">
                    <Navigation className="w-3 h-3 text-white" />
                  </div>
                </div>
              </motion.div>

              <div className="absolute top-1/2 left-1/2 w-8 h-8 -ml-4 -mt-4">
                <MapPin className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>

          <div className="absolute top-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-bold text-lg">{booking.therapist.name} is on the way</h1>
                <p className="text-sm text-gray-600">Estimated arrival: 15 minutes</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-6">
            <div className="flex items-center gap-4 mb-4">
              <img
                src={booking.therapist.image}
                alt={booking.therapist.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{booking.therapist.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Navigation className="w-4 h-4 text-green-500" />
                  <span>Moving towards your location</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Call
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Message
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {views[booking.status]}
      </motion.div>
    </AnimatePresence>
  )
}

export default function BookingsPage() {
  const router = useRouter()
  const [activeBooking, setActiveBooking] = useState<{id: string, booking: Booking} | null>(null)

  const bookings: Booking[] = [
    {
      id: "1",
      therapist: {
        id: "1",
        name: "James Mbeki",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        rating: 4.7
      },
      service: {
        name: "Swedish Massage",
        duration: 90,
        price: 650
      },
      date: "2024-01-16",
      startTime: "16:30",
      endTime: "18:00",
      status: "in-progress",
      address: "Your Office - Sandton"
    },
    {
      id: "2",
      therapist: {
        id: "2",
        name: "Priya Singh",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        rating: 4.8
      },
      service: {
        name: "Aromatherapy Massage",
        duration: 60,
        price: 500
      },
      date: "2024-01-18",
      startTime: "11:00",
      endTime: "12:00",
      status: "upcoming",
      address: "Your Location - Home"
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500"
      case "in-progress":
        return "bg-blue-500"
      case "upcoming":
        return "bg-orange-500"
      case "completed":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmed"
      case "in-progress":
        return "In Progress"
      case "upcoming":
        return "Upcoming"
      case "completed":
        return "Completed"
      default:
        return status
    }
  }

  const handleContactTherapist = (therapistName: string) => {
    console.log(`Contacting ${therapistName}`)
    alert(`Would contact ${therapistName} via chat/call`)
  }

  const handleViewDetails = (bookingId: string) => {
    router.push(`/bookings/${bookingId}`)
  }

  const handleView = (bookingId: string, booking: Booking) => {
    setActiveBooking({ id: bookingId, booking })
  }

  const handleCloseView = () => {
    setActiveBooking(null)
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="My Massage Bookings" />

      <div className="p-4 space-y-4">
        {bookings.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                <Calendar className="h-10 w-10 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-medium">No massage bookings</p>
              <p className="text-sm text-muted-foreground">Book a massage therapist to get started</p>
            </div>
            <Button onClick={() => router.push("/home")} className="bg-primary hover:bg-primary/90 text-white">
              Find Therapists
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Your Massage Sessions</h2>
              <p className="text-sm text-muted-foreground">Manage your upcoming and past bookings</p>
            </div>

            {bookings.map((booking) => (
              <Card 
                key={booking.id} 
                onClick={() => handleView(booking.id, booking)}
                className="overflow-hidden border-l-4 border-l-green-500 cursor-pointer"
              >
                <CardContent className="p-0">
                  <div className="p-4 space-y-4">
                    {/* Therapist Info & Status */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={booking.therapist.image}
                          alt={booking.therapist.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-green-200"
                        />
                        <div>
                          <h3 className="font-semibold text-lg">{booking.therapist.name}</h3>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm text-muted-foreground">
                              {booking.therapist.rating} • {booking.service.name}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(booking.status)} text-white capitalize`}>
                        {getStatusText(booking.status)}
                      </Badge>
                    </div>

                    {/* Booking Details */}
                    <div className="space-y-2 text-sm bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {booking.date} at {booking.startTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{booking.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{booking.service.duration} minutes</span>
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="pt-2 border-t flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-primary">R{booking.service.price}</p>
                        <p className="text-xs text-muted-foreground">One-time session</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 bg-transparent"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleContactTherapist(booking.therapist.name)
                            }}
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8 bg-transparent"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleContactTherapist(booking.therapist.name)
                            }}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1 bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewDetails(booking.id)
                          }}
                        >
                          Details
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Completed Bookings Section */}
            <div className="pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4">Completed Sessions</h3>
              <div className="text-center py-8 space-y-2 bg-muted/30 rounded-lg">
                <Calendar className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">No completed sessions yet</p>
                <p className="text-xs text-muted-foreground">Your completed massages will appear here</p>
              </div>
            </div>
          </>
        )}
      </div>

      <BottomNav />

      {/* Booking View Modal */}
      {activeBooking && (
        <BookingViewModal
          bookingId={activeBooking.id}
          booking={activeBooking.booking}
          onClose={handleCloseView}
        />
      )}
    </div>
  )
}
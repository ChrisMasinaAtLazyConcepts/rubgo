"use client"

import { BottomNav } from "@/components/bottom-nav"
import { MobileHeader } from "@/components/mobile-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Clock, ChevronRight, Phone, MessageCircle, Star, Sparkles, Heart, Zap, ShieldCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CheckCircle, X } from "lucide-react"
import TherapistEnRoute from "@/components/therapist-en-route"
import { Booking } from "@/lib/types";
import { AlertTriangle, Shield, Send, AlertCircle } from "lucide-react"
import { Label } from "@radix-ui/react-label"

interface BookingViewModalProps {
  bookingId: string
  booking: Booking
  onClose: () => void
}

function BookingViewModal({ bookingId, booking, onClose }: BookingViewModalProps) {
  const [currentView, setCurrentView] = useState<'details' | 'review'>('details')
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [showEmergencyModal, setShowEmergencyModal] = useState(false)
  const [emergencyNote, setEmergencyNote] = useState("")

  const handleEmergencySubmit = async () => {
    console.log("Emergency alert sent:", emergencyNote)
    setShowEmergencyModal(false)
    setEmergencyNote("")
    alert("Emergency alert sent! Help is on the way.")
  }

  const renderStars = (count: number, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => setRating(star) : undefined}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform duration-200' : ''}`}
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                star <= count 
                  ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm' 
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
 <div className="bg-gradient-to-br from-gray-300 via-gray-200 to-gray-400 fixed inset-0 z-50 flex flex-col">  <Button
      variant="ghost"
      size="icon"
      onClick={onClose}
      className="absolute top-4 right-4 z-10 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"
    >
      <X size={24} />
    </Button>
    
    {/* Animated Background */}
    <div className="absolute inset-0 opacity-20">
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-green-500 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-emerald-500 rounded-full blur-xl animate-pulse delay-1000"></div>
    </div>

    <div className="flex-1 relative flex items-center justify-center p-6">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center w-full max-w-2xl"
      >
        {/* Session Image - Fixed sizing */}
        <div className="relative mb-8 w-full h-48 bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <img 
            src="./assets/splash.gif" 
            alt="Massage in progress" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
        
        <motion.h2 
          className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Session in Progress
        </motion.h2>
        
        <motion.p 
          className="text-xl mb-6 text-white/80"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Your massage with <span className="font-semibold text-white">{booking.therapist.name}</span>
        </motion.p>

        <motion.div 
          className="flex justify-center gap-3 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20">
            <Clock className="w-5 h-5 text-green-400 inline mr-2" />
            <span className="text-white font-semibold">45min remaining</span>
          </div>
        </motion.div>
        
        {/* Emergency Button */}
        <motion.div 
          className="mt-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button 
            variant="destructive"
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-2xl px-8 py-4 font-bold shadow-2xl animate-pulse border border-red-400/50"
            onClick={() => setShowEmergencyModal(true)}
          >
            <AlertTriangle className="w-6 h-6 mr-3" />
            EMERGENCY ASSISTANCE
          </Button>
          <p className="text-xs text-red-300/80 mt-3">Only use in genuine emergencies</p>
        </motion.div>
      </motion.div>
    </div>

    {/* Emergency Modal */}
    {showEmergencyModal && (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-gray-200"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Emergency Assistance</h3>
              <p className="text-sm text-gray-600 mt-1">Help is on the way. Please describe the situation.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Label htmlFor="emergency-note" className="text-sm font-medium text-gray-700 mb-2 block">
                What's happening?
              </Label>
              <textarea
                id="emergency-note"
                placeholder="Please describe the emergency situation in detail..."
                rows={4}
                className="w-full border border-gray-300 rounded-2xl p-4 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                value={emergencyNote}
                onChange={(e) => setEmergencyNote(e.target.value)}
              />
            </div>

            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-800">
                  <p className="font-semibold mb-2">Emergency protocols activated:</p>
                  <ul className="space-y-1">
                    <li>• Security and medical help notified</li>
                    <li>• Session recording flagged for review</li>
                    <li>• Therapist's supervisor alerted</li>
                    <li>• Your location shared with emergency services</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowEmergencyModal(false)}
                className="flex-1 border-gray-300 rounded-xl hover:bg-gray-50 text-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEmergencySubmit}
                disabled={!emergencyNote.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-lg"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Emergency Alert
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </div>
),

    'upcoming': (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 z-50 flex flex-col">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm hover:bg-white"
        >
          <X size={24} />
        </Button>
        
        <div className="flex-1 relative flex items-center justify-center p-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full text-center"
          >
            <div className="mb-8">
              <motion.div 
                className="text-6xl mb-4"
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  y: { duration: 3, repeat: Infinity },
                  rotate: { duration: 4, repeat: Infinity }
                }}
              >
                📅
              </motion.div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Upcoming Booking</h1>
              <p className="text-gray-600">Your session is scheduled and confirmed</p>
            </div>
            
            <motion.div 
              className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={booking.therapist.image}
                  alt={booking.therapist.name}
                  className="w-16 h-16 rounded-2xl object-cover shadow-lg border-2 border-blue-200"
                />
                <div className="text-left">
                  <h3 className="font-bold text-lg text-gray-800">{booking.therapist.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{booking.therapist.rating}</span>
                    <Sparkles className="w-4 h-4 text-blue-500" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">{new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                  <Clock className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">{booking.startTime} - {booking.endTime}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-700 text-sm">{booking.address}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    ),

    'completed': (
      <div className="fixed inset-0 bg-gradient-to-br from-green-50 to-emerald-100 z-50 overflow-y-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm hover:bg-white"
        >
          <X size={24} />
        </Button>
        
        <div className="max-w-md mx-auto py-8 px-6">
          {currentView === 'details' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4 drop-shadow-sm" />
                </motion.div>
                <h1 className="text-3xl font-bold mb-3 text-gray-800">Session Completed</h1>
                <p className="text-gray-600 text-lg">How was your experience with {booking.therapist.name}?</p>
              </div>

              <motion.div 
                className="bg-white rounded-3xl shadow-lg p-6 mb-6 border border-green-100"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={booking.therapist.image}
                    alt={booking.therapist.name}
                    className="w-16 h-16 rounded-2xl object-cover shadow-md border-2 border-green-200"
                  />
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{booking.therapist.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{booking.therapist.rating}</span>
                      <ShieldCheck className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-sm bg-gray-50 rounded-2xl p-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Service</span>
                    <span className="text-gray-800 font-semibold">{booking.service.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Date</span>
                    <span className="text-gray-800">{new Date(booking.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Time</span>
                    <span className="text-gray-800">{booking.startTime} - {booking.endTime}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Duration</span>
                    <span className="text-gray-800 font-semibold">{booking.service.duration} minutes</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Button 
                  onClick={() => setCurrentView('review')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl py-4 font-semibold shadow-lg transition-all duration-300"
                >
                  <Star className="w-5 h-5 mr-2" />
                  Rate & Review Session
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-3 text-gray-800">Rate Your Session</h1>
                <p className="text-gray-600 text-lg">Share your experience with {booking.therapist.name}</p>
              </div>

              <motion.div 
                className="bg-white rounded-3xl shadow-lg p-6 mb-6 border border-blue-100"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={booking.therapist.image}
                    alt={booking.therapist.name}
                    className="w-12 h-12 rounded-2xl object-cover shadow-md"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">{booking.therapist.name}</h3>
                    <p className="text-sm text-gray-600">{booking.service.name}</p>
                  </div>
                </div>

                <div className="text-center mb-8">
                  <p className="text-lg font-semibold text-gray-800 mb-6">How would you rate your session?</p>
                  <div className="flex justify-center">
                    {renderStars(rating, true)}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Write a review (optional)
                  </label>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Share details about your experience, what you enjoyed, or any suggestions..."
                    className="w-full h-32 p-4 border border-gray-300 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </motion.div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentView('details')}
                  className="flex-1 border-gray-300 rounded-2xl hover:bg-gray-50 font-semibold"
                >
                  Back
                </Button>
                <Button 
                  onClick={() => {
                    console.log({ rating, review, bookingId })
                    setCurrentView('details')
                  }}
                  disabled={rating === 0}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl font-semibold shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Submit Review
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    ),

    'therapist-en-route': (
      <div></div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {views[booking.status as keyof typeof views] || <div>Unknown booking status</div>}
    </motion.div>
  )
}

export default function BookingsPage() {
  const router = useRouter()
  const [activeBooking, setActiveBooking] = useState<{id: string, booking: Booking} | null>(null)
  const [activeEnRouteBooking, setActiveEnRouteBooking] = useState<Booking | null>(null)

  // Mock bookings data
  const bookings: Booking[] = [
    {
      id: "1",
      therapist: {
        id: "1",
        name: "James Mbeki",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        rate: 350,
        rating: 4.9,
        location: { lat: -26.1076, lng: 28.0567 }
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
      address: "Your Office - Sandton",
      scheduledTime: "",
      userLocation: { lat: -26.1025, lng: 28.0534 },
    },
    {
      id: "2",
      therapist: {
        id: "2",
        name: "Priya Singh",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        rate: 350,
        rating: 4.9,
        location: { lat: -26.1076, lng: 28.0567 }
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
      address: "Your Location - Home",
      userLocation: { lat: -26.1025, lng: 28.0534 },
      scheduledTime: ""
    },
    {
      id: "3",
      therapist: {
        id: "2",
        name: "Priya Singh",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        rate: 350,
        rating: 4.9,
        location: { lat: -26.1076, lng: 28.0567 }
      },
      service: {
        name: "Aromatherapy Massage",
        duration: 60,
        price: 500
      },
      date: "2024-01-18",
      startTime: "",
      endTime: "",
      status: "therapist-en-route",
      address: "Your Location - Home",
      scheduledTime: "",
      userLocation: { lat: -26.1025, lng: 28.0534 },
    },
    {
      id: "4",
      therapist: {
        id: "1",
        name: "James Mbeki",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        rate: 350,
        rating: 4.9,
        location: { lat: -26.1076, lng: 28.0567 }
      },
      service: {
        name: "Swedish Massage",
        duration: 90,
        price: 650
      },
      date: "2024-01-16",
      startTime: "16:30",
      endTime: "18:00",
      status: "completed",
      address: "Your Office - Sandton",
      scheduledTime: "",
      userLocation: undefined
    },
  ]

  const handleTherapistArrived = () => {
    console.log('Therapist has arrived!')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-gradient-to-r from-green-500 to-emerald-500"
      case "in-progress":
        return "bg-gradient-to-r from-blue-500 to-cyan-500"
      case "upcoming":
        return "bg-gradient-to-r from-orange-500 to-amber-500"
      case "completed":
        return "bg-gradient-to-r from-gray-500 to-slate-500"
      case "therapist-en-route":
        return "bg-gradient-to-r from-purple-500 to-pink-500"
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-500"
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
      case "therapist-en-route":
        return "On the Way"
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
    if(booking.status === 'therapist-en-route'){
      setActiveEnRouteBooking(booking)
      return
    }
    setActiveBooking({ id: bookingId, booking })
  }

  const handleCloseView = () => {
    setActiveBooking(null)
  }

  const handleCloseEnRoute = () => {
    setActiveEnRouteBooking(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-20">
      <MobileHeader title="My Massage Bookings" />

      <div className="p-4 space-y-6">
        {bookings.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 space-y-6"
          >
            <div className="flex justify-center">
              <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center shadow-lg">
                <Calendar className="h-12 w-12 text-blue-600" />
              </div>
            </div>
            <div className="space-y-3">
              <p className="font-bold text-2xl text-gray-800">No massage bookings yet</p>
              <p className="text-gray-600">Book your first massage therapist to get started</p>
            </div>
            <Button 
              onClick={() => router.push("/home")} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl px-8 py-3 font-semibold shadow-lg transition-all duration-300"
            >
              <Zap className="w-5 h-5 mr-2" />
              Find Therapists
            </Button>
          </motion.div>
        ) : (
          <>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <h2 className="text-2xl font-bold text-gray-800">Your Massage Sessions</h2>
              <p className="text-gray-600 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                Manage your upcoming and past bookings
              </p>
            </motion.div>

            <div className="space-y-4">
              {bookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    onClick={() => handleView(booking.id, booking)}
                    className="overflow-hidden border-l-4 border-l-green-400 cursor-pointer hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white rounded-3xl border-0 shadow-lg"
                  >
                    <CardContent className="p-0">
                      <div className="p-5 space-y-4">
                        {/* Therapist Info & Status */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <img
                                src={booking.therapist.image}
                                alt={booking.therapist.name}
                                className="w-14 h-14 rounded-2xl object-cover border-2 border-green-200 shadow-md"
                              />
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-gray-800">{booking.therapist.name}</h3>
                              <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm text-gray-600">
                                  {booking.therapist.rating} • {booking.service.name}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(booking.status)} text-white capitalize rounded-full px-3 py-1 font-semibold shadow-md`}>
                            {getStatusText(booking.status)}
                          </Badge>
                        </div>

                        {/* Booking Details */}
                        <div className="space-y-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-4 border border-gray-100">
                          <div className="flex items-center gap-3 text-gray-700">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <span className="font-medium">
                              {booking.date} at {booking.startTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-700">
                            <MapPin className="h-5 w-5 text-green-600" />
                            <span className="font-medium">{booking.address}</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-700">
                            <Clock className="h-5 w-5 text-purple-600" />
                            <span className="font-medium">{booking.service.duration} minutes • R{booking.service.price}</span>
                          </div>
                        </div>

                        {/* Price & Actions */}
                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                          <div>
                            <p className="text-xl font-bold text-gray-800">R{booking.service.price}</p>
                            <p className="text-xs text-gray-500">One-time session</p>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-10 w-10 bg-white border-gray-300 rounded-2xl hover:bg-blue-50 hover:border-blue-300 transition-all"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleContactTherapist(booking.therapist.name)
                                }}
                              >
                                <Phone className="h-5 w-5 text-blue-600" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-10 w-10 bg-white border-gray-300 rounded-2xl hover:bg-green-50 hover:border-green-300 transition-all"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleContactTherapist(booking.therapist.name)
                                }}
                              >
                                <MessageCircle className="h-5 w-5 text-green-600" />
                              </Button>
                            </div>
                            
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="gap-2 bg-white border-gray-300 rounded-2xl hover:bg-gray-50 font-semibold transition-all"
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
                </motion.div>
              ))}
            </div>

            {/* Completed Bookings Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="pt-8 border-t border-gray-200"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                Completed Sessions
              </h3>
              <div className="text-center py-12 space-y-4 bg-gradient-to-br from-gray-50 to-slate-100 rounded-3xl border-2 border-dashed border-gray-300">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto" />
                <div className="space-y-2">
                  <p className="font-semibold text-gray-700">No completed sessions yet</p>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">Your completed massage sessions will appear here for easy access and rebooking</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Active Booking Modal */}
      {activeBooking && (
        <BookingViewModal
          bookingId={activeBooking.id}
          booking={activeBooking.booking}
          onClose={handleCloseView}
        />
      )}

      {/* Therapist En Route Modal */}
      {activeEnRouteBooking && (
        <TherapistEnRoute
          booking={activeEnRouteBooking}
          onTherapistArrived={handleTherapistArrived}
          onClose={handleCloseEnRoute}
        />
      )}

      <BottomNav />
    </div>
  )
}
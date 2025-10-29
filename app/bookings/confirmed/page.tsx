"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle, User, Clock, MapPin, Share2, Calendar, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

function BookingConfirmedContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const therapistName = searchParams.get('therapist') || "Massage Therapist"
  const serviceName = searchParams.get('service') || "Relaxation Massage"

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 p-8 text-white text-center">
          <CheckCircle className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-green-100">Your massage appointment is secured</p>
        </div>
        
        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{serviceName}</h2>
            <p className="text-gray-600">with {therapistName}</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <User className="h-5 w-5 text-blue-500 mr-3" />
                <span className="font-medium">Therapist</span>
              </div>
              <span className="text-gray-700">{therapistName}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-green-500 mr-3" />
                <span className="font-medium">Date & Time</span>
              </div>
              <span className="text-gray-700">Today, 2:00 PM</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-purple-500 mr-3" />
                <span className="font-medium">Duration</span>
              </div>
              <span className="text-gray-700">60 minutes</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
              <Share2 className="h-4 w-4 mr-2" />
              Share Booking Details
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/home')}
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Loading component
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading booking details...</p>
      </div>
    </div>
  )
}

export default function BookingConfirmed() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <BookingConfirmedContent />
    </Suspense>
  )
}
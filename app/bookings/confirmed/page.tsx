"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle, User, Clock, MapPin, Share2, Calendar, Home, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BottomNav } from "@/components/bottom-nav"
import { MobileHeader } from "@/components/mobile-header"

function BookingConfirmedContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const therapistName = searchParams.get('therapist') || "Massage Therapist"
  const serviceName = searchParams.get('service') || "Relaxation Massage"
  const therapistImage = searchParams.get('image') || "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
  const price = searchParams.get('price') || "350"

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Booking Confirmed" />
      
      <div className="p-4 space-y-6">
        {/* Success Header */}
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">Your massage appointment is secured</p>
        </div>

        {/* Service Card */}
        <Card className="overflow-hidden border-l-4 border-l-green-500">
          <CardContent className="p-0">
            <div className="p-4 space-y-4">
              {/* Therapist Info */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={therapistImage}
                    alt={therapistName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-green-200"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{therapistName}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-muted-foreground">
                        4.9 • {serviceName}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge className="bg-green-500 text-white">Confirmed</Badge>
              </div>

              {/* Booking Details */}
              <div className="space-y-3 bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-sm">Date & Time</p>
                    <p className="text-gray-700">Today, 2:00 PM</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium text-sm">Duration</p>
                    <p className="text-gray-700">60 minutes</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium text-sm">Location</p>
                    <p className="text-gray-700">Your Location - Home</p>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="pt-2 border-t flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-primary">R{price}</p>
                  <p className="text-xs text-muted-foreground">One-time session</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button className="w-full bg-green-600 hover:bg-green-700 text-white h-12">
            <Share2 className="h-5 w-5 mr-2" />
            Share Booking Details
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full h-12 border-2"
            onClick={() => router.push('/home')}
          >
            <Home className="h-5 w-5 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Additional Info */}
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-700">
              <CheckCircle size={16} />
              <span className="text-sm font-medium">Payment secured with encryption</span>
            </div>
          </div>

          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-700">
              <Clock size={16} />
              <span className="text-sm font-medium">
                Therapist will arrive 15 minutes before your session
              </span>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

// Loading component
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
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
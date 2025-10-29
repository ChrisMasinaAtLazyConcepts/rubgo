"use client"

import { useParams, useRouter } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { MobileHeader } from "@/components/mobile-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Clock, User, Phone, MessageCircle, Star, ArrowLeft, Navigation } from "lucide-react"

export default function BookingDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string

  // Mock booking data - in real app, fetch by ID
  const booking = {
    id: bookingId,
    therapistName: "Sarah Johnson",
    service: "Deep Tissue Massage",
    date: "2024-01-15",
    time: "14:00",
    duration: "60 minutes",
    status: "confirmed",
    price: 450,
    therapistETA: "15 min",
    location: "123 Main Street, Sandton, Johannesburg",
    therapistRating: 4.9,
    therapistImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    therapistPhone: "+27 12 345 6789",
    specialInstructions: "Please bring your own massage oil if preferred",
    paymentStatus: "paid",
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-500"
      case "in-progress": return "bg-blue-500"
      case "upcoming": return "bg-orange-500"
      case "completed": return "bg-gray-500"
      default: return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader 
        title="Booking Details" 
      />

      <div className="p-4 space-y-4">
        {/* Therapist Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <img
                src={booking.therapistImage}
                alt={booking.therapistName}
                className="w-16 h-16 rounded-full object-cover border-2 border-green-200"
              />
              <div className="flex-1">
                <h2 className="text-xl font-bold">{booking.therapistName}</h2>
                <div className="flex items-center gap-1 mb-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-muted-foreground">{booking.therapistRating} rating</span>
                </div>
                <Badge className={`${getStatusColor(booking.status)} text-white`}>
                  {booking.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Details */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-lg">{booking.service}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{booking.date} at {booking.time}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{booking.duration}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{booking.location}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ETA & Tracking */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Therapist ETA</h3>
              <span className={`text-lg font-bold ${
                booking.therapistETA === "Arrived" ? "text-green-600" : "text-blue-600"
              }`}>
                {booking.therapistETA}
              </span>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 bg-green-500 hover:bg-green-600 text-white">
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
              <Button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white">
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Special Instructions */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Special Instructions</h3>
            <p className="text-sm text-muted-foreground">
              {booking.specialInstructions}
            </p>
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service Fee</span>
                <span>R{booking.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Fee</span>
                <span>R{Math.round(booking.price * 0.15)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">R{booking.price + Math.round(booking.price * 0.15)}</span>
              </div>
              <div className="flex justify-between text-xs text-green-600">
                <span>Payment Status</span>
                <span className="capitalize">{booking.paymentStatus}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <div className="text-center text-xs text-muted-foreground">
          Need help? Contact RubGo support: support@rubgo.co.za
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
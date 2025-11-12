// app/group-booking/confirmation/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MobileHeader } from "@/components/mobile-header"
import { BottomNav } from "@/components/bottom-nav"
import { CheckCircle, Users, Clock, User, Users as UsersIcon, Share2, MessageCircle, MapPin, Calendar } from "lucide-react"

interface GroupBookingDetails {
  type: string
  participants: number
  therapists: number
  duration: number
  sharing: string
  total: number
  perPerson: number
  groupName: string
}

export default function GroupBookingConfirmation() {
  const router = useRouter()
  const [bookingDetails, setBookingDetails] = useState<GroupBookingDetails | null>(null)

  useEffect(() => {
    // Retrieve booking details from session storage
    const storedDetails = sessionStorage.getItem('groupBookingDetails')
    if (storedDetails) {
      setBookingDetails(JSON.parse(storedDetails))
    } else {
      // Redirect back if no booking details found
      router.push('/')
    }
  }, [router])

  const handleShareViaWhatsApp = () => {
    if (!bookingDetails) return

    const message = `Join me for a group massage session! 🧘‍♀️

${bookingDetails.groupName}
👥 ${bookingDetails.participants} people
⏰ ${bookingDetails.duration} hour session
💆 ${bookingDetails.therapists} therapists
💰 R${bookingDetails.perPerson} per person

Let me know if you can make it!`

    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`
    
    window.open(whatsappUrl, '_blank')
  }

  const handleBackToHome = () => {
    router.push('/')
  }

  if (!bookingDetails) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="Booking Confirmed" />
      
      <div className="p-6">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Group Booking Confirmed!</h1>
          <p className="text-gray-600">Your {bookingDetails.groupName} has been successfully booked</p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Group Type</p>
                  <p className="font-medium text-gray-900">{bookingDetails.groupName}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UsersIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Participants</p>
                  <p className="font-medium text-gray-900">{bookingDetails.participants} people</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium text-gray-900">{bookingDetails.duration} hours</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Therapists</p>
                  <p className="font-medium text-gray-900">
                    {bookingDetails.therapists} {bookingDetails.sharing === 'shared' ? '(Shared)' : '(Individual)'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Total Cost</p>
                  <p className="text-2xl font-bold text-green-600">R{bookingDetails.total}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Per Person</p>
                  <p className="font-medium text-gray-900">R{bookingDetails.perPerson}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3">What's Next?</h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4" />
              <span>We'll contact you within 24 hours to schedule your session</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4" />
              <span>Choose your preferred location for the group session</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4" />
              <span>Invite your group members using the share button below</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleShareViaWhatsApp}
            className="w-full bg-green-600 hover:bg-green-700 h-12 text-white font-semibold"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Share via WhatsApp
          </Button>
          
          <Button
            onClick={handleBackToHome}
            variant="outline"
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 h-12"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
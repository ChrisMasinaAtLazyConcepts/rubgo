"use client"

import { useState, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PaymentMethodSelector } from "@/components/payment-method-selector"
import { DateRangePicker } from "@/components/date-range-picker"
import { storageUnits } from "@/lib/storage-data"
import { calculateTotalPrice, calculateRentalDuration, formatCurrency, formatDate } from "@/lib/booking-utils"
import { MapPin, Ruler, Shield, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

export default function BookingPage() {
  const router = useRouter()
  const params = useParams()
  const unitId = params.id as string

  const unit = storageUnits.find((u) => u.id === unitId)

  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date()
    date.setDate(date.getDate() + 1)
    return date
  })

  const [endDate, setEndDate] = useState<Date>(() => {
    const date = new Date()
    date.setMonth(date.getMonth() + 3)
    return date
  })

  const [paymentMethod, setPaymentMethod] = useState<"eft" | "card" | "cash">("card")
  const [showConfirmation, setShowConfirmation] = useState(false)

  const totalPrice = useMemo(() => {
    if (!unit) return 0
    return calculateTotalPrice(unit.price, startDate, endDate)
  }, [unit, startDate, endDate])

  const duration = useMemo(() => {
    return calculateRentalDuration(startDate, endDate)
  }, [startDate, endDate])

  const handleBooking = () => {
    // Mock booking submission
    setShowConfirmation(true)
  }

  const handleConfirmationClose = () => {
    setShowConfirmation(false)
    router.push("/bookings")
  }

  if (!unit) {
    return (
      <div className="min-h-screen bg-background">
        <MobileHeader title="Booking" showBack onBack={() => router.back()} />
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Unit not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      <MobileHeader title="Book Storage Unit" showBack onBack={() => router.back()} />

      <div className="space-y-6">
        {/* Unit Details */}
        <div className="relative h-64 w-full">
          <Image src={unit.image || "/placeholder.svg"} alt={unit.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h1 className="text-2xl font-bold">{unit.name}</h1>
            <p className="text-sm opacity-90">{unit.description}</p>
          </div>
        </div>

        <div className="px-4 space-y-6">
          {/* Unit Info */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{unit.size}</span>
                </div>
                <Badge variant="outline" className="capitalize">
                  {unit.type}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Dam Safe Self Storage, South Africa</span>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-semibold">Features:</p>
                <div className="flex flex-wrap gap-2">
                  {unit.features.map((feature) => (
                    <Badge key={feature} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date Selection */}
          <Card>
            <CardContent className="p-4">
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
              />
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardContent className="p-4">
              <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />
            </CardContent>
          </Card>

          {/* Pricing Summary */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-lg">Booking Summary</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{duration} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate</span>
                  <span className="font-medium">{formatCurrency(unit.price)}/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Start Date</span>
                  <span className="font-medium">{formatDate(startDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">End Date</span>
                  <span className="font-medium">{formatDate(endDate)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-primary">{formatCurrency(totalPrice)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
            <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Secure Booking</p>
              <p className="text-xs text-muted-foreground">
                Your payment information is encrypted and secure. You can cancel within 24 hours for a full refund.
              </p>
            </div>
          </div>

          {/* Book Button */}
          <Button onClick={handleBooking} className="w-full h-12 text-base bg-primary hover:bg-primary/90 text-white">
            Confirm Booking
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl">Booking Confirmed!</DialogTitle>
            <DialogDescription className="text-center">
              Your storage unit has been successfully booked. You will receive a confirmation email shortly.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Unit:</span>
              <span className="font-medium">{unit.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Start Date:</span>
              <span className="font-medium">{formatDate(startDate)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-medium text-primary">{formatCurrency(totalPrice)}</span>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleConfirmationClose} className="w-full bg-primary hover:bg-primary/90 text-white">
              View My Bookings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

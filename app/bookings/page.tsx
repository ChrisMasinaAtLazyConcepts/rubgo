"use client"

import { BottomNav } from "@/components/bottom-nav"
import { MobileHeader } from "@/components/mobile-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Clock, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function BookingsPage() {
  const router = useRouter()

  // Mock bookings data
  const bookings = [
    {
      id: "1",
      unitName: "Medium Container Unit",
      size: "3m x 3m",
      startDate: "2025-01-15",
      endDate: "2025-04-15",
      status: "active",
      price: 1250,
      daysRemaining: 95,
    },
  ]

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader title="My Bookings" />

      <div className="p-4 space-y-4">
        {bookings.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                <Calendar className="h-10 w-10 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-medium">No active bookings</p>
              <p className="text-sm text-muted-foreground">Book a storage unit to get started</p>
            </div>
            <Button onClick={() => router.push("/home")} className="bg-primary hover:bg-primary/90 text-white">
              Browse Units
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Active Bookings</h2>
              <p className="text-sm text-muted-foreground">Manage your storage units</p>
            </div>

            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{booking.unitName}</h3>
                        <p className="text-sm text-muted-foreground">{booking.size}</p>
                      </div>
                      <Badge variant={booking.status === "active" ? "default" : "secondary"} className="capitalize">
                        {booking.status}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {booking.startDate} to {booking.endDate}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>Dam Safe Self Storage</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{booking.daysRemaining} days remaining</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-primary">R{booking.price}</p>
                        <p className="text-xs text-muted-foreground">per month</p>
                      </div>
                      <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                        Details
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

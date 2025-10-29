// components/therapist-card.tsx
"use client"

import { useState } from "react"
import { Star, MapPin, Clock, Shield, Award, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { type Therapist, type MassageService } from "@/lib/massage-data"

interface TherapistCardProps {
  therapist: Therapist
  onBook: (therapist: Therapist, service: MassageService) => void
  distance?: string | null
  selectedService: MassageService | null
}

export function TherapistCard({ therapist, onBook, distance, selectedService }: TherapistCardProps) {
  const [expanded, setExpanded] = useState(false)

  const getVerificationIcon = (verification: string) => {
    switch (verification) {
      case "verified":
        return <Shield className="h-3 w-3 text-green-600" />
      case "pending":
        return <Clock className="h-3 w-3 text-yellow-600" />
      default:
        return null
    }
  }

  const getExperienceBadge = (experience: number) => {
    if (experience >= 5) return { label: "Expert", class: "bg-purple-100 text-purple-800" }
    if (experience >= 3) return { label: "Pro", class: "bg-blue-100 text-blue-800" }
    return { label: "Skilled", class: "bg-green-100 text-green-800" }
  }

  const experienceBadge = getExperienceBadge(Number(therapist.experience))

  // Safe services array with proper typing and string conversion
  const services: any[] = therapist.services?.map((service, index) => ({
    id: String(service.id || `service-${therapist.id}-${index}`), // Ensure id is always string
    name: service.name,
    price: service.price,
    duration: service.duration,
    description: service.description || `${service.name} therapy session`,
    category: String(service.category || "general"), // Ensure category is always string
    type: service.type || "standard"
  })) || []

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-0">
        {/* Header with Image and Basic Info */}
        <div className="flex p-4 gap-3">
          {/* Therapist Avatar - Rounded with Photo */}
          <div className="relative flex-shrink-0">
            <div className="relative">
              {/* Main Avatar Circle */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 overflow-hidden border-2 border-white shadow-sm">
                {therapist.image ? (
                  <img 
                    src={therapist.image} 
                    alt={therapist.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {therapist.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Online Status Indicator */}
              {therapist.availability && (
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
              )}
              
              {/* Verification Badge */}
              {therapist.verification !== "none" && (
                <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-md border">
                  {getVerificationIcon(therapist.verification)}
                </div>
              )}
            </div>
          </div>

          {/* Therapist Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-base truncate">{therapist.name}</h3>
                  <Badge variant="secondary" className={experienceBadge.class}>
                    <Award className="h-3 w-3 mr-1" />
                    {experienceBadge.label}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{therapist.rating}</span>
                    <span>({therapist.reviews})</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{distance ? `${distance} km` : 'Nearby'}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground truncate">{therapist.specialty}</p>
              </div>

              {/* Availability Badge */}
              <div className="flex flex-col items-end gap-1">
                {therapist.availability ? (
                  <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Available
                  </Badge>
                ) : (
                  <Badge variant="secondary">Busy</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Services List */}
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Services & Pricing</h4>
            {services.length > 2 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? 'Show Less' : 'Show All'}
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {(expanded ? services : services.slice(0, 2)).map((service) => {
              const isSelected = selectedService?.id === service.id
              const totalPrice = calculateServicePrice(service.price)
              
              return (
                <div
                  key={service.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                    isSelected 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted hover:border-primary/50'
                  }`}
                  onClick={() => onBook(therapist, service)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{service.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {service.duration}min
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {service.description}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1 ml-3">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-base">R{totalPrice.total}</span>
                      {totalPrice.surgeMultiplier > 1.2 && (
                        <Badge variant="destructive" className="text-xs">
                          {totalPrice.surgeMultiplier}x
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground line-through">
                      R{service.price}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {!expanded && services.length > 2 && (
            <div className="text-center pt-2">
              <span className="text-xs text-muted-foreground">
                +{services.length - 2} more services
              </span>
            </div>
          )}
        </div>
      </CardContent>

      {/* Quick Action Footer */}
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {
            // Navigate to therapist profile
          }}
        >
          View Profile
        </Button>
        <Button
          className="flex-1"
          disabled={!therapist.availability || services.length === 0}
          onClick={() => {
            if (services.length > 0) {
              onBook(therapist, services[0])
            }
          }}
        >
          {therapist.availability ? 'Book Now' : 'Not Available'}
        </Button>
      </CardFooter>
    </Card>
  )
}

// Price calculation function (matches the one in homepage)
function calculateServicePrice(basePrice: number) {
  const serviceFee = basePrice * 0.20 // 20% service fee
  const bookingFee = 15 // Fixed booking fee in Rands
  
  // Simulate surge pricing (1.0x to 2.5x)
  const surgeMultiplier = Math.random() * 1.5 + 1.0
  const surgedPrice = basePrice * surgeMultiplier
  
  const subtotal = surgedPrice + serviceFee + bookingFee
  const vat = subtotal * 0.15 // 15% VAT
  
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
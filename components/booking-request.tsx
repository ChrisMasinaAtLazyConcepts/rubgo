"use client"

import { Therapist, MassageService } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { X, Clock, MapPin, Star, User } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface BookingRequestProps {
  therapist: Therapist
  service: any
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function BookingRequest({ 
  therapist, 
  service, 
  isOpen, 
  onClose, 
  onConfirm 
}: BookingRequestProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          
          {/* Booking Panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[90vh] overflow-y-auto"
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 pb-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Confirm Booking</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <X size={18} />
                </Button>
              </div>
            </div>

            {/* Therapist Info */}
            <div className="px-6 py-4">
              <div className="flex items-center gap-4">
                <img
                  src={therapist.image}
                  alt={therapist.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-green-500"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{therapist.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{therapist.rating}</span>
                      <span>({therapist.reviews} reviews)</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{therapist.specialty}</p>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="px-6 py-4 bg-gray-50">
              <h4 className="font-semibold mb-3">Service Details</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service</span>
                  <span className="font-medium">{service.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{service.duration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price</span>
                  <span className="font-medium">R{service.price}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>R{service.price}</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="p-6">
              <Button
                onClick={onConfirm}
                className="w-full bg-[#10B981] hover:bg-[#0da271] text-white font-semibold py-3 text-lg rounded-xl"
                size="lg"
              >
                Add to Cart
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
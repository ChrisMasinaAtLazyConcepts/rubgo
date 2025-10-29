"use client"

import { Therapist, MassageService } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { X, Clock, MapPin, Star, User, Phone, MessageCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface BookingLoadingProps {
  therapist: Therapist
  service: any
  isOpen: boolean
  onCancel: () => void
  onContact: () => void
}

export function BookingLoading({ 
  therapist, 
  service, 
  isOpen, 
  onCancel, 
  onContact 
}: BookingLoadingProps) {
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
          />
          
          {/* Loading Panel */}
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
                <h2 className="text-xl font-bold">Requesting {therapist.name}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onCancel}
                  className="h-8 w-8"
                >
                  <X size={18} />
                </Button>
              </div>
            </div>

            {/* Loading Animation */}
            <div className="px-6 py-8 text-center">
              {/* Animated GIF/Spinner */}
              <div className="flex justify-center mb-6">
                <img 
                  src="/booking-loading.gif" // Add your loading GIF
                  alt="Finding therapist"
                  className="w-32 h-32"
                />
              </div>
              
              <h3 className="text-xl font-semibold mb-2">Finding {therapist.name}</h3>
              <p className="text-gray-600 mb-6">
                We're checking {therapist.name}'s availability and sending your booking request...
              </p>

              {/* Progress Steps */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  </div>
                  <span className="text-sm">Sending booking request</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <span className="text-sm text-gray-500">Waiting for confirmation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <span className="text-sm text-gray-500">Confirming appointment</span>
                </div>
              </div>

              {/* Therapist Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <img
                    src={therapist.image}
                    alt={therapist.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold">{therapist.name}</h4>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{therapist.rating} • {therapist.reviews} reviews</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onContact}
                  className="flex-1 flex items-center gap-2"
                >
                  <MessageCircle size={18} />
                  Message
                </Button>
                <Button
                  variant="outline"
                  onClick={onContact}
                  className="flex-1 flex items-center gap-2"
                >
                  <Phone size={18} />
                  Call
                </Button>
              </div>

              {/* Cancel Button */}
              <Button
                variant="ghost"
                onClick={onCancel}
                className="w-full mt-4 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Cancel Request
              </Button>

              {/* Estimated Time */}
              <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-blue-700">
                  <Clock size={16} />
                  <span className="text-sm font-medium">
                    Usually responds within {therapist.responseTime || 5} minutes
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
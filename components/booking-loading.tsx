"use client"

import { Therapist, MassageService } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { X, Clock, MapPin, Star, User, Phone, MessageCircle, CreditCard, Plus, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

interface BookingLoadingProps {
  therapist: Therapist
  service: any
  isOpen: boolean
  onCancel: () => void
  onContact: () => void
  onManagePayment: () => void
}

export function BookingLoading({ 
  therapist, 
  service, 
  isOpen, 
  onCancel, 
  onContact,
  onManagePayment 
}: BookingLoadingProps) {
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  // Mock payment methods - in real app, fetch from user profile
  const paymentMethods = [
    {
      id: "card-1",
      type: "visa",
      last4: "4242",
      expiry: "12/25",
      isDefault: true
    },
    {
      id: "card-2", 
      type: "mastercard",
      last4: "8888",
      expiry: "08/24",
      isDefault: false
    }
  ]


  const getCardIcon = (type: string) => {
    switch (type) {
      case "visa": return "💳"
      case "mastercard": return "💳"
      case "paypal": return "🏦"
      default: return "💳"
    }
  }

  const handlePaymentSelect = (paymentId: string) => {
    setSelectedPayment(paymentId)
    setIsProcessing(true)

    if (selectedPayment && !isProcessing) {
      setIsProcessing(true)
      // Simulate step-by-step processing
      const stepInterval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= 2) {
            clearInterval(stepInterval)
            return prev
          }
          return prev + 1
        })
      }, 2000)
      
      return () => clearInterval(stepInterval)
    }
  }

  const getStepStatus = (stepIndex: number) => {
    if (!isProcessing) return "pending"
    if (stepIndex < currentStep) return "completed"
    if (stepIndex === currentStep) return "processing"
    return "pending"
  }

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
                <h2 className="text-xl font-bold">
                  {!selectedPayment ? "Select Payment Method" : "Confirm & Pay"}
                </h2>
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

            <div className="px-6 py-4">
              {/* Service Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={therapist.image}
                    alt={therapist.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{therapist.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{therapist.rating} • {therapist.reviews} reviews</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{service?.name || "Massage Session"}</span>
                    <span className="font-medium">R{service?.price || "350"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service Fee</span>
                    <span className="font-medium">R{Math.round((service?.price || 350) * 0.15)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-green-600">
                      R{Math.round((service?.price || 350) * 1.15)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Method Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg">Payment Method</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onManagePayment}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Plus size={16} className="mr-1" />
                    Manage
                  </Button>
                </div>

                {/* Payment Methods List */}
                <div className="space-y-2">
                  {paymentMethods.map((payment) => (
                    <div
                      key={payment.id}
                      className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                        selectedPayment === payment.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handlePaymentSelect(payment.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center">
                            <span className="text-sm">{getCardIcon(payment.type)}</span>
                          </div>
                          <div>
                            <div className="font-medium">
                              {payment.type.charAt(0).toUpperCase() + payment.type.slice(1)} •••• {payment.last4}
                            </div>
                            <div className="text-sm text-gray-500">
                              Expires {payment.expiry}
                              {payment.isDefault && (
                                <span className="ml-2 text-blue-600">Default</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {selectedPayment === payment.id && (
                          <Check className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Payment Method */}
                <Button
                  variant="outline"
                  className="w-full mt-3 border-dashed border-2 border-gray-300 hover:border-gray-400 bg-transparent"
                  onClick={onManagePayment}
                >
                  <Plus size={16} className="mr-2" />
                  Add Payment Method
                </Button>
              </div>

              {/* Loading Animation - Only show after payment selection */}
              {selectedPayment && (
                <div className="text-center py-4 border-t">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full animate-pulse" />
                      </div>
                      <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" />
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2">Securing your booking</h3>
                  <p className="text-gray-600 mb-4">
                    We're confirming {therapist.name}'s availability and processing your payment...
                  </p>

                  {/* Progress Steps */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        getStepStatus(0) === "completed" ? "bg-green-500" : 
                        getStepStatus(0) === "processing" ? "bg-blue-500 animate-pulse" : "bg-gray-300"
                      }`}>
                        {getStepStatus(0) === "completed" ? (
                          <Check className="w-4 h-4 text-white" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className={`text-sm ${
                        getStepStatus(0) === "processing" ? "text-blue-600 font-medium" : 
                        getStepStatus(0) === "completed" ? "text-green-600" : "text-gray-500"
                      }`}>
                        Payment processing
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        getStepStatus(1) === "completed" ? "bg-green-500" : 
                        getStepStatus(1) === "processing" ? "bg-blue-500 animate-pulse" : "bg-gray-300"
                      }`}>
                        {getStepStatus(1) === "completed" ? (
                          <Check className="w-4 h-4 text-white" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className={`text-sm ${
                        getStepStatus(1) === "processing" ? "text-blue-600 font-medium" : 
                        getStepStatus(1) === "completed" ? "text-green-600" : "text-gray-500"
                      }`}>
                        Confirming therapist availability
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        getStepStatus(2) === "completed" ? "bg-green-500" : 
                        getStepStatus(2) === "processing" ? "bg-blue-500 animate-pulse" : "bg-gray-300"
                      }`}>
                        {getStepStatus(2) === "completed" ? (
                          <Check className="w-4 h-4 text-white" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className={`text-sm ${
                        getStepStatus(2) === "processing" ? "text-blue-600 font-medium" : 
                        getStepStatus(2) === "completed" ? "text-green-600" : "text-gray-500"
                      }`}>
                        Securing your time slot
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mb-4">
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
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Cancel Booking
                  </Button>

                  {/* Security Badge */}
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-center gap-2 text-green-700">
                      <Check size={16} />
                      <span className="text-sm font-medium">Payment secured with encryption</span>
                    </div>
                  </div>

                  {/* Estimated Time */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center gap-2 text-blue-700">
                      <Clock size={16} />
                      <span className="text-sm font-medium">
                        Usually confirmed within {therapist.responseTime || 2} minutes
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Select Payment Prompt */}
              {!selectedPayment && (
                <div className="text-center py-8 border-t">
                  <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Select a payment method to continue</h3>
                  <p className="text-gray-600 mb-6">
                    Choose your preferred payment method to secure your booking with {therapist.name}
                  </p>
                  <Button
                    variant="ghost"
                    onClick={onCancel}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Cancel Booking
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
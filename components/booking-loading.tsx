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

  // Remove the useEffect that automatically triggers processing
  // Processing should only start when handlePaymentSelect is called

  const handlePaymentSelect = (paymentId: string) => {
    setSelectedPayment(paymentId)
    setIsProcessing(true)
    
    // Start the step-by-step processing immediately when payment is selected
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= 2) {
          clearInterval(stepInterval)
          return prev
        }
        return prev + 1
      })
    }, 2000)
    
    // Cleanup interval when component unmounts or payment changes
    return () => clearInterval(stepInterval)
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
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={onCancel}
          />
          
          {/* Main Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md max-h-[85vh] overflow-hidden bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col"
          >
            {/* Header */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {!selectedPayment ? "Select Payment" : "Confirm Booking"}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {!selectedPayment ? "Choose how you'd like to pay" : "Securing your appointment"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onCancel}
                  className="h-8 w-8 rounded-full hover:bg-gray-100"
                >
                  <X size={18} />
                </Button>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {/* Therapist & Service Summary */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={therapist.image}
                      alt={therapist.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{therapist.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                        <span>{therapist.rating} • {therapist.reviews} reviews</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{service?.name || "Therapy Session"}</span>
                      <span className="font-medium text-gray-900">R{service?.price || "350"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Service Fee</span>
                      <span className="font-medium text-gray-900">R{Math.round((service?.price || 350) * 0.15)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between items-center font-semibold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-green-600 text-base">
                        R{Math.round((service?.price || 350) * 1.15)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Method Section */}
                {!selectedPayment ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg text-gray-900">Payment Method</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onManagePayment}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm h-8 px-3"
                      >
                        <Plus size={14} className="mr-1" />
                        Manage
                      </Button>
                    </div>

                    {/* Payment Methods List */}
                    <div className="space-y-2">
                      {paymentMethods.map((payment) => (
                        <div
                          key={payment.id}
                          className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                            selectedPayment === payment.id
                              ? "border-blue-500 bg-blue-50 shadow-sm"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          }`}
                          onClick={() => handlePaymentSelect(payment.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center border">
                                <span className="text-sm">{getCardIcon(payment.type)}</span>
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium text-gray-900 truncate">
                                  {payment.type.charAt(0).toUpperCase() + payment.type.slice(1)} •••• {payment.last4}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center gap-2">
                                  <span>Expires {payment.expiry}</span>
                                  {payment.isDefault && (
                                    <span className="text-blue-600 text-xs font-medium bg-blue-100 px-2 py-0.5 rounded-full">
                                      Default
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {selectedPayment === payment.id && (
                              <Check className="h-5 w-5 text-blue-500 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Payment Method */}
                    <Button
                      variant="outline"
                      className="w-full h-12 border-dashed border-2 border-gray-300 hover:border-gray-400 bg-transparent text-gray-600 hover:text-gray-700"
                      onClick={onManagePayment}
                    >
                      <Plus size={16} className="mr-2" />
                      Add Payment Method
                    </Button>

                    {/* Security Note */}
                    <div className="text-center pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Your payment is secured with bank-level encryption
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Processing State */
                  <div className="space-y-6">
                    {/* Loading Animation */}
                    <div className="text-center py-4">
                      <div className="flex justify-center mb-4">
                        <div className="relative">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <div className="w-8 h-8 bg-green-500 rounded-full animate-pulse" />
                          </div>
                          <div className="absolute inset-0 border-4 border-transparent border-t-green-500 rounded-full animate-spin" />
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Securing your booking</h3>
                      <p className="text-gray-600 text-sm">
                        We're confirming {therapist.name}'s availability and processing your payment...
                      </p>
                    </div>

                    {/* Progress Steps */}
                    <div className="space-y-4">
                      {[
                        { label: "Payment processing" },
                        { label: "Confirming therapist availability" },
                        { label: "Securing your time slot" }
                      ].map((step, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                            getStepStatus(index) === "completed" ? "bg-green-500" : 
                            getStepStatus(index) === "processing" ? "bg-green-500 animate-pulse" : "bg-gray-300"
                          }`}>
                            {getStepStatus(index) === "completed" ? (
                              <Check className="w-4 h-4 text-white" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                          <span className={`text-sm transition-all duration-300 ${
                            getStepStatus(index) === "processing" ? "text-green-600 font-medium" : 
                            getStepStatus(index) === "completed" ? "text-green-600" : "text-gray-500"
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={onContact}
                        className="flex-1 flex items-center gap-2 h-12 border-2"
                      >
                        <MessageCircle size={18} />
                        Message
                      </Button>
                      <Button
                        variant="outline"
                        onClick={onContact}
                        className="flex-1 flex items-center gap-2 h-12 border-2"
                      >
                        <Phone size={18} />
                        Call
                      </Button>
                    </div>

                    {/* Security & Timing Info */}
                    <div className="space-y-3">
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 text-green-700">
                          <Check size={16} />
                          <span className="text-sm font-medium">Payment secured with encryption</span>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 text-blue-700">
                          <Clock size={16} />
                          <span className="text-sm font-medium">
                            Usually confirmed within {therapist.responseTime || 2} minutes
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Cancel Button */}
                    <Button
                      variant="outline"
                      onClick={onCancel}
                      className="w-full h-12 text-red-600 hover:text-red-700 hover:bg-red-50 border-2 border-red-200"
                    >
                      Cancel Booking
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
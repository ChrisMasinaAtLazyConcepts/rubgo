"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Check, Shield, Lock, Sparkles, User, Clock, MapPin } from "lucide-react"

function PaymentProcessingContent() {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(1)
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get parameters from URL
  const therapistName = searchParams.get('therapist') || "Massage Therapist"
  const serviceName = searchParams.get('service') || "Relaxation Massage"
  const servicePrice = searchParams.get('price') || "350"
  const duration = searchParams.get('duration') || "60 minutes"

  const steps = [
    { id: 1, name: "Payment Initiated", description: "Starting secure transaction" },
    { id: 2, name: "Processing Payment", description: "Verifying card details" },
    { id: 3, name: "Security Verification", description: "Ensuring transaction safety" },
    { id: 4, name: "Confirming Booking", description: "Securing your time slot" },
    { id: 5, name: "Notifying Therapist", description: "Alerting your massage therapist" }
  ]

  useEffect(() => {
    // Simulate payment processing
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          // Redirect to success page after completion
          setTimeout(() => {
            router.push(`/bookings/confirmed?therapist=${encodeURIComponent(therapistName)}&service=${encodeURIComponent(serviceName)}`)
          }, 1500)
          return 100
        }
        return prev + 1
      })
    }, 120)

    // Simulate step progression
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length) {
          clearInterval(stepInterval)
          return prev
        }
        return prev + 1
      })
    }, 2000)

    return () => {
      clearInterval(interval)
      clearInterval(stepInterval)
    }
  }, [router, therapistName, serviceName])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Booking Confirmation</h1>
                <p className="text-blue-100">Securing your massage appointment</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">R{servicePrice}</div>
              <div className="text-blue-100 text-sm">One-time payment</div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2">
          {/* Left Side - Animation */}
          <div className="bg-gradient-to-br from-blue-50 to-green-50 p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="relative">
                <div className="w-64 h-64 mx-auto mb-6 relative">
                  <div className="absolute inset-0 bg-blue-200 rounded-full animate-ping opacity-20"></div>
                  <div className="absolute inset-4 bg-gradient-to-br from-blue-400 to-green-400 rounded-full flex items-center justify-center">
                    <div className="text-white text-center">
                      <Sparkles className="h-12 w-12 mx-auto mb-2 animate-pulse" />
                      <div className="text-sm font-semibold">Processing</div>
                    </div>
                    <div className="absolute inset-0 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full animate-bounce"></div>
                  <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="absolute -top-2 -left-2 w-4 h-4 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Processing...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center text-sm text-gray-600">
                <Shield className="h-4 w-4 mr-1 text-green-500" />
                <span>Secure encrypted connection</span>
              </div>
            </div>
          </div>

          {/* Right Side - Service Info & Steps */}
          <div className="p-8">
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{therapistName}</h2>
                  <p className="text-gray-600">Licensed Massage Therapist</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-900 text-lg">{serviceName}</h3>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2 text-blue-500" />
                  <span>{duration}</span>
                </div>
                <div className="flex items-center text-sm text-green-600">
                  <Check className="h-4 w-4 mr-1" />
                  <span>Professional equipment • Sanitized</span>
                </div>
              </div>
            </div>

            {/* Processing Steps */}
            <div className="space-y-6">
              <h3 className="font-semibold text-gray-900">Booking Steps</h3>
              {steps.map((step) => (
                <div key={step.id} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= step.id ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {currentStep > step.id ? <Check className="h-4 w-4" /> : <span className="text-sm font-semibold">{step.id}</span>}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'}`}>
                      {step.name}
                    </div>
                    <div className={`text-sm ${currentStep >= step.id ? 'text-gray-600' : 'text-gray-400'}`}>
                      {step.description}
                    </div>
                    {currentStep === step.id && (
                      <div className="flex space-x-1 mt-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="h-3 w-3 text-blue-600" />
                </div>
                <div className="text-sm text-blue-800">
                  <div className="font-semibold">Your booking is being secured</div>
                  <div className="mt-1">
                    This may take 10-30 seconds. Please don't close this window. 
                    You'll receive confirmation shortly.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Lock className="h-3 w-3 text-green-500" />
                <span>SSL Secured</span>
              </div>
              <div>•</div>
              <div>PayFast Certified</div>
            </div>
            <div>Booking ID: #{Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
          </div>
        </div>
      </div>

      <div className="fixed top-10 left-10 w-20 h-20 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      <div className="fixed bottom-10 right-10 w-20 h-20 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="fixed top-1/2 left-1/4 w-16 h-16 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '4s' }}></div>
    </div>
  )
}

// Loading component for payment processing
function PaymentLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Preparing payment...</p>
      </div>
    </div>
  )
}

export default function PaymentProcessing() {
  return (
    <Suspense fallback={<PaymentLoading />}>
      <PaymentProcessingContent />
    </Suspense>
  )
}
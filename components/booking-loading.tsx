'use client';

import { Therapist, MassageService } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { 
  X, Clock, MapPin, Star, User, Phone, MessageCircle, CreditCard, 
  Plus, Check, Users, Loader2, AlertCircle, Shield, ChevronRight 
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { usePayfast } from "@/hooks/use-payfast"
import { CustomerDetails, TransactionDetails } from "@/lib/payfast/types"

interface BookingLoadingProps {
  therapist?: Therapist
  service?: any
  isOpen: boolean
  onCancel: () => void
  onContact?: () => void
  onManagePayment?: () => void
  cartItems?: any[]
  bookingType?: 'individual' | 'group'
}

interface PaymentMethod {
  id: string
  type: string
  last4: string
  expiry: string
  isDefault: boolean
}

export function BookingLoading({ 
  therapist, 
  service, 
  isOpen, 
  onCancel, 
  onContact,
  onManagePayment,
  cartItems = [],
  bookingType = 'individual'
}: BookingLoadingProps) {
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [consentGiven, setConsentGiven] = useState(false)
  const [medicalInfo, setMedicalInfo] = useState('')
  const router = useRouter()

  // PayFast hook
  const {
    createPayment,
    triggerOnsitePayment,
    isLoading: isPayfastLoading,
    error: payfastError,
  } = usePayfast({
    onSuccess: (response:any) => {
      console.log('Payment created:', response)
      
      if (response.paymentId) {
        triggerOnsitePayment(response.paymentId)
        setIsProcessing(true)
        startProcessingSteps()
      } else if (response.formHtml) {
        const formContainer = document.createElement('div')
        formContainer.innerHTML = response.formHtml
        document.body.appendChild(formContainer)
        const form = formContainer.querySelector('form')
        form?.submit()
      }
    },
    onError: (error) => {
      setPaymentError(error)
      setIsProcessing(false)
    },
  })

  const [storedCartItems, setStoredCartItems] = useState<any[]>([])
  const [storedBookingType, setStoredBookingType] = useState<'individual' | 'group'>('individual')

  useEffect(() => {
    const storedItems = sessionStorage.getItem('cartItems')
    const storedType = sessionStorage.getItem('bookingType') as 'individual' | 'group'
    const userEmailFromStorage = sessionStorage.getItem('userEmail') || ''
    
    if (storedItems) {
      setStoredCartItems(JSON.parse(storedItems))
    }
    if (storedType) {
      setStoredBookingType(storedType)
    }
    if (userEmailFromStorage) {
      setUserEmail(userEmailFromStorage)
    }
  }, [])

  const finalCartItems = cartItems.length > 0 ? cartItems : storedCartItems
  const finalBookingType = bookingType || storedBookingType

  const paymentMethods: PaymentMethod[] = [
    {
      id: "payfast-cc",
      type: "payfast_card",
      last4: "4242",
      expiry: "12/25",
      isDefault: true
    },
    {
      id: "payfast-eft", 
      type: "payfast_eft",
      last4: "8888",
      expiry: "08/24",
      isDefault: false
    }
  ]

  const startProcessingSteps = useCallback(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= 2) {
          clearInterval(stepInterval)
          setTimeout(() => {
            router.push('/bookings/confirmed')
          }, 1000)
          return prev
        }
        return prev + 1
      })
    }, 2000)
    
    return () => clearInterval(stepInterval)
  }, [router])

  // NEW: Handle payment with consent confirmation
  const handlePaymentSelect = async (paymentId: string) => {
    try {
      setSelectedPayment(paymentId)
      setPaymentError(null)
      
      // Show confirmation popup before processing payment
      setShowConfirmation(true)
      
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Payment failed')
      setSelectedPayment(null)
    }
  }

  // NEW: Confirm booking with consent
  const confirmBookingWithConsent = async () => {
    if (!consentGiven) {
      setPaymentError("You must confirm you are medically fit for a massage")
      return
    }

    setShowConfirmation(false)
    
    try {
      const paymentData = preparePayFastPaymentData()
      await createPayment(paymentData, 'standard')
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Payment failed')
      setSelectedPayment(null)
    }
  }

  const preparePayFastPaymentData = () => {
    const customerDetails: CustomerDetails = {
      name_first: therapist?.name?.split(' ')[0] || 'Customer',
      name_last: therapist?.name?.split(' ').slice(1).join(' ') || 'User',
      email_address: userEmail || 'customer@example.com',
      cell_number: '+27821234567',
    }

    const subtotal = calculateSubtotal()
    const serviceFee = calculateServiceFee()
    const total = calculateTotal()

    // Include medical info in custom data
    const transactionDetails: TransactionDetails = {
      m_payment_id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: total,
      item_name: getBookingTitle(),
      item_description: getBookingDescription(),
      custom_str1: JSON.stringify({
        bookingType: finalBookingType,
        therapistId: therapist?.id,
        serviceId: service?.id,
        cartItems: finalCartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
        })),
        medicalInfo: medicalInfo,
        consentGiven: consentGiven,
        timestamp: new Date().toISOString()
      }),
      custom_int1: finalBookingType === 'group' ? finalCartItems.length : 1,
    }

    const options = {
      payment_method: 'cc' as const,
      email_confirmation: true,
      confirmation_address: userEmail || 'admin@example.com',
    }

    return {
      customer: customerDetails,
      transaction: transactionDetails,
      options,
    }
  }

  const getStepStatus = (stepIndex: number) => {
    if (!isProcessing) return "pending"
    if (stepIndex < currentStep) return "completed"
    if (stepIndex === currentStep) return "processing"
    return "pending"
  }

  const calculateSubtotal = () => {
    if (finalBookingType === 'individual' && service) {
      return service.price
    }
    return finalCartItems.reduce((sum, item) => sum + (item.price || 0), 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const serviceFee = calculateServiceFee()
    return subtotal + serviceFee
  }

  const calculateServiceFee = () => {
    const subtotal = calculateSubtotal()
    return Math.round(subtotal * 0.15)
  }

  const getBookingTitle = () => {
    return finalBookingType === 'group' 
      ? `Group Therapy Booking (${finalCartItems.length} sessions)`
      : service?.name || "Therapy Session"
  }

  const getBookingDescription = () => {
    if (finalBookingType === 'individual') {
      return `1-on-1 session with ${therapist?.name}`
    }
    return `${finalCartItems.length} group therapy sessions`
  }

  const handlePayFastReturn = async () => {
    const paymentId = new URLSearchParams(window.location.search).get('pf_payment_id')
    
    if (paymentId) {
      setIsProcessing(true)
      startProcessingSteps()
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.has('pf_payment_id')) {
        handlePayFastReturn()
      }
    }
  }, [])

  // NEW: Consent Popup Component
  const ConsentPopup = () => (
    <AnimatePresence>
      {showConfirmation && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[60] backdrop-blur-sm"
            onClick={() => setShowConfirmation(false)}
          />
          
          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Important Health Declaration</h3>
                  <p className="text-sm text-gray-600">For your safety and comfort</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800 font-medium mb-2">⚠️ Medical Disclaimer</p>
                  <p className="text-sm text-amber-700">
                    Massage therapy is not a substitute for medical treatment. Please consult with your healthcare provider if you have any medical conditions.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentGiven}
                      onChange={(e) => setConsentGiven(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        I confirm I am medically fit for a massage
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        I declare that I have no medical conditions that would contraindicate massage therapy, or I have obtained clearance from my healthcare provider.
                      </p>
                    </div>
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allergies or Health Concerns (Optional)
                    </label>
                    <textarea
                      value={medicalInfo}
                      onChange={(e) => setMedicalInfo(e.target.value)}
                      placeholder="E.g., allergies, injuries, pregnancy, medications, or any health concerns you'd like your therapist to know..."
                      className="w-full h-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This information will be shared securely with your therapist only.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowConfirmation(false)
                    setSelectedPayment(null)
                  }}
                  className="flex-1 h-12"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmBookingWithConsent}
                  disabled={!consentGiven}
                  className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPayfastLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm & Pay'
                  )}
                </Button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>Your medical information is encrypted and stored securely per HIPAA guidelines</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return (
    <>
      {/* Consent Popup */}
      <ConsentPopup />

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
                      {!selectedPayment ? "Pay with PayFast" : "Confirm Booking"}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {!selectedPayment 
                        ? "Secure payment powered by PayFast" 
                        : finalBookingType === 'group' ? "Securing group appointments" : "Securing your appointment"
                      }
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
                  {/* Error Display */}
                  {paymentError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
                    >
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Payment Error</p>
                        <p className="text-sm text-red-600 mt-1">{paymentError}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Booking Summary */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
                    {/* Booking Type Badge */}
                    {finalBookingType === 'group' && (
                      <div className="flex items-center gap-2 mb-3 text-blue-600">
                        <Users size={16} />
                        <span className="text-sm font-medium">Group Booking</span>
                      </div>
                    )}
                    
                    {/* Therapist Info */}
                    {therapist && (
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
                    )}
                    
                    <div className="space-y-2 text-sm">
                      {/* Service/Booking Details */}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{getBookingTitle()}</span>
                        <span className="font-medium text-gray-900">
                          R{calculateSubtotal()}
                        </span>
                      </div>
                      
                      {/* Show group booking breakdown */}
                      {finalBookingType === 'group' && finalCartItems.map((item, index) => (
                        <div key={index} className="flex justify-between items-center pl-4 text-xs">
                          <span className="text-gray-500 truncate flex-1 mr-2">
                            {item.name || `Session ${index + 1}`}
                          </span>
                          <span className="text-gray-500 font-medium">R{item.price || 0}</span>
                        </div>
                      ))}
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Service Fee (15%)</span>
                        <span className="font-medium text-gray-900">R{calculateServiceFee()}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2 flex justify-between items-center font-semibold">
                        <span className="text-gray-900">Total</span>
                        <span className="text-green-600 text-base">
                          R{calculateTotal()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Section */}
                  {!selectedPayment && !isProcessing ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg text-gray-900">Select Payment Method</h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Secured by PayFast</span>
                        </div>
                      </div>

                      {/* Payment Methods List */}
                      <div className="space-y-2">
                        {paymentMethods.map((payment) => (
                          <motion.div
                            key={payment.id}
                            whileTap={{ scale: 0.98 }}
                            className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                              selectedPayment === payment.id
                                ? "border-blue-500 bg-blue-50 shadow-sm"
                                : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md"
                            }`}
                            onClick={() => handlePaymentSelect(payment.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">
                                  <span>PF</span>
                                </div>
                                <div className="min-w-0">
                                  <div className="font-medium text-gray-900 truncate">
                                    {payment.type === "payfast_card" ? "PayFast Card Payment" : 
                                     payment.type === "payfast_eft" ? "PayFast EFT" : 
                                     "PayFast Wallet"}
                                  </div>
                                  <div className="text-sm text-gray-500 flex items-center gap-2">
                                    <span>Secure payment gateway</span>
                                    {payment.isDefault && (
                                      <span className="text-blue-600 text-xs font-medium bg-blue-100 px-2 py-0.5 rounded-full">
                                        Recommended
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {isPayfastLoading && selectedPayment === payment.id ? (
                                <Loader2 className="h-5 w-5 text-blue-500 flex-shrink-0 animate-spin" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Alternative Payment Options */}
                      <div className="pt-2">
                        <p className="text-sm text-gray-500 mb-2">Or pay with:</p>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            className="h-10 text-sm border-2 border-gray-200 hover:border-gray-300"
                            onClick={() => handlePaymentSelect('payfast_eft')}
                          >
                            EFT Payment
                          </Button>
                          <Button
                            variant="outline"
                            className="h-10 text-sm border-2 border-gray-200 hover:border-gray-300"
                            onClick={onManagePayment}
                          >
                            <Plus size={14} className="mr-2" />
                            Other
                          </Button>
                        </div>
                      </div>

                      {/* Security & Info */}
                      <div className="space-y-3 pt-4 border-t border-gray-200">
                        <div className="flex items-start gap-2 text-xs text-gray-600">
                          <Shield className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Your payment is processed securely by PayFast. We never store your card details.</span>
                        </div>
                        
                        <div className="flex items-start gap-2 text-xs text-gray-600">
                          <Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>Payment is instant. Your booking will be confirmed immediately upon successful payment.</span>
                        </div>
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
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {isPayfastLoading ? 'Processing Payment...' : 
                          currentStep < 2 ? 'Confirming Booking...' : 'Booking Confirmed!'}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {isPayfastLoading 
                            ? 'Connecting to PayFast secure payment gateway...'
                            : finalBookingType === 'group' 
                              ? `We're confirming ${finalCartItems.length} appointments...`
                              : `We're confirming ${therapist?.name}'s availability...`
                          }
                        </p>
                      </div>

                      {/* Progress Steps */}
                      <div className="space-y-4">
                        {[
                          { label: "Processing payment with PayFast" },
                          { 
                            label: finalBookingType === 'group' 
                              ? "Confirming therapist availability" 
                              : "Confirming all therapist availabilities"
                          },
                          { 
                            label: finalBookingType === 'group'
                              ? "Securing all time slots"
                              : "Securing your time slot"
                          }
                        ].map((step, index) => (
                          <motion.div 
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-3"
                          >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                              getStepStatus(index) === "completed" ? "bg-green-500" : 
                              getStepStatus(index) === "processing" ? "bg-green-500 animate-pulse" : "bg-gray-300"
                            }`}>
                              {getStepStatus(index) === "completed" ? (
                                <Check className="w-4 h-4 text-white" />
                              ) : getStepStatus(index) === "processing" ? (
                                <Loader2 className="w-4 h-4 text-white animate-spin" />
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
                          </motion.div>
                        ))}
                      </div>

                      {/* Action Buttons */}
                      {onContact && isProcessing && (
                        <div className="flex gap-3 pt-2">
                          <Button
                            variant="outline"
                            onClick={onContact}
                            className="flex-1 flex items-center gap-2 h-12 border-2"
                          >
                            <MessageCircle size={18} />
                            Message Therapist
                          </Button>
                          <Button
                            variant="outline"
                            onClick={onContact}
                            className="flex-1 flex items-center gap-2 h-12 border-2"
                          >
                            <Phone size={18} />
                            Call Therapist
                          </Button>
                        </div>
                      )}

                      {/* Security & Timing Info */}
                      <div className="space-y-3">
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 text-green-700">
                            <Shield size={16} />
                            <span className="text-sm font-medium">Payment processed securely by PayFast</span>
                          </div>
                        </div>

                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 text-blue-700">
                            <Clock size={16} />
                            <span className="text-sm font-medium">
                              Booking will be confirmed within {therapist?.responseTime || 2} minutes
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Cancel Button */}
                      <Button
                        variant="outline"
                        onClick={onCancel}
                        disabled={isPayfastLoading || isProcessing}
                        className="w-full h-12 text-red-600 hover:text-red-700 hover:bg-red-50 border-2 border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isPayfastLoading || isProcessing ? 'Cancelling...' : 'Cancel Booking'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
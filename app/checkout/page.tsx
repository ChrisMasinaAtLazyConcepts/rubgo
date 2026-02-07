'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Loader2, CreditCard, Shield, CheckCircle, AlertCircle, ArrowLeft, ShoppingCart, Clock, MapPin, User,Users, Calendar, Phone, Mail } from "lucide-react"

interface CartItem {
  id: string
  name: string
  description: string
  type: 'single' | 'group'
  participants?: number
  total: number
  therapist?: {
    id: string
    name: string
    image: string
  }
  date?: string
  time?: string
  location?: string
}

interface PaymentMethod {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  type: 'card' | 'payfast' | 'cash'
}

interface CustomerInfo {
  name: string
  email: string
  phone: string
  address?: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export default function CheckoutPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: ''
  })
  const [selectedPayment, setSelectedPayment] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Pay securely with your card',
      icon: <CreditCard className="w-6 h-6 text-blue-600" />,
      type: 'card'
    },
    {
      id: 'payfast',
      name: 'PayFast',
      description: 'Secure online payments',
      icon: <Shield className="w-6 h-6 text-green-600" />,
      type: 'payfast'
    },
    {
      id: 'cash',
      name: 'Cash on Delivery',
      description: 'Pay when therapist arrives',
      icon: <CreditCard className="w-6 h-6 text-yellow-600" />,
      type: 'cash'
    }
  ]

  // Load cart items from session storage
  useEffect(() => {
    const loadCartData = () => {
      try {
        const savedCart = sessionStorage.getItem('cartItems')
        const savedCustomer = sessionStorage.getItem('customerInfo')
        
        if (savedCart) {
          const items = JSON.parse(savedCart)
          setCartItems(items)
        }
        
        if (savedCustomer) {
          setCustomerInfo(JSON.parse(savedCustomer))
        } else {
          // Try to get from localStorage (user data)
          const user = localStorage.getItem('user')
          if (user) {
            const userData = JSON.parse(user)
            setCustomerInfo({
              name: userData.name || '',
              email: userData.email || '',
              phone: userData.phone || ''
            })
          }
        }
      } catch (error) {
        console.error('Error loading cart data:', error)
        toast.error('Failed to load cart items')
      } finally {
        setIsLoading(false)
      }
    }

    loadCartData()
  }, [])

  // Calculate totals
  const cartTotal = cartItems.reduce((sum, item) => sum + item.total, 0)
  const serviceFee = cartTotal * 0.1 // 10% service fee
  const grandTotal = cartTotal + serviceFee

  // Handle payment confirmation
  const handleConfirmPayment = async () => {
    if (!selectedPayment) {
      toast.error('Please select a payment method')
      return
    }

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      toast.error('Please complete your contact information')
      return
    }

    setIsProcessing(true)

    try {
      // Prepare payment data
      const paymentData = {
        cartItems,
        customerInfo,
        paymentMethod: selectedPayment,
        totals: {
          subtotal: cartTotal,
          serviceFee,
          total: grandTotal
        },
        orderId: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }

      // Call payment API
      const response = await fetch(`${API_BASE_URL}/payments/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify(paymentData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Payment processing failed')
      }

      // Handle different payment methods
      if (selectedPayment === 'apple') {
        // For Apple Pay, redirect to their payment page
        window.location.href = result.redirectUrl
        return
      } else if (selectedPayment === 'card') {
        // For card payments, show card form modal
        // In a real implementation, you'd integrate with Stripe, PayFast Card, etc.
        await handleCardPayment(result.paymentIntent)
      }

      // Store order details
      setOrderDetails(result.order)
      
      // Clear cart
      sessionStorage.removeItem('cartItems')
      
      // Redirect to confirmation
      router.push('/bookings/confirmed')
      
    } catch (error: any) {
      console.error('Payment error:', error)
      toast.error(error.message || 'Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle card payment (simplified)
  const handleCardPayment = async (paymentIntent: any) => {
    // In a real implementation, you'd use Stripe Elements or similar
    // This is a simplified example
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true })
      }, 2000)
    })
  }

  // Handle cash order
  const handleCashOrder = async (order: any) => {
    // Store cash order in session for confirmation page
    sessionStorage.setItem('cashOrder', JSON.stringify(order))
  }

  // Update customer info
  const updateCustomerInfo = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Save to session storage
    sessionStorage.setItem('customerInfo', JSON.stringify({
      ...customerInfo,
      [field]: value
    }))
  }

  // Card Payment Modal Component
  const CardPaymentModal = () => {
    const [cardNumber, setCardNumber] = useState('')
    const [expiry, setExpiry] = useState('')
    const [cvc, setCvc] = useState('')
    const [nameOnCard, setNameOnCard] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      
      // Validate card details
      if (!cardNumber || !expiry || !cvc || !nameOnCard) {
        toast.error('Please fill all card details')
        return
      }

      // Process card payment
      // In a real implementation, this would tokenize with Stripe/PayFast
      
      toast.success('Card payment processed successfully!')
      // Continue with order creation
    }

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
        >
          <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6 rounded-t-2xl">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Enter Card Details</h3>
                <p className="text-green-600 text-sm">Secure payment powered by PayFast</p>
              </div>
              <button
                onClick={() => setSelectedPayment('')}
                className="p-2 hover:bg-blue-500 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={16}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    value={expiry}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '')
                      if (value.length >= 2) {
                        value = value.slice(0, 2) + '/' + value.slice(2, 4)
                      }
                      setExpiry(value.slice(0, 5))
                    }}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="cvc">CVC</Label>
                  <Input
                    id="cvc"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    placeholder="123"
                    maxLength={3}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="nameOnCard">Name on Card</Label>
                <Input
                  id="nameOnCard"
                  value={nameOnCard}
                  onChange={(e) => setNameOnCard(e.target.value)}
                  placeholder="John Smith"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm">Your payment is secured with 256-bit SSL encryption</span>
              </div>
            </div>

            <Button
             onClick={() => setSelectedPayment('card')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Continue
            </Button>
          </form>
        </motion.div>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    )
  }

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">
              Add massage sessions to your cart to proceed with checkout
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/home')}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Browse Massage Services
              </Button>
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="w-full border-gray-300"
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-green-500 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Checkout</h1>
              <p className="text-green-100 mt-1">Complete your booking</p>
            </div>
            <div className="text-right">
              <p className="text-sm">Order Total</p>
              <p className="text-2xl font-bold">R{grandTotal.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-green-600" />
                  Order Summary
                </h2>
                
                <div className="space-y-4">
                  {cartItems.map((item, index) => (
                    <div key={item.id} className="border border-gray-200 rounded-xl p-4 hover:border-green-200 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          
                          {/* Item Details */}
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            {item.therapist && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <User className="w-4 h-4" />
                                <span>{item.therapist.name}</span>
                              </div>
                            )}
                            
                            {item.date && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span>{item.date}</span>
                              </div>
                            )}
                            
                            {item.time && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span>{item.time}</span>
                              </div>
                            )}
                            
                            {item.location && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span>{item.location}</span>
                              </div>
                            )}
                          </div>
                          
                          {item.type === 'group' && (
                            <div className="mt-2">
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                <Users className="w-3 h-3" />
                                {item.participants} {item.participants === 1 ? 'person' : 'people'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-green-600 text-lg">R{item.total}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Totals */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>R{cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Service Fee</span>
                      <span>R{serviceFee.toFixed(2)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount</span>
                      <span className="text-green-600">R{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) => updateCustomerInfo('name', e.target.value)}
                      placeholder="John Smith"
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => updateCustomerInfo('email', e.target.value)}
                      placeholder="john@example.com"
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={customerInfo.phone}
                      onChange={(e) => updateCustomerInfo('phone', e.target.value)}
                      placeholder="+27 12 345 6789"
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address (Optional)</Label>
                    <Input
                      id="address"
                      value={customerInfo.address || ''}
                      onChange={(e) => updateCustomerInfo('address', e.target.value)}
                      placeholder="Your address for delivery"
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Payment */}
          <div className="space-y-6">
            {/* Payment Methods */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm sticky top-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
                
                <RadioGroup
                  value={selectedPayment}
                  onValueChange={setSelectedPayment}
                  className="space-y-3"
                >
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                        selectedPayment === method.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                      onClick={() => setSelectedPayment(method.id)}
                    >
                      <RadioGroupItem value={method.id} id={method.id} />
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          {method.icon}
                        </div>
                        <div className="flex-1">
                          <Label
                            htmlFor={method.id}
                            className="font-medium text-gray-900 cursor-pointer"
                          >
                            {method.name}
                          </Label>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>

                {/* Payment Security */}
                <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Secure Payment</p>
                      <p className="text-sm text-gray-600">Your payment is protected by 256-bit SSL encryption</p>
                    </div>
                  </div>
                </div>

                {/* Total and Pay Button */}
                <div className="mt-6 space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total to pay</p>
                    <p className="text-3xl font-bold text-green-600">R{grandTotal.toFixed(2)}</p>
                  </div>

                  <Button
                    onClick={handleConfirmPayment}
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6 h-auto"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5 mr-2" />
                        Pay Securely
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    By completing your purchase, you agree to our Terms of Service
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Help Section */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-3">Need Help?</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Contact our support team:</p>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>+27 11 234 5678</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>support@rubhub.com</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Card Payment Modal */}
      <AnimatePresence>
        {selectedPayment === 'card' && <CardPaymentModal />}
      </AnimatePresence>
    </div>
  )
}

// Missing components that need to be imported/defined
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"

// You'll also need these components in your UI library:
// Button, Card, CardContent, RadioGroup, RadioGroupItem, Label, Separator
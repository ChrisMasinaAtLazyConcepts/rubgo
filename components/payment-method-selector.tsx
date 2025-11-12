"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CreditCard, Building2, Banknote, Plus, Check, Loader2, X, Shield } from "lucide-react"
import { useState } from "react"

interface PaymentMethodSelectorProps {
  value: "eft" | "card" | "cash"
  onChange: (value: "eft" | "card" | "cash") => void
}

interface CardDetails {
  number: string
  expiry: string
  cvv: string
  name: string
  isDefault: boolean
}

const paymentMethods = [
  {
    value: "card" as const,
    label: "Credit / Debit Card",
    description: "Pay securely with your card",
    icon: CreditCard,
  },
  {
    value: "cash" as const,
    label: "Cash Payment",
    description: "Pay in person at our office",
    icon: Banknote,
  },
]

// Mock saved cards
const initialSavedCards: CardDetails[] = [
  {
    number: "4242424242424242",
    expiry: "12/25",
    cvv: "123",
    name: "John Doe",
    isDefault: true
  }
]

export function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  const [savedCards, setSavedCards] = useState<CardDetails[]>(initialSavedCards)
  const [showAddCard, setShowAddCard] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [newCard, setNewCard] = useState<CardDetails>({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
    isDefault: false
  })
  const [errors, setErrors] = useState<Partial<CardDetails>>({})

  const validateCard = (): boolean => {
    const newErrors: Partial<CardDetails> = {}

    // Card number validation (simple Luhn check)
    if (!newCard.number.replace(/\s/g, '').match(/^\d{16}$/)) {
      newErrors.number = "Please enter a valid 16-digit card number"
    }

    // Expiry validation
    if (!newCard.expiry.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
      newErrors.expiry = "Please enter a valid expiry date (MM/YY)"
    }

    // CVV validation
    if (!newCard.cvv.match(/^\d{3,4}$/)) {
      newErrors.cvv = "Please enter a valid CVV"
    }

    // Name validation
    if (!newCard.name.trim()) {
      newErrors.name = "Please enter cardholder name"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddCard = async () => {
    if (!validateCard()) return

    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const cardToAdd = {
      ...newCard,
      number: `•••• •••• •••• ${newCard.number.slice(-4)}`,
      isDefault: savedCards.length === 0
    }

    setSavedCards(prev => [...prev, cardToAdd])
    setNewCard({ number: "", expiry: "", cvv: "", name: "", isDefault: false })
    setShowAddCard(false)
    setIsLoading(false)
    setShowSuccess(true)
    
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19)
  }

  const formatExpiry = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5)
  }

  return (
    <div className="space-y-6">
      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Card Added Successfully!</h3>
            <p className="text-gray-600 text-sm">Your payment method has been saved securely.</p>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
            <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Adding Card...</h3>
            <p className="text-gray-600 text-sm">Securely processing your payment method</p>
          </div>
        </div>
      )}

      <Label className="text-base font-semibold text-gray-900">Payment Method</Label>
      
      <RadioGroup value={value} onValueChange={onChange}>
        {paymentMethods.map((method) => {
          const Icon = method.icon
          return (
            <Card
              key={method.value}
              className={`cursor-pointer transition-all border-2 ${
                value === method.value 
                  ? "border-green-500 bg-green-50 shadow-sm" 
                  : "border-gray-200 hover:border-green-300 bg-white"
              }`}
              onClick={() => onChange(method.value)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <RadioGroupItem 
                    value={method.value} 
                    id={method.value} 
                    className="mt-1 data-[state=checked]:text-green-600" 
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        value === method.value ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={method.value} className="font-semibold text-gray-900 cursor-pointer text-base">
                          {method.label}
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                      </div>
                    </div>
                    
                    {/* Card Selection for Card Payment Method */}
                    {method.value === "card" && value === "card" && (
                      <div className="mt-4 space-y-3">
                        {/* Saved Cards */}
                        {savedCards.map((card, index) => (
                          <Card key={index} className="border border-gray-200 bg-white">
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                                    <CreditCard className="w-3 h-3 text-white" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900 text-sm">{card.number}</p>
                                    <p className="text-xs text-gray-600">Expires {card.expiry}</p>
                                  </div>
                                </div>
                                {card.isDefault && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}

                        {/* Add New Card Button */}
                        {!showAddCard ? (
                          <Button
                            variant="outline"
                            className="w-full border-dashed border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 text-gray-600 h-12"
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowAddCard(true)
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Card
                          </Button>
                        ) : (
                          <Card className="border-2 border-green-200 bg-green-50">
                            <CardContent className="p-4 space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-gray-900">Add New Card</h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setShowAddCard(false)
                                    setErrors({})
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>

                              <div className="space-y-3">
                                <div>
                                  <Label className="text-sm font-medium text-gray-700">Card Number</Label>
                                  <Input
                                    placeholder="1234 5678 9012 3456"
                                    value={newCard.number}
                                    onChange={(e) => setNewCard({
                                      ...newCard,
                                      number: formatCardNumber(e.target.value)
                                    })}
                                    className={errors.number ? "border-red-500" : ""}
                                  />
                                  {errors.number && (
                                    <p className="text-red-500 text-xs mt-1">{errors.number}</p>
                                  )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label className="text-sm font-medium text-gray-700">Expiry Date</Label>
                                    <Input
                                      placeholder="MM/YY"
                                      value={newCard.expiry}
                                      onChange={(e) => setNewCard({
                                        ...newCard,
                                        expiry: formatExpiry(e.target.value)
                                      })}
                                      className={errors.expiry ? "border-red-500" : ""}
                                    />
                                    {errors.expiry && (
                                      <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>
                                    )}
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-gray-700">CVV</Label>
                                    <Input
                                      placeholder="123"
                                      type="password"
                                      maxLength={4}
                                      value={newCard.cvv}
                                      onChange={(e) => setNewCard({
                                        ...newCard,
                                        cvv: e.target.value.replace(/\D/g, '')
                                      })}
                                      className={errors.cvv ? "border-red-500" : ""}
                                    />
                                    {errors.cvv && (
                                      <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <Label className="text-sm font-medium text-gray-700">Cardholder Name</Label>
                                  <Input
                                    placeholder="John Doe"
                                    value={newCard.name}
                                    onChange={(e) => setNewCard({
                                      ...newCard,
                                      name: e.target.value
                                    })}
                                    className={errors.name ? "border-red-500" : ""}
                                  />
                                  {errors.name && (
                                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <Shield className="w-3 h-3 text-green-600" />
                                  Your card details are encrypted and secure
                                </div>

                                <Button
                                  onClick={handleAddCard}
                                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                                  disabled={isLoading}
                                >
                                  {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                  ) : (
                                    <Check className="w-4 h-4 mr-2" />
                                  )}
                                  Add Card
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </RadioGroup>

      {/* Security Footer */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-4 border-t border-gray-200">
        <Shield className="w-4 h-4 text-green-600" />
        <span>All payments are secure and encrypted</span>
      </div>
    </div>
  )
}
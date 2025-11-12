"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"
import { MobileHeader } from "@/components/mobile-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CreditCard, Plus, Trash2, Check, Edit } from "lucide-react"

interface PaymentMethod {
  id: string
  type: string
  last4: string
  expiry: string
  isDefault: boolean
  cardHolder: string
}

export default function PaymentMethodsPage() {
  const router = useRouter()
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "card-1",
      type: "visa",
      last4: "4242",
      expiry: "12/25",
      isDefault: true,
      cardHolder: "John Doe"
    },
    {
      id: "card-2",
      type: "mastercard",
      last4: "8888",
      expiry: "08/24",
      isDefault: false,
      cardHolder: "John Doe"
    }
  ])

  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCard, setEditingCard] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardHolder: "",
    isDefault: false
  })

  const handleAddPayment = () => {
    if (!formData.cardNumber || !formData.expiry || !formData.cvv || !formData.cardHolder) {
      alert("Please fill in all card details")
      return
    }

    const newPaymentMethod: PaymentMethod = {
      id: `card-${Date.now()}`,
      type: formData.cardNumber.startsWith('4') ? 'visa' : 'mastercard',
      last4: formData.cardNumber.slice(-4),
      expiry: formData.expiry,
      isDefault: formData.isDefault || paymentMethods.length === 0,
      cardHolder: formData.cardHolder
    }

    // If setting as default, update other cards
    if (formData.isDefault) {
      setPaymentMethods(prev => 
        prev.map(pm => ({ ...pm, isDefault: false }))
      )
    }

    setPaymentMethods(prev => [...prev, newPaymentMethod])
    setFormData({
      cardNumber: "",
      expiry: "",
      cvv: "",
      cardHolder: "",
      isDefault: false
    })
    setShowAddForm(false)
  }

  const handleSetDefault = (cardId: string) => {
    setPaymentMethods(prev =>
      prev.map(pm => ({
        ...pm,
        isDefault: pm.id === cardId
      }))
    )
  }

  const handleDeleteCard = (cardId: string) => {
    if (paymentMethods.find(pm => pm.id === cardId)?.isDefault && paymentMethods.length > 1) {
      alert("Please set another card as default before deleting this one.")
      return
    }
    
    setPaymentMethods(prev => prev.filter(pm => pm.id !== cardId))
  }

  const getCardIcon = (type: string) => {
    switch (type) {
      case "visa": return "💳"
      case "mastercard": return "💳"
      case "amex": return "💳"
      default: return "💳"
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    
    return parts.length ? parts.join(' ') : value
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.slice(0, 2) + (v.length > 2 ? '/' + v.slice(2, 4) : '')
    }
    return v
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader 
        title="Payment Methods" 
        onBack={() => router.back()}
      />

      <div className="p-4 space-y-4">
        {/* Current Payment Methods */}
        <div className="space-y-3">
           <img 
            className="mx-auto w-32 h-32 object-contain"
            src="/visa.png"
            alt="RubGo" 
          />
          <h2 className="text-lg font-semibold">Your Cards</h2>
          
          {paymentMethods.map((payment) => (
            <Card key={payment.id} className="relative">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                      <img 
                          className="w-12 h-12 object-contain"
                          src="/visa.png"
                          alt="visa" 
                        />
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center">
                      <span className="text-white text-sm">{getCardIcon(payment.type)}</span>
                    </div>
                    <div>
                      <div className="font-medium">
                        {payment.type.charAt(0).toUpperCase() + payment.type.slice(1)} •••• {payment.last4}
                      </div>
                      <div className="text-sm text-gray-500">
                        Expires {payment.expiry} • {payment.cardHolder}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {payment.isDefault ? (
                      <Badge variant="default" className="bg-green-500 text-white">
                        Default
                      </Badge>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefault(payment.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCard(payment.id)}
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add New Card Form */}
        {showAddForm ? (
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold">Add New Card</h3>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="cardHolder">Cardholder Name</Label>
                  <Input
                    id="cardHolder"
                    placeholder="John Doe"
                    value={formData.cardHolder}
                    onChange={(e) => setFormData(prev => ({ ...prev, cardHolder: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="4242 4242 4242 4242"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      cardNumber: formatCardNumber(e.target.value) 
                    }))}
                    maxLength={19}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={formData.expiry}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        expiry: formatExpiry(e.target.value) 
                      }))}
                      maxLength={5}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={formData.cvv}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        cvv: e.target.value.replace(/\D/g, '') 
                      }))}
                      maxLength={4}
                      type="password"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isDefault" className="text-sm">
                    Set as default payment method
                  </Label>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleAddPayment}
                >
                  Add Card
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button
            className="w-full border-2 border-dashed border-gray-300 hover:border-gray-400 bg-transparent hover:bg-gray-50"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={20} className="mr-2" />
            Add New Card
          </Button>
        )}

        {/* Security Notice */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <div className="font-semibold">Your payment info is secure</div>
                <div className="mt-1">
                  We use bank-level encryption to protect your card details. 
                  Your information is never shared with therapists.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  )
}

// Badge component if not already imported
function Badge({ variant = "default", className = "", children }: { variant?: string, className?: string, children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {children}
    </span>
  )
}
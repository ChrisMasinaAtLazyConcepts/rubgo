"use client"

import { BottomNav } from "@/components/bottom-nav"
import { MobileHeader } from "@/components/mobile-header"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  User, Mail, Phone, LogOut, Settings, HelpCircle, 
  CreditCard, MapPin, Heart, Shield, Bell, ChevronRight, Star
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

// Define proper types for the popup items
type PaymentItem = {
  type: string;
  last4?: string;
  email?: string;
  default?: boolean;
}

type PreferenceItem = {
  type: string;
  value: string;
}

type AddressItem = {
  type: string;
  address: string;
}

type PopupItem = PaymentItem | PreferenceItem | AddressItem;

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [activePopup, setActivePopup] = useState<string | null>(null)

  const handleSignOut = () => {
    signOut()
    router.push("/auth/signin")
  }

  const popupContent = {
    payment: {
      title: "Payment Methods",
      icon: CreditCard,
      items: [
        { type: "Credit Card", last4: "4242", default: true },
        { type: "PayPal", email: user?.email }
      ] as PaymentItem[]
    },
    preferences: {
      title: "Massage Preferences",
      icon: Heart,
      items: [
        { type: "Massage Style", value: "Swedish" },
        { type: "Pressure", value: "Medium" },
        { type: "Focus Areas", value: "Back & Shoulders" }
      ] as PreferenceItem[]
    },
    addresses: {
      title: "Saved Locations",
      icon: MapPin,
      items: [
        { type: "Home", address: "123 Main St, Apt 4B" },
        { type: "Work", address: "456 Office Blvd" }
      ] as AddressItem[]
    }
  }

  const getItemDisplayText = (item: PopupItem): string => {
    if ('last4' in item) return `•••• ${item.last4}`
    if ('email' in item) return item.email || ''
    if ('value' in item) return item.value
    if ('address' in item) return item.address
    return ''
  }

  const PopupModal = ({ type }: { type: keyof typeof popupContent }) => {
    const content = popupContent[type]
    const Icon = content.icon

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md border border-gray-200 shadow-xl">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Icon className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">{content.title}</h3>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setActivePopup(null)}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              ✕
            </Button>
          </div>
          <div className="p-6 space-y-3">
            {content.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-white">
                <div>
                  <div className="font-medium text-gray-900">{item.type}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {getItemDisplayText(item)}
                  </div>
                </div>
                {'default' in item && item.default && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                    Default
                  </span>
                )}
              </div>
            ))}
            <Button className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl mt-4">
              Add New {type === 'payment' ? 'Payment' : type === 'preferences' ? 'Preference' : 'Location'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <MobileHeader title="Profile" />

      <div className="p-4 space-y-4">
        {/* User Info Card */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                <p className="text-sm text-gray-600">Rubgo Member</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-gray-900">4.98</span>
                  </div>
                  <span className="text-xs text-gray-500">(24 massages)</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3 text-sm">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Mail className="h-4 w-4 text-gray-600" />
                </div>
                <span className="text-gray-700">{user?.email}</span>
              </div>
              {user?.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Phone className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="text-gray-700">{user.phone}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'payment', icon: CreditCard, label: 'Payment' },
                { key: 'preferences', icon: Heart, label: 'Preferences' },
                { key: 'addresses', icon: MapPin, label: 'Locations' },
                { key: 'safety', icon: Shield, label: 'Safety' }
              ].map((item) => {
                const Icon = item.icon
                return (
                  <Button 
                    key={item.key}
                    variant="outline" 
                    className="flex-col gap-3 h-auto py-5 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-xl"
                    onClick={() => setActivePopup(item.key as any)}
                  >
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Icon className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Menu Options */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="space-y-1">
              {[
                { icon: Bell, label: 'Notifications', onClick: () => {} },
                { icon: Settings, label: 'Account Settings', onClick: () => {} },
                { icon: HelpCircle, label: 'Help & Support', onClick: () => {} },
              ].map((item, index) => {
                const Icon = item.icon
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-between h-14 px-3 hover:bg-gray-50 rounded-lg"
                    onClick={item.onClick}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon className="h-5 w-5 text-gray-600" />
                      </div>
                      <span className="text-gray-700 font-medium">{item.label}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Button>
                )
              })}
              
              {/* Sign Out - Separated with border */}
              <div className="border-t border-gray-100 mt-2 pt-2">
                <Button
                  variant="ghost"
                  className="w-full justify-between h-14 px-3 hover:bg-red-50 rounded-lg text-red-600 hover:text-red-700"
                  onClick={handleSignOut}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <LogOut className="h-5 w-5" />
                    </div>
                    <span className="font-medium">Sign Out</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popup Modals */}
      {activePopup && (
        <PopupModal type={activePopup as keyof typeof popupContent} />
      )}

      <BottomNav />
    </div>
  )
}
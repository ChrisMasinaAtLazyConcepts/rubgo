"use client"

import { BottomNav } from "@/components/bottom-nav"
import { MobileHeader } from "@/components/mobile-header"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  User, Mail, Phone, LogOut, Settings, HelpCircle, 
  CreditCard, MapPin, Shield, Bell, ChevronRight, Star,
  BanknoteIcon, Car, TrendingUp, Clock, CheckCircle, XCircle,
  Plus, Edit3, Zap
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface BankAccount {
  id: string
  bankName: string
  accountNumber: string
  accountHolder: string
  branchCode: string
  isDefault: boolean
}

interface RideService {
  id: string
  name: string
  type: 'uber' | 'bolt'
  isConnected: boolean
  isDefault: boolean
  email: string
}

interface RateChangeRequest {
  id: string
  currentRate: number
  requestedRate: number
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: Date
  estimatedCompletion: Date
  reason?: string
}

export default function TherapistProfilePage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
    {
      id: "1",
      bankName: "Standard Bank",
      accountNumber: "•••• 1234",
      accountHolder: user?.name || "Therapist Name",
      branchCode: "051001",
      isDefault: true
    }
  ])
  const [rideServices, setRideServices] = useState<RideService[]>([
    {
      id: "1",
      name: "Uber",
      type: "uber",
      isConnected: true,
      isDefault: true,
      email: user?.email || ""
    },
    {
      id: "2",
      name: "Bolt",
      type: "bolt",
      isConnected: false,
      isDefault: false,
      email: ""
    }
  ])
  const [rateRequests, setRateRequests] = useState<RateChangeRequest[]>([
    {
      id: "1",
      currentRate: 350,
      requestedRate: 420,
      status: "pending",
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      estimatedCompletion: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      reason: "Increased experience and specialized training"
    }
  ])

  const [newBankAccount, setNewBankAccount] = useState({
    bankName: "",
    accountNumber: "",
    accountHolder: user?.name || "",
    branchCode: ""
  })

  const [rateChangeForm, setRateChangeForm] = useState({
    requestedRate: "",
    reason: ""
  })

  const handleSignOut = () => {
    signOut()
    router.push("/auth/signin")
  }

  const addBankAccount = () => {
    const newAccount: BankAccount = {
      id: Date.now().toString(),
      ...newBankAccount,
      isDefault: bankAccounts.length === 0
    }
    setBankAccounts([...bankAccounts, newAccount])
    setNewBankAccount({
      bankName: "",
      accountNumber: "",
      accountHolder: user?.name || "",
      branchCode: ""
    })
    setActiveSection(null)
  }

  const setDefaultBankAccount = (id: string) => {
    setBankAccounts(bankAccounts.map(account => ({
      ...account,
      isDefault: account.id === id
    })))
  }

  const connectRideService = (serviceId: string) => {
    setRideServices(rideServices.map(service => ({
      ...service,
      isConnected: service.id === serviceId ? true : service.isConnected,
      isDefault: service.id === serviceId
    })))
  }

  const setDefaultRideService = (serviceId: string) => {
    setRideServices(rideServices.map(service => ({
      ...service,
      isDefault: service.id === serviceId
    })))
  }

  const submitRateChange = () => {
    const newRequest: RateChangeRequest = {
      id: Date.now().toString(),
      currentRate: 350, // This would be the current rate from profile
      requestedRate: parseInt(rateChangeForm.requestedRate),
      status: "pending",
      submittedAt: new Date(),
      estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      reason: rateChangeForm.reason
    }
    setRateRequests([newRequest, ...rateRequests])
    setRateChangeForm({ requestedRate: "", reason: "" })
    setActiveSection(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-900 text-yellow-300'
      case 'approved': return 'bg-green-900 text-green-300'
      case 'rejected': return 'bg-red-900 text-red-300'
      default: return 'bg-[#3a506b] text-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const BankAccountModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a2a3a] rounded-2xl w-full max-w-md border border-[#2d3e50] shadow-xl">
        <div className="p-6 border-b border-[#2d3e50] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#71CBD1] rounded-lg">
              <BanknoteIcon className="h-5 w-5 text-[#1a2a3a]" />
            </div>
            <h3 className="font-semibold text-white">Add Bank Account</h3>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setActiveSection(null)}
            className="h-8 w-8 p-0 hover:bg-[#2d3e50] text-gray-400"
          >
            ✕
          </Button>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Bank Name"
              value={newBankAccount.bankName}
              onChange={(e) => setNewBankAccount({...newBankAccount, bankName: e.target.value})}
              className="w-full p-3 bg-[#2d3e50] border border-[#3a506b] rounded-xl text-white placeholder-gray-400 focus:border-[#71CBD1] focus:outline-none"
            />
            <input
              type="text"
              placeholder="Account Number"
              value={newBankAccount.accountNumber}
              onChange={(e) => setNewBankAccount({...newBankAccount, accountNumber: e.target.value})}
              className="w-full p-3 bg-[#2d3e50] border border-[#3a506b] rounded-xl text-white placeholder-gray-400 focus:border-[#71CBD1] focus:outline-none"
            />
            <input
              type="text"
              placeholder="Account Holder Name"
              value={newBankAccount.accountHolder}
              onChange={(e) => setNewBankAccount({...newBankAccount, accountHolder: e.target.value})}
              className="w-full p-3 bg-[#2d3e50] border border-[#3a506b] rounded-xl text-white placeholder-gray-400 focus:border-[#71CBD1] focus:outline-none"
            />
            <input
              type="text"
              placeholder="Branch Code"
              value={newBankAccount.branchCode}
              onChange={(e) => setNewBankAccount({...newBankAccount, branchCode: e.target.value})}
              className="w-full p-3 bg-[#2d3e50] border border-[#3a506b] rounded-xl text-white placeholder-gray-400 focus:border-[#71CBD1] focus:outline-none"
            />
          </div>
          <Button 
            onClick={addBankAccount}
            className="w-full h-12 bg-[#71CBD1] hover:bg-[#5bb5c1] text-[#1a2a3a] font-semibold rounded-xl"
          >
            Add Bank Account
          </Button>
        </div>
      </div>
    </div>
  )

  const RateChangeModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a2a3a] rounded-2xl w-full max-w-md border border-[#2d3e50] shadow-xl">
        <div className="p-6 border-b border-[#2d3e50] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#71CBD1] rounded-lg">
              <TrendingUp className="h-5 w-5 text-[#1a2a3a]" />
            </div>
            <h3 className="font-semibold text-white">Request Rate Change</h3>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setActiveSection(null)}
            className="h-8 w-8 p-0 hover:bg-[#2d3e50] text-gray-400"
          >
            ✕
          </Button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-[#2d3e50] p-4 rounded-xl border border-[#3a506b]">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Current Rate:</span>
              <span className="text-white font-semibold">R350 per session</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <input
              type="number"
              placeholder="Requested Rate (R)"
              value={rateChangeForm.requestedRate}
              onChange={(e) => setRateChangeForm({...rateChangeForm, requestedRate: e.target.value})}
              className="w-full p-3 bg-[#2d3e50] border border-[#3a506b] rounded-xl text-white placeholder-gray-400 focus:border-[#71CBD1] focus:outline-none"
            />
            <textarea
              placeholder="Reason for rate change..."
              value={rateChangeForm.reason}
              onChange={(e) => setRateChangeForm({...rateChangeForm, reason: e.target.value})}
              rows={3}
              className="w-full p-3 bg-[#2d3e50] border border-[#3a506b] rounded-xl text-white placeholder-gray-400 focus:border-[#71CBD1] focus:outline-none resize-none"
            />
          </div>

          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-yellow-400 text-sm">
              <Clock className="w-4 h-4" />
              <span className="font-medium">Processing Time: 7 business days</span>
            </div>
            <p className="text-yellow-300 text-xs mt-2">
              Rate change requests are reviewed by our team to ensure they align with market standards and your experience level.
            </p>
          </div>

          <Button 
            onClick={submitRateChange}
            disabled={!rateChangeForm.requestedRate || !rateChangeForm.reason}
            className="w-full h-12 bg-[#71CBD1] hover:bg-[#5bb5c1] disabled:opacity-50 text-[#1a2a3a] font-semibold rounded-xl"
          >
            Submit Request
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#1a2a3a] text-white pb-20">
      <MobileHeader title="Therapist Profile" />

      <div className="p-4 space-y-4">
        {/* User Info Card */}
        <div className="bg-[#2d3e50] rounded-xl p-6 border border-[#3a506b]">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#71CBD1] to-emerald-600 flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{user?.name}</h2>
              <p className="text-sm text-[#71CBD1]">Verified Therapist</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium text-white">4.98</span>
                </div>
                <span className="text-xs text-gray-400">(142 sessions)</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#3a506b]">
            <div className="flex items-center gap-3 text-sm">
              <div className="p-2 bg-[#3a506b] rounded-lg">
                <Mail className="h-4 w-4 text-[#71CBD1]" />
              </div>
              <span className="text-gray-300">{user?.email}</span>
            </div>
            {user?.phone && (
              <div className="flex items-center gap-3 text-sm">
                <div className="p-2 bg-[#3a506b] rounded-lg">
                  <Phone className="h-4 w-4 text-[#71CBD1]" />
                </div>
                <span className="text-gray-300">{user.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bank Accounts Section */}
        <div className="bg-[#2d3e50] rounded-xl p-6 border border-[#3a506b]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Bank Accounts</h3>
            <Button 
              onClick={() => setActiveSection('bank')}
              className="bg-[#71CBD1] hover:bg-[#5bb5c1] text-[#1a2a3a] font-semibold h-9 px-4 rounded-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
          
          <div className="space-y-3">
            {bankAccounts.map((account) => (
              <div key={account.id} className="bg-[#3a506b] rounded-xl p-4 border border-[#4a6180]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <BanknoteIcon className="w-5 h-5 text-[#71CBD1]" />
                    <div>
                      <h4 className="font-semibold text-white">{account.bankName}</h4>
                      <p className="text-sm text-gray-400">{account.accountNumber}</p>
                    </div>
                  </div>
                  {account.isDefault ? (
                    <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded-full font-medium">
                      Default
                    </span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDefaultBankAccount(account.id)}
                      className="text-[#71CBD1] hover:text-[#5bb5c1] hover:bg-[#4a6180] h-7 px-3 text-xs"
                    >
                      Set Default
                    </Button>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {account.accountHolder} • Branch: {account.branchCode}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ride Services Section */}
        <div className="bg-[#2d3e50] rounded-xl p-6 border border-[#3a506b]">
          <h3 className="font-semibold text-white mb-4">Ride Services</h3>
          
          <div className="space-y-3">
            {rideServices.map((service) => (
              <div key={service.id} className="bg-[#3a506b] rounded-xl p-4 border border-[#4a6180]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      service.type === 'uber' ? 'bg-black' : 'bg-green-600'
                    }`}>
                      <Car className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{service.name}</h4>
                      <p className="text-sm text-gray-400">
                        {service.isConnected ? 'Connected' : 'Not Connected'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {service.isConnected ? (
                      <>
                        {service.isDefault ? (
                          <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded-full font-medium">
                            Default
                          </span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDefaultRideService(service.id)}
                            className="text-[#71CBD1] hover:text-[#5bb5c1] hover:bg-[#4a6180] h-7 px-3 text-xs"
                          >
                            Set Default
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button
                        onClick={() => connectRideService(service.id)}
                        className="bg-[#71CBD1] hover:bg-[#5bb5c1] text-[#1a2a3a] font-semibold h-7 px-3 text-xs"
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rate Change Requests */}
        <div className="bg-[#2d3e50] rounded-xl p-6 border border-[#3a506b]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Rate Change Requests</h3>
            <Button 
              onClick={() => setActiveSection('rate')}
              className="bg-[#71CBD1] hover:bg-[#5bb5c1] text-[#1a2a3a] font-semibold h-9 px-4 rounded-lg"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Request
            </Button>
          </div>
          
          <div className="space-y-3">
            {rateRequests.map((request) => (
              <div key={request.id} className="bg-[#3a506b] rounded-xl p-4 border border-[#4a6180]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(request.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400 line-through">R{request.currentRate}</div>
                    <div className="text-lg font-bold text-[#71CBD1]">R{request.requestedRate}</div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-300 mb-3">{request.reason}</p>
                
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>Submitted: {request.submittedAt.toLocaleDateString()}</span>
                  {request.status === 'pending' && (
                    <span>Est: {request.estimatedCompletion.toLocaleDateString()}</span>
                  )}
                </div>
                
                {request.status === 'pending' && (
                  <div className="mt-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-yellow-400 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>Processing - {Math.ceil((request.estimatedCompletion.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#2d3e50] rounded-xl p-6 border border-[#3a506b]">
          <h3 className="font-semibold text-white mb-4">Settings</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Settings, label: 'Account', onClick: () => router.push('/therapist/settings') },
              { icon: Bell, label: 'Notifications', onClick: () => router.push('/therapist/notifications') },
              { icon: Shield, label: 'Privacy', onClick: () => router.push('/therapist/privacy') },
              { icon: HelpCircle, label: 'Support', onClick: () => router.push('/therapist/support') },
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <Button 
                  key={index}
                  variant="outline" 
                  className="flex-col gap-3 h-auto py-5 bg-[#3a506b] border-[#4a6180] hover:bg-[#4a6180] hover:border-[#5b7290] rounded-xl"
                  onClick={item.onClick}
                >
                  <div className="p-2 bg-[#71CBD1] rounded-lg">
                    <Icon className="h-5 w-5 text-[#1a2a3a]" />
                  </div>
                  <span className="text-sm font-medium text-white">{item.label}</span>
                </Button>
              )
            })}
          </div>
        </div>

        {/* Sign Out */}
        <Button
          variant="outline"
          className="w-full h-14 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl"
          onClick={handleSignOut}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <LogOut className="h-5 w-5" />
            </div>
            <span className="font-medium">Sign Out</span>
          </div>
        </Button>
      </div>

      {/* Modals */}
      {activeSection === 'bank' && <BankAccountModal />}
      {activeSection === 'rate' && <RateChangeModal />}

      <BottomNav />
    </div>
  )
}
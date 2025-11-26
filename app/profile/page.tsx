"use client"

import { BottomNav } from "@/components/bottom-nav"
import { MobileHeader } from "@/components/mobile-header"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  User, Mail, Phone, LogOut, Settings, HelpCircle, 
  CreditCard, MapPin, Heart, Shield, Bell, ChevronRight, Star,
  AlertTriangle, Mic, CheckCircle, Volume2, Play, Square
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"

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
  
  // Safety preferences state
  const [panicButtonEnabled, setPanicButtonEnabled] = useState(true)
  const [safetyWord, setSafetyWord] = useState("MASSAGE EMERGENCY")
  const [customSafetyWord, setCustomSafetyWord] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string>("")
  const [recordingTime, setRecordingTime] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const handleSignOut = () => {
    signOut()
    router.push("/auth/signin")
  }

  // Start recording audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const audioUrl = URL.createObjectURL(audioBlob)
        setAudioBlob(audioBlob)
        setAudioUrl(audioUrl)
        setIsRecording(false)
        setRecordingTime(0)
        
        // Show success message
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }

      mediaRecorder.start()
      setIsRecording(true)
      
      // Start timer
      let time = 0
      timerRef.current = setInterval(() => {
        time += 1
        setRecordingTime(time)
        if (time >= 5) {
          stopRecording()
        }
      }, 1000)
      
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Microphone access is required to record safety word')
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  // Play recorded audio
  const playRecording = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audio.play()
    }
  }

  // Save safety preferences
  const saveSafetyPreferences = () => {
    // In a real app, you would save these to your backend
    const safetyData = {
      panicButtonEnabled,
      safetyWord: customSafetyWord || safetyWord,
      audioBlob: audioBlob ? URL.createObjectURL(audioBlob) : null
    }
    
    localStorage.setItem('safetyPreferences', JSON.stringify(safetyData))
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  // Load safety preferences on component mount
  useEffect(() => {
    const saved = localStorage.getItem('safetyPreferences')
    if (saved) {
      const safetyData = JSON.parse(saved)
      setPanicButtonEnabled(safetyData.panicButtonEnabled ?? true)
      if (safetyData.safetyWord && safetyData.safetyWord !== "MASSAGE EMERGENCY") {
        setCustomSafetyWord(safetyData.safetyWord)
        setSafetyWord(safetyData.safetyWord)
      }
    }
  }, [])

  // Update safety word when custom safety word changes
  useEffect(() => {
    if (customSafetyWord.trim()) {
      setSafetyWord(customSafetyWord)
    } else {
      setSafetyWord("MASSAGE EMERGENCY")
    }
  }, [customSafetyWord])

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
    },
    safety: {
      title: "Safety & Emergency",
      icon: Shield,
      items: [
        { type: "Panic Button", value: "Enabled" },
        { type: "Safety Word", value: safetyWord },
        { type: "Voice Recording", value: audioUrl ? "Recorded" : "Not recorded" }
      ] as PreferenceItem[]
    }
  }

  const getItemDisplayText = (item: PopupItem): string => {
    if ('last4' in item) return `•••• ${item.last4}`
    if ('email' in item) return item.email || ''
    if ('value' in item) return item.value
    if ('address' in item) return item.address
    return ''
  }

  const SafetyPopupModal = () => {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-200 shadow-xl">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Safety & Emergency</h3>
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
          
          <div className="p-6 space-y-6">
            {/* Panic Button Settings */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Panic Button Settings
              </h4>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-white">
                <div>
                  <div className="font-medium text-gray-900">Emergency Panic Button</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Quick access to emergency assistance during sessions
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={panicButtonEnabled}
                    onChange={(e) => setPanicButtonEnabled(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-orange-800">
                    <p className="font-medium">Important Safety Information</p>
                    <p className="mt-1">The panic button will immediately alert emergency services and share your location with authorities. Only use in genuine emergencies.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Safety Word Settings */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-blue-500" />
                Safety Word Detection
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Safety Word
                  </label>
                  <div className="p-3 border border-gray-300 rounded-lg bg-gray-50">
                    <p className="text-gray-900 font-medium">"MASSAGE EMERGENCY"</p>
                    <p className="text-xs text-gray-600 mt-1">Say this phrase during sessions to trigger emergency response</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Safety Word (Optional)
                  </label>
                  <input
                    type="text"
                    value={customSafetyWord}
                    onChange={(e) => setCustomSafetyWord(e.target.value)}
                    placeholder="Enter your custom safety word"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    maxLength={30}
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Choose a unique word or phrase you'll remember in emergencies
                  </p>
                </div>
              </div>

              {/* Voice Recording Section */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Voice Recording (Recommended)
                </label>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Improve Safety Word Detection</p>
                    <p className="mt-1">Record yourself saying your safety word to help our AI better recognize your voice during sessions.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Recording Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={isRecording ? stopRecording : startRecording}
                        variant={isRecording ? "outline" : "default"}
                        className={`flex items-center gap-2 ${
                          isRecording 
                            ? 'border-red-500 text-red-600 hover:bg-red-50' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {isRecording ? (
                          <>
                            <Square className="h-4 w-4" />
                            Stop Recording
                          </>
                        ) : (
                          <>
                            <Mic className="h-4 w-4" />
                            Start Recording
                          </>
                        )}
                      </Button>

                      {isRecording && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-gray-600">
                            {5 - recordingTime}s remaining
                          </span>
                        </div>
                      )}
                    </div>

                    {audioUrl && (
                      <Button
                        onClick={playRecording}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Play className="h-4 w-4" />
                        Play
                      </Button>
                    )}
                  </div>

                  {/* Recording Instructions */}
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>• Recording will automatically stop after 5 seconds</p>
                    <p>• Speak clearly and naturally</p>
                    <p>• Say: "{safetyWord}"</p>
                    <p>• Ensure you're in a quiet environment</p>
                  </div>
                </div>
              </div>

              {/* Safety Information */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-700 space-y-2">
                  <p className="font-medium">How Safety Word Detection Works:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>During massage sessions, the app continuously monitors audio</li>
                    <li>AI technology listens for your specific safety word</li>
                    <li>When detected, emergency protocols are activated immediately</li>
                    <li>Your location and session details are shared with authorities</li>
                    <li>CRM operators are alerted to provide immediate assistance</li>
                  </ul>
                  <p className="text-xs text-gray-600 mt-2">
                    By using this feature, you agree to our Terms and Conditions regarding audio monitoring and emergency response protocols.
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <Button 
              onClick={saveSafetyPreferences}
              className="w-full bg-green-600 hover:bg-green-700 h-12 text-white font-semibold rounded-xl"
            >
              Save Safety Preferences
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const PopupModal = ({ type }: { type: keyof typeof popupContent }) => {
    if (type === 'safety') {
      return <SafetyPopupModal />
    }

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

      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Safety preferences saved!</p>
              <p className="text-sm text-green-700">Your safety word and emergency settings have been updated.</p>
            </div>
          </div>
        </div>
      )}

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
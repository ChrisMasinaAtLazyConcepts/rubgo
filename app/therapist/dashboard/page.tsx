"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { 
  Calendar, 
  Users, 
  Star, 
  MessageCircle, 
  TrendingUp, 
  Clock, 
  MapPin, 
  ChevronRight, 
  CreditCard, 
  FileText, 
  Settings, 
  Bell, 
  Zap, 
  Wallet, 
  BarChart3, 
  Plus, 
  Download, 
  Award, 
  Shield, 
  Navigation, 
  X, 
  Car,
  ExternalLink,
  Clock as ClockIcon,
  CheckCircle,
  AlertCircle,
  Camera,
  ClipboardCheck,
  Shirt,
  Scissors,
  Sparkles,
  Loader2,
  Upload,
  Check
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { TherapistBookingRequest } from "@/components/therapist-booking-request"

interface Booking {
  id: string
  clientName: string
  clientImage: string
  service: string
  duration: number
  price: number
  date: Date
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  location: string
}

interface Stats {
  totalEarnings: number
  completedSessions: number
  averageRating: number
  responseRate: number
  monthlyGrowth: number
  nextPayout: number
}

interface NotificationData {
  id: string
  title: string
  message: string
  type: 'booking' | 'message' | 'system'
  bookingId?: string
  timestamp: Date
}

interface Client {
  id: string
  name: string
  image: string
  rating: number
  reviews: number
  phone: string
  email: string
  joinDate: Date
}

interface BookingDetails {
  id: string
  client: Client
  service: string
  duration: number
  price: number
  date: Date
  location: string
  address: string
  coordinates: { lat: number; lng: number }
  specialRequests: string
  therapistNotes: string
  distance: number
  estimatedTravelTime: number
  serviceFee: number
  totalAmount: number
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export default function TherapistDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'earnings' | 'clients'>('overview')
  const [todayBookings, setTodayBookings] = useState<Booking[]>([])
  const [showBookingRequest, setShowBookingRequest] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<BookingDetails | null>(null)
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([])
  const [therapistStatus, setTherapistStatus] = useState<'pending' | 'approved' | 'rejected'>('approved')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [showStartOptions, setShowStartOptions] = useState(false)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [showSessionConfirmation, setShowSessionConfirmation] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [hasAcceptedRules, setHasAcceptedRules] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [stats, setStats] = useState<Stats>({
    totalEarnings: 0,
    completedSessions: 0,
    averageRating: 4.8,
    responseRate: 95,
    monthlyGrowth: 12,
    nextPayout: 3200
  })
  const [showNotification, setShowNotification] = useState(false)
  const [currentNotification, setCurrentNotification] = useState<NotificationData | null>(null)
  const [hasPlayedSound, setHasPlayedSound] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Fetch data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const token = localStorage.getItem('token')
        
        const [todayRes, upcomingRes, statsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/therapist/bookings/today`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          fetch(`${API_BASE_URL}/therapist/bookings/upcoming`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          fetch(`${API_BASE_URL}/therapist/stats`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        ])

        if (!todayRes.ok || !upcomingRes.ok || !statsRes.ok) {
          throw new Error('Failed to fetch dashboard data')
        }

        const todayData = await todayRes.json()
        const upcomingData = await upcomingRes.json()
        const statsData = await statsRes.json()

        setTodayBookings(todayData.map((booking: any) => ({
          ...booking,
          date: new Date(booking.date)
        })))
        
        setUpcomingBookings(upcomingData.map((booking: any) => ({
          ...booking,
          date: new Date(booking.date)
        })))
        
        setStats(statsData)

      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load dashboard data. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    const fetchTherapistStatus = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_BASE_URL}/therapist/status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const status = await response.json()
          setTherapistStatus(status)
        }
      } catch (err) {
        console.error('Error fetching therapist status:', err)
      }
    }

    fetchDashboardData()
    fetchTherapistStatus()

    const simulateIncomingBooking = () => {
      const newNotification: NotificationData = {
        id: Date.now().toString(),
        title: "New Booking Request! 🎉",
        message: "Sarah Johnson booked a 60min Deep Tissue Massage for tomorrow at 2:00 PM",
        type: 'booking',
        bookingId: "new-" + Date.now(),
        timestamp: new Date()
      }
      
      setCurrentNotification(newNotification)
      setShowNotification(true)
      playNotificationSound()
      
      setTimeout(() => {
        setShowNotification(false)
      }, 5000)
    }

    const timer = setTimeout(simulateIncomingBooking, 3000)
    
    return () => clearTimeout(timer)
  }, [])

  // Camera setup for selfie capture
  useEffect(() => {
    if (showSessionConfirmation && videoRef.current) {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              facingMode: 'user',
              width: { ideal: 640 },
              height: { ideal: 480 }
            } 
          })
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        } catch (err) {
          console.error('Error accessing camera:', err)
        }
      }
      startCamera()
      
      return () => {
        if (videoRef.current?.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream
          stream.getTracks().forEach(track => track.stop())
        }
      }
    }
  }, [showSessionConfirmation])

  const playNotificationSound = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.src = '/assets/new.mp3'
      audioRef.current.volume = 0.4
    }
    
    if (!hasPlayedSound) {
      audioRef.current.play().catch(() => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.value = 440
        oscillator.type = 'sine'
        gainNode.gain.value = 0.1
        
        oscillator.start()
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 2)
        oscillator.stop(audioContext.currentTime + 2)
        
        setHasPlayedSound(true)
      })
      setHasPlayedSound(true)
    }
  }

  const handleBookingAction = async (bookingId: string, action: 'accept' | 'decline' | 'start' | 'complete') => {
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(`${API_BASE_URL}/therapist/bookings/${bookingId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action} booking`)
      }

      const refreshBookings = async () => {
        const token = localStorage.getItem('token')
        const [todayRes, upcomingRes] = await Promise.all([
          fetch(`${API_BASE_URL}/therapist/bookings/today`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          fetch(`${API_BASE_URL}/therapist/bookings/upcoming`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        ])

        if (todayRes.ok && upcomingRes.ok) {
          const todayData = await todayRes.json()
          const upcomingData = await upcomingRes.json()
          
          setTodayBookings(todayData.map((booking: any) => ({
            ...booking,
            date: new Date(booking.date)
          })))
          
          setUpcomingBookings(upcomingData.map((booking: any) => ({
            ...booking,
            date: new Date(booking.date)
          })))
        }
      }

      refreshBookings()

    } catch (err) {
      console.error('Error updating booking:', err)
      alert(`Failed to ${action} booking. Please try again.`)
    }
  }

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      if (context) {
        canvas.width = videoRef.current.videoWidth
        canvas.height = videoRef.current.videoHeight
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
        
        const imageDataUrl = canvas.toDataURL('image/png')
        setCapturedImage(imageDataUrl)
        
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }

  const retakeSelfie = () => {
    setCapturedImage(null)
    if (videoRef.current) {
      navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      }).then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      })
    }
  }

  const uploadSelfie = async () => {
    if (!capturedImage) return

    setIsUploading(true)
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(capturedImage)
      const blob = await response.blob()
      
      const formData = new FormData()
      formData.append('selfie', blob, 'selfie.png')
      formData.append('bookingId', selectedBookingId || '')
      
      const uploadResponse = await fetch(`${API_BASE_URL}/therapist/selfie`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload selfie')
      }

      if (selectedBookingId) {
        await handleBookingAction(selectedBookingId, 'start')
      }
      
      setShowSessionConfirmation(false)
      setCapturedImage(null)
      setHasAcceptedRules(false)
      
      const booking = todayBookings.find(b => b.id === selectedBookingId)
      if (booking) {
        sessionStorage.setItem('currentSession', JSON.stringify({
          ...booking,
          status: 'in-progress',
          startTime: new Date(),
          estimatedArrival: new Date(Date.now() + 30 * 60 * 1000)
        }))
        router.push('/therapist/navigation')
      }

    } catch (err) {
      console.error('Error uploading selfie:', err)
      alert('Failed to upload selfie. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const confirmSessionStart = () => {
    if (!hasAcceptedRules) {
      alert('Please accept the dress code rules to continue')
      return
    }
    
    if (!capturedImage) {
      alert('Please take a half-body selfie to continue')
      return
    }
    
    uploadSelfie()
  }

  const handleStartSession = (bookingId: string) => {
    setSelectedBookingId(bookingId)
    setShowSessionConfirmation(true)
  }

  const handleRequestRide = () => {
    setShowStartOptions(false)
    const booking = todayBookings.find(b => b.id === selectedBookingId)
    if (booking) {
      const destination = encodeURIComponent(booking.location)
      const currentLocation = { lat: -26.1076, lng: 28.0567 }
      
      const uberUrl = `uber://?action=setPickup&pickup[latitude]=${currentLocation.lat}&pickup[longitude]=${currentLocation.lng}&dropoff[formatted_address]=${destination}`
      
      window.location.href = uberUrl
      
      setTimeout(() => {
        if (!document.hidden) {
          const uberWebUrl = `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${destination}`
          window.open(uberWebUrl, '_blank')
        }
      }, 500)
    }
  }

  const handleViewBooking = (bookingId: string) => {
    router.push(`/therapist/booking/${bookingId}`)
  }

  const handleMessageClient = (clientName: string) => {
    router.push('/therapist/inbox')
  }

  const handleNotificationClick = () => {
    if (currentNotification?.bookingId) {
      const mockBookingDetails: BookingDetails = {
        id: currentNotification.bookingId,
        client: {
          id: "client-123",
          name: "Sarah Johnson",
          image: "/client1.jpg",
          rating: 4.9,
          reviews: 27,
          phone: "+27 12 345 6789",
          email: "sarah.johnson@example.com",
          joinDate: new Date(2023, 0, 15)
        },
        service: "Deep Tissue Massage",
        duration: 60,
        price: 450,
        date: new Date(Date.now() + 1000 * 60 * 60 * 24),
        location: "Client's Home",
        address: "123 Main Street, Johannesburg, 2000",
        coordinates: { lat: -26.1076, lng: 28.0567 },
        specialRequests: "Please bring extra towels and focus on lower back tension",
        therapistNotes: "Regular client, prefers firm pressure",
        distance: 3.2,
        estimatedTravelTime: 15,
        serviceFee: 45,
        totalAmount: 405
      }
      
      setSelectedBooking(mockBookingDetails)
      setShowBookingRequest(true)
    }
    setShowNotification(false)
  }

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-green-900 text-green-300'
      case 'pending': return 'bg-yellow-900 text-yellow-300'
      case 'completed': return 'bg-blue-900 text-blue-300'
      case 'cancelled': return 'bg-red-900 text-red-300'
      default: return 'bg-[#3a506b] text-gray-300'
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatCurrency = (amount: number) => {
    return `R${amount.toLocaleString()}`
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  // Session Confirmation Modal Component
  const SessionConfirmationModal = () => {
    const dressCodeRules = [
      { id: 1, rule: 'Nails must be clean, trimmed, and free of polish', icon: <Scissors className="w-4 h-4" /> },
      { id: 2, rule: 'Clean, professional uniform or scrubs required', icon: <Shirt className="w-4 h-4" /> },
      { id: 3, rule: 'Fresh, clean towels must be brought to every session', icon: <Sparkles className="w-4 h-4" /> },
      { id: 4, rule: 'Hair must be tied back if longer than shoulder length', icon: <Scissors className="w-4 h-4" /> },
      { id: 5, rule: 'No strong perfumes or scents allowed', icon: <AlertCircle className="w-4 h-4" /> },
      { id: 6, rule: 'Clean, closed-toe shoes required', icon: <CheckCircle className="w-4 h-4" /> }
    ]

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-gray-900 to-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden border border-slate-700 shadow-2xl"
        >
          <div className="bg-gradient-to-r from-blue-900 to-slate-800 p-6 text-center border-b border-slate-700">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <ClipboardCheck className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Session Confirmation</h2>
            </div>
            <p className="text-slate-300">Please confirm compliance and take a half-body selfie</p>
          </div>

          <div className="p-6 max-h-[80vh] overflow-y-auto">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Shirt className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Dress Code & Professional Standards</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {dressCodeRules.map((rule) => (
                  <div key={rule.id} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                    <div className="w-8 h-8 bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-400 mt-0.5">
                      {rule.icon}
                    </div>
                    <span className="text-sm text-slate-300">{rule.rule}</span>
                  </div>
                ))}
              </div>
              
              <label className="flex items-start gap-3 p-4 bg-slate-800/30 rounded-xl border border-slate-700 cursor-pointer hover:bg-slate-800/50 transition-colors">
                <input
                  type="checkbox"
                  checked={hasAcceptedRules}
                  onChange={(e) => setHasAcceptedRules(e.target.checked)}
                  className="mt-1 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
                />
                <div>
                  <p className="text-sm font-medium text-white">
                    I confirm that I comply with all dress code and professional standards
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Violation of these standards may result in suspension or termination
                  </p>
                </div>
              </label>
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Camera className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Half-Body Selfie Verification</h3>
              </div>
              
              <p className="text-sm text-slate-400 mb-4">
                Take a clear photo showing yourself from waist up with your uniform visible
              </p>
              
              <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
                {!capturedImage ? (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      <button
                        onClick={captureSelfie}
                        className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
                      >
                        <Camera className="w-8 h-8 text-slate-900" />
                      </button>
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                ) : (
                  <div className="p-4">
                    <div className="relative w-48 h-48 mx-auto mb-4 rounded-xl overflow-hidden border-4 border-blue-500">
                      <img 
                        src={capturedImage} 
                        alt="Captured selfie"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={retakeSelfie}
                        className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        Retake
                      </button>
                      <button
                        onClick={() => setCapturedImage(null)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Looks Good
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSessionConfirmation(false)
                  setCapturedImage(null)
                  setHasAcceptedRules(false)
                }}
                className="flex-1 border border-slate-600 text-slate-300 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                onClick={confirmSessionStart}
                disabled={!hasAcceptedRules || !capturedImage || isUploading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Starting Session...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Start Session
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a2a3a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#71CBD1] animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-[#1a2a3a] flex items-center justify-center p-4">
        <div className="bg-[#2d3e50] rounded-2xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Data</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-[#71CBD1] text-[#1a2a3a] px-6 py-3 rounded-xl font-semibold hover:bg-[#5bb5c1] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Show pending approval screen if status is pending
  if (therapistStatus === 'pending') {
    return <PendingApprovalScreen />
  }

  // Show rejected screen if status is rejected
  if (therapistStatus === 'rejected') {
    return <RejectedScreen />
  }

  return (
    <div className="min-h-screen bg-[#1a2a3a] text-white pb-20">
      <AnimatePresence>
        {showSessionConfirmation && <SessionConfirmationModal />}
      </AnimatePresence>
      
      <AnimatePresence>
        {showNotification && currentNotification && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.8 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-md"
          >
            <div 
              className="bg-[#2d3e50] rounded-2xl shadow-2xl border border-[#71CBD1] p-4 cursor-pointer hover:bg-[#3a506b] transition-colors"
              onClick={handleNotificationClick}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-[#71CBD1] rounded-full flex items-center justify-center">
                    <Bell className="w-6 h-6 text-[#1a2a3a]" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-6 h-6 flex items-center justify-center">
                    <Navigation className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white">{currentNotification.title}</h3>
                  <p className="text-sm text-gray-300 mt-1">{currentNotification.message}</p>
                  <p className="text-xs text-[#71CBD1] mt-1">
                    {currentNotification.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowNotification(false)
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {showStartOptions && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-200"
          >
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Navigation className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Start Session</h3>
                <p className="text-gray-600">How would you like to get to your client?</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowStartOptions(false)
                    if (selectedBookingId) {
                      handleStartSession(selectedBookingId)
                    }
                  }}
                  className="w-full p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl flex items-center justify-between hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Car className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Start Session</div>
                      <div className="text-sm text-white/80">Confirm dress code & take selfie</div>
                    </div>
                  </div>
                  <Check className="w-5 h-5" />
                </button>

                <button
                  onClick={handleRequestRide}
                  className="w-full p-4 bg-gradient-to-r from-blue-500 to-sky-600 text-white rounded-2xl flex items-center justify-between hover:from-blue-600 hover:to-sky-700 transition-all duration-200 shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Request Ride</div>
                      <div className="text-sm text-white/80">Uber, Bolt, or similar</div>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => setShowStartOptions(false)}
                className="w-full mt-4 p-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="bg-[#2d3e50] border-b border-[#3a506b] p-4">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-xl font-bold text-white">{getGreeting()}, {user?.name || 'Therapist'}!</h1>
            <p className="text-sm text-[#71CBD1]">Ready for your sessions today?</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => router.push('/therapist/notifications')}
              className="p-2 rounded-lg bg-[#3a506b] hover:bg-[#4a6180] transition-colors relative"
            >
              <Bell className="w-5 h-5 text-[#71CBD1]" />
              {showNotification && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
              )}
            </button>
            <button 
              onClick={() => router.push('/therapist/settings')}
              className="p-2 rounded-lg bg-[#3a506b] hover:bg-[#4a6180] transition-colors"
            >
              <Settings className="w-5 h-5 text-[#71CBD1]" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-4">
          <div className="text-center">
            <div className="text-lg font-bold text-white">{todayBookings.length}</div>
            <div className="text-xs text-gray-300">Today</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">{upcomingBookings.length}</div>
            <div className="text-xs text-gray-300">Upcoming</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">{formatCurrency(stats.totalEarnings)}</div>
            <div className="text-xs text-gray-300">Earnings</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-400">{stats.averageRating}</div>
            <div className="text-xs text-gray-300">Rating</div>
          </div>
        </div>
      </div>

      <div className="bg-[#2d3e50] border-b border-[#3a506b]">
        <div className="flex p-4 gap-1">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'bookings', label: 'Bookings', icon: Calendar },
            { id: 'earnings', label: 'Earnings', icon: Wallet },
            { id: 'clients', label: 'Clients', icon: Users }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex flex-col items-center py-2 rounded-lg transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-[#71CBD1] text-[#1a2a3a]' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="bg-[#2d3e50] rounded-xl p-4 border border-[#3a506b]">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h3 className="font-semibold text-white">Today's Priority</h3>
              </div>
              
              {todayBookings.length > 0 ? (
                <div className="space-y-3">
                  {todayBookings.map((booking) => (
                    <div key={booking.id} className="bg-[#3a506b] rounded-lg p-3 border border-[#4a6180]">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#2d3e50] rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-[#71CBD1]" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-white">{booking.clientName}</h4>
                            <p className="text-xs text-gray-300">{booking.service}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm mb-3">
                        <div className="flex items-center gap-1 text-gray-300">
                          <Clock className="w-4 h-4 text-[#71CBD1]" />
                          <span>{formatTime(booking.date)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-300">
                          <MapPin className="w-4 h-4 text-[#71CBD1]" />
                          <span className="text-xs">{booking.location}</span>
                        </div>
                        <span className="font-semibold text-white">{formatCurrency(booking.price)}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMessageClient(booking.clientName)}
                          className="flex-1 border border-[#71CBD1] text-[#71CBD1] py-2 rounded-lg text-sm hover:bg-[#71CBD1] hover:text-[#1a2a3a] transition-colors"
                        >
                          Message
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBookingId(booking.id)
                            setShowStartOptions(true)
                          }}
                          className="flex-1 bg-[#71CBD1] text-[#1a2a3a] py-2 rounded-lg text-sm font-semibold hover:bg-[#5bb5c1] transition-colors"
                        >
                          Start Session
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400">No bookings scheduled for today</p>
                  <button 
                    onClick={() => router.push('/therapist/availability')}
                    className="mt-2 text-[#71CBD1] text-sm hover:underline"
                  >
                    Set your availability
                  </button>
                </div>
              )}
            </div>

            <div className="bg-[#2d3e50] rounded-xl p-4 border border-[#3a506b]">
              <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => router.push('/therapist/availability')}
                  className="bg-[#3a506b] rounded-lg p-3 text-center hover:bg-[#4a6180] transition-colors border border-[#4a6180]"
                >
                  <Calendar className="w-6 h-6 text-[#71CBD1] mx-auto mb-2" />
                  <span className="text-sm font-medium text-white block">Availability</span>
                  <span className="text-xs text-gray-400">Set schedule</span>
                </button>
                <button 
                  onClick={() => router.push('/therapist/services')}
                  className="bg-[#3a506b] rounded-lg p-3 text-center hover:bg-[#4a6180] transition-colors border border-[#4a6180]"
                >
                  <FileText className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <span className="text-sm font-medium text-white block">Services</span>
                  <span className="text-xs text-gray-400">Manage offers</span>
                </button>
                <button 
                  onClick={() => router.push('/therapist/earnings')}
                  className="bg-[#3a506b] rounded-lg p-3 text-center hover:bg-[#4a6180] transition-colors border border-[#4a6180]"
                >
                  <CreditCard className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <span className="text-sm font-medium text-white block">Earnings</span>
                  <span className="text-xs text-gray-400">View income</span>
                </button>
                <button 
                  onClick={() => router.push('/therapist/clients')}
                  className="bg-[#3a506b] rounded-lg p-3 text-center hover:bg-[#4a6180] transition-colors border border-[#4a6180]"
                >
                  <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <span className="text-sm font-medium text-white block">Clients</span>
                  <span className="text-xs text-gray-400">Manage clients</span>
                </button>
              </div>
            </div>

            <div className="bg-[#2d3e50] rounded-xl p-4 border border-[#3a506b]">
              <h3 className="font-semibold text-white mb-4">Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Response Rate</span>
                  <span className="text-white font-semibold">{stats.responseRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Monthly Growth</span>
                  <span className="text-green-400 font-semibold">+{stats.monthlyGrowth}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Next Payout</span>
                  <span className="text-yellow-400 font-semibold">{formatCurrency(stats.nextPayout)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <div className="bg-[#2d3e50] rounded-xl p-4 border border-[#3a506b]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-white">Upcoming Bookings</h3>
                <button className="bg-[#71CBD1] text-[#1a2a3a] px-3 py-1 rounded-lg text-sm font-semibold hover:bg-[#5bb5c1] transition-colors">
                  <Plus className="w-4 h-4 inline mr-1" />
                  New
                </button>
              </div>
              
              {upcomingBookings.length > 0 ? (
                <div className="space-y-3">
                  {upcomingBookings.map((booking) => (
                    <div 
                      key={booking.id}
                      onClick={() => handleViewBooking(booking.id)}
                      className="bg-[#3a506b] rounded-lg p-3 border border-[#4a6180] cursor-pointer hover:bg-[#445979] transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#2d3e50] rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-[#71CBD1]" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-white">{booking.clientName}</h4>
                            <p className="text-xs text-gray-300">{booking.service}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                      
                      <div className="flex items-center justify-between text-sm mb-2">
                        <div className="flex items-center gap-1 text-gray-300">
                          <Clock className="w-4 h-4 text-[#71CBD1]" />
                          <span>{booking.date.toLocaleDateString()} • {formatTime(booking.date)}</span>
                        </div>
                        <span className="font-semibold text-white">{formatCurrency(booking.price)}</span>
                      </div>
                      
                      {booking.status === 'pending' && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleBookingAction(booking.id, 'decline')
                            }}
                            className="flex-1 border border-red-500 text-red-400 py-2 rounded-lg text-sm hover:bg-red-500 hover:text-white transition-colors"
                          >
                            Decline
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleBookingAction(booking.id, 'accept')
                            }}
                            className="flex-1 bg-[#71CBD1] text-[#1a2a3a] py-2 rounded-lg text-sm font-semibold hover:bg-[#5bb5c1] transition-colors"
                          >
                            Accept
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400">No upcoming bookings</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'earnings' && (
          <div className="space-y-4">
            <div className="bg-[#2d3e50] rounded-xl p-4 border border-[#3a506b]">
              <h3 className="font-semibold text-white mb-4">Earnings Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-300 text-sm">This Month</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalEarnings)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 text-sm">+{stats.monthlyGrowth}% from last month</p>
                    <p className="text-gray-400 text-xs">Next payout: {formatCurrency(stats.nextPayout)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#3a506b] rounded-lg p-3 text-center">
                    <p className="text-white font-semibold">{stats.completedSessions}</p>
                    <p className="text-gray-400 text-xs">Sessions</p>
                  </div>
                  <div className="bg-[#3a506b] rounded-lg p-3 text-center">
                    <p className="text-white font-semibold">R{(stats.totalEarnings / stats.completedSessions).toFixed(0)}</p>
                    <p className="text-gray-400 text-xs">Avg/Session</p>
                  </div>
                  <div className="bg-[#3a506b] rounded-lg p-3 text-center">
                    <p className="text-white font-semibold">95%</p>
                    <p className="text-gray-400 text-xs">On-time</p>
                  </div>
                </div>
                
                <button className="w-full bg-[#71CBD1] text-[#1a2a3a] py-3 rounded-lg font-semibold hover:bg-[#5bb5c1] transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Earnings Report
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="space-y-4">
            <div className="bg-[#2d3e50] rounded-xl p-4 border border-[#3a506b]">
              <h3 className="font-semibold text-white mb-4">Client Management</h3>
              <div className="space-y-3">
                <div className="bg-[#3a506b] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#2d3e50] rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-[#71CBD1]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">42 Active Clients</h4>
                        <p className="text-gray-400 text-sm">Manage your client relationships</p>
                      </div>
                    </div>
                    <Award className="w-6 h-6 text-yellow-400" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <button className="bg-[#2d3e50] text-[#71CBD1] py-2 rounded-lg text-sm hover:bg-[#71CBD1] hover:text-[#1a2a3a] transition-colors">
                      View All
                    </button>
                    <button className="bg-[#71CBD1] text-[#1a2a3a] py-2 rounded-lg text-sm font-semibold hover:bg-[#5bb5c1] transition-colors">
                      Add Notes
                    </button>
                  </div>
                </div>
                
                <div className="bg-[#3a506b] rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-green-400" />
                    <div>
                      <h4 className="font-semibold text-white">Verified Therapist</h4>
                      <p className="text-gray-400 text-sm">Your profile is 95% complete</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-[#2d3e50] border-t border-[#3a506b] p-3">
        <div className="flex justify-around items-center">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'bookings', label: 'Bookings', icon: Calendar },
            { id: 'earnings', label: 'Earnings', icon: Wallet },
            { id: 'clients', label: 'Clients', icon: Users },
            { id: 'profile', label: 'Profile', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => tab.id === 'profile' ? router.push('/therapist/profile') : setActiveTab(tab.id as any)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                  activeTab === tab.id 
                    ? 'text-[#71CBD1]' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      <TherapistBookingRequest
        isOpen={showBookingRequest}
        onClose={() => setShowBookingRequest(false)}
        onAccept={(bookingId) => {
          console.log("Accepted booking:", bookingId)
          setShowBookingRequest(false)
        }}
        onDecline={(bookingId) => {
          console.log("Declined booking:", bookingId)
          setShowBookingRequest(false)
        }}
        onMessage={(clientId) => {
          router.push(`/therapist/inbox?client=${clientId}`)
        }}
        onCall={(phoneNumber) => {
          window.open(`tel:${phoneNumber}`, '_blank')
        }}
        booking={selectedBooking}
      />
    </div>
  )
}

function PendingApprovalScreen() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6"
        >
          <ClockIcon className="w-10 h-10 text-blue-600" />
        </motion.div>

        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Registration Under Review
        </h1>
        
        <p className="text-gray-600 mb-6">
          Thank you for applying to become a therapist on our platform! Your application is currently being reviewed by our team.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div className="text-left">
              <h3 className="font-semibold text-yellow-800 text-sm">Pending Approval</h3>
              <p className="text-yellow-700 text-xs">
                This process typically takes up to 24 hours
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm">What happens next?</h3>
          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-3 h-3 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Background Check</p>
                <p className="text-xs text-gray-600">Verifying your credentials and certifications</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-3 h-3 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Profile Review</p>
                <p className="text-xs text-gray-600">Checking your profile completeness and quality</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-3 h-3 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Final Approval</p>
                <p className="text-xs text-gray-600">Completing the verification process</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Have questions about your application?
          </p>
          <button
            onClick={() => router.push('/support')}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg"
          >
            Contact Support
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          You'll receive an email notification once your application is approved
        </p>
      </motion.div>
    </div>
  )
}

function RejectedScreen() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center"
      >
        <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Application Not Approved
        </h1>
        
        <p className="text-gray-600 mb-6">
          We're sorry, but your application to become a therapist was not approved at this time.
        </p>

        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
          <p className="text-red-700 text-sm">
            You can reapply after addressing the issues mentioned in the email we sent you.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/support')}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-lg"
          >
            Contact Support for Details
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </motion.div>
    </div>
  )
}
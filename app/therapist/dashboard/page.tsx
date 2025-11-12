"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Calendar, Users, Star, MessageCircle, TrendingUp, Clock, MapPin, ChevronRight, CreditCard, FileText, Settings, Bell, Zap, Wallet, BarChart3, Plus, Download, Award, Shield, Navigation, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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

export default function TherapistDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'earnings' | 'clients'>('overview')
  const [todayBookings, setTodayBookings] = useState<Booking[]>([])
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([])
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

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockTodayBookings: Booking[] = [
      {
        id: "1",
        clientName: "John Smith",
        clientImage: "/client1.jpg",
        service: "Deep Tissue Massage",
        duration: 60,
        price: 450,
        date: new Date(Date.now() + 1000 * 60 * 60 * 2),
        status: 'confirmed',
        location: "Client's Home - 2.3km away"
      },
      {
        id: "2",
        clientName: "Sarah Wilson",
        clientImage: "/client2.jpg",
        service: "Swedish Massage",
        duration: 90,
        price: 600,
        date: new Date(Date.now() + 1000 * 60 * 60 * 4),
        status: 'confirmed',
        location: "My Studio"
      }
    ]

    const mockUpcomingBookings: Booking[] = [
      {
        id: "3",
        clientName: "Mike Johnson",
        clientImage: "/client3.jpg",
        service: "Sports Massage",
        duration: 60,
        price: 500,
        date: new Date(Date.now() + 1000 * 60 * 60 * 24),
        status: 'confirmed',
        location: "Client's Home - 5.1km away"
      },
      {
        id: "4",
        clientName: "Emma Davis",
        clientImage: "/client4.jpg",
        service: "Aromatherapy",
        duration: 90,
        price: 650,
        date: new Date(Date.now() + 1000 * 60 * 60 * 48),
        status: 'pending',
        location: "My Studio"
      }
    ]

    setTodayBookings(mockTodayBookings)
    setUpcomingBookings(mockUpcomingBookings)
    setStats({
      totalEarnings: 12500,
      completedSessions: 42,
      averageRating: 4.8,
      responseRate: 95,
      monthlyGrowth: 12,
      nextPayout: 3200
    })
  }, [])

  // Simulate incoming booking notification
  useEffect(() => {
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
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setShowNotification(false)
      }, 5000)
    }

    // Simulate notification after 3 seconds of page load
    const timer = setTimeout(simulateIncomingBooking, 3000)
    
    return () => clearTimeout(timer)
  }, [])

  const playNotificationSound = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.src = '/assets/new.mp3' // Same sound as en-route page
      audioRef.current.volume = 0.4
    }
    
    if (!hasPlayedSound) {
      audioRef.current.play().catch(() => {
        // Fallback: Create a simple tone using Web Audio API
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

  const handleBookingAction = (bookingId: string, action: 'accept' | 'decline' | 'start' | 'complete') => {
    console.log(`Booking ${bookingId}: ${action}`)
    
    if (action === 'start') {
      router.push(`/therapist/session/${bookingId}`)
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
      setActiveTab('bookings')
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

  return (
    <div className="min-h-screen bg-[#1a2a3a] text-white pb-20">
      {/* Push Notification */}
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

      {/* Header */}
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

        {/* Quick Stats Overview */}
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

      {/* Navigation Tabs */}
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

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Today's Priority */}
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
                          onClick={() => handleBookingAction(booking.id, 'start')}
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

            {/* Quick Actions */}
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

            {/* Performance Metrics */}
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
            {/* Upcoming Bookings */}
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
            {/* Earnings Overview */}
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
            {/* Client Management */}
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

      {/* Bottom Navigation */}
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
    </div>
  )
}
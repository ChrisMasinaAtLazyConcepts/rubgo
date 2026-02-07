"use client"

import { BottomNav } from "@/components/bottom-nav"
import { MobileHeader } from "@/components/mobile-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Clock, ChevronRight, Phone, MessageCircle, Star, Sparkles, Heart, Zap, ShieldCheck, Mic, AlertTriangle, Shield, Send, AlertCircle, CheckCircle, X, Navigation, Car, Timer, Users, LifeBuoy, Headphones, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Booking } from "@/lib/types"
import { Label } from "@radix-ui/react-label"
import { VoiceSafewordListener } from "@/components/voice-safeword-listener"
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { toast } from "react-hot-toast"

interface BookingViewModalProps {
  bookingId: string
  booking: Booking
  onClose: () => void
}

interface EmergencyAlertPopupProps {
  onConfirm: () => void
  onCancel: () => void
}

interface ReviewFormProps {
  booking: Booking
  bookingId: string
  onBack: () => void
  onClose: () => void
}

// ReviewForm component - moved outside BookingViewModal
function ReviewForm({ booking, bookingId, onBack, onClose }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [cleanRating, setCleanRating] = useState(0)
  const [professionalRating, setProfessionalRating] = useState(0)
  const [punctualRating, setPunctualRating] = useState(0)
  const [selectedQualities, setSelectedQualities] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const renderStars = (count: number, interactive = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => onChange?.(star) : undefined}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform duration-200' : ''}`}
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                star <= count 
                  ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm' 
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    try {
      setIsSubmitting(true)

      const reviewData = {
        bookingId,
        therapistId: booking.therapist.id,
        therapistName: booking.therapist.name,
        serviceName: booking.service.name,
        overallRating: rating,
        cleanRating: cleanRating || null,
        professionalRating: professionalRating || null,
        punctualRating: punctualRating || null,
        selectedQualities,
        reviewText: review,
        date: booking.date,
        time: booking.startTime,
        timestamp: new Date().toISOString()
      }

      // Call local API to save review
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit review')
      }

      const result = await response.json()
      
      toast.success('Review submitted successfully!')
      
      // Close the modal after a brief delay
      setTimeout(() => {
        onClose()
      }, 1500)

    } catch (error) {
      console.error('Review submission error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-3 text-gray-800">Rate Your Session</h1>
        <p className="text-gray-600 text-lg">Share your experience with {booking.therapist.name}</p>
      </div>

      <motion.div 
        className="bg-white rounded-3xl shadow-lg p-6 mb-6 border border-blue-100"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center gap-4 mb-6">
          <img
            src={booking.therapist.image}
            alt={booking.therapist.name}
            className="w-12 h-12 rounded-2xl object-cover shadow-md"
          />
          <div>
            <h3 className="font-semibold text-gray-800">{booking.therapist.name}</h3>
            <p className="text-sm text-gray-600">{booking.service.name}</p>
          </div>
        </div>

        <div className="text-center mb-8">
          <p className="text-lg font-semibold text-gray-800 mb-6">How would you rate your session?</p>
          <div className="flex justify-center">
            {renderStars(rating, true, setRating)}
          </div>
        </div>

        {/* Therapist Quality Check Section */}
        <div className="space-y-4 mb-6">
          <label className="block text-sm font-semibold text-gray-700">
            Was your therapist...
          </label>
          
          <div className="space-y-3">
            {/* Clean & Hygienic */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-lg">🧼</span>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-700">Clean & Hygienic</p>
                  <p className="text-xs text-gray-500">Therapist and equipment were clean</p>
                </div>
              </div>
              {renderStars(cleanRating, true, setCleanRating)}
            </div>

            {/* Professional */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-lg">👔</span>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-700">Professional</p>
                  <p className="text-xs text-gray-500">Professional demeanor and conduct</p>
                </div>
              </div>
              {renderStars(professionalRating, true, setProfessionalRating)}
            </div>

            {/* On Time */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-lg">⏰</span>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-700">On Time</p>
                  <p className="text-xs text-gray-500">Arrived on time</p>
                </div>
              </div>
              {renderStars(punctualRating, true, setPunctualRating)}
            </div>
          </div>

          {/* Additional Qualities */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Select all that apply:</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'clean_equipment', label: 'Clean equipment', icon: '🛡️' },
                { id: 'professional_attire', label: 'Professional attire', icon: '👕' },
                { id: 'good_communication', label: 'Good communication', icon: '💬' },
                { id: 'respectful', label: 'Respectful', icon: '🙏' },
                { id: 'skilled', label: 'Highly skilled', icon: '🎯' },
                { id: 'clean_space', label: 'Clean workspace', icon: '🧹' }
              ].map((quality) => (
                <label
                  key={quality.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-sm ${
                    selectedQualities.includes(quality.id)
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedQualities.includes(quality.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedQualities([...selectedQualities, quality.id])
                      } else {
                        setSelectedQualities(selectedQualities.filter(id => id !== quality.id))
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{quality.icon} {quality.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Review Text */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700">
            Write a review (optional)
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share details about your experience, what you enjoyed, or any suggestions..."
            className="w-full h-32 p-4 border border-gray-300 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={isSubmitting}
          />
        </div>

        {/* Rating Summary */}
        {(cleanRating > 0 || professionalRating > 0 || punctualRating > 0 || selectedQualities.length > 0) && (
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 mb-4">
            <h4 className="font-medium text-blue-900 mb-2">Your Quality Ratings:</h4>
            <div className="space-y-2 text-sm text-blue-800">
              {cleanRating > 0 && <p>🧼 Cleanliness: {cleanRating}/5</p>}
              {professionalRating > 0 && <p>👔 Professionalism: {professionalRating}/5</p>}
              {punctualRating > 0 && <p>⏰ Punctuality: {punctualRating}/5</p>}
              {selectedQualities.length > 0 && (
                <p>✅ Additional qualities: {selectedQualities.length} selected</p>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 border-gray-300 rounded-2xl hover:bg-gray-50 font-semibold"
        >
          Back
        </Button>
        <Button 
          onClick={handleSubmitReview}
          disabled={rating === 0 || isSubmitting}
          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl font-semibold shadow-lg transition-all duration-300 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Heart className="w-5 h-5 mr-2" />
              Submit Review
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )
}

function EmergencyAlertPopup({ onConfirm, onCancel }: EmergencyAlertPopupProps) {
  const [countdown, setCountdown] = useState(60)
  const [phase, setPhase] = useState<'initial' | 'countdown' | 'success'>('initial')
  const [audioPlaying, setAudioPlaying] = useState(false)

  useEffect(() => {
    if (phase === 'initial') {
      const timer = setTimeout(() => {
        setPhase('countdown')
      }, 1000)
      return () => clearTimeout(timer)
    }

    if (phase === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }

    if (phase === 'countdown' && countdown === 0) {
      setPhase('success')
    }
  }, [phase, countdown])

  const handleConfirm = () => {
    // In a real app, this would trigger emergency protocols
    console.log("Emergency alert confirmed - protocols activated")
    setAudioPlaying(true)
    setPhase('countdown')
  }

  const handleCancel = () => {
    console.log("Emergency alert cancelled")
    onCancel()
  }

  const playEmergencyTone = () => {
    const audio = new Audio('/audio/emergency-tone.mp3')
    audio.loop = true
    audio.play()
    setAudioPlaying(true)
    
    setTimeout(() => {
      audio.pause()
      setAudioPlaying(false)
    }, 5000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm"
    >
      {phase === 'initial' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-red-200"
        >
          {/* Warning Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-center relative overflow-hidden">
            {/* Pulsing background */}
            <div className="absolute inset-0 bg-red-500/20 animate-ping" style={{ animationDelay: '0.5s' }} />
            
            <div className="relative z-10">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block p-3 bg-white/20 rounded-full backdrop-blur-sm mb-4"
              >
                <AlertTriangle className="w-12 h-12 text-white" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-white mb-2">Emergency Assistance</h2>
              <p className="text-red-100">Are you okay?</p>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-red-600" />
                </div>
                <p className="text-gray-700">
                  Our security team has detected unusual activity. Would you like to activate emergency protocols?
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-yellow-800 mb-1">What happens next:</p>
                    <ul className="space-y-1 text-yellow-700">
                      <li>• Security team will contact you immediately</li>
                      <li>• Live audio monitoring activated</li>
                      <li>• Emergency contacts notified</li>
                      <li>• Security vehicle dispatched to your location</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1 border-gray-300 hover:bg-gray-50 rounded-xl font-semibold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold shadow-lg"
              >
                <LifeBuoy className="w-5 h-5 mr-2" />
                Activate Emergency
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {phase === 'countdown' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-red-200"
        >
          {/* Countdown Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-center relative overflow-hidden">
            <div className="relative z-10">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block mb-4"
              >
                <div className="w-20 h-20 bg-white/20 rounded-full backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                  <span className="text-2xl font-bold text-white">{countdown}s</span>
                </div>
              </motion.div>
              
              <h2 className="text-2xl font-bold text-white mb-2">Emergency Response Activated</h2>
              <p className="text-red-100">Help is on the way</p>
            </div>
          </div>

          <div className="p-6">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Emergency Response</span>
                <span>{countdown}s remaining</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 60, ease: "linear" }}
                  className="h-full bg-gradient-to-r from-red-600 to-red-500"
                />
              </div>
            </div>

            {/* Status Updates */}
            <div className="space-y-4 mb-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl"
              >
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-green-800">Security Team Alerted</p>
                  <p className="text-xs text-green-600">Response time: 2s</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Headphones className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-blue-800">Audio Monitoring Active</p>
                  <p className="text-xs text-blue-600">Live connection established</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
                className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-xl"
              >
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-purple-800">Emergency Contacts Notified</p>
                  <p className="text-xs text-purple-600">3 contacts alerted</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2 }}
                className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-xl"
              >
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Car className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold text-orange-800">Security Vehicle Dispatched</p>
                  <p className="text-xs text-orange-600">ETA: {Math.floor(countdown/2)}s</p>
                </div>
              </motion.div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Stay calm.</span> Our team is coordinating with local authorities.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {phase === 'success' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-green-200"
        >
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="inline-block p-4 bg-white/20 rounded-full backdrop-blur-sm mb-4"
            >
              <ShieldCheck className="w-16 h-16 text-white" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Emergency Response Complete</h2>
            <p className="text-emerald-100">Help is on the way to your location</p>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Your Safety is Our Priority</h3>
                <p className="text-gray-600">
                  Our security team has been notified and help is en route to your location.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <LifeBuoy className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">What happens next:</h4>
                    <ul className="space-y-2 text-sm text-blue-700">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        A security professional will call you within 2 minutes
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Emergency services have been alerted to your location
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Your therapist has been notified to await security arrival
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        All session audio is being recorded for safety review
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={onConfirm}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl font-semibold"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call Security Team Now
                </Button>
                
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="w-full border-gray-300 hover:bg-gray-50 rounded-xl font-semibold"
                >
                  Return to Session
                </Button>
              </div>

              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  RubGo Security ID: SEC-{Date.now().toString().slice(-6)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

function BookingViewModal({ bookingId, booking, onClose }: BookingViewModalProps) {
  const [currentView, setCurrentView] = useState<'details' | 'review'>('details')
  const [showEmergencyModal, setShowEmergencyModal] = useState(false)
  const [emergencyNote, setEmergencyNote] = useState("")
  const [showSafewordWarning, setShowSafewordWarning] = useState(true)
  const [showEnRoutePopup, setShowEnRoutePopup] = useState(false)
  const [safewordDetected, setSafewordDetected] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(booking.duration * 60); // in seconds
  const [timeRemainingPercent, setTimeRemainingPercent] = useState(100);
  const [sessionEndTime, setSessionEndTime] = useState(() => {
      const end = new Date();
      end.setMinutes(end.getMinutes() + booking.duration);
      return end;
  });
  const [showEmergencyTrigger, setShowEmergencyTrigger] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [isSessionActive, setIsSessionActive] = useState(true);

  // Show emergency popup after 6 seconds for therapist-en-route
  useEffect(() => {
    if (booking.status === 'therapist-en-route') {
      const timer = setTimeout(() => {
        setShowEnRoutePopup(true)
      }, 6000)

      return () => clearTimeout(timer)
    }
  }, [booking.status])

  // Timer effect
  useEffect(() => {
    if (!isSessionActive || booking.status !== 'in-progress') return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          // Session ended logic
          return 0;
        }
        const newTime = prev - 1;
        const percent = (newTime / (booking.duration * 60)) * 100;
        setTimeRemainingPercent(percent);
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isSessionActive, booking.duration, booking.status]);

  // Delayed emergency trigger effect
  useEffect(() => {
    if (booking.status !== 'in-progress') return;
    
    const delayTimer = setTimeout(() => {
      setShowEmergencyTrigger(true);
    }, 30000); // 30 seconds delay
    
    return () => clearTimeout(delayTimer);
  }, [booking.status]);

  // Countdown timer for emergency popup
  useEffect(() => {
    if (!showEnRoutePopup) return;
    
    const countdownTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          // Auto-confirm emergency if no response
          setShowEnRoutePopup(false);
          setShowEmergencyModal(true);
          setEmergencyNote("Emergency auto-confirmed - no response from user");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(countdownTimer);
  }, [showEnRoutePopup]);

  const handleEmergencySubmit = async () => {
    console.log("Emergency alert sent:", emergencyNote)
    setShowEmergencyModal(false)
    setEmergencyNote("")
    alert("Emergency alert sent! Help is on the way.")
  }

  const handleAcknowledgeSafeword = () => {
    setShowSafewordWarning(false)
  }

  const renderStars = (count: number, interactive = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => onChange?.(star) : undefined}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform duration-200' : ''}`}
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                star <= count 
                  ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm' 
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  const views = {
    'in-progress': (
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 fixed inset-0 z-50 flex flex-col">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20"
        >
          <X className="w-6 h-6" />
        </Button>
        
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-teal-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="flex-1 relative flex items-center justify-center p-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center w-full max-w-2xl"
          >
            {/* Zen-inspired Icon */}
            <motion.div 
              className="relative mb-8 mx-auto w-48 h-48"
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 1.5, type: "spring" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="w-40 h-40 border-4 border-emerald-300/50 rounded-full flex items-center justify-center">
                  <div className="w-32 h-32 border-2 border-emerald-200/30 rounded-full flex items-center justify-center">
                    <Clock className="w-20 h-20 text-emerald-200" />
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.h2 
              className="text-4xl font-bold mb-6 bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Your Session Has Started
            </motion.h2>
            
            <motion.p 
              className="text-xl mb-2 text-white/90"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Relax and enjoy your massage with
            </motion.p>
            
            <motion.div 
              className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
                {booking.therapist.name.charAt(0)}
              </div>
              <div className="text-left">
                <p className="font-bold text-white">{booking.therapist.name}</p>
                <p className="text-sm text-emerald-300">Licensed Therapist</p>
              </div>
            </motion.div>

            {/* Session Timer and Progress */}
            <motion.div 
              className="mb-12"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex flex-col items-center gap-6">
                {/* Timer Circle */}
                <div className="relative">
                  <div className="w-64 h-64">
                    <CircularProgressbar
                      value={timeRemainingPercent}
                      text={`${Math.floor(timeRemaining / 60)}:${(timeRemaining % 60).toString().padStart(2, '0')}`}
                      styles={{
                        path: {
                          stroke: `rgba(52, 211, 153, ${0.8})`,
                          strokeLinecap: 'round',
                          transition: 'stroke-dashoffset 1s ease 0s',
                        },
                        trail: {
                          stroke: 'rgba(255, 255, 255, 0.1)',
                        },
                        text: {
                          fill: '#fff',
                          fontSize: '2.5rem',
                          fontWeight: 'bold',
                          fontFamily: 'monospace',
                        },
                      }}
                    />
                  </div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <p className="text-sm text-emerald-300/80">remaining</p>
                  </div>
                </div>
                
                {/* Session End Time */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/10">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-emerald-300" />
                    <div className="text-left">
                      <p className="text-sm text-emerald-300/80">Session ends at</p>
                      <p className="text-xl font-bold text-white">
                        {sessionEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Hidden Emergency Trigger (30-second delayed) */}
            {showEmergencyTrigger && (
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-8"
              >
                <Button 
                  variant="destructive"
                  className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white rounded-2xl px-8 py-4 font-bold shadow-2xl animate-pulse border border-red-400/50"
                  onClick={() => setShowEmergencyModal(true)}
                >
                  <AlertTriangle className="w-6 h-6 mr-3" />
                  EMERGENCY ASSISTANCE
                </Button>
                <p className="text-xs text-red-300/80 mt-3">Only use in genuine emergencies</p>
              </motion.div>
            )}
            
            {/* Instructions */}
            <motion.div 
              className="mt-8 max-w-md mx-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h4 className="font-bold text-white mb-3 text-lg">Session Guidelines</h4>
                <ul className="space-y-3 text-sm text-white/70">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Relax and breathe deeply throughout the session</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Communicate any discomfort immediately to your therapist</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Emergency assistance is available if needed</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* 30-second delayed Emergency Modal */}
        <AnimatePresence>
          {showEnRoutePopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-gradient-to-br from-red-900 via-rose-900 to-pink-900 rounded-3xl max-w-md w-full p-8 shadow-2xl border border-red-500/30"
              >
                {/* Alert Sound Indicator */}
                <div className="flex items-center justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
                    <div className="relative w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Emergency Assistance Requested
                  </h3>
                  <p className="text-red-200/80">
                    You have 30 seconds to confirm if you need emergency help
                  </p>
                </div>

                {/* Countdown Timer */}
                <div className="flex justify-center mb-8">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-white font-mono mb-2">
                      {countdown}
                    </div>
                    <p className="text-sm text-red-200/60">seconds remaining</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <Button
                    onClick={() => {
                      // Confirm emergency - proceed with full emergency protocol
                      setShowEnRoutePopup(false);
                      setShowEmergencyModal(true);
                      setEmergencyNote("User confirmed emergency assistance needed");
                    }}
                    className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white py-6 text-lg font-bold rounded-xl shadow-lg"
                  >
                    YES, I NEED HELP
                  </Button>

                  <Button
                    onClick={() => {
                      // Cancel emergency - resume session
                      setShowEnRoutePopup(false);
                      setShowEmergencyTrigger(false);
                      // Resume the session timer
                      setIsSessionActive(true);
                    }}
                    variant="outline"
                    className="w-full border-white/30 text-white hover:bg-white/10 py-6 text-lg rounded-xl"
                  >
                    NO, CONTINUE SESSION
                  </Button>
                </div>

                <p className="text-xs text-red-200/50 text-center mt-6">
                  If no response is received within 30 seconds, emergency services will be notified automatically
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full Emergency Modal (shown after confirmation) */}
        {showEmergencyModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-gray-200"
            >
              <div className="text-center mb-6">
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800">Emergency Alert</h3>
                <p className="text-gray-600 mt-2">Help will be dispatched to your location</p>
              </div>

              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                  <p className="text-sm text-red-700">
                    Are you sure you want to trigger an emergency alert? This will notify security and emergency contacts.
                  </p>
                </div>

                <textarea
                  value={emergencyNote}
                  onChange={(e) => setEmergencyNote(e.target.value)}
                  placeholder="Add any details about the emergency (optional)..."
                  className="w-full h-24 p-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />

                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowEmergencyModal(false)}
                    variant="outline"
                    className="flex-1 border-gray-300 hover:bg-gray-50 rounded-xl font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleEmergencySubmit}
                    className="flex-1 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white rounded-xl font-semibold"
                  >
                    <LifeBuoy className="w-5 h-5 mr-2" />
                    Send Emergency Alert
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    ),
    'upcoming': (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 z-50 flex flex-col">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm hover:bg-white"
        >
          <X size={24} />
        </Button>
        
        <div className="flex-1 relative flex items-center justify-center p-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md w-full text-center"
          >
            <div className="mb-8">
              <motion.div 
                className="text-6xl mb-4"
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  y: { duration: 3, repeat: Infinity },
                  rotate: { duration: 4, repeat: Infinity }
                }}
              >
                📅
              </motion.div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Upcoming Booking</h1>
              <p className="text-gray-600">Your session is scheduled and confirmed</p>
            </div>
            
            <motion.div 
              className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={booking.therapist.image}
                  alt={booking.therapist.name}
                  className="w-16 h-16 rounded-2xl object-cover shadow-lg border-2 border-blue-200"
                />
                <div className="text-left">
                  <h3 className="font-bold text-lg text-gray-800">{booking.therapist.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{booking.therapist.rating}</span>
                    <Sparkles className="w-4 h-4 text-blue-500" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">{new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                  <Clock className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">{booking.startTime} - {booking.endTime}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-700 text-sm">{booking.address}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    ),

    'completed': (
      <div className="fixed inset-0 bg-gradient-to-br from-green-50 to-emerald-100 z-50 overflow-y-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm hover:bg-white"
        >
          <X size={24} />
        </Button>
        
        <div className="max-w-md mx-auto py-8 px-6">
          {currentView === 'details' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4 drop-shadow-sm" />
                </motion.div>
                <h1 className="text-3xl font-bold mb-3 text-gray-800">Session Completed</h1>
                <p className="text-gray-600 text-lg">How was your experience with {booking.therapist.name}?</p>
              </div>

              <motion.div 
                className="bg-white rounded-3xl shadow-lg p-6 mb-6 border border-green-100"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={booking.therapist.image}
                    alt={booking.therapist.name}
                    className="w-16 h-16 rounded-2xl object-cover shadow-md border-2 border-green-200"
                  />
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{booking.therapist.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{booking.therapist.rating}</span>
                      <ShieldCheck className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-sm bg-gray-50 rounded-2xl p-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Service</span>
                    <span className="text-gray-800 font-semibold">{booking.service.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Date</span>
                    <span className="text-gray-800">{new Date(booking.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Time</span>
                    <span className="text-gray-800">{booking.startTime} - {booking.endTime}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Duration</span>
                    <span className="text-gray-800 font-semibold">{booking.service.duration} minutes</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Button 
                  onClick={() => setCurrentView('review')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl py-4 font-semibold shadow-lg transition-all duration-300"
                >
                  <Star className="w-5 h-5 mr-2" />
                  Rate & Review Session
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <ReviewForm
              booking={booking}
              bookingId={bookingId}
              onBack={() => setCurrentView('details')}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    ),

    'therapist-en-route': (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-50 to-pink-100 z-50 flex flex-col">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm hover:bg-white"
        >
          <X size={24} />
        </Button>
        
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-pink-500 rounded-full blur-xl animate-pulse delay-1000"></div>
        </div>

        <div className="flex-1 relative flex flex-col items-center justify-center p-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center max-w-md w-full"
          >
            {/* Therapist Arrival Animation */}
            <div className="relative mb-8">
              <motion.div
                animate={{ 
                  x: [0, 50, 0],
                  transition: { duration: 4, repeat: Infinity }
                }}
                className="inline-block"
              >
                <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl flex items-center justify-center mb-4 border-4 border-white">
                  <Car className="w-10 h-10 text-white" />
                </div>
              </motion.div>
              <div className="absolute top-1/2 left-1/2 w-32 h-1 bg-purple-300 -translate-x-1/2 -translate-y-1/2 -z-10 rounded-full">
                <motion.div 
                  className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
                  animate={{ width: ["0%", "100%", "0%"] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
              </div>
            </div>
            
            <motion.h2 
              className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Therapist En Route
            </motion.h2>
            
            <motion.p 
              className="text-xl mb-6 text-gray-700"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span className="font-semibold text-purple-700">{booking.therapist.name}</span> is on the way
            </motion.p>

            {/* Live Tracking */}
            <motion.div 
              className="bg-white rounded-3xl shadow-xl p-6 mb-8 border border-purple-100"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="text-left">
                  <p className="text-sm text-gray-600">Estimated Arrival</p>
                  <p className="text-2xl font-bold text-purple-700">8-12 min</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Distance</p>
                  <p className="text-2xl font-bold text-purple-700">4.2 km</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                  <Navigation className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-700">Live tracking active</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl">
                  <ShieldCheck className="w-5 h-5 text-pink-600" />
                  <span className="text-gray-700">Safety protocols enabled</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <Timer className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Selfie verification required on arrival</span>
                </div>
              </div>
            </motion.div>

            {/* Emergency Safeword Reminder */}
            <motion.div 
              className="mt-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-red-800">Emergency Safeword Active</p>
                    <p className="text-sm text-red-600">Say "STOP" or "HELP" for immediate assistance</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Emergency Alert Popup */}
        <AnimatePresence>
          {showEnRoutePopup && (
            <EmergencyAlertPopup
              onConfirm={() => {
                console.log("Emergency response completed")
                setShowEnRoutePopup(false)
              }}
              onCancel={() => setShowEnRoutePopup(false)}
            />
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {views[booking.status as keyof typeof views] || <div>Unknown booking status</div>}
    </motion.div>
  )
}

export default function BookingsPage() {
  const router = useRouter()
  const [activeBooking, setActiveBooking] = useState<{id: string, booking: Booking} | null>(null)
  const [activeEnRouteBooking, setActiveEnRouteBooking] = useState<Booking | null>(null)

  // Mock bookings data
  const bookings: Booking[] = [
    // Add your booking data here
  ]

  const handleTherapistArrived = () => {
    console.log('Therapist has arrived!')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-gradient-to-r from-green-500 to-emerald-500"
      case "in-progress":
        return "bg-gradient-to-r from-blue-500 to-cyan-500"
      case "upcoming":
        return "bg-gradient-to-r from-orange-500 to-amber-500"
      case "completed":
        return "bg-gradient-to-r from-gray-500 to-slate-500"
      case "therapist-en-route":
        return "bg-gradient-to-r from-purple-500 to-pink-500"
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmed"
      case "in-progress":
        return "In Progress"
      case "upcoming":
        return "Upcoming"
      case "completed":
        return "Completed"
      case "therapist-en-route":
        return "On the Way"
      default:
        return status
    }
  }

  const handleContactTherapist = (therapistName: string) => {
    console.log(`Contacting ${therapistName}`)
    alert(`Would contact ${therapistName} via chat/call`)
  }

  const handleViewDetails = (bookingId: string) => {
    router.push(`/bookings/${bookingId}`)
  }

  const handleView = (bookingId: string, booking: Booking) => {
    if(booking.status === 'therapist-en-route'){
      setActiveEnRouteBooking(booking)
      return
    }
    setActiveBooking({ id: bookingId, booking })
  }

  const handleCloseView = () => {
    setActiveBooking(null)
  }

  const handleCloseEnRoute = () => {
    setActiveEnRouteBooking(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-20">
      <MobileHeader title="My Massage Bookings" />

      <div className="p-4 space-y-6">
        {bookings.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 space-y-6"
          >
            <div className="flex justify-center">
              <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center shadow-lg">
                <Calendar className="h-12 w-12 text-blue-600" />
              </div>
            </div>
            <div className="space-y-3">
              <p className="font-bold text-2xl text-gray-800">No massage bookings yet</p>
              <p className="text-gray-600">Book your first massage therapist to get started</p>
            </div>
            <Button 
              onClick={() => router.push("/home")} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl px-8 py-3 font-semibold shadow-lg transition-all duration-300"
            >
              <Zap className="w-5 h-5 mr-2" />
              Find Therapists
            </Button>
          </motion.div>
        ) : (
          <>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <h2 className="text-2xl font-bold text-gray-800">Your Massage Sessions</h2>
              <p className="text-gray-600 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                Manage your upcoming and past bookings
              </p>
            </motion.div>

            <div className="space-y-4">
              {bookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    onClick={() => handleView(booking.id, booking)}
                    className="overflow-hidden border-l-4 border-l-green-400 cursor-pointer hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white rounded-3xl border-0 shadow-lg"
                  >
                    <CardContent className="p-0">
                      <div className="p-5 space-y-4">
                        {/* Therapist Info & Status */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <img
                                src={booking.therapist.image}
                                alt={booking.therapist.name}
                                className="w-14 h-14 rounded-2xl object-cover border-2 border-green-200 shadow-md"
                              />
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-gray-800">{booking.therapist.name}</h3>
                              <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm text-gray-600">
                                  {booking.therapist.rating} • {booking.service.name}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(booking.status)} text-white capitalize rounded-full px-3 py-1 font-semibold shadow-md`}>
                            {getStatusText(booking.status)}
                          </Badge>
                        </div>

                        {/* Booking Details */}
                        <div className="space-y-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-4 border border-gray-100">
                          <div className="flex items-center gap-3 text-gray-700">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <span className="font-medium">
                              {booking.date} at {booking.startTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-700">
                            <MapPin className="h-5 w-5 text-green-600" />
                            <span className="font-medium">{booking.address}</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-700">
                            <Clock className="h-5 w-5 text-purple-600" />
                            <span className="font-medium">{booking.service.duration} minutes • R{booking.service.price}</span>
                          </div>
                        </div>

                        {/* Price & Actions */}
                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                          <div>
                            <p className="text-xl font-bold text-gray-800">R{booking.service.price}</p>
                            <p className="text-xs text-gray-500">One-time session</p>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-10 w-10 bg-white border-gray-300 rounded-2xl hover:bg-blue-50 hover:border-blue-300 transition-all"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleContactTherapist(booking.therapist.name)
                                }}
                              >
                                <Phone className="h-5 w-5 text-blue-600" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-10 w-10 bg-white border-gray-300 rounded-2xl hover:bg-green-50 hover:border-green-300 transition-all"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleContactTherapist(booking.therapist.name)
                                }}
                              >
                                <MessageCircle className="h-5 w-5 text-green-600" />
                              </Button>
                            </div>
                            
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="gap-2 bg-white border-gray-300 rounded-2xl hover:bg-gray-50 font-semibold transition-all"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleViewDetails(booking.id)
                              }}
                            >
                              Details
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Completed Bookings Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="pt-8 border-t border-gray-200"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                Completed Sessions
              </h3>
              <div className="text-center py-12 space-y-4 bg-gradient-to-br from-gray-50 to-slate-100 rounded-3xl border-2 border-dashed border-gray-300">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto" />
                <div className="space-y-2">
                  <p className="font-semibold text-gray-700">No completed sessions yet</p>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">Your completed massage sessions will appear here for easy access and rebooking</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Active Booking Modal */}
      {activeBooking && (
        <BookingViewModal
          bookingId={activeBooking.id}
          booking={activeBooking.booking}
          onClose={handleCloseView}
        />
      )}

      {/* Therapist En Route Modal */}
      {activeEnRouteBooking && (
        <BookingViewModal
          bookingId={activeEnRouteBooking.id}
          booking={activeEnRouteBooking}
          onClose={handleCloseEnRoute}
        />
      )}

      <BottomNav />
    </div>
  )
}
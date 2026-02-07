'use client'

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Loader2, ArrowLeft, Eye, EyeOff, User, Users, Camera, X, CheckCircle, Shield, AlertCircle, Mail, Phone as PhoneIcon, Lock, Building, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import SelfieVerification from "@/components/selfie-verification"
import HomePage from "@/app/home/page"

// API endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [userType, setUserType] = useState<"client" | "therapist" | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  
  // State for terms popup and medical consents - CORRECTED: Only declare once
  const [showTermsPopup, setShowTermsPopup] = useState(false)
  const [medicalConsentGiven, setMedicalConsentGiven] = useState(false)
  const [touchConsentGiven, setTouchConsentGiven] = useState(false)
  const [audioConsentGiven, setAudioConsentGiven] = useState(false)
  const [termsConsentGiven, setTermsConsentGiven] = useState(false)
  
  const [currentStep, setCurrentStep] = useState<'form' | 'verification' | 'success'>('form')
  const [verificationProgress, setVerificationProgress] = useState(0)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationMethod, setVerificationMethod] = useState<'selfie' | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // API: Handle user signup
  const handleSignup = async (userData: any) => {
    try {
      setIsLoading(true)
      setError("")

      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed')
      }

      // Store token and user data
      if (data.token) {
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }

      toast.success('Account created successfully!')
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // API: Handle verification
  const handleVerification = async (verificationData: any) => {
    try {
      setIsVerifying(true)
      
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(verificationData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed')
      }

      toast.success('Verification completed!')
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed'
      toast.error(errorMessage)
      throw err
    } finally {
      setIsVerifying(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!userType) {
      setError("Please select account type")
      return
    }

    if (!acceptedTerms) {
      setError("Please accept the Terms of Service and Privacy Policy")
      return
    }

    if (!audioConsentGiven || !medicalConsentGiven || !touchConsentGiven || !termsConsentGiven) {
      setError("Please complete all required consents")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    try {
      const userData = {
        name,
        email,
        phone,
        password,
        userType,
        audioConsentGiven,
        medicalConsentGiven,
        touchConsentGiven,
        termsConsentGiven,
        acceptedTerms
      }

      const result = await handleSignup(userData)
      
      // If therapist, go to verification
      if (userType === "therapist") {
        setCurrentStep('verification')
      } else {
        // For clients, go directly to success
        setCurrentStep('success')
      }
    } catch (err) {
      // Error already handled in handleSignup
    }
  }

  const startSelfieVerification = async () => {
    setVerificationMethod('selfie')
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      setError('Unable to access camera. Please ensure you have granted camera permissions.')
      setIsVerifying(false)
    }
  }

  const captureSelfie = async () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        context.drawImage(videoRef.current, 0, 0)
        
        // Convert canvas to blob
        canvasRef.current.toBlob(async (blob) => {
          if (blob) {
            // Create FormData for file upload
            const formData = new FormData()
            formData.append('selfie', blob, 'selfie.jpg')
            formData.append('verificationType', 'selfie')
            
            try {
              await handleVerification(formData)
              setVerificationProgress(100)
              
              setTimeout(() => {
                setCurrentStep('success')
              }, 500)
            } catch (err) {
              // Error already handled
            }
          }
        }, 'image/jpeg')
      }
    }
  }

  const handleVerificationSuccess = () => {
    if (userType === "therapist") {
      router.push("/therapist/onboarding")
    } else {
      router.push("/home")
    }
  }

  // Sleek Button Component
  const SleekButton = ({ 
    children, 
    onClick, 
    variant = "primary",
    loading = false,
    disabled = false,
    fullWidth = true,
    className = "",
    icon: Icon
  }: {
    children: React.ReactNode
    onClick?: () => void
    variant?: 'primary' | 'secondary' | 'outline'
    loading?: boolean
    disabled?: boolean
    fullWidth?: boolean
    className?: string
    icon?: React.ComponentType<{ className?: string }>
  }) => {
    const baseClasses = "relative overflow-hidden transition-all duration-300 font-medium rounded-xl"
    const variantClasses = {
      primary: "bg-gradient-to-r from-[#71CBD1] to-[#5bb5c1] text-white hover:from-[#5bb5c1] hover:to-[#4aa2ad] active:scale-[0.98] shadow-lg hover:shadow-xl",
      secondary: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 hover:from-gray-200 hover:to-gray-300 border border-gray-300",
      outline: "bg-transparent border-2 border-[#71CBD1] text-[#71CBD1] hover:bg-[#71CBD1]/10"
    }
    return (
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`
          ${baseClasses}
          ${variantClasses[variant]}
          ${fullWidth ? 'w-full' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
          px-6 py-3
        `}
      >
        <div className="flex items-center justify-center gap-2">
          {Icon && <Icon className="w-5 h-5" />}
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          <span>{children}</span>
        </div>
      </button>
    )
  }

  // Sleek Input Component
  const SleekInput = ({ 
    label, 
    type, 
    value, 
    onChange, 
    placeholder, 
    icon: Icon,
    required = false,
    disabled = false
  }: {
    label: string
    type: string
    value: string
    onChange: (value: string) => void
    placeholder: string
    icon?: React.ComponentType<{ className?: string }>
    required?: boolean
    disabled?: boolean
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
      </Label>
      <div className="relative">
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="h-12 rounded-xl border-gray-300 focus:border-[#71CBD1] focus:ring-[#71CBD1] bg-white/80 backdrop-blur-sm pl-10 transition-all duration-200"
        />
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  )

  // Success Component with auto-redirect
  const SuccessScreen = () => {
    useEffect(() => {
      // Redirect to homepage after 3 seconds
      const timer = setTimeout(() => {
        router.push('/home')
      }, 3000)
      
      return () => clearTimeout(timer)
    }, [router])

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full text-center space-y-6"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-24 h-24 bg-green-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>

          {/* Success Message */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-gray-800">Verification Complete!</h1>
            <p className="text-gray-600 text-lg">
              Your identity has been successfully verified. Welcome to RubHub{userType === 'therapist' ? ' as a Therapist!' : '!'}
            </p>
            <p className="text-gray-500 text-sm mt-4">
              Redirecting to homepage in 3 seconds...
            </p>
          </div>

          {/* Continue Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={() => router.push('/home')}
              className="w-full bg-[#71CBD1] hover:bg-[#5bb5c1] text-white font-semibold py-4 rounded-2xl shadow-lg text-lg"
            >
              Go to Homepage Now
            </Button>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  // Terms Popup Component with Medical Consent
  const TermsPopup = () => {
    if (!showTermsPopup) return null

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl"
        >
          <div className="sticky top-0 bg-white border-b border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#71CBD1]/10 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#71CBD1]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Medical Consent & Terms</h2>
                  <p className="text-sm text-gray-600">Important medical and safety information</p>
                </div>
              </div>
              <button
                onClick={() => setShowTermsPopup(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Safety Notice */}
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Safety First</h3>
              <p className="text-sm text-blue-800">
                For everyone's protection, sessions may be audio recorded and stored securely for 30 days.
              </p>
            </div>

            {/* Medical Disclosures */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Medical Disclosures & Consent</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">I confirm I have <strong>no current injuries</strong> that could be aggravated by massage therapy</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">I confirm I am <strong>not pregnant</strong> (or have consulted my physician if pregnant)</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">I confirm I have <strong>no allergies</strong> to massage oils, lotions, or aromatherapy products</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">I consent to therapeutic touch as appropriate for the massage treatment</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">I will communicate any discomfort or need for pressure adjustment during the session</span>
                </li>
              </ul>
            </div>

            {/* Terms & Conditions */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Terms & Privacy</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Our Terms of Service and Privacy Policy</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Audio recording policy for safety (30-day storage)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Data processing in accordance with applicable laws</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">I will notify my therapist of any health changes before future sessions</span>
                </li>
              </ul>
            </div>

            {/* Consent Checkboxes */}
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="medical-consent"
                    checked={medicalConsentGiven}
                    onChange={(e) => setMedicalConsentGiven(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-red-300 text-red-600 focus:ring-red-500"
                  />
                  <label htmlFor="medical-consent" className="text-sm text-red-800">
                    <strong>Medical Consent:</strong> I confirm all medical disclosures above are accurate. I understand providing false information may void insurance coverage and could be harmful to my health.
                  </label>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="touch-consent"
                    checked={touchConsentGiven}
                    onChange={(e) => setTouchConsentGiven(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="touch-consent" className="text-sm text-blue-800">
                    <strong>Therapeutic Touch Consent:</strong> I consent to appropriate therapeutic touch for massage treatment and will communicate any discomfort immediately.
                  </label>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-300">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="audio-consent"
                    checked={audioConsentGiven}
                    onChange={(e) => setAudioConsentGiven(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-[#71CBD1] focus:ring-[#71CBD1]"
                  />
                  <label htmlFor="audio-consent" className="text-sm text-gray-700">
                    <strong>Audio Recording Consent:</strong> I acknowledge and consent to audio recordings for safety purposes (stored for 30 days)
                  </label>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-300">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms-consent"
                    checked={termsConsentGiven}
                    onChange={(e) => setTermsConsentGiven(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-[#71CBD1] focus:ring-[#71CBD1]"
                  />
                  <label htmlFor="terms-consent" className="text-sm text-gray-700">
                    <strong>Terms Acceptance:</strong> I accept the Terms of Service and Privacy Policy
                  </label>
                </div>
              </div>
            </div>

            {/* Emergency Contact Reminder */}
            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-yellow-800 text-sm">Important Reminder</h4>
                  <p className="text-xs text-yellow-700 mt-1">
                    Always inform your therapist of any health changes. In case of emergency, use the emergency button or call local emergency services immediately.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6">
            <Button
              onClick={() => {
                if (!medicalConsentGiven) {
                  toast.error("Please confirm medical disclosures")
                  return
                }
                if (!touchConsentGiven) {
                  toast.error("Please consent to therapeutic touch")
                  return
                }
                if (!audioConsentGiven) {
                  toast.error("Please acknowledge audio recording policy")
                  return
                }
                if (!termsConsentGiven) {
                  toast.error("Please accept terms and conditions")
                  return
                }
                setShowTermsPopup(false)
                toast.success("All consents recorded successfully.")
              }}
              className="w-full bg-gradient-to-r from-[#71CBD1] to-teal-600 hover:from-[#5bb5c1] hover:to-teal-700 text-white py-3 rounded-xl font-semibold"
            >
              I Understand & Agree to All Terms
            </Button>
            <p className="text-xs text-gray-500 text-center mt-3">
              This consent is valid for all future sessions unless revoked in writing
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  // Show verification or success screens
  if (currentStep === 'verification') {
    return (
      <>
        <TermsPopup />
        <SelfieVerification />
      </>
    )
  }

  if (currentStep === 'success') {
    return <SuccessScreen />
  }

  // Show account type selection if not chosen
  if (!userType) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <TermsPopup />
        
        <div className="p-6 max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => router.back()} 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-xl font-bold text-gray-900">Join RubHub</h1>
            </div>
          </div>

          {/* Main Content */}
          <div className="text-center">
            <div className="mb-8">
              <img 
                className="mx-auto w-48 h-48 object-contain"
                src="/rubgo-login.png"
                alt="RubHub Logo" 
              />
              <p className="text-gray-500 mt-4">Choose your account type to get started</p>
            </div>

            {/* Account Type Selection */}
            <div className="space-y-4 mb-8">
              <Card 
                className="border-2 border-gray-200 hover:border-[#71CBD1] transition-all duration-300 cursor-pointer hover:shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden group"
                onClick={() => setUserType("client")}
              >
                <CardContent className="p-6">
                  <div className="flex gap-4 items-start">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#71CBD1] to-[#5bb5c1] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                      <User className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2 text-start">
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg text-gray-900">Client</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Book licensed massage therapists
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        Instant access
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="border-2 border-gray-200 hover:border-green-500 transition-all duration-300 cursor-pointer hover:shadow-lg bg-gradient-to-br from-green-50 to-white overflow-hidden group"
                onClick={() => setUserType("therapist")}
              >
                <CardContent className="p-6">
                  <div className="flex gap-4 items-start">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                      <Building className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2 text-start">
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg text-gray-900">Therapist</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Join our professional network
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-blue-600">
                        <Shield className="w-3 h-3" />
                        Verification required
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Login Link */}
            <div className="text-center text-sm">
              <span className="text-gray-500">Already have an account? </span>
              <Link 
                href="/auth/signin" 
                className="text-[#71CBD1] hover:text-[#5bb5c1] font-semibold transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main signup form
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <TermsPopup />
      
      {/* Header */}
      <div className="p-6 max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => setUserType(null)} 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">
              {userType === "therapist" ? "Apply as Therapist" : "Create Account"}
            </h1>
            <p className="text-sm text-gray-500">
              {userType === "therapist" 
                ? "Join our professional network" 
                : "Sign up to book massage therapists"
              }
            </p>
          </div>
        </div>

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <SleekInput
            label="Full Name"
            type="text"
            value={name}
            onChange={setName}
            placeholder="John Smith"
            icon={User}
            required
          />

          <SleekInput
            label="Email Address"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            icon={Mail}
            required
          />

          <SleekInput
            label="Phone Number"
            type="tel"
            value={phone}
            onChange={setPhone}
            placeholder="+27 12 345 6789"
            icon={PhoneIcon}
            required
          />

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                disabled={isLoading}
                className="h-12 rounded-xl border-gray-300 focus:border-[#71CBD1] focus:ring-[#71CBD1] bg-white/80 backdrop-blur-sm pl-10 pr-10 transition-all duration-200"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Lock className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Confirm Password</Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                disabled={isLoading}
                className="h-12 rounded-xl border-gray-300 focus:border-[#71CBD1] focus:ring-[#71CBD1] bg-white/80 backdrop-blur-sm pl-10 pr-10 transition-all duration-200"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Lock className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="space-y-2">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-[#71CBD1] focus:ring-[#71CBD1]"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-700">
                I agree to the{" "}
                <button
                  type="button"
                  onClick={() => setShowTermsPopup(true)}
                  className="text-[#71CBD1] hover:underline font-medium"
                >
                  Terms of Service
                </button>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#71CBD1] hover:underline font-medium">
                  Privacy Policy
                </Link>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full relative overflow-hidden transition-all duration-300 font-medium rounded-xl
              bg-gradient-to-r from-[#71CBD1] to-[#5bb5c1] text-white 
              hover:from-[#5bb5c1] hover:to-[#4aa2ad] active:scale-[0.98] shadow-lg hover:shadow-xl
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              px-6 py-3 mt-6
            `}
          >
            <div className="flex items-center justify-center gap-2">
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              <span>
                {isLoading ? (
                  "Creating Account..."
                ) : userType === "therapist" ? (
                  "Start Application"
                ) : (
                  "Create Account"
                )}
              </span>
            </div>
          </button>

          {/* Login Link */}
          <div className="text-center text-sm pt-4">
            <span className="text-gray-500">Already have an account? </span>
            <Link 
              href="/auth/signin" 
              className="text-[#71CBD1] hover:text-[#5bb5c1] font-semibold transition-colors"
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
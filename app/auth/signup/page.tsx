"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Loader2, ArrowLeft, Eye, EyeOff, User, Users, Camera, X, Fingerprint, CheckCircle, Shield, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"

export default function SignUpPage() {
  const router = useRouter()
  const { signUp } = useAuth()
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
  const [showTermsPopup, setShowTermsPopup] = useState(false)
  const [currentStep, setCurrentStep] = useState<'form' | 'verification' | 'success'>('form')
  const [verificationProgress, setVerificationProgress] = useState(0)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationMethod, setVerificationMethod] = useState<'selfie' | 'fingerprint' | null>(null)
  const [hasFingerprintSupport, setHasFingerprintSupport] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Check for fingerprint support
  useEffect(() => {
    if (typeof window !== 'undefined' && 'PublicKeyCredential' in window) {
      setHasFingerprintSupport(true)
    }
  }, [])

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

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      await signUp(email, password, name)
      setCurrentStep('verification')
    } catch (err) {
      setError("Failed to create account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const startSelfieVerification = async () => {
    setVerificationMethod('selfie')
    setIsVerifying(true)
    
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

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        context.drawImage(videoRef.current, 0, 0)
        
        // Start verification process
        simulateVerification()
      }
    }
  }

  const simulateVerification = () => {
    setIsVerifying(true)
    setVerificationProgress(0)
    
    const interval = setInterval(() => {
      setVerificationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsVerifying(false)
            setCurrentStep('success')
          }, 500)
          return 100
        }
        return prev + 2
      })
    }, 100)
  }

  const handleFingerprintVerification = () => {
    setVerificationMethod('fingerprint')
    setIsVerifying(true)
    simulateVerification()
  }

  const handleVerificationSuccess = () => {
    if (userType === "therapist") {
      router.push("/therapist/onboarding")
    } else {
      router.push("/home")
    }
  }

  // Terms Popup Component
  const TermsPopup = () => {
    if (!showTermsPopup) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">RubHub Terms of Service</h2>
            <button
              onClick={() => setShowTermsPopup(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="p-6 space-y-6 text-gray-700">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">1. Acceptance of Terms</h3>
              <p className="text-sm">
                By accessing and using RubHub, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">2. Description of Service</h3>
              <p className="text-sm">
                RubHub provides a platform connecting massage therapists with clients. Our services include but are not limited to:
              </p>
              <ul className="text-sm list-disc list-inside space-y-1 ml-4">
                <li>Booking management for massage sessions</li>
                <li>Therapist discovery and matching</li>
                <li>Payment processing services</li>
                <li>Communication tools between clients and therapists</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">3. User Responsibilities</h3>
              <p className="text-sm">
                As a user of RubHub, you agree to:
              </p>
              <ul className="text-sm list-disc list-inside space-y-1 ml-4">
                <li>Provide accurate and complete information during registration</li>
                <li>Maintain the security of your account credentials</li>
                <li>Use the service in compliance with all applicable laws</li>
                <li>Respect the privacy and rights of other users</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">4. Data Processing and Privacy</h3>
              <p className="text-sm">
                We collect and process your personal data in accordance with applicable data protection laws including:
              </p>
              <ul className="text-sm list-disc list-inside space-y-1 ml-4">
                <li>Account management and authentication</li>
                <li>Service delivery and booking coordination</li>
                <li>Communication regarding your appointments</li>
                <li>Payment processing and financial transactions</li>
                <li>Service improvement and customer support</li>
              </ul>
              <p className="text-sm mt-2">
                Your data may be shared with verified therapists for appointment purposes and with payment processors for transaction handling.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">5. Payment Terms</h3>
              <p className="text-sm">
                All payments are processed securely through our payment partners. By using our service, you agree to:
              </p>
              <ul className="text-sm list-disc list-inside space-y-1 ml-4">
                <li>Pay all applicable fees for services rendered</li>
                <li>Authorize RubHub to charge your provided payment method</li>
                <li>Accept our cancellation and refund policies</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">6. Limitation of Liability</h3>
              <p className="text-sm">
                RubHub acts as an intermediary platform and is not responsible for the quality of services provided by individual therapists. Users are encouraged to review therapist profiles and ratings before booking.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">7. Termination</h3>
              <p className="text-sm">
                We reserve the right to terminate or suspend accounts that violate our terms of service or engage in fraudulent activities.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">8. Changes to Terms</h3>
              <p className="text-sm">
                RubHub may modify these terms at any time. Continued use of the service after changes constitutes acceptance of the modified terms.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Contact Information:</strong><br />
                For questions about these terms, please contact us at:<br />
                legal@rubhub.co.za or +27 11 123 4567
              </p>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex justify-end">
            <Button
              onClick={() => setShowTermsPopup(false)}
              className="bg-[#71CBD1] hover:bg-[#5bb5c1] text-black font-semibold"
            >
              I Understand
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Selfie Verification Component
  const SelfieVerification = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentStep('form')} 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <div className="flex-1 text-center">
              <span className="text-sm text-gray-600">Identity Verification</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="space-y-3">
                <div className="w-16 h-16 bg-[#71CBD1] rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800">Verify Your Identity</h1>
                <p className="text-gray-600">
                  We need to verify that you match the name and ID provided for security purposes
                </p>
              </div>

              {/* Verification Options */}
              {!isVerifying && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  <Card className="border-2 border-dashed border-blue-200 hover:border-blue-300 transition-colors cursor-pointer bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6" onClick={startSelfieVerification}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Camera className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-800">Take a Selfie</h3>
                          <p className="text-sm text-gray-600">Quick facial recognition verification</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {hasFingerprintSupport && (
                    <Card className="border-2 border-dashed border-green-200 hover:border-green-300 transition-colors cursor-pointer bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-6" onClick={handleFingerprintVerification}>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <Fingerprint className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-semibold text-gray-800">Fingerprint Scan</h3>
                            <p className="text-sm text-gray-600">Use your device's fingerprint sensor</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}

              {/* Camera View */}
              {isVerifying && verificationMethod === 'selfie' && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-80 object-cover"
                    />
                    <div className="absolute inset-0 border-4 border-white/20 rounded-2xl pointer-events-none"></div>
                    <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      Live Camera
                    </div>
                  </div>

                  <Button
                    onClick={captureSelfie}
                    className="w-full bg-[#71CBD1] hover:bg-[#5bb5c1] text-white font-semibold py-3 rounded-xl shadow-lg"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Capture Selfie
                  </Button>

                  <canvas ref={canvasRef} className="hidden" />
                </motion.div>
              )}

              {/* Verification Progress */}
              {isVerifying && verificationProgress > 0 && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-3">
                        <Loader2 className="w-6 h-6 text-[#71CBD1] animate-spin" />
                        <span className="font-semibold text-gray-800">Verifying Identity</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Checking facial match...</span>
                          <span>{verificationProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            className="bg-gradient-to-r from-[#71CBD1] to-green-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${verificationProgress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 space-y-1">
                        <p>✓ Comparing with provided name: {name}</p>
                        <p>✓ Running security checks</p>
                        <p>✓ Verifying identity documents</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Security Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold">Your security is our priority</p>
                    <p className="mt-1">We use advanced encryption and never store your biometric data. This verification helps prevent fraud and keeps our community safe.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  // Success Component
  const SuccessScreen = () => {
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
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Identity verified against provided information</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Security checks completed</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>Account activated successfully</span>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={handleVerificationSuccess}
              className="w-full bg-[#71CBD1] hover:bg-[#5bb5c1] text-white font-semibold py-4 rounded-2xl shadow-lg text-lg"
            >
              Continue to {userType === 'therapist' ? 'Therapist Dashboard' : 'Home'}
            </Button>
          </motion.div>
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
      <div className="min-h-screen bg-[#F9FCFF]">
        <TermsPopup />
        
        {/* Header with SA Flag */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.back()} 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-2">
              <img 
                className="w-6 h-6 object-contain rounded"
                src="/sa_logo.jpg"
                alt="South Africa" 
              />
              <span className="text-sm text-gray-600">South Africa</span>
            </div>
          </div>
        </div>

        <div className="text-center p-6 max-w-md mx-auto">
          <span>Join RubHub</span>
          {/* Logo and Title - Centered */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                className="w-48 h-48 object-contain"
                src="/rubbgo2.png"
                alt="RubHub Logo" 
              />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-green-700">
                RubHub<sup className="text-sm font-normal ml-0.5">™</sup>
              </h1>
              <p className="text-gray-600">version 1.0.0 BETA</p>
            </div>
            <p className="text-gray-500 mt-4">Choose your account type to get started</p>
          </div>

          {/* Account Type Selection */}
          <div className="space-y-4 mb-8">
          {/* Client Card */}
        <Card 
          className="bg-[#059669] text-white border-2 border-gray-200 cursor-pointer hover:border-[#71CBD1] transition-all duration-200 shadow-sm hover:shadow-md"
          onClick={() => setUserType("client")}
        >
          <CardContent className="p-6">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg tracking-tight text-white">Register as Client</h3>
                  <p className="text-white/90 text-sm leading-relaxed font-normal">
                    Find and book licensed massage therapists near you
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/80">
                  <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                  Instant access to certified professionals
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

          {/* Therapist Card */}
          <Card 
            className="bg-[#71CBD1] border-2 border-gray-200 cursor-pointer hover:border-green-500 transition-all duration-200 shadow-sm hover:shadow-md"
            onClick={() => setUserType("therapist")}
          >
            <CardContent className="p-6">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg tracking-tight text-white">Apply as Therapist</h3>
                    <p className="text-white/90 text-sm leading-relaxed font-normal">
                      Join our network and start accepting clients
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/80">
                    <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                    Additional verification required
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>

          {/* Terms and Conditions */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="pre-selection-terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 rounded border-gray-300 text-[#71CBD1] focus:ring-[#71CBD1] focus:ring-2"
              />
              <label htmlFor="pre-selection-terms" className="text-sm text-gray-700 leading-relaxed">
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
                . I understand that my personal data will be processed in accordance with 
                applicable data protection laws.
              </label>
            </div>
          </div>

          {/* Therapist Onboarding Preview */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold mb-3 text-gray-900">Therapist Application Process</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                  1
                </div>
                <span>ID & Selfie Verification</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                  2
                </div>
                <span>Banking Details Setup</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                  3
                </div>
                <span>Video Assessments</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                  4
                </div>
                <span>Background Check</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <TermsPopup />
      
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setUserType(null)} 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div className="flex-1 text-center">
            <span className="text-sm text-gray-600">Signing up as </span>
            <span className="text-[#71CBD1] font-semibold">
              {userType === "therapist" ? "Therapist" : "Client"}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-md mx-auto">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              className="w-24 h-24 object-contain"
              src="/rubbgo2.png"
              alt="RubHub" 
            />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">
            {userType === "therapist" ? "Apply as Therapist" : "Create Client Account"}
          </h1>
          <p className="text-gray-600">
            {userType === "therapist" 
              ? "Complete your application to join our network" 
              : "Sign up to book massage therapists near you"
            }
          </p>
        </div>

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-900 text-sm font-medium">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 h-12 rounded-lg focus:border-[#71CBD1] focus:ring-[#71CBD1]"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-900 text-sm font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 h-12 rounded-lg focus:border-[#71CBD1] focus:ring-[#71CBD1]"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-900 text-sm font-medium">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+27 12 345 6789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={isLoading}
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 h-12 rounded-lg focus:border-[#71CBD1] focus:ring-[#71CBD1]"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-900 text-sm font-medium">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 h-12 rounded-lg focus:border-[#71CBD1] focus:ring-[#71CBD1] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-900 text-sm font-medium">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 h-12 rounded-lg focus:border-[#71CBD1] focus:ring-[#71CBD1] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Terms and Conditions Checkbox */}
          <div className="space-y-2">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 rounded border-gray-300 bg-white text-[#71CBD1] focus:ring-[#71CBD1] focus:ring-2"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
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
                . I understand that my personal data will be processed in accordance with 
                applicable data protection laws.
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Sign Up Button */}
          <Button 
            type="submit" 
            className="w-full bg-[#71CBD1] hover:bg-[#5bb5c1] text-white font-semibold h-12 rounded-lg text-base transition-colors duration-200 shadow-sm" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {userType === "therapist" ? "Starting application..." : "Creating account..."}
              </>
            ) : (
              userType === "therapist" ? "Start Application" : "Create Account"
            )}
          </Button>

          {/* Sign In Link */}
          <div className="text-center text-sm pt-4">
            <span className="text-gray-600">Already have an account? </span>
            <Link href="/signin" className="text-[#71CBD1] hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </form>

        {/* Additional Information for Therapists */}
        {userType === "therapist" && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-2">Application Requirements:</p>
                <ul className="space-y-1">
                  <li>• Valid ID document (South African ID or Passport)</li>
                  <li>• Recent selfie for identity verification</li>
                  <li>• Banking details for payments</li>
                  <li>• Professional certifications (if applicable)</li>
                  <li>• Background check authorization</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
"use client"

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Upload, CheckCircle, ArrowLeft, User, CreditCard, Video, FileText, Clock } from 'lucide-react'

interface OnboardingData {
  personalInfo: {
    firstName: string
    lastName: string
    idNumber: string
    dateOfBirth: string
    gender: string
    phone: string
    address: string
  }
  bankingDetails: {
    bankName: string
    accountNumber: string
    accountType: string
    branchCode: string
    accountHolderName: string
  }
  documents: {
    idFront: File | null
    idBack: File | null
    selfie: File | null
    certifications: File[]
  }
}

export default function TherapistOnboarding() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLVideoElement>(null)

  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    personalInfo: {
      firstName: '',
      lastName: '',
      idNumber: '',
      dateOfBirth: '',
      gender: '',
      phone: '',
      address: ''
    },
    bankingDetails: {
      bankName: '',
      accountNumber: '',
      accountType: 'savings',
      branchCode: '',
      accountHolderName: ''
    },
    documents: {
      idFront: null,
      idBack: null,
      selfie: null,
      certifications: []
    }
  })

  const steps = [
    { number: 1, title: 'ID Verification', icon: User },
    { number: 2, title: 'Banking Details', icon: CreditCard },
    { number: 3, title: 'Documents', icon: FileText },
    { number: 4, title: 'Video Intro', icon: Video }
  ]

  const handleInputChange = (section: keyof OnboardingData, field: string, value: string) => {
    setOnboardingData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleFileUpload = (documentType: keyof OnboardingData['documents'], file: File) => {
    setOnboardingData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [documentType]: file
      }
    }))
  }

  const handleTakePhoto = async (documentType: keyof OnboardingData['documents']) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (cameraRef.current) {
        cameraRef.current.srcObject = stream
      }
      // In a real app, you'd capture the photo from the video stream
    } catch (error) {
      console.error('Error accessing camera:', error)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    // Submit onboarding data to your API
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 2000))
      router.push('/therapist/dashboard')
    } catch (error) {
      console.error('Submission failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // DEMO MODE: Allow navigation even without required data
  const isStepComplete = (step: number) => {
    switch (step) {
      case 1:
        // Only require basic info for demo, not documents
        return (
          onboardingData.personalInfo.firstName &&
          onboardingData.personalInfo.lastName
        )
      case 2:
        // Only require basic banking info for demo
        return (
          onboardingData.bankingDetails.bankName &&
          onboardingData.bankingDetails.accountNumber
        )
      case 3:
        // Allow empty certifications for demo
        return true
      case 4:
        return true // Video intro is optional for initial submission
      default:
        return false
    }
  }

  // DEMO MODE: Auto-fill some data for easier testing
  const handleDemoFill = () => {
    setOnboardingData({
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe',
        idNumber: '8501235255089',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        phone: '+27 12 345 6789',
        address: '123 Main St, Johannesburg'
      },
      bankingDetails: {
        bankName: 'standard',
        accountNumber: '0123456789',
        accountType: 'savings',
        branchCode: '051001',
        accountHolderName: 'John Doe'
      },
      documents: {
        idFront: null,
        idBack: null,
        selfie: null,
        certifications: []
      }
    })
  }

  return (
    <div className="min-h-screen bg-[#1a2a3a] text-white">
      {/* Header */}
      <div className="bg-[#2d3e50] border-b border-[#3a506b] p-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-[#3a506b] text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-white">Therapist Application</h1>
            <p className="text-sm text-gray-300">Complete your profile to start accepting clients</p>
          </div>
          {/* Demo Fill Button */}
          <button
            onClick={handleDemoFill}
            className="px-3 py-1 text-xs bg-[#71CBD1] text-[#1a2a3a] rounded-lg hover:bg-[#5bb5c1] font-medium transition-colors"
          >
            Demo Fill
          </button>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-[#2d3e50] p-4 border-b border-[#3a506b]">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isCompleted = isStepComplete(step.number)
            const isCurrent = currentStep === step.number
            
            return (
              <div key={step.number} className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-green-500 text-white' :
                  isCurrent ? 'bg-[#71CBD1] text-[#1a2a3a]' :
                  'bg-[#3a506b] text-gray-400'
                }`}>
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs mt-2 text-center ${
                  isCurrent ? 'text-[#71CBD1] font-medium' : 'text-gray-400'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 w-full mt-2 ${
                    isCompleted ? 'bg-green-500' : 'bg-[#3a506b]'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="p-4">
        {/* Step 1: ID Verification */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2 text-white">Identity Verification</h2>
              <p className="text-gray-300">We need to verify your identity to ensure client safety</p>
              <p className="text-sm text-[#71CBD1] mt-1">DEMO: Only first and last name required</p>
            </div>

            {/* Personal Information Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={onboardingData.personalInfo.firstName}
                    onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                    className="w-full bg-[#2d3e50] border border-[#3a506b] text-white rounded-lg px-3 py-2 focus:border-[#71CBD1] focus:ring-1 focus:ring-[#71CBD1] placeholder:text-gray-500"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={onboardingData.personalInfo.lastName}
                    onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                    className="w-full bg-[#2d3e50] border border-[#3a506b] text-white rounded-lg px-3 py-2 focus:border-[#71CBD1] focus:ring-1 focus:ring-[#71CBD1] placeholder:text-gray-500"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">ID Number (Optional for demo)</label>
                <input
                  type="text"
                  value={onboardingData.personalInfo.idNumber}
                  onChange={(e) => handleInputChange('personalInfo', 'idNumber', e.target.value)}
                  className="w-full bg-[#2d3e50] border border-[#3a506b] text-white rounded-lg px-3 py-2 focus:border-[#71CBD1] focus:ring-1 focus:ring-[#71CBD1] placeholder:text-gray-500"
                  placeholder="8501235255089"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number (Optional for demo)</label>
                <input
                  type="tel"
                  value={onboardingData.personalInfo.phone}
                  onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                  className="w-full bg-[#2d3e50] border border-[#3a506b] text-white rounded-lg px-3 py-2 focus:border-[#71CBD1] focus:ring-1 focus:ring-[#71CBD1] placeholder:text-gray-500"
                  placeholder="+27 12 345 6789"
                />
              </div>
            </div>

            {/* Document Upload Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-white">Upload Documents (Optional for demo)</h3>
              
              {/* ID Front */}
              <div className="border-2 border-dashed border-[#3a506b] rounded-lg p-4 text-center hover:border-[#71CBD1] transition-colors cursor-pointer">
                {onboardingData.documents.idFront ? (
                  <div className="text-green-400">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">ID Front Uploaded</p>
                  </div>
                ) : (
                  <button
                    onClick={() => handleTakePhoto('idFront')}
                    className="w-full"
                  >
                    <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2 hover:text-[#71CBD1] transition-colors" />
                    <p className="text-sm text-gray-400">Take photo of ID Front</p>
                  </button>
                )}
              </div>

              {/* ID Back */}
              <div className="border-2 border-dashed border-[#3a506b] rounded-lg p-4 text-center hover:border-[#71CBD1] transition-colors cursor-pointer">
                {onboardingData.documents.idBack ? (
                  <div className="text-green-400">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">ID Back Uploaded</p>
                  </div>
                ) : (
                  <button
                    onClick={() => handleTakePhoto('idBack')}
                    className="w-full"
                  >
                    <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2 hover:text-[#71CBD1] transition-colors" />
                    <p className="text-sm text-gray-400">Take photo of ID Back</p>
                  </button>
                )}
              </div>

              {/* Selfie */}
              <div className="border-2 border-dashed border-[#3a506b] rounded-lg p-4 text-center hover:border-[#71CBD1] transition-colors cursor-pointer">
                {onboardingData.documents.selfie ? (
                  <div className="text-green-400">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Selfie Verified</p>
                  </div>
                ) : (
                  <button
                    onClick={() => handleTakePhoto('selfie')}
                    className="w-full"
                  >
                    <User className="w-8 h-8 text-gray-400 mx-auto mb-2 hover:text-[#71CBD1] transition-colors" />
                    <p className="text-sm text-gray-400">Take a selfie</p>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Banking Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2 text-white">Banking Details</h2>
              <p className="text-gray-300">Where we'll send your payments</p>
              <p className="text-sm text-[#71CBD1] mt-1">DEMO: Only bank name and account number required</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Bank Name *</label>
                <select
                  value={onboardingData.bankingDetails.bankName}
                  onChange={(e) => handleInputChange('bankingDetails', 'bankName', e.target.value)}
                  className="w-full bg-[#2d3e50] border border-[#3a506b] text-white rounded-lg px-3 py-2 focus:border-[#71CBD1] focus:ring-1 focus:ring-[#71CBD1]"
                >
                  <option value="" className="bg-[#2d3e50]">Select Bank</option>
                  <option value="standard" className="bg-[#2d3e50]">Standard Bank</option>
                  <option value="absa" className="bg-[#2d3e50]">ABSA</option>
                  <option value="fnb" className="bg-[#2d3e50]">First National Bank</option>
                  <option value="nedbank" className="bg-[#2d3e50]">Nedbank</option>
                  <option value="capitec" className="bg-[#2d3e50]">Capitec</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Account Number *</label>
                <input
                  type="text"
                  value={onboardingData.bankingDetails.accountNumber}
                  onChange={(e) => handleInputChange('bankingDetails', 'accountNumber', e.target.value)}
                  className="w-full bg-[#2d3e50] border border-[#3a506b] text-white rounded-lg px-3 py-2 focus:border-[#71CBD1] focus:ring-1 focus:ring-[#71CBD1] placeholder:text-gray-500"
                  placeholder="0123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Branch Code (Optional for demo)</label>
                <input
                  type="text"
                  value={onboardingData.bankingDetails.branchCode}
                  onChange={(e) => handleInputChange('bankingDetails', 'branchCode', e.target.value)}
                  className="w-full bg-[#2d3e50] border border-[#3a506b] text-white rounded-lg px-3 py-2 focus:border-[#71CBD1] focus:ring-1 focus:ring-[#71CBD1] placeholder:text-gray-500"
                  placeholder="051001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Account Holder Name (Optional for demo)</label>
                <input
                  type="text"
                  value={onboardingData.bankingDetails.accountHolderName}
                  onChange={(e) => handleInputChange('bankingDetails', 'accountHolderName', e.target.value)}
                  className="w-full bg-[#2d3e50] border border-[#3a506b] text-white rounded-lg px-3 py-2 focus:border-[#71CBD1] focus:ring-1 focus:ring-[#71CBD1] placeholder:text-gray-500"
                  placeholder="As it appears on bank statement"
                />
              </div>
            </div>

            <div className="bg-[#2d3e50] border border-[#71CBD1] rounded-lg p-4">
              <p className="text-sm text-[#71CBD1]">
                Your banking information is encrypted and secure. Payments are processed weekly.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Certifications */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2 text-white">Certifications & Qualifications</h2>
              <p className="text-gray-300">Upload your massage therapy certifications</p>
              <p className="text-sm text-[#71CBD1] mt-1">DEMO: Certifications are optional</p>
            </div>

            <div className="space-y-4">
              {/* Certification Upload */}
              <div className="border-2 border-dashed border-[#3a506b] rounded-lg p-6 text-center hover:border-[#71CBD1] transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400 mb-2">Upload certification documents (Optional)</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    setOnboardingData(prev => ({
                      ...prev,
                      documents: {
                        ...prev.documents,
                        certifications: [...prev.documents.certifications, ...files]
                      }
                    }))
                  }}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#71CBD1] text-[#1a2a3a] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#5bb5c1] transition-colors"
                >
                  Choose Files
                </button>
              </div>

              {/* Uploaded Files List */}
              {onboardingData.documents.certifications.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-white">Uploaded Files:</h4>
                  {onboardingData.documents.certifications.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-[#2d3e50] p-3 rounded-lg">
                      <span className="text-sm text-gray-300 truncate flex-1">{file.name}</span>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Video Introduction */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2 text-white">Video Introduction</h2>
              <p className="text-gray-300">Record a short video introducing yourself</p>
              <p className="text-sm text-[#71CBD1] mt-1">DEMO: Video is optional</p>
            </div>

            <div className="border-2 border-dashed border-[#3a506b] rounded-lg p-8 text-center hover:border-[#71CBD1] transition-colors">
              <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">Record a 1-2 minute video introduction (Optional)</p>
              <button className="bg-[#71CBD1] text-[#1a2a3a] px-6 py-3 rounded-lg font-medium hover:bg-[#5bb5c1] transition-colors">
                Start Recording
              </button>
              <p className="text-xs text-gray-500 mt-3">
                Tell us about your experience and approach to massage therapy
              </p>
            </div>

            <div className="bg-[#2d3e50] border border-[#71CBD1] rounded-lg p-4">
              <p className="text-sm text-[#71CBD1]">
                This step is optional but highly recommended. Clients love getting to know their therapists!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="p-4 border-t border-[#3a506b] bg-[#2d3e50] fixed bottom-0 left-0 right-0">
        <div className="flex gap-3">
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="flex-1 border border-[#3a506b] text-gray-300 py-3 rounded-lg font-medium hover:bg-[#3a506b] transition-colors"
            >
              Back
            </button>
          )}
          
          {currentStep < steps.length ? (
            <button
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!isStepComplete(currentStep)}
              className="flex-1 bg-[#71CBD1] text-[#1a2a3a] py-3 rounded-lg font-medium hover:bg-[#5bb5c1] disabled:bg-[#3a506b] disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 disabled:bg-[#3a506b] disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 animate-spin" />
                  Submitting...
                </div>
              ) : (
                'Submit Application'
              )}
            </button>
          )}
        </div>
      </div>

      {/* Camera Preview (hidden by default) */}
      <video ref={cameraRef} autoPlay playsInline className="hidden" />
    </div>
  )
}
// components/selfie-verification.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, X, Upload, RotateCw, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

interface SelfieVerificationProps {
  userId?: string
  bookingId?: string
  onVerificationComplete?: (data: any) => void
  onCancel?: () => void
}

export default function SelfieVerification({ 
  userId, 
  bookingId, 
  onVerificationComplete, 
  onCancel 
}: SelfieVerificationProps) {
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verificationResult, setVerificationResult] = useState<any>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const photoRef = useRef<HTMLImageElement>(null)

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  const startCamera = async () => {
    try {
      setError(null)
      setIsCameraOpen(true)
      
      const constraints = {
        video: {
          facingMode: 'user', // Front camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      setError('Unable to access camera. Please ensure camera permissions are granted.')
      setIsCameraOpen(false)
      toast.error('Camera access denied')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsCameraOpen(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to base64 image
    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    setCapturedImage(imageData)
    
    // Stop camera after capture
    stopCamera()
    
    toast.success('Photo captured successfully')
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    startCamera()
  }

  const uploadSelfie = async () => {
    if (!capturedImage) return

    try {
      setIsUploading(true)
      setError(null)

      // Convert base64 to blob for API upload
      const base64Data = capturedImage.split(',')[1]
      const byteCharacters = atob(base64Data)
      const byteNumbers = new Array(byteCharacters.length)
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'image/jpeg' })

      // Create FormData
      const formData = new FormData()
      formData.append('selfie', blob, 'selfie.jpg')
      
      if (userId) formData.append('userId', userId)
      if (bookingId) formData.append('bookingId', bookingId)
      formData.append('timestamp', new Date().toISOString())

      // API call to upload selfie
      const response = await fetch('/api/verification/selfie', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      
      // Start verification process
      await verifySelfie(result.id)
      
    } catch (err) {
      console.error('Upload error:', err)
      setError('Failed to upload selfie. Please try again.')
      toast.error('Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const verifySelfie = async (selfieId: string) => {
    try {
      setIsVerifying(true)
      
      // Call verification API
      const response = await fetch('/api/verification/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selfieId,
          userId,
          bookingId,
        }),
      })

      if (!response.ok) {
        throw new Error('Verification failed')
      }

      const result = await response.json()
      setVerificationResult(result)
      
      if (result.success) {
        toast.success('Verification successful!')
        if (onVerificationComplete) {
          onVerificationComplete(result)
        }
      } else {
        toast.error('Verification failed. Please try again.')
      }
      
    } catch (err) {
      console.error('Verification error:', err)
      setError('Verification failed. Please try again.')
      toast.error('Verification failed')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <Card className="max-w-4xl mx-auto border-2 border-gray-200 shadow-xl">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Camera className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Selfie Verification
                </h1>
                <p className="text-gray-600 text-sm">
                  Take a clear selfie for identity verification
                </p>
              </div>
            </div>
            {onCancel && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onCancel}
                className="h-10 w-10 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        <CardContent className="p-4 md:p-6">
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-800">Error</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Verification Result */}
          {verificationResult && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-green-800">Verification Complete</p>
                <p className="text-sm text-green-600 mt-1">
                  {verificationResult.message || 'Your identity has been verified successfully.'}
                </p>
                {verificationResult.score && (
                  <p className="text-xs text-green-700 mt-2">
                    Confidence score: {(verificationResult.score * 100).toFixed(1)}%
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Camera/Preview Section */}
            <div className="space-y-4">
              <div className="bg-gray-900 rounded-2xl overflow-hidden aspect-video relative">
                {/* Camera View */}
                {isCameraOpen && !capturedImage && (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 border-4 border-white/20 pointer-events-none" />
                    <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      Live Camera
                    </div>
                  </>
                )}

                {/* Captured Image Preview */}
                {capturedImage && (
                  <div className="relative h-full">
                    <img
                      ref={photoRef}
                      src={capturedImage}
                      alt="Captured selfie"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      Preview
                    </div>
                  </div>
                )}

                {/* Start Camera Prompt */}
                {!isCameraOpen && !capturedImage && (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <Camera className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Start Camera
                    </h3>
                    <p className="text-gray-300 mb-6">
                      Click the button below to open your camera and take a selfie
                    </p>
                    <Button
                      onClick={startCamera}
                      className="bg-white text-gray-900 hover:bg-gray-100 font-semibold"
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      Open Camera
                    </Button>
                  </div>
                )}

                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Camera Controls */}
              <div className="flex flex-wrap gap-3">
                {isCameraOpen && !capturedImage && (
                  <>
                    <Button
                      onClick={capturePhoto}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Camera className="h-5 w-5 mr-2" />
                      Capture Photo
                    </Button>
                    <Button
                      onClick={stopCamera}
                      variant="outline"
                      className="flex-1"
                    >
                      <X className="h-5 w-5 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}

                {capturedImage && (
                  <>
                    <Button
                      onClick={retakePhoto}
                      variant="outline"
                      className="flex-1"
                    >
                      <RotateCw className="h-5 w-5 mr-2" />
                      Retake Photo
                    </Button>
                    <Button
                      onClick={uploadSelfie}
                      disabled={isUploading || isVerifying}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 mr-2" />
                          Upload & Verify
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Instructions & Verification Status */}
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Verification Requirements
                </h3>
                <ul className="space-y-3 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                    <span>Ensure your face is clearly visible and well-lit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                    <span>Remove sunglasses, hats, or face coverings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                    <span>Look directly at the camera with a neutral expression</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                    <span>Use the front (selfie) camera for best results</span>
                  </li>
                </ul>
              </div>

              {/* Verification Process Info */}
              {isVerifying && (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                    <h3 className="font-semibold text-gray-900">Verifying Identity</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Processing image...</span>
                      <span className="font-medium text-gray-900">25%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full animate-pulse"
                        style={{ width: '25%' }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>✓ Image uploaded successfully</p>
                      <p>✓ Running face detection...</p>
                      <p>⏳ Comparing with stored profiles...</p>
                      <p>⏳ Final verification checks...</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Security & Privacy Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Security & Privacy</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                    <p>Your selfie is encrypted and stored securely</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                    <p>Images are automatically deleted after verification</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                    <p>We never share your biometric data with third parties</p>
                  </div>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                  <div className="text-sm text-gray-500 mb-1">Status</div>
                  <div className={`font-semibold ${verificationResult?.success ? 'text-green-600' : 'text-blue-600'}`}>
                    {verificationResult?.success ? 'Verified' : 'Pending'}
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                  <div className="text-sm text-gray-500 mb-1">Time</div>
                  <div className="font-semibold text-gray-900">~30s</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
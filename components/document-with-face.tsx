// components/document-upload-with-face.tsx
"use client"

import { useState, useRef } from "react"
import { Upload, Camera, User, FileText, Loader2, CheckCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import * as faceapi from 'face-api.js'

interface DocumentUploadWithFaceProps {
  userId: string
  userPhone: string
  documentType: 'license' | 'id_card' | 'passport'
  onVerificationComplete: (result: VerificationResult) => void
}

interface VerificationResult {
  success: boolean
  verificationId?: string
  faceMatch?: boolean
  confidence?: number
  message: string
}

interface DocumentData {
  file: File
  documentType: string
  faceData: {
    descriptor: number[]
    extractedImage: string
  } | null
}

export default function DocumentUploadWithFace({ 
  userId, 
  userPhone, 
  documentType,
  onVerificationComplete 
}: DocumentUploadWithFaceProps) {
  const [uploadedDocument, setUploadedDocument] = useState<DocumentData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'processing' | 'verified' | 'failed'>('idle')
  const [faceMatchResult, setFaceMatchResult] = useState<{match: boolean, confidence: number} | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)

  // Load face-api models
  const loadFaceModels = async () => {
    try {
      await faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models')
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models')
      return true
    } catch (error) {
      console.error('Failed to load face models:', error)
      return false
    }
  }

  // Handle document upload
  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or PDF file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setVerificationStatus('processing')
    setIsProcessing(true)

    try {
      // Extract face from document
      const documentData = await extractFaceFromDocument(file)
      
      if (!documentData.faceData) {
        toast.error('No face detected in the document')
        setVerificationStatus('failed')
        setIsProcessing(false)
        return
      }

      setUploadedDocument(documentData)
      
      // Start camera for live selfie
      await startCameraForSelfie(documentData)
      
    } catch (error) {
      console.error('Error processing document:', error)
      toast.error('Failed to process document')
      setVerificationStatus('failed')
      setIsProcessing(false)
    }
  }

  // Extract face from uploaded document
  const extractFaceFromDocument = async (file: File): Promise<DocumentData> => {
    const modelsLoaded = await loadFaceModels()
    if (!modelsLoaded) {
      throw new Error('Face detection models not loaded')
    }

    // Create image from file
    const imageUrl = URL.createObjectURL(file)
    const img = await faceapi.fetchImage(imageUrl)

    // Detect face in document
    const detection = await faceapi
      .detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor()

    if (!detection) {
      return {
        file,
        documentType,
        faceData: null
      }
    }

    // Extract face region for storage
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas context not available')

    const { x, y, width, height } = detection.detection.box
    canvas.width = width
    canvas.height = height
    ctx.drawImage(img, x, y, width, height, 0, 0, width, height)

    const extractedImage = canvas.toDataURL('image/jpeg')

    return {
      file,
      documentType,
      faceData: {
        descriptor: Array.from(detection.descriptor),
        extractedImage
      }
    }
  }

  // Start camera for live selfie
  const startCameraForSelfie = async (documentData: DocumentData) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      })
      setCameraStream(stream)

      // Set up video preview
      const video = document.createElement('video')
      video.srcObject = stream
      video.autoplay = true
      video.onloadedmetadata = () => {
        video.play()
      }

      toast.info('Please position your face in the frame for verification')
      
    } catch (error) {
      console.error('Camera access error:', error)
      toast.error('Camera access required for verification')
      setVerificationStatus('failed')
      setIsProcessing(false)
    }
  }

  // Capture selfie and compare with document
  const captureAndCompareSelfie = async () => {
    if (!cameraStream || !uploadedDocument?.faceData) return

    setIsProcessing(true)

    try {
      // Capture image from camera
      const video = document.createElement('video')
      video.srcObject = cameraStream
      
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas context not available')

      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait for camera to stabilize
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0)

      const selfieImage = canvas.toDataURL('image/jpeg')
      const img = await faceapi.fetchImage(selfieImage)

      // Detect face in selfie
      const selfieDetection = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor()

      if (!selfieDetection) {
        throw new Error('No face detected in selfie')
      }

      // Compare with document face
      const documentDescriptor = new Float32Array(uploadedDocument.faceData.descriptor)
      const distance = faceapi.euclideanDistance(
        documentDescriptor,
        selfieDetection.descriptor
      )

      const confidence = Math.max(0, 100 - (distance * 100))
      const isMatch = distance < 0.6 // Threshold for face match

      setFaceMatchResult({
        match: isMatch,
        confidence
      })

      if (isMatch) {
        // Send to backend for storage
        await storeVerificationData(selfieImage, confidence)
      } else {
        setVerificationStatus('failed')
        toast.error('Face verification failed. Please try again.')
      }

    } catch (error) {
      console.error('Error in face comparison:', error)
      toast.error('Verification failed')
      setVerificationStatus('failed')
    } finally {
      setIsProcessing(false)
      stopCamera()
    }
  }

  // Store verification data in backend
  const storeVerificationData = async (selfieImage: string, confidence: number) => {
    try {
      const formData = new FormData()
      
      // Add document file
      if (uploadedDocument?.file) {
        formData.append('document', uploadedDocument.file)
      }
      
      // Add verification data
      const verificationData = {
        userId,
        userPhone,
        documentType,
        faceDescriptor: uploadedDocument?.faceData?.descriptor,
        confidence,
        extractedFace: uploadedDocument?.faceData?.extractedImage,
        selfieImage
      }
      
      formData.append('verificationData', JSON.stringify(verificationData))

      const response = await fetch('/api/verification/store-selfie', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to store verification data')
      }

      const result = await response.json()
      
      setVerificationStatus('verified')
      onVerificationComplete({
        success: true,
        verificationId: result.verificationId,
        faceMatch: true,
        confidence,
        message: 'Verification successful'
      })

      toast.success('Verification completed successfully!')

    } catch (error) {
      console.error('Error storing verification:', error)
      toast.error('Failed to complete verification')
      setVerificationStatus('failed')
    }
  }

  // Stop camera stream
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
  }

  // Get document type display name
  const getDocumentTypeName = () => {
    switch (documentType) {
      case 'license': return 'Driver License'
      case 'id_card': return 'South African ID'
      case 'passport': return 'Passport'
      default: return 'Document'
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
        {!uploadedDocument ? (
          <>
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Upload {getDocumentTypeName()}</p>
            <p className="text-sm text-gray-600 mb-4">
              Upload a clear photo of your {getDocumentTypeName()}. 
              Ensure your face is clearly visible.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleDocumentUpload}
              accept=".jpg,.jpeg,.png,.pdf"
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Choose File
            </Button>
            <p className="text-xs text-gray-500 mt-2">JPG, PNG, or PDF • Max 5MB</p>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="w-6 h-6" />
              <p className="font-medium">{getDocumentTypeName()} Uploaded</p>
            </div>
            <div className="text-sm text-gray-600">
              <p>File: {uploadedDocument.file.name}</p>
              <p>Size: {(uploadedDocument.file.size / 1024 / 1024).toFixed(2)} MB</p>
              {uploadedDocument.faceData ? (
                <p className="text-green-600 mt-2">✓ Face detected in document</p>
              ) : (
                <p className="text-yellow-600 mt-2">No face detected</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Camera Section for Selfie */}
      {cameraStream && uploadedDocument?.faceData && (
        <div className="space-y-4">
          <div className="text-center">
            <Camera className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="font-medium">Face Verification Required</p>
            <p className="text-sm text-gray-600">
              Take a selfie to verify it matches the document
            </p>
          </div>

          <div className="relative">
            <video
              autoPlay
              playsInline
              className="w-full h-64 object-cover rounded-lg"
              ref={(el) => {
                if (el && cameraStream) {
                  el.srcObject = cameraStream
                }
              }}
            />
            {faceMatchResult && (
              <div className={`absolute top-4 right-4 p-2 rounded-lg ${
                faceMatchResult.match ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {faceMatchResult.match ? '✓ Match' : '✗ No Match'}
                <div className="text-xs">Confidence: {faceMatchResult.confidence.toFixed(1)}%</div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={captureAndCompareSelfie}
              disabled={isProcessing}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Verify Face
                </>
              )}
            </Button>
            <Button
              onClick={stopCamera}
              variant="outline"
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Status Indicators */}
      {verificationStatus === 'verified' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Verification Complete</p>
              <p className="text-sm text-green-600">
                Your identity has been successfully verified and stored securely.
              </p>
            </div>
          </div>
        </div>
      )}

      {verificationStatus === 'failed' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3">
            <X className="w-6 h-6 text-red-600" />
            <div>
              <p className="font-medium text-red-800">Verification Failed</p>
              <p className="text-sm text-red-600">
                Please try again with better lighting and ensure your face is clearly visible.
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              setUploadedDocument(null)
              setVerificationStatus('idle')
              setFaceMatchResult(null)
            }}
            variant="outline"
            className="mt-3"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  )
}
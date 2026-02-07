"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Mic, MicOff, AlertTriangle, Shield, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

interface VoiceSafewordListenerProps {
  onSafewordDetected: () => void
  isActive?: boolean
  bookingId: string
}

interface VoiceMatchResult {
  isMatch: boolean
  confidence: number
  matchedWord: string
  timestamp: number
}

interface AudioBufferData {
  buffer: Float32Array
  sampleRate: number
  timestamp: number
}

export function VoiceSafewordListener({ 
  onSafewordDetected, 
  isActive = true,
  bookingId 
}: VoiceSafewordListenerProps) {
  const [isListening, setIsListening] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [matchHistory, setMatchHistory] = useState<VoiceMatchResult[]>([])
  const [voiceProfile, setVoiceProfile] = useState<Float32Array | null>(null)
  const [calibrationComplete, setCalibrationComplete] = useState(false)
  const [calibrationStep, setCalibrationStep] = useState(0)
  
  const audioContextRef = useRef<AudioContext | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const processingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioBuffersRef = useRef<AudioBufferData[]>([])
  const lastDetectionTimeRef = useRef<number>(0)
  
  // Safeword configurations
  const SAFEWORDS = ["STOP", "HELP", "RED", "SAFEWORD", "EMERGENCY"]
  const VOICE_MATCH_THRESHOLD = 0.7
  const COOLDOWN_PERIOD = 5000 // 5 seconds between detections

  // ==================== FIXED AUDIO FUNCTIONS ====================
  
  // Convert Float32Array to Audio Blob - FIXED VERSION
  const float32ArrayToAudioBlob = async (buffer: Float32Array, sampleRate: number): Promise<Blob> => {
    try {
      const audioContext = new AudioContext({ sampleRate })
      
      // Create audio buffer and properly copy the data
      const audioBuffer = audioContext.createBuffer(1, buffer.length, sampleRate)
      
      // FIX: Get the channel data and copy buffer values
      const channelData = audioBuffer.getChannelData(0)
      // Use set() for better performance
      channelData.set(buffer)
      
      // Encode to WAV format
      const wavBuffer = encodeWAV(audioBuffer)
      return new Blob([wavBuffer], { type: 'audio/wav' })
      
    } catch (error) {
      console.error('Error converting Float32Array to Audio Blob:', error)
      throw error
    }
  }

  // Helper function to encode buffer as WAV
  const encodeWAV = (audioBuffer: AudioBuffer): ArrayBuffer => {
    const numChannels = audioBuffer.numberOfChannels
    const sampleRate = audioBuffer.sampleRate
    const length = audioBuffer.length
    
    // Create WAV header
    const buffer = new ArrayBuffer(44 + length * numChannels * 2)
    const view = new DataView(buffer)
    
    // Write WAV header
    writeString(view, 0, 'RIFF')
    view.setUint32(4, 36 + length * numChannels * 2, true)
    writeString(view, 8, 'WAVE')
    writeString(view, 12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * numChannels * 2, true)
    view.setUint16(32, numChannels * 2, true)
    view.setUint16(34, 16, true)
    writeString(view, 36, 'data')
    view.setUint32(40, length * numChannels * 2, true)
    
    // Write audio data
    const channelData = audioBuffer.getChannelData(0)
    let offset = 44
    for (let i = 0; i < channelData.length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
      offset += 2
    }
    
    return buffer
  }

  // Helper function to write strings to DataView
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  // Average multiple audio buffers for voice profiling
  const averageAudioBuffers = (buffers: Float32Array[]): Float32Array => {
    if (buffers.length === 0) return new Float32Array()
    
    const length = buffers[0].length
    const result = new Float32Array(length)
    
    for (let i = 0; i < length; i++) {
      let sum = 0
      for (let j = 0; j < buffers.length; j++) {
        sum += buffers[j][i]
      }
      result[i] = sum / buffers.length
    }
    
    return result
  }
  
  // ==================== REST OF THE COMPONENT ====================

  // Initialize audio context and request microphone permission
  const initializeAudio = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("Audio recording not supported")
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false
        } 
      })
      
      mediaStreamRef.current = stream
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      const source = audioContextRef.current.createMediaStreamSource(stream)
      sourceRef.current = source
      
      const analyser = audioContextRef.current.createAnalyser()
      analyser.fftSize = 2048
      analyserRef.current = analyser
      
      source.connect(analyser)
      setPermissionGranted(true)
      
      // Start processing audio
      startAudioProcessing()
      
      // Start voice calibration if no profile exists
      if (!voiceProfile) {
        startVoiceCalibration()
      }
      
    } catch (error) {
      console.error("Error accessing microphone:", error)
      setPermissionGranted(false)
    }
  }, [voiceProfile])

  // Process audio data for voice matching
  const startAudioProcessing = useCallback(() => {
    if (!analyserRef.current || !isActive) return
    
    const analyser = analyserRef.current
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    
    const processAudio = () => {
      if (!isListening || !isActive) return
      
      analyser.getByteTimeDomainData(dataArray)
      
      // Calculate audio level for visualization
      let sum = 0
      for (let i = 0; i < dataArray.length; i++) {
        const amplitude = (dataArray[i] - 128) / 128
        sum += amplitude * amplitude
      }
      const rms = Math.sqrt(sum / dataArray.length)
      setAudioLevel(rms)
      
      // Collect audio buffers for processing
      if (audioContextRef.current) {
        const timeDomainData = new Float32Array(analyser.fftSize)
        analyser.getFloatTimeDomainData(timeDomainData)
        
        audioBuffersRef.current.push({
          buffer: new Float32Array(timeDomainData),
          sampleRate: audioContextRef.current.sampleRate,
          timestamp: Date.now()
        })
        
        // Keep only recent buffers (last 10 seconds)
        const tenSecondsAgo = Date.now() - 10000
        audioBuffersRef.current = audioBuffersRef.current.filter(
          b => b.timestamp > tenSecondsAgo
        )
        
        // Process audio for safeword detection
        if (audioBuffersRef.current.length > 0) {
          processAudioForSafewords()
        }
      }
    }
    
    processingIntervalRef.current = setInterval(processAudio, 100)
  }, [isListening, isActive])

  // Process audio buffers for safeword detection
  const processAudioForSafewords = useCallback(async () => {
    if (!isActive || audioBuffersRef.current.length === 0) return
    
    const now = Date.now()
    if (now - lastDetectionTimeRef.current < COOLDOWN_PERIOD) {
      return // Still in cooldown period
    }
    
    try {
      // Convert audio buffers to text using Web Speech API
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!SpeechRecognition) return
      
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.maxAlternatives = 3
      recognition.lang = 'en-US'
      
      // Create audio blob from buffer using fixed function
      const latestBuffer = audioBuffersRef.current[audioBuffersRef.current.length - 1]
      const audioBlob = await float32ArrayToAudioBlob(latestBuffer.buffer, latestBuffer.sampleRate)
      
      recognition.onresult = (event: any) => {
        const result = event.results[0]
        if (result && result[0]) {
          const transcript = result[0].transcript.toUpperCase()
          const confidence = result[0].confidence
          
          // Check for safewords
          SAFEWORDS.forEach(word => {
            if (transcript.includes(word) && confidence > 0.7) {
              // Additional voice matching if voice profile exists
              if (voiceProfile && calibrationComplete) {
                const voiceMatchScore = calculateVoiceMatch(latestBuffer.buffer, voiceProfile)
                if (voiceMatchScore > VOICE_MATCH_THRESHOLD) {
                  triggerSafewordDetection(word, confidence, voiceMatchScore)
                }
              } else {
                // Without voice profile, just use transcript confidence
                triggerSafewordDetection(word, confidence, 1.0)
              }
            }
          })
        }
      }
      
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
      }
      
      // Start recognition with blob (simplified - browser may not support direct blob input)
      // Note: Most browsers require user interaction for speech recognition
      // This is a simplified implementation
      try {
        recognition.start()
      } catch (error) {
        console.error("Speech recognition start error:", error)
      }
      
    } catch (error) {
      console.error("Error processing audio:", error)
    }
  }, [isActive, voiceProfile, calibrationComplete])

  // Calculate voice match between current audio and stored profile
  const calculateVoiceMatch = (currentBuffer: Float32Array, profileBuffer: Float32Array): number => {
    // Simplified voice matching algorithm
    // In production, use more sophisticated algorithms like MFCC, pitch detection, etc.
    
    if (currentBuffer.length !== profileBuffer.length) {
      return 0
    }
    
    let correlation = 0
    for (let i = 0; i < currentBuffer.length; i++) {
      correlation += currentBuffer[i] * profileBuffer[i]
    }
    
    correlation /= currentBuffer.length
    return Math.max(0, Math.min(1, correlation * 10)) // Normalize to 0-1
  }

  // Trigger safeword detection
  const triggerSafewordDetection = useCallback((word: string, transcriptConfidence: number, voiceMatchScore: number) => {
    const now = Date.now()
    if (now - lastDetectionTimeRef.current < COOLDOWN_PERIOD) return
    
    lastDetectionTimeRef.current = now
    
    const matchResult: VoiceMatchResult = {
      isMatch: voiceMatchScore > VOICE_MATCH_THRESHOLD,
      confidence: (transcriptConfidence + voiceMatchScore) / 2,
      matchedWord: word,
      timestamp: now
    }
    
    setMatchHistory(prev => [...prev.slice(-4), matchResult]) // Keep last 5 matches
    
    if (matchResult.isMatch) {
      console.log(`SAFEWORD DETECTED: ${word} (confidence: ${matchResult.confidence.toFixed(2)})`)
      onSafewordDetected()
      
      // Log detection to server
      logDetectionToServer(matchResult)
    }
  }, [onSafewordDetected])

  // Log detection to server
  const logDetectionToServer = async (result: VoiceMatchResult) => {
    try {
      await fetch('/api/safeword-detections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          ...result,
          audioSample: audioBuffersRef.current.length > 0 
            ? Array.from(audioBuffersRef.current[audioBuffersRef.current.length - 1].buffer.slice(0, 100))
            : []
        })
      })
    } catch (error) {
      console.error("Failed to log detection:", error)
    }
  }

  // Start voice calibration process
  const startVoiceCalibration = useCallback(() => {
    setCalibrationStep(1)
    
    // Ask user to repeat a phrase for voice profiling
    setTimeout(() => {
      setCalibrationStep(2)
      
      // Collect voice samples for calibration
      const calibrationSamples: Float32Array[] = []
      const collectSample = () => {
        if (audioBuffersRef.current.length > 0 && calibrationSamples.length < 5) {
          calibrationSamples.push(audioBuffersRef.current[audioBuffersRef.current.length - 1].buffer)
          setTimeout(collectSample, 1000)
        } else if (calibrationSamples.length === 5) {
          // Average the samples to create voice profile
          const profile = averageAudioBuffers(calibrationSamples)
          setVoiceProfile(profile)
          setCalibrationComplete(true)
          setCalibrationStep(3)
          
          setTimeout(() => setCalibrationStep(0), 2000)
        }
      }
      
      collectSample()
    }, 2000)
  }, [])

  // Toggle listening state
  const toggleListening = () => {
    if (!permissionGranted) {
      initializeAudio()
      return
    }
    
    setIsListening(!isListening)
  }

  // Cleanup audio resources
  const cleanupAudio = useCallback(() => {
    if (processingIntervalRef.current) {
      clearInterval(processingIntervalRef.current)
      processingIntervalRef.current = null
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    
    setIsListening(false)
  }, [])

  // Initialize on mount
  useEffect(() => {
    if (isActive) {
      initializeAudio()
    }
    
    return () => {
      cleanupAudio()
    }
  }, [isActive, initializeAudio, cleanupAudio])

  // Pause/resume listening based on isActive
  useEffect(() => {
    if (!isActive && isListening) {
      setIsListening(false)
    }
  }, [isActive, isListening])

  // Calibration instructions
  const calibrationMessages = [
    "",
    "Voice safety system initializing...",
    "Please say 'Hello, this is my voice' clearly",
    "Voice profile created successfully!"
  ]

  return (
    <div className="space-y-4">
      {/* Voice Status Indicator */}
      <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isListening 
                ? 'bg-red-500/20 border-2 border-red-500/50' 
                : 'bg-gray-500/20 border-2 border-gray-500/30'
            }`}>
              {isListening ? (
                <Mic className="w-6 h-6 text-red-500 animate-pulse" />
              ) : (
                <MicOff className="w-6 h-6 text-gray-500" />
              )}
            </div>
            
            {/* Audio Level Visualization */}
            {isListening && (
              <div className="absolute -inset-2">
                <div className="absolute inset-0 rounded-full border-2 border-red-500/30 animate-ping" />
                <div 
                  className="absolute inset-0 rounded-full bg-red-500/10"
                  style={{ transform: `scale(${1 + audioLevel * 2})` }}
                />
              </div>
            )}
          </div>
          
          <div>
            <p className="font-semibold text-white">
              {isListening ? "Voice Safety Active" : "Voice Safety Paused"}
            </p>
            <p className="text-sm text-white/70">
              {isListening 
                ? "Listening for safewords..." 
                : permissionGranted 
                  ? "Click microphone to activate" 
                  : "Microphone permission required"}
            </p>
          </div>
        </div>
        
        <Button
          onClick={toggleListening}
          variant={isListening ? "destructive" : "outline"}
          size="sm"
          className={`rounded-xl ${
            isListening 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-white/10 hover:bg-white/20 text-white border-white/30'
          }`}
          disabled={!permissionGranted && !isListening}
        >
          {isListening ? "Stop Listening" : "Start Listening"}
        </Button>
      </div>

      {/* Calibration Status */}
      {calibrationStep > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-blue-300">{calibrationMessages[calibrationStep]}</p>
              {calibrationStep === 2 && (
                <div className="mt-2 flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div
                      key={step}
                      className={`h-1 flex-1 rounded-full ${
                        step <= (audioBuffersRef.current.length % 5) + 1
                          ? 'bg-blue-500'
                          : 'bg-blue-500/30'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            {calibrationComplete && (
              <CheckCircle className="w-5 h-5 text-green-400" />
            )}
          </div>
        </motion.div>
      )}

      {/* Recent Detections */}
      <AnimatePresence>
        {matchHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <p className="text-sm font-medium text-white/80">Recent voice activity:</p>
            {matchHistory.slice().reverse().map((match, index) => (
              <motion.div
                key={`${match.timestamp}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-xl border ${
                  match.isMatch
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-gray-500/10 border-gray-500/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {match.isMatch ? (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    ) : (
                      <Mic className="w-4 h-4 text-gray-400" />
                    )}
                    <span className={`font-medium ${
                      match.isMatch ? 'text-red-300' : 'text-gray-300'
                    }`}>
                      {match.matchedWord}
                    </span>
                  </div>
                  <div className="text-sm text-white/60">
                    {new Date(match.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </div>
                </div>
                <div className="mt-1 text-xs text-white/50">
                  Confidence: {(match.confidence * 100).toFixed(1)}%
                  {match.isMatch && (
                    <span className="ml-2 text-red-400 font-semibold">✓ SAFEWORD MATCHED</span>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Safeword List */}
      <div className="p-4 bg-gray-900/50 rounded-2xl border border-gray-700/50">
        <p className="text-sm font-medium text-white/80 mb-2">Configured Safewords:</p>
        <div className="flex flex-wrap gap-2">
          {SAFEWORDS.map((word) => (
            <div
              key={word}
              className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg"
            >
              <span className="text-sm font-semibold text-red-300">{word}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-white/50 mt-3">
          Voice matching: {calibrationComplete ? 'ACTIVE' : 'NOT CALIBRATED'}
          {calibrationComplete && ` (Threshold: ${(VOICE_MATCH_THRESHOLD * 100).toFixed(0)}%)`}
        </p>
      </div>

      {/* Permissions Error */}
      {!permissionGranted && isActive && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
          <p className="text-sm text-red-300">
            Microphone permission is required for voice safety features.
            Please allow microphone access when prompted.
          </p>
        </div>
      )}
    </div>
  )
}

// Add SpeechRecognition interface
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}
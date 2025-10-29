"use client"

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SplashScreenProps {
  onLoadingComplete?: () => void
  duration?: number
}

export default function SplashScreen({ 
  onLoadingComplete, 
  duration = 3000 
}: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 1
      })
    }, duration / 100)

    // Hide splash screen after duration
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => {
        onLoadingComplete?.()
      }, 500) // Wait for exit animation
    }, duration)

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [duration, onLoadingComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 bg-[#A2E5D8]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Full Screen Logo */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full h-full flex items-center justify-center"
          >
            <div className="w-full h-full flex items-center justify-center p-4">
              <img 
                className="w-full h-full object-contain"
                src="/logo.png"
                alt="Logo" 
              />
            </div>
          </motion.div>

          {/* Overlay Progress Bar at Bottom */}
          <div className="absolute bottom-20 left-0 right-0 px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="space-y-4"
            >
              <br/>
              {/* Progress Bar Background */}
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                {/* Progress Bar Fill */}
                <motion.div
                  className="h-full bg-blue-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>

            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
"use client"

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SplashScreenProps {
  onLoadingComplete?: () => void
  duration?: number
}

export default function SplashScreen({ 
  onLoadingComplete, 
  duration = 2000 // Slightly shorter for better UX
}: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [showSpinner, setShowSpinner] = useState(false)

  useEffect(() => {
    // Show spinner after initial animation
    const spinnerTimer = setTimeout(() => {
      setShowSpinner(true)
    }, 800)

    // Hide splash after total duration
    const splashTimer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => {
        onLoadingComplete?.()
      }, 300) // Shorter exit transition
    }, duration)

    return () => {
      clearTimeout(spinnerTimer)
      clearTimeout(splashTimer)
    }
  }, [duration, onLoadingComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash-screen"
          className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          exit={{ opacity: 0 }}
        >
          {/* Logo Animation */}
          <motion.div
            className="relative"
            initial={{ scale: 0.8, rotate: -5 }}
            animate={{ 
              scale: 1, 
              rotate: 0,
              transition: {
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.1
              }
            }}
          >
            <img 
              src="/icon.PNG"
              alt="RubHub Logo"
              className="w-48 h-48 object-contain"
              style={{
                filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1))'
              }}
            />
          </motion.div>

          {/* Loading Spinner (appears after logo settles) */}
          <AnimatePresence>
            {showSpinner && (
              <motion.div
                key="spinner"
                className="mt-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  transition: {
                    duration: 0.3
                  }
                }}
                exit={{ opacity: 0 }}
              >
                <div className="relative">
                  {/* Outer spinner ring */}
                  <div className="w-12 h-12 border-4 border-gray-200 rounded-full" />
                  
                  {/* Animated spinner */}
                  <motion.div
                    className="absolute top-0 left-0 w-12 h-12 border-4 border-green-600 rounded-full border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  
                  {/* Pulsing dot */}
                  <motion.div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-green-600 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [1, 0.7, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Optional Loading Text */}
          {showSpinner && (
            <motion.p
              className="mt-4 text-gray-500 text-sm font-medium"
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: {
                  delay: 0.2,
                  duration: 0.3
                }
              }}
            >
              Preparing your experience...
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
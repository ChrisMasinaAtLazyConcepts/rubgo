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

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => {
        onLoadingComplete?.()
      }, 500)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onLoadingComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 1.2, 
            ease: "easeOut",
            delay: 0.2 
          }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#F9FCFF]"
        >
          <img 
            src="/icon.PNG"
            alt="RubHub Logo"
            className="w-full h-full object-contain "
            style={{
              maxWidth: '100vw',
              maxHeight: '200vh',
              objectFit: 'contain'
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
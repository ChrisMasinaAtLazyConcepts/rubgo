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
          className="fixed inset-0 z-50 bg-[#F9FCFF]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
      {/* Full Screen Logo */}

      <div className="min-h-screen flex flex-col items-center justify-center">
        <img 
          className="w-40 h-40 object-contain"
          src="/rubbgo2.png"
          alt="Logo" 
        />
        <h1 className="text-center text-4xl font-bold mb-1 text-green-700">
          RubHub™
        </h1>
      </div>
        {/* Overlay Spinner at Bottom */}
<div className="absolute bottom-20 left-0 right-0 px-8">
  <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.6 }}
  className="flex justify-center items-center"
>
  {/* Spinner Container */}
  <div className="relative w-16 h-16">
    {/* Background Circle */}
    <div className="absolute inset-0 rounded-full border-3 border-gray-200"></div>
    
    {/* Animated Spinner Circle */}
    <motion.div
      className="absolute inset-0 rounded-full border-3 border-green-800 border-t-transparent"
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  </div>
</motion.div>
</div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
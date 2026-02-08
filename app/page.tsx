"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion" // ← ADD THIS IMPORT
import { useAuth } from "@/lib/auth-context"
import SplashScreen from '@/components/splash-screen'

export default function Page() {
  const { user, isLoading } = useAuth()
  const hasRedirected = useRef(false)
  const [showSplash, setShowSplash] = useState(true)

  const handleSplashComplete = () => {
    console.log("✨ Splash screen animation complete")
    setShowSplash(false)
  }

  useEffect(() => {
    if (showSplash || isLoading) return
    if (hasRedirected.current) return
    
    hasRedirected.current = true
    console.log("🎯 Redirecting - User:", user ? "Logged in" : "Not logged in")
    
    const targetPath = user ? "/home" : "/auth/signup"
    window.location.replace(targetPath)
    
  }, [user, isLoading, showSplash])

  if (showSplash) {
    return <SplashScreen onLoadingComplete={handleSplashComplete} duration={2500} />
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      {/* Spinner Container */}
      <div className="relative w-16 h-16">
        {/* Background Circle */}
        <div className="absolute inset-0 rounded-full border-3 border-gray-200"></div>
        
        {/* Animated Spinner Circle - now uses motion.div */}
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
      
      {/* Text below spinner */}
      <p className="mt-8 text-xl font-semibold text-gray-800">
        Welcome to RubHub Mobile Spa
      </p>
    </div>
  )
}
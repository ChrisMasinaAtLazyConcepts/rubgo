"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import SplashScreen from '@/components/splash-screen'

export default function Page() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  // Handle routing after splash screen
  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push("/home")
      } else {
        router.push("/auth/signup")
      }
    }
  }, [user, isLoading, router])

  // App initialization
  useEffect(() => {
    const initializeApp = async () => {
      // You can add actual initialization logic here:
      // - Check authentication status
      // - Load user preferences
      // - Initialize analytics
      // - Check for updates
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    initializeApp()
  }, [])

  return (
    <>
      <SplashScreen 
        onLoadingComplete={handleLoadingComplete}
        duration={4000}
      />
      
      {/* Optional: You can add a loading state here if needed */}
      {!isLoading && (
        <main className="min-h-screen bg-background">
          {/* This will briefly show before redirect happens */}
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <p>Redirecting...</p>
            </div>
          </div>
        </main>
      )}
    </>
  )
}
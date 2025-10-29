"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"
import SplashScreen from '@/components/splash-screen'

export default function Page() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push("/home")
      } else {
        router.push("/auth/signup")
      }
    }
  }, [user, isLoading, router])

  const handleLoadingComplete = () => {
    setIsLoading(false)
    // You can also redirect to main app here if needed
    // router.push('/dashboard')
  }

  // Simulate app initialization
  useEffect(() => {
    // Check auth status, load data, etc.
    const initializeApp = async () => {
      // Simulate API calls or data loading
      await new Promise(resolve => setTimeout(resolve, 1000))
      // App is ready, splash screen will handle the transition
    }

    initializeApp()
  }, [])

  return (
     <>
      <SplashScreen 
        onLoadingComplete={handleLoadingComplete}
        duration={4000}
      />
      
      {!isLoading && (
        <main className="min-h-screen bg-background">
        </main>
      )}
    </>
  )
}

"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function TherapistPage() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    // Check if user has completed onboarding
    // Replace this with your actual check
    const hasCompletedOnboarding = false // Your logic here
    
    if (!hasCompletedOnboarding) {
      router.push('/therapist/onboarding')
    }
  }, [router, user])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold">Therapist Dashboard</h1>
        <p>Loading your dashboard...</p>
      </div>
    </div>
  )
}
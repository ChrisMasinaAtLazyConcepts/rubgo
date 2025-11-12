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
    <div className="min-h-screen bg-[#1a2a3a] text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#71CBD1] mb-2">Therapist Dashboard</h1>
          <p className="text-gray-300">Loading your dashboard...</p>
        </div>
        
        {/* Loading Animation */}
        <div className="flex justify-center items-center py-12">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-[#71CBD1] h-12 w-12"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-[#71CBD1] rounded w-20"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-600 rounded"></div>
                <div className="h-4 bg-gray-600 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 opacity-50">
          <div className="bg-[#2d3e50] rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-[#71CBD1]">0</div>
            <div className="text-gray-300 text-sm">Upcoming Appointments</div>
          </div>
          <div className="bg-[#2d3e50] rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-[#71CBD1]">0</div>
            <div className="text-gray-300 text-sm">Total Clients</div>
          </div>
          <div className="bg-[#2d3e50] rounded-lg p-6 text-center">
            <div className="text-2xl font-bold text-[#71CBD1]">R 0</div>
            <div className="text-gray-300 text-sm">Earnings</div>
          </div>
        </div>

        {/* Navigation Hint */}
        <div className="text-center mt-12">
          <p className="text-gray-400 text-sm">
            You'll be redirected to complete your onboarding shortly...
          </p>
        </div>
      </div>
    </div>
  )
}
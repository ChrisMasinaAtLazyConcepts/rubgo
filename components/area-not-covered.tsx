"use client"

import { Button } from "@/components/ui/button"
import { MapPin, Target, AlertCircle, Mail, Map } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"
import { useState } from "react"

interface AreaNotCoveredProps {
  onSubscribe?: () => void
  onCheckOtherAreas?: () => void
  userLocation?: string
}

export function AreaNotCovered({
  onSubscribe,
  onCheckOtherAreas,
  userLocation = "your location"
}: AreaNotCoveredProps) {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = () => {
    if (email && !subscribed) {
      console.log("Subscribed with email:", email)
      setSubscribed(true)
      setTimeout(() => {
        onSubscribe?.()
      }, 1500)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-block p-4 bg-white rounded-2xl shadow-lg mb-6"
          >
            <div className="relative w-48 h-48 mx-auto">
              <Image
                src="/images/area-not-covered.svg" // You'll need to add this image to your public/images folder
                alt="Area not covered"
                fill
                className="object-contain"
              />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-orange-200 mb-4"
          >
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <span className="font-semibold text-orange-700">Service Not Available Yet</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold text-gray-800 mb-3"
          >
            We're Not in Your Area Yet
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 text-lg"
          >
            RubGo hasn't expanded to <span className="font-semibold text-orange-600">{userLocation}</span> yet, but we're working on it!
          </motion.p>
        </div>

        {/* Coverage Info */}
        <div className="space-y-4 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Our Current Coverage</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Johannesburg & Pretoria
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Cape Town & Surrounds
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Durban Coastal Areas
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    Bloemfontein (Coming Soon)
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-2xl border border-orange-200"
          >
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-orange-800 mb-2">Help Us Expand Faster!</h4>
                <p className="text-sm text-orange-700">
                  The more demand we see in your area, the faster we can expand. Subscribe to show your interest and help us prioritize your location.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Email Subscription */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          {!subscribed ? (
            <>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Enter your email to be notified when we launch in your area:
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <Button
                  onClick={handleSubscribe}
                  disabled={!email.trim()}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl"
                >
                  <Mail className="w-5 h-5" />
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-green-800 mb-1">You're on the list! 🎉</h4>
              <p className="text-sm text-green-700">
                We'll notify <span className="font-semibold">{email}</span> when RubGo launches in your area.
              </p>
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          {!subscribed && (
            <Button
              onClick={onCheckOtherAreas}
              variant="outline"
              className="w-full border-orange-300 text-orange-700 hover:bg-orange-50 rounded-2xl py-3 font-semibold"
            >
              <Map className="w-5 h-5 mr-2" />
              Check Available Areas
            </Button>
          )}

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Already have a therapist in mind? <br />
              <button className="text-orange-600 font-medium hover:text-orange-700">
                Refer them to join RubGo
              </button>
            </p>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm"
        >
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Expansion Progress</span>
            <span>45%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full" style={{ width: '45%' }}></div>
          </div>
          <p className="text-xs text-gray-500">
            Based on demand, we expect to launch in your area within 3-6 months
          </p>
        </motion.div>
      </div>
    </div>
  )
}
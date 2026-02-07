"use client"

import { Button } from "@/components/ui/button"
import { Bell, MapPin, Clock, Users } from "lucide-react"
import Image from "next/image"
import { motion } from "framer-motion"

interface NoTherapistsAvailableProps {
  onNotifyMe?: () => void
  estimatedWaitTime?: string
  currentLocation?: string
}

export function NoTherapistsAvailable({
  onNotifyMe,
  estimatedWaitTime = "1-2 hours",
  currentLocation = "your area"
}: NoTherapistsAvailableProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-6">
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
                src="/images/no-therapists.svg" // You'll need to add this image to your public/images folder
                alt="No therapists available"
                fill
                className="object-contain"
              />
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-800 mb-3"
          >
            No Therapists Available Right Now
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 text-lg"
          >
            All our therapists in <span className="font-semibold text-blue-600">{currentLocation}</span> are currently busy
          </motion.p>
        </div>

        {/* Information Cards */}
        <div className="space-y-4 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Estimated Wait Time</h3>
              <p className="text-gray-600">{estimatedWaitTime}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Service Area Covered</h3>
              <p className="text-gray-600">Your area is within our service radius</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Therapist Availability</h3>
              <p className="text-gray-600">We have 12 therapists that serve your area</p>
            </div>
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <Button
            onClick={onNotifyMe}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl py-6 text-lg font-semibold shadow-lg"
          >
            <Bell className="w-5 h-5 mr-2" />
            Notify Me When Available
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              You'll receive a push notification when a therapist becomes available in your area
            </p>
          </div>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200"
        >
          <h4 className="font-semibold text-blue-800 mb-2">Tips for Faster Service:</h4>
          <ul className="space-y-2 text-sm text-blue-700">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Try during off-peak hours (weekday mornings)
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Book in advance for weekend appointments
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Consider group bookings for better availability
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  )
}
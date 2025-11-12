"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Loader2, ArrowLeft, Eye, EyeOff, User, Users } from "lucide-react"

export default function SignInPage() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState<"client" | "therapist" | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!userType) {
      setError("Please select account type")
      return
    }

    setIsLoading(true)

    try {
      await signIn(email, password)
      // Redirect based on user type
      if (userType === "therapist") {
        router.push("/therapist/dashboard")
      } else {
        router.push("/home")
      }
    } catch (err) {
      setError("Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }

  // Show user type selection if not chosen
  if (!userType) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        </div>

        <div className="p-6 max-w-md mx-auto bg-[#F9FCFF]">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <img 
              className="mx-auto w-full h-full object-contain"
              src="/rubgo-login1.png"
              alt="RubGO" 
            />
            <h1 className="text-left text-md font-bold mb-2 text-green-700">Welcome Back</h1>
            <p className="text-gray-400">Choose your account type to sign in</p>
          </div>

          {/* Account Type Selection */}
          <div className="space-y-4">
            {/* Client Card */}
            <Card 
              className="bg-gray-900 border-gray-700 cursor-pointer hover:border-[#71CBD1] transition-colors"
              onClick={() => setUserType("client")}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#71CBD1] rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-black" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">Sign in as Client</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Access your client dashboard and bookings
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Therapist Card */}
            <Card 
              className="bg-gray-900 border-gray-700 cursor-pointer hover:border-[#71CBD1] transition-colors"
              onClick={() => setUserType("therapist")}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">Sign in as Therapist</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Access your therapist dashboard and clients
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Sign In Info */}
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-sm font-semibold mb-3 text-gray-900">Quick Access</h3>
            <ul className="space-y-2 text-xs text-gray-600">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#71CBD1] rounded-full"></div>
                Manage your bookings and appointments
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#71CBD1] rounded-full"></div>
                View your session history
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#71CBD1] rounded-full"></div>
                Update your profile and preferences
              </li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setUserType(null)} 
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div className="flex-1 text-center">
            <span className="text-sm text-gray-400">Signing in as </span>
            <span className="text-[#71CBD1] font-semibold">
              {userType === "therapist" ? "Therapist" : "Client"}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-md mx-auto">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <img 
            className="mx-auto w-32 h-32 object-contain"
            src="/logo-black.png"
            alt="RubGo" 
          />
          <h1 className="text-2xl font-bold mb-2">
            {userType === "therapist" ? "Therapist Sign In" : "Client Sign In"}
          </h1>
          <p className="text-gray-400">
            {userType === "therapist" 
              ? "Access your therapist dashboard" 
              : "Sign in to manage your bookings"
            }
          </p>
        </div>

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white text-sm font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 h-12 rounded-lg focus:border-[#71CBD1] focus:ring-[#71CBD1]"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white text-sm font-medium">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 h-12 rounded-lg focus:border-[#71CBD1] focus:ring-[#71CBD1] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link 
              href="/auth/forgot-password" 
              className="text-sm text-[#71CBD1] hover:text-[#5bb5c1] font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Sign In Button */}
          <Button 
            type="submit" 
            className="w-full bg-[#71CBD1] hover:bg-[#5bb5c1] text-black font-semibold h-12 rounded-lg text-base transition-colors duration-200" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {userType === "therapist" ? "Signing in..." : "Signing in..."}
              </>
            ) : (
              "Sign In"
            )}
          </Button>

          {/* Sign Up Link */}
          <div className="text-center text-sm pt-4">
            <span className="text-gray-400">Don't have an account? </span>
            <Link 
              href="/auth/signup" 
              className="text-[#71CBD1] hover:text-[#5bb5c1] font-semibold transition-colors"
            >
              Sign up
            </Link>
          </div>
        </form>

        {/* Quick Features - Dynamic based on user type */}
        <div className="mt-8 p-4 bg-gray-900 rounded-lg">
          <h3 className="text-sm font-semibold mb-3 text-gray-300">
            {userType === "therapist" ? "Therapist Dashboard" : "Client Dashboard"}
          </h3>
          <ul className="space-y-2 text-xs text-gray-400">
            {userType === "therapist" ? (
              <>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Manage your schedule and availability
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  View upcoming appointments
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Track your earnings and payments
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Update your profile and services
                </li>
              </>
            ) : (
              <>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#71CBD1] rounded-full"></div>
                  Book new massage sessions
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#71CBD1] rounded-full"></div>
                  Manage your appointments
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#71CBD1] rounded-full"></div>
                  View session history and receipts
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#71CBD1] rounded-full"></div>
                  Update your preferences and payment methods
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Demo Account Info */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
          <h4 className="text-sm font-semibold mb-2 text-blue-300">Demo Access</h4>
          <p className="text-xs text-blue-300">
            Use your registered email and password to sign in. Contact support if you need assistance accessing your account.
          </p>
        </div>
      </div>
    </div>
  )
}
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
import { Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react"

export default function SignUpPage() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      await signUp(email, password, name, phone)
      router.push("/home")
    } catch (err) {
      setError("Failed to create account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
      </div>

      <div className="p-6 max-w-md mx-auto">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <img 
              className="w-12 h-12 object-contain"
              src="/logo.png"
              alt="Massage2GO" 
            />
          </div>
          <h1 className="text-2xl font-bold mb-2">Create an account</h1>
          <p className="text-gray-400">Sign up to book massage therapists near you</p>
        </div>

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white text-sm font-medium">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
              className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 h-12 rounded-lg focus:border-[#71CBD1] focus:ring-[#71CBD1]"
            />
          </div>

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

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-white text-sm font-medium">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+27 12 345 6789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
                placeholder="Create a password"
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

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white text-sm font-medium">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 h-12 rounded-lg focus:border-[#71CBD1] focus:ring-[#71CBD1] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Terms and Conditions */}
          <div className="text-xs text-gray-400 text-center">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-[#71CBD1] hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-[#71CBD1] hover:underline">
              Privacy Policy
            </Link>
          </div>

          {/* Sign Up Button */}
          <Button 
            type="submit" 
            className="w-full bg-[#71CBD1] hover:bg-[#5bb5c1] text-black font-semibold h-12 rounded-lg text-base transition-colors duration-200" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>

          {/* Sign In Link */}
          <div className="text-center text-sm pt-4">
            <span className="text-gray-400">Already have an account? </span>
            <Link 
              href="/auth/signin" 
              className="text-[#71CBD1] hover:text-[#5bb5c1] font-semibold transition-colors"
            >
              Sign in
            </Link>
          </div>
        </form>

        {/* Quick Features */}
        <div className="mt-8 p-4 bg-gray-900 rounded-lg">
          <h3 className="text-sm font-semibold mb-3 text-gray-300">Why join Massage2GO?</h3>
          <ul className="space-y-2 text-xs text-gray-400">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#71CBD1] rounded-full"></div>
              Book licensed therapists near you
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#71CBD1] rounded-full"></div>
              Secure payments & easy booking
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#71CBD1] rounded-full"></div>
              Real-time therapist availability
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#71CBD1] rounded-full"></div>
              Customer reviews & ratings
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
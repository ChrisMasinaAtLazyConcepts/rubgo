'use client'

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Loader2, ArrowLeft, Eye, EyeOff, User, Building, Mail, Lock } from "lucide-react"
import { toast } from "sonner"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState<"client" | "therapist" | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // API: Handle user signin
  const handleSignin = async (userData: any) => {
    try {
      setIsLoading(true)
      setError("")

     // const response = await fetch(`${API_BASE_URL}/auth/signin`, {
    //    method: 'POST',
     //   headers: {
     //     'Content-Type': 'application/json',
     //   },
    //    body: JSON.stringify(userData),
    //  })

    //  const data = await response.json()

     // if (!response.ok) {
     //   throw new Error(data.message || 'Signin failed')
      //}

      // Store token and user data
    //  if (data.token) {
      //  localStorage.setItem('auth_token', data.token)
      //  localStorage.setItem('user', JSON.stringify(data.user))
      //}

      //toast.success('Welcome back!')
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signin failed'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!userType) {
      setError("Please select account type")
      return
    }

    try {
      const userData = {
        email,
        password,
        userType
      }

      const result = await handleSignin(userData)
      
      // Redirect based on user type
      if (userType === "therapist") {
        router.push("/therapist/dashboard")
      } else {
        router.push("/home")
      }
    } catch (err) {
      // Error already handled in handleSignin
    }
  }

  // Sleek Button Component
// SleekButton component - UPDATED VERSION
const SleekButton = ({ 
  children, 
  onClick, 
  variant = "primary",
  loading = false,
  disabled = false,
  fullWidth = true,
  className = "",
  icon: Icon,
  type = "button" // Add type prop
}: {
  children: React.ReactNode
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void
  variant?: 'primary' | 'secondary' | 'outline'
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  className?: string
  icon?: React.ComponentType<{ className?: string }>
  type?: 'button' | 'submit' | 'reset' // Add type support
}) => {
  const baseClasses = "relative overflow-hidden transition-all duration-300 font-medium rounded-xl"
  const variantClasses = {
    primary: "bg-gradient-to-r from-[#71CBD1] to-[#5bb5c1] text-white hover:from-[#5bb5c1] hover:to-[#4aa2ad] active:scale-[0.98] shadow-lg hover:shadow-xl",
    secondary: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 hover:from-gray-200 hover:to-gray-300 border border-gray-300",
    outline: "bg-transparent border-2 border-[#71CBD1] text-[#71CBD1] hover:bg-[#71CBD1]/10"
  }
  
  return (
    <button
      type={type} // Add type attribute
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
        px-6 py-3
      `}
    >
      <div className="flex items-center justify-center gap-2">
        {Icon && <Icon className="w-5 h-5" />}
        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
        <span>{children}</span>
      </div>
    </button>
  )
}

  // Sleek Input Component
  const SleekInput = ({ 
    label, 
    type, 
    value, 
    onChange, 
    placeholder, 
    icon: Icon,
    required = false,
    disabled = false
  }: {
    label: string
    type: string
    value: string
    onChange: (value: string) => void
    placeholder: string
    icon?: React.ComponentType<{ className?: string }>
    required?: boolean
    disabled?: boolean
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
      </Label>
      <div className="relative">
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="h-12 rounded-xl border-gray-300 focus:border-[#71CBD1] focus:ring-[#71CBD1] bg-white/80 backdrop-blur-sm pl-10 transition-all duration-200"
        />
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  )

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#71CBD1]" />
      </div>
    )
  }

  // Show user type selection if not chosen
  if (!userType) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="p-6 max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => router.back()} 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-xl font-bold text-gray-900">Welcome Back</h1>
              <p className="text-sm text-gray-500">Choose your account type</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="text-center">
            <div className="mb-8">
              <img 
                className="mx-auto w-48 h-48 object-contain"
                src="/rubgo-login.png"
                alt="RubHub Logo" 
              />
            </div>

            {/* Account Type Selection */}
            <div className="space-y-4 mb-8">
              <Card 
                className="border-2 border-gray-200 hover:border-[#71CBD1] transition-all duration-300 cursor-pointer hover:shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden group"
                onClick={() => setUserType("client")}
              >
                <CardContent className="p-6">
                  <div className="flex gap-4 items-start">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#71CBD1] to-[#5bb5c1] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                      <User className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2 text-start">
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg text-gray-900">Client</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Access your bookings and appointments
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="border-2 border-gray-200 hover:border-green-500 transition-all duration-300 cursor-pointer hover:shadow-lg bg-gradient-to-br from-green-50 to-white overflow-hidden group"
                onClick={() => setUserType("therapist")}
              >
                <CardContent className="p-6">
                  <div className="flex gap-4 items-start">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                      <Building className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2 text-start">
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg text-gray-900">Therapist</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Access your professional dashboard
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sign Up Link */}
            <div className="text-center text-sm">
              <span className="text-gray-500">Don't have an account? </span>
              <Link 
                href="/auth/signup" 
                className="text-[#71CBD1] hover:text-[#5bb5c1] font-semibold transition-colors"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="p-6 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => setUserType(null)} 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">
              {userType === "therapist" ? "Therapist Sign In" : "Client Sign In"}
            </h1>
            <p className="text-sm text-gray-500">
              {userType === "therapist" 
                ? "Access your professional dashboard" 
                : "Sign in to manage your bookings"
              }
            </p>
          </div>
        </div>

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <SleekInput
            label="Email Address"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            icon={Mail}
            required
          />

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading}
                className="h-12 rounded-xl border-gray-300 focus:border-[#71CBD1] focus:ring-[#71CBD1] bg-white/80 backdrop-blur-sm pl-10 pr-10 transition-all duration-200"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Lock className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          {/* Sign In Button */}
          <SleekButton
            type="submit"  //
            loading={isLoading}
            disabled={isLoading}
            variant="primary"
            className="mt-6"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </SleekButton>
          {/* Sign Up Link */}
          <div className="text-center text-sm pt-4">
            <span className="text-gray-500">Don't have an account? </span>
            <Link 
              href="/auth/signup" 
              className="text-[#71CBD1] hover:text-[#5bb5c1] font-semibold transition-colors"
            >
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
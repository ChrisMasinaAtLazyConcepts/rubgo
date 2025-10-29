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
import { Loader2 } from "lucide-react"

export default function SignInPage() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await signIn(email, password)
      router.push("/home")
    } catch (err) {
      setError("Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-whitesmoke">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-32 w-32 rounded-2xl bg-white flex items-center justify-center shadow-lg">
            <img 
              className="h-28 w-28 object-cover rounded-xl"
              src="/splash.gif"
              alt='logo' 
            />
          </div>
        </div>

        <Card className="border-2 border-[#71CBD1] bg-[#0D2D77] text-white shadow-xl">
          <CardHeader className="border-b border-[#71CBD1]/30">
            <CardTitle className="text-white text-xl">Welcome Back</CardTitle>
            <CardDescription className="text-gray-300">Sign in to find a therapist nearby</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-[#2d3e50] border-[#71CBD1] text-white placeholder:text-gray-400 focus:border-[#EDB64D] focus:ring-[#EDB64D]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-[#2d3e50] border-[#EDB64D] text-white placeholder:text-gray-400 focus:border-[#EDB64D] focus:ring-[#EDB64D]"
                />
              </div>

              {error && <p className="text-sm text-red-400 bg-red-900/20 p-2 rounded-md border border-red-800">{error}</p>}

              <Button 
                type="submit" 
                className="w-full bg-[#EDB64D] hover:bg-[#e6a123] text-[#1a2a3a] font-semibold py-2.5 transition-colors duration-200" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="text-center text-sm pt-2">
                <span className="text-gray-400">{"Don't have an account? "}</span>
                <Link href="/auth/signup" className="text-[#EDB64D] hover:text-[#e6a123] font-medium transition-colors">
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
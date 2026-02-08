"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useRef } from "react"

interface User {
  userType: string
  id: string
  email: string
  name: string
  phone?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, phone?: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const hasInitialized = useRef(false) // NEW: Prevent multiple initializations

  useEffect(() => {
    // RUN ONLY ONCE - use ref to track initialization
    if (hasInitialized.current) return
    hasInitialized.current = true
    
    console.log("🔄 AuthProvider: Checking stored user")
    
    // Check for stored user session
    const storedUser = localStorage.getItem("dam-safe-user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Failed to parse stored user:", error)
        localStorage.removeItem("dam-safe-user")
      }
    }
    
    // Set loading to false AFTER a small delay
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    
    return () => clearTimeout(timer)
  }, []) // EMPTY DEPENDENCY ARRAY = RUNS ONCE

  const signIn = async (email: string, password: string) => {
    // Mock authentication - replace with real API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const mockUser: User = {
      id: "1",
      email,
      name: email.split("@")[0],
      userType: 'client'
    }

    setUser(mockUser)
    localStorage.setItem("dam-safe-user", JSON.stringify(mockUser))
  }

  const signUp = async (email: string, password: string, name: string, phone?: string) => {
    // Mock registration - replace with real API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const mockUser: User = {
      id: "1",
      email,
      name,
      phone,
      userType: 'client'
    }

    setUser(mockUser)
    localStorage.setItem("dam-safe-user", JSON.stringify(mockUser))
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem("dam-safe-user")
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      signIn, 
      signUp, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
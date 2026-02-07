// lib/auth.ts - UPDATED VERSION (No Prisma, API-based)
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

// Remove Prisma imports
// import { PrismaAdapter } from "@next-auth/prisma-adapter"
// import { prisma } from "@/lib/prisma"
// import bcrypt from "bcryptjs"

// API base URL - use environment variable or default to localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export const authOptions: NextAuthOptions = {
  // Remove adapter - we'll handle sessions with JWT
  // adapter: PrismaAdapter(prisma),
  
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Call your local API for authentication
          const response = await fetch(`${API_BASE_URL}/auth/signin`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            }),
          })

          if (!response.ok) {
            // Try to get error message from response
            const errorData = await response.json().catch(() => ({}))
            console.error('Auth API error:', response.status, errorData)
            return null
          }

          const user = await response.json()

          // Return user object in the format NextAuth expects
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
            accessToken: user.token // Store the token if your API returns one
          }
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signup",
    error: "/auth/error"
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // If user just logged in, add their data to the token
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.image = user.image
      }
      
      // Handle session update (if you implement profile updates)
      if (trigger === "update" && session) {
        token = { ...token, ...session }
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.image as string
        // Add accessToken to session if needed
      }
      return session
    }
  },
  // Optional: Add debug logging in development
  debug: process.env.NODE_ENV === 'development',
  // Optional: Set secret for production
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production"
}
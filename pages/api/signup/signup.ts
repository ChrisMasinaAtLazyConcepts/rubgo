// app/api/signup/route.ts
import { NextRequest, NextResponse } from 'next/server'

// Define the expected params type
interface RouteParams {
  params: Promise<{}>
}

export async function POST(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const signupData = await request.json()
    
    // Validate required fields
    if (!signupData.email || !signupData.password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }
    
    // Call your authentication API or service
    const authResponse = await fetch(`${process.env.API_BASE_URL || 'http://localhost:3000/api'}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupData)
    })
    
    if (!authResponse.ok) {
      const errorData = await authResponse.json()
      return NextResponse.json(
        { error: errorData.error || 'Failed to create account' },
        { status: authResponse.status }
      )
    }
    
    const userData = await authResponse.json()
    
    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name
      }
    }, { status: 201 })
    
  } catch (error) {
    console.error('Signup error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('JSON')) {
        return NextResponse.json(
          { error: 'Invalid JSON payload' },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Add GET method if needed
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
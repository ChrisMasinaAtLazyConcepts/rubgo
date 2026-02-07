// app/api/bookings/[id]/arrival-instructions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Define the expected params type
interface RouteParams {
  params: Promise<{ id: string }>
}

// Base URL for your local API
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api'

export async function PUT(
  request: NextRequest,
  context: RouteParams
) {
  try {
    // Destructure params from context
    const params = await context.params
    const bookingId = params.id
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
    }

    const arrivalData = await request.json()

    // Validate required fields
    if (!arrivalData.address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 })
    }

    // Step 1: First check if user exists and owns the booking
    // We'll make a GET request to verify ownership
    const verifyResponse = await fetch(`${API_BASE_URL}/bookings/${bookingId}/verify`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.email}` // Or use your actual auth token
      }
    })

    if (!verifyResponse.ok) {
      const errorData = await verifyResponse.json()
      return NextResponse.json(
        { error: errorData.error || 'Failed to verify booking ownership' },
        { status: verifyResponse.status }
      )
    }

    // Step 2: Update arrival instructions by calling your local API
    const updateResponse = await fetch(`${API_BASE_URL}/bookings/${bookingId}/arrival-instructions`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.email}`
      },
      body: JSON.stringify(arrivalData)
    })

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json()
      return NextResponse.json(
        { error: errorData.error || 'Failed to update arrival instructions' },
        { status: updateResponse.status }
      )
    }

    const updatedBooking = await updateResponse.json()
    return NextResponse.json(updatedBooking)
    
  } catch (error) {
    console.error('Error updating arrival instructions:', error)
    
    // Handle fetch errors
    if (error instanceof Error) {
      if (error.message.includes('fetch failed')) {
        return NextResponse.json(
          { error: 'Failed to connect to API server' },
          { status: 502 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    // Destructure params from context
    const params = await context.params
    const bookingId = params.id
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
    }

    // Fetch arrival instructions by calling your local API
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/arrival-instructions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.email}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.error || 'Failed to fetch arrival instructions' },
        { status: response.status }
      )
    }

    const bookingData = await response.json()
    return NextResponse.json(bookingData)
    
  } catch (error) {
    console.error('Error fetching arrival instructions:', error)
    
    // Handle fetch errors
    if (error instanceof Error) {
      if (error.message.includes('fetch failed')) {
        return NextResponse.json(
          { error: 'Failed to connect to API server' },
          { status: 502 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
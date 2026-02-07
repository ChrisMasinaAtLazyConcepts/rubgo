// app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reviewData = await request.json()

    // Validate required fields
    if (!reviewData.bookingId || !reviewData.therapistId) {
      return NextResponse.json(
        { error: 'Booking ID and therapist ID are required' },
        { status: 400 }
      )
    }

    // Save review to your database/backend
    // const savedReview = await saveReviewToDatabase(reviewData)
    
    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
      reviewId: Date.now().toString(), // Generate unique ID
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error submitting review:', error)
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    )
  }
}
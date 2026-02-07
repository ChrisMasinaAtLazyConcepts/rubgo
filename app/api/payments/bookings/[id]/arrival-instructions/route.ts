// app/api/bookings/[id]/arrival-instructions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookingId = params.id
    
    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
    }

    const arrivalData = await request.json()

    // Validate required fields
    if (!arrivalData.address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 })
    }

    // First, get the user to check ownership
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Validate booking exists and user owns it
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          select: { id: true }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.user.id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update or create arrival instructions
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        arrivalInstructions: {
          upsert: {
            create: {
              buildingType: arrivalData.buildingType || 'house',
              address: arrivalData.address,
              unitNumber: arrivalData.unitNumber || '',
              floorNumber: arrivalData.floorNumber || '',
              gateCode: arrivalData.gateCode || '',
              parkingInstructions: arrivalData.parkingInstructions || '',
              entryInstructions: arrivalData.entryInstructions || '',
              specialNotes: arrivalData.specialNotes || '',
              shareWithTherapist: arrivalData.shareWithTherapist ?? true
            },
            update: {
              buildingType: arrivalData.buildingType,
              address: arrivalData.address,
              unitNumber: arrivalData.unitNumber,
              floorNumber: arrivalData.floorNumber,
              gateCode: arrivalData.gateCode,
              parkingInstructions: arrivalData.parkingInstructions,
              entryInstructions: arrivalData.entryInstructions,
              specialNotes: arrivalData.specialNotes,
              shareWithTherapist: arrivalData.shareWithTherapist
            }
          }
        }
      },
      include: {
        therapist: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
            rating: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true
          }
        },
        arrivalInstructions: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Format response
    const response = {
      id: updatedBooking.id,
      therapistName: updatedBooking.therapist.name,
      service: updatedBooking.service.name,
      date: updatedBooking.date.toISOString().split('T')[0],
      time: updatedBooking.time,
      duration: `${updatedBooking.service.duration} minutes`,
      status: updatedBooking.status,
      price: updatedBooking.service.price,
      therapistETA: updatedBooking.therapistETA || '15 min',
      location: updatedBooking.location,
      therapistRating: updatedBooking.therapist.rating,
      therapistImage: updatedBooking.therapist.image,
      therapistPhone: updatedBooking.therapist.phone,
      specialInstructions: updatedBooking.specialInstructions,
      arrivalInstructions: updatedBooking.arrivalInstructions,
      paymentStatus: updatedBooking.paymentStatus,
      createdAt: updatedBooking.createdAt.toISOString(),
      updatedAt: updatedBooking.updatedAt.toISOString()
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating arrival instructions:', error)
    
    // Handle Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Arrival instructions already exist' },
          { status: 409 }
        )
      }
      if (error.message.includes('Record to update not found')) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Also add GET method to fetch arrival instructions
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookingId = params.id
    
    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
    }

    // Get user to check ownership
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get booking with arrival instructions
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        therapist: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
            rating: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true
          }
        },
        arrivalInstructions: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (booking.user.id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Format response
    const response = {
      id: booking.id,
      therapistName: booking.therapist.name,
      service: booking.service.name,
      date: booking.date.toISOString().split('T')[0],
      time: booking.time,
      duration: `${booking.service.duration} minutes`,
      status: booking.status,
      price: booking.service.price,
      therapistETA: booking.therapistETA || '15 min',
      location: booking.location,
      therapistRating: booking.therapist.rating,
      therapistImage: booking.therapist.image,
      therapistPhone: booking.therapist.phone,
      specialInstructions: booking.specialInstructions,
      arrivalInstructions: booking.arrivalInstructions,
      paymentStatus: booking.paymentStatus,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString()
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching arrival instructions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
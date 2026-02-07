// app/api/payments/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SignatureService } from '@/lib/payfast/signature';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationData, passPhrase } = body;

    // Validate signature
    const isValidSignature = SignatureService.validateNotificationSignature(
      notificationData,
      passPhrase
    );

    // You can add additional validation here (e.g., check amount against database)

    return NextResponse.json({
      isValid: isValidSignature,
      data: notificationData,
    });
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { isValid: false, error: 'Validation failed' },
      { status: 500 }
    );
  }
}
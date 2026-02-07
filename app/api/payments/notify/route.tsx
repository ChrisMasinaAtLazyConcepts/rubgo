// app/api/payments/notify/route.tsx
import { NextRequest, NextResponse } from 'next/server'

// If you don't have this interface, add it
interface NotificationData {
  pf_payment_id: string;
  payment_status: string;
  item_name: string;
  merchant_id: string;
  signature: string;
  amount_gross: number;
  amount_fee?: number;
  amount_net?: number;
  custom_int1?: number;
  custom_int2?: number;
  custom_int3?: number;
  custom_int4?: number;
  custom_int5?: number;
}

interface RouteParams {
  params: Promise<{}>
}

export async function POST(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const formData = await request.formData()
    const notificationData: Record<string, string> = {}
    
    // Extract form data
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        notificationData[key] = value
      }
    }

    // Convert string values to appropriate types AND include all required fields
    const typedData: NotificationData = {
      // Required properties - you need to ensure these come from the form data
      pf_payment_id: notificationData.pf_payment_id || '',
      payment_status: notificationData.payment_status || '',
      item_name: notificationData.item_name || '',
      merchant_id: notificationData.merchant_id || '',
      signature: notificationData.signature || '',
      
      // Your existing numeric conversions
      amount_gross: parseFloat(notificationData.amount_gross || '0'),
      amount_fee: notificationData.amount_fee ? parseFloat(notificationData.amount_fee) : undefined,
      amount_net: notificationData.amount_net ? parseFloat(notificationData.amount_net) : undefined,
      custom_int1: notificationData.custom_int1 ? parseInt(notificationData.custom_int1) : undefined,
      custom_int2: notificationData.custom_int2 ? parseInt(notificationData.custom_int2) : undefined,
      custom_int3: notificationData.custom_int3 ? parseInt(notificationData.custom_int3) : undefined,
      custom_int4: notificationData.custom_int4 ? parseInt(notificationData.custom_int4) : undefined,
      custom_int5: notificationData.custom_int5 ? parseInt(notificationData.custom_int5) : undefined,
    }

    // Process the payment notification...
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Payment notification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { payFastService } from '@/lib/payfast/payment-service';
import { NotificationData } from '@/lib/payfast/types';

export async function POST(request: NextRequest) {
  try {
    // Parse the form data from PayFast
    const formData = await request.formData();
    const notificationData: Record<string, any> = {};
    
    formData.forEach((value, key) => {
      notificationData[key] = value.toString();
    });

    // Convert string values to appropriate types
    const typedData: NotificationData = {
      ...notificationData,
      amount_gross: parseFloat(notificationData.amount_gross || '0'),
      amount_fee: notificationData.amount_fee ? parseFloat(notificationData.amount_fee) : undefined,
      amount_net: notificationData.amount_net ? parseFloat(notificationData.amount_net) : undefined,
      custom_int1: notificationData.custom_int1 ? parseInt(notificationData.custom_int1) : undefined,
      custom_int2: notificationData.custom_int2 ? parseInt(notificationData.custom_int2) : undefined,
      custom_int3: notificationData.custom_int3 ? parseInt(notificationData.custom_int3) : undefined,
      custom_int4: notificationData.custom_int4 ? parseInt(notificationData.custom_int4) : undefined,
      custom_int5: notificationData.custom_int5 ? parseInt(notificationData.custom_int5) : undefined,
    };

    // Validate the notification
    const validation = await payFastService.validateNotification(typedData);

    if (validation.isValid) {
      // Process successful payment
      // Update your database, send confirmation emails, etc.
      
      // IMPORTANT: Always return HTTP 200 to prevent retries
      return new NextResponse(null, { status: 200 });
    } else {
      console.error('Invalid notification:', validation.errors);
      return new NextResponse(null, { status: 400 });
    }
  } catch (error) {
    console.error('Notification processing error:', error);
    return new NextResponse(null, { status: 500 });
  }
}
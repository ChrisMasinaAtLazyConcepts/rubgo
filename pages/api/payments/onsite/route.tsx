// app/api/payments/onsite/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerDetails, transactionDetails, options, merchantId, merchantKey, environment } = body;

    // Prepare data for PayFast API
    const paymentData = new URLSearchParams();
    
    // Add all required fields
    paymentData.append('merchant_id', merchantId);
    paymentData.append('merchant_key', merchantKey);
    paymentData.append('return_url', process.env.PAYFAST_RETURN_URL || '');
    paymentData.append('cancel_url', process.env.PAYFAST_CANCEL_URL || '');
    paymentData.append('notify_url', process.env.PAYFAST_NOTIFY_URL || '');
    
    // Add customer details
    if (customerDetails.email_address) {
      paymentData.append('email_address', customerDetails.email_address);
    }
    if (customerDetails.cell_number) {
      paymentData.append('cell_number', customerDetails.cell_number);
    }
    
    // Add transaction details
    paymentData.append('amount', transactionDetails.amount.toFixed(2));
    paymentData.append('item_name', transactionDetails.item_name);
    if (transactionDetails.m_payment_id) {
      paymentData.append('m_payment_id', transactionDetails.m_payment_id);
    }

    // Call PayFast API directly (server-side)
    const payfastUrl = environment === 'sandbox' 
      ? 'https://sandbox.payfast.co.za/onsite/process'
      : 'https://www.payfast.co.za/onsite/process';

    const response = await fetch(payfastUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: paymentData.toString(),
    });

    const data = await response.json();

    if (!response.ok || !data.uuid) {
      throw new Error(data.error || 'PayFast API error');
    }

    return NextResponse.json({
      success: true,
      uuid: data.uuid,
      data: data,
    });
  } catch (error) {
    console.error('Onsite payment error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create onsite payment' },
      { status: 500 }
    );
  }
}
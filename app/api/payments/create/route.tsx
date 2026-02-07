// app/api/payments/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getPayFastConfig, getPayFastUrls } from '@/lib/payfast/config';
import { SignatureService } from '@/lib/payfast/signature';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerDetails, transactionDetails, options } = body;

    // Get PayFast config
    const config = getPayFastConfig();
    const urls = getPayFastUrls(config.environment);

    // Prepare payment data
    const paymentData = {
      merchant_id: config.merchantId,
      merchant_key: config.merchantKey,
      return_url: process.env.PAYFAST_RETURN_URL,
      cancel_url: process.env.PAYFAST_CANCEL_URL,
      notify_url: process.env.PAYFAST_NOTIFY_URL,
      ...customerDetails,
      ...transactionDetails,
      amount: parseFloat(transactionDetails.amount.toFixed(2)),
    };

    // Generate signature
    const signature = SignatureService.generateSignature(
      paymentData,
      config.passPhrase
    );

    const finalData = {
      ...paymentData,
      signature,
    };

    // Generate form HTML
    const formHtml = generatePaymentForm(finalData, urls.processUrl);

    return NextResponse.json({
      success: true,
      paymentId: transactionDetails.m_payment_id,
      formHtml,
      redirectUrl: urls.processUrl,
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}

function generatePaymentForm(data: Record<string, any>, processUrl: string): string {
  let form = `<form action="${processUrl}" method="post" id="payfast-payment-form">`;
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      form += `<input type="hidden" name="${key}" value="${value.toString()}" />`;
    }
  });
  
  form += '</form>';
  form += '<script>document.getElementById("payfast-payment-form").submit();</script>';
  
  return form;
}
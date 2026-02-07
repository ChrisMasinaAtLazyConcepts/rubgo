import { SignatureService } from './signature';
import { getPayFastConfig, getPayFastUrls } from './config';
import {
  PaymentRequest,
  PaymentResponse,
  OnsitePaymentResponse,
  NotificationData,
  ValidationResult,
  CustomerDetails,
  TransactionDetails,
  MerchantDetails,
  TransactionOptions,
} from './types';

export class PayFastPaymentService {
  private config: ReturnType<typeof getPayFastConfig>;
  private urls: ReturnType<typeof getPayFastUrls>;

  constructor() {
    this.config = getPayFastConfig();
    this.urls = getPayFastUrls(this.config.environment);
    this.validateConfig();
  }

  private validateConfig(): void {
    const required = ['merchantId', 'merchantKey'];
    const missing = required.filter(key => !this.config[key as keyof typeof this.config]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required PayFast configuration: ${missing.join(', ')}`);
    }
  }

  /**
   * Create a standard card payment
   */
  async createCardPayment(
    customerDetails: CustomerDetails,
    transactionDetails: TransactionDetails,
    options?: TransactionOptions
  ): Promise<PaymentResponse> {
    try {
      // Call local API to create payment
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerDetails,
          transactionDetails,
          options,
          paymentType: 'card'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment');
      }

      const data = await response.json();
      return {
        success: true,
        paymentId: data.paymentId || transactionDetails.m_payment_id,
        formHtml: data.formHtml,
        redirectUrl: data.redirectUrl,
      };
    } catch (error) {
      console.error('Error creating payment:', error);
      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }

  /**
   * Create an onsite payment (modal/popup)
   */
  async createOnsitePayment(
    customerDetails: CustomerDetails,
    transactionDetails: TransactionDetails,
    options?: TransactionOptions
  ): Promise<PaymentResponse> {
    try {
      // Call local API to create onsite payment
      const response = await fetch('/api/payments/onsite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerDetails,
          transactionDetails,
          options,
          merchantId: this.config.merchantId,
          merchantKey: this.config.merchantKey,
          environment: this.config.environment
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create onsite payment');
      }

      const data = await response.json();
      
      if (!data.uuid) {
        throw new Error('No UUID received from PayFast');
      }

      return {
        success: true,
        paymentId: data.uuid,
        onsiteData: data,
      };
    } catch (error) {
      console.error('Error creating onsite payment:', error);
      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }

  /**
   * Validate notification from PayFast (ITN)
   */
  async validateNotification(data: NotificationData): Promise<ValidationResult> {
    try {
      // Call local API to validate notification
      const response = await fetch('/api/payments/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationData: data,
          passPhrase: this.config.passPhrase,
        }),
      });

      if (!response.ok) {
        throw new Error('Validation request failed');
      }

      const validationResult = await response.json();
      
      return {
        isValid: validationResult.isValid,
        errors: validationResult.errors,
        validatedData: validationResult.data,
      };
    } catch (error) {
      console.error('Error validating notification:', error);
      return {
        isValid: false,
        errors: [this.handleError(error)],
      };
    }
  }

  /**
   * Generate onsite payment script
   */
  getOnsitePaymentScript(): string {
    return `<script src="${this.urls.engineJsUrl}"></script>`;
  }

  /**
   * Generate onsite payment trigger function
   */
  generateOnsitePaymentTrigger(uuid: string, returnUrl?: string, cancelUrl?: string): string {
    const config: any = { uuid };
    
    if (returnUrl) config.return_url = returnUrl;
    if (cancelUrl) config.cancel_url = cancelUrl;

    return `window.payfast_do_onsite_payment(${JSON.stringify(config)});`;
  }

  /**
   * Generate onsite payment trigger with callback
   */
  generateOnsitePaymentTriggerWithCallback(
    uuid: string,
    callbackName: string = 'handlePaymentResult'
  ): string {
    return `
      window.payfast_do_onsite_payment({"uuid":"${uuid}"}, function(result) {
        if (typeof ${callbackName} === 'function') {
          ${callbackName}(result);
        }
      });
    `.trim();
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(`/api/payments/status/${paymentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to check payment status');
      }

      const data = await response.json();
      return {
        success: true,
        paymentId: data.paymentId,
        status: data.status,
        details: data.details,
      };
    } catch (error) {
      console.error('Error checking payment status:', error);
      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }

  /**
   * Cancel a payment
   */
  async cancelPayment(paymentId: string): Promise<PaymentResponse> {
    try {
      const response = await fetch('/api/payments/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentId }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel payment');
      }

      const data = await response.json();
      return {
        success: true,
        paymentId: data.paymentId,
        cancelled: data.cancelled,
      };
    } catch (error) {
      console.error('Error cancelling payment:', error);
      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(paymentId: string, amount?: number, reason?: string): Promise<PaymentResponse> {
    try {
      const response = await fetch('/api/payments/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          amount,
          reason
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process refund');
      }

      const data = await response.json();
      return {
        success: true,
        paymentId: data.paymentId,
        refundId: data.refundId,
        refundedAmount: data.refundedAmount,
      };
    } catch (error) {
      console.error('Error refunding payment:', error);
      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }

  private preparePaymentData(
    customerDetails: CustomerDetails,
    transactionDetails: TransactionDetails,
    options?: TransactionOptions
  ): Record<string, any> {
    const merchantDetails: MerchantDetails = {
      merchant_id: this.config.merchantId,
      merchant_key: this.config.merchantKey,
      return_url: process.env.PAYFAST_RETURN_URL,
      cancel_url: process.env.PAYFAST_CANCEL_URL,
      notify_url: process.env.PAYFAST_NOTIFY_URL,
    };

    const formattedAmount = parseFloat(transactionDetails.amount.toFixed(2));

    return {
      // Merchant details
      ...merchantDetails,
      
      // Customer details
      ...customerDetails,
      
      // Transaction details
      ...transactionDetails,
      amount: formattedAmount,
      
      // Options
      ...(options?.email_confirmation !== undefined && {
        email_confirmation: options.email_confirmation ? 1 : 0,
      }),
      ...(options?.confirmation_address && {
        confirmation_address: options.confirmation_address,
      }),
      ...(options?.payment_method && {
        payment_method: options.payment_method,
      }),
    };
  }

  private validatePaymentRequest(
    customerDetails: CustomerDetails,
    transactionDetails: TransactionDetails,
    options: { requireEmailOrPhone?: boolean } = {}
  ): ValidationResult {
    const errors: string[] = [];

    if (!transactionDetails.amount || transactionDetails.amount <= 0) {
      errors.push('Amount is required and must be greater than 0');
    }

    if (!transactionDetails.item_name) {
      errors.push('Item name is required');
    }

    if (options.requireEmailOrPhone) {
      if (!customerDetails.email_address && !customerDetails.cell_number) {
        errors.push('Either email address or cell number is required for onsite payments');
      }
    }

    if (transactionDetails.amount) {
      const amountStr = transactionDetails.amount.toString();
      if (!/^\d+(\.\d{1,2})?$/.test(amountStr)) {
        errors.push('Amount must be a valid decimal number with up to 2 decimal places');
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  private handleError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    return 'An unknown error occurred';
  }
}

// Singleton instance
export const payFastService = new PayFastPaymentService();
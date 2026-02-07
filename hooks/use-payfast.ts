import { useState, useCallback } from 'react';
import { PaymentResponse } from '@/lib/payfast/types';

interface UsePayfastOptions {
  onSuccess?: (response: PaymentResponse) => void;
  onError?: (error: string) => void;
  onPending?: (response: PaymentResponse) => void;
}

export function usePayfast(options: UsePayfastOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPayment = useCallback(
    async (paymentData: any, paymentType: 'standard' | 'onsite' = 'standard') => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/payments/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...paymentData,
            paymentType,
          }),
        });

        const result: PaymentResponse = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Payment creation failed');
        }

        if (!result.success) {
          throw new Error(result.error || 'Payment creation failed');
        }

        // Handle different response types
        if (paymentType === 'standard' && result.formHtml) {
          // For standard payments, create a form and submit it
          const formContainer = document.createElement('div');
          formContainer.innerHTML = result.formHtml;
          document.body.appendChild(formContainer);
          const form = formContainer.querySelector('form');
          form?.submit();
        } else if (paymentType === 'onsite' && result.paymentId) {
          // For onsite payments, we'll need to trigger the modal
          options.onSuccess?.(result);
        }

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Payment failed';
        setError(errorMessage);
        options.onError?.(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  const triggerOnsitePayment = useCallback(
    (uuid: string, returnUrl?: string, cancelUrl?: string) => {
      // This assumes you've already loaded the PayFast engine.js script
      if (typeof window !== 'undefined' && (window as any).payfast_do_onsite_payment) {
        const config: any = { uuid };
        if (returnUrl) config.return_url = returnUrl;
        if (cancelUrl) config.cancel_url = cancelUrl;
        
        (window as any).payfast_do_onsite_payment(config);
      } else {
        throw new Error('PayFast engine.js not loaded');
      }
    },
    []
  );

  const triggerOnsitePaymentWithCallback = useCallback(
    (uuid: string, callback: (result: boolean) => void) => {
      if (typeof window !== 'undefined' && (window as any).payfast_do_onsite_payment) {
        (window as any).payfast_do_onsite_payment({ uuid }, callback);
      } else {
        throw new Error('PayFast engine.js not loaded');
      }
    },
    []
  );

  return {
    createPayment,
    triggerOnsitePayment,
    triggerOnsitePaymentWithCallback,
    isLoading,
    error,
  };
}
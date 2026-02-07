export interface PayFastConfig {
  merchantId: string;
  merchantKey: string;
  passPhrase?: string;
  environment: 'sandbox' | 'production';
}

export const getPayFastConfig = (): PayFastConfig => {
  // Load from environment variables with fallbacks
  return {
    merchantId: process.env.PAYFAST_MERCHANT_ID!,
    merchantKey: process.env.PAYFAST_MERCHANT_KEY!,
    passPhrase: process.env.PAYFAST_PASSPHRASE,
    environment: (process.env.PAYFAST_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production',
  };
};

export const getPayFastUrls = (environment: 'sandbox' | 'production') => {
  const baseUrls = {
    sandbox: 'https://sandbox.payfast.co.za',
    production: 'https://www.payfast.co.za',
  };

  const baseUrl = baseUrls[environment];

  return {
    baseUrl,
    processUrl: `${baseUrl}/eng/process`,
    onsiteProcessUrl: `${baseUrl}/onsite/process`,
    validateUrl: `${baseUrl}/eng/query/validate`,
    engineJsUrl: `${baseUrl}/onsite/engine.js`,
  };
};
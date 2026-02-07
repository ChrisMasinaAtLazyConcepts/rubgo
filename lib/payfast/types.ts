export interface CustomerDetails {
  name_first?: string;
  name_last?: string;
  email_address: string;
  cell_number?: string;
  fica_idnumber?: string;
}

// In ./lib/payfast/types.ts
export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  validatedData?: any; // Add this property
}

export interface TransactionDetails {
  m_payment_id?: string;
  pf_payment_id: string;      // Missing in your object
  payment_status: string;     // Missing in your object  
  item_name: string;         // Missing in your object
  merchant_id: string;       // Missing in your object
  signature: string;         // Missing in your object
  amount: number;
  item_name: string;
  item_description?: string;
  custom_int1?: number;
  custom_int2?: number;
  custom_int3?: number;
  custom_int4?: number;
  custom_int5?: number;
  custom_str1?: string;
  custom_str2?: string;
  custom_str3?: string;
  custom_str4?: string;
  custom_str5?: string;
}

export interface MerchantDetails {
  merchant_id: string;
  merchant_key: string;
  return_url?: string;
  cancel_url?: string;
  notify_url?: string;
}

export interface TransactionOptions {
  email_confirmation?: boolean;
  confirmation_address?: string;
  payment_method?: PaymentMethod;
}

export type PaymentMethod = 
  | 'cc'    // Credit card
  | 'dc'    // Debit card
  | 'ef'    // EFT
  | 'mp'    // Masterpass Scan to Pay
  | 'mc'    // Mobicred
  | 'sc'    // SCode
  | 'ss'    // SnapScan
  | 'zp'    // Zapper
  | 'mt'    // MoreTyme
  | 'rc'    // Store card
  | 'mu'    // Mukuru
  | 'ap'    // Apple Pay
  | 'sp'    // Samsung Pay
  | 'cp'    // Capitec Pay
  | 'gp'    // Google Pay
  | 'pf';   // Payflex

export interface PaymentRequest {
  merchantDetails: MerchantDetails;
  customerDetails: CustomerDetails;
  transactionDetails: TransactionDetails;
  options?: TransactionOptions;
}

// In ./lib/payfast/types.ts
export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  error?: string;
  
  // For standard payments
  formHtml?: string;
  redirectUrl?: string;
  
  // For onsite payments
  onsiteData?: any; // Add this property
  
  // For status checks
  status?: string;
  details?: any;
  
  // For cancellations
  cancelled?: boolean;
  
  // For refunds
  refundId?: string;
  refundedAmount?: number;
}

export interface OnsitePaymentResponse {
  uuid: string;
  status: string;
  payment_id?: string;
  [key: string]: any;
}
export interface NotificationData {
  m_payment_id?: string;
  pf_payment_id: string;
  payment_status: 'COMPLETE' | 'CANCELLED';
  item_name: string;
  item_description?: string;
  amount_gross: number;
  amount_fee?: number;
  amount_net?: number;
  custom_int1?: number;
  custom_int2?: number;
  custom_int3?: number;
  custom_int4?: number;
  custom_int5?: number;
  custom_str1?: string;
  custom_str2?: string;
  custom_str3?: string;
  custom_str4?: string;
  custom_str5?: string;
  name_first?: string;
  name_last?: string;
  email_address?: string;
  merchant_id: string;
  signature: string;
  token?: string;
  billing_date?: string;
}

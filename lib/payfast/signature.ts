import crypto from 'crypto';

export class SignatureService {
  static generateSignature(
    data: Record<string, any>,
    passPhrase?: string
  ): string {
    // Create parameter string in the order fields appear in the documentation
    let pfOutput = '';
    
    // Filter out empty values and construct the parameter string
    const keys = Object.keys(data);
    for (const key of keys) {
      const value = data[key];
      if (value !== undefined && value !== null && value !== '') {
        const encodedValue = encodeURIComponent(value.toString().trim())
          .replace(/%20/g, '+')
          .toUpperCase(); // PayFast requires uppercase URL encoding
        pfOutput += `${key}=${encodedValue}&`;
      }
    }

    // Remove last ampersand
    let getString = pfOutput.slice(0, -1);
    
    // Add passphrase if provided
    if (passPhrase) {
      const encodedPassPhrase = encodeURIComponent(passPhrase.trim())
        .replace(/%20/g, '+')
        .toUpperCase();
      getString += `&passphrase=${encodedPassPhrase}`;
    }

    // Generate MD5 hash
    return crypto.createHash('md5').update(getString).digest('hex');
  }

  static validateNotificationSignature(
    data: Record<string, any>,
    passPhrase?: string
  ): boolean {
    // Recreate the parameter string without the signature field
    let pfParamString = '';
    
    const keys = Object.keys(data);
    for (const key of keys) {
      if (key === 'signature') continue;
      
      const value = data[key];
      if (value !== undefined && value !== null && value !== '') {
        const encodedValue = encodeURIComponent(value.toString().trim())
          .replace(/%20/g, '+')
          .toUpperCase();
        pfParamString += `${key}=${encodedValue}&`;
      }
    }

    // Remove last ampersand
    let getString = pfParamString.slice(0, -1);
    
    // Add passphrase if provided
    if (passPhrase) {
      const encodedPassPhrase = encodeURIComponent(passPhrase.trim())
        .replace(/%20/g, '+')
        .toUpperCase();
      getString += `&passphrase=${encodedPassPhrase}`;
    }

    // Generate MD5 hash and compare with received signature
    const calculatedSignature = crypto
      .createHash('md5')
      .update(getString)
      .digest('hex');
    
    return data.signature === calculatedSignature;
  }
}
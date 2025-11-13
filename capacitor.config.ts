import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'za.co.rubhub',
  appName: 'RubHub',
  webDir: 'dist', // Use 'out' for Next.js build output
  server: {
    url: 'http://192.168.0.81:3000', // Your computer's IP for development
    cleartext: true, // Allow HTTP traffic
    androidScheme: 'https' // Fallback for production
  },
  android: {
    allowMixedContent: true // Allow HTTP content in WebView
  }
};

export default config;
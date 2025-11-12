// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rubhub.mobile',
  appName: 'RubHub',
  webDir: 'public', // Point to public directory
  server: {
    androidScheme: 'https',
    url: 'http://localhost:3000' // For development
  }
};

export default config;
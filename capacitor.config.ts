import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rubgo.app',
  appName: 'RubHub',
  webDir: 'dist',
  // Remove bundledWebRuntime: false - it's no longer needed
  android: {
    allowMixedContent: true
  },
  ios: {
    // Add iOS specific configuration if needed
  },
  server: {
    // Add server configuration if needed
    androidScheme: 'https'
  }
};

export default config;
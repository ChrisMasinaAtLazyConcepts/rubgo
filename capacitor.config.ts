import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rubhub.app',
  appName: 'RubHub',
  webDir: '.next',  // Changed from 'dist' to '.next'
  server: {
    androidScheme: 'https'
  },
  android: {
    buildOptions: {
      keystorePath: 'debug.keystore',
      keystoreAlias: 'androiddebugkey'
    }
  }
};

export default config;
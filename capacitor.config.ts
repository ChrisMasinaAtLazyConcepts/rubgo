import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rubhub.app',
  appName: 'RubHub',
  webDir: 'dist', 
  server: {
    androidScheme: 'https'
  },
  android: {
    buildOptions: {
      keystorePath: 'debug.keystore',
      keystoreAlias: 'androiddebugkey'
    }
  },
  ios: {
    scheme: 'App',
    minVersion: '15.0' 
  }
};

export default config;
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'za.co.rubhub',
  appName: 'RubHub',
  webDir: 'out',
  bundledWebRuntime: false,
  // Remove server config for production build
  android: {
    allowMixedContent: true
  }
};

export default config;
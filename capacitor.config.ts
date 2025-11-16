import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'za.co.rubhub.app',
  appName: 'RubHub',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
  // Remove the android buildOptions section for now
  // These are only needed for release builds and can cause issues in CI
};

export default config;
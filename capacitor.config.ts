import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rubgo.app',
  appName: 'RubHub',
  webDir: 'dist', // Changed from 'out' to 'dist' to match your workflow
  server: {
    androidScheme: 'https'
  }
  // Remove the android buildOptions section for now
  // These are only needed for release builds and can cause issues in CI
};

export default config;
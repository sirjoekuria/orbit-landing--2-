import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.orbit.landing',
  appName: 'Orbit Landing',
  webDir: 'dist/spa',
  server: {
    androidScheme: 'https',
    cleartext: true
  }
};

export default config;

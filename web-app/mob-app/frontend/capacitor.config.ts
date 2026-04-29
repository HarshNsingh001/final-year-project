import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.healthcloud.app',
  appName: 'HealthCloud',
  webDir: 'dist',
  server: {
    // Use http scheme so we can make cleartext calls to backend without mixed-content issues
    androidScheme: 'http',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;

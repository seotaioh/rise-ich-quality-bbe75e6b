import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rise.ichquality',
  appName: '품질관리시스템',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;

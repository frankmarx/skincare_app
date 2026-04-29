import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourname.skincareapp',
  appName: 'Skincare Ritual',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;

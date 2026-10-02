import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rakes.portfolio',
  appName: 'Rakeshwar Pandey',
  webDir: 'dist',
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    LocalNotifications: {
      smallIcon: "ic_launcher",
      iconColor: "#6366F1",
      sound: "beep.wav",
    },
  },
};

export default config;

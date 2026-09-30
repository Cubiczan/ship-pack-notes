import type { ConfigContext, ExpoConfig } from 'expo/config';

const iosKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || 'appl_XXX';
const androidKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || 'goog_XXX';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Ship Pack Notes',
  slug: 'ship-pack-notes',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'shippacknotes',
  userInterfaceStyle: 'dark',
  backgroundColor: '#101412',
  ios: {
    bundleIdentifier: 'com.cubiczan.shippacknotes',
    supportsTablet: true,
    icon: './assets/images/icon.png',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.cubiczan.shippacknotes',
    predictiveBackGestureEnabled: false,
    adaptiveIcon: {
      backgroundColor: '#101412',
      foregroundImage: './assets/images/android-icon-foreground.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
  },
  web: {
    bundler: 'metro',
    output: 'single',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#101412',
        image: './assets/images/splash-icon.png',
        imageWidth: 180,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    revenueCatIosApiKey: iosKey,
    revenueCatAndroidApiKey: androidKey,
    entitlementId: 'unlimited',
    productId: 'unlock_unlimited',
  },
});

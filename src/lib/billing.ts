import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const ENTITLEMENT_ID = 'unlimited';
export const PRODUCT_ID = 'unlock_unlimited';
export const OFFERING_ID = 'default';
export const PACKAGE_ID = '$rc_lifetime';

export type PurchaseMode = 'live' | 'mock';
export type StorePlatform = 'ios' | 'android' | 'web';

export type BillingSession = {
  mode: PurchaseMode;
  reason: string;
  platform: StorePlatform;
};

export type OfferingCard = {
  packageId: string;
  productId: string;
  title: string;
  description: string;
  priceString: string;
  packageType: string;
};

export type OfferingsPayload = {
  mode: PurchaseMode;
  offeringId: string | null;
  packages: OfferingCard[];
  entitlementActive: boolean;
};

export type PurchaseResult = {
  mode: PurchaseMode;
  entitlementActive: boolean;
  cancelled: boolean;
};

export type SdkOfferings = {
  offeringId: string | null;
  packages: OfferingCard[];
  entitlementActive: boolean;
};

export const MOCK_PACKAGE: OfferingCard = {
  packageId: PACKAGE_ID,
  productId: PRODUCT_ID,
  title: 'Unlock Unlimited',
  description: 'Lifetime access. One purchase, every ship pack after the free one.',
  priceString: '$19.99',
  packageType: 'LIFETIME',
};

const PLACEHOLDER_KEYS = new Set(['appl_xxx', 'goog_xxx', 'appl_yourkey', 'goog_yourkey']);

export function isPlaceholderKey(key: string | null | undefined): boolean {
  if (!key?.trim()) return true;
  const normalized = key.trim();
  if (PLACEHOLDER_KEYS.has(normalized.toLowerCase())) return true;
  if (/XXX/.test(normalized)) return true;
  if (/^(appl_|goog_)x+$/i.test(normalized)) return true;
  return false;
}

export function resolveApiKey(): { apiKey: string; placeholder: boolean; platform: StorePlatform } {
  const extra = (Constants.expoConfig?.extra ?? {}) as {
    revenueCatIosApiKey?: string;
    revenueCatAndroidApiKey?: string;
  };
  const ios = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || extra.revenueCatIosApiKey || 'appl_XXX';
  const android =
    process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || extra.revenueCatAndroidApiKey || 'goog_XXX';

  if (Platform.OS === 'android') {
    return { apiKey: android, placeholder: isPlaceholderKey(android), platform: 'android' };
  }
  if (Platform.OS === 'ios') {
    return { apiKey: ios, placeholder: isPlaceholderKey(ios), platform: 'ios' };
  }
  return { apiKey: ios, placeholder: isPlaceholderKey(ios) && isPlaceholderKey(android), platform: 'web' };
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return 'Something went wrong';
}

export function isPurchaseCancelled(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const candidate = error as { userCancelled?: boolean; code?: string | number };
  return candidate.userCancelled === true || candidate.code === '1' || candidate.code === 1;
}

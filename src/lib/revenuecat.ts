import Constants from 'expo-constants';
import { Platform } from 'react-native';

import {
  MOCK_PACKAGE,
  OFFERING_ID,
  errorMessage,
  isPurchaseCancelled,
  resolveApiKey,
  type BillingSession,
  type OfferingsPayload,
  type PurchaseResult,
} from '@/lib/billing';

export type { BillingSession };
import { isMockPremium, setMockPremium } from '@/lib/storage';

let sessionPromise: Promise<BillingSession> | null = null;

async function createSession(): Promise<BillingSession> {
  const key = resolveApiKey();
  const reasons: string[] = [];
  if (key.placeholder) {
    reasons.push('Public SDK keys are still placeholders (appl_XXX / goog_XXX).');
  }
  if (Platform.OS === 'web') {
    reasons.push('Web preview cannot call the native store.');
  } else if (Constants.appOwnership === 'expo') {
    reasons.push('Expo Go does not include the RevenueCat native module.');
  }
  if (reasons.length > 0) {
    return {
      mode: 'mock',
      platform: key.platform,
      reason: `${reasons.join(' ')} Purchases stay on this device.`,
    };
  }

  try {
    const sdk = await import('./purchases-sdk');
    await sdk.configurePurchases(key.apiKey);
    return {
      mode: 'live',
      platform: key.platform,
      reason: 'RevenueCat SDK configured.',
    };
  } catch (error) {
    return {
      mode: 'mock',
      platform: key.platform,
      reason: `Could not configure RevenueCat (${errorMessage(error)}). Purchases stay on this device.`,
    };
  }
}

export function configurePurchases(): Promise<BillingSession> {
  if (!sessionPromise) sessionPromise = createSession();
  return sessionPromise;
}

export async function getOfferings(): Promise<OfferingsPayload> {
  const session = await configurePurchases();
  if (session.mode === 'mock') {
    return {
      mode: 'mock',
      offeringId: OFFERING_ID,
      packages: [MOCK_PACKAGE],
      entitlementActive: await isMockPremium(),
    };
  }

  const sdk = await import('./purchases-sdk');
  const offerings = await sdk.fetchOfferings();
  return { mode: 'live', ...offerings };
}

export async function purchasePackage(packageId: string): Promise<PurchaseResult> {
  const session = await configurePurchases();
  if (session.mode === 'mock') {
    await setMockPremium(true);
    return { mode: 'mock', entitlementActive: true, cancelled: false };
  }

  try {
    const sdk = await import('./purchases-sdk');
    const purchased = await sdk.purchaseSelectedPackage(packageId);
    return { mode: 'live', entitlementActive: purchased.entitlementActive, cancelled: false };
  } catch (error) {
    if (isPurchaseCancelled(error)) {
      return { mode: 'live', entitlementActive: false, cancelled: true };
    }
    throw error;
  }
}

export async function restorePurchases(): Promise<PurchaseResult> {
  const session = await configurePurchases();
  if (session.mode === 'mock') {
    return { mode: 'mock', entitlementActive: await isMockPremium(), cancelled: false };
  }
  const sdk = await import('./purchases-sdk');
  const restored = await sdk.restoreStorePurchases();
  return { mode: 'live', entitlementActive: restored.entitlementActive, cancelled: false };
}

export async function readEntitlement(): Promise<boolean> {
  const session = await configurePurchases();
  if (session.mode === 'mock') return isMockPremium();
  try {
    const offerings = await getOfferings();
    return offerings.entitlementActive;
  } catch {
    return false;
  }
}

export async function resetPreviewUnlock(): Promise<void> {
  await setMockPremium(false);
}

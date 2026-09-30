import type { SdkOfferings } from '@/lib/billing';

const UNAVAILABLE = 'RevenueCat native module is unavailable on this platform.';

export async function configurePurchases(_apiKey: string): Promise<void> {
  throw new Error(UNAVAILABLE);
}

export async function fetchOfferings(): Promise<SdkOfferings> {
  throw new Error(UNAVAILABLE);
}

export async function purchaseSelectedPackage(_packageId: string): Promise<{ entitlementActive: boolean }> {
  throw new Error(UNAVAILABLE);
}

export async function restoreStorePurchases(): Promise<{ entitlementActive: boolean }> {
  throw new Error(UNAVAILABLE);
}

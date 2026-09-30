import Purchases, { PACKAGE_TYPE, type CustomerInfo, type PurchasesPackage } from 'react-native-purchases';

import { ENTITLEMENT_ID, PRODUCT_ID, type SdkOfferings } from '@/lib/billing';

const packages = new Map<string, PurchasesPackage>();
let configuredKey: string | null = null;

function entitlementActive(info: CustomerInfo): boolean {
  return Boolean(info.entitlements.active[ENTITLEMENT_ID]);
}

function rank(pack: PurchasesPackage): number {
  if (pack.packageType === PACKAGE_TYPE.LIFETIME) return 0;
  if (pack.product.identifier === PRODUCT_ID) return 1;
  return 2;
}

export async function configurePurchases(apiKey: string): Promise<void> {
  if (configuredKey === apiKey) return;
  await Purchases.setLogLevel(__DEV__ ? Purchases.LOG_LEVEL.DEBUG : Purchases.LOG_LEVEL.INFO);
  Purchases.configure({ apiKey });
  configuredKey = apiKey;
}

export async function fetchOfferings(): Promise<SdkOfferings> {
  const offerings = await Purchases.getOfferings();
  const info = await Purchases.getCustomerInfo();
  packages.clear();

  const current = offerings.current;
  const available = [...(current?.availablePackages ?? [])].sort((a, b) => rank(a) - rank(b));
  for (const pack of available) packages.set(pack.identifier, pack);

  return {
    offeringId: current?.identifier ?? null,
    entitlementActive: entitlementActive(info),
    packages: available.map((pack) => ({
      packageId: pack.identifier,
      productId: pack.product.identifier,
      title: pack.product.title || 'Unlock Unlimited',
      description: pack.product.description || 'Lifetime access to unlimited ship packs.',
      priceString: pack.product.priceString,
      packageType: pack.packageType,
    })),
  };
}

export async function purchaseSelectedPackage(packageId: string): Promise<{ entitlementActive: boolean }> {
  const selected = packages.get(packageId);
  if (!selected) {
    throw new Error('That package is not in the current offering. Reload the paywall and try again.');
  }
  const { customerInfo } = await Purchases.purchasePackage(selected);
  return { entitlementActive: entitlementActive(customerInfo) };
}

export async function restoreStorePurchases(): Promise<{ entitlementActive: boolean }> {
  const info = await Purchases.restorePurchases();
  return { entitlementActive: entitlementActive(info) };
}

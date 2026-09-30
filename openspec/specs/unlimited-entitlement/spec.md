# unlimited-entitlement

## Purpose

Unlock unlimited ship packs with a RevenueCat lifetime purchase, and keep the paywall usable when the native SDK cannot run.

## Requirements

### Requirement: Lifetime unlock

The paywall SHALL sell a non-consumable lifetime product `unlock_unlimited` that grants entitlement `unlimited`. While that entitlement is active, generating packs SHALL NOT be limited to one.

#### Scenario: Entitlement active

- GIVEN the unlimited entitlement is active
- WHEN the person generates another ask
- THEN a new pack is saved without opening the paywall

### Requirement: Live RevenueCat purchase

When a real public SDK key is configured and the native module is available, the paywall SHALL call Purchases.configure, Purchases.getOfferings, and Purchases.purchasePackage. Restore SHALL call Purchases.restorePurchases. The app SHALL treat the purchase as unlocked only when entitlement `unlimited` is active.

#### Scenario: Purchase without the entitlement attached

- GIVEN the store purchase succeeds and entitlement unlimited is not active
- WHEN the paywall finishes
- THEN the app tells the person to attach unlock_unlimited to the unlimited entitlement and does not treat them as unlocked

### Requirement: Preview mode

The paywall SHALL run in preview mode, without calling the native SDK, when the API key is missing or a placeholder (`appl_XXX`, `goog_XXX`, or any key containing `XXX`), when the app is running on web, or when it is running in Expo Go. A preview purchase SHALL unlock unlimited only on that device. Reset preview unlock SHALL restore the free limit.

#### Scenario: Placeholder key in Expo Go

- GIVEN the iOS key is appl_XXX
- WHEN the paywall opens
- THEN the person sees preview mode, a lifetime Unlock Unlimited offer, and can unlock locally

#### Scenario: Restore with no preview purchase

- GIVEN preview mode and no local unlock
- WHEN the person restores
- THEN the app reports that there is no unlock on this device

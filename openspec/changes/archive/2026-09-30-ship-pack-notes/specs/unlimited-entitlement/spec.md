## ADDED Requirements

### Requirement: Lifetime unlock

The paywall SHALL sell a non-consumable lifetime product `unlock_unlimited` that grants entitlement `unlimited`. While that entitlement is active, generating packs SHALL NOT be limited to one.

#### Scenario: Entitlement active

- GIVEN the unlimited entitlement is active
- WHEN the person generates another ask
- THEN a new pack is saved without opening the paywall

### Requirement: Live RevenueCat purchase

When a real public SDK key is configured and the native module is available, the paywall SHALL call Purchases.configure, Purchases.getOfferings, and Purchases.purchasePackage. Restore SHALL call Purchases.restorePurchases.

#### Scenario: Purchase without the entitlement attached

- GIVEN the store purchase succeeds and entitlement unlimited is not active
- WHEN the paywall finishes
- THEN the app does not treat the person as unlocked

### Requirement: Preview mode

The paywall SHALL run in preview mode when the API key is missing or a placeholder, on web, or in Expo Go. A preview purchase SHALL unlock unlimited only on that device.

#### Scenario: Placeholder key in Expo Go

- GIVEN the iOS key is appl_XXX
- WHEN the paywall opens
- THEN the person sees preview mode and can unlock locally

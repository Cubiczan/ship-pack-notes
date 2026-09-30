# Design

## Decision

Generate packs with local heuristics, not a model API. The pack has to work on a plane and in a demo with no keys. Signals such as Slack, widgets, payments, and realtime sync choose a fake door. A local slice chooses build today. Taglines are clamped to 60 characters.

## Decision

One non-consumable product, not a subscription. Entitlement id `unlimited`. Product id `unlock_unlimited`. Offering id `default`, package type Lifetime. The paywall prefers the lifetime package from the current offering and falls back to the first package.

## Decision

Preview mode is a separate local flag from the RevenueCat entitlement. Placeholder keys, web, and Expo Go never import the native module, so Expo Go cannot crash on a null `RNPurchases`. A real key in an EAS build uses `Purchases.configure`, `getOfferings`, `purchasePackage`, and `restorePurchases`. A live purchase only unlocks the desk when `customerInfo.entitlements.active.unlimited` is set.

## Not doing

- Accounts, sync, or a server.
- RevenueCat Paywalls UI. The screen is ours so the purchase calls stay visible.
- Secret API keys in the client. Only public `appl_` / `goog_` keys, defaulting to `appl_XXX` / `goog_XXX`.

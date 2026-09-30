# Proposal

## Why

Feature asks stall because the scope, the “should we even build this” call, and the words for the changelog are still blank at the end of the day. Ship Pack Notes cuts that pack on the device so a person can ship or fake-door before tonight.

## What changes

- A desk that turns one ask into scope, a build vs fake-door call, a changelog, a Product Hunt tagline, and replies.
- A free limit of one pack, then a RevenueCat lifetime paywall for entitlement `unlimited`.
- Preview purchases when the public SDK key is still a placeholder or the native module is missing (Expo Go, web).

## Capabilities

### New

- `ship-pack-generator`: on-device pack and the free limit.
- `unlimited-entitlement`: RevenueCat lifetime unlock and preview mode.

### Modified

- None. This is the first product slice.

## Impact

- Expo app `com.cubiczan.shippacknotes`, `react-native-purchases`, local AsyncStorage.
- No backend. Store products `unlock_unlimited` still have to be created before a live charge works.

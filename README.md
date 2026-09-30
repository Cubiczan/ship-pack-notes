# Ship Pack Notes

Paste a feature ask. Get a same-day ship pack: scope, a build-or-fake-door call, a changelog line, a Product Hunt tagline, and three replies. The generator runs on the device. Nothing is sent to a server.

The first pack is free. **Unlock Unlimited** is a one-time, non-consumable purchase through RevenueCat (entitlement `unlimited`, product `unlock_unlimited`).

Bundle ID / Android package: `com.cubiczan.shippacknotes`

## Run

```bash
npm install
npm start
```

Web preview (no store required):

```bash
npx expo start --web --port 43123
```

iOS simulator and Android need a local SDK. Expo Go is enough to try the desk and the paywall: placeholder keys stay in preview mode, so purchase is simulated on the device.

```bash
npm test
npm run typecheck
```

## RevenueCat keys

Copy `.env.example` to `.env` and replace the placeholders with the **public SDK keys** from the RevenueCat project (Project settings → API keys). Do not put a secret REST key (`sk_...`) in the app.

```bash
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_XXX
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_XXX
```

| Key state | What the paywall does |
| --- | --- |
| `appl_XXX` / `goog_XXX`, missing, or still containing `XXX` | Preview mode. `purchasePackage` unlocks unlimited locally. |
| Real key, but you are in Expo Go or on web | Preview mode. Expo Go has no native purchases module. |
| Real key in an EAS dev, preview, or production build | Live mode. The paywall calls `Purchases.configure`, `Purchases.getOfferings`, and `Purchases.purchasePackage`. |

Restart Metro after changing `.env`. For store builds, set the same `EXPO_PUBLIC_*` variables in EAS before you build, or the binary keeps the placeholder and stays in preview mode.

Store setup, TestFlight, Play internal testing, the demo video, and Devpost copy are in [SHIPATON.md](SHIPATON.md).

## What’s in the app

- Desk: paste an ask, or start from a sample, and cut a pack.
- Manifest: scope, the call, changelog, Product Hunt line, replies, and copy.
- Packs: local history (AsyncStorage). No account.
- Paywall: lifetime Unlock Unlimited, restore, and a preview reset so you can demo the free limit again.

Product decisions live in `openspec/specs/`.

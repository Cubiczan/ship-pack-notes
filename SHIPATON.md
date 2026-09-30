# Shipaton tonight

Do these in order. One platform is enough if the other store account is not ready. The video has to show the app running.

Public SDK keys only. `appl_...` and `goog_...` belong in the app. A secret key (`sk_...`) does not.

Identifiers already in the project:

| Thing | Value |
| --- | --- |
| App name | Ship Pack Notes |
| Bundle ID / package | `com.cubiczan.shippacknotes` |
| Entitlement | `unlimited` |
| Product (non-consumable / one-time) | `unlock_unlimited` |
| Offering | `default` (mark it **Current**) |
| Package | Lifetime → `unlock_unlimited` |
| Price to mirror in the stores | $19.99 (the preview card uses this; the live card uses the store price) |

## 1. RevenueCat project

1. Create a project named **Ship Pack Notes** at [app.revenuecat.com](https://app.revenuecat.com).
2. Add an App Store app with bundle ID `com.cubiczan.shippacknotes`.
3. Add a Play Store app with package `com.cubiczan.shippacknotes`.
4. Copy the **public** Apple SDK key and Google SDK key.
5. Put them in `.env` (see `.env.example`) and in EAS before the build you will record:

   ```bash
   eas env:create --name EXPO_PUBLIC_REVENUECAT_IOS_API_KEY --value appl_YOUR_PUBLIC_KEY --environment production --visibility plaintext
   eas env:create --name EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY --value goog_YOUR_PUBLIC_KEY --environment production --visibility plaintext
   ```

   Repeat for the `preview` environment if that is the build you will install tonight.
6. Entitlements → new entitlement → identifier `unlimited`.
7. Products → import or create `unlock_unlimited` on each store (steps 2 and 3 below), then attach both to `unlimited`.
8. Offerings → offering identifier `default` → add a **Lifetime** package whose product is `unlock_unlimited` → set the offering as **Current**.
9. If App Store Connect is not finished, turn on the RevenueCat **Test Store** and use its public SDK key in a dev build. Expo Go still will not run the native SDK. Test Store purchases need an EAS build.

The paywall calls, in `src/lib/purchases-sdk.native.ts`:

- `Purchases.configure({ apiKey })`
- `Purchases.getOfferings()`
- `Purchases.purchasePackage(selected)`
- `Purchases.restorePurchases()`

Preview mode skips those calls on purpose when the key is missing, is `appl_XXX` / `goog_XXX`, or the native module is not there.

## 2. App Store Connect

1. Agreements, Tax, and Banking are signed. Paid Apps is active. Without this, the product cannot be created.
2. Identifiers → register App ID `com.cubiczan.shippacknotes` (explicit, In-App Purchase capability on).
3. New app → iOS → name **Ship Pack Notes** → that bundle ID → SKU `shippacknotes`.
4. In-App Purchases → **Non-Consumable** → product ID `unlock_unlimited` → display name **Unlock Unlimited** → price **$19.99**.
5. Add a localization and a review screenshot of the paywall. Submit the product. It can stay “Waiting for Review” and still work in sandbox once the metadata is complete.
6. App Store Connect → Users and Access → Sandbox → create a tester. Sign out of the real App Store on the device, and buy as the sandbox user.
7. RevenueCat → Apple app → In-app purchase key (.p8, issuer ID, key ID). This lets RevenueCat see the product.
8. App Privacy: data not collected by us. Purchases are processed by Apple. Privacy policy URL: host [PRIVACY.md](PRIVACY.md) (GitHub raw or a gist) and paste that URL.
9. Age rating: no restricted content. Encryption: already `ITSAppUsesNonExemptEncryption` false in `app.config.ts`.
10. Screenshots: 6.7" iPhone is the one judges notice. Dark desk, a filled manifest, then the paywall.

Subtitle you can paste: `Same-day scope for one feature ask`

Description you can paste:

```text
Paste a feature ask. Ship Pack Notes cuts a same-day pack on your device: scope bullets, a build-or-fake-door call, a changelog line, a Product Hunt tagline, and replies you can send.

The first pack is free. Unlock Unlimited is a one-time purchase for every pack after that. Notes stay on the device. There is no account.
```

## 3. Google Play

1. Create the app in Play Console. Package name `com.cubiczan.shippacknotes`. App name **Ship Pack Notes**.
2. Finish the dashboard blockers that stop you publishing an internal track: privacy policy URL (the hosted PRIVACY.md), app access (no login), ads (no), content rating, target audience, data safety.
3. Data safety: no data collected by the developer. Purchases are handled by Google Play. If the RevenueCat SDK disclosure requires “purchase history,” answer to match the SDK’s current data safety form, not this paragraph.
4. Monetize → Products → **One-time products** → product ID `unlock_unlimited` → name **Unlock Unlimited** → **$19.99** → activate.
5. RevenueCat → Google app → upload a Play Console service account JSON with the Financial data permission, and grant that user access in Play Console.
6. Setup → License testing → add the Gmail accounts that will buy in internal testing.
7. Internal testing track → upload the AAB from EAS → add testers → copy the opt-in link.

## 4. EAS build

Install a dev client only if you want the `development` profile. Preview and production do not need it. Expo Go cannot load `react-native-purchases`.

```bash
npm install -g eas-cli
eas login
eas init
```

`eas init` writes `extra.eas.projectId` into the config. Commit that.

Put the public SDK keys in EAS (step 1) **before** this build.

```bash
# Fastest install tonight: Android APK you can sideload
eas build -p android --profile preview

# iOS device / TestFlight
eas build -p ios --profile production
eas submit -p ios --profile production
```

Android internal track:

```bash
eas build -p android --profile production
eas submit -p android --profile production
```

Then open the internal-testing opt-in link on the phone.

If `Purchases.configure` throws because `RNPurchases` is null, you are still in Expo Go, or the native module did not rebuild. Make a new EAS build. Do not expect Expo Go to switch into live mode.

## 5. Demo video (under 3 minutes)

Record the phone screen, or a simulator window that is clearly the app. No copyrighted music. Upload to YouTube or Vimeo as **unlisted** and paste the link on Devpost. Judges are only required to watch three minutes; say the point in the first minute.

| Time | Shot |
| --- | --- |
| 0:00 | Desk. Read the ask out loud: a feature someone wants today. |
| 0:15 | Tap an example or paste. Generate. Scroll the manifest: scope, BUILD TODAY or FAKE DOOR, changelog, Product Hunt line, a reply. Copy the pack. |
| 0:45 | Try a second ask. The free pack is used. Paywall opens. |
| 1:05 | Say the product: Unlock Unlimited, lifetime, entitlement `unlimited`. In preview, tap Preview purchase and show the second pack generate. In a store build, complete the sandbox purchase instead. |
| 1:30 | One sentence: the generator never leaves the device; RevenueCat only unlocks the limit. End on the manifest. |

If the sandbox product is not ready, record preview mode and say so in the description. A live sandbox purchase is stronger if you can get the EAS build installed.

## 6. Devpost fields

**Project name:** Ship Pack Notes

**Tagline:** Paste a feature ask and get a same-day ship pack: scope, build vs fake door, changelog, Product Hunt line, and replies.

**Built with:** Expo, React Native, TypeScript, RevenueCat

**Try it out:** TestFlight link, Play internal-testing link, and this repo. Web is a preview; the native build is the submission.

**Description:**

```text
Ship Pack Notes is a same-day shipping desk for one feature ask.

You paste what someone wants. On the device, it cuts a pack you can actually use tonight: five scope bullets, a call to build it or put up a fake door, a changelog line, a Product Hunt tagline under 60 characters, and three replies (the asker, design, and the defer). Copy any block, or the whole pack as markdown.

The first pack is free. Unlock Unlimited is a non-consumable lifetime purchase. RevenueCat entitlement `unlimited` is tied to product `unlock_unlimited` in the current `default` offering. The paywall configures the SDK, loads offerings, purchases the lifetime package, and can restore. With placeholder keys, or in Expo Go, the same screen runs in preview mode so the desk still works. There is no backend and no account. Packs stay in local storage.

Built for RevenueCat Shipaton 2026.
```

**RevenueCat paragraph** (if the form asks what you used):

```text
react-native-purchases. Entitlement unlimited. Non-consumable product unlock_unlimited, sold as the Lifetime package on the current offering. The paywall calls Purchases.configure, getOfferings, purchasePackage, and restorePurchases. Placeholder public keys (appl_XXX / goog_XXX) keep Expo Go in a local preview unlock so the UI is demonstrable before store products are approved.
```

## 7. Check before you hit submit

- [ ] Public SDK keys are in the binary you recorded (not `appl_XXX`, unless you are honest that the video is preview mode).
- [ ] Entitlement `unlimited` is active after a sandbox or Test Store purchase. If the paywall says the entitlement is missing, the product is not attached.
- [ ] Offering `default` is Current and has a Lifetime package.
- [ ] The video shows a second pack only after unlock.
- [ ] Privacy policy URL loads.
- [ ] Devpost has the video link, the install link, and the description above.

import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, SecondaryButton } from '@/components/buttons';
import { Screen } from '@/components/screen';
import { colors, font } from '@/constants/theme';
import { ENTITLEMENT_ID, PRODUCT_ID, errorMessage, type OfferingCard } from '@/lib/billing';
import {
  configurePurchases,
  getOfferings,
  purchasePackage,
  resetPreviewUnlock,
  restorePurchases,
} from '@/lib/revenuecat';
import { useAppState } from '@/state/app-state';

type Phase = 'loading' | 'ready' | 'purchasing' | 'restoring' | 'error';

export default function PaywallScreen() {
  const { session, premium, refreshPremium, draft, generate } = useAppState();
  const [phase, setPhase] = useState<Phase>('loading');
  const [packages, setPackages] = useState<OfferingCard[]>([]);
  const [offeringId, setOfferingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setPhase('loading');
    setError(null);
    try {
      await configurePurchases();
      const offerings = await getOfferings();
      setPackages(offerings.packages);
      setOfferingId(offerings.offeringId);
      setSelectedId(offerings.packages[0]?.packageId ?? null);
      if (offerings.entitlementActive) await refreshPremium();
      setPhase('ready');
    } catch (loadError) {
      setError(errorMessage(loadError));
      setPhase('error');
    }
  }, [refreshPremium]);

  useEffect(() => {
    void load();
  }, [load]);

  const onPurchase = async () => {
    if (!selectedId) return;
    setPhase('purchasing');
    setMessage(null);
    setError(null);
    try {
      const result = await purchasePackage(selectedId);
      const unlocked = await refreshPremium();
      if (result.cancelled) {
        setMessage('Purchase cancelled.');
      } else if (result.entitlementActive || unlocked) {
        setMessage(
          result.mode === 'mock'
            ? 'Preview unlock is on. Unlimited packs stay on this device.'
            : 'Unlimited is unlocked. The lifetime entitlement is active.',
        );
      } else {
        setMessage(
          `Purchase finished, but “${ENTITLEMENT_ID}” is not active. Attach ${PRODUCT_ID} to that entitlement in RevenueCat.`,
        );
      }
      setPhase('ready');
    } catch (purchaseError) {
      setError(errorMessage(purchaseError));
      setPhase('error');
    }
  };

  const onRestore = async () => {
    setPhase('restoring');
    setMessage(null);
    setError(null);
    try {
      const result = await restorePurchases();
      const unlocked = await refreshPremium();
      if (result.entitlementActive || unlocked) {
        setMessage(result.mode === 'mock' ? 'Preview unlock restored on this device.' : 'Unlimited restored.');
      } else {
        setMessage(
          result.mode === 'mock'
            ? 'No preview unlock on this device yet.'
            : 'No unlimited purchase to restore for this store account.',
        );
      }
      setPhase('ready');
    } catch (restoreError) {
      setError(errorMessage(restoreError));
      setPhase('error');
    }
  };

  const onResetPreview = async () => {
    await resetPreviewUnlock();
    await refreshPremium();
    setMessage('Preview unlock cleared. The free pack limit applies again.');
  };

  const selected = packages.find((pack) => pack.packageId === selectedId) ?? null;
  const mock = session?.mode !== 'live';

  return (
    <Screen>
      <Text style={styles.kicker}>{mock ? 'PREVIEW MODE' : 'LIVE STORE'}</Text>
      <Text style={styles.title}>Unlock Unlimited</Text>
      <Text style={styles.lead}>
        The first ship pack is free. After that, one non-consumable purchase opens every ask on this device.
      </Text>

      <View style={styles.list}>
        {['Unlimited same-day packs', 'History stays on this device', 'Copy-ready scope, changelog, and replies'].map(
          (item) => (
            <View key={item} style={styles.benefit}>
              <Text style={styles.benefitMark}>▸</Text>
              <Text style={styles.benefitText}>{item}</Text>
            </View>
          ),
        )}
      </View>

      {session ? <Text style={styles.reason}>{session.reason}</Text> : null}

      {phase === 'loading' || phase === 'purchasing' || phase === 'restoring' ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.amber} />
          <Text style={styles.loadingText}>
            {phase === 'purchasing'
              ? 'Contacting the store…'
              : phase === 'restoring'
                ? 'Restoring purchases…'
                : 'Checking the offering…'}
          </Text>
        </View>
      ) : null}

      {phase === 'error' ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>The offering didn’t load.</Text>
          <Text style={styles.errorBody}>{error}</Text>
          <SecondaryButton label="Try again" onPress={() => void load()} />
        </View>
      ) : null}

      {phase === 'ready' && packages.length === 0 ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>No current offering.</Text>
          <Text style={styles.errorBody}>
            In RevenueCat, create offering “default”, attach the {PRODUCT_ID} lifetime package, and mark the offering
            current.
          </Text>
          <SecondaryButton label="Check again" onPress={() => void load()} />
        </View>
      ) : null}

      {phase === 'ready'
        ? packages.map((pack) => {
            const active = pack.packageId === selectedId;
            return (
              <Pressable
                key={pack.packageId}
                accessibilityRole="button"
                onPress={() => setSelectedId(pack.packageId)}
                style={[styles.card, active && styles.cardOn]}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle}>{pack.title}</Text>
                  <Text style={styles.price}>{pack.priceString}</Text>
                </View>
                <Text style={styles.cardBody}>{pack.description}</Text>
                <Text style={styles.cardMeta}>
                  {pack.packageType} · {pack.productId}
                </Text>
              </Pressable>
            );
          })
        : null}

      {phase === 'ready' && selected ? (
        <PrimaryButton
          label={premium ? 'Unlimited is active' : mock ? `Preview ${selected.title}` : `Purchase ${selected.title}`}
          onPress={() => void onPurchase()}
          disabled={premium}
        />
      ) : null}

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <SecondaryButton
        label="Restore purchases"
        onPress={() => void onRestore()}
      />

      {premium && draft.trim().length >= 8 ? (
        <SecondaryButton
          label="Cut the saved ask"
          onPress={() => {
            void (async () => {
              const result = await generate(draft);
              if (result.ok) {
                router.replace({ pathname: '/pack/[id]', params: { id: result.pack.id } });
                return;
              }
              router.replace('/');
            })();
          }}
        />
      ) : null}

      {mock ? (
        <Pressable accessibilityRole="button" onPress={() => void onResetPreview()} style={styles.textButton}>
          <Text style={styles.textButtonLabel}>Reset preview unlock</Text>
        </Pressable>
      ) : null}

      <Text style={styles.fine}>
        Entitlement `{ENTITLEMENT_ID}` · product `{PRODUCT_ID}` · offering {offeringId ?? 'default'}. Apple and Google
        handle the charge. This app has no account and no backend.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: {
    fontFamily: font.monoMedium,
    color: colors.amber,
    letterSpacing: 1.5,
    fontSize: 11,
  },
  title: {
    fontFamily: font.displayBold,
    color: colors.text,
    fontSize: 36,
    lineHeight: 40,
    marginTop: -8,
  },
  lead: {
    fontFamily: font.sans,
    color: colors.muted,
    fontSize: 16,
    lineHeight: 23,
  },
  list: {
    gap: 8,
  },
  benefit: {
    flexDirection: 'row',
    gap: 8,
  },
  benefitMark: {
    color: colors.amber,
    fontFamily: font.mono,
    marginTop: 2,
  },
  benefitText: {
    flex: 1,
    color: colors.text,
    fontFamily: font.sans,
    fontSize: 15,
    lineHeight: 21,
  },
  reason: {
    fontFamily: font.sans,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    backgroundColor: colors.bgRaised,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
  },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 48,
  },
  loadingText: {
    color: colors.muted,
    fontFamily: font.sans,
    fontSize: 14,
  },
  errorBox: {
    gap: 10,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 14,
    backgroundColor: colors.bgRaised,
  },
  errorTitle: {
    fontFamily: font.sansBold,
    color: colors.text,
    fontSize: 16,
  },
  errorBody: {
    fontFamily: font.sans,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 14,
    gap: 6,
    backgroundColor: colors.bgRaised,
  },
  cardOn: {
    borderColor: colors.amber,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'baseline',
  },
  cardTitle: {
    fontFamily: font.sansBold,
    color: colors.text,
    fontSize: 18,
    flex: 1,
  },
  price: {
    fontFamily: font.display,
    color: colors.amber,
    fontSize: 22,
  },
  cardBody: {
    fontFamily: font.sans,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  cardMeta: {
    fontFamily: font.mono,
    color: colors.faint,
    fontSize: 12,
  },
  message: {
    fontFamily: font.sansMedium,
    color: colors.good,
    fontSize: 14,
    lineHeight: 20,
  },
  textButton: {
    alignSelf: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  textButtonLabel: {
    fontFamily: font.sansMedium,
    color: colors.faint,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  fine: {
    fontFamily: font.mono,
    color: colors.faint,
    fontSize: 11,
    lineHeight: 16,
  },
});

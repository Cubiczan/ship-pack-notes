import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/buttons';
import { Screen } from '@/components/screen';
import { colors, font } from '@/constants/theme';
import { EXAMPLE_ASKS, FREE_PACK_LIMIT, formatManifestDate } from '@/lib/generator';
import { useAppState } from '@/state/app-state';

export default function DeskScreen() {
  const { draft, setDraft, persistDraft, generate, packs, packsUsed, premium } = useAppState();
  const [cutting, setCutting] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const remaining = Math.max(FREE_PACK_LIMIT - packsUsed, 0);
  const askReady = draft.trim().length >= 8;
  const locked = !premium && remaining === 0;

  const onGenerate = async () => {
    setHint(null);
    setCutting(true);
    try {
      const result = await generate(draft);
      if (!result.ok && result.reason === 'busy') return;
      if (!result.ok && result.reason === 'limit') {
        router.push('/paywall');
        return;
      }
      if (!result.ok) {
        setHint('Give the ask one concrete sentence.');
        return;
      }
      router.push({ pathname: '/pack/[id]', params: { id: result.pack.id } });
    } finally {
      setCutting(false);
    }
  };

  const status = premium ? 'Unlimited' : remaining === 1 ? 'Free · 1 pack left' : 'Free pack used';

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen top>
        <View style={styles.header}>
          <View style={styles.brand}>
            <View style={styles.mark}>
              <Text style={styles.markText}>SP</Text>
            </View>
            <View>
              <Text style={styles.brandKicker}>SHIP PACK</Text>
              <Text style={styles.brandName}>Notes</Text>
            </View>
          </View>
          <Pressable accessibilityRole="button" onPress={() => router.push('/paywall')} style={styles.pill}>
            <View style={[styles.dot, premium ? styles.dotOn : styles.dotOff]} />
            <Text style={styles.pillText}>{status}</Text>
          </Pressable>
        </View>

        <View style={styles.hero}>
          <Text style={styles.kicker}>SAME-DAY SHIPPING DESK</Text>
          <Text style={styles.headline}>One ask. A pack you can ship today.</Text>
          <Text style={styles.sub}>
            Scope, the build-or-fake-door call, a changelog line, a Product Hunt tagline, and three replies.
            Generated on this device.
          </Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>THE ASK</Text>
          <TextInput
            value={draft}
            onChangeText={(value) => {
              setDraft(value);
              if (hint) setHint(null);
            }}
            onBlur={() => void persistDraft(draft)}
            multiline
            textAlignVertical="top"
            placeholder="A weekly digest email so people see what shipped…"
            placeholderTextColor={colors.faint}
            style={styles.input}
            accessibilityLabel="Feature ask"
          />
        </View>

        <View style={styles.chips}>
          {EXAMPLE_ASKS.map((example) => (
            <Pressable
              key={example.label}
              accessibilityRole="button"
              onPress={() => {
                setDraft(example.ask);
                void persistDraft(example.ask);
                setHint(null);
              }}
              style={({ pressed }) => [styles.chip, pressed && styles.pressed]}>
              <Text style={styles.chipText}>{example.label}</Text>
            </Pressable>
          ))}
        </View>

        <PrimaryButton
          label={
            cutting ? 'Cutting the pack…' : locked && askReady ? 'Unlock unlimited to cut this' : 'Generate ship pack'
          }
          onPress={() => void onGenerate()}
          disabled={!askReady || cutting}
        />
        <Text style={styles.note}>
          {hint ??
            (premium
              ? 'Unlimited is unlocked on this device.'
              : locked
                ? 'The free pack is already cut. Unlock Unlimited is a one-time purchase.'
                : 'Free includes 1 pack. Unlock Unlimited is a one-time purchase.')}
        </Text>

        <View style={styles.recentHead}>
          <Text style={styles.recentTitle}>Recent packs</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push('/history')}>
            <Text style={styles.recentLink}>All packs</Text>
          </Pressable>
        </View>

        {packs.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No packs yet.</Text>
            <Text style={styles.emptyBody}>The first one is free. Try a chip if the ask is still fuzzy.</Text>
          </View>
        ) : (
          packs.slice(0, 3).map((pack) => (
            <Pressable
              key={pack.id}
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/pack/[id]', params: { id: pack.id } })}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
              <View
                style={[
                  styles.rowBar,
                  { backgroundColor: pack.recommendation === 'build' ? colors.stampBuild : colors.stampFake },
                ]}
              />
              <View style={styles.rowCopy}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {pack.title}
                </Text>
                <Text style={styles.rowMeta}>
                  {pack.recommendationLabel} · {formatManifestDate(pack.createdAt)}
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mark: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: {
    fontFamily: font.displayBold,
    color: colors.amberInk,
    fontSize: 16,
  },
  brandKicker: {
    fontFamily: font.monoMedium,
    color: colors.amber,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  brandName: {
    fontFamily: font.display,
    color: colors.text,
    fontSize: 22,
    lineHeight: 24,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bgRaised,
    borderRadius: 999,
    paddingHorizontal: 10,
    minHeight: 36,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  dotOn: {
    backgroundColor: colors.good,
  },
  dotOff: {
    backgroundColor: colors.amber,
  },
  pillText: {
    color: colors.text,
    fontFamily: font.sansMedium,
    fontSize: 12,
  },
  hero: {
    gap: 8,
  },
  kicker: {
    fontFamily: font.monoMedium,
    color: colors.amber,
    letterSpacing: 1.5,
    fontSize: 11,
  },
  headline: {
    fontFamily: font.displayBold,
    color: colors.text,
    fontSize: 36,
    lineHeight: 40,
  },
  sub: {
    fontFamily: font.sans,
    color: colors.muted,
    fontSize: 16,
    lineHeight: 23,
  },
  field: {
    backgroundColor: colors.bgRaised,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    gap: 8,
  },
  fieldLabel: {
    fontFamily: font.monoMedium,
    color: colors.faint,
    letterSpacing: 1.4,
    fontSize: 11,
  },
  input: {
    minHeight: 132,
    color: colors.text,
    fontFamily: font.sans,
    fontSize: 17,
    lineHeight: 24,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 12,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    color: colors.text,
    fontFamily: font.sansMedium,
    fontSize: 13,
  },
  note: {
    fontFamily: font.sans,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: -6,
  },
  recentHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 8,
  },
  recentTitle: {
    fontFamily: font.display,
    color: colors.text,
    fontSize: 24,
  },
  recentLink: {
    fontFamily: font.sansMedium,
    color: colors.amber,
    fontSize: 14,
  },
  empty: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 16,
    gap: 4,
    backgroundColor: colors.bgRaised,
  },
  emptyTitle: {
    fontFamily: font.sansBold,
    color: colors.text,
    fontSize: 16,
  },
  emptyBody: {
    fontFamily: font.sans,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: colors.bgRaised,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 12,
    paddingRight: 12,
    overflow: 'hidden',
  },
  rowBar: {
    width: 4,
    alignSelf: 'stretch',
  },
  rowCopy: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontFamily: font.sansMedium,
    color: colors.text,
    fontSize: 16,
  },
  rowMeta: {
    fontFamily: font.mono,
    color: colors.muted,
    fontSize: 12,
  },
  pressed: {
    opacity: 0.75,
  },
});

import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { colors, font } from '@/constants/theme';
import { formatManifestDate } from '@/lib/generator';
import { useAppState } from '@/state/app-state';

export default function HistoryScreen() {
  const { packs } = useAppState();

  return (
    <Screen>
      <Text style={styles.intro}>
        {packs.length === 0
          ? 'Nothing filed yet. Cut a pack from the desk and it will land here.'
          : `${packs.length} pack${packs.length === 1 ? '' : 's'} on this device.`}
      </Text>
      {packs.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>The drawer is empty.</Text>
          <Text style={styles.emptyBody}>History never leaves the phone. There is no account to sign into.</Text>
        </View>
      ) : (
        packs.map((pack) => (
          <Pressable
            key={pack.id}
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/pack/[id]', params: { id: pack.id } })}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            <Text style={styles.call}>{pack.recommendationLabel}</Text>
            <Text style={styles.title}>{pack.title}</Text>
            <Text style={styles.meta}>{formatManifestDate(pack.createdAt)}</Text>
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    fontFamily: font.sans,
    color: colors.muted,
    fontSize: 15,
    lineHeight: 21,
  },
  empty: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 16,
    gap: 6,
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
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bgRaised,
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  call: {
    fontFamily: font.monoMedium,
    color: colors.amber,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  title: {
    fontFamily: font.display,
    color: colors.text,
    fontSize: 22,
    lineHeight: 26,
  },
  meta: {
    fontFamily: font.mono,
    color: colors.muted,
    fontSize: 12,
  },
  pressed: {
    opacity: 0.75,
  },
});

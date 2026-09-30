import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { SecondaryButton } from '@/components/buttons';
import { PackManifest } from '@/components/pack-manifest';
import { Screen } from '@/components/screen';
import { colors, font } from '@/constants/theme';
import { useAppState } from '@/state/app-state';

export default function PackScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { packs } = useAppState();
  const pack = packs.find((item) => item.id === id);

  if (!pack) {
    return (
      <Screen>
        <View style={styles.missing}>
          <Text style={styles.title}>This manifest is not on this device.</Text>
          <Text style={styles.body}>Packs stay local. If you cleared storage, cut a new one from the desk.</Text>
          <SecondaryButton label="Back to the desk" onPress={() => router.replace('/')} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <PackManifest pack={pack} />
      <SecondaryButton label="New ask" onPress={() => router.replace('/')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  missing: {
    gap: 12,
    paddingTop: 24,
  },
  title: {
    fontFamily: font.display,
    color: colors.text,
    fontSize: 32,
    lineHeight: 36,
  },
  body: {
    fontFamily: font.sans,
    color: colors.muted,
    fontSize: 16,
    lineHeight: 22,
  },
});

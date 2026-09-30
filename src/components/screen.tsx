import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/theme';

export function Screen({
  children,
  top = false,
}: {
  children: ReactNode;
  top?: boolean;
}) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={{
        paddingTop: top ? insets.top + 18 : 8,
        paddingBottom: insets.bottom + 36,
        paddingHorizontal: 20,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <View style={styles.column}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  column: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    gap: 18,
  },
});

import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { colors, font } from '@/constants/theme';

async function tick() {
  try {
    await Haptics.selectionAsync();
  } catch {
    // Web and simulators can omit haptics.
  }
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => {
        void tick();
        onPress();
      }}
      style={({ pressed }) => [
        styles.primary,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}>
      <Text style={styles.primaryLabel}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  style,
}: {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        void tick();
        onPress();
      }}
      style={({ pressed }) => [styles.secondary, pressed && styles.pressed, style]}>
      <Text style={styles.secondaryLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    backgroundColor: colors.amber,
    borderRadius: 14,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  primaryLabel: {
    color: colors.amberInk,
    fontFamily: font.sansBold,
    fontSize: 16,
    letterSpacing: 0.2,
  },
  secondary: {
    borderRadius: 14,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bgRaised,
  },
  secondaryLabel: {
    color: colors.text,
    fontFamily: font.sansMedium,
    fontSize: 15,
  },
  disabled: {
    opacity: 0.38,
  },
  pressed: {
    opacity: 0.78,
  },
});

import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, font } from '@/constants/theme';
import { formatManifestDate, packToMarkdown, type ShipPack } from '@/lib/generator';

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(null), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async (key: string, value: string) => {
    await Clipboard.setStringAsync(value);
    setCopied(key);
  };

  return { copied, copy };
}

function CopyLink({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={8}>
      <Text style={[styles.copy, active && styles.copyActive]}>{active ? 'Copied' : label}</Text>
    </Pressable>
  );
}

export function PackManifest({ pack }: { pack: ShipPack }) {
  const { copied, copy } = useCopy();
  const stampColor = pack.recommendation === 'build' ? colors.stampBuild : colors.stampFake;

  return (
    <View style={styles.paper}>
      <View style={styles.perf}>
        {Array.from({ length: 12 }, (_, index) => (
          <View key={index} style={styles.hole} />
        ))}
      </View>

      <View style={styles.top}>
        <View style={styles.meta}>
          <Text style={styles.kicker}>MANIFEST</Text>
          <Text style={styles.date}>{formatManifestDate(pack.createdAt)}</Text>
        </View>
        <View style={[styles.stamp, { borderColor: stampColor }]}>
          <Text style={[styles.stampText, { color: stampColor }]}>{pack.recommendationLabel}</Text>
        </View>
      </View>

      <Text style={styles.title}>{pack.title}</Text>
      <Text style={styles.ask}>{pack.ask}</Text>

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionLabel}>SCOPE</Text>
          <CopyLink
            label="Copy"
            active={copied === 'scope'}
            onPress={() => void copy('scope', pack.scope.map((item) => `• ${item}`).join('\n'))}
          />
        </View>
        {pack.scope.map((item) => (
          <View key={item} style={styles.bulletRow}>
            <Text style={styles.bullet}>▸</Text>
            <Text style={styles.body}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionLabel}>WHY THIS CALL</Text>
          <CopyLink label="Copy" active={copied === 'why'} onPress={() => void copy('why', pack.reason)} />
        </View>
        <Text style={styles.body}>{pack.reason}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionLabel}>CHANGELOG</Text>
          <CopyLink
            label="Copy"
            active={copied === 'log'}
            onPress={() => void copy('log', pack.changelog)}
          />
        </View>
        <Text style={styles.body}>{pack.changelog}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionLabel}>PRODUCT HUNT</Text>
          <CopyLink
            label="Copy"
            active={copied === 'ph'}
            onPress={() => void copy('ph', pack.productHuntTagline)}
          />
        </View>
        <Text style={styles.tagline}>{pack.productHuntTagline}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionLabel}>REPLIES</Text>
          <CopyLink
            label="Copy all"
            active={copied === 'replies'}
            onPress={() =>
              void copy(
                'replies',
                pack.replies.map((reply) => `${reply.label}\n${reply.body}`).join('\n\n'),
              )
            }
          />
        </View>
        {pack.replies.map((reply) => (
          <View key={reply.id} style={styles.reply}>
            <View style={styles.sectionHead}>
              <Text style={styles.replyLabel}>{reply.label}</Text>
              <CopyLink
                label="Copy"
                active={copied === reply.id}
                onPress={() => void copy(reply.id, reply.body)}
              />
            </View>
            <Text style={styles.body}>{reply.body}</Text>
          </View>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => void copy('pack', packToMarkdown(pack))}
        style={({ pressed }) => [styles.copyPack, pressed && styles.pressed]}>
        <Text style={styles.copyPackLabel}>{copied === 'pack' ? 'Pack copied' : 'Copy full pack'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  paper: {
    backgroundColor: colors.paper,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 18,
    gap: 14,
  },
  perf: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -6,
    marginBottom: 4,
  },
  hole: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.bg,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  meta: {
    gap: 2,
    flex: 1,
  },
  kicker: {
    fontFamily: font.monoMedium,
    color: colors.paperMuted,
    letterSpacing: 1.6,
    fontSize: 11,
  },
  date: {
    fontFamily: font.mono,
    color: colors.paperMuted,
    fontSize: 12,
  },
  stamp: {
    borderWidth: 2,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    transform: [{ rotate: '-8deg' }],
  },
  stampText: {
    fontFamily: font.monoMedium,
    fontSize: 12,
    letterSpacing: 0.8,
  },
  title: {
    fontFamily: font.displayBold,
    fontSize: 30,
    lineHeight: 34,
    color: colors.paperInk,
  },
  ask: {
    fontFamily: font.sans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.paperMuted,
  },
  section: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.paperLine,
    paddingTop: 12,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  sectionLabel: {
    fontFamily: font.monoMedium,
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.paperMuted,
  },
  copy: {
    fontFamily: font.monoMedium,
    fontSize: 12,
    color: colors.stampBuild,
  },
  copyActive: {
    color: colors.amberInk,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  bullet: {
    fontFamily: font.mono,
    color: colors.stampFake,
    marginTop: 1,
  },
  body: {
    flex: 1,
    fontFamily: font.sans,
    fontSize: 15,
    lineHeight: 22,
    color: colors.paperInk,
  },
  tagline: {
    fontFamily: font.display,
    fontSize: 22,
    lineHeight: 28,
    color: colors.paperInk,
  },
  reply: {
    gap: 4,
    paddingTop: 4,
  },
  replyLabel: {
    fontFamily: font.sansMedium,
    fontSize: 13,
    color: colors.paperInk,
    flex: 1,
  },
  copyPack: {
    marginTop: 4,
    backgroundColor: colors.paperInk,
    borderRadius: 12,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyPackLabel: {
    color: colors.paper,
    fontFamily: font.sansBold,
    fontSize: 15,
  },
  pressed: {
    opacity: 0.8,
  },
});

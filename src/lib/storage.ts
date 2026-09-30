import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ShipPack } from '@/lib/generator';

const PACKS_KEY = 'shippack.packs.v1';
const USED_KEY = 'shippack.used.v1';
const MOCK_KEY = 'shippack.mockPremium.v1';
const DRAFT_KEY = 'shippack.draft.v1';

export type StoredDesk = {
  packs: ShipPack[];
  packsUsed: number;
  mockPremium: boolean;
  draft: string;
};

const EMPTY: StoredDesk = { packs: [], packsUsed: 0, mockPremium: false, draft: '' };

function isPack(value: unknown): value is ShipPack {
  if (!value || typeof value !== 'object') return false;
  const pack = value as Partial<ShipPack>;
  return typeof pack.id === 'string' && typeof pack.title === 'string' && Array.isArray(pack.scope);
}

export async function loadDesk(): Promise<StoredDesk> {
  try {
    const [packsRaw, usedRaw, mockRaw, draft] = await Promise.all([
      AsyncStorage.getItem(PACKS_KEY),
      AsyncStorage.getItem(USED_KEY),
      AsyncStorage.getItem(MOCK_KEY),
      AsyncStorage.getItem(DRAFT_KEY),
    ]);
    const parsed: unknown = packsRaw ? JSON.parse(packsRaw) : [];
    const packs = Array.isArray(parsed) ? parsed.filter(isPack) : [];
    const packsUsed = usedRaw ? Number(usedRaw) : 0;
    return {
      packs,
      packsUsed: Number.isFinite(packsUsed) ? packsUsed : 0,
      mockPremium: mockRaw === '1',
      draft: draft ?? '',
    };
  } catch {
    return EMPTY;
  }
}

export async function saveDesk(packs: ShipPack[], packsUsed: number): Promise<void> {
  await AsyncStorage.multiSet([
    [PACKS_KEY, JSON.stringify(packs.slice(0, 30))],
    [USED_KEY, String(packsUsed)],
  ]);
}

export async function saveDraft(draft: string): Promise<void> {
  await AsyncStorage.setItem(DRAFT_KEY, draft);
}

export async function isMockPremium(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(MOCK_KEY)) === '1';
  } catch {
    return false;
  }
}

export async function setMockPremium(active: boolean): Promise<void> {
  await AsyncStorage.setItem(MOCK_KEY, active ? '1' : '0');
}

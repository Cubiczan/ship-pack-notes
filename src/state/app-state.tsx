import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { configurePurchases, readEntitlement, type BillingSession } from '@/lib/revenuecat';
import { FREE_PACK_LIMIT, generateShipPack, type ShipPack } from '@/lib/generator';
import { loadDesk, saveDesk, saveDraft } from '@/lib/storage';

type GenerateResult = { ok: true; pack: ShipPack } | { ok: false; reason: 'empty' | 'limit' | 'busy' };

type AppState = {
  ready: boolean;
  packs: ShipPack[];
  packsUsed: number;
  premium: boolean;
  session: BillingSession | null;
  draft: string;
  setDraft: (value: string) => void;
  persistDraft: (value: string) => Promise<void>;
  generate: (ask: string) => Promise<GenerateResult>;
  refreshPremium: () => Promise<boolean>;
};

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [packs, setPacks] = useState<ShipPack[]>([]);
  const [packsUsed, setPacksUsed] = useState(0);
  const [premium, setPremium] = useState(false);
  const [session, setSession] = useState<BillingSession | null>(null);
  const [draft, setDraftState] = useState('');
  const busy = useRef(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const [stored, billing] = await Promise.all([loadDesk(), configurePurchases()]);
      const unlocked = await readEntitlement();
      if (!active) return;
      setPacks(stored.packs);
      setPacksUsed(stored.packsUsed);
      setDraftState(stored.draft);
      setSession(billing);
      setPremium(unlocked);
      setReady(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  const setDraft = useCallback((value: string) => {
    setDraftState(value);
  }, []);

  const persistDraft = useCallback(async (value: string) => {
    setDraftState(value);
    await saveDraft(value);
  }, []);

  const refreshPremium = useCallback(async () => {
    const unlocked = await readEntitlement();
    setPremium(unlocked);
    return unlocked;
  }, []);

  const generate = useCallback(
    async (ask: string): Promise<GenerateResult> => {
      if (busy.current) return { ok: false, reason: 'busy' };
      const pack = generateShipPack(ask);
      if (!pack) return { ok: false, reason: 'empty' };
      if (!premium && packsUsed >= FREE_PACK_LIMIT) {
        await saveDraft(ask);
        return { ok: false, reason: 'limit' };
      }

      busy.current = true;
      try {
        const nextUsed = premium ? packsUsed : packsUsed + 1;
        const nextPacks = [pack, ...packs.filter((item) => item.id !== pack.id)].slice(0, 30);
        await saveDesk(nextPacks, nextUsed);
        await saveDraft('');
        setPacks(nextPacks);
        setPacksUsed(nextUsed);
        setDraftState('');
        return { ok: true, pack };
      } finally {
        busy.current = false;
      }
    },
    [packs, packsUsed, premium],
  );

  const value = useMemo(
    () => ({
      ready,
      packs,
      packsUsed,
      premium,
      session,
      draft,
      setDraft,
      persistDraft,
      generate,
      refreshPremium,
    }),
    [ready, packs, packsUsed, premium, session, draft, setDraft, persistDraft, generate, refreshPremium],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppState {
  const value = useContext(AppStateContext);
  if (!value) throw new Error('useAppState must be used inside AppStateProvider');
  return value;
}

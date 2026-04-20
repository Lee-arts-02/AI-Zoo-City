"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Step3InteractionValue = {
  /** Physical sorting done + robot guidance visible (or machine chapter done). */
  primaryActionsUnlocked: boolean;
  setPrimaryActionsUnlocked: (value: boolean) => void;
};

const Step3InteractionContext = createContext<Step3InteractionValue | null>(null);

export function Step3InteractionProvider({ children }: { children: ReactNode }) {
  const [primaryActionsUnlocked, setPrimaryActionsUnlockedState] = useState(false);
  const setPrimaryActionsUnlocked = useCallback((value: boolean) => {
    setPrimaryActionsUnlockedState(value);
  }, []);

  const value = useMemo(
    () => ({ primaryActionsUnlocked, setPrimaryActionsUnlocked }),
    [primaryActionsUnlocked, setPrimaryActionsUnlocked]
  );

  return (
    <Step3InteractionContext.Provider value={value}>{children}</Step3InteractionContext.Provider>
  );
}

export function useStep3Interaction() {
  const ctx = useContext(Step3InteractionContext);
  if (!ctx) {
    return {
      primaryActionsUnlocked: false,
      setPrimaryActionsUnlocked: () => {},
    };
  }
  return ctx;
}

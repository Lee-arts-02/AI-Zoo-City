"use client";

import { STEP3_SOFT_GATE_MESSAGE } from "@/lib/step3SortingGate";
import { useCallback, useEffect, useRef, useState } from "react";

const NUDGE_MS = 450;

/** Tooltip visible duration; fade handled in CSS (~2s). */
export function useSoftGateFeedback(messageDurationMs = 2000) {
  const [tipOpen, setTipOpen] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [message, setMessage] = useState(STEP3_SOFT_GATE_MESSAGE);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trigger = useCallback(
    (text?: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setMessage(text ?? STEP3_SOFT_GATE_MESSAGE);
      setTipOpen(true);
      setNudge(true);
      window.setTimeout(() => setNudge(false), NUDGE_MS);
      timerRef.current = setTimeout(() => {
        setTipOpen(false);
        timerRef.current = null;
      }, messageDurationMs);
    },
    [messageDurationMs]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { tipOpen, nudge, trigger, message };
}

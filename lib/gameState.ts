"use client";

import { buildLearnerDescription } from "@/lib/learnerUtils";
import type { GameAction, GameState, LearnerProfile } from "@/types/game";
import {
  createContext,
  createElement,
  useContext,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";

export const TOTAL_STEPS = 7;

const emptyLearner: LearnerProfile = {
  presetAnimal: null,
  customAnimal: "",
  traits: [],
  dreamJob: null,
  customDreamJob: "",
  description: "",
};

export const initialGameState: GameState = {
  currentStep: 1,
  learner: {
    ...emptyLearner,
    description: buildLearnerDescription(emptyLearner),
  },
  progress: {
    judgmentSeen: false,
    originalCitySeen: false,
    aiExplained: false,
    redesignDraft: null,
    comparisonSeen: false,
    reflection: null,
    step5IntroSeen: false,
    beforeCityImageDataUrl: null,
    afterCityImageDataUrl: null,
    redesignPlacements: null,
    redesignComplete: false,
    freelancerHubDropCount: 0,
    finishingStep5Celebration: false,
    step7Phase: 1,
    step7CareerChoice: null,
    step7DrawingDataUrl: null,
    step7ReflectionSentence: null,
  },
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_STEP":
      return {
        ...state,
        currentStep: Math.min(
          TOTAL_STEPS,
          Math.max(1, Math.floor(action.step)),
        ),
      };
    case "SET_LEARNER": {
      const learner: LearnerProfile = {
        ...state.learner,
        ...action.learner,
      };
      return {
        ...state,
        learner: {
          ...learner,
          description: buildLearnerDescription(learner),
        },
      };
    }
    case "MARK_PROGRESS":
      return {
        ...state,
        progress: { ...state.progress, ...action.patch },
      };
    case "RESET_GAME":
      return initialGameState;
    default:
      return state;
  }
}

type GameContextValue = {
  state: GameState;
  dispatch: Dispatch<GameAction>;
};

const GameStateContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);
  return createElement(
    GameStateContext.Provider,
    { value },
    children,
  );
}

export function useGameState(): GameContextValue {
  const ctx = useContext(GameStateContext);
  if (!ctx) {
    throw new Error("useGameState must be used inside GameProvider");
  }
  return ctx;
}

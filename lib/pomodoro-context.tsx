import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { useKeepAwake } from "expo-keep-awake";
import { Platform } from "react-native";

export type PomodoroState = "IDLE" | "FOCUS" | "BREAK" | "PAUSED";

export interface PomodoroSession {
  id: string;
  state: PomodoroState;
  focusTime: number; // seconds
  breakTime: number; // seconds
  elapsedTime: number; // seconds
  totalFocusTime: number; // seconds for this session
  startedAt: Date | null;
  pausedAt: Date | null;
}

interface PomodoroContextType {
  session: PomodoroSession;
  startFocus: () => void;
  startBreak: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
  isRunning: boolean;
  progress: number; // 0-100
  remainingTime: number; // seconds
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

const DEFAULT_FOCUS_TIME = 25 * 60; // 25 minutes
const DEFAULT_BREAK_TIME = 5 * 60; // 5 minutes

interface PomodoroProviderProps {
  children: ReactNode;
}

export function PomodoroProvider({ children }: PomodoroProviderProps) {
  const [session, setSession] = useState<PomodoroSession>({
    id: `session_${Date.now()}`,
    state: "IDLE",
    focusTime: DEFAULT_FOCUS_TIME,
    breakTime: DEFAULT_BREAK_TIME,
    elapsedTime: 0,
    totalFocusTime: 0,
    startedAt: null,
    pausedAt: null,
  });

  const [isRunning, setIsRunning] = useState(false);

  // Keep screen awake during focus/break sessions (native only)
  if (Platform.OS !== "web") {
    useKeepAwake();
  }

  // Timer effect
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSession((prev) => {
        const maxTime = prev.state === "FOCUS" ? prev.focusTime : prev.breakTime;
        const newElapsedTime = prev.elapsedTime + 1;

        // Check if session is complete
        if (newElapsedTime >= maxTime) {
          setIsRunning(false);
          return {
            ...prev,
            elapsedTime: maxTime,
            state: prev.state === "FOCUS" ? "BREAK" : "FOCUS",
          };
        }

        // Update total focus time if in focus state
        const newTotalFocusTime =
          prev.state === "FOCUS" ? prev.totalFocusTime + 1 : prev.totalFocusTime;

        return {
          ...prev,
          elapsedTime: newElapsedTime,
          totalFocusTime: newTotalFocusTime,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const startFocus = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      state: "FOCUS",
      elapsedTime: 0,
      startedAt: new Date(),
      pausedAt: null,
    }));
    setIsRunning(true);
  }, []);

  const startBreak = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      state: "BREAK",
      elapsedTime: 0,
      startedAt: new Date(),
      pausedAt: null,
    }));
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
    setSession((prev) => ({
      ...prev,
      state: "PAUSED",
      pausedAt: new Date(),
    }));
  }, []);

  const resume = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      state: "FOCUS",
      pausedAt: null,
    }));
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    setSession((prev) => ({
      ...prev,
      state: "IDLE",
      elapsedTime: 0,
      startedAt: null,
      pausedAt: null,
    }));
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setSession({
      id: `session_${Date.now()}`,
      state: "IDLE",
      focusTime: DEFAULT_FOCUS_TIME,
      breakTime: DEFAULT_BREAK_TIME,
      elapsedTime: 0,
      totalFocusTime: 0,
      startedAt: null,
      pausedAt: null,
    });
  }, []);

  const maxTime = session.state === "FOCUS" ? session.focusTime : session.breakTime;
  const progress = maxTime > 0 ? (session.elapsedTime / maxTime) * 100 : 0;
  const remainingTime = Math.max(0, maxTime - session.elapsedTime);

  const value: PomodoroContextType = {
    session,
    startFocus,
    startBreak,
    pause,
    resume,
    stop,
    reset,
    isRunning,
    progress,
    remainingTime,
  };

  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error("usePomodoro must be used within PomodoroProvider");
  }
  return context;
}

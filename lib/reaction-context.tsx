import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type ReactionType = "like" | "heart" | "fire";

export interface Reaction {
  id: string;
  focusLogId: string;
  type: ReactionType;
  userId: string; // For now, we'll use a fixed "user" ID
  createdAt: string;
}

interface ReactionContextType {
  reactions: Reaction[];
  addReaction: (focusLogId: string, type: ReactionType) => Promise<void>;
  removeReaction: (reactionId: string) => Promise<void>;
  getReactionsForLog: (focusLogId: string) => Reaction[];
  getReactionCount: (focusLogId: string, type?: ReactionType) => number;
  hasUserReacted: (focusLogId: string, type: ReactionType) => boolean;
}

const ReactionContext = createContext<ReactionContextType | undefined>(undefined);

const REACTIONS_STORAGE_KEY = "pomodoro_reactions";
const CURRENT_USER_ID = "user_local"; // Fixed user ID for local development

export function ReactionProvider({ children }: { children: React.ReactNode }) {
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load reactions from AsyncStorage on mount
  useEffect(() => {
    loadReactions();
  }, []);

  const loadReactions = async () => {
    try {
      const data = await AsyncStorage.getItem(REACTIONS_STORAGE_KEY);
      if (data) {
        setReactions(JSON.parse(data));
      }
    } catch (error) {
      console.error("Failed to load reactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveReactions = async (newReactions: Reaction[]) => {
    try {
      await AsyncStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(newReactions));
      setReactions(newReactions);
    } catch (error) {
      console.error("Failed to save reactions:", error);
      throw error;
    }
  };

  const addReaction = useCallback(
    async (focusLogId: string, type: ReactionType) => {
      const newReaction: Reaction = {
        id: `reaction_${Date.now()}`,
        focusLogId,
        type,
        userId: CURRENT_USER_ID,
        createdAt: new Date().toISOString(),
      };

      const updatedReactions = [...reactions, newReaction];
      await saveReactions(updatedReactions);
    },
    [reactions]
  );

  const removeReaction = useCallback(
    async (reactionId: string) => {
      const updatedReactions = reactions.filter((r) => r.id !== reactionId);
      await saveReactions(updatedReactions);
    },
    [reactions]
  );

  const getReactionsForLog = useCallback(
    (focusLogId: string) => {
      return reactions.filter((r) => r.focusLogId === focusLogId);
    },
    [reactions]
  );

  const getReactionCount = useCallback(
    (focusLogId: string, type?: ReactionType) => {
      const logReactions = reactions.filter((r) => r.focusLogId === focusLogId);
      if (type) {
        return logReactions.filter((r) => r.type === type).length;
      }
      return logReactions.length;
    },
    [reactions]
  );

  const hasUserReacted = useCallback(
    (focusLogId: string, type: ReactionType) => {
      return reactions.some(
        (r) => r.focusLogId === focusLogId && r.type === type && r.userId === CURRENT_USER_ID
      );
    },
    [reactions]
  );

  const value: ReactionContextType = {
    reactions,
    addReaction,
    removeReaction,
    getReactionsForLog,
    getReactionCount,
    hasUserReacted,
  };

  return (
    <ReactionContext.Provider value={value}>{children}</ReactionContext.Provider>
  );
}

export function useReactions() {
  const context = useContext(ReactionContext);
  if (!context) {
    throw new Error("useReactions must be used within a ReactionProvider");
  }
  return context;
}

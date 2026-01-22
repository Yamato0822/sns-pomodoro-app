import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface FocusLog {
  id: string;
  taskId?: string;
  durationMinutes: number;
  completedAt: string; // ISO string
  message?: string;
  visibility: "public" | "private"; // MVP: public fixed
  createdAt: string; // ISO string
}

interface FocusLogContextType {
  logs: FocusLog[];
  addLog: (log: Omit<FocusLog, "id" | "createdAt">) => Promise<FocusLog>;
  getLogs: () => FocusLog[];
  getLogsForWeek: (startDate: Date) => FocusLog[];
  getTotalFocusMinutesForWeek: (startDate: Date) => number;
  deleteLogs: () => Promise<void>;
  isLoading: boolean;
}

const FocusLogContext = createContext<FocusLogContextType | undefined>(undefined);

const FOCUS_LOGS_STORAGE_KEY = "focus_logs";

interface FocusLogProviderProps {
  children: ReactNode;
}

export function FocusLogProvider({ children }: FocusLogProviderProps) {
  const [logs, setLogs] = useState<FocusLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load logs from AsyncStorage on mount
  useEffect(() => {
    const loadLogs = async () => {
      try {
        const stored = await AsyncStorage.getItem(FOCUS_LOGS_STORAGE_KEY);
        if (stored) {
          setLogs(JSON.parse(stored));
        }
      } catch (error) {
        console.error("Failed to load focus logs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLogs();
  }, []);

  // Save logs to AsyncStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      const saveLogs = async () => {
        try {
          await AsyncStorage.setItem(FOCUS_LOGS_STORAGE_KEY, JSON.stringify(logs));
        } catch (error) {
          console.error("Failed to save focus logs:", error);
        }
      };

      saveLogs();
    }
  }, [logs, isLoading]);

  const addLog = useCallback(
    async (log: Omit<FocusLog, "id" | "createdAt">): Promise<FocusLog> => {
      const newLog: FocusLog = {
        ...log,
        id: `log_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      setLogs((prev) => [...prev, newLog]);
      return newLog;
    },
    []
  );

  const getLogs = useCallback(() => {
    return logs;
  }, [logs]);

  const getLogsForWeek = useCallback(
    (startDate: Date) => {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      end.setHours(23, 59, 59, 999);

      return logs.filter((log) => {
        const logDate = new Date(log.completedAt);
        return logDate >= start && logDate <= end;
      });
    },
    [logs]
  );

  const getTotalFocusMinutesForWeek = useCallback(
    (startDate: Date) => {
      const weekLogs = getLogsForWeek(startDate);
      return weekLogs.reduce((total, log) => total + log.durationMinutes, 0);
    },
    [getLogsForWeek]
  );

  const deleteLogs = useCallback(async () => {
    try {
      setLogs([]);
      await AsyncStorage.removeItem(FOCUS_LOGS_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to delete focus logs:", error);
    }
  }, []);

  const value: FocusLogContextType = {
    logs,
    addLog,
    getLogs,
    getLogsForWeek,
    getTotalFocusMinutesForWeek,
    deleteLogs,
    isLoading,
  };

  return (
    <FocusLogContext.Provider value={value}>
      {children}
    </FocusLogContext.Provider>
  );
}

export function useFocusLogs() {
  const context = useContext(FocusLogContext);
  if (!context) {
    throw new Error("useFocusLogs must be used within FocusLogProvider");
  }
  return context;
}

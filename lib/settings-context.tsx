import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Theme = "light" | "dark" | "system";
export type FontSize = "s" | "m" | "l";
export type WeekStart = "mon" | "sun";

interface Settings {
  theme: Theme;
  fontSize: FontSize;
  weekStart: WeekStart;
  reminderEnabled: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateTheme: (theme: Theme) => Promise<void>;
  updateFontSize: (fontSize: FontSize) => Promise<void>;
  updateWeekStart: (weekStart: WeekStart) => Promise<void>;
  updateReminderEnabled: (enabled: boolean) => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const DEFAULT_SETTINGS: Settings = {
  theme: "system",
  fontSize: "m",
  weekStart: "mon",
  reminderEnabled: false,
};

const STORAGE_KEY = "app_settings";

interface SettingsProviderProps {
  children: ReactNode;
}

/**
 * Provider for app-wide settings (theme, font size, week start, reminders)
 * Persists settings to AsyncStorage
 */
export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from storage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setSettings(JSON.parse(stored));
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const saveSettings = async (newSettings: Settings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error("Error saving settings:", error);
      throw error;
    }
  };

  const updateTheme = async (theme: Theme) => {
    await saveSettings({ ...settings, theme });
  };

  const updateFontSize = async (fontSize: FontSize) => {
    await saveSettings({ ...settings, fontSize });
  };

  const updateWeekStart = async (weekStart: WeekStart) => {
    await saveSettings({ ...settings, weekStart });
  };

  const updateReminderEnabled = async (enabled: boolean) => {
    await saveSettings({ ...settings, reminderEnabled: enabled });
  };

  const value: SettingsContextType = {
    settings,
    updateTheme,
    updateFontSize,
    updateWeekStart,
    updateReminderEnabled,
    isLoading,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * Hook to access app settings
 */
export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
}

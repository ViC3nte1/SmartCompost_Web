import { useState, useEffect, useCallback } from "react";
import { AppSettings, DEFAULT_SETTINGS } from "@/lib/mqtt-types";

const STORAGE_KEY = "smart_compost_settings";

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  }, [settings]);

  const updateMqttSettings = useCallback((mqtt: Partial<AppSettings["mqtt"]>) => {
    setSettings((prev) => ({
      ...prev,
      mqtt: { ...prev.mqtt, ...mqtt },
    }));
  }, []);

  const updateThresholds = useCallback((thresholds: Partial<AppSettings["thresholds"]>) => {
    setSettings((prev) => ({
      ...prev,
      thresholds: { ...prev.thresholds, ...thresholds },
    }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return {
    settings,
    updateMqttSettings,
    updateThresholds,
    resetToDefaults,
  };
};

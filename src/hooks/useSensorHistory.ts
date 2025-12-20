import { useState, useCallback } from "react";
import { SensorData } from "@/lib/mqtt-types";

interface HistoryPoint {
  time: string;
  temp: number;
  gas: number;
  hum: number;
}

const MAX_HISTORY_POINTS = 50;

export const useSensorHistory = () => {
  const [history, setHistory] = useState<HistoryPoint[]>([]);

  const addDataPoint = useCallback((data: SensorData) => {
    const time = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    setHistory((prev) => {
      const newHistory = [
        ...prev,
        {
          time,
          temp: data.temp,
          gas: data.gas,
          hum: data.hum,
        },
      ];
      
      // Keep only the last MAX_HISTORY_POINTS
      if (newHistory.length > MAX_HISTORY_POINTS) {
        return newHistory.slice(-MAX_HISTORY_POINTS);
      }
      return newHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    history,
    addDataPoint,
    clearHistory,
  };
};


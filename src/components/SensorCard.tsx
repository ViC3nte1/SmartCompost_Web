import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ThresholdSettings } from "@/lib/mqtt-types";

interface SensorCardProps {
  title: string;
  value: number | null;
  unit: string;
  icon: ReactNode;
  type: "temp" | "hum" | "gas";
  thresholds: ThresholdSettings;
}

export const SensorCard = ({ title, value, unit, icon, type, thresholds }: SensorCardProps) => {
  
  // --- LOGIKA STATUS (SAMA PERSIS DENGAN FLUTTER) ---
  const getStatus = (): "safe" | "warning" | "danger" | "inactive" => {
    if (value === null) return "inactive";
    
    switch (type) {
      case "temp":
        // Suhu > 65: BAHAYA (Merah)
        if (value > 65) return "danger";
        // Suhu > 45: WASPADA (Kuning/Orange)
        if (value > 45) return "warning";
        return "safe";

      case "gas":
        // Gas > 60: BAHAYA (Merah)
        if (value > 60) return "danger";
        // Gas > 30: WASPADA (Kuning/Orange)
        if (value > 30) return "warning";
        return "safe";

      case "hum":
        // Kelembapan tetap pakai thresholds karena logika Flutter sederhana
        if (value < thresholds.humMin || value > thresholds.humMax) return "warning";
        return "safe";

      default:
        return "safe";
    }
  };

  const status = getStatus();

  const statusStyles = {
    safe: {
      bg: "from-primary/20 to-accent/10",
      border: "border-primary/30",
      indicator: "bg-success",
      text: "text-primary",
      progressBar: "bg-primary",
    },
    warning: {
      bg: "from-orange-100 to-orange-50 dark:from-orange-900/20 dark:to-orange-900/10", // Warna background kuning/orange lembut
      border: "border-orange-300 dark:border-orange-700",
      indicator: "bg-orange-500",
      text: "text-orange-600 dark:text-orange-400",
      progressBar: "bg-orange-500",
    },
    danger: {
      bg: "from-destructive/20 to-destructive/5",
      border: "border-destructive/30",
      indicator: "bg-destructive animate-pulse-glow",
      text: "text-destructive",
      progressBar: "bg-destructive",
    },
    inactive: {
      bg: "from-muted to-muted/50",
      border: "border-border",
      indicator: "bg-muted-foreground",
      text: "text-muted-foreground",
      progressBar: "bg-muted",
    },
  };

  const style = statusStyles[status];

  // --- LOGIKA PROGRESS BAR (Persentase) ---
  const getPercentage = () => {
    if (value === null) return 0;
    switch (type) {
      case "temp":
        // Pembagi 80.0 (Sama dengan Flutter agar tidak cepat penuh)
        return Math.min((value / 80) * 100, 100);
      case "gas":
        // Pembagi 100.0 (Skala Gas yang wajar untuk tampilan)
        return Math.min((value / 100) * 100, 100);
      case "hum":
        // Kelembapan 0-100%
        return Math.min(value, 100);
      default:
        return 0;
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 animate-fade-in",
        "bg-gradient-to-br",
        style.bg,
        style.border
      )}
    >
      {/* Status Indicator (Titik Pojok Kanan Atas) */}
      <div className="absolute top-4 right-4">
        <div className={cn("w-3 h-3 rounded-full", style.indicator)} />
      </div>

      {/* Icon and Title */}
      <div className="flex items-center gap-3 mb-4">
        <div className={cn("p-3 rounded-xl bg-card/50", style.text)}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>

      {/* Value */}
      <div className="mb-4">
        <span className={cn("text-4xl font-bold tabular-nums", style.text)}>
          {value !== null ? value.toFixed(1) : "--"}
        </span>
        <span className="text-xl text-muted-foreground ml-1">{unit}</span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-card/50 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            style.progressBar
          )}
          style={{ width: `${getPercentage()}%` }}
        />
      </div>

      {/* Threshold Info */}
      <p className="mt-3 text-xs text-muted-foreground">
        {type === "temp" && `Batas: 65°C`}
        {type === "gas" && `Batas: 60 %`}
        {type === "hum" && `Optimal: ${thresholds.humMin}-${thresholds.humMax}%`}
      </p>
    </div>
  );
};
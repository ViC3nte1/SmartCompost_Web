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
  const getStatus = () => {
    if (value === null) return "inactive";
    
    switch (type) {
      case "temp":
        return value > thresholds.tempMax ? "danger" : "safe";
      case "gas":
        return value > thresholds.gasMax ? "danger" : "safe";
      case "hum":
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
    },
    warning: {
      bg: "from-warning/20 to-warning/5",
      border: "border-warning/30",
      indicator: "bg-warning",
      text: "text-warning",
    },
    danger: {
      bg: "from-destructive/20 to-destructive/5",
      border: "border-destructive/30",
      indicator: "bg-destructive animate-pulse-glow",
      text: "text-destructive",
    },
    inactive: {
      bg: "from-muted to-muted/50",
      border: "border-border",
      indicator: "bg-muted-foreground",
      text: "text-muted-foreground",
    },
  };

  const style = statusStyles[status];

  const getPercentage = () => {
    if (value === null) return 0;
    switch (type) {
      case "temp":
        return Math.min((value / 50) * 100, 100);
      case "gas":
        return Math.min((value / 1000) * 100, 100);
      case "hum":
        return value;
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
      {/* Status Indicator */}
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
            status === "danger" ? "bg-destructive" : status === "warning" ? "bg-warning" : "bg-primary"
          )}
          style={{ width: `${getPercentage()}%` }}
        />
      </div>

      {/* Threshold Info */}
      <p className="mt-3 text-xs text-muted-foreground">
        {type === "temp" && `Batas: ${thresholds.tempMax}°C`}
        {type === "gas" && `Batas: ${thresholds.gasMax} PPM`}
        {type === "hum" && `Optimal: ${thresholds.humMin}-${thresholds.humMax}%`}
      </p>
    </div>
  );
};

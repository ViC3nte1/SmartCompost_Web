import { useEffect } from "react";
import { toast } from "sonner";
import { SensorData, ThresholdSettings } from "@/lib/mqtt-types";
import { AlertTriangle, Thermometer, Wind, Droplets } from "lucide-react";

interface AlertSystemProps {
  data: SensorData | null;
  thresholds: ThresholdSettings;
}

export const AlertSystem = ({ data, thresholds }: AlertSystemProps) => {
  useEffect(() => {
    if (!data) return;

    // Temperature Alert
    if (data.temp > thresholds.tempMax) {
      toast.error(`Suhu Tinggi: ${data.temp.toFixed(1)}°C`, {
        description: `Melebihi batas ${thresholds.tempMax}°C! Aktifkan kipas.`,
        icon: <Thermometer className="w-5 h-5 text-destructive" />,
        duration: 5000,
      });
    }

    // Gas Alert
    if (data.gas > thresholds.gasMax) {
      toast.error(`Gas Amonia Berbahaya: ${data.gas} PPM`, {
        description: `Melebihi batas ${thresholds.gasMax} PPM! Tingkatkan ventilasi.`,
        icon: <Wind className="w-5 h-5 text-destructive" />,
        duration: 5000,
      });
    }

    // Humidity Alert
    if (data.hum < thresholds.humMin) {
      toast.warning(`Kelembapan Rendah: ${data.hum.toFixed(1)}%`, {
        description: `Di bawah ${thresholds.humMin}%. Tambahkan air pada kompos.`,
        icon: <Droplets className="w-5 h-5 text-warning" />,
        duration: 5000,
      });
    } else if (data.hum > thresholds.humMax) {
      toast.warning(`Kelembapan Tinggi: ${data.hum.toFixed(1)}%`, {
        description: `Melebihi ${thresholds.humMax}%. Kurangi kelembapan.`,
        icon: <Droplets className="w-5 h-5 text-warning" />,
        duration: 5000,
      });
    }
  }, [data, thresholds]);

  return null; // This component only triggers toasts
};

interface AlertPanelProps {
  data: SensorData | null;
  thresholds: ThresholdSettings;
}

export const AlertPanel = ({ data, thresholds }: AlertPanelProps) => {
  const getAlerts = () => {
    if (!data) return [];

    const alerts: { type: "error" | "warning"; message: string; icon: React.ReactNode }[] = [];

    if (data.temp > thresholds.tempMax) {
      alerts.push({
        type: "error",
        message: `Suhu ${data.temp.toFixed(1)}°C melebihi batas ${thresholds.tempMax}°C`,
        icon: <Thermometer className="w-4 h-4" />,
      });
    }

    if (data.gas > thresholds.gasMax) {
      alerts.push({
        type: "error",
        message: `Gas ${data.gas} PPM melebihi batas ${thresholds.gasMax} PPM`,
        icon: <Wind className="w-4 h-4" />,
      });
    }

    if (data.hum < thresholds.humMin) {
      alerts.push({
        type: "warning",
        message: `Kelembapan ${data.hum.toFixed(1)}% di bawah ${thresholds.humMin}%`,
        icon: <Droplets className="w-4 h-4" />,
      });
    } else if (data.hum > thresholds.humMax) {
      alerts.push({
        type: "warning",
        message: `Kelembapan ${data.hum.toFixed(1)}% melebihi ${thresholds.humMax}%`,
        icon: <Droplets className="w-4 h-4" />,
      });
    }

    return alerts;
  };

  const alerts = getAlerts();

  if (alerts.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-success/10 border border-success/30 flex items-center gap-3">
        <div className="p-2 rounded-full bg-success/20">
          <AlertTriangle className="w-5 h-5 text-success" />
        </div>
        <div>
          <p className="font-medium text-success">Semua Parameter Normal</p>
          <p className="text-sm text-muted-foreground">Tidak ada peringatan saat ini</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => (
        <div
          key={index}
          className={`p-4 rounded-xl flex items-center gap-3 animate-slide-in ${
            alert.type === "error"
              ? "bg-destructive/10 border border-destructive/30"
              : "bg-warning/10 border border-warning/30"
          }`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div
            className={`p-2 rounded-full ${
              alert.type === "error" ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning"
            }`}
          >
            {alert.icon}
          </div>
          <p
            className={`font-medium ${
              alert.type === "error" ? "text-destructive" : "text-warning"
            }`}
          >
            {alert.message}
          </p>
        </div>
      ))}
    </div>
  );
};

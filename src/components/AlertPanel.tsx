import { useEffect } from "react";
import { toast } from "sonner";
import { SensorData, ThresholdSettings } from "@/lib/mqtt-types";
import { AlertTriangle, Thermometer, Wind, Droplets, Flame } from "lucide-react"; // Tambah icon Flame untuk kritis

interface AlertSystemProps {
  data: SensorData | null;
  thresholds: ThresholdSettings;
}

export const AlertSystem = ({ data, thresholds }: AlertSystemProps) => {
  useEffect(() => {
    if (!data) return;

    // --- 1. LOGIKA KONDISI KRITIS (Double Hazard) ---
    if (data.gas > 60 && data.temp > 65) {
      toast.error(`KONDISI KRITIS!`, {
        description: `Suhu (${data.temp.toFixed(1)}°C) & Gas (${data.gas} PPM) Ekstrem! Buka penutup.`,
        icon: <Flame className="w-5 h-5 text-destructive animate-pulse" />,
        duration: 7000, // Tampil lebih lama
      });
      return; // Stop, jangan tampilkan toast lain agar tidak spam
    }

    // --- 2. LOGIKA SUHU ---
    if (data.temp > 65) {
      toast.error(`Suhu Bahaya: ${data.temp.toFixed(1)}°C`, {
        description: `Melebihi 65°C! Kipas harus menyala.`,
        icon: <Thermometer className="w-5 h-5 text-destructive" />,
        duration: 5000,
      });
    } else if (data.temp > 45) {
      toast.warning(`Suhu Meningkat: ${data.temp.toFixed(1)}°C`, {
        description: `Melebihi 45°C. Pantau kondisi.`,
        icon: <Thermometer className="w-5 h-5 text-yellow-500" />, // Kuning/Orange
        duration: 4000,
      });
    }

    // --- 3. LOGIKA GAS ---
    if (data.gas > 60) {
      toast.error(`Gas Bahaya: ${data.gas} PPM`, {
        description: `Melebihi 60 PPM! Cek ventilasi segera.`,
        icon: <Wind className="w-5 h-5 text-destructive" />,
        duration: 5000,
      });
    } else if (data.gas > 30) {
      toast.warning(`Gas Waspada: ${data.gas} PPM`, {
        description: `Gas mulai naik (>30 PPM).`,
        icon: <Wind className="w-5 h-5 text-yellow-500" />,
        duration: 4000,
      });
    }

    // --- 4. LOGIKA KELEMBAPAN (Sesuai Threshold Settings) ---
    if (data.hum < thresholds.humMin) {
      toast.warning(`Kelembapan Rendah: ${data.hum.toFixed(1)}%`, {
        description: `Di bawah ${thresholds.humMin}%. Tambahkan air.`,
        icon: <Droplets className="w-5 h-5 text-blue-500" />,
        duration: 5000,
      });
    } else if (data.hum > thresholds.humMax) {
      toast.warning(`Kelembapan Tinggi: ${data.hum.toFixed(1)}%`, {
        description: `Melebihi ${thresholds.humMax}%. Kurangi kelembapan.`,
        icon: <Droplets className="w-5 h-5 text-blue-500" />,
        duration: 5000,
      });
    }
  }, [data, thresholds]); // Dependency array

  return null;
};

interface AlertPanelProps {
  data: SensorData | null;
  thresholds: ThresholdSettings;
}

export const AlertPanel = ({ data, thresholds }: AlertPanelProps) => {
  const getAlerts = () => {
    if (!data) return [];

    const alerts: { 
        type: "error" | "warning" | "critical"; // Tambah tipe critical
        message: string; 
        icon: React.ReactNode 
    }[] = [];

    // 1. Cek Kritis Dulu
    if (data.gas > 60 && data.temp > 65) {
        alerts.push({
            type: "critical", // Tipe khusus untuk warna merah tua
            message: "KONDISI KRITIS: Suhu & Gas Berlebih! Segera Tindak Lanjuti.",
            icon: <Flame className="w-5 h-5 animate-pulse" />,
        });
        // Jika kritis, kita return langsung agar user fokus ke satu masalah besar ini
        return alerts; 
    }

    // 2. Cek Suhu
    if (data.temp > 65) {
      alerts.push({
        type: "error",
        message: `Suhu Bahaya (${data.temp.toFixed(1)}°C > 65°C)`,
        icon: <Thermometer className="w-4 h-4" />,
      });
    } else if (data.temp > 45) {
        alerts.push({
            type: "warning",
            message: `Suhu Waspada (${data.temp.toFixed(1)}°C > 45°C)`,
            icon: <Thermometer className="w-4 h-4" />,
          });
    }

    // 3. Cek Gas
    if (data.gas > 60) {
      alerts.push({
        type: "error",
        message: `Gas Bahaya (${data.gas} PPM > 60 PPM)`,
        icon: <Wind className="w-4 h-4" />,
      });
    } else if (data.gas > 30) {
        alerts.push({
            type: "warning",
            message: `Gas Waspada (${data.gas} PPM > 30 PPM)`,
            icon: <Wind className="w-4 h-4" />,
          });
    }

    // 4. Cek Kelembapan
    if (data.hum < thresholds.humMin) {
      alerts.push({
        type: "warning",
        message: `Kelembapan Rendah (${data.hum.toFixed(1)}% < ${thresholds.humMin}%)`,
        icon: <Droplets className="w-4 h-4" />,
      });
    } else if (data.hum > thresholds.humMax) {
      alerts.push({
        type: "warning",
        message: `Kelembapan Tinggi (${data.hum.toFixed(1)}% > ${thresholds.humMax}%)`,
        icon: <Droplets className="w-4 h-4" />,
      });
    }

    return alerts;
  };

  const alerts = getAlerts();

  if (alerts.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
        <div className="p-2 rounded-full bg-green-100">
          <AlertTriangle className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <p className="font-medium text-green-700">Semua Parameter Normal</p>
          <p className="text-sm text-green-600/80">Tidak ada peringatan saat ini</p>
        </div>
      </div>
    );
  }

  // Helper function untuk styling
  const getStyle = (type: string) => {
      switch(type) {
          case 'critical':
              return "bg-red-100 border-red-500 text-red-900"; // Merah Tua
          case 'error':
              return "bg-red-50 border-red-200 text-red-700"; // Merah Biasa
          case 'warning':
              return "bg-orange-50 border-orange-200 text-orange-800"; // Kuning/Orange
          default:
              return "";
      }
  };

  const getIconStyle = (type: string) => {
    switch(type) {
        case 'critical':
            return "bg-red-200 text-red-900"; 
        case 'error':
            return "bg-red-100 text-red-600";
        case 'warning':
            return "bg-orange-100 text-orange-600";
        default:
            return "";
    }
};

  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => (
        <div
          key={index}
          className={`p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-bottom-2 border ${getStyle(alert.type)}`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className={`p-2 rounded-full ${getIconStyle(alert.type)}`}>
            {alert.icon}
          </div>
          <p className="font-medium">
            {alert.message}
          </p>
        </div>
      ))}
    </div>
  );
};
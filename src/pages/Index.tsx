import { useState, useCallback } from "react";
import { Thermometer, Droplets, Wind, AlertTriangle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { SensorCard } from "@/components/SensorCard";
import { ActuatorControl } from "@/components/ActuatorControl";
import { HistoricalChart } from "@/components/HistoricalChart";
import { AlertPanel, AlertSystem } from "@/components/AlertPanel";
import { useMqtt } from "@/hooks/useMqtt";
import { useSettings } from "@/hooks/useSettings";
import { useSensorHistory } from "@/hooks/useSensorHistory";
import { SensorData } from "@/lib/mqtt-types";

const Index = () => {
  const { settings } = useSettings();
  const { history, addDataPoint, clearHistory } = useSensorHistory();
  const [controlState, setControlState] = useState({ fan: 0, motor: 0, motor_sw: false });

  const handleMessage = useCallback(
    (data: SensorData) => {
      addDataPoint(data);
      setControlState((prev) => ({
        fan: data.fan,
      
        motor: data.motor_speed !== undefined ? data.motor_speed : (data.motor !== undefined ? data.motor : prev.motor),
        
        motor_sw: data.motor_sw !== undefined ? Boolean(data.motor_sw) : prev.motor_sw 
      }));
    },
    [addDataPoint]
  );

  const { status, lastData, connect, disconnect, publishControl } = useMqtt({
    settings: settings.mqtt,
    onMessage: handleMessage,
  });

  const handleSafetyChange = (enabled: boolean) => {
    // 1. Update Tampilan Web Lokal dulu
    const newState = { ...controlState, motor_sw: enabled };
    setControlState(newState);

    publishControl({
      fan: newState.fan,
      motor_speed: newState.motor,
      motor_sw: enabled
    });
  };

  const handleMotorChange = (value: number) => {
    const newState = { ...controlState, motor: value };
    setControlState(newState);
    publishControl({
      fan: newState.fan,
      motor_speed: value, // Mapping ke motor_speed
      motor_sw: newState.motor_sw
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Alert System (triggers toasts) */}
      <AlertSystem data={lastData} thresholds={settings.thresholds} />

      {/* Navbar */}
      <Navbar
        connectionStatus={status}
        onConnect={connect}
        onDisconnect={disconnect}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <section className="text-center py-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            🌿 Smart Compost Monitor
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pantau kondisi kompos Anda secara real-time. Suhu, kelembapan, dan kadar gas
            amonia akan ditampilkan langsung dari sensor ESP32.
          </p>
        </section>

        {/* Sensor Cards */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10">📊</span>
            Data Sensor Real-time
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SensorCard
              title="Suhu"
              value={lastData?.temp ?? null}
              unit="°C"
              icon={<Thermometer className="w-6 h-6" />}
              type="temp"
              thresholds={settings.thresholds}
            />
            <SensorCard
              title="Kelembapan"
              value={lastData?.hum ?? null}
              unit="%"
              icon={<Droplets className="w-6 h-6" />}
              type="hum"
              thresholds={settings.thresholds}
            />
            <SensorCard
              title="Gas Amonia"
              value={lastData?.gas ?? null}
              unit="%"
              icon={<Wind className="w-6 h-6" />}
              type="gas"
              thresholds={settings.thresholds}
            />
          </div>
        </section>

        {/* Alert Panel */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-warning/10">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </span>
            Status Peringatan
          </h2>
          <AlertPanel data={lastData} thresholds={settings.thresholds} />
        </section>

        {/* Actuator Control */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-accent/10">⚙️</span>
            Kontrol Aktuator
          </h2>
          <ActuatorControl
            fanStatus={controlState.fan}
            motorSpeed={controlState.motor}
            motorSafetyOn={controlState.motor_sw} // <--- PROPERTI BARU 1
            onMotorChange={handleMotorChange}
            onMotorSafetyChange={handleSafetyChange} // <--- PROPERTI BARU 2
            disabled={status !== "connected"}
          />
          {status !== "connected" && (
            <p className="mt-3 text-sm text-muted-foreground text-center">
              Hubungkan ke MQTT untuk mengontrol aktuator
            </p>
          )}
        </section>

        {/* Historical Chart */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10">📈</span>
            Grafik Tren (Sesi Ini)
          </h2>
          <HistoricalChart data={history} onClear={clearHistory} />
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Smart Compost Monitoring System • ESP32 + MQTT + React
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;

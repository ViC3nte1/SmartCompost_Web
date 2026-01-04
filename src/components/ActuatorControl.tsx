import { Fan, Cog } from "lucide-react"; // Power icon dihapus jika tidak dipakai
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface ActuatorControlProps {
  fanStatus: number;
  motorSpeed: number;
  motorSafetyOn: boolean;
  // onFanChange dihapus karena kipas sekarang otomatis penuh
  onMotorChange: (value: number) => void;
  onMotorSafetyChange: (value: boolean) => void;
  disabled?: boolean;
}

export const ActuatorControl = ({
  fanStatus,
  motorSpeed,
  motorSafetyOn,
  onMotorChange,
  onMotorSafetyChange,
  disabled = false,
}: ActuatorControlProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* --- Fan Control (Kipas) - READ ONLY / MONITORING --- */}
      <div
        className={cn(
          "p-6 rounded-2xl border transition-all duration-300",
          fanStatus === 1
            ? "bg-gradient-to-br from-primary/20 to-accent/10 border-primary/30"
            : "bg-card border-border"
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-3 rounded-xl transition-all duration-300",
                fanStatus === 1 ? "bg-primary/20" : "bg-muted"
              )}
            >
              <Fan
                className={cn(
                  "w-6 h-6 transition-all duration-300",
                  fanStatus === 1
                    ? "text-primary animate-spin"
                    : "text-muted-foreground"
                )}
                style={{ animationDuration: "2s" }}
              />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Kipas Pendingin</h3>
              <p className="text-sm text-muted-foreground">
                Mode: Otomatis
              </p>
            </div>
          </div>

          {/* STATUS INDICATOR (GANTINYA SWITCH) */}
          <div
            className={cn(
              "px-3 py-1 rounded-full text-xs font-bold border",
              fanStatus === 1
                ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                : "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
            )}
          >
            {fanStatus === 1 ? "ACTIVE" : "IDLE"}
          </div>
        </div>
        
        {/* Keterangan updated */}
        <p className="text-xs text-muted-foreground">
          Kipas dikontrol otomatis oleh sistem berdasarkan suhu sensor.
        </p>
      </div>

      {/* --- Motor Control (Pengaduk) --- */}
      <div
        className={cn(
          "p-6 rounded-2xl border transition-all duration-300",
          // Warna berubah hanya jika Speed > 0 DAN Safety ON
          motorSpeed > 0 && motorSafetyOn
            ? "bg-gradient-to-br from-accent/20 to-primary/10 border-accent/30"
            : "bg-card border-border"
        )}
      >
        {/* Header Motor: Ikon & Switch Safety */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-3 rounded-xl transition-all duration-300",
                motorSpeed > 0 && motorSafetyOn
                  ? "bg-accent/20"
                  : "bg-muted"
              )}
            >
              <Cog
                className={cn(
                  "w-6 h-6 transition-all duration-300",
                  motorSpeed > 0 && motorSafetyOn
                    ? "text-accent animate-spin"
                    : "text-muted-foreground"
                )}
                // Animasi berhenti jika Safety OFF
                style={{
                  animationDuration: motorSafetyOn
                    ? `${Math.max(0.5, 3 - (motorSpeed / 255) * 2.5)}s`
                    : "0s",
                }}
              />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Motor Pengaduk</h3>
              <p className="text-sm text-muted-foreground">
                Kecepatan: {motorSpeed} / 255
              </p>
            </div>
          </div>

          {/* Switch Safety ON/OFF */}
          <div className="flex flex-col items-end gap-1">
            <Switch
              checked={motorSafetyOn}
              onCheckedChange={onMotorSafetyChange}
              disabled={disabled}
            />
            <span className="text-[10px] text-muted-foreground">
              {motorSafetyOn ? "Safety ON" : "Safety OFF"}
            </span>
          </div>
        </div>

        {/* Slider Speed */}
        <Slider
          value={[motorSpeed]}
          onValueChange={(values) => onMotorChange(values[0])}
          max={255}
          min={0}
          step={1}
          // Disable slider jika Safety OFF
          disabled={disabled || !motorSafetyOn}
          className={cn(
            "mb-3",
            !motorSafetyOn && "opacity-50 cursor-not-allowed"
          )}
        />

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Stop</span>
          <span>50</span>
          <span>100</span>
          <span>Max (255)</span>
        </div>
      </div>
    </div>
  );
};
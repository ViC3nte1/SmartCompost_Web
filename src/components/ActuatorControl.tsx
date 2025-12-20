import { Fan, Cog } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface ActuatorControlProps {
  fanStatus: number;
  motorSpeed: number;
  onFanChange: (value: number) => void;
  onMotorChange: (value: number) => void;
  disabled?: boolean;
}

export const ActuatorControl = ({
  fanStatus,
  motorSpeed,
  onFanChange,
  onMotorChange,
  disabled = false,
}: ActuatorControlProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Fan Control */}
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
                  fanStatus === 1 ? "text-primary animate-spin" : "text-muted-foreground"
                )}
                style={{ animationDuration: "2s" }}
              />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Kipas Pendingin</h3>
              <p className="text-sm text-muted-foreground">
                Status: {fanStatus === 1 ? "Aktif" : "Mati"}
              </p>
            </div>
          </div>
          <Switch
            checked={fanStatus === 1}
            onCheckedChange={(checked) => onFanChange(checked ? 1 : 0)}
            disabled={disabled}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Kipas akan aktif otomatis saat suhu melebihi batas
        </p>
      </div>

      {/* Motor Control */}
      <div
        className={cn(
          "p-6 rounded-2xl border transition-all duration-300",
          motorSpeed > 0
            ? "bg-gradient-to-br from-accent/20 to-primary/10 border-accent/30"
            : "bg-card border-border"
        )}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className={cn(
              "p-3 rounded-xl transition-all duration-300",
              motorSpeed > 0 ? "bg-accent/20" : "bg-muted"
            )}
          >
            <Cog
              className={cn(
                "w-6 h-6 transition-all duration-300",
                motorSpeed > 0 ? "text-accent animate-spin" : "text-muted-foreground"
              )}
              style={{ animationDuration: `${Math.max(0.5, 3 - (motorSpeed / 255) * 2.5)}s` }}
            />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Motor Pengaduk</h3>
            <p className="text-sm text-muted-foreground">
              Kecepatan: {motorSpeed} / 255
            </p>
          </div>
        </div>

        <Slider
          value={[motorSpeed]}
          onValueChange={(values) => onMotorChange(values[0])}
          max={255}
          min={0}
          step={1}
          disabled={disabled}
          className="mb-3"
        />

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Mati</span>
          <span>Lambat</span>
          <span>Sedang</span>
          <span>Cepat</span>
          <span>Max</span>
        </div>
      </div>
    </div>
  );
};

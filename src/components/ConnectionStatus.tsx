import { Wifi, WifiOff, Loader2, AlertCircle } from "lucide-react";
import { ConnectionStatus as Status } from "@/lib/mqtt-types";
import { cn } from "@/lib/utils";

interface ConnectionStatusProps {
  status: Status;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const ConnectionStatus = ({ status, onConnect, onDisconnect }: ConnectionStatusProps) => {
  const statusConfig = {
    connected: {
      icon: Wifi,
      text: "Terhubung",
      color: "text-success",
      bgColor: "bg-success/10",
      borderColor: "border-success/30",
    },
    disconnected: {
      icon: WifiOff,
      text: "Terputus",
      color: "text-muted-foreground",
      bgColor: "bg-muted",
      borderColor: "border-border",
    },
    connecting: {
      icon: Loader2,
      text: "Menghubungkan...",
      color: "text-warning",
      bgColor: "bg-warning/10",
      borderColor: "border-warning/30",
    },
    error: {
      icon: AlertCircle,
      text: "Error",
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      borderColor: "border-destructive/30",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300",
          config.bgColor,
          config.borderColor
        )}
      >
        <Icon
          className={cn(
            "w-4 h-4",
            config.color,
            status === "connecting" && "animate-spin"
          )}
        />
        <span className={cn("text-sm font-medium", config.color)}>
          {config.text}
        </span>
      </div>
      
      {status === "disconnected" || status === "error" ? (
        <button
          onClick={onConnect}
          className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-full hover:opacity-90 transition-opacity"
        >
          Hubungkan
        </button>
      ) : status === "connected" ? (
        <button
          onClick={onDisconnect}
          className="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted rounded-full hover:bg-muted/80 transition-colors"
        >
          Putuskan
        </button>
      ) : null}
    </div>
  );
};

import { Link, useLocation } from "react-router-dom";
import { Leaf, Settings, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConnectionStatus as Status } from "@/lib/mqtt-types";
import { ConnectionStatus } from "./ConnectionStatus";

interface NavbarProps {
  connectionStatus: Status;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const Navbar = ({ connectionStatus, onConnect, onDisconnect }: NavbarProps) => {
  const location = useLocation();

  const navLinks = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/settings", label: "Pengaturan", icon: Settings },
  ];

  return (
    <nav className="sticky top-0 z-50 glass border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Leaf className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Smart Compost</h1>
              <p className="text-xs text-muted-foreground">Monitoring Dashboard</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Connection Status */}
          <div className="hidden sm:block">
            <ConnectionStatus
              status={connectionStatus}
              onConnect={onConnect}
              onDisconnect={onDisconnect}
            />
          </div>

          {/* Mobile Nav */}
          <div className="flex md:hidden items-center gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mobile Connection Status */}
        <div className="sm:hidden mt-3 flex justify-center">
          <ConnectionStatus
            status={connectionStatus}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
          />
        </div>
      </div>
    </nav>
  );
};

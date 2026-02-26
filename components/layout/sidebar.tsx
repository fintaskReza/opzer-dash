"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  Users,
  Layers,
  Database,
  GitMerge,
  SlidersHorizontal,
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
} from "lucide-react";

export type SidebarView =
  | "client-profitability"
  | "team-utilization"
  | "service-profitability"
  | "charts"
  | "data-sources"
  | "field-mapping"
  | "metric-selection"
  | "user-management";

interface NavItem {
  id: SidebarView;
  label: string;
  icon: React.ReactNode;
}

const DASHBOARDS: NavItem[] = [
  { id: "client-profitability", label: "Client Profitability", icon: <TrendingUp className="h-4 w-4" /> },
  { id: "team-utilization", label: "Team Utilization", icon: <Users className="h-4 w-4" /> },
  { id: "service-profitability", label: "Service Profitability", icon: <Layers className="h-4 w-4" /> },
  { id: "charts", label: "Charts & Visuals", icon: <BarChart3 className="h-4 w-4" /> },
];

const CONFIGURATION: NavItem[] = [
  { id: "data-sources", label: "Data Sources", icon: <Database className="h-4 w-4" /> },
  { id: "field-mapping", label: "Field Mapping", icon: <GitMerge className="h-4 w-4" /> },
  { id: "metric-selection", label: "Metric Selection", icon: <SlidersHorizontal className="h-4 w-4" /> },
];

const ADMIN_NAV: NavItem[] = [
  { id: "user-management", label: "User Management", icon: <ShieldCheck className="h-4 w-4" /> },
];

interface Props {
  activeView: SidebarView;
  onViewChange: (view: SidebarView) => void;
  dataStatus: "sample" | "custom";
  isAdmin?: boolean;
}

export function Sidebar({ activeView, onViewChange, dataStatus, isAdmin = false }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-border bg-card transition-all duration-200",
        collapsed ? "w-[60px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-3 border-b border-border px-4 py-4", collapsed && "justify-center px-3")}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15">
          <TrendingUp className="h-4 w-4 text-primary" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground leading-none">Profitability</p>
            <p className="mt-0.5 text-xs text-muted-foreground leading-none">Dashboard Builder</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <NavSection
          label="Dashboards"
          items={DASHBOARDS}
          activeView={activeView}
          onViewChange={onViewChange}
          collapsed={collapsed}
        />
        <NavSection
          label="Configuration"
          items={CONFIGURATION}
          activeView={activeView}
          onViewChange={onViewChange}
          collapsed={collapsed}
        />
        {isAdmin && (
          <NavSection
            label="Admin"
            items={ADMIN_NAV}
            activeView={activeView}
            onViewChange={onViewChange}
            collapsed={collapsed}
          />
        )}
      </nav>

      {/* Footer */}
      <div className={cn("border-t border-border px-2 py-3", collapsed ? "flex justify-center" : "")}>
        {!collapsed && (
          <div className="mb-2 flex items-center gap-2 rounded-md px-2 py-1.5">
            <span className={cn("h-2 w-2 shrink-0 rounded-full", dataStatus === "custom" ? "bg-amber-400" : "bg-emerald-400")} />
            <span className="text-xs text-muted-foreground truncate">
              {dataStatus === "custom" ? "Custom data" : "Sample data"}
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            collapsed && "justify-center"
          )}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed
            ? <PanelLeftOpen className="h-4 w-4" />
            : <><PanelLeftClose className="h-4 w-4" /><span>Collapse</span></>
          }
        </button>
      </div>
    </aside>
  );
}

function NavSection({
  label,
  items,
  activeView,
  onViewChange,
  collapsed,
}: {
  label: string;
  items: NavItem[];
  activeView: SidebarView;
  onViewChange: (v: SidebarView) => void;
  collapsed: boolean;
}) {
  return (
    <div>
      {!collapsed && (
        <p className="mb-2 px-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
          {label}
        </p>
      )}
      <div className="space-y-1">
        {items.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-2 py-2.5 text-sm transition-colors",
                collapsed ? "justify-center" : "",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="text-xs font-medium">{item.label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

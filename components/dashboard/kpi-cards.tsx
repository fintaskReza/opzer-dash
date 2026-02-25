"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { ClientProfitabilityRow, TeamMemberUtilizationRow } from "@/lib/types";

interface KpiCardsProps {
  clients: ClientProfitabilityRow[];
  team: TeamMemberUtilizationRow[];
}

function fmt(n: number, style: "currency" | "percent" | "decimal" = "decimal", decimals = 1): string {
  if (style === "currency")
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  if (style === "percent") return (n * 100).toFixed(1) + "%";
  return n.toFixed(decimals);
}

function utilizationColor(pct: number): string {
  if (pct < 0.5) return "text-rose-400";
  if (pct < 0.7) return "text-amber-400";
  if (pct <= 0.9) return "text-emerald-400";
  return "text-amber-400";
}

function utilizationBarColor(pct: number): string {
  if (pct < 0.5) return "bg-rose-400";
  if (pct < 0.7) return "bg-amber-400";
  if (pct <= 0.9) return "bg-emerald-400";
  return "bg-amber-400";
}

interface KpiIndicatorBarProps {
  value: number; // 0–1
  colorClass: string;
}

function KpiIndicatorBar({ value, colorClass }: KpiIndicatorBarProps) {
  const pct = Math.min(100, Math.max(0, value * 100));
  return (
    <div className="mt-2 h-1 w-full rounded-full bg-muted">
      <div
        className={`h-1 rounded-full ${colorClass} opacity-70`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function KpiCards({ clients, team }: KpiCardsProps) {
  const totalRevenue = clients.reduce((s, c) => s + c.revenue, 0);
  const totalCosts = clients.reduce((s, c) => s + c.costs, 0);
  const totalGrossProfit = clients.reduce((s, c) => s + c.grossProfit, 0);
  const overallMargin = totalRevenue > 0 ? totalGrossProfit / totalRevenue : 0;
  const totalHours = clients.reduce((s, c) => s + c.hours, 0);
  const avgEHR = totalHours > 0 ? totalRevenue / totalHours : 0;
  const avgUtilization =
    team.length > 0 ? team.reduce((s, m) => s + m.utilizationPct, 0) / team.length : 0;

  // Normalize values for indicator bar (0–1 scale)
  const maxRevenue = 200000; // reference ceiling for bar
  const maxProfit = 150000;
  const maxCost = 100000;
  const maxEHR = 300;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
      {/* Total Revenue */}
      <Card className="p-5">
        <CardContent className="p-0">
          <p className="text-xs font-medium text-muted-foreground">Total Revenue</p>
          <p className="mt-2 font-mono text-2xl font-bold tracking-tight text-primary">
            {fmt(totalRevenue, "currency")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">YTD across all clients</p>
          <KpiIndicatorBar value={totalRevenue / maxRevenue} colorClass="bg-primary" />
        </CardContent>
      </Card>

      {/* Gross Profit */}
      <Card className="p-5">
        <CardContent className="p-0">
          <p className="text-xs font-medium text-muted-foreground">Gross Profit</p>
          <p className="mt-2 font-mono text-2xl font-bold tracking-tight text-emerald-400">
            {fmt(totalGrossProfit, "currency")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {fmt(overallMargin, "percent")} margin
          </p>
          <KpiIndicatorBar value={totalGrossProfit / maxProfit} colorClass="bg-emerald-400" />
        </CardContent>
      </Card>

      {/* Labor Cost */}
      <Card className="p-5">
        <CardContent className="p-0">
          <p className="text-xs font-medium text-muted-foreground">Total Labor Cost</p>
          <p className="mt-2 font-mono text-2xl font-bold tracking-tight text-amber-400">
            {fmt(totalCosts, "currency")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Based on cost rates</p>
          <KpiIndicatorBar value={totalCosts / maxCost} colorClass="bg-amber-400" />
        </CardContent>
      </Card>

      {/* Avg Effective Hourly Rate */}
      <Card className="p-5">
        <CardContent className="p-0">
          <p className="text-xs font-medium text-muted-foreground">Avg. Effective Rate</p>
          <p className="mt-2 font-mono text-2xl font-bold tracking-tight text-foreground">
            <span className="text-primary">$</span>
            {fmt(avgEHR, "decimal", 0)}
            <span className="text-sm font-normal text-muted-foreground">/hr</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {fmt(totalHours, "decimal", 1)} hrs total
          </p>
          <KpiIndicatorBar value={avgEHR / maxEHR} colorClass="bg-primary" />
        </CardContent>
      </Card>

      {/* Avg Utilization */}
      <Card className="p-5">
        <CardContent className="p-0">
          <p className="text-xs font-medium text-muted-foreground">Avg. Utilization</p>
          <p className={`mt-2 font-mono text-2xl font-bold tracking-tight ${utilizationColor(avgUtilization)}`}>
            {fmt(avgUtilization, "percent")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {team.length} active team members
          </p>
          <KpiIndicatorBar value={avgUtilization} colorClass={utilizationBarColor(avgUtilization)} />
        </CardContent>
      </Card>

      {/* Avg Gross Margin */}
      <Card className="p-5">
        <CardContent className="p-0">
          <p className="text-xs font-medium text-muted-foreground">Avg. Gross Margin</p>
          <p className="mt-2 font-mono text-2xl font-bold tracking-tight text-emerald-400">
            {fmt(overallMargin, "percent")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {clients.length} clients in period
          </p>
          <KpiIndicatorBar value={overallMargin} colorClass="bg-emerald-400" />
        </CardContent>
      </Card>
    </div>
  );
}

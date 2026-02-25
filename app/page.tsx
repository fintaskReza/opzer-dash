"use client";

import { useState, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import useSWR from "swr";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Sidebar, type SidebarView } from "@/components/layout/sidebar";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { DashboardFilters } from "@/components/dashboard/filters";
import { ClientProfitabilityTable } from "@/components/dashboard/client-profitability-table";
import { TeamUtilizationTable } from "@/components/dashboard/team-utilization-table";
import { MetricSelector } from "@/components/dashboard/metric-selector";
import { ProfitabilityChart } from "@/components/dashboard/profitability-chart";
import { OverviewCharts } from "@/components/dashboard/overview-charts";
import { ServiceProfitabilityTable } from "@/components/dashboard/service-profitability-table";
import { DataSourcePanel } from "@/components/data-source/data-source-panel";
import { UtilizationChart } from "@/components/dashboard/utilization-chart";
import { FieldMappingGuide } from "@/components/dashboard/field-mapping-guide";
import { ServiceChart } from "@/components/dashboard/service-chart";
import { UserManagementPanel } from "@/components/admin/user-management-panel";
import {
  computeClientProfitability,
  computeTeamUtilization,
  computeServiceProfitability,
} from "@/lib/data";
import type {
  DashboardFilters as IFilters,
  MetricKey,
  UtilizationMetricKey,
  TimeEntry,
  RevenueEntry,
  ClientProfitabilityRow,
  TeamMemberUtilizationRow,
  ServiceProfitabilityRow,
} from "@/lib/types";

const DEFAULT_FILTERS: IFilters = {
  dateFrom: "2025-06-01",
  dateTo: "2025-08-31",
  selectedClients: [],
  activeOnly: true,
};

const DEFAULT_CLIENT_METRICS = new Set<MetricKey>([
  "revenue",
  "hours",
  "effectiveHourlyRate",
  "costs",
  "grossProfit",
  "grossMargin",
]);

const DEFAULT_TEAM_METRICS = new Set<UtilizationMetricKey>([
  "clientHours",
  "totalHours",
  "capacityHours",
  "utilizationPct",
  "attributedRevenue",
  "avgHourlyRate",
]);

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function buildDashboardUrl(base: string, filters: IFilters) {
  const params = new URLSearchParams({
    from: filters.dateFrom,
    to: filters.dateTo,
    activeOnly: String(filters.activeOnly),
  });
  if (filters.selectedClients.length > 0) {
    params.set("clients", filters.selectedClients.join(","));
  }
  return `${base}?${params.toString()}`;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [activeView, setActiveView] = useState<SidebarView>("client-profitability");
  const [filters, setFilters] = useState<IFilters>(DEFAULT_FILTERS);
  const [enabledClientMetrics, setEnabledClientMetrics] = useState(DEFAULT_CLIENT_METRICS);
  const [enabledTeamMetrics, setEnabledTeamMetrics] = useState(DEFAULT_TEAM_METRICS);

  // Fetch live data from API
  const { data: timeEntries = [] } = useSWR<TimeEntry[]>("/api/time-entries", fetcher);
  const { data: revenueEntries = [] } = useSWR<RevenueEntry[]>("/api/revenue-entries", fetcher);

  const clientRows = useMemo<ClientProfitabilityRow[]>(
    () => computeClientProfitability(filters, timeEntries, revenueEntries),
    [filters, timeEntries, revenueEntries]
  );
  const teamRows = useMemo<TeamMemberUtilizationRow[]>(
    () => computeTeamUtilization(filters, timeEntries, revenueEntries),
    [filters, timeEntries, revenueEntries]
  );
  const serviceRows = useMemo<ServiceProfitabilityRow[]>(
    () => computeServiceProfitability(filters, timeEntries, revenueEntries),
    [filters, timeEntries, revenueEntries]
  );

  async function handleDataImport(time: TimeEntry[], revenue: RevenueEntry[]) {
    if (time.length > 0) {
      await fetch("/api/time-entries/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(time),
      });
    }
    if (revenue.length > 0) {
      await fetch("/api/revenue-entries/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(revenue),
      });
    }
  }

  const isAdmin = session?.user?.role === "admin";
  const lastSync = new Date().toLocaleDateString("en-IE", { day: "2-digit", month: "short", year: "numeric" });

  const VIEW_META: Record<SidebarView, { title: string; subtitle: string }> = {
    "client-profitability": {
      title: "Client Profitability",
      subtitle: "Revenue, costs, gross margins, and effective hourly rates by client",
    },
    "team-utilization": {
      title: "Team Utilization",
      subtitle: "Capacity usage, client hours, and attributed revenue by team member",
    },
    "service-profitability": {
      title: "Service Profitability",
      subtitle: "Revenue, costs, and margins broken down by service line",
    },
    charts: {
      title: "Charts & Visuals",
      subtitle: "Revenue, margin, and utilization charts across the full period",
    },
    "data-sources": {
      title: "Data Sources",
      subtitle: "Connect APIs, upload CSVs, or manage your data integrations",
    },
    "field-mapping": {
      title: "Field Mapping",
      subtitle: "Required fields, column headers, and pre-built calculation formulas",
    },
    "metric-selection": {
      title: "Metric Selection",
      subtitle: "Choose which columns are visible in each dashboard table",
    },
    "user-management": {
      title: "User Management",
      subtitle: "Manage users and organisation access",
    },
  };

  const meta = VIEW_META[activeView];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar activeView={activeView} onViewChange={setActiveView} dataStatus="sample" isAdmin={isAdmin} />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{meta.title}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{meta.subtitle}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              {`Live data — ${lastSync}`}
            </div>
            {session?.user && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{session.user.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  Sign out
                </Button>
              </div>
            )}
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto max-w-[1280px] space-y-6">

            {/* ── Client Profitability ── */}
            {activeView === "client-profitability" && (
              <>
                <DashboardFilters filters={filters} onChange={setFilters} />
                <Separator />
                <KpiCards clients={clientRows} team={teamRows} />
                <OverviewCharts data={clientRows} />
                <ClientProfitabilityTable data={clientRows} enabledMetrics={enabledClientMetrics} />
              </>
            )}

            {/* ── Team Utilization ── */}
            {activeView === "team-utilization" && (
              <>
                <DashboardFilters filters={filters} onChange={setFilters} />
                <Separator />
                <UtilizationChart data={teamRows} />
                <TeamUtilizationTable data={teamRows} enabledMetrics={enabledTeamMetrics} />
              </>
            )}

            {/* ── Service Profitability ── */}
            {activeView === "service-profitability" && (
              <>
                <DashboardFilters filters={filters} onChange={setFilters} />
                <Separator />
                <ServiceChart data={serviceRows} />
                <ServiceProfitabilityTable data={serviceRows} />
              </>
            )}

            {/* ── Charts ── */}
            {activeView === "charts" && (
              <>
                <DashboardFilters filters={filters} onChange={setFilters} />
                <Separator />
                <OverviewCharts data={clientRows} />
                <ServiceChart data={serviceRows} />
                <ProfitabilityChart data={clientRows} />
                <UtilizationChart data={teamRows} />
              </>
            )}

            {/* ── Data Sources ── */}
            {activeView === "data-sources" && (
              <DataSourcePanel
                onDataImport={handleDataImport}
                onResetToSample={() => {}}
              />
            )}

            {/* ── Field Mapping ── */}
            {activeView === "field-mapping" && <FieldMappingGuide />}

            {/* ── Metric Selection ── */}
            {activeView === "metric-selection" && (
              <MetricSelector
                enabledClientMetrics={enabledClientMetrics}
                enabledTeamMetrics={enabledTeamMetrics}
                onClientMetricsChange={setEnabledClientMetrics}
                onTeamMetricsChange={setEnabledTeamMetrics}
              />
            )}

            {/* ── User Management (admin only) ── */}
            {activeView === "user-management" && isAdmin && <UserManagementPanel />}

          </div>
        </main>
      </div>
    </div>
  );
}

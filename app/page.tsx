"use client";

import { useState, useMemo } from "react";
import { Separator } from "@/components/ui/separator";
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
import {
  computeClientProfitability,
  computeTeamUtilization,
  computeServiceProfitability,
  TIME_ENTRIES,
  REVENUE_ENTRIES,
} from "@/lib/data";
import type {
  DashboardFilters as IFilters,
  MetricKey,
  UtilizationMetricKey,
  TimeEntry,
  RevenueEntry,
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

export default function DashboardPage() {
  const [activeView, setActiveView] = useState<SidebarView>("client-profitability");
  const [filters, setFilters] = useState<IFilters>(DEFAULT_FILTERS);
  const [enabledClientMetrics, setEnabledClientMetrics] = useState(DEFAULT_CLIENT_METRICS);
  const [enabledTeamMetrics, setEnabledTeamMetrics] = useState(DEFAULT_TEAM_METRICS);
  const [customTime, setCustomTime] = useState<TimeEntry[] | null>(null);
  const [customRevenue, setCustomRevenue] = useState<RevenueEntry[] | null>(null);

  const timeData = customTime ?? TIME_ENTRIES;
  const revenueData = customRevenue ?? REVENUE_ENTRIES;

  const clientRows = useMemo(
    () => computeClientProfitability(filters, timeData, revenueData),
    [filters, timeData, revenueData]
  );
  const teamRows = useMemo(
    () => computeTeamUtilization(filters, timeData, revenueData),
    [filters, timeData, revenueData]
  );
  const serviceRows = useMemo(
    () => computeServiceProfitability(filters, timeData, revenueData),
    [filters, timeData, revenueData]
  );

  function handleDataImport(time: TimeEntry[], revenue: RevenueEntry[]) {
    if (time.length > 0) setCustomTime(time);
    if (revenue.length > 0) setCustomRevenue(revenue);
  }

  const dataStatus = customTime || customRevenue ? "custom" : "sample";
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
  };

  const meta = VIEW_META[activeView];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar activeView={activeView} onViewChange={setActiveView} dataStatus={dataStatus} />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{meta.title}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{meta.subtitle}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={`inline-flex h-2 w-2 rounded-full ${dataStatus === "custom" ? "bg-amber-400" : "bg-emerald-400"}`} />
            {dataStatus === "custom" ? "Custom data active" : `Sample data — last sync ${lastSync}`}
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
                onResetToSample={() => { setCustomTime(null); setCustomRevenue(null); }}
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

          </div>
        </main>
      </div>
    </div>
  );
}

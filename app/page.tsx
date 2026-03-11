"use client";

import { useState, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { OrgManagementPanel } from "@/components/admin/org-management-panel";
import { TeamMembersPanel } from "@/components/admin/team-members-panel";
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
  TeamMember,
  TeamMemberRateRow,
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

interface Org { id: number; name: string; slug: string; }


export default function DashboardPage() {
  const { data: session } = useSession();
  const [activeView, setActiveView] = useState<SidebarView>("client-profitability");
  const [filters, setFilters] = useState<IFilters>(DEFAULT_FILTERS);
  const [enabledClientMetrics, setEnabledClientMetrics] = useState(DEFAULT_CLIENT_METRICS);
  const [enabledTeamMetrics, setEnabledTeamMetrics] = useState(DEFAULT_TEAM_METRICS);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);

  const isSuperAdmin = session?.user?.role === "super-admin";
  const isAdmin = isSuperAdmin || session?.user?.role === "admin";

  // Super-admins pick an org; others use their own
  const { data: orgs = [] } = useSWR<Org[]>(isSuperAdmin ? "/api/orgs" : null, fetcher);

  // Append ?orgId= for super-admin; block fetch until org is selected
  const orgSuffix = isSuperAdmin ? (selectedOrgId ? `?orgId=${selectedOrgId}` : null) : "";
  const timeKey = orgSuffix !== null ? `/api/time-entries${orgSuffix}` : null;
  const revenueKey = orgSuffix !== null ? `/api/revenue-entries${orgSuffix}` : null;
  const teamKey = orgSuffix !== null ? `/api/team-members${orgSuffix}` : null;

  // Fetch live data from API
  const { data: timeEntries = [], mutate: mutateTime } = useSWR<TimeEntry[]>(timeKey, fetcher);
  const { data: revenueEntries = [], mutate: mutateRevenue } = useSWR<RevenueEntry[]>(revenueKey, fetcher);
  const { data: teamMembersRaw = [] } = useSWR<Array<{ id: number; name: string; role: string; costRate: string; billingRate: string; status: "Active" | "Inactive"; capacityHoursPerMonth: number; location: "Onshore" | "Offshore" }>>(teamKey, fetcher);

  const teamMembers = useMemo<TeamMember[]>(
    () => teamMembersRaw.map((m) => ({
      name: m.name,
      role: m.role,
      costRate: parseFloat(m.costRate),
      billingRate: parseFloat(m.billingRate),
      status: m.status,
      capacityHoursPerMonth: m.capacityHoursPerMonth,
      location: m.location,
    })),
    [teamMembersRaw]
  );

  const clientRows = useMemo<ClientProfitabilityRow[]>(
    () => computeClientProfitability(filters, timeEntries, revenueEntries, teamMembers),
    [filters, timeEntries, revenueEntries, teamMembers]
  );
  const teamRows = useMemo<TeamMemberUtilizationRow[]>(
    () => computeTeamUtilization(filters, timeEntries, revenueEntries, teamMembers),
    [filters, timeEntries, revenueEntries, teamMembers]
  );
  const serviceRows = useMemo<ServiceProfitabilityRow[]>(
    () => computeServiceProfitability(filters, timeEntries, revenueEntries, teamMembers),
    [filters, timeEntries, revenueEntries, teamMembers]
  );

  const qs = isSuperAdmin && selectedOrgId ? `?orgId=${selectedOrgId}` : "";

  async function handleDataImport(time: TimeEntry[], revenue: RevenueEntry[]) {
    if (time.length > 0) {
      const res = await fetch(`/api/time-entries/bulk${qs}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(time),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error ${res.status}`);
      }
      await mutateTime();
    }
    if (revenue.length > 0) {
      const res = await fetch(`/api/revenue-entries/bulk${qs}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(revenue),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Server error ${res.status}`);
      }
      await mutateRevenue();
    }
  }

  async function handleImportRates(rates: TeamMemberRateRow[]) {
    const res = await fetch(`/api/team-members/bulk${qs}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rates),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? `Server error ${res.status}`);
    }
  }

  async function handleResetToSample() {
    await fetch(`/api/reset-sample${qs}`, { method: "POST" });
    await Promise.all([mutateTime(), mutateRevenue()]);
  }
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
    "team-members": {
      title: "Team Members",
      subtitle: "Manage billing rates, cost rates, and capacity for each team member",
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
    "org-management": {
      title: "Organisation Management",
      subtitle: "Create, edit, and delete organisations",
    },
  };

  const meta = VIEW_META[activeView];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar activeView={activeView} onViewChange={setActiveView} dataStatus="sample" isAdmin={isAdmin} isSuperAdmin={isSuperAdmin} />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{meta.title}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{meta.subtitle}</p>
          </div>
          <div className="flex items-center gap-4">
            {isSuperAdmin && (
              <Select
                value={selectedOrgId ? String(selectedOrgId) : ""}
                onValueChange={(v) => setSelectedOrgId(Number(v))}
              >
                <SelectTrigger className="h-8 w-44 text-xs">
                  <SelectValue placeholder="Select organisation" />
                </SelectTrigger>
                <SelectContent>
                  {orgs.map((o) => (
                    <SelectItem key={o.id} value={String(o.id)} className="text-xs">
                      {o.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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
          <div className="space-y-6">

            {/* ── Client Profitability ── */}
            {activeView === "client-profitability" && (
              <>
                <DashboardFilters filters={filters} onChange={setFilters} orgId={isSuperAdmin ? selectedOrgId : undefined} />
                <KpiCards clients={clientRows} team={teamRows} />
                <OverviewCharts data={clientRows} />
                <ClientProfitabilityTable data={clientRows} enabledMetrics={enabledClientMetrics} />
              </>
            )}

            {/* ── Team Utilization ── */}
            {activeView === "team-utilization" && (
              <>
                <DashboardFilters filters={filters} onChange={setFilters} orgId={isSuperAdmin ? selectedOrgId : undefined} />
                <UtilizationChart data={teamRows} />
                <TeamUtilizationTable data={teamRows} enabledMetrics={enabledTeamMetrics} />
              </>
            )}

            {/* ── Service Profitability ── */}
            {activeView === "service-profitability" && (
              <>
                <DashboardFilters filters={filters} onChange={setFilters} orgId={isSuperAdmin ? selectedOrgId : undefined} />
                <ServiceChart data={serviceRows} />
                <ServiceProfitabilityTable data={serviceRows} />
              </>
            )}

            {/* ── Charts ── */}
            {activeView === "charts" && (
              <>
                <DashboardFilters filters={filters} onChange={setFilters} orgId={isSuperAdmin ? selectedOrgId : undefined} />
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
                onImportRates={handleImportRates}
                onResetToSample={handleResetToSample}
                orgId={isSuperAdmin ? selectedOrgId : undefined}
              />
            )}

            {/* ── Team Members ── */}
            {activeView === "team-members" && <TeamMembersPanel orgId={isSuperAdmin ? selectedOrgId : undefined} />}

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
            {activeView === "user-management" && isAdmin && <UserManagementPanel isSuperAdmin={isSuperAdmin} />}

            {/* ── Org Management (super-admin only) ── */}
            {activeView === "org-management" && isSuperAdmin && <OrgManagementPanel />}

          </div>
        </main>
      </div>
    </div>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MetricKey, UtilizationMetricKey } from "@/lib/types";

const CLIENT_METRICS: { key: MetricKey; label: string; description: string; optional?: boolean }[] = [
  { key: "revenue", label: "Revenue", description: "Total revenue attributed to the client" },
  { key: "hours", label: "Hours", description: "Total time logged by the team" },
  { key: "effectiveHourlyRate", label: "Effective Hourly Rate", description: "Revenue ÷ Hours" },
  { key: "costs", label: "Labor Cost", description: "Σ(Hours × Cost Rate) per team member" },
  { key: "grossProfit", label: "Gross Profit ($)", description: "Revenue – Labor Cost" },
  { key: "grossMargin", label: "Gross Margin (%)", description: "Gross Profit ÷ Revenue" },
  { key: "wip", label: "WIP Value", description: "Σ(Hours × Billing Rate)", optional: true },
  { key: "realizationRate", label: "Realization Rate", description: "Revenue ÷ WIP", optional: true },
  { key: "budget", label: "Budget", description: "Client budget for the period", optional: true },
  { key: "budgetVariance", label: "vs Budget", description: "Revenue – Budget (green = over, rose = under)", optional: true },
  { key: "onshoreHours", label: "Onshore Hours", description: "Hours by onshore team members", optional: true },
  { key: "offshoreHours", label: "Offshore Hours", description: "Hours by offshore team members", optional: true },
];

const TEAM_METRICS: { key: UtilizationMetricKey; label: string; description: string }[] = [
  { key: "clientHours", label: "Client Hours", description: "Billable hours on client work" },
  { key: "internalHours", label: "Internal Hours", description: "Non-billable / admin hours" },
  { key: "totalHours", label: "Total Hours", description: "Client + Internal hours" },
  { key: "capacityHours", label: "Capacity Hours", description: "Expected available hours in period" },
  { key: "utilizationPct", label: "Utilization %", description: "Client Hours ÷ Capacity Hours" },
  { key: "attributedRevenue", label: "Attributed Revenue", description: "Revenue share based on hours worked" },
  { key: "avgHourlyRate", label: "Avg. Hourly Rate", description: "Attributed Revenue ÷ Client Hours" },
];

interface Props {
  enabledClientMetrics: Set<MetricKey>;
  enabledTeamMetrics: Set<UtilizationMetricKey>;
  onClientMetricsChange: (keys: Set<MetricKey>) => void;
  onTeamMetricsChange: (keys: Set<UtilizationMetricKey>) => void;
}

export function MetricSelector({
  enabledClientMetrics,
  enabledTeamMetrics,
  onClientMetricsChange,
  onTeamMetricsChange,
}: Props) {
  function toggleClient(key: MetricKey) {
    const next = new Set(enabledClientMetrics);
    next.has(key) ? next.delete(key) : next.add(key);
    onClientMetricsChange(next);
  }

  function toggleTeam(key: UtilizationMetricKey) {
    const next = new Set(enabledTeamMetrics);
    next.has(key) ? next.delete(key) : next.add(key);
    onTeamMetricsChange(next);
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-base font-semibold">Client Profitability Metrics</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Select which columns to display in the client table
          </p>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="space-y-2">
            {CLIENT_METRICS.map((m) => (
              <label key={m.key} className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={enabledClientMetrics.has(m.key)}
                  onChange={() => toggleClient(m.key)}
                  className="mt-0.5 h-3.5 w-3.5 accent-primary"
                />
                <div>
                  <span className="text-xs font-medium text-foreground">
                    {m.label}
                    {m.optional && (
                      <span className="ml-1 text-muted-foreground">(optional)</span>
                    )}
                  </span>
                  <p className="text-xs text-muted-foreground">{m.description}</p>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-base font-semibold">Team Utilization Metrics</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Select which columns to display in the utilization table
          </p>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="space-y-2">
            {TEAM_METRICS.map((m) => (
              <label key={m.key} className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={enabledTeamMetrics.has(m.key)}
                  onChange={() => toggleTeam(m.key)}
                  className="mt-0.5 h-3.5 w-3.5 accent-primary"
                />
                <div>
                  <span className="text-xs font-medium text-foreground">{m.label}</span>
                  <p className="text-xs text-muted-foreground">{m.description}</p>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

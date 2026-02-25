"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClientProfitabilityRow } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";

interface Props {
  data: ClientProfitabilityRow[];
}

const GRID_STROKE = "hsl(224, 14%, 16%)";
const TICK_FILL = "hsl(220, 10%, 55%)";
const TOOLTIP_BG = "hsl(224, 18%, 9%)";
const TOOLTIP_BORDER = "1px solid hsl(224, 14%, 16%)";
const REVENUE_BAR_COLOR = "hsl(220, 70%, 55%)";

function marginBarColor(margin: number): string {
  if (margin < 0.6) return "hsl(0, 72%, 51%)";
  if (margin < 0.7) return "hsl(37, 91%, 55%)";
  return "hsl(160, 84%, 39%)";
}

function shortLabel(name: string): string {
  // Truncate long client names for Y-axis
  if (name.length <= 18) return name;
  const words = name.split(/\s+/);
  if (words[0].length >= 12) return words[0].substring(0, 14) + "…";
  return words.slice(0, 2).join(" ").substring(0, 18) + "…";
}

const fmtCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function OverviewCharts({ data }: Props) {
  // Top 12 by revenue for the revenue chart
  const top12Revenue = data
    .slice()
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 12)
    .map((r) => ({
      name: shortLabel(r.clientName),
      full: r.clientName,
      revenue: r.revenue,
    }))
    .reverse(); // reverse so highest is at top of horizontal bar

  // All clients sorted by gross margin for the margin chart
  const marginData = data
    .slice()
    .sort((a, b) => a.grossMargin - b.grossMargin)
    .map((r) => ({
      name: shortLabel(r.clientName),
      full: r.clientName,
      grossMargin: r.grossMargin,
    }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Top 12 Clients by Revenue — horizontal bar */}
      <Card>
        <CardHeader className="p-5 pb-0">
          <CardTitle className="text-base font-semibold">Top 12 Clients by Revenue</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">Sorted by revenue descending</p>
        </CardHeader>
        <CardContent className="p-5 pt-3">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={top12Revenue}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
            >
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: TICK_FILL }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => "$" + (v / 1000).toFixed(0) + "k"}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fontSize: 10, fill: TICK_FILL }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "hsl(220, 14%, 12%)" }}
                contentStyle={{
                  background: TOOLTIP_BG,
                  border: TOOLTIP_BORDER,
                  borderRadius: 8,
                  fontSize: 12,
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(v: any) => [fmtCurrency.format(v ?? 0), "Revenue"]}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                labelFormatter={(_l: any, p: readonly any[]) => p[0]?.payload?.full ?? _l}
              />
              <Bar dataKey="revenue" fill={REVENUE_BAR_COLOR} radius={[0, 3, 3, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gross Margin % — all clients, color by threshold */}
      <Card>
        <CardHeader className="p-5 pb-0">
          <CardTitle className="text-base font-semibold">Gross Margin % by Client</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            <span className="text-rose-400">Rose</span> &lt;60% &middot;{" "}
            <span className="text-amber-400">Amber</span> 60–70% &middot;{" "}
            <span className="text-emerald-400">Emerald</span> &ge;70%
          </p>
        </CardHeader>
        <CardContent className="p-5 pt-3">
          {/* Horizontally scrollable — each bar gets 48 px so labels have room */}
          <div className="overflow-x-auto">
            {(() => {
              const BAR_SLOT = 48;
              const Y_AXIS_W = 44;
              const BOTTOM = 96;
              const CHART_H = 340;
              const chartWidth = Math.max(560, marginData.length * BAR_SLOT + Y_AXIS_W + 16);
              return (
                <div style={{ width: chartWidth }}>
                  <BarChart
                    width={chartWidth}
                    height={CHART_H}
                    data={marginData}
                    barSize={26}
                    margin={{ top: 4, right: 16, left: 0, bottom: BOTTOM }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: TICK_FILL }}
                      axisLine={false}
                      tickLine={false}
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                      height={BOTTOM}
                    />
                    <YAxis
                      width={Y_AXIS_W}
                      tick={{ fontSize: 10, fill: TICK_FILL }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => (v * 100).toFixed(0) + "%"}
                      domain={[0, 1]}
                    />
                    <Tooltip
                      cursor={{ fill: "hsl(220, 14%, 12%)" }}
                      contentStyle={{
                        background: TOOLTIP_BG,
                        border: TOOLTIP_BORDER,
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      formatter={(v: any) => [(v * 100).toFixed(1) + "%", "Gross Margin"]}
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      labelFormatter={(_l: any, p: readonly any[]) => p[0]?.payload?.full ?? _l}
                    />
                    <Bar dataKey="grossMargin" radius={[3, 3, 0, 0]} opacity={0.9}>
                      {marginData.map((entry) => (
                        <Cell key={entry.full} fill={marginBarColor(entry.grossMargin)} />
                      ))}
                    </Bar>
                  </BarChart>
                </div>
              );
            })()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

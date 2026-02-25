"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  LabelList,
} from "recharts";

const DEFAULT_VISIBLE = 12;

interface Props {
  data: ClientProfitabilityRow[];
}

const GRID_STROKE = "hsl(224, 14%, 16%)";
const TICK_FILL = "hsl(220, 20%, 90%)";
const TOOLTIP_BG = "hsl(224, 18%, 9%)";
const TOOLTIP_BORDER = "1px solid hsl(224, 14%, 16%)";

function marginBarColor(margin: number): string {
  if (margin < 0.6) return "hsl(0, 72%, 51%)";
  if (margin < 0.7) return "hsl(37, 91%, 55%)";
  return "hsl(160, 84%, 39%)";
}

function shortLabel(name: string): string {
  if (name.length <= 28) return name;
  return name.substring(0, 27) + "…";
}

const fmtCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function OverviewCharts({ data }: Props) {
  const [showAll, setShowAll] = useState(false);
  const [revenueMode, setRevenueMode] = useState<"dollar" | "percent">("dollar");

  const totalRevenue = data.reduce((s, r) => s + r.revenue, 0);

  const allData = data
    .slice()
    .sort((a, b) => b.revenue - a.revenue)
    .map((r) => ({
      name: shortLabel(r.clientName),
      full: r.clientName,
      revenue: r.revenue,
      revenuePct: totalRevenue > 0 ? (r.revenue / totalRevenue) * 100 : 0,
      grossMarginPct: parseFloat((r.grossMargin * 100).toFixed(1)),
      grossMargin: r.grossMargin,
    }));

  const chartData = showAll ? allData : allData.slice(0, DEFAULT_VISIBLE);
  const hiddenCount = allData.length - DEFAULT_VISIBLE;

  // 40px per client row + top/bottom margins
  const chartHeight = chartData.length * 40 + 40;

  const barDataKey = revenueMode === "dollar" ? "revenue" : "revenuePct";

  const xDomain: [number, number] =
    revenueMode === "percent"
      ? [0, 100]
      : [0, Math.max(...chartData.map((d) => d.revenue)) * 1.15];

  const xTickFormatter =
    revenueMode === "dollar"
      ? (v: number) => "$" + (v / 1000).toFixed(0) + "k"
      : (v: number) => v.toFixed(0) + "%";

  return (
    <Card>
      <CardHeader className="p-5 pb-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <CardTitle className="text-base font-semibold">Revenue &amp; Gross Margin by Client</CardTitle>
          <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
            <Button
              size="sm"
              variant={revenueMode === "dollar" ? "secondary" : "ghost"}
              className="h-6 px-2 text-xs"
              onClick={() => setRevenueMode("dollar")}
            >
              $ Revenue
            </Button>
            <Button
              size="sm"
              variant={revenueMode === "percent" ? "secondary" : "ghost"}
              className="h-6 px-2 text-xs"
              onClick={() => setRevenueMode("percent")}
            >
              % of Firm
            </Button>
          </div>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>Bar color = Gross Margin %:</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-3 rounded-sm bg-rose-500" />
            <span className="text-rose-400">&lt;60%</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-3 rounded-sm bg-amber-400" />
            <span className="text-amber-400">60–70%</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-3 rounded-sm bg-emerald-500" />
            <span className="text-emerald-400">&ge;70%</span>
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-2">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={chartData}
            layout="vertical"
            barSize={22}
            barCategoryGap="40%"
            margin={{ top: 4, right: 56, left: 4, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />

            <XAxis
              type="number"
              domain={xDomain}
              tick={{ fontSize: 10, fill: "hsl(220, 10%, 55%)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={xTickFormatter}
            />

            <YAxis
              type="category"
              dataKey="name"
              width={190}
              tick={{ fontSize: 11, fill: TICK_FILL }}
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
              formatter={(v: any) =>
                revenueMode === "dollar"
                  ? [fmtCurrency.format(v ?? 0), "Revenue"]
                  : [(v as number).toFixed(1) + "%", "Share of Firm Revenue"]
              }
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              labelFormatter={(_l: any, p: readonly any[]) => {
                const payload = p[0]?.payload;
                if (!payload) return _l;
                return `${payload.full} — GM: ${payload.grossMarginPct}%`;
              }}
            />

            <Bar dataKey={barDataKey} radius={[0, 3, 3, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.full} fill={marginBarColor(entry.grossMargin)} />
              ))}
              <LabelList
                dataKey="grossMarginPct"
                position="right"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(v: any) => (typeof v === "number" ? v.toFixed(1) + "%" : "")}
                style={{ fontSize: 10, fill: "hsl(220, 10%, 70%)" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {hiddenCount > 0 && (
          <div className="mt-3 flex justify-center border-t border-border pt-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll ? "Show less" : `Show ${hiddenCount} more clients`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

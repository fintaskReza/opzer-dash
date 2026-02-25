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
} from "recharts";

const DEFAULT_VISIBLE = 12;

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

// Keep enough chars to be readable without overflowing a 190px axis
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

  // Sort descending by revenue; in layout="vertical" the array renders
  // top-to-bottom, so no reversal needed — highest revenue is first = top.
  const allData = data
    .slice()
    .sort((a, b) => b.revenue - a.revenue)
    .map((r) => ({
      name: shortLabel(r.clientName),
      full: r.clientName,
      revenue: r.revenue,
      grossMarginPct: parseFloat((r.grossMargin * 100).toFixed(1)),
      grossMargin: r.grossMargin,
    }));

  const chartData = showAll ? allData : allData.slice(0, DEFAULT_VISIBLE);
  const hiddenCount = allData.length - DEFAULT_VISIBLE;

  // 36px per client row (2 bars + gap) + top/bottom margins
  const chartHeight = chartData.length * 36 + 40;

  return (
    <Card>
      <CardHeader className="p-5 pb-2">
        <CardTitle className="text-base font-semibold">Revenue &amp; Gross Margin by Client</CardTitle>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-3 rounded-sm bg-[hsl(220,70%,55%)] opacity-85" />
            Revenue
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-3 rounded-sm bg-[hsl(160,84%,39%)]" />
            Gross Margin %
          </span>
          <span className="text-border">·</span>
          <span><span className="text-rose-400">Rose</span> &lt;60%</span>
          <span><span className="text-amber-400">Amber</span> 60–70%</span>
          <span><span className="text-emerald-400">Emerald</span> &ge;70%</span>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-2">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={chartData}
            layout="vertical"
            barSize={11}
            barGap={3}
            barCategoryGap="35%"
            margin={{ top: 4, right: 56, left: 4, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />

            {/* Revenue axis — bottom */}
            <XAxis
              xAxisId="rev"
              type="number"
              orientation="bottom"
              tick={{ fontSize: 10, fill: TICK_FILL }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => "$" + (v / 1000).toFixed(0) + "k"}
            />

            {/* Gross margin axis — top, 0–100% */}
            <XAxis
              xAxisId="pct"
              type="number"
              orientation="top"
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: TICK_FILL }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v + "%"}
            />

            <YAxis
              type="category"
              dataKey="name"
              width={190}
              tick={{ fontSize: 10.5, fill: TICK_FILL }}
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
              formatter={(v: any, name: string | undefined) =>
                name === "revenue"
                  ? [fmtCurrency.format(v ?? 0), "Revenue"]
                  : [(v as number).toFixed(1) + "%", "Gross Margin"]
              }
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              labelFormatter={(_l: any, p: readonly any[]) => p[0]?.payload?.full ?? _l}
            />

            <Bar
              xAxisId="rev"
              dataKey="revenue"
              name="revenue"
              fill={REVENUE_BAR_COLOR}
              radius={[0, 3, 3, 0]}
              opacity={0.85}
            />
            <Bar
              xAxisId="pct"
              dataKey="grossMarginPct"
              name="grossMarginPct"
              radius={[0, 3, 3, 0]}
              opacity={0.9}
            >
              {chartData.map((entry) => (
                <Cell key={entry.full} fill={marginBarColor(entry.grossMargin)} />
              ))}
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

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
const LABEL_FILL = "hsl(220, 20%, 90%)";
const TICK_FILL = "hsl(220, 10%, 55%)";
const TOOLTIP_BG = "hsl(224, 18%, 9%)";
const TOOLTIP_BORDER = "1px solid hsl(224, 14%, 16%)";
const REVENUE_COLOR = "hsl(220, 70%, 55%)";

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

  const allData = data
    .slice()
    .sort((a, b) => b.revenue - a.revenue)
    .map((r) => ({
      name: shortLabel(r.clientName),
      full: r.clientName,
      revenue: r.revenue,
      grossMargin: r.grossMargin,
      grossMarginPct: parseFloat((r.grossMargin * 100).toFixed(1)),
    }));

  const chartData = showAll ? allData : allData.slice(0, DEFAULT_VISIBLE);
  const hiddenCount = allData.length - DEFAULT_VISIBLE;

  const chartHeight = chartData.length * 52 + 40;

  const maxRevenue = Math.max(...chartData.map((d) => d.revenue)) * 1.15;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const labelFormatter = (_l: any, p: readonly any[]) => {
    const payload = p[0]?.payload;
    if (!payload) return _l;
    return payload.full;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipFormatter = (v: any, name: string | undefined) => {
    if (name === "revenue") {
      return [fmtCurrency.format(v), "Revenue"];
    }
    if (name === "grossMarginPct") {
      return [(v as number).toFixed(1) + "%", "Gross Margin"];
    }
    return [v, name];
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Revenue by Client */}
      <Card>
        <CardHeader className="p-5 pb-2">
          <CardTitle className="text-base font-semibold">
            Revenue by Client
          </CardTitle>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="inline-block h-2 w-3 rounded-sm bg-[hsl(220,70%,55%)]" />
            Revenue ($)
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-2">
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              data={chartData}
              layout="vertical"
              barSize={18}
              margin={{ top: 4, right: 60, left: 4, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={GRID_STROKE}
                horizontal={false}
              />
              <XAxis
                type="number"
                domain={[0, maxRevenue]}
                tick={{ fontSize: 10, fill: TICK_FILL }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => "$" + (v / 1000).toFixed(0) + "k"}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={190}
                tick={{ fontSize: 11, fill: LABEL_FILL }}
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
                formatter={tooltipFormatter}
                labelFormatter={labelFormatter}
              />
              <Bar
                dataKey="revenue"
                name="revenue"
                fill={REVENUE_COLOR}
                radius={[0, 3, 3, 0]}
                opacity={0.85}
              >
                <LabelList
                  dataKey="revenue"
                  position="right"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(v: any) => "$" + ((v as number) / 1000).toFixed(0) + "k"}
                  style={{ fontSize: 10, fill: TICK_FILL }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gross Margin by Client */}
      <Card>
        <CardHeader className="p-5 pb-2">
          <CardTitle className="text-base font-semibold">
            Gross Margin by Client
          </CardTitle>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
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
              barSize={18}
              margin={{ top: 4, right: 60, left: 4, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={GRID_STROKE}
                horizontal={false}
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: TICK_FILL }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => v.toFixed(0) + "%"}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={190}
                tick={{ fontSize: 11, fill: LABEL_FILL }}
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
                formatter={tooltipFormatter}
                labelFormatter={labelFormatter}
              />
              <Bar
                dataKey="grossMarginPct"
                name="grossMarginPct"
                radius={[0, 3, 3, 0]}
                opacity={0.9}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.full}
                    fill={marginBarColor(entry.grossMargin)}
                  />
                ))}
                <LabelList
                  dataKey="grossMarginPct"
                  position="right"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(v: any) => (v as number).toFixed(1) + "%"}
                  style={{ fontSize: 10, fill: TICK_FILL }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {hiddenCount > 0 && (
        <div className="col-span-full flex justify-center border-t border-border pt-3">
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
    </div>
  );
}

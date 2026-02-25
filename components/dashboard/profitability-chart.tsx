"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClientProfitabilityRow } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Props {
  data: ClientProfitabilityRow[];
}

function shortName(name: string) {
  // First word or first meaningful abbreviation
  const words = name.split(/\s+/);
  if (words.length <= 2) return name.length > 12 ? words[0] : name;
  return words[0].length > 8 ? words[0].substring(0, 8) + "…" : words[0];
}

function marginColor(margin: number) {
  if (margin < 0.6) return "hsl(0, 72%, 51%)";
  if (margin < 0.7) return "hsl(37, 91%, 55%)";
  return "hsl(160, 84%, 39%)";
}

const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function ProfitabilityChart({ data }: Props) {
  const top10 = data.slice(0, 12);
  const chartData = top10.map((r) => ({
    name: shortName(r.clientName),
    full: r.clientName,
    revenue: r.revenue,
    costs: r.costs,
    grossProfit: r.grossProfit,
    grossMargin: r.grossMargin,
  }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Revenue by Client */}
      <Card>
        <CardHeader className="p-5 pb-0">
          <CardTitle className="text-base font-semibold">Revenue by Client (Top 12)</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-3">
          <ResponsiveContainer width="100%" height={288}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(224, 14%, 16%)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "hsl(220, 10%, 55%)" }}
                axisLine={false}
                tickLine={false}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(220, 10%, 55%)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => "$" + (v / 1000).toFixed(0) + "k"}
              />
              <Tooltip
                cursor={{ fill: "hsl(220, 14%, 12%)" }}
                contentStyle={{ background: "hsl(224, 18%, 9%)", border: "1px solid hsl(224, 14%, 16%)", borderRadius: 8, fontSize: 12 }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(v: any) => [fmt.format(v ?? 0), "Revenue"]}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                labelFormatter={(_l: any, p: readonly any[]) => p[0]?.payload?.full ?? _l}
              />
              <Bar dataKey="revenue" fill="hsl(220, 70%, 55%)" radius={[3, 3, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gross Margin by Client */}
      <Card>
        <CardHeader className="p-5 pb-0">
          <CardTitle className="text-base font-semibold">Gross Margin % (Top 12)</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-3">
          <ResponsiveContainer width="100%" height={288}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(224, 14%, 16%)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "hsl(220, 10%, 55%)" }}
                axisLine={false}
                tickLine={false}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(220, 10%, 55%)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => (v * 100).toFixed(0) + "%"}
                domain={[0, 1]}
              />
              <Tooltip
                cursor={{ fill: "hsl(220, 14%, 12%)" }}
                contentStyle={{ background: "hsl(224, 18%, 9%)", border: "1px solid hsl(224, 14%, 16%)", borderRadius: 8, fontSize: 12 }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(v: any) => [(v * 100).toFixed(1) + "%", "Gross Margin"]}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                labelFormatter={(_l: any, p: readonly any[]) => p[0]?.payload?.full ?? _l}
              />
              <Bar dataKey="grossMargin" radius={[3, 3, 0, 0]} opacity={0.9}>
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={marginColor(entry.grossMargin)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

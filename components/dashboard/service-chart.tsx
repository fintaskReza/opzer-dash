"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ServiceProfitabilityRow } from "@/lib/types";
import {
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

interface Props {
  data: ServiceProfitabilityRow[];
}

// Service → chart color (matches ServicePill colors)
const SERVICE_COLOR: Record<string, string> = {
  "Bookkeeping":            "hsl(37, 91%, 55%)",
  "CFO Advisory":           "hsl(220, 70%, 55%)",
  "Controller / Accounting":"hsl(160, 84%, 39%)",
  "Financial Reporting":    "hsl(280, 65%, 60%)",
  "Payroll":                "hsl(220, 10%, 55%)",
};

function colorFor(name: string) {
  return SERVICE_COLOR[name] ?? "hsl(220, 10%, 55%)";
}

const TOOLTIP_STYLE = {
  background: "hsl(224, 18%, 9%)",
  border: "1px solid hsl(224, 14%, 16%)",
  borderRadius: 8,
  fontSize: 12,
};

const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

// Custom donut label — % of total revenue
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DonutLabel(props: any) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  if ((percent ?? 0) < 0.06) return null;
  const RADIAN = Math.PI / 180;
  const r = (innerRadius ?? 0) + ((outerRadius ?? 0) - (innerRadius ?? 0)) * 0.55;
  const x = (cx ?? 0) + r * Math.cos(-(midAngle ?? 0) * RADIAN);
  const y = (cy ?? 0) + r * Math.sin(-(midAngle ?? 0) * RADIAN);
  return (
    <text x={x} y={y} fill="hsl(210 20% 95%)" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={500}>
      {((percent ?? 0) * 100).toFixed(0)}%
    </text>
  );
}

export function ServiceChart({ data }: Props) {
  const sorted = [...data].sort((a, b) => b.revenue - a.revenue);

  // Stacked bar data: Gross Profit (bottom) + Labor Cost (top)
  const stackData = sorted.map((r) => ({
    name: r.serviceName,
    grossProfit: r.grossProfit,
    laborCost: r.costs,
    total: r.revenue,
  }));

  // Donut data: revenue share
  const donutData = sorted.map((r) => ({
    name: r.serviceName,
    value: r.revenue,
  }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Revenue composition stacked bar */}
      <Card>
        <CardHeader className="p-5 pb-0">
          <CardTitle className="text-base font-semibold">Revenue vs. Labor Cost by Service</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">Gross profit (teal) stacked with labor cost (amber)</p>
        </CardHeader>
        <CardContent className="p-5 pt-3">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stackData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(224, 14%, 16%)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: "hsl(220, 10%, 55%)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => "$" + (v / 1000).toFixed(0) + "k"}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 10, fill: "hsl(220, 10%, 55%)" }}
                axisLine={false}
                tickLine={false}
                width={130}
              />
              <Tooltip
                cursor={{ fill: "hsl(220, 14%, 12%)" }}
                contentStyle={TOOLTIP_STYLE}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(v: any, name: any) => [
                  fmt.format(v ?? 0),
                  name === "grossProfit" ? "Gross Profit" : "Labor Cost",
                ]}
              />
              <Bar dataKey="grossProfit" stackId="a" fill="hsl(160, 84%, 39%)" opacity={0.85} radius={[0, 0, 0, 0]} />
              <Bar dataKey="laborCost"   stackId="a" fill="hsl(37, 91%, 55%)"  opacity={0.85} radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex items-center gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-primary opacity-85" />Gross Profit</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-amber-400 opacity-85" />Labor Cost</span>
          </div>
        </CardContent>
      </Card>

      {/* Revenue share donut */}
      <Card>
        <CardHeader className="p-5 pb-0">
          <CardTitle className="text-base font-semibold">Revenue Share by Service</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">% of total revenue attributed per service line</p>
        </CardHeader>
        <CardContent className="p-5 pt-3">
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  labelLine={false}
                  label={DonutLabel}
                >
                  {donutData.map((entry) => (
                    <Cell key={entry.name} fill={colorFor(entry.name)} opacity={0.9} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(v: any) => [fmt.format(v ?? 0), "Revenue"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1.5">
            {donutData.map((d) => {
              const total = donutData.reduce((s, x) => s + x.value, 0);
              return (
                <span key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: colorFor(d.name) }} />
                  <span>{d.name}</span>
                  <span className="font-mono text-foreground">{total > 0 ? ((d.value / total) * 100).toFixed(0) : 0}%</span>
                </span>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

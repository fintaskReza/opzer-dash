"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TeamMemberUtilizationRow } from "@/lib/types";
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
  data: TeamMemberUtilizationRow[];
}

function utilColor(pct: number) {
  if (pct < 0.5) return "hsl(0, 72%, 51%)";
  if (pct < 0.7) return "hsl(37, 91%, 55%)";
  if (pct <= 0.9) return "hsl(160, 84%, 39%)";
  return "hsl(37, 91%, 55%)";
}

export function UtilizationChart({ data }: Props) {
  const chartData = data.map((r) => ({
    name: r.memberName.split(" ")[0],
    full: r.memberName,
    util: r.utilizationPct,
    clientHours: r.clientHours,
    capacity: r.capacityHours,
  }));

  return (
    <Card>
      <CardHeader className="p-5 pb-0">
        <CardTitle className="text-base font-semibold">Team Utilization %</CardTitle>
        <p className="mt-0.5 text-xs text-muted-foreground">Client hours as % of total capacity in period</p>
      </CardHeader>
      <CardContent className="p-5 pt-3">
        <ResponsiveContainer width="100%" height={288}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(224, 14%, 16%)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "hsl(220, 10%, 55%)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(220, 10%, 55%)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => (v * 100).toFixed(0) + "%"}
              domain={[0, 1]}
            />
            <Tooltip
              cursor={{ fill: "hsl(220, 14%, 12%)" }}
              contentStyle={{
                background: "hsl(224, 18%, 9%)",
                border: "1px solid hsl(224, 14%, 16%)",
                borderRadius: 8,
                fontSize: 12,
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any, _name: any, props: any) => [
                ((v ?? 0) * 100).toFixed(1) + "% utilization",
                props.payload?.full ?? "",
              ]}
            />
            <Bar dataKey="util" radius={[3, 3, 0, 0]} opacity={0.9}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={utilColor(entry.util)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {[
            { color: "bg-rose-400", label: "< 50% — underutilized" },
            { color: "bg-amber-400", label: "50–70% — moderate" },
            { color: "bg-emerald-400", label: "70–90% — healthy" },
            { color: "bg-amber-400", label: "> 90% — at risk" },
          ].map((l) => (
            <span key={l.label} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${l.color}`} />
              {l.label}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

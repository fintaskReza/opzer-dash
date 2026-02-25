"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TeamMemberUtilizationRow, UtilizationMetricKey } from "@/lib/types";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

interface Props {
  data: TeamMemberUtilizationRow[];
  enabledMetrics: Set<UtilizationMetricKey>;
}

type SortDir = "asc" | "desc";
type SortKey = keyof TeamMemberUtilizationRow;

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function fmtPct(n: number) {
  return (n * 100).toFixed(1) + "%";
}

function fmtHrs(n: number) {
  return n.toFixed(1) + " hrs";
}

function utilizationClass(pct: number) {
  if (pct < 0.5) return "text-rose-400";
  if (pct < 0.7) return "text-amber-400";
  if (pct <= 0.9) return "text-emerald-400";
  return "text-amber-400";
}

function utilizationBg(pct: number) {
  if (pct < 0.5) return "bg-rose-400/10";
  if (pct < 0.7) return "bg-amber-400/10";
  if (pct <= 0.9) return "bg-emerald-400/10";
  return "bg-amber-400/10";
}

const METRIC_COLUMNS: { key: UtilizationMetricKey; label: string; format: (v: number) => string }[] = [
  { key: "clientHours", label: "Client Hrs", format: fmtHrs },
  { key: "internalHours", label: "Internal Hrs", format: fmtHrs },
  { key: "totalHours", label: "Total Hrs", format: fmtHrs },
  { key: "capacityHours", label: "Capacity", format: fmtHrs },
  { key: "utilizationPct", label: "Utilization %", format: fmtPct },
  { key: "attributedRevenue", label: "Attributed Rev.", format: fmtCurrency },
  { key: "avgHourlyRate", label: "Avg. Rate", format: (v) => "$" + v.toFixed(0) + "/hr" },
];

export function TeamUtilizationTable({ data, enabledMetrics }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("utilizationPct");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const visibleCols = METRIC_COLUMNS.filter((c) => enabledMetrics.has(c.key));

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = [...data].sort((a, b) => {
    const av = (a[sortKey] as number) ?? 0;
    const bv = (b[sortKey] as number) ?? 0;
    if (typeof av === "string") return 0;
    return sortDir === "asc" ? av - bv : bv - av;
  });

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronsUpDown className="h-3 w-3 text-muted-foreground" />;
    return sortDir === "asc"
      ? <ChevronUp className="h-3 w-3 text-primary" />
      : <ChevronDown className="h-3 w-3 text-primary" />;
  }

  return (
    <Card>
      <CardHeader className="p-5 pb-0">
        <CardTitle className="text-base font-semibold">Team Utilization</CardTitle>
        <p className="mt-0.5 text-xs text-muted-foreground">{data.length} active team members</p>
      </CardHeader>
      <CardContent className="p-5 pt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th
                  className="cursor-pointer pb-2 pr-4 text-left text-xs font-medium text-muted-foreground hover:text-foreground whitespace-nowrap"
                  onClick={() => handleSort("memberName")}
                >
                  <span className="flex items-center gap-1">Team Member <SortIcon col="memberName" /></span>
                </th>
                <th
                  className="cursor-pointer pb-2 pr-4 text-left text-xs font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => handleSort("role")}
                >
                  <span className="flex items-center gap-1">Role <SortIcon col="role" /></span>
                </th>
                {visibleCols.map((col) => (
                  <th
                    key={col.key}
                    className="cursor-pointer pb-2 px-3 text-right text-xs font-medium text-muted-foreground hover:text-foreground whitespace-nowrap"
                    onClick={() => handleSort(col.key as SortKey)}
                  >
                    <span className="flex items-center justify-end gap-1">
                      {col.label}
                      <SortIcon col={col.key as SortKey} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => (
                <tr
                  key={row.memberName}
                  className={`border-b border-border/50 transition-colors hover:bg-muted/30 ${i % 2 === 0 ? "" : "bg-muted/10"}`}
                >
                  <td className="py-2.5 pr-4 font-medium text-foreground whitespace-nowrap">{row.memberName}</td>
                  <td className="py-2.5 pr-4 text-xs text-muted-foreground whitespace-nowrap">{row.role}</td>
                  {visibleCols.map((col) => {
                    const val = row[col.key as keyof TeamMemberUtilizationRow] as number ?? 0;
                    const isUtil = col.key === "utilizationPct";
                    return (
                      <td key={col.key} className="py-2.5 px-3 text-right font-mono text-xs whitespace-nowrap">
                        {isUtil ? (
                          <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${utilizationClass(val)} ${utilizationBg(val)}`}>
                            {col.format(val)}
                          </span>
                        ) : (
                          <span className="text-foreground">{col.format(val)}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {data.length === 0 && (
            <p className="py-8 text-center text-xs text-muted-foreground">No data for selected filters.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClientProfitabilityRow, MetricKey } from "@/lib/types";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

interface Props {
  data: ClientProfitabilityRow[];
  enabledMetrics: Set<MetricKey>;
}

type SortDir = "asc" | "desc" | null;
type SortKey = keyof ClientProfitabilityRow;

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtPct(n: number) {
  return (n * 100).toFixed(1) + "%";
}

function fmtHrs(n: number) {
  return n.toFixed(1) + " hrs";
}

function fmtVariance(n: number) {
  const sign = n >= 0 ? "+" : "";
  return sign + fmtCurrency(n);
}

function marginClass(margin: number) {
  if (margin < 0.6) return "text-rose-400";
  if (margin < 0.7) return "text-amber-400";
  return "text-emerald-400";
}

function marginBg(margin: number) {
  if (margin < 0.6) return "bg-rose-400/10";
  if (margin < 0.7) return "bg-amber-400/10";
  return "bg-emerald-400/10";
}

interface ColDef {
  key: MetricKey;
  label: string;
  format: (v: number) => string;
  colorFn?: (v: number, row: ClientProfitabilityRow) => string;
  isBadge?: boolean;
}

const METRIC_COLUMNS: ColDef[] = [
  { key: "revenue", label: "Revenue", format: fmtCurrency },
  { key: "hours", label: "Hours", format: fmtHrs },
  { key: "costs", label: "Labor Cost", format: fmtCurrency },
  { key: "grossProfit", label: "Gross Profit", format: fmtCurrency, colorFn: (v) => v >= 0 ? "text-emerald-400" : "text-rose-400" },
  { key: "grossMargin", label: "Gross Margin", format: fmtPct, isBadge: true },
  { key: "effectiveHourlyRate", label: "EHR", format: (v) => "$" + v.toFixed(0) + "/hr" },
  { key: "wip", label: "WIP", format: fmtCurrency },
  { key: "realizationRate", label: "Realization", format: fmtPct },
  { key: "budget", label: "Budget", format: fmtCurrency },
  { key: "budgetVariance", label: "vs Budget", format: fmtVariance, colorFn: (v) => v >= 0 ? "text-emerald-400" : "text-rose-400" },
  { key: "onshoreHours", label: "Onshore Hrs", format: fmtHrs },
  { key: "offshoreHours", label: "Offshore Hrs", format: fmtHrs },
];

export function ClientProfitabilityTable({ data, enabledMetrics }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("revenue");
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
    return sortDir === "asc" ? av - bv : bv - av;
  });

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronsUpDown className="h-3 w-3 text-muted-foreground" />;
    return sortDir === "asc" ? (
      <ChevronUp className="h-3 w-3 text-primary" />
    ) : (
      <ChevronDown className="h-3 w-3 text-primary" />
    );
  }

  return (
    <Card>
      <CardHeader className="p-5 pb-0">
        <CardTitle className="text-base font-semibold">Profitability by Client</CardTitle>
        <p className="mt-0.5 text-xs text-muted-foreground">{data.length} clients in selected period</p>
      </CardHeader>
      <CardContent className="p-5 pt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th
                  className="cursor-pointer pb-2 pr-4 text-left text-xs font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => handleSort("clientName" as SortKey)}
                >
                  <span className="flex items-center gap-1">
                    Client
                    <SortIcon col={"clientName" as SortKey} />
                  </span>
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
                  key={row.clientName}
                  className={`border-b border-border/50 transition-colors hover:bg-muted/30 ${
                    i % 2 === 0 ? "" : "bg-muted/10"
                  }`}
                >
                  <td className="py-2.5 pr-4 font-medium text-foreground max-w-[240px]">
                    <span className="block truncate" title={row.clientName}>
                      {row.clientName}
                    </span>
                  </td>
                  {visibleCols.map((col) => {
                    const val = (row[col.key as keyof ClientProfitabilityRow] as number) ?? 0;
                    const isMargin = col.key === "grossMargin";
                    const colorClass = col.colorFn ? col.colorFn(val, row) : undefined;
                    return (
                      <td
                        key={col.key}
                        className="py-2.5 px-3 text-right font-mono text-xs whitespace-nowrap"
                      >
                        {isMargin ? (
                          <span
                            className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${marginClass(val)} ${marginBg(val)}`}
                          >
                            {col.format(val)}
                          </span>
                        ) : colorClass ? (
                          <span className={colorClass}>{col.format(val)}</span>
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
            <p className="py-8 text-center text-xs text-muted-foreground">
              No data for selected filters.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ServiceProfitabilityRow } from "@/lib/types";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

interface Props {
  data: ServiceProfitabilityRow[];
}

type SortDir = "asc" | "desc";
type SortKey = keyof ServiceProfitabilityRow;

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

function ServicePill({ name }: { name: string }) {
  const styles: Record<string, string> = {
    "CFO Advisory": "bg-blue-500/15 text-blue-400 border border-blue-500/20",
    "Financial Reporting": "bg-purple-500/15 text-purple-400 border border-purple-500/20",
    "Controller / Accounting": "bg-primary/15 text-primary border border-primary/20",
    "Bookkeeping": "bg-amber-500/15 text-amber-400 border border-amber-500/20",
    "Payroll": "bg-muted text-muted-foreground border border-border",
  };
  const cls = styles[name] ?? "bg-muted text-muted-foreground border border-border";
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium whitespace-nowrap ${cls}`}>
      {name}
    </span>
  );
}

const COLUMNS: { key: SortKey; label: string; format?: (v: number) => string; isSpecial?: boolean }[] = [
  { key: "revenue", label: "Revenue", format: fmtCurrency },
  { key: "hours", label: "Hours", format: fmtHrs },
  { key: "costs", label: "Labor Cost", format: fmtCurrency },
  { key: "wip", label: "WIP", format: fmtCurrency },
  { key: "grossProfit", label: "Gross Profit", format: fmtCurrency },
  { key: "grossMargin", label: "Gross Margin", isSpecial: true },
  { key: "effectiveHourlyRate", label: "EHR", format: (v) => "$" + v.toFixed(0) + "/hr" },
  { key: "clientCount", label: "# Clients", format: (v) => v.toFixed(0) },
];

export function ServiceProfitabilityTable({ data }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("revenue");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

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
        <CardTitle className="text-base font-semibold">Profitability by Service</CardTitle>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {data.length} service lines — revenue weighted by hours share
        </p>
      </CardHeader>
      <CardContent className="p-5 pt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th
                  className="cursor-pointer pb-2 pr-4 text-left text-xs font-medium text-muted-foreground hover:text-foreground whitespace-nowrap"
                  onClick={() => handleSort("serviceName")}
                >
                  <span className="flex items-center gap-1">
                    Service
                    <SortIcon col="serviceName" />
                  </span>
                </th>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className="cursor-pointer pb-2 px-3 text-right text-xs font-medium text-muted-foreground hover:text-foreground whitespace-nowrap"
                    onClick={() => handleSort(col.key)}
                  >
                    <span className="flex items-center justify-end gap-1">
                      {col.label}
                      <SortIcon col={col.key} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => (
                <tr
                  key={row.serviceName}
                  className={`border-b border-border/50 transition-colors hover:bg-muted/30 ${
                    i % 2 === 0 ? "" : "bg-muted/10"
                  }`}
                >
                  <td className="py-2.5 pr-4 font-medium text-foreground">
                    <ServicePill name={row.serviceName} />
                  </td>
                  {COLUMNS.map((col) => {
                    const val = (row[col.key] as number) ?? 0;
                    const isMargin = col.key === "grossMargin";
                    const isProfit = col.key === "grossProfit";
                    return (
                      <td
                        key={col.key}
                        className="py-2.5 px-3 text-right font-mono text-xs whitespace-nowrap"
                      >
                        {isMargin ? (
                          <span
                            className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${marginClass(val)} ${marginBg(val)}`}
                          >
                            {fmtPct(val)}
                          </span>
                        ) : isProfit ? (
                          <span className={val >= 0 ? "text-emerald-400" : "text-rose-400"}>
                            {col.format ? col.format(val) : val}
                          </span>
                        ) : (
                          <span className="text-foreground">
                            {col.format ? col.format(val) : val}
                          </span>
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

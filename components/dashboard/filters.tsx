"use client";

import useSWR from "swr";
import type { DashboardFilters, Client } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { useState } from "react";

interface Props {
  filters: DashboardFilters;
  onChange: (f: DashboardFilters) => void;
  orgId?: number | null;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const PERIOD_PRESETS = [
  "Last month",
  "Last month to date",
  "Last month to today",
  "Last quarter",
  "Last quarter to date",
  "Last quarter to today",
  "Last fiscal quarter",
  "Last fiscal quarter to date",
  "Last year",
  "Custom",
] as const;

type PeriodPreset = (typeof PERIOD_PRESETS)[number];

function fmt(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getLastMonthRange() {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  return {
    from: new Date(y, m - 1, 1),
    to: new Date(y, m, 0),
  };
}

function getLastQuarterRange() {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  const currentQ = Math.floor(m / 3);
  const lastQ = currentQ === 0 ? 3 : currentQ - 1;
  const lastQYear = currentQ === 0 ? y - 1 : y;
  return {
    from: new Date(lastQYear, lastQ * 3, 1),
    to: new Date(lastQYear, lastQ * 3 + 3, 0),
  };
}

function getLastFiscalQuarterRange() {
  // Fiscal year starts April: FQ1=Apr–Jun, FQ2=Jul–Sep, FQ3=Oct–Dec, FQ4=Jan–Mar
  const today = new Date();
  const m = today.getMonth();
  const y = today.getFullYear();

  let currentFQStartM: number;
  let currentFQStartY: number;
  if (m >= 3 && m <= 5) { currentFQStartM = 3; currentFQStartY = y; }
  else if (m >= 6 && m <= 8) { currentFQStartM = 6; currentFQStartY = y; }
  else if (m >= 9 && m <= 11) { currentFQStartM = 9; currentFQStartY = y; }
  else { currentFQStartM = 0; currentFQStartY = y; } // Jan–Mar

  // Go back one fiscal quarter
  let lastFQStartM: number;
  let lastFQStartY: number;
  if (currentFQStartM === 3) { lastFQStartM = 0; lastFQStartY = currentFQStartY; }
  else if (currentFQStartM === 6) { lastFQStartM = 3; lastFQStartY = currentFQStartY; }
  else if (currentFQStartM === 9) { lastFQStartM = 6; lastFQStartY = currentFQStartY; }
  else { lastFQStartM = 9; lastFQStartY = currentFQStartY - 1; } // Jan–Mar → prev Oct–Dec

  return {
    from: new Date(lastFQStartY, lastFQStartM, 1),
    to: new Date(lastFQStartY, lastFQStartM + 3, 0),
  };
}

function getPresetDates(preset: PeriodPreset): { from: string; to: string } | null {
  const today = new Date();

  switch (preset) {
    case "Last month": {
      const { from, to } = getLastMonthRange();
      return { from: fmt(from), to: fmt(to) };
    }
    case "Last month to date": {
      const { from } = getLastMonthRange();
      const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
      const toDay = Math.min(today.getDate(), lastDayOfLastMonth);
      return { from: fmt(from), to: fmt(new Date(from.getFullYear(), from.getMonth(), toDay)) };
    }
    case "Last month to today": {
      const { from } = getLastMonthRange();
      return { from: fmt(from), to: fmt(today) };
    }
    case "Last quarter": {
      const { from, to } = getLastQuarterRange();
      return { from: fmt(from), to: fmt(to) };
    }
    case "Last quarter to date": {
      const { from, to } = getLastQuarterRange();
      // Days elapsed so far in current quarter
      const currentQStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
      const daysElapsed = Math.floor((today.getTime() - currentQStart.getTime()) / 86400000);
      const toDate = new Date(from.getTime() + daysElapsed * 86400000);
      return { from: fmt(from), to: fmt(toDate > to ? to : toDate) };
    }
    case "Last quarter to today": {
      const { from } = getLastQuarterRange();
      return { from: fmt(from), to: fmt(today) };
    }
    case "Last fiscal quarter": {
      const { from, to } = getLastFiscalQuarterRange();
      return { from: fmt(from), to: fmt(to) };
    }
    case "Last fiscal quarter to date": {
      const { from, to } = getLastFiscalQuarterRange();
      const currentFQStart = (() => {
        const m = today.getMonth();
        const y = today.getFullYear();
        if (m >= 3 && m <= 5) return new Date(y, 3, 1);
        if (m >= 6 && m <= 8) return new Date(y, 6, 1);
        if (m >= 9 && m <= 11) return new Date(y, 9, 1);
        return new Date(y, 0, 1);
      })();
      const daysElapsed = Math.floor((today.getTime() - currentFQStart.getTime()) / 86400000);
      const toDate = new Date(from.getTime() + daysElapsed * 86400000);
      return { from: fmt(from), to: fmt(toDate > to ? to : toDate) };
    }
    case "Last year": {
      const y = today.getFullYear() - 1;
      return { from: `${y}-01-01`, to: `${y}-12-31` };
    }
    case "Custom":
      return null;
  }
}

function detectPreset(dateFrom: string, dateTo: string): PeriodPreset {
  for (const preset of PERIOD_PRESETS) {
    if (preset === "Custom") continue;
    const result = getPresetDates(preset);
    if (result && result.from === dateFrom && result.to === dateTo) return preset;
  }
  return "Custom";
}

export function DashboardFilters({ filters, onChange, orgId }: Props) {
  const [clientSearch, setClientSearch] = useState("");
  // orgId===null means super-admin with no org selected yet — skip fetch
  const clientsKey = orgId === null ? null : orgId != null ? `/api/clients?orgId=${orgId}` : "/api/clients";
  const { data: clientsRaw } = useSWR<Client[]>(clientsKey, fetcher);
  const clients = Array.isArray(clientsRaw) ? clientsRaw : [];

  const activeClients = clients
    .filter((c) => c.status === "Active")
    .map((c) => c.karbonName)
    .sort();

  const currentPreset = detectPreset(filters.dateFrom, filters.dateTo);

  function setField<K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  function toggleClient(name: string) {
    const s = new Set(filters.selectedClients);
    s.has(name) ? s.delete(name) : s.add(name);
    setField("selectedClients", Array.from(s));
  }

  function clearClients() {
    setField("selectedClients", []);
  }

  function handlePresetChange(preset: PeriodPreset) {
    const dates = getPresetDates(preset);
    if (dates) onChange({ ...filters, dateFrom: dates.from, dateTo: dates.to });
  }

  const filtered = clientSearch
    ? activeClients.filter((c) => c.toLowerCase().includes(clientSearch.toLowerCase()))
    : activeClients;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end gap-4 flex-wrap">
        {/* Report period dropdown */}
        <div>
          <Label className="text-xs text-muted-foreground">Report period</Label>
          <Select value={currentPreset} onValueChange={(v) => handlePresetChange(v as PeriodPreset)}>
            <SelectTrigger className="mt-1 h-8 w-52 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_PRESETS.map((p) => (
                <SelectItem key={p} value={p} className="text-xs">
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date range */}
        <div className="flex items-end gap-2">
          <div>
            <Label className="text-xs text-muted-foreground">From</Label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setField("dateFrom", e.target.value)}
              className="mt-1 h-8 w-36 text-xs"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">To</Label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setField("dateTo", e.target.value)}
              className="mt-1 h-8 w-36 text-xs"
            />
          </div>
        </div>

        {/* Client filter — pushed to far right */}
        <div className="relative ml-auto min-w-[220px]">
          <Label className="text-xs text-muted-foreground">Filter Clients</Label>
          <div className="mt-1 flex items-center gap-1">
            <Input
              placeholder="Search clients..."
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              className="h-8 text-xs"
            />
            {filters.selectedClients.length > 0 && (
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={clearClients}>
                Clear ({filters.selectedClients.length})
              </Button>
            )}
          </div>
          {clientSearch && (
            <div className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-md border border-border bg-popover shadow-lg">
              {filtered.slice(0, 20).map((c) => (
                <button
                  key={c}
                  className={`flex w-full items-center px-3 py-1.5 text-left text-xs hover:bg-accent ${filters.selectedClients.includes(c) ? "text-primary" : "text-foreground"}`}
                  onClick={() => { toggleClient(c); setClientSearch(""); }}
                >
                  <span className="truncate">{c}</span>
                  {filters.selectedClients.includes(c) && <X className="ml-auto h-3 w-3 shrink-0" />}
                </button>
              ))}
              {filtered.length === 0 && <p className="px-3 py-2 text-xs text-muted-foreground">No match</p>}
            </div>
          )}
        </div>
      </div>

      {/* Active client chips */}
      {filters.selectedClients.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filters.selectedClients.map((c) => (
            <Badge key={c} variant="secondary" className="text-xs gap-1 pr-1">
              <span className="max-w-[140px] truncate">{c}</span>
              <button onClick={() => toggleClient(c)} className="ml-0.5 rounded hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

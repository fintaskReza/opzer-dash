"use client";

import { CLIENTS } from "@/lib/data";
import type { DashboardFilters } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useState } from "react";

interface Props {
  filters: DashboardFilters;
  onChange: (f: DashboardFilters) => void;
}

const ACTIVE_CLIENTS = CLIENTS.filter((c) => c.status === "Active").map((c) => c.karbonName).sort();

export function DashboardFilters({ filters, onChange }: Props) {
  const [clientSearch, setClientSearch] = useState("");

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

  const filtered = clientSearch
    ? ACTIVE_CLIENTS.filter((c) => c.toLowerCase().includes(clientSearch.toLowerCase()))
    : ACTIVE_CLIENTS;

  return (
    <div className="flex flex-wrap items-end gap-4">
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

      {/* Quick date presets */}
      <div className="flex items-center gap-1.5">
        {[
          { label: "Jun 2025", from: "2025-06-01", to: "2025-06-30" },
          { label: "Jul 2025", from: "2025-07-01", to: "2025-07-31" },
          { label: "Aug 2025", from: "2025-08-01", to: "2025-08-31" },
          { label: "Q3 2025", from: "2025-07-01", to: "2025-09-30" },
          { label: "All", from: "2025-01-01", to: "2025-12-31" },
        ].map((p) => (
          <Button
            key={p.label}
            variant={filters.dateFrom === p.from && filters.dateTo === p.to ? "default" : "secondary"}
            size="sm"
            className="h-8 px-2.5 text-xs"
            onClick={() => onChange({ ...filters, dateFrom: p.from, dateTo: p.to })}
          >
            {p.label}
          </Button>
        ))}
      </div>

      {/* Client filter */}
      <div className="relative min-w-[200px]">
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

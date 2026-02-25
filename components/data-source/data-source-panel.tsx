"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TimeEntry, RevenueEntry } from "@/lib/types";
import {
  Database,
  FileUp,
  Table,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  DollarSign,
  PlugZap,
  RotateCcw,
} from "lucide-react";
import { CsvImportWizard } from "./csv-import-wizard";

interface Props {
  onDataImport: (time: TimeEntry[], revenue: RevenueEntry[]) => void;
  onResetToSample: () => void;
}

type ModalType = "qbo" | "csv" | "sheets" | null;

const SOURCES = [
  {
    id: "sample",
    label: "Sample Data",
    description: "Pre-loaded demo dataset from Google Sheets — 44 time entries, 41 revenue records",
    status: "active" as const,
    icon: Database,
  },
  {
    id: "qbo",
    label: "QuickBooks Online",
    description: "Automatically sync invoices and payments via OAuth 2.0",
    status: "coming" as const,
    icon: Receipt,
  },
  {
    id: "csv",
    label: "CSV Import",
    description: "Upload time entries or revenue files — column auto-detection included",
    status: "available" as const,
    icon: FileUp,
  },
  {
    id: "sheets",
    label: "Google Sheets",
    description: "Connect a live spreadsheet and sync on demand",
    status: "coming" as const,
    icon: Table,
  },
] as const;

type SourceId = (typeof SOURCES)[number]["id"];

const ICON_STYLES: Record<string, string> = {
  active: "bg-emerald-400/15 text-emerald-400",
  available: "bg-primary/15 text-primary",
  coming: "bg-muted text-muted-foreground",
};

const ROW_STYLES: Record<string, string> = {
  active: "border-emerald-400/25 bg-emerald-400/5",
  available: "border-border bg-card hover:bg-muted/20 transition-colors",
  coming: "border-border bg-card opacity-60",
};

export function DataSourcePanel({ onDataImport, onResetToSample }: Props) {
  const [modal, setModal] = useState<ModalType>(null);
  const [qboStatus, setQboStatus] = useState<"idle" | "connecting" | "connected">("idle");

  function simulateQBOConnect() {
    setQboStatus("connecting");
    setTimeout(() => setQboStatus("connected"), 1800);
  }

  function closeModal() {
    setModal(null);
  }

  function getAction(id: SourceId) {
    if (id === "sample") return onResetToSample;
    if (id === "csv") return () => setModal("csv");
    if (id === "qbo") return () => setModal("qbo");
    if (id === "sheets") return () => setModal("sheets");
  }

  function getActionLabel(id: SourceId, status: string) {
    if (id === "sample") return <><RotateCcw className="mr-1.5 h-3 w-3" /> Reset to sample</>;
    if (status === "coming") return "Coming soon";
    if (id === "csv") return <>Import CSV</>;
    return <>Connect</>;
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <PlugZap className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">Data Sources</CardTitle>
              <p className="text-xs text-muted-foreground">Configure how data flows into your dashboard</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Source list */}
          <div className="divide-y divide-border">
            {SOURCES.map((s) => {
              const Icon = s.icon;
              const action = getAction(s.id);
              return (
                <div
                  key={s.id}
                  className={`relative flex items-center gap-4 px-6 py-4 ${ROW_STYLES[s.status]}`}
                >
                  {/* Active left accent */}
                  {s.status === "active" && (
                    <div className="absolute left-0 top-4 bottom-4 w-0.5 rounded-r-full bg-emerald-400" />
                  )}

                  {/* Icon */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${ICON_STYLES[s.status]}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{s.label}</span>
                      {s.status === "active" && (
                        <Badge className="h-4 bg-emerald-400/10 px-1.5 text-[10px] text-emerald-400">
                          <CheckCircle2 className="mr-0.5 h-2.5 w-2.5" />
                          Active
                        </Badge>
                      )}
                      {s.status === "coming" && (
                        <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                          Soon
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{s.description}</p>
                  </div>

                  {/* Action */}
                  <Button
                    size="sm"
                    variant={s.status === "active" ? "secondary" : "default"}
                    className="h-8 shrink-0 text-xs"
                    onClick={action}
                    disabled={s.status === "coming"}
                  >
                    {getActionLabel(s.id, s.status)}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* CSV schema reference */}
          <div className="border-t border-border bg-muted/20 px-6 py-4">
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              CSV Schema Reference
            </p>
            <div className="space-y-1.5">
              <div className="flex items-start gap-2.5">
                <Clock className="mt-px h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Time entries</span>
                  <span className="mx-1.5 text-border">·</span>
                  <code className="font-mono text-primary">clientName</code>
                  <span className="mx-1 text-border">·</span>
                  <code className="font-mono text-primary">teamMember</code>
                  <span className="mx-1 text-border">·</span>
                  <code className="font-mono text-primary">date</code>
                  <span className="mx-1 text-border">·</span>
                  <code className="font-mono text-primary">hours</code>
                  <span className="mx-1 text-border">·</span>
                  <code className="font-mono text-primary">serviceTag</code>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <DollarSign className="mt-px h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Revenue</span>
                  <span className="mx-1.5 text-border">·</span>
                  <code className="font-mono text-primary">clientName</code>
                  <span className="mx-1 text-border">·</span>
                  <code className="font-mono text-primary">month</code>
                  <span className="mx-1 text-border">·</span>
                  <code className="font-mono text-primary">amount</code>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CSV Import Wizard */}
      <CsvImportWizard open={modal === "csv"} onClose={closeModal} onImport={onDataImport} />

      {/* QBO Modal */}
      <Dialog open={modal === "qbo"} onOpenChange={(o) => !o && closeModal()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Connect QuickBooks Online</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {qboStatus === "idle" && (
              <>
                <p className="text-sm text-muted-foreground">
                  Connect your QBO account to automatically sync revenue data. You will be redirected to authorize
                  access.
                </p>
                <div className="rounded-md border border-amber-400/20 bg-amber-400/10 px-4 py-3">
                  <p className="flex items-center gap-2 text-xs font-medium text-amber-400">
                    <AlertCircle className="h-3.5 w-3.5" /> Demo mode
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Full QBO API integration is in development. This simulates the connection flow.
                  </p>
                </div>
                <Button className="w-full" onClick={simulateQBOConnect}>
                  Authorize with QuickBooks
                </Button>
              </>
            )}
            {qboStatus === "connecting" && (
              <div className="flex flex-col items-center gap-3 py-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Connecting to QuickBooks Online...</p>
              </div>
            )}
            {qboStatus === "connected" && (
              <div className="flex flex-col items-center gap-3 py-6">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                <p className="text-sm font-medium text-foreground">Connected successfully</p>
                <p className="text-center text-xs text-muted-foreground">
                  In production, revenue data would sync automatically every 24 hours.
                </p>
                <Button variant="secondary" onClick={closeModal}>
                  Done
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Google Sheets Modal */}
      <Dialog open={modal === "sheets"} onOpenChange={(o) => !o && closeModal()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Google Sheets</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-md border border-amber-400/20 bg-amber-400/10 px-4 py-3">
              <p className="flex items-center gap-2 text-xs font-medium text-amber-400">
                <AlertCircle className="h-3.5 w-3.5" /> Coming soon
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Live Google Sheets sync is in development. The current dataset is pre-loaded from the reference
                spreadsheet.
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Spreadsheet URL</Label>
              <Input placeholder="https://docs.google.com/spreadsheets/d/..." disabled className="text-xs" />
            </div>
            <Button disabled className="w-full text-xs">
              Connect (coming soon)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

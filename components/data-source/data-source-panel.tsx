"use client";

import { useState, useEffect } from "react";
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
  RefreshCw,
  Unplug,
  Trash2,
} from "lucide-react";
import { CsvImportWizard } from "./csv-import-wizard";

interface Props {
  onDataImport: (time: TimeEntry[], revenue: RevenueEntry[]) => Promise<void>;
  onResetToSample: () => Promise<void>;
}

type ModalType = "qbo" | "csv" | "sheets" | null;

interface DataSourceStatus {
  bySource: Record<string, { time: number; revenue: number }>;
  total: { time: number; revenue: number };
}

interface QBStatus {
  connected: boolean;
  companyName: string | null;
  connectedAt: string | null;
  lastUpdated: string | null;
}

const ICON_STYLES: Record<string, string> = {
  active: "bg-emerald-400/15 text-emerald-400",
  available: "bg-primary/15 text-primary",
  coming: "bg-muted text-muted-foreground",
  connected: "bg-emerald-400/15 text-emerald-400",
};

const ROW_STYLES: Record<string, string> = {
  active: "border-emerald-400/25 bg-emerald-400/5",
  available: "border-border bg-card hover:bg-muted/20 transition-colors",
  coming: "border-border bg-card opacity-60",
  connected: "border-emerald-400/25 bg-emerald-400/5",
};

export function DataSourcePanel({ onDataImport, onResetToSample }: Props) {
  const [modal, setModal] = useState<ModalType>(null);
  const [qbStatus, setQbStatus] = useState<QBStatus | null>(null);
  const [qbLoading, setQbLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [syncCount, setSyncCount] = useState<number | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);
  const [dataStatus, setDataStatus] = useState<DataSourceStatus | null>(null);
  const [seedLoading, setSeedLoading] = useState(false);

  useEffect(() => {
    fetchQbStatus();
    fetchDataStatus();
  }, []);

  async function fetchQbStatus() {
    setQbLoading(true);
    try {
      const res = await fetch("/api/integrations/quickbooks/status");
      if (res.ok) {
        const data: QBStatus = await res.json();
        setQbStatus(data);
      }
    } catch {
      // non-fatal — will show as disconnected
    } finally {
      setQbLoading(false);
    }
  }

  async function fetchDataStatus() {
    try {
      const res = await fetch("/api/data-sources/status");
      if (res.ok) setDataStatus(await res.json());
    } catch {
      // non-fatal
    }
  }

  function handleConnectQB() {
    // Redirect to OAuth login — browser will follow through to Intuit
    window.location.href = "/api/integrations/quickbooks/login";
  }

  async function handleSync() {
    setSyncStatus("syncing");
    setSyncCount(null);
    try {
      const res = await fetch("/api/integrations/quickbooks/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSyncCount(data.synced);
        setSyncStatus("success");
      } else {
        setSyncStatus("error");
      }
    } catch {
      setSyncStatus("error");
    }
  }

  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      await fetch("/api/integrations/quickbooks/disconnect", { method: "DELETE" });
      setQbStatus({ connected: false, companyName: null, connectedAt: null, lastUpdated: null });
      setSyncStatus("idle");
      setSyncCount(null);
    } finally {
      setDisconnecting(false);
    }
  }

  async function handleLoadSample() {
    setSeedLoading(true);
    try {
      await onResetToSample();
      await fetchDataStatus();
    } finally {
      setSeedLoading(false);
    }
  }

  async function handleRemoveSeed() {
    setSeedLoading(true);
    try {
      await fetch("/api/seed-data", { method: "DELETE" });
      await fetchDataStatus();
    } finally {
      setSeedLoading(false);
    }
  }

  function closeModal() {
    setModal(null);
  }

  const qbConnected = qbStatus?.connected === true;
  const qbRowStatus = qbConnected ? "connected" : "available";

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
          <div className="divide-y divide-border">
            {/* Sample Data */}
            {(() => {
              const seedCount = dataStatus?.bySource["seed"];
              const seedActive = (seedCount?.time ?? 0) > 0 || (seedCount?.revenue ?? 0) > 0;
              return (
                <div className={`relative flex items-center gap-4 px-6 py-4 ${seedActive ? ROW_STYLES["active"] : ROW_STYLES["available"]}`}>
                  {seedActive && <div className="absolute left-0 top-4 bottom-4 w-0.5 rounded-r-full bg-emerald-400" />}
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${seedActive ? "bg-emerald-400/15 text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                    <Database className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-foreground">Sample Data</span>
                      {seedActive ? (
                        <Badge className="h-4 bg-emerald-400/10 px-1.5 text-[10px] text-emerald-400">
                          <CheckCircle2 className="mr-0.5 h-2.5 w-2.5" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {seedActive
                        ? `${seedCount?.time ?? 0} time entries · ${seedCount?.revenue ?? 0} revenue records`
                        : "Pre-loaded demo dataset — 44 time entries, 41 revenue records"}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    {seedActive ? (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 text-xs"
                          onClick={handleLoadSample}
                          disabled={seedLoading}
                        >
                          {seedLoading ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> : <RotateCcw className="mr-1.5 h-3 w-3" />}
                          Reset to sample
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs text-muted-foreground hover:text-destructive"
                          onClick={handleRemoveSeed}
                          disabled={seedLoading}
                        >
                          <Trash2 className="mr-1.5 h-3 w-3" />
                          Remove
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="default"
                        className="h-8 text-xs"
                        onClick={handleLoadSample}
                        disabled={seedLoading}
                      >
                        {seedLoading ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> : null}
                        Load sample data
                      </Button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* QuickBooks Online */}
            <div className={`relative flex items-center gap-4 px-6 py-4 ${ROW_STYLES[qbRowStatus]}`}>
              {qbConnected && (
                <div className="absolute left-0 top-4 bottom-4 w-0.5 rounded-r-full bg-emerald-400" />
              )}
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${ICON_STYLES[qbRowStatus]}`}>
                <Receipt className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-foreground">QuickBooks Online</span>
                  {qbLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                  ) : qbConnected ? (
                    <Badge className="h-4 bg-emerald-400/10 px-1.5 text-[10px] text-emerald-400">
                      <CheckCircle2 className="mr-0.5 h-2.5 w-2.5" />
                      Connected
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {qbConnected
                    ? qbStatus?.companyName
                      ? `Connected to ${qbStatus.companyName}`
                      : "Automatically sync invoices and payments via OAuth 2.0"
                    : "Automatically sync invoices and payments via OAuth 2.0"}
                </p>
              </div>
              {qbLoading ? (
                <Button size="sm" variant="secondary" disabled className="h-8 shrink-0 text-xs">
                  <Loader2 className="h-3 w-3 animate-spin" />
                </Button>
              ) : qbConnected ? (
                <div className="flex shrink-0 gap-1.5">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 text-xs"
                    onClick={handleSync}
                    disabled={syncStatus === "syncing"}
                  >
                    {syncStatus === "syncing" ? (
                      <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-1.5 h-3 w-3" />
                    )}
                    {syncStatus === "syncing" ? "Syncing..." : "Sync now"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs text-muted-foreground hover:text-destructive"
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                  >
                    <Unplug className="mr-1.5 h-3 w-3" />
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="default"
                  className="h-8 shrink-0 text-xs"
                  onClick={handleConnectQB}
                >
                  Connect
                </Button>
              )}
            </div>

            {/* Sync status feedback */}
            {qbConnected && syncStatus !== "idle" && (
              <div className="px-6 py-2 bg-muted/10">
                {syncStatus === "success" && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3" />
                    {syncCount !== null ? `${syncCount} invoice${syncCount !== 1 ? "s" : ""} synced successfully` : "Sync complete"}
                  </p>
                )}
                {syncStatus === "error" && (
                  <p className="text-xs text-rose-400 flex items-center gap-1.5">
                    <AlertCircle className="h-3 w-3" />
                    Sync failed — check your QuickBooks connection
                  </p>
                )}
              </div>
            )}

            {/* CSV Import */}
            <div className={`relative flex items-center gap-4 px-6 py-4 ${ROW_STYLES["available"]}`}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <FileUp className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-foreground">CSV Import</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Upload time entries or revenue files — column auto-detection included
                </p>
              </div>
              <Button
                size="sm"
                variant="default"
                className="h-8 shrink-0 text-xs"
                onClick={() => setModal("csv")}
              >
                Import CSV
              </Button>
            </div>

            {/* Google Sheets */}
            <div className={`relative flex items-center gap-4 px-6 py-4 ${ROW_STYLES["coming"]} opacity-60`}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Table className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-foreground">Google Sheets</span>
                  <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                    Soon
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Connect a live spreadsheet and sync on demand
                </p>
              </div>
              <Button size="sm" variant="default" className="h-8 shrink-0 text-xs" disabled>
                Coming soon
              </Button>
            </div>
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

"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, CheckCircle2, AlertTriangle } from "lucide-react";
import Papa from "papaparse";
import type { TimeEntry, RevenueEntry } from "@/lib/types";
import { applyColumnMapping, parseTimeEntriesCSV, parseRevenueCSV, CLIENTS } from "@/lib/data";

type Step = 1 | 2 | 3 | 4;
type FileType = "time" | "revenue";

const TIME_REQUIRED = ["clientName", "teamMember", "date", "hours", "serviceTag"];
const TIME_OPTIONAL = ["description"];
const REVENUE_REQUIRED = ["clientName", "month", "amount"];
const REVENUE_OPTIONAL = ["serviceTag"];

const FIELD_LABELS: Record<string, string> = {
  clientName: "Client Name",
  teamMember: "Team Member",
  date: "Date",
  hours: "Hours",
  serviceTag: "Service Tag",
  description: "Description",
  month: "Month",
  amount: "Amount",
};

const FIELD_ALIASES: Record<string, string[]> = {
  clientName: ["client", "clientname", "company", "account", "customer"],
  teamMember: ["teammember", "staff", "employee", "consultant", "name", "person", "staffmember"],
  date: ["date", "entrydate", "invoicedate", "period", "workdate"],
  hours: ["hours", "hrs", "time", "duration", "hoursworked"],
  serviceTag: ["service", "servicetag", "servicetype", "serviceline", "category", "type"],
  amount: ["amount", "revenue", "invoiceamount", "value", "total"],
  month: ["month", "period", "invoicemonth", "date"],
};

function normalise(s: string): string {
  return s.toLowerCase().replace(/[\s_\-]+/g, "");
}

function autoDetectMapping(headers: string[], fileType: FileType): Record<string, string> {
  const fields =
    fileType === "time"
      ? [...TIME_REQUIRED, ...TIME_OPTIONAL]
      : [...REVENUE_REQUIRED, ...REVENUE_OPTIONAL];
  const mapping: Record<string, string> = {};
  for (const field of fields) {
    const aliases = FIELD_ALIASES[field] ?? [field];
    const found = headers.find((h) => aliases.includes(normalise(h)));
    mapping[field] = found ?? "__none__";
  }
  return mapping;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onImport: (time: TimeEntry[], revenue: RevenueEntry[]) => void;
}

export function CsvImportWizard({ open, onClose, onImport }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [fileType, setFileType] = useState<FileType>("time");
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [importResult, setImportResult] = useState<{ count: number; warnings: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const requiredFields = fileType === "time" ? TIME_REQUIRED : REVENUE_REQUIRED;
  const optionalFields = fileType === "time" ? TIME_OPTIONAL : REVENUE_OPTIONAL;
  const allFields = [...requiredFields, ...optionalFields];

  function handleFile(file: File) {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const hdrs = result.meta.fields ?? [];
        setHeaders(hdrs);
        setRawRows(result.data);
        setMapping(autoDetectMapping(hdrs, fileType));
        setStep(2);
      },
    });
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith(".csv")) handleFile(file);
  }

  const mappedFields = allFields.filter((f) => mapping[f] && mapping[f] !== "__none__");

  const previewRows = rawRows.slice(0, 5).map((row) => {
    const out: Record<string, string> = {};
    for (const f of mappedFields) {
      out[f] = row[mapping[f]] ?? "";
    }
    return out;
  });

  const knownClients = new Set(CLIENTS.map((c) => c.karbonName.toLowerCase()));
  const warningSet = new Set<string>();
  for (const row of previewRows) {
    if (row.clientName && !knownClients.has(row.clientName.toLowerCase())) {
      warningSet.add(`Unrecognized client: "${row.clientName}"`);
    }
    if (row.hours !== undefined) {
      const h = parseFloat(row.hours);
      if (!isNaN(h) && h <= 0) warningSet.add("Zero or negative hours in a row");
    }
    if (row.date && isNaN(new Date(row.date).getTime())) {
      warningSet.add(`Invalid date: "${row.date}"`);
    }
    if (row.month && isNaN(new Date(row.month).getTime())) {
      warningSet.add(`Invalid date/month: "${row.month}"`);
    }
  }
  const warnings = [...warningSet];

  function handleImport() {
    const mappedRows = applyColumnMapping(rawRows, mapping, fileType);
    let count = 0;
    if (fileType === "time") {
      const entries = parseTimeEntriesCSV(mappedRows);
      count = entries.length;
      onImport(entries, []);
    } else {
      const entries = parseRevenueCSV(mappedRows);
      count = entries.length;
      onImport([], entries);
    }
    setImportResult({ count, warnings: warnings.length });
    setStep(4);
  }

  function handleClose() {
    setStep(1);
    setFileType("time");
    setRawRows([]);
    setHeaders([]);
    setMapping({});
    setImportResult(null);
    onClose();
  }

  const allRequiredMapped = requiredFields.every((f) => mapping[f] && mapping[f] !== "__none__");

  const stepLabels = ["Upload", "Map Columns", "Preview", "Done"];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import CSV</DialogTitle>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center gap-1 pb-1">
          {stepLabels.map((label, i) => {
            const s = i + 1;
            return (
              <div key={s} className="flex items-center gap-1.5">
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                    step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s}
                </div>
                <span className={`text-xs ${step >= s ? "text-foreground" : "text-muted-foreground"}`}>
                  {label}
                </span>
                {s < 4 && <div className={`h-px w-6 ${step > s ? "bg-primary" : "bg-border"}`} />}
              </div>
            );
          })}
        </div>

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <button
                onClick={() => setFileType("time")}
                className={`flex-1 rounded-md border p-3 text-left text-xs transition-colors ${
                  fileType === "time"
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                <p className="font-medium">Time Entries</p>
                <p className="mt-0.5 text-muted-foreground">Client, team member, hours, date</p>
              </button>
              <button
                onClick={() => setFileType("revenue")}
                className={`flex-1 rounded-md border p-3 text-left text-xs transition-colors ${
                  fileType === "revenue"
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                <p className="font-medium">Revenue</p>
                <p className="mt-0.5 text-muted-foreground">Client, amount, month</p>
              </button>
            </div>

            <div
              className={`cursor-pointer rounded-md border-2 border-dashed p-8 text-center transition-colors ${
                isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium text-foreground">Drop CSV here or click to browse</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {fileType === "time"
                  ? "Expected columns: clientName, teamMember, date, hours, serviceTag"
                  : "Expected columns: clientName, month, amount"}
              </p>
              <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileInput} />
            </div>

            <div className="rounded-md border border-border/50 bg-muted/30 px-4 py-3">
              <p className="text-xs font-medium text-foreground">Download sample files</p>
              <div className="mt-1.5 flex flex-wrap gap-3">
                <a href="/sample-time-entries.csv" download className="text-xs text-primary hover:underline">
                  sample-time-entries.csv
                </a>
                <a href="/sample-revenue.csv" download className="text-xs text-primary hover:underline">
                  sample-revenue.csv
                </a>
                <a href="/sample-time-entries-messy.csv" download className="text-xs text-primary hover:underline">
                  sample-time-entries-messy.csv
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Column Mapping */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Found <strong className="text-foreground">{rawRows.length} rows</strong> and{" "}
              <strong className="text-foreground">{headers.length} columns</strong>. Map CSV columns to required
              fields.
            </p>

            <div className="overflow-hidden rounded-md border border-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Field</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">CSV Column</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Sample Value</th>
                  </tr>
                </thead>
                <tbody>
                  {allFields.map((field, i) => {
                    const isRequired = requiredFields.includes(field);
                    const selectedCol = mapping[field] ?? "__none__";
                    const sampleVal = selectedCol !== "__none__" ? (rawRows[0]?.[selectedCol] ?? "—") : "—";
                    const isMissing = isRequired && selectedCol === "__none__";
                    return (
                      <tr
                        key={field}
                        className={`${i % 2 === 0 ? "" : "bg-muted/20"} border-b border-border/50 last:border-0`}
                      >
                        <td className="px-3 py-2">
                          <span className="font-medium text-foreground">{FIELD_LABELS[field]}</span>
                          {isRequired ? (
                            <Badge
                              className={`ml-2 h-4 px-1.5 text-[10px] ${
                                isMissing
                                  ? "bg-rose-400/10 text-rose-400"
                                  : "bg-emerald-400/10 text-emerald-400"
                              }`}
                            >
                              Required
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="ml-2 h-4 px-1.5 text-[10px]">
                              Optional
                            </Badge>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <Select
                            value={selectedCol}
                            onValueChange={(val) => setMapping((prev) => ({ ...prev, [field]: val }))}
                          >
                            <SelectTrigger className="h-7 w-44 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">— not mapped —</SelectItem>
                              {headers.map((h) => (
                                <SelectItem key={h} value={h}>
                                  {h}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-3 py-2 font-mono text-muted-foreground">{sampleVal}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between">
              <Button variant="secondary" size="sm" className="text-xs" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button size="sm" className="text-xs" disabled={!allRequiredMapped} onClick={() => setStep(3)}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Showing first {previewRows.length} of {rawRows.length} rows after mapping.
            </p>

            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {mappedFields.map((f) => (
                      <th key={f} className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">
                        {FIELD_LABELS[f]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, i) => (
                    <tr
                      key={i}
                      className={`${i % 2 === 0 ? "" : "bg-muted/20"} border-b border-border/50 last:border-0`}
                    >
                      {mappedFields.map((f) => (
                        <td key={f} className="px-3 py-2 text-foreground whitespace-nowrap">
                          {row[f] ?? "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {warnings.length > 0 && (
              <div className="rounded-md border border-amber-400/20 bg-amber-400/10 px-4 py-3">
                <p className="flex items-center gap-2 text-xs font-medium text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {warnings.length} warning{warnings.length > 1 ? "s" : ""}
                </p>
                <ul className="mt-1.5 space-y-0.5">
                  {warnings.map((w, i) => (
                    <li key={i} className="text-xs text-muted-foreground">
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="secondary" size="sm" className="text-xs" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button size="sm" className="text-xs" onClick={handleImport}>
                Import {rawRows.length} rows
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && importResult && (
          <div className="flex flex-col items-center gap-4 py-8">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">
                {importResult.count} rows imported
                {importResult.warnings > 0 ? ` (${importResult.warnings} warning${importResult.warnings > 1 ? "s" : ""})` : ""}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Dashboard updated successfully.</p>
            </div>
            <Button variant="secondary" size="sm" className="text-xs" onClick={handleClose}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

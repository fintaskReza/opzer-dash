"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const tables = [
  {
    name: "Time Entries",
    fields: [
      { field: "Client Name", type: "string", note: "Must match Clients table" },
      { field: "Team Member", type: "string", note: "Must match Team Members table" },
      { field: "Time Tracked (hrs)", type: "number", note: "Decimal hours, e.g. 1.5" },
      { field: "Date", type: "date", note: "YYYY-MM-DD format" },
      { field: "Service", type: "string", note: "Optional — for service breakdown" },
    ],
  },
  {
    name: "Revenue",
    fields: [
      { field: "Client Name", type: "string", note: "Must match Clients table" },
      { field: "Amount", type: "number", note: "Numeric, no currency symbol" },
      { field: "Date", type: "date", note: "YYYY-MM-DD format" },
    ],
  },
  {
    name: "Team Members",
    fields: [
      { field: "Member", type: "string", note: "Full name" },
      { field: "Role", type: "string", note: "CFO, Accounting Manager, Bookkeeper, etc." },
      { field: "Cost Rate", type: "number", note: "Hourly cost rate in $" },
      { field: "Status", type: "string", note: "Active or Inactive" },
    ],
  },
];

export function FieldMappingGuide() {
  return (
    <Card>
      <CardHeader className="p-5 pb-3">
        <CardTitle className="text-base font-semibold">Field Mapping Guide</CardTitle>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Required fields for each data source. CSVs must use these column headers (or the aliases listed below).
        </p>
      </CardHeader>
      <CardContent className="p-5 pt-0 space-y-6">
        {tables.map((t) => (
          <div key={t.name}>
            <p className="mb-2 text-xs font-semibold text-foreground">{t.name}</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-1.5 pr-4 text-left font-medium text-muted-foreground">Field</th>
                    <th className="pb-1.5 pr-4 text-left font-medium text-muted-foreground">Type</th>
                    <th className="pb-1.5 text-left font-medium text-muted-foreground">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {t.fields.map((f) => (
                    <tr key={f.field} className="border-b border-border/50">
                      <td className="py-1.5 pr-4 font-mono text-primary whitespace-nowrap">{f.field}</td>
                      <td className="py-1.5 pr-4 text-muted-foreground">{f.type}</td>
                      <td className="py-1.5 text-muted-foreground">{f.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        <div className="rounded-md border border-border bg-muted/30 p-4">
          <p className="mb-2 text-xs font-semibold text-foreground">Pre-built Calculation Formulas</p>
          <div className="space-y-1 font-mono text-xs text-muted-foreground">
            <p><span className="text-primary">Effective Hourly Rate</span> = Revenue ÷ Total Hours</p>
            <p><span className="text-primary">Labor Cost</span> = Σ(Hours × Cost Rate) per team member</p>
            <p><span className="text-primary">Gross Profit</span> = Revenue − Labor Cost</p>
            <p><span className="text-primary">Gross Margin %</span> = Gross Profit ÷ Revenue × 100</p>
            <p><span className="text-primary">Utilization %</span> = Client Hours ÷ Capacity Hours × 100</p>
            <p><span className="text-primary">WIP Value</span> = Σ(Hours × Billing Rate) per team member</p>
            <p><span className="text-primary">Realization Rate</span> = Revenue ÷ WIP Value</p>
          </div>
        </div>

        <div className="rounded-md border border-border bg-muted/30 p-4">
          <p className="mb-2 text-xs font-semibold text-foreground">Conditional Formatting Thresholds</p>
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>
              <p className="font-medium text-foreground mb-1">Gross Margin %</p>
              <p><span className="text-rose-400">Red</span> — below 60%</p>
              <p><span className="text-amber-400">Yellow</span> — 60–70%</p>
              <p><span className="text-emerald-400">Green</span> — 70%+</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">Utilization %</p>
              <p><span className="text-rose-400">Red</span> — below 50%</p>
              <p><span className="text-amber-400">Yellow</span> — 50–70%</p>
              <p><span className="text-emerald-400">Green</span> — 70–90%</p>
              <p><span className="text-amber-400">Yellow</span> — above 90%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

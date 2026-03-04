import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QuickBooksSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-card p-10 shadow-lg text-center max-w-md w-full mx-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/15">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">QuickBooks Connected</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your QuickBooks Online account has been linked. You can now sync invoice data directly into your
            profitability dashboard.
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <Button asChild className="w-full">
            <Link href="/">Go to Dashboard</Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            Use the <span className="font-medium text-foreground">Sync Now</span> button in Data Sources to pull
            your latest invoices.
          </p>
        </div>
      </div>
    </div>
  );
}

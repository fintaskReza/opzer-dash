import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  searchParams: Promise<{ message?: string }>;
}

export default async function QuickBooksErrorPage({ searchParams }: Props) {
  const params = await searchParams;
  const message = params.message ?? "An unexpected error occurred during QuickBooks authorization.";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-card p-10 shadow-lg text-center max-w-md w-full mx-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-400/15">
          <AlertCircle className="h-8 w-8 text-rose-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Connection Failed</h1>
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        </div>
        <Button asChild variant="secondary" className="w-full">
          <Link href="/">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

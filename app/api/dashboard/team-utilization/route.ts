import { NextRequest, NextResponse } from "next/server";
import { requireAuth, resolveOrgId, isAuthContext } from "@/lib/api-utils";
import { getTimeEntries, getRevenueEntries } from "@/lib/db/queries/entries";
import { computeTeamUtilization } from "@/lib/data";
import type { DashboardFilters } from "@/lib/types";

export async function GET(req: NextRequest) {
  const ctx = await requireAuth();
  if (!isAuthContext(ctx)) return ctx;

  const sp = req.nextUrl.searchParams;
  const orgId = resolveOrgId(ctx, sp);

  const filters: DashboardFilters = {
    dateFrom: sp.get("from") ?? "2025-01-01",
    dateTo: sp.get("to") ?? "2025-12-31",
    selectedClients: sp.get("clients") ? sp.get("clients")!.split(",") : [],
    activeOnly: sp.get("activeOnly") !== "false",
  };

  const [timeEntries, revenueEntries] = await Promise.all([
    getTimeEntries(orgId),
    getRevenueEntries(orgId),
  ]);

  const rows = computeTeamUtilization(filters, timeEntries, revenueEntries);
  return NextResponse.json(rows);
}

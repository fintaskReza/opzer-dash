import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireOrgId, isAuthContext } from "@/lib/api-utils";
import { getTimeEntriesCountBySource, getRevenueEntriesCountBySource } from "@/lib/db/queries/entries";

export async function GET(req: NextRequest) {
  const ctx = await requireAuth();
  if (!isAuthContext(ctx)) return ctx;

  const orgId = requireOrgId(ctx, req.nextUrl.searchParams);
  if (typeof orgId !== "number") return orgId;
  if (orgId === null) {
    return NextResponse.json({ error: "orgId required" }, { status: 400 });
  }

  const [timeCounts, revenueCounts] = await Promise.all([
    getTimeEntriesCountBySource(orgId),
    getRevenueEntriesCountBySource(orgId),
  ]);

  const allSources = new Set([...Object.keys(timeCounts), ...Object.keys(revenueCounts)]);
  const result: Record<string, { time: number; revenue: number }> = {};
  for (const src of allSources) {
    result[src] = { time: timeCounts[src] ?? 0, revenue: revenueCounts[src] ?? 0 };
  }

  const totalTime = Object.values(timeCounts).reduce((s, n) => s + n, 0);
  const totalRevenue = Object.values(revenueCounts).reduce((s, n) => s + n, 0);

  return NextResponse.json({ bySource: result, total: { time: totalTime, revenue: totalRevenue } });
}

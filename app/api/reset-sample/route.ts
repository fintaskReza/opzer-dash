import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin, requireOrgId, isAuthContext } from "@/lib/api-utils";
import {
  deleteAllTimeEntries,
  deleteAllRevenueEntries,
  insertTimeEntriesBulk,
  insertRevenueEntriesBulk,
} from "@/lib/db/queries/entries";
import { TIME_ENTRIES, REVENUE_ENTRIES } from "@/lib/data";

export async function POST(req: NextRequest) {
  const ctx = await requireAuth();
  if (!isAuthContext(ctx)) return ctx;
  const forbidden = requireAdmin(ctx);
  if (forbidden) return forbidden;

  const orgId = requireOrgId(ctx, req.nextUrl.searchParams);
  if (typeof orgId !== "number") return orgId;
  if (orgId === null) {
    return NextResponse.json({ error: "orgId required" }, { status: 400 });
  }

  await deleteAllTimeEntries(orgId);
  await deleteAllRevenueEntries(orgId);

  const timeWithSource = TIME_ENTRIES.map((e) => ({ ...e, dataSource: "seed" as const }));
  const revenueWithSource = REVENUE_ENTRIES.map((e) => ({ ...e, dataSource: "seed" as const }));

  await insertTimeEntriesBulk(orgId, timeWithSource);
  await insertRevenueEntriesBulk(orgId, revenueWithSource);

  return NextResponse.json({ seeded: { time: timeWithSource.length, revenue: revenueWithSource.length } });
}

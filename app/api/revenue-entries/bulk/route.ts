import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireOrgId, isAuthContext } from "@/lib/api-utils";
import { insertRevenueEntriesBulk } from "@/lib/db/queries/entries";
import type { RevenueEntry } from "@/lib/types";

const MAX_ROWS = 10000;

export async function POST(req: NextRequest) {
  const ctx = await requireAuth();
  if (!isAuthContext(ctx)) return ctx;

  const body = await req.json().catch(() => null);
  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "Expected array of revenue entries" }, { status: 400 });
  }
  if (body.length > MAX_ROWS) {
    return NextResponse.json({ error: `Max ${MAX_ROWS} rows per import` }, { status: 400 });
  }

  const orgId = requireOrgId(ctx, req.nextUrl.searchParams);
  if (typeof orgId !== "number") return orgId;
  await insertRevenueEntriesBulk(orgId, body as RevenueEntry[]);
  return NextResponse.json({ inserted: body.length }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, resolveOrgId, isAuthContext } from "@/lib/api-utils";
import { insertTimeEntriesBulk } from "@/lib/db/queries/entries";
import type { TimeEntry } from "@/lib/types";

const MAX_ROWS = 5000;

export async function POST(req: NextRequest) {
  const ctx = await requireAuth();
  if (!isAuthContext(ctx)) return ctx;

  const body = await req.json().catch(() => null);
  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "Expected array of time entries" }, { status: 400 });
  }
  if (body.length > MAX_ROWS) {
    return NextResponse.json({ error: `Max ${MAX_ROWS} rows per import` }, { status: 400 });
  }

  const orgId = resolveOrgId(ctx, req.nextUrl.searchParams);
  await insertTimeEntriesBulk(orgId, body as TimeEntry[]);
  return NextResponse.json({ inserted: body.length }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, resolveOrgId, isAuthContext } from "@/lib/api-utils";
import { getBudgetEntries, upsertBudgetEntry } from "@/lib/db/queries/entries";

export async function GET(req: NextRequest) {
  const ctx = await requireAuth();
  if (!isAuthContext(ctx)) return ctx;

  const orgId = resolveOrgId(ctx, req.nextUrl.searchParams);
  const data = await getBudgetEntries(orgId);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const ctx = await requireAuth();
  if (!isAuthContext(ctx)) return ctx;

  const body = await req.json().catch(() => null);
  if (!body?.clientName || body?.budget === undefined) {
    return NextResponse.json({ error: "clientName and budget required" }, { status: 400 });
  }

  const orgId = resolveOrgId(ctx, req.nextUrl.searchParams);
  const entry = await upsertBudgetEntry(orgId, body.clientName, body.budget);
  return NextResponse.json(entry, { status: 201 });
}

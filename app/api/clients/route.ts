import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin, resolveOrgId, isAuthContext } from "@/lib/api-utils";
import { getClients, createClient } from "@/lib/db/queries/clients";

export async function GET(req: NextRequest) {
  const ctx = await requireAuth();
  if (!isAuthContext(ctx)) return ctx;

  const orgId = resolveOrgId(ctx, req.nextUrl.searchParams);
  const data = await getClients(orgId);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const ctx = await requireAuth();
  if (!isAuthContext(ctx)) return ctx;
  const forbidden = requireAdmin(ctx);
  if (forbidden) return forbidden;

  const body = await req.json().catch(() => null);
  if (!body?.karbonName) {
    return NextResponse.json({ error: "karbonName required" }, { status: 400 });
  }

  const orgId = resolveOrgId(ctx, req.nextUrl.searchParams);
  const client = await createClient(orgId, {
    karbonName: body.karbonName,
    quickbooksName: body.quickbooksName ?? body.karbonName,
    status: body.status,
  });
  return NextResponse.json(client, { status: 201 });
}

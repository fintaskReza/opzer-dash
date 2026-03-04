import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin, requireOrgId, isAuthContext } from "@/lib/api-utils";
import { getTimeEntries, deleteAllTimeEntries } from "@/lib/db/queries/entries";

export async function GET(req: NextRequest) {
  const ctx = await requireAuth();
  if (!isAuthContext(ctx)) return ctx;

  const orgId = requireOrgId(ctx, req.nextUrl.searchParams);
  if (typeof orgId !== "number") return orgId;
  const data = await getTimeEntries(orgId);
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const ctx = await requireAuth();
  if (!isAuthContext(ctx)) return ctx;
  const forbidden = requireAdmin(ctx);
  if (forbidden) return forbidden;

  const orgId = requireOrgId(ctx, req.nextUrl.searchParams);
  if (typeof orgId !== "number") return orgId;
  await deleteAllTimeEntries(orgId);
  return new NextResponse(null, { status: 204 });
}

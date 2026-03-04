import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin, requireOrgId, isAuthContext } from "@/lib/api-utils";
import { deleteSeedTimeEntries, deleteSeedRevenueEntries } from "@/lib/db/queries/entries";

export async function DELETE(req: NextRequest) {
  const ctx = await requireAuth();
  if (!isAuthContext(ctx)) return ctx;
  const forbidden = requireAdmin(ctx);
  if (forbidden) return forbidden;

  const orgId = requireOrgId(ctx, req.nextUrl.searchParams);
  if (typeof orgId !== "number") return orgId;
  if (orgId === null) {
    return NextResponse.json({ error: "orgId required" }, { status: 400 });
  }

  await Promise.all([deleteSeedTimeEntries(orgId), deleteSeedRevenueEntries(orgId)]);
  return new NextResponse(null, { status: 204 });
}

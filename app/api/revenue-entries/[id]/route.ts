import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin, requireOrgId, isAuthContext } from "@/lib/api-utils";
import { getRevenueEntryById, deleteRevenueEntry } from "@/lib/db/queries/entries";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth();
  if (!isAuthContext(ctx)) return ctx;
  const forbidden = requireAdmin(ctx);
  if (forbidden) return forbidden;

  const { id } = await params;
  const orgId = requireOrgId(ctx, req.nextUrl.searchParams);
  if (typeof orgId !== "number") return orgId;
  const entry = await getRevenueEntryById(parseInt(id, 10), orgId);
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteRevenueEntry(parseInt(id, 10), orgId);
  return new NextResponse(null, { status: 204 });
}

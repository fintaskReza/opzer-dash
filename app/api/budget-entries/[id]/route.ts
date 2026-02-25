import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin, resolveOrgId, isAuthContext } from "@/lib/api-utils";
import { getBudgetEntryById, deleteBudgetEntry } from "@/lib/db/queries/entries";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth();
  if (!isAuthContext(ctx)) return ctx;
  const forbidden = requireAdmin(ctx);
  if (forbidden) return forbidden;

  const { id } = await params;
  const orgId = resolveOrgId(ctx, req.nextUrl.searchParams);
  const entry = await getBudgetEntryById(parseInt(id, 10), orgId);
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteBudgetEntry(parseInt(id, 10), orgId);
  return new NextResponse(null, { status: 204 });
}

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin, isAuthContext } from "@/lib/api-utils";
import { getOrganizationById, deleteOrganization } from "@/lib/db/queries/organizations";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth();
  if (!isAuthContext(ctx)) return ctx;
  const forbidden = requireAdmin(ctx);
  if (forbidden) return forbidden;

  const { id } = await params;
  const org = await getOrganizationById(parseInt(id, 10));
  if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(org);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth();
  if (!isAuthContext(ctx)) return ctx;
  const forbidden = requireAdmin(ctx);
  if (forbidden) return forbidden;

  const { id } = await params;
  await deleteOrganization(parseInt(id, 10));
  return new NextResponse(null, { status: 204 });
}

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin, resolveOrgId, isAuthContext } from "@/lib/api-utils";
import { getTeamMemberById, updateTeamMember, deleteTeamMember } from "@/lib/db/queries/team-members";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth();
  if (!isAuthContext(ctx)) return ctx;
  const forbidden = requireAdmin(ctx);
  if (forbidden) return forbidden;

  const { id } = await params;
  const orgId = resolveOrgId(ctx, req.nextUrl.searchParams);
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const member = await updateTeamMember(parseInt(id, 10), orgId, body);
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(member);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth();
  if (!isAuthContext(ctx)) return ctx;
  const forbidden = requireAdmin(ctx);
  if (forbidden) return forbidden;

  const { id } = await params;
  const orgId = resolveOrgId(ctx, req.nextUrl.searchParams);
  const member = await getTeamMemberById(parseInt(id, 10), orgId);
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteTeamMember(parseInt(id, 10), orgId);
  return new NextResponse(null, { status: 204 });
}

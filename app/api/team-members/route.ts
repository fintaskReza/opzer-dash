import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin, resolveOrgId, isAuthContext } from "@/lib/api-utils";
import { getTeamMembers, createTeamMember } from "@/lib/db/queries/team-members";

export async function GET(req: NextRequest) {
  const ctx = await requireAuth();
  if (!isAuthContext(ctx)) return ctx;

  const orgId = resolveOrgId(ctx, req.nextUrl.searchParams);
  const data = await getTeamMembers(orgId);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const ctx = await requireAuth();
  if (!isAuthContext(ctx)) return ctx;
  const forbidden = requireAdmin(ctx);
  if (forbidden) return forbidden;

  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.role) {
    return NextResponse.json({ error: "name and role required" }, { status: 400 });
  }

  const orgId = resolveOrgId(ctx, req.nextUrl.searchParams);
  const member = await createTeamMember(orgId, {
    name: body.name,
    role: body.role,
    costRate: body.costRate ?? 0,
    billingRate: body.billingRate ?? 0,
    status: body.status ?? "Active",
    capacityHoursPerMonth: body.capacityHoursPerMonth ?? 140,
    location: body.location ?? "Onshore",
  });
  return NextResponse.json(member, { status: 201 });
}

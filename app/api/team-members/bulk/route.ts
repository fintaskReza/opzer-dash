import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin, requireOrgId, isAuthContext } from "@/lib/api-utils";
import { upsertTeamMemberRates } from "@/lib/db/queries/team-members";
import type { TeamMemberRateRow } from "@/lib/types";

const MAX_ROWS = 500;

export async function POST(req: NextRequest) {
  const ctx = await requireAuth();
  if (!isAuthContext(ctx)) return ctx;
  const forbidden = requireAdmin(ctx);
  if (forbidden) return forbidden;

  const body = await req.json().catch(() => null);
  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "Expected array of rate rows" }, { status: 400 });
  }
  if (body.length > MAX_ROWS) {
    return NextResponse.json({ error: `Max ${MAX_ROWS} rows per import` }, { status: 400 });
  }
  if (body.some((r) => !r.name || typeof r.name !== "string")) {
    return NextResponse.json({ error: "Each row must have a name" }, { status: 400 });
  }

  const orgId = requireOrgId(ctx, req.nextUrl.searchParams);
  if (typeof orgId !== "number") return orgId;

  const result = await upsertTeamMemberRates(orgId, body as TeamMemberRateRow[]);
  return NextResponse.json(result, { status: 201 });
}

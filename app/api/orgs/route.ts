import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin, isAuthContext } from "@/lib/api-utils";
import { getOrganizations, createOrganization } from "@/lib/db/queries/organizations";

export async function GET() {
  const ctx = await requireAuth();
  if (!isAuthContext(ctx)) return ctx;
  const forbidden = requireAdmin(ctx);
  if (forbidden) return forbidden;

  const orgs = await getOrganizations();
  return NextResponse.json(orgs);
}

export async function POST(req: NextRequest) {
  const ctx = await requireAuth();
  if (!isAuthContext(ctx)) return ctx;
  const forbidden = requireAdmin(ctx);
  if (forbidden) return forbidden;

  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.slug) {
    return NextResponse.json({ error: "name and slug required" }, { status: 400 });
  }

  const org = await createOrganization({ name: body.name, slug: body.slug });
  return NextResponse.json(org, { status: 201 });
}

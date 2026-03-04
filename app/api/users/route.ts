import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin, isAuthContext } from "@/lib/api-utils";
import { getAllUsers, getUsersByOrg, createUser } from "@/lib/db/queries/users";

export async function GET(req: NextRequest) {
  const ctx = await requireAuth();
  if (!isAuthContext(ctx)) return ctx;
  const forbidden = requireAdmin(ctx);
  if (forbidden) return forbidden;

  let userList;
  if (ctx.role === "super-admin") {
    const orgId = req.nextUrl.searchParams.get("orgId");
    userList = orgId ? await getUsersByOrg(parseInt(orgId, 10)) : await getAllUsers();
  } else {
    // admin: scoped to own org only
    userList = ctx.orgId != null ? await getUsersByOrg(ctx.orgId) : [];
  }

  return NextResponse.json(
    userList.map(({ passwordHash: _ph, ...u }) => u)
  );
}

export async function POST(req: NextRequest) {
  const ctx = await requireAuth();
  if (!isAuthContext(ctx)) return ctx;
  const forbidden = requireAdmin(ctx);
  if (forbidden) return forbidden;

  const body = await req.json().catch(() => null);
  if (!body?.email || !body?.password || !body?.name) {
    return NextResponse.json({ error: "email, password, and name required" }, { status: 400 });
  }

  let targetOrgId: number | null;
  if (ctx.role === "super-admin") {
    // super-admin can set any orgId (including null for another super-admin)
    targetOrgId = body.orgId != null ? Number(body.orgId) : null;
  } else {
    // admin: always scoped to own org
    targetOrgId = ctx.orgId;
  }

  if (targetOrgId == null && body.role !== "super-admin") {
    return NextResponse.json({ error: "orgId required for non-super-admin users" }, { status: 400 });
  }

  const user = await createUser({
    orgId: targetOrgId,
    email: body.email,
    password: body.password,
    name: body.name,
    role: body.role ?? "member",
  });

  const { passwordHash: _ph, ...safe } = user;
  return NextResponse.json(safe, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin, isAuthContext } from "@/lib/api-utils";
import { getAllUsers, getUsersByOrg, createUser } from "@/lib/db/queries/users";

export async function GET(req: NextRequest) {
  const ctx = await requireAuth();
  if (!isAuthContext(ctx)) return ctx;
  const forbidden = requireAdmin(ctx);
  if (forbidden) return forbidden;

  const orgId = req.nextUrl.searchParams.get("orgId");
  const userList = orgId ? await getUsersByOrg(parseInt(orgId, 10)) : await getAllUsers();

  // Omit password hashes from response
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
  if (!body?.email || !body?.password || !body?.name || !body?.orgId) {
    return NextResponse.json({ error: "email, password, name, and orgId required" }, { status: 400 });
  }

  const user = await createUser({
    orgId: body.orgId,
    email: body.email,
    password: body.password,
    name: body.name,
    role: body.role ?? "member",
  });

  const { passwordHash: _ph, ...safe } = user;
  return NextResponse.json(safe, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin, isAuthContext } from "@/lib/api-utils";
import { getUserById, updateUser, deleteUser } from "@/lib/db/queries/users";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth();
  if (!isAuthContext(ctx)) return ctx;
  const forbidden = requireAdmin(ctx);
  if (forbidden) return forbidden;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const user = await updateUser(parseInt(id, 10), body);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { passwordHash: _ph, ...safe } = user;
  return NextResponse.json(safe);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAuth();
  if (!isAuthContext(ctx)) return ctx;
  const forbidden = requireAdmin(ctx);
  if (forbidden) return forbidden;

  const { id } = await params;
  const user = await getUserById(parseInt(id, 10));
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteUser(parseInt(id, 10));
  return new NextResponse(null, { status: 204 });
}

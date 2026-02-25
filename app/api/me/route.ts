import { NextResponse } from "next/server";
import { requireAuth, isAuthContext } from "@/lib/api-utils";

export async function GET() {
  const ctx = await requireAuth();
  if (!isAuthContext(ctx)) return ctx;

  return NextResponse.json({
    id: ctx.userId,
    orgId: ctx.orgId,
    role: ctx.role,
  });
}

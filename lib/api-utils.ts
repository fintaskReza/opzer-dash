import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export interface AuthContext {
  userId: string;
  orgId: number;
  role: "admin" | "member";
}

export async function requireAuth(): Promise<AuthContext | NextResponse> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return {
    userId: session.user.id,
    orgId: session.user.orgId,
    role: session.user.role,
  };
}

export function requireAdmin(ctx: AuthContext): NextResponse | null {
  if (ctx.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

/**
 * Admin can override orgId via ?orgId= query param.
 * Members always get their own orgId.
 */
export function resolveOrgId(ctx: AuthContext, searchParams: URLSearchParams): number {
  if (ctx.role === "admin") {
    const param = searchParams.get("orgId");
    if (param) {
      const parsed = parseInt(param, 10);
      if (!isNaN(parsed)) return parsed;
    }
  }
  return ctx.orgId;
}

export function isAuthContext(val: AuthContext | NextResponse): val is AuthContext {
  return "userId" in val;
}

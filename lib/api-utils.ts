import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export interface AuthContext {
  userId: string;
  orgId: number | null;
  role: "super-admin" | "admin" | "member";
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
  if (ctx.role !== "admin" && ctx.role !== "super-admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export function requireSuperAdmin(ctx: AuthContext): NextResponse | null {
  if (ctx.role !== "super-admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

/**
 * Super-admin can override orgId via ?orgId= query param (or get null if not provided).
 * Admin can override orgId via ?orgId= within their own scope.
 * Members always get their own orgId.
 */
export function resolveOrgId(ctx: AuthContext, searchParams: URLSearchParams): number | null {
  if (ctx.role === "super-admin") {
    const param = searchParams.get("orgId");
    if (param) {
      const parsed = parseInt(param, 10);
      if (!isNaN(parsed)) return parsed;
    }
    return null;
  }
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

/**
 * Like resolveOrgId but returns a 400 NextResponse if orgId is null
 * (super-admin must supply ?orgId= for data routes).
 */
export function requireOrgId(
  ctx: AuthContext,
  searchParams: URLSearchParams
): number | NextResponse {
  const orgId = resolveOrgId(ctx, searchParams);
  if (orgId === null) {
    return NextResponse.json({ error: "orgId required for super-admin on this route" }, { status: 400 });
  }
  return orgId;
}

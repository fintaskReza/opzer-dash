import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireOrgId, isAuthContext } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { quickbooksConnections } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const ctx = await requireAuth();
  if (!isAuthContext(ctx)) return ctx;

  const orgId = requireOrgId(ctx, request.nextUrl.searchParams);
  if (typeof orgId !== "number") return orgId;

  const [conn] = await db
    .select({
      companyName: quickbooksConnections.companyName,
      createdAt: quickbooksConnections.createdAt,
      updatedAt: quickbooksConnections.updatedAt,
      isActive: quickbooksConnections.isActive,
    })
    .from(quickbooksConnections)
    .where(and(eq(quickbooksConnections.orgId, orgId), eq(quickbooksConnections.isActive, true)))
    .limit(1);

  if (!conn) {
    return NextResponse.json({ connected: false, companyName: null, connectedAt: null });
  }

  return NextResponse.json({
    connected: true,
    companyName: conn.companyName,
    connectedAt: conn.createdAt,
    lastUpdated: conn.updatedAt,
  });
}

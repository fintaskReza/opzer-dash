import { NextRequest, NextResponse } from "next/server";
import { requireAuth, resolveOrgId, isAuthContext } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { quickbooksConnections } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(request: NextRequest) {
  const ctx = await requireAuth();
  if (!isAuthContext(ctx)) return ctx;

  const orgId = resolveOrgId(ctx, request.nextUrl.searchParams);

  await db
    .update(quickbooksConnections)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(quickbooksConnections.orgId, orgId), eq(quickbooksConnections.isActive, true)));

  return NextResponse.json({ disconnected: true });
}

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, resolveOrgId, isAuthContext } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { quickbooksConnections, revenueEntries } from "@/lib/db/schema";
import { getValidQBAccessToken, QB_BASE_URL } from "@/lib/quickbooks-client";
import { eq, and } from "drizzle-orm";

interface QBInvoiceLine {
  Id?: string;
  Amount?: number;
  DetailType?: string;
  SalesItemLineDetail?: {
    ServiceDate?: string;
  };
}

interface QBInvoice {
  Id: string;
  DocNumber?: string;
  TxnDate: string;
  TotalAmt: number;
  Balance?: number;
  CustomerRef: {
    name: string;
    value: string;
  };
  Line?: QBInvoiceLine[];
}

interface QBQueryResponse {
  QueryResponse?: {
    Invoice?: QBInvoice[];
    maxResults?: number;
  };
}

export async function POST(request: NextRequest) {
  const ctx = await requireAuth();
  if (!isAuthContext(ctx)) return ctx;

  const orgId = resolveOrgId(ctx, request.nextUrl.searchParams);

  // Get the active QB connection to retrieve realmId
  const [conn] = await db
    .select({ realmId: quickbooksConnections.realmId })
    .from(quickbooksConnections)
    .where(and(eq(quickbooksConnections.orgId, orgId), eq(quickbooksConnections.isActive, true)))
    .limit(1);

  if (!conn) {
    return NextResponse.json({ error: "QB_NOT_CONNECTED" }, { status: 400 });
  }

  let accessToken: string;
  try {
    accessToken = await getValidQBAccessToken(orgId);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (msg === "QB_REFRESH_EXPIRED") {
      return NextResponse.json(
        { error: "QuickBooks session expired. Please reconnect." },
        { status: 401 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // Fetch invoices from QB Reports API
  const query = "SELECT * FROM Invoice WHERE TxnDate >= '2020-01-01' MAXRESULTS 1000";
  const encodedQuery = encodeURIComponent(query);

  const qbRes = await fetch(
    `${QB_BASE_URL}/v3/company/${conn.realmId}/query?query=${encodedQuery}&minorversion=65`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    }
  );

  if (!qbRes.ok) {
    const text = await qbRes.text();
    console.error("QB API error:", qbRes.status, text);
    return NextResponse.json({ error: "Failed to fetch invoices from QuickBooks" }, { status: 502 });
  }

  const data: QBQueryResponse = await qbRes.json();
  const invoices = data.QueryResponse?.Invoice ?? [];

  if (invoices.length === 0) {
    return NextResponse.json({ synced: 0, message: "No invoices found in QuickBooks" });
  }

  // Map QB invoices → revenue_entries
  const entries = invoices.map((inv) => ({
    orgId,
    clientName: inv.CustomerRef.name,
    amount: String(inv.TotalAmt),
    date: inv.TxnDate,
    dataSource: "quickbooks" as const,
  }));

  // Delete existing QB-sourced entries for this org, then re-insert
  await db
    .delete(revenueEntries)
    .where(and(eq(revenueEntries.orgId, orgId), eq(revenueEntries.dataSource, "quickbooks")));

  if (entries.length > 0) {
    await db.insert(revenueEntries).values(entries);
  }

  // Update the connection's updatedAt to track last sync time
  await db
    .update(quickbooksConnections)
    .set({ updatedAt: new Date() })
    .where(and(eq(quickbooksConnections.orgId, orgId), eq(quickbooksConnections.isActive, true)));

  return NextResponse.json({ synced: entries.length });
}

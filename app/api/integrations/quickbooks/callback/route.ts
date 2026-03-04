import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quickbooksConnections } from "@/lib/db/schema";
import { encrypt } from "@/lib/encrypt";
import { eq, and } from "drizzle-orm";

const TOKEN_URL = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
const USER_INFO_URL = "https://sandbox-accounts.platform.intuit.com/v1/openid_connect/userinfo";

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  x_refresh_token_expires_in: number;
  token_type: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const realmId = searchParams.get("realmId");
  const error = searchParams.get("error");

  const errorUrl = new URL("/quickbooks/error", request.url);

  if (error) {
    errorUrl.searchParams.set("message", error);
    return NextResponse.redirect(errorUrl);
  }

  if (!code || !state || !realmId) {
    errorUrl.searchParams.set("message", "Missing required OAuth parameters");
    return NextResponse.redirect(errorUrl);
  }

  // Validate CSRF state
  const cookieState = request.cookies.get("qb_state")?.value;
  const cookieOrgId = request.cookies.get("qb_org_id")?.value;

  if (!cookieState || cookieState !== state) {
    errorUrl.searchParams.set("message", "Invalid OAuth state — possible CSRF attack");
    return NextResponse.redirect(errorUrl);
  }

  if (!cookieOrgId) {
    errorUrl.searchParams.set("message", "Session expired — please try connecting again");
    return NextResponse.redirect(errorUrl);
  }

  const orgId = parseInt(cookieOrgId, 10);
  if (isNaN(orgId)) {
    errorUrl.searchParams.set("message", "Invalid session data");
    return NextResponse.redirect(errorUrl);
  }

  const clientId = process.env.QUICKBOOKS_CLIENT_ID!;
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET!;
  const redirectUri = process.env.QUICKBOOKS_REDIRECT_URI!;
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  // Exchange code for tokens
  const tokenRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    console.error("QB token exchange failed:", tokenRes.status, text);
    errorUrl.searchParams.set("message", "Failed to exchange authorization code for tokens");
    return NextResponse.redirect(errorUrl);
  }

  const tokens: TokenResponse = await tokenRes.json();
  const now = new Date();
  const accessTokenExpiresAt = new Date(now.getTime() + tokens.expires_in * 1000);
  const refreshTokenExpiresAt = new Date(now.getTime() + tokens.x_refresh_token_expires_in * 1000);

  // Try to fetch company name (best-effort)
  let companyName: string | null = null;
  try {
    const companyRes = await fetch(
      `${process.env.QUICKBOOKS_ENVIRONMENT === "production"
        ? "https://quickbooks.api.intuit.com"
        : "https://sandbox-quickbooks.api.intuit.com"}/v3/company/${realmId}/companyinfo/${realmId}`,
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          Accept: "application/json",
        },
      }
    );
    if (companyRes.ok) {
      const data = await companyRes.json();
      companyName = data?.CompanyInfo?.CompanyName ?? null;
    }
  } catch {
    // non-fatal — company name is optional
  }

  const encryptedAccessToken = encrypt(tokens.access_token);
  const encryptedRefreshToken = encrypt(tokens.refresh_token);

  // Upsert connection (one per org+realmId)
  const existing = await db
    .select({ id: quickbooksConnections.id })
    .from(quickbooksConnections)
    .where(and(eq(quickbooksConnections.orgId, orgId), eq(quickbooksConnections.realmId, realmId)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(quickbooksConnections)
      .set({
        encryptedAccessToken,
        encryptedRefreshToken,
        accessTokenExpiresAt,
        refreshTokenExpiresAt,
        companyName,
        isActive: true,
        updatedAt: now,
      })
      .where(eq(quickbooksConnections.id, existing[0].id));
  } else {
    await db.insert(quickbooksConnections).values({
      orgId,
      realmId,
      companyName,
      encryptedAccessToken,
      encryptedRefreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
      isActive: true,
    });
  }

  // Clear state cookies and redirect to success
  const successUrl = new URL("/quickbooks/success", request.url);
  const response = NextResponse.redirect(successUrl);
  response.cookies.delete("qb_state");
  response.cookies.delete("qb_org_id");
  return response;
}

import { db } from "@/lib/db";
import { quickbooksConnections } from "@/lib/db/schema";
import { encrypt, decrypt } from "@/lib/encrypt";
import { eq, and } from "drizzle-orm";

const QB_BASE_URL =
  process.env.QUICKBOOKS_ENVIRONMENT === "production"
    ? "https://quickbooks.api.intuit.com"
    : "https://sandbox-quickbooks.api.intuit.com";

const TOKEN_URL = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;         // seconds until access token expires
  x_refresh_token_expires_in: number; // seconds until refresh token expires
  token_type: string;
}

/**
 * Returns a valid (non-expired) QB access token for the given org.
 * Auto-refreshes if the access token is within 5 minutes of expiry.
 * Throws if the refresh token has expired or there is no active connection.
 */
export async function getValidQBAccessToken(orgId: number): Promise<string> {
  const [conn] = await db
    .select()
    .from(quickbooksConnections)
    .where(and(eq(quickbooksConnections.orgId, orgId), eq(quickbooksConnections.isActive, true)))
    .limit(1);

  if (!conn) {
    throw new Error("QB_NOT_CONNECTED");
  }

  const now = new Date();
  const fiveMinutes = 5 * 60 * 1000;

  // Check refresh token expiry first
  if (conn.refreshTokenExpiresAt < now) {
    await db
      .update(quickbooksConnections)
      .set({ isActive: false, updatedAt: now })
      .where(eq(quickbooksConnections.id, conn.id));
    throw new Error("QB_REFRESH_EXPIRED");
  }

  // If access token is still valid (with 5-min buffer), return it
  if (conn.accessTokenExpiresAt.getTime() - now.getTime() > fiveMinutes) {
    return decrypt(conn.encryptedAccessToken);
  }

  // Refresh the access token
  const clientId = process.env.QUICKBOOKS_CLIENT_ID!;
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET!;
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const refreshToken = decrypt(conn.encryptedRefreshToken);

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`QB token refresh failed: ${res.status} ${text}`);
  }

  const tokens: TokenResponse = await res.json();
  const newAccessExpiry = new Date(now.getTime() + tokens.expires_in * 1000);
  const newRefreshExpiry = new Date(now.getTime() + tokens.x_refresh_token_expires_in * 1000);

  await db
    .update(quickbooksConnections)
    .set({
      encryptedAccessToken: encrypt(tokens.access_token),
      encryptedRefreshToken: encrypt(tokens.refresh_token),
      accessTokenExpiresAt: newAccessExpiry,
      refreshTokenExpiresAt: newRefreshExpiry,
      updatedAt: now,
    })
    .where(eq(quickbooksConnections.id, conn.id));

  return tokens.access_token;
}

export { QB_BASE_URL };

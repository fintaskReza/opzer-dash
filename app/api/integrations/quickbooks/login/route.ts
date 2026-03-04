import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

const SCOPES = "com.intuit.quickbooks.accounting openid profile email phone address";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = process.env.QUICKBOOKS_CLIENT_ID;
  const redirectUri = process.env.QUICKBOOKS_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: "QuickBooks integration not configured" }, { status: 500 });
  }

  const state = randomBytes(32).toString("hex");

  const params = new URLSearchParams({
    client_id: clientId,
    scope: SCOPES,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",
    state,
  });

  const authUrl = `https://appcenter.intuit.com/connect/oauth2?${params.toString()}`;

  const response = NextResponse.redirect(authUrl);

  // Store state in cookie for CSRF validation in callback
  response.cookies.set("qb_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60, // 1 hour
    path: "/",
  });

  // Store orgId so callback knows which org to associate the connection with
  response.cookies.set("qb_org_id", String(session.user.orgId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60,
    path: "/",
  });

  return response;
}

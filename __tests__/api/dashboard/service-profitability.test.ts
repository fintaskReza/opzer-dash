import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/dashboard/service-profitability/route";
import { auth } from "@/lib/auth";
import * as entriesQueries from "@/lib/db/queries/entries";

const mockAuth = vi.mocked(auth);
vi.mock("@/lib/db/queries/entries");

const memberSession = { user: { id: "2", orgId: 3, role: "member" as const, name: "Bob", email: "b@b.com" }, expires: "" };

describe("GET /api/dashboard/service-profitability", () => {
  beforeEach(() => {
    mockAuth.mockResolvedValue(null);
    vi.mocked(entriesQueries.getTimeEntries).mockResolvedValue([]);
    vi.mocked(entriesQueries.getRevenueEntries).mockResolvedValue([]);
  });

  it("returns 401 unauthenticated", async () => {
    const req = new NextRequest("http://localhost/api/dashboard/service-profitability");
    expect((await GET(req)).status).toBe(401);
  });

  it("returns array for authenticated user", async () => {
    mockAuth.mockResolvedValue(memberSession);
    const req = new NextRequest("http://localhost/api/dashboard/service-profitability?from=2025-06-01&to=2025-08-31");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });
});

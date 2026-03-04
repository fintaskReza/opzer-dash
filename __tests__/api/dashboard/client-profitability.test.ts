import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/dashboard/client-profitability/route";
import { auth } from "@/lib/auth";
import * as entriesQueries from "@/lib/db/queries/entries";

const mockAuth = vi.mocked(auth);
vi.mock("@/lib/db/queries/entries");

const memberSession = { user: { id: "2", orgId: 3, role: "member" as const, name: "Bob", email: "b@b.com" }, expires: "" };
const adminSession = { user: { id: "1", orgId: 1, role: "admin" as const, name: "Alice", email: "a@a.com" }, expires: "" };

describe("GET /api/dashboard/client-profitability", () => {
  beforeEach(() => {
    mockAuth.mockResolvedValue(null);
    vi.mocked(entriesQueries.getTimeEntries).mockResolvedValue([]);
    vi.mocked(entriesQueries.getRevenueEntries).mockResolvedValue([]);
  });

  it("returns 401 unauthenticated", async () => {
    const req = new NextRequest("http://localhost/api/dashboard/client-profitability");
    expect((await GET(req)).status).toBe(401);
  });

  it("returns array for authenticated user", async () => {
    mockAuth.mockResolvedValue(memberSession);
    const req = new NextRequest("http://localhost/api/dashboard/client-profitability?from=2025-06-01&to=2025-08-31");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  it("scopes to member orgId", async () => {
    mockAuth.mockResolvedValue(memberSession);
    const req = new NextRequest("http://localhost/api/dashboard/client-profitability");
    await GET(req);
    expect(vi.mocked(entriesQueries.getTimeEntries)).toHaveBeenCalledWith(3);
    expect(vi.mocked(entriesQueries.getRevenueEntries)).toHaveBeenCalledWith(3);
  });

  it("admin can override orgId", async () => {
    mockAuth.mockResolvedValue(adminSession);
    const req = new NextRequest("http://localhost/api/dashboard/client-profitability?orgId=99");
    await GET(req);
    expect(vi.mocked(entriesQueries.getTimeEntries)).toHaveBeenCalledWith(99);
  });
});

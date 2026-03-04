import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/revenue-entries/bulk/route";
import { auth } from "@/lib/auth";
import * as entriesQueries from "@/lib/db/queries/entries";

const mockAuth = vi.mocked(auth);
vi.mock("@/lib/db/queries/entries");

const memberSession = { user: { id: "2", orgId: 3, role: "member" as const, name: "Bob", email: "b@b.com" }, expires: "" };

describe("POST /api/revenue-entries/bulk", () => {
  beforeEach(() => mockAuth.mockResolvedValue(null));

  it("returns 401 unauthenticated", async () => {
    const req = new NextRequest("http://localhost/api/revenue-entries/bulk", { method: "POST", body: "[]" });
    expect((await POST(req)).status).toBe(401);
  });

  it("returns 400 for non-array body", async () => {
    mockAuth.mockResolvedValue(memberSession);
    const req = new NextRequest("http://localhost/api/revenue-entries/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify("bad"),
    });
    expect((await POST(req)).status).toBe(400);
  });

  it("inserts and returns 201", async () => {
    mockAuth.mockResolvedValue(memberSession);
    vi.mocked(entriesQueries.insertRevenueEntriesBulk).mockResolvedValue(undefined);
    const rows = [{ clientName: "X", amount: 1000, date: "2025-06-01" }];
    const req = new NextRequest("http://localhost/api/revenue-entries/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rows),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.inserted).toBe(1);
  });
});

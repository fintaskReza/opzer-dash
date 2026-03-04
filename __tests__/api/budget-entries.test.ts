import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/budget-entries/route";
import { auth } from "@/lib/auth";
import * as entriesQueries from "@/lib/db/queries/entries";

const mockAuth = vi.mocked(auth);
vi.mock("@/lib/db/queries/entries");

const memberSession = { user: { id: "2", orgId: 3, role: "member" as const, name: "Bob", email: "b@b.com" }, expires: "" };

describe("GET /api/budget-entries", () => {
  beforeEach(() => mockAuth.mockResolvedValue(null));

  it("returns 401 unauthenticated", async () => {
    const req = new NextRequest("http://localhost/api/budget-entries");
    expect((await GET(req)).status).toBe(401);
  });

  it("returns budgets for authenticated user", async () => {
    mockAuth.mockResolvedValue(memberSession);
    vi.mocked(entriesQueries.getBudgetEntries).mockResolvedValue([{ clientName: "X", budget: 5000 }]);
    const req = new NextRequest("http://localhost/api/budget-entries");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body[0].budget).toBe(5000);
  });
});

describe("POST /api/budget-entries", () => {
  beforeEach(() => mockAuth.mockResolvedValue(null));

  it("returns 400 for missing fields", async () => {
    mockAuth.mockResolvedValue(memberSession);
    const req = new NextRequest("http://localhost/api/budget-entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientName: "X" }),
    });
    expect((await POST(req)).status).toBe(400);
  });

  it("upserts budget and returns 201", async () => {
    mockAuth.mockResolvedValue(memberSession);
    vi.mocked(entriesQueries.upsertBudgetEntry).mockResolvedValue({ id: 1, orgId: 3, clientName: "X", budget: "5000" });
    const req = new NextRequest("http://localhost/api/budget-entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientName: "X", budget: 5000 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });
});

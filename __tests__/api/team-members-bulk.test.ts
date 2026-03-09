import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/team-members/bulk/route";
import { auth } from "@/lib/auth";
import * as tmQueries from "@/lib/db/queries/team-members";

const mockAuth = vi.mocked(auth);
vi.mock("@/lib/db/queries/team-members");

const memberSession = { user: { id: "2", orgId: 3, role: "member" as const, name: "Bob", email: "b@b.com" }, expires: "" };
const adminSession = { user: { id: "1", orgId: 1, role: "admin" as const, name: "Alice", email: "a@a.com" }, expires: "" };

describe("POST /api/team-members/bulk", () => {
  beforeEach(() => mockAuth.mockResolvedValue(null));

  it("returns 401 unauthenticated", async () => {
    const req = new NextRequest("http://localhost/api/team-members/bulk", { method: "POST", body: "[]" });
    expect((await POST(req)).status).toBe(401);
  });

  it("returns 403 for member role", async () => {
    mockAuth.mockResolvedValue(memberSession);
    const req = new NextRequest("http://localhost/api/team-members/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([{ name: "X", costRate: 50, billingRate: 100 }]),
    });
    expect((await POST(req)).status).toBe(403);
  });

  it("returns 400 for non-array body", async () => {
    mockAuth.mockResolvedValue(adminSession);
    const req = new NextRequest("http://localhost/api/team-members/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wrong: true }),
    });
    expect((await POST(req)).status).toBe(400);
  });

  it("returns 400 if exceeds max rows", async () => {
    mockAuth.mockResolvedValue(adminSession);
    const rows = Array(501).fill({ name: "X", costRate: 50, billingRate: 100 });
    const req = new NextRequest("http://localhost/api/team-members/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rows),
    });
    expect((await POST(req)).status).toBe(400);
  });

  it("returns 400 if any row is missing name", async () => {
    mockAuth.mockResolvedValue(adminSession);
    const req = new NextRequest("http://localhost/api/team-members/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([{ costRate: 50, billingRate: 100 }]),
    });
    expect((await POST(req)).status).toBe(400);
  });

  it("upserts rates and returns 201", async () => {
    mockAuth.mockResolvedValue(adminSession);
    vi.mocked(tmQueries.upsertTeamMemberRates).mockResolvedValue({ upserted: 1, updated: 1, created: 0 });
    const req = new NextRequest("http://localhost/api/team-members/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([{ name: "Alice", costRate: 50, billingRate: 120 }]),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.upserted).toBe(1);
    expect(body.updated).toBe(1);
    expect(body.created).toBe(0);
  });
});

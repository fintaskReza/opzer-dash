import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/team-members/route";
import { auth } from "@/lib/auth";
import * as tmQueries from "@/lib/db/queries/team-members";

const mockAuth = vi.mocked(auth);
vi.mock("@/lib/db/queries/team-members");

const memberSession = { user: { id: "2", orgId: 3, role: "member" as const, name: "Bob", email: "b@b.com" }, expires: "" };
const adminSession = { user: { id: "1", orgId: 1, role: "admin" as const, name: "Alice", email: "a@a.com" }, expires: "" };

describe("GET /api/team-members", () => {
  beforeEach(() => mockAuth.mockResolvedValue(null));

  it("returns 401 unauthenticated", async () => {
    const req = new NextRequest("http://localhost/api/team-members");
    expect((await GET(req)).status).toBe(401);
  });

  it("returns team members scoped to member orgId", async () => {
    mockAuth.mockResolvedValue(memberSession);
    vi.mocked(tmQueries.getTeamMembers).mockResolvedValue([]);
    const req = new NextRequest("http://localhost/api/team-members");
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(vi.mocked(tmQueries.getTeamMembers)).toHaveBeenCalledWith(3);
  });
});

describe("POST /api/team-members", () => {
  beforeEach(() => mockAuth.mockResolvedValue(null));

  it("returns 401 unauthenticated", async () => {
    const req = new NextRequest("http://localhost/api/team-members", { method: "POST", body: "{}" });
    expect((await POST(req)).status).toBe(401);
  });

  it("returns 403 for member", async () => {
    mockAuth.mockResolvedValue(memberSession);
    const req = new NextRequest("http://localhost/api/team-members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "X", role: "CFO" }),
    });
    expect((await POST(req)).status).toBe(403);
  });

  it("returns 400 for missing name/role", async () => {
    mockAuth.mockResolvedValue(adminSession);
    const req = new NextRequest("http://localhost/api/team-members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "X" }),
    });
    expect((await POST(req)).status).toBe(400);
  });
});

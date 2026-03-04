import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/clients/route";
import { auth } from "@/lib/auth";
import * as clientQueries from "@/lib/db/queries/clients";

const mockAuth = vi.mocked(auth);
vi.mock("@/lib/db/queries/clients");

const memberSession = { user: { id: "2", orgId: 3, role: "member" as const, name: "Bob", email: "b@b.com" }, expires: "" };
const adminSession = { user: { id: "1", orgId: 1, role: "admin" as const, name: "Alice", email: "a@a.com" }, expires: "" };

describe("GET /api/clients", () => {
  beforeEach(() => mockAuth.mockResolvedValue(null));

  it("returns 401 unauthenticated", async () => {
    const req = new NextRequest("http://localhost/api/clients");
    expect((await GET(req)).status).toBe(401);
  });

  it("returns clients scoped to member orgId", async () => {
    mockAuth.mockResolvedValue(memberSession);
    vi.mocked(clientQueries.getClients).mockResolvedValue([
      { karbonName: "Acme", quickbooksName: "Acme QB", status: "Active" },
    ]);
    const req = new NextRequest("http://localhost/api/clients");
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(vi.mocked(clientQueries.getClients)).toHaveBeenCalledWith(3);
    const body = await res.json();
    expect(body[0].karbonName).toBe("Acme");
  });
});

describe("POST /api/clients", () => {
  beforeEach(() => mockAuth.mockResolvedValue(null));

  it("returns 401 unauthenticated", async () => {
    const req = new NextRequest("http://localhost/api/clients", { method: "POST", body: "{}" });
    expect((await POST(req)).status).toBe(401);
  });

  it("returns 403 for member", async () => {
    mockAuth.mockResolvedValue(memberSession);
    const req = new NextRequest("http://localhost/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ karbonName: "X" }),
    });
    expect((await POST(req)).status).toBe(403);
  });

  it("returns 400 for missing karbonName", async () => {
    mockAuth.mockResolvedValue(adminSession);
    const req = new NextRequest("http://localhost/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect((await POST(req)).status).toBe(400);
  });
});

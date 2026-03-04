import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/orgs/route";
import { auth } from "@/lib/auth";
import * as orgQueries from "@/lib/db/queries/organizations";

const mockAuth = vi.mocked(auth);
vi.mock("@/lib/db/queries/organizations");

const memberSession = { user: { id: "2", orgId: 1, role: "member" as const, name: "Bob", email: "b@b.com" }, expires: "" };
const adminSession = { user: { id: "1", orgId: 1, role: "admin" as const, name: "Alice", email: "a@a.com" }, expires: "" };
const superAdminSession = { user: { id: "0", orgId: null, role: "super-admin" as const, name: "Super", email: "super@super.com" }, expires: "" };

describe("GET /api/orgs", () => {
  beforeEach(() => mockAuth.mockResolvedValue(null));

  it("returns 401 when unauthenticated", async () => {
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 403 for member", async () => {
    mockAuth.mockResolvedValue(memberSession);
    const res = await GET();
    expect(res.status).toBe(403);
  });

  it("returns org list for admin", async () => {
    mockAuth.mockResolvedValue(adminSession);
    vi.mocked(orgQueries.getOrganizations).mockResolvedValue([{ id: 1, name: "Org A", slug: "org-a", createdAt: new Date() }]);
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body[0].name).toBe("Org A");
  });

  it("returns org list for super-admin", async () => {
    mockAuth.mockResolvedValue(superAdminSession);
    vi.mocked(orgQueries.getOrganizations).mockResolvedValue([{ id: 1, name: "Org A", slug: "org-a", createdAt: new Date() }]);
    const res = await GET();
    expect(res.status).toBe(200);
  });
});

describe("POST /api/orgs", () => {
  beforeEach(() => mockAuth.mockResolvedValue(null));

  it("returns 401 when unauthenticated", async () => {
    const req = new NextRequest("http://localhost/api/orgs", { method: "POST", body: JSON.stringify({ name: "X", slug: "x" }) });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 403 for admin (cannot create orgs)", async () => {
    mockAuth.mockResolvedValue(adminSession);
    const req = new NextRequest("http://localhost/api/orgs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "New Org", slug: "new-org" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it("returns 400 for missing fields", async () => {
    mockAuth.mockResolvedValue(superAdminSession);
    const req = new NextRequest("http://localhost/api/orgs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "X" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("creates org for super-admin", async () => {
    mockAuth.mockResolvedValue(superAdminSession);
    vi.mocked(orgQueries.createOrganization).mockResolvedValue({ id: 2, name: "New Org", slug: "new-org", createdAt: new Date() });
    const req = new NextRequest("http://localhost/api/orgs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "New Org", slug: "new-org" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.name).toBe("New Org");
  });
});

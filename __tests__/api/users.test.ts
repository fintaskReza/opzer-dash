import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/users/route";
import { auth } from "@/lib/auth";
import * as userQueries from "@/lib/db/queries/users";

const mockAuth = vi.mocked(auth);
vi.mock("@/lib/db/queries/users");

const superAdminSession = { user: { id: "0", orgId: null, role: "super-admin" as const, name: "Super", email: "super@super.com" }, expires: "" };
const adminSession = { user: { id: "1", orgId: 1, role: "admin" as const, name: "Alice", email: "a@a.com" }, expires: "" };
const memberSession = { user: { id: "2", orgId: 1, role: "member" as const, name: "Bob", email: "b@b.com" }, expires: "" };

const fakeUser = { id: 1, orgId: 1, email: "test@test.com", passwordHash: "hash", name: "Test", role: "member" as const, createdAt: new Date() };

describe("GET /api/users", () => {
  beforeEach(() => mockAuth.mockResolvedValue(null));

  it("returns 401 unauthenticated", async () => {
    const req = new NextRequest("http://localhost/api/users");
    expect((await GET(req)).status).toBe(401);
  });

  it("returns 403 for member", async () => {
    mockAuth.mockResolvedValue(memberSession);
    const req = new NextRequest("http://localhost/api/users");
    expect((await GET(req)).status).toBe(403);
  });

  it("super-admin gets all users", async () => {
    mockAuth.mockResolvedValue(superAdminSession);
    vi.mocked(userQueries.getAllUsers).mockResolvedValue([fakeUser]);
    const req = new NextRequest("http://localhost/api/users");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body[0].email).toBe("test@test.com");
    expect(body[0].passwordHash).toBeUndefined();
  });

  it("admin gets own org users only", async () => {
    mockAuth.mockResolvedValue(adminSession);
    vi.mocked(userQueries.getUsersByOrg).mockResolvedValue([fakeUser]);
    const req = new NextRequest("http://localhost/api/users");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body[0].email).toBe("test@test.com");
    expect(body[0].passwordHash).toBeUndefined();
  });
});

describe("POST /api/users", () => {
  beforeEach(() => {
    mockAuth.mockResolvedValue(null);
    vi.clearAllMocks();
  });

  it("returns 401 unauthenticated", async () => {
    const req = new NextRequest("http://localhost/api/users", { method: "POST", body: "{}" });
    expect((await POST(req)).status).toBe(401);
  });

  it("returns 400 for missing fields", async () => {
    mockAuth.mockResolvedValue(adminSession);
    const req = new NextRequest("http://localhost/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "x@x.com" }),
    });
    expect((await POST(req)).status).toBe(400);
  });

  it("admin creates user in their own org", async () => {
    mockAuth.mockResolvedValue(adminSession);
    vi.mocked(userQueries.createUser).mockResolvedValue(fakeUser);
    const req = new NextRequest("http://localhost/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "x@x.com", password: "pass123", name: "X", orgId: 99 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.passwordHash).toBeUndefined();
    // orgId forced to admin's own org (1), not the provided 99
    expect(vi.mocked(userQueries.createUser).mock.calls[0][0].orgId).toBe(1);
  });

  it("super-admin creates user in specified org", async () => {
    mockAuth.mockResolvedValue(superAdminSession);
    vi.mocked(userQueries.createUser).mockResolvedValue(fakeUser);
    const req = new NextRequest("http://localhost/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "x@x.com", password: "pass123", name: "X", orgId: 5 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(vi.mocked(userQueries.createUser).mock.calls[0][0].orgId).toBe(5);
  });
});

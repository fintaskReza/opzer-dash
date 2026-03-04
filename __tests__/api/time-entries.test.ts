import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, DELETE } from "@/app/api/time-entries/route";
import { auth } from "@/lib/auth";
import * as entriesQueries from "@/lib/db/queries/entries";

const mockAuth = vi.mocked(auth);
vi.mock("@/lib/db/queries/entries");

const memberSession = { user: { id: "2", orgId: 3, role: "member" as const, name: "Bob", email: "b@b.com" }, expires: "" };
const adminSession = { user: { id: "1", orgId: 1, role: "admin" as const, name: "Alice", email: "a@a.com" }, expires: "" };

describe("GET /api/time-entries", () => {
  beforeEach(() => mockAuth.mockResolvedValue(null));

  it("returns 401 unauthenticated", async () => {
    const req = new NextRequest("http://localhost/api/time-entries");
    expect((await GET(req)).status).toBe(401);
  });

  it("returns entries for authenticated user", async () => {
    mockAuth.mockResolvedValue(memberSession);
    vi.mocked(entriesQueries.getTimeEntries).mockResolvedValue([]);
    const req = new NextRequest("http://localhost/api/time-entries");
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(vi.mocked(entriesQueries.getTimeEntries)).toHaveBeenCalledWith(3);
  });
});

describe("DELETE /api/time-entries", () => {
  beforeEach(() => mockAuth.mockResolvedValue(null));

  it("returns 401 unauthenticated", async () => {
    const req = new NextRequest("http://localhost/api/time-entries", { method: "DELETE" });
    expect((await DELETE(req)).status).toBe(401);
  });

  it("returns 403 for member", async () => {
    mockAuth.mockResolvedValue(memberSession);
    const req = new NextRequest("http://localhost/api/time-entries", { method: "DELETE" });
    expect((await DELETE(req)).status).toBe(403);
  });

  it("deletes all for admin", async () => {
    mockAuth.mockResolvedValue(adminSession);
    vi.mocked(entriesQueries.deleteAllTimeEntries).mockResolvedValue(undefined);
    const req = new NextRequest("http://localhost/api/time-entries", { method: "DELETE" });
    const res = await DELETE(req);
    expect(res.status).toBe(204);
  });
});

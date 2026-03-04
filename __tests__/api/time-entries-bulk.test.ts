import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/time-entries/bulk/route";
import { auth } from "@/lib/auth";
import * as entriesQueries from "@/lib/db/queries/entries";

const mockAuth = vi.mocked(auth);
vi.mock("@/lib/db/queries/entries");

const memberSession = { user: { id: "2", orgId: 3, role: "member" as const, name: "Bob", email: "b@b.com" }, expires: "" };

describe("POST /api/time-entries/bulk", () => {
  beforeEach(() => mockAuth.mockResolvedValue(null));

  it("returns 401 unauthenticated", async () => {
    const req = new NextRequest("http://localhost/api/time-entries/bulk", { method: "POST", body: "[]" });
    expect((await POST(req)).status).toBe(401);
  });

  it("returns 400 for non-array body", async () => {
    mockAuth.mockResolvedValue(memberSession);
    const req = new NextRequest("http://localhost/api/time-entries/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wrong: true }),
    });
    expect((await POST(req)).status).toBe(400);
  });

  it("returns 400 if exceeds max rows", async () => {
    mockAuth.mockResolvedValue(memberSession);
    const rows = Array(5001).fill({ clientName: "X", teamMember: "Y", hoursLogged: 1, date: "2025-06-01", serviceTag: "A" });
    const req = new NextRequest("http://localhost/api/time-entries/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rows),
    });
    expect((await POST(req)).status).toBe(400);
  });

  it("inserts entries and returns 201", async () => {
    mockAuth.mockResolvedValue(memberSession);
    vi.mocked(entriesQueries.insertTimeEntriesBulk).mockResolvedValue(undefined);
    const rows = [{ clientName: "X", teamMember: "Y", hoursLogged: 1, date: "2025-06-01", serviceTag: "A" }];
    const req = new NextRequest("http://localhost/api/time-entries/bulk", {
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

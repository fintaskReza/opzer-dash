import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/me/route";
import { auth } from "@/lib/auth";

const mockAuth = vi.mocked(auth);

describe("GET /api/me", () => {
  beforeEach(() => {
    mockAuth.mockResolvedValue(null);
  });

  it("returns 401 when unauthenticated", async () => {
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns session info when authenticated", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "7", orgId: 3, role: "admin", name: "Alice", email: "alice@test.com" },
      expires: "",
    });
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe("7");
    expect(body.orgId).toBe(3);
    expect(body.role).toBe("admin");
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { auth } from "@/lib/auth";
import { requireAuth, requireAdmin, requireSuperAdmin, resolveOrgId, isAuthContext } from "@/lib/api-utils";

const mockAuth = vi.mocked(auth);

describe("requireAuth", () => {
  beforeEach(() => {
    mockAuth.mockResolvedValue(null);
  });

  it("returns 401 when no session", async () => {
    const result = await requireAuth();
    expect(isAuthContext(result)).toBe(false);
    // It's a NextResponse with status 401
    const res = result as Response;
    expect(res.status).toBe(401);
  });

  it("returns AuthContext when session exists", async () => {
    mockAuth.mockResolvedValue({
      user: { id: "1", orgId: 42, role: "member", name: "Test", email: "test@test.com" },
      expires: "",
    });
    const result = await requireAuth();
    expect(isAuthContext(result)).toBe(true);
    if (isAuthContext(result)) {
      expect(result.userId).toBe("1");
      expect(result.orgId).toBe(42);
      expect(result.role).toBe("member");
    }
  });
});

describe("requireAdmin", () => {
  it("returns null for admin role", () => {
    const ctx = { userId: "1", orgId: 1, role: "admin" as const };
    expect(requireAdmin(ctx)).toBeNull();
  });

  it("returns null for super-admin role", () => {
    const ctx = { userId: "1", orgId: null, role: "super-admin" as const };
    expect(requireAdmin(ctx)).toBeNull();
  });

  it("returns 403 for member role", () => {
    const ctx = { userId: "1", orgId: 1, role: "member" as const };
    const result = requireAdmin(ctx);
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });
});

describe("requireSuperAdmin", () => {
  it("returns null for super-admin role", () => {
    const ctx = { userId: "1", orgId: null, role: "super-admin" as const };
    expect(requireSuperAdmin(ctx)).toBeNull();
  });

  it("returns 403 for admin role", () => {
    const ctx = { userId: "1", orgId: 1, role: "admin" as const };
    const result = requireSuperAdmin(ctx);
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });

  it("returns 403 for member role", () => {
    const ctx = { userId: "1", orgId: 1, role: "member" as const };
    const result = requireSuperAdmin(ctx);
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });
});

describe("resolveOrgId", () => {
  it("returns own orgId for member regardless of ?orgId param", () => {
    const ctx = { userId: "1", orgId: 5, role: "member" as const };
    const sp = new URLSearchParams("orgId=99");
    expect(resolveOrgId(ctx, sp)).toBe(5);
  });

  it("returns override orgId for admin when ?orgId provided", () => {
    const ctx = { userId: "1", orgId: 5, role: "admin" as const };
    const sp = new URLSearchParams("orgId=99");
    expect(resolveOrgId(ctx, sp)).toBe(99);
  });

  it("returns own orgId for admin when no ?orgId param", () => {
    const ctx = { userId: "1", orgId: 5, role: "admin" as const };
    const sp = new URLSearchParams();
    expect(resolveOrgId(ctx, sp)).toBe(5);
  });

  it("returns override orgId for super-admin when ?orgId provided", () => {
    const ctx = { userId: "1", orgId: null, role: "super-admin" as const };
    const sp = new URLSearchParams("orgId=7");
    expect(resolveOrgId(ctx, sp)).toBe(7);
  });

  it("returns null for super-admin when no ?orgId param", () => {
    const ctx = { userId: "1", orgId: null, role: "super-admin" as const };
    const sp = new URLSearchParams();
    expect(resolveOrgId(ctx, sp)).toBeNull();
  });
});

"use client";

import { useState } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface OrgUser {
  id: number;
  orgId: number;
  email: string;
  name: string;
  role: "admin" | "member";
  createdAt: string;
}

interface Org {
  id: number;
  name: string;
  slug: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function UserManagementPanel() {
  const { data: users = [], isLoading: loadingUsers } = useSWR<OrgUser[]>("/api/users", fetcher);
  const { data: orgs = [] } = useSWR<Org[]>("/api/orgs", fetcher);

  const [form, setForm] = useState({ name: "", email: "", password: "", orgId: "", role: "member" });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!form.orgId) { setFormError("Select an organisation"); return; }
    setSubmitting(true);

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, orgId: parseInt(form.orgId, 10) }),
    });

    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setFormError(body.error ?? "Failed to create user");
      return;
    }

    setForm({ name: "", email: "", password: "", orgId: "", role: "member" });
    globalMutate("/api/users");
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this user?")) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    globalMutate("/api/users");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">User Management</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Add and remove users across all organisations</p>
      </div>

      {/* Add user form */}
      <Card className="p-5">
        <h3 className="mb-4 text-sm font-medium text-foreground">Add User</h3>
        <form onSubmit={handleAddUser} className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Password</Label>
            <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className="h-8 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Organisation</Label>
            <select
              value={form.orgId}
              onChange={(e) => setForm({ ...form, orgId: e.target.value })}
              className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground"
              required
            >
              <option value="">Select org...</option>
              {orgs.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Role</Label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button type="submit" size="sm" disabled={submitting} className="h-8 text-xs">
              {submitting ? "Adding..." : "Add User"}
            </Button>
          </div>
          {formError && <p className="col-span-2 text-xs text-red-400">{formError}</p>}
        </form>
      </Card>

      {/* User table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Org</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Role</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Created</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {loadingUsers ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No users</td></tr>
              ) : (
                users.map((u) => {
                  const org = orgs.find((o) => o.id === u.orgId);
                  return (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="px-4 py-2.5 font-medium text-foreground">{u.name}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{org?.name ?? u.orgId}</td>
                      <td className="px-4 py-2.5">
                        <Badge variant={u.role === "admin" ? "default" : "secondary"} className="text-[10px]">
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString("en-IE", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-[10px] text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(u.id)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

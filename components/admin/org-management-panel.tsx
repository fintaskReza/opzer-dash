"use client";

import { useState } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface Org {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function OrgManagementPanel() {
  const { data: orgs = [], isLoading } = useSWR<Org[]>("/api/orgs", fetcher);

  const [form, setForm] = useState({ name: "", slug: "" });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: "", slug: "" });
  const [editError, setEditError] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!form.name || !form.slug) { setFormError("Name and slug are required"); return; }
    setSubmitting(true);

    const res = await fetch("/api/orgs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setFormError(data.error ?? "Failed to create organisation");
      return;
    }

    setForm({ name: "", slug: "" });
    globalMutate("/api/orgs");
  }

  function startEdit(org: Org) {
    setEditingId(org.id);
    setEditForm({ name: org.name, slug: org.slug });
    setEditError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError("");
  }

  async function handleSaveEdit(id: number) {
    setEditError("");
    setEditSaving(true);

    const res = await fetch(`/api/orgs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });

    setEditSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setEditError(data.error ?? "Failed to save");
      return;
    }

    setEditingId(null);
    globalMutate("/api/orgs");
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete "${name}"? This will permanently remove all users, clients, time entries, and revenue entries for this organisation.`)) return;

    await fetch(`/api/orgs/${id}`, { method: "DELETE" });
    globalMutate("/api/orgs");
    globalMutate("/api/users");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Organisation Management</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Create, edit, and delete organisations</p>
      </div>

      {/* Create org form */}
      <Card className="p-5">
        <h3 className="mb-4 text-sm font-medium text-foreground">Create Organisation</h3>
        <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Acme Corp"
              required
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Slug</Label>
            <Input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
              placeholder="acme-corp"
              required
              className="h-8 text-xs font-mono"
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" size="sm" disabled={submitting} className="h-8 text-xs">
              {submitting ? "Creating..." : "Create Organisation"}
            </Button>
          </div>
          {formError && <p className="col-span-2 text-xs text-red-400">{formError}</p>}
        </form>
      </Card>

      {/* Org table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Slug</th>
                <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Created</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : orgs.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No organisations</td></tr>
              ) : (
                orgs.map((org) => {
                  const isEditing = editingId === org.id;
                  return (
                    <tr key={org.id} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="px-4 py-2.5">
                        {isEditing ? (
                          <Input
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="h-6 text-xs"
                            autoFocus
                          />
                        ) : (
                          <span className="font-medium text-foreground">{org.name}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        {isEditing ? (
                          <Input
                            value={editForm.slug}
                            onChange={(e) => setEditForm({ ...editForm, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                            className="h-6 text-xs font-mono"
                          />
                        ) : (
                          <span className="font-mono text-muted-foreground">{org.slug}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {new Date(org.createdAt).toLocaleDateString("en-IE", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            {editError && <span className="text-[10px] text-red-400 mr-2">{editError}</span>}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-[10px] text-primary hover:text-primary"
                              onClick={() => handleSaveEdit(org.id)}
                              disabled={editSaving}
                            >
                              {editSaving ? "Saving..." : "Save"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-[10px] text-muted-foreground"
                              onClick={cancelEdit}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
                              onClick={() => startEdit(org)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-[10px] text-muted-foreground hover:text-destructive"
                              onClick={() => handleDelete(org.id, org.name)}
                            >
                              Delete
                            </Button>
                          </div>
                        )}
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

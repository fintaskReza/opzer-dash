"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UserCog, Plus, Pencil, Trash2, Loader2, AlertCircle } from "lucide-react";

interface TeamMemberRow {
  id: number;
  orgId: number;
  name: string;
  role: string;
  costRate: string;
  billingRate: string;
  status: "Active" | "Inactive";
  capacityHoursPerMonth: number;
  location: "Onshore" | "Offshore";
}

const EMPTY_FORM = {
  name: "",
  role: "",
  costRate: "0",
  billingRate: "0",
  status: "Active" as "Active" | "Inactive",
  capacityHoursPerMonth: 140,
  location: "Onshore" as "Onshore" | "Offshore",
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function TeamMembersPanel() {
  const { data: members = [], isLoading, mutate } = useSWR<TeamMemberRow[]>("/api/team-members", fetcher);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMemberRow | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  }

  function openEdit(m: TeamMemberRow) {
    setEditing(m);
    setForm({
      name: m.name,
      role: m.role,
      costRate: m.costRate,
      billingRate: m.billingRate,
      status: m.status as "Active" | "Inactive",
      capacityHoursPerMonth: m.capacityHoursPerMonth,
      location: m.location as "Onshore" | "Offshore",
    });
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setError("");
  }

  function setField<K extends keyof typeof EMPTY_FORM>(key: K, value: typeof EMPTY_FORM[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim()) {
      setError("Name and role are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        name: form.name.trim(),
        role: form.role.trim(),
        costRate: parseFloat(form.costRate) || 0,
        billingRate: parseFloat(form.billingRate) || 0,
        status: form.status,
        capacityHoursPerMonth: Number(form.capacityHoursPerMonth) || 140,
        location: form.location,
      };

      const res = editing
        ? await fetch(`/api/team-members/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/team-members", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? `Error ${res.status}`);
        return;
      }
      await mutate();
      closeModal();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(m: TeamMemberRow) {
    if (!confirm(`Delete ${m.name}? This cannot be undone.`)) return;
    setDeletingId(m.id);
    try {
      await fetch(`/api/team-members/${m.id}`, { method: "DELETE" });
      await mutate();
    } finally {
      setDeletingId(null);
    }
  }

  const activeCount = members.filter((m) => m.status === "Active").length;

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <UserCog className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Team Members</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {members.length} member{members.length !== 1 ? "s" : ""} · {activeCount} active
                </p>
              </div>
            </div>
            <Button size="sm" className="h-8 text-xs" onClick={openAdd}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add member
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <UserCog className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No team members yet.</p>
              <p className="text-xs text-muted-foreground">Add members manually or import a time entries CSV.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Role</th>
                    <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Cost Rate</th>
                    <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Billing Rate</th>
                    <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Capacity</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Location</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {members.map((m, i) => (
                    <tr
                      key={m.id}
                      className={`border-b border-border/50 last:border-0 ${i % 2 === 0 ? "" : "bg-muted/20"}`}
                    >
                      <td className="px-4 py-2.5 font-medium text-foreground">{m.name}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{m.role}</td>
                      <td className="px-4 py-2.5 text-right text-foreground">
                        €{parseFloat(m.costRate).toFixed(2)}/hr
                      </td>
                      <td className="px-4 py-2.5 text-right text-foreground">
                        €{parseFloat(m.billingRate).toFixed(2)}/hr
                      </td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground">
                        {m.capacityHoursPerMonth} hrs/mo
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{m.location}</td>
                      <td className="px-4 py-2.5">
                        <Badge
                          className={`h-4 px-1.5 text-[10px] ${
                            m.status === "Active"
                              ? "bg-emerald-400/10 text-emerald-400"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {m.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => openEdit(m)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(m)}
                            disabled={deletingId === m.id}
                          >
                            {deletingId === m.id
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : <Trash2 className="h-3 w-3" />
                            }
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="border-t border-border bg-muted/20 px-6 py-3">
            <p className="text-[11px] text-muted-foreground">
              New team member names in CSV imports are auto-added here with zero rates. Set their rates before reviewing profitability data.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={(o) => !o && closeModal()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">{editing ? "Edit Team Member" : "Add Team Member"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs">Name</Label>
                <Input
                  className="h-8 text-xs"
                  placeholder="e.g. Alice Murphy"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs">Role</Label>
                <Input
                  className="h-8 text-xs"
                  placeholder="e.g. Senior Accountant"
                  value={form.role}
                  onChange={(e) => setField("role", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Cost Rate (€/hr)</Label>
                <Input
                  className="h-8 text-xs"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.costRate}
                  onChange={(e) => setField("costRate", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Billing Rate (€/hr)</Label>
                <Input
                  className="h-8 text-xs"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.billingRate}
                  onChange={(e) => setField("billingRate", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Capacity (hrs/month)</Label>
                <Input
                  className="h-8 text-xs"
                  type="number"
                  min="1"
                  value={form.capacityHoursPerMonth}
                  onChange={(e) => setField("capacityHoursPerMonth", parseInt(e.target.value) || 140)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Location</Label>
                <Select value={form.location} onValueChange={(v) => setField("location", v as "Onshore" | "Offshore")}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Onshore">Onshore</SelectItem>
                    <SelectItem value="Offshore">Offshore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <Select value={form.status} onValueChange={(v) => setField("status", v as "Active" | "Inactive")}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && (
              <p className="flex items-center gap-1.5 text-xs text-rose-400">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="secondary" size="sm" className="text-xs" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs" disabled={submitting}>
                {submitting && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                {editing ? "Save changes" : "Add member"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

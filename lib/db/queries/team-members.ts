import { db } from "../index";
import { teamMembers } from "../schema";
import { eq, and, inArray } from "drizzle-orm";
import type { TeamMember, TeamMemberRateRow } from "@/lib/types";

function toTeamMember(r: typeof teamMembers.$inferSelect): TeamMember {
  return {
    name: r.name,
    role: r.role,
    costRate: parseFloat(r.costRate),
    billingRate: parseFloat(r.billingRate),
    status: r.status as "Active" | "Inactive",
    capacityHoursPerMonth: r.capacityHoursPerMonth,
    location: r.location as "Onshore" | "Offshore",
  };
}

export async function getTeamMembers(orgId: number): Promise<TeamMember[]> {
  const rows = await db.select().from(teamMembers).where(eq(teamMembers.orgId, orgId)).orderBy(teamMembers.name);
  return rows.map(toTeamMember);
}

export async function getTeamMembersRaw(orgId: number) {
  return db.select().from(teamMembers).where(eq(teamMembers.orgId, orgId)).orderBy(teamMembers.name);
}

export async function getTeamMemberById(id: number, orgId: number) {
  const rows = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.id, id), eq(teamMembers.orgId, orgId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createTeamMember(
  orgId: number,
  data: {
    name: string;
    role: string;
    costRate: number;
    billingRate: number;
    status: "Active" | "Inactive";
    capacityHoursPerMonth: number;
    location: "Onshore" | "Offshore";
  }
) {
  const rows = await db
    .insert(teamMembers)
    .values({
      orgId,
      name: data.name,
      role: data.role,
      costRate: String(data.costRate),
      billingRate: String(data.billingRate),
      status: data.status,
      capacityHoursPerMonth: data.capacityHoursPerMonth,
      location: data.location,
    })
    .returning();
  return rows[0];
}

export async function updateTeamMember(
  id: number,
  orgId: number,
  data: Partial<{
    name: string;
    role: string;
    costRate: number;
    billingRate: number;
    status: "Active" | "Inactive";
    capacityHoursPerMonth: number;
    location: "Onshore" | "Offshore";
  }>
) {
  const updates: Partial<typeof teamMembers.$inferInsert> = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.role !== undefined) updates.role = data.role;
  if (data.costRate !== undefined) updates.costRate = String(data.costRate);
  if (data.billingRate !== undefined) updates.billingRate = String(data.billingRate);
  if (data.status !== undefined) updates.status = data.status;
  if (data.capacityHoursPerMonth !== undefined) updates.capacityHoursPerMonth = data.capacityHoursPerMonth;
  if (data.location !== undefined) updates.location = data.location;

  const rows = await db
    .update(teamMembers)
    .set(updates)
    .where(and(eq(teamMembers.id, id), eq(teamMembers.orgId, orgId)))
    .returning();
  return rows[0] ?? null;
}

export async function deleteTeamMember(id: number, orgId: number) {
  await db.delete(teamMembers).where(and(eq(teamMembers.id, id), eq(teamMembers.orgId, orgId)));
}

// Upsert rates by name — update existing, create new. Used by bulk rates CSV import.
export async function upsertTeamMemberRates(
  orgId: number,
  rows: TeamMemberRateRow[]
): Promise<{ upserted: number; updated: number; created: number }> {
  if (rows.length === 0) return { upserted: 0, updated: 0, created: 0 };

  // Deduplicate input by name (last row wins)
  const deduped = new Map<string, TeamMemberRateRow>();
  for (const r of rows) deduped.set(r.name, r);
  const unique = [...deduped.values()];

  const names = unique.map((r) => r.name);
  const existing = await db
    .select({ id: teamMembers.id, name: teamMembers.name })
    .from(teamMembers)
    .where(and(eq(teamMembers.orgId, orgId), inArray(teamMembers.name, names)));
  const existingMap = new Map(existing.map((r) => [r.name, r.id]));

  let updated = 0;
  let created = 0;

  for (const row of unique) {
    const existingId = existingMap.get(row.name);
    if (existingId !== undefined) {
      const updates: Partial<typeof teamMembers.$inferInsert> = {
        costRate: String(row.costRate),
        billingRate: String(row.billingRate),
      };
      if (row.role !== undefined) updates.role = row.role;
      if (row.capacityHoursPerMonth !== undefined) updates.capacityHoursPerMonth = row.capacityHoursPerMonth;
      if (row.location !== undefined) updates.location = row.location;
      if (row.status !== undefined) updates.status = row.status;
      await db.update(teamMembers).set(updates).where(and(eq(teamMembers.id, existingId), eq(teamMembers.orgId, orgId)));
      updated++;
    } else {
      await db.insert(teamMembers).values({
        orgId,
        name: row.name,
        role: row.role ?? "Team Member",
        costRate: String(row.costRate),
        billingRate: String(row.billingRate),
        status: row.status ?? "Active",
        capacityHoursPerMonth: row.capacityHoursPerMonth ?? 140,
        location: row.location ?? "Onshore",
      });
      created++;
    }
  }

  return { upserted: unique.length, updated, created };
}

// Auto-create any names not already in the table (from CSV import). Does not overwrite existing rows.
export async function upsertTeamMembersByNames(orgId: number, names: string[]) {
  if (names.length === 0) return;
  const existing = await db
    .select({ name: teamMembers.name })
    .from(teamMembers)
    .where(and(eq(teamMembers.orgId, orgId), inArray(teamMembers.name, names)));
  const existingNames = new Set(existing.map((r) => r.name));
  const newNames = names.filter((n) => !existingNames.has(n));
  if (newNames.length === 0) return;
  await db.insert(teamMembers).values(
    newNames.map((name) => ({
      orgId,
      name,
      role: "Team Member",
      costRate: "0",
      billingRate: "0",
      status: "Active" as const,
      capacityHoursPerMonth: 140,
      location: "Onshore" as const,
    }))
  );
}

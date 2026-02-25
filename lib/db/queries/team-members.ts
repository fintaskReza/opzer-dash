import { db } from "../index";
import { teamMembers } from "../schema";
import { eq, and } from "drizzle-orm";
import type { TeamMember } from "@/lib/types";

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

import { db } from "../index";
import { timeEntries, revenueEntries, budgetEntries } from "../schema";
import { eq, and } from "drizzle-orm";
import type { TimeEntry, RevenueEntry, BudgetEntry } from "@/lib/types";

// ── Time Entries ─────────────────────────────────────────────────────────────

function toTimeEntry(r: typeof timeEntries.$inferSelect): TimeEntry {
  return {
    clientName: r.clientName,
    teamMember: r.teamMember,
    hoursLogged: parseFloat(r.hoursLogged),
    date: r.date,
    serviceTag: r.serviceTag,
    billable: r.billable ?? true,
  };
}

export async function getTimeEntries(orgId: number): Promise<TimeEntry[]> {
  const rows = await db.select().from(timeEntries).where(eq(timeEntries.orgId, orgId));
  return rows.map(toTimeEntry);
}

export async function getTimeEntryById(id: number, orgId: number) {
  const rows = await db
    .select()
    .from(timeEntries)
    .where(and(eq(timeEntries.id, id), eq(timeEntries.orgId, orgId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function insertTimeEntriesBulk(
  orgId: number,
  entries: Array<Omit<TimeEntry, "billable"> & { billable?: boolean; dataSource?: string }>
) {
  if (entries.length === 0) return;
  const values = entries.map((e) => ({
    orgId,
    clientName: e.clientName,
    teamMember: e.teamMember,
    hoursLogged: String(e.hoursLogged),
    date: e.date,
    serviceTag: e.serviceTag || "Uncategorized",
    billable: e.billable ?? true,
    dataSource: e.dataSource ?? "csv",
  }));
  await db.insert(timeEntries).values(values);
}

export async function deleteTimeEntry(id: number, orgId: number) {
  await db.delete(timeEntries).where(and(eq(timeEntries.id, id), eq(timeEntries.orgId, orgId)));
}

export async function deleteAllTimeEntries(orgId: number) {
  await db.delete(timeEntries).where(eq(timeEntries.orgId, orgId));
}

// ── Revenue Entries ───────────────────────────────────────────────────────────

function toRevenueEntry(r: typeof revenueEntries.$inferSelect): RevenueEntry {
  return {
    clientName: r.clientName,
    amount: parseFloat(r.amount),
    date: r.date,
  };
}

export async function getRevenueEntries(orgId: number): Promise<RevenueEntry[]> {
  const rows = await db.select().from(revenueEntries).where(eq(revenueEntries.orgId, orgId));
  return rows.map(toRevenueEntry);
}

export async function getRevenueEntryById(id: number, orgId: number) {
  const rows = await db
    .select()
    .from(revenueEntries)
    .where(and(eq(revenueEntries.id, id), eq(revenueEntries.orgId, orgId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function insertRevenueEntriesBulk(
  orgId: number,
  entries: Array<RevenueEntry & { dataSource?: string }>
) {
  if (entries.length === 0) return;
  const values = entries.map((e) => ({
    orgId,
    clientName: e.clientName,
    amount: String(e.amount),
    date: e.date,
    dataSource: e.dataSource ?? "csv",
  }));
  await db.insert(revenueEntries).values(values);
}

export async function deleteRevenueEntry(id: number, orgId: number) {
  await db.delete(revenueEntries).where(and(eq(revenueEntries.id, id), eq(revenueEntries.orgId, orgId)));
}

export async function deleteAllRevenueEntries(orgId: number) {
  await db.delete(revenueEntries).where(eq(revenueEntries.orgId, orgId));
}

// ── Budget Entries ────────────────────────────────────────────────────────────

function toBudgetEntry(r: typeof budgetEntries.$inferSelect): BudgetEntry {
  return {
    clientName: r.clientName,
    budget: parseFloat(r.budget),
  };
}

export async function getBudgetEntries(orgId: number): Promise<BudgetEntry[]> {
  const rows = await db.select().from(budgetEntries).where(eq(budgetEntries.orgId, orgId));
  return rows.map(toBudgetEntry);
}

export async function getBudgetEntryById(id: number, orgId: number) {
  const rows = await db
    .select()
    .from(budgetEntries)
    .where(and(eq(budgetEntries.id, id), eq(budgetEntries.orgId, orgId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertBudgetEntry(orgId: number, clientName: string, budget: number) {
  // Check if exists
  const existing = await db
    .select()
    .from(budgetEntries)
    .where(and(eq(budgetEntries.orgId, orgId), eq(budgetEntries.clientName, clientName)))
    .limit(1);

  if (existing.length > 0) {
    const rows = await db
      .update(budgetEntries)
      .set({ budget: String(budget) })
      .where(and(eq(budgetEntries.id, existing[0].id), eq(budgetEntries.orgId, orgId)))
      .returning();
    return rows[0];
  } else {
    const rows = await db
      .insert(budgetEntries)
      .values({ orgId, clientName, budget: String(budget) })
      .returning();
    return rows[0];
  }
}

export async function deleteBudgetEntry(id: number, orgId: number) {
  await db.delete(budgetEntries).where(and(eq(budgetEntries.id, id), eq(budgetEntries.orgId, orgId)));
}

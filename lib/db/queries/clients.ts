import { db } from "../index";
import { clients } from "../schema";
import { eq, and } from "drizzle-orm";
import type { Client } from "@/lib/types";

export async function getClients(orgId: number): Promise<Client[]> {
  const rows = await db.select().from(clients).where(eq(clients.orgId, orgId)).orderBy(clients.karbonName);
  return rows.map((r) => ({
    karbonName: r.karbonName,
    quickbooksName: r.quickbooksName,
    status: r.status as "Active" | "Inactive",
  }));
}

export async function getClientById(id: number, orgId: number) {
  const rows = await db
    .select()
    .from(clients)
    .where(and(eq(clients.id, id), eq(clients.orgId, orgId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createClient(
  orgId: number,
  data: { karbonName: string; quickbooksName: string; status?: "Active" | "Inactive" }
) {
  const rows = await db
    .insert(clients)
    .values({ orgId, karbonName: data.karbonName, quickbooksName: data.quickbooksName, status: data.status ?? "Active" })
    .returning();
  return rows[0];
}

export async function deleteClient(id: number, orgId: number) {
  await db.delete(clients).where(and(eq(clients.id, id), eq(clients.orgId, orgId)));
}

import { db } from "../index";
import { organizations } from "../schema";
import { eq } from "drizzle-orm";

export async function getOrganizations() {
  return db.select().from(organizations).orderBy(organizations.name);
}

export async function getOrganizationById(id: number) {
  const rows = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getOrganizationBySlug(slug: string) {
  const rows = await db.select().from(organizations).where(eq(organizations.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function createOrganization(data: { name: string; slug: string }) {
  const rows = await db.insert(organizations).values(data).returning();
  return rows[0];
}

export async function deleteOrganization(id: number) {
  await db.delete(organizations).where(eq(organizations.id, id));
}

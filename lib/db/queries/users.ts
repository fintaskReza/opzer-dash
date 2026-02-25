import { db } from "../index";
import { users } from "../schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function getUserByEmail(email: string) {
  const rows = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  return rows[0] ?? null;
}

export async function getUserById(id: number) {
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getAllUsers() {
  return db.select().from(users).orderBy(users.email);
}

export async function getUsersByOrg(orgId: number) {
  return db.select().from(users).where(eq(users.orgId, orgId)).orderBy(users.email);
}

export async function createUser(data: {
  orgId: number;
  email: string;
  password: string;
  name: string;
  role?: "admin" | "member";
}) {
  const passwordHash = await bcrypt.hash(data.password, 12);
  const rows = await db
    .insert(users)
    .values({
      orgId: data.orgId,
      email: data.email.toLowerCase(),
      passwordHash,
      name: data.name,
      role: data.role ?? "member",
    })
    .returning();
  return rows[0];
}

export async function updateUser(
  id: number,
  data: Partial<{ name: string; role: "admin" | "member"; password: string }>
) {
  const updates: Partial<typeof users.$inferInsert> = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.role !== undefined) updates.role = data.role;
  if (data.password !== undefined) updates.passwordHash = await bcrypt.hash(data.password, 12);
  const rows = await db.update(users).set(updates).where(eq(users.id, id)).returning();
  return rows[0] ?? null;
}

export async function deleteUser(id: number) {
  await db.delete(users).where(eq(users.id, id));
}

export async function verifyPassword(user: { passwordHash: string }, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.passwordHash);
}

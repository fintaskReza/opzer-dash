import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../lib/db/schema";
import { organizations, users, teamMembers, clients, timeEntries, revenueEntries, budgetEntries } from "../lib/db/schema";
import bcrypt from "bcryptjs";
import {
  TEAM_MEMBERS,
  CLIENTS,
  TIME_ENTRIES,
  REVENUE_ENTRIES,
  BUDGET_ENTRIES,
} from "../lib/data";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function main() {
  console.log("Seeding database...");

  // Create demo org
  const [org] = await db
    .insert(organizations)
    .values({ name: "Opzer Demo Firm", slug: "opzer-demo" })
    .onConflictDoNothing()
    .returning();

  if (!org) {
    console.log("Org already exists — skipping seed (run with empty DB to re-seed)");
    process.exit(0);
  }

  console.log(`Created org: ${org.name} (id=${org.id})`);

  // Create admin user
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Opzer2025!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await db.insert(users).values({
    orgId: org.id,
    email: "reza@fintask.ie",
    passwordHash,
    name: "Reza Shahrokhi",
    role: "admin",
  });
  console.log("Created admin user: reza@fintask.ie");

  // Seed team members
  await db.insert(teamMembers).values(
    TEAM_MEMBERS.map((m) => ({
      orgId: org.id,
      name: m.name,
      role: m.role,
      costRate: String(m.costRate),
      billingRate: String(m.billingRate ?? 0),
      status: m.status,
      capacityHoursPerMonth: m.capacityHoursPerMonth ?? 140,
      location: m.location ?? "Onshore",
    }))
  );
  console.log(`Seeded ${TEAM_MEMBERS.length} team members`);

  // Seed clients
  await db.insert(clients).values(
    CLIENTS.map((c) => ({
      orgId: org.id,
      karbonName: c.karbonName,
      quickbooksName: c.quickbooksName,
      status: c.status,
    }))
  );
  console.log(`Seeded ${CLIENTS.length} clients`);

  // Seed time entries
  await db.insert(timeEntries).values(
    TIME_ENTRIES.map((t) => ({
      orgId: org.id,
      clientName: t.clientName,
      teamMember: t.teamMember,
      hoursLogged: String(t.hoursLogged),
      date: t.date,
      serviceTag: t.serviceTag,
      billable: t.billable ?? true,
      dataSource: "seed",
    }))
  );
  console.log(`Seeded ${TIME_ENTRIES.length} time entries`);

  // Seed revenue entries (already QB-normalised)
  await db.insert(revenueEntries).values(
    REVENUE_ENTRIES.map((r) => ({
      orgId: org.id,
      clientName: r.clientName,
      amount: String(r.amount),
      date: r.date,
      dataSource: "seed",
    }))
  );
  console.log(`Seeded ${REVENUE_ENTRIES.length} revenue entries`);

  // Seed budgets
  await db.insert(budgetEntries).values(
    BUDGET_ENTRIES.map((b) => ({
      orgId: org.id,
      clientName: b.clientName,
      budget: String(b.budget),
    }))
  );
  console.log(`Seeded ${BUDGET_ENTRIES.length} budget entries`);

  console.log("\nSeed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

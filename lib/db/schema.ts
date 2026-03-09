import { pgTable, text, numeric, integer, boolean, serial, timestamp, unique } from "drizzle-orm/pg-core";

export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").references(() => organizations.id, { onDelete: "cascade" }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["super-admin", "admin", "member"] }).notNull().default("member"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  role: text("role").notNull(),
  costRate: numeric("cost_rate", { precision: 10, scale: 2 }).notNull().default("0"),
  billingRate: numeric("billing_rate", { precision: 10, scale: 2 }).notNull().default("0"),
  status: text("status", { enum: ["Active", "Inactive"] }).notNull().default("Active"),
  capacityHoursPerMonth: integer("capacity_hours_per_month").notNull().default(140),
  location: text("location", { enum: ["Onshore", "Offshore"] }).notNull().default("Onshore"),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  karbonName: text("karbon_name").notNull(),
  quickbooksName: text("quickbooks_name").notNull(),
  status: text("status", { enum: ["Active", "Inactive"] }).notNull().default("Active"),
});

export const timeEntries = pgTable("time_entries", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  clientName: text("client_name").notNull(),
  teamMember: text("team_member").notNull(),
  hoursLogged: numeric("hours_logged", { precision: 8, scale: 2 }).notNull(),
  date: text("date").notNull(), // YYYY-MM-DD stored as text for string comparison
  serviceTag: text("service_tag").notNull().default("Uncategorized"),
  billable: boolean("billable").default(true),
  dataSource: text("data_source").notNull().default("manual"),
}, (t) => ({
  uniqueEntry: unique().on(t.orgId, t.clientName, t.teamMember, t.date),
}));

export const revenueEntries = pgTable("revenue_entries", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  clientName: text("client_name").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  date: text("date").notNull(), // YYYY-MM-DD stored as text
  dataSource: text("data_source").notNull().default("manual"),
}, (t) => ({
  uniqueEntry: unique().on(t.orgId, t.clientName, t.date),
}));

export const budgetEntries = pgTable("budget_entries", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  clientName: text("client_name").notNull(),
  budget: numeric("budget", { precision: 12, scale: 2 }).notNull(),
});

export const quickbooksConnections = pgTable("quickbooks_connections", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  realmId: text("realm_id").notNull(),
  companyName: text("company_name"),
  encryptedAccessToken: text("encrypted_access_token").notNull(),
  encryptedRefreshToken: text("encrypted_refresh_token").notNull(),
  accessTokenExpiresAt: timestamp("access_token_expires_at").notNull(),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  orgRealmUnique: unique().on(t.orgId, t.realmId),
}));

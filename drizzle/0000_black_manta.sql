CREATE TABLE "budget_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"org_id" integer NOT NULL,
	"client_name" text NOT NULL,
	"budget" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"org_id" integer NOT NULL,
	"karbon_name" text NOT NULL,
	"quickbooks_name" text NOT NULL,
	"status" text DEFAULT 'Active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "revenue_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"org_id" integer NOT NULL,
	"client_name" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"date" text NOT NULL,
	"data_source" text DEFAULT 'manual' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"org_id" integer NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"cost_rate" numeric(10, 2) DEFAULT '0' NOT NULL,
	"billing_rate" numeric(10, 2) DEFAULT '0' NOT NULL,
	"status" text DEFAULT 'Active' NOT NULL,
	"capacity_hours_per_month" integer DEFAULT 140 NOT NULL,
	"location" text DEFAULT 'Onshore' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"org_id" integer NOT NULL,
	"client_name" text NOT NULL,
	"team_member" text NOT NULL,
	"hours_logged" numeric(8, 2) NOT NULL,
	"date" text NOT NULL,
	"service_tag" text DEFAULT 'Uncategorized' NOT NULL,
	"billable" boolean DEFAULT true,
	"data_source" text DEFAULT 'manual' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"org_id" integer NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "budget_entries" ADD CONSTRAINT "budget_entries_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_entries" ADD CONSTRAINT "revenue_entries_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
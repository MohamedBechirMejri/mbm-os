import { sql } from "drizzle-orm";
import {
  customType,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

export const users = pgTable(
  "users",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    username: text().notNull(),
    email: text().notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("users_username_unique").on(table.username),
    unique("users_email_unique").on(table.email),
  ],
);

export const demoEvents = pgTable(
  "demo_events",
  {
    id: integer().primaryKey().notNull(),
    orgId: integer("org_id"),
    searchId: integer("search_id"),
    companyId: integer("company_id"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
    companyName: text("company_name"),
    title: text(),
    body: text(),
    meta: jsonb(),
    tsv: tsvector("tsv").generatedAlwaysAs(
      sql`to_tsvector('simple'::regconfig, ((COALESCE(title, ''::text) || ' '::text) || COALESCE(body, ''::text)))`,
    ),
  },
  (table) => [
    index("demo_events_company_idx").using(
      "btree",
      table.companyId.asc().nullsLast().op("int4_ops"),
    ),
    index("demo_events_meta_idx").using(
      "gin",
      table.meta.asc().nullsLast().op("jsonb_ops"),
    ),
    index("demo_events_org_created_idx").using(
      "btree",
      table.orgId.asc().nullsLast().op("timestamptz_ops"),
      table.createdAt.desc().nullsFirst().op("timestamptz_ops"),
    ),
    index("demo_events_tsv_idx").using(
      "gin",
      table.tsv.asc().nullsLast().op("tsvector_ops"),
    ),
  ],
);

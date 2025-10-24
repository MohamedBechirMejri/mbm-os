CREATE TABLE "demo_events" (
	"id" integer PRIMARY KEY NOT NULL,
	"org_id" integer,
	"search_id" integer,
	"company_id" integer,
	"created_at" timestamp with time zone,
	"company_name" text,
	"title" text,
	"body" text,
	"meta" jsonb,
	"tsv" "tsvector" GENERATED ALWAYS AS (to_tsvector('simple'::regconfig, ((COALESCE(title, ''::text) || ' '::text) || COALESCE(body, ''::text)))) STORED
);
--> statement-breakpoint
CREATE INDEX "demo_events_company_idx" ON "demo_events" USING btree ("company_id" int4_ops);--> statement-breakpoint
CREATE INDEX "demo_events_meta_idx" ON "demo_events" USING gin ("meta" jsonb_ops);--> statement-breakpoint
CREATE INDEX "demo_events_org_created_idx" ON "demo_events" USING btree ("org_id" timestamptz_ops,"created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "demo_events_tsv_idx" ON "demo_events" USING gin ("tsv" tsvector_ops);
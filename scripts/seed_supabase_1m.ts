// Run: DATABASE_URL="postgresql://postgres:...@host:6543/db?sslmode=require" bun run seed_supabase_1m.ts
import { SQL } from "bun";

const URL = process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL ?? "";

if (!URL) {
  console.error(
    "Set DATABASE_URL to your Supabase Postgres URI (with sslmode=require).",
  );
  process.exit(1);
}

// Use an explicit instance so we’re not at the mercy of env auto-detection quirks.
const db = new SQL(URL);

async function oneShot() {
  // multiple statements in one call -> use .simple() per Bun SQL docs
  await db`
    SET statement_timeout = 0;
    DROP TABLE IF EXISTS demo_events;
    CREATE UNLOGGED TABLE demo_events AS
    SELECT
      g::int                                  AS id,
      (1 + (random()*999)::int)               AS org_id,
      (1 + (random()*199)::int)               AS search_id,
      (1 + (random()*9999)::int)              AS company_id,
      now() - (random()*interval '365 days')  AS created_at,
      'Company ' || (1 + (random()*9999)::int)        AS company_name,
      'Event '   || g                                  AS title,
      repeat(substr(md5(random()::text),1,32)||' ', 1 + (random()*5)::int) AS body,
      jsonb_build_object(
        'score', round((random()*100)::numeric, 2),
        'flag',  (random() > 0.8)
      ) AS meta
    FROM generate_series(1, 1000000) AS g;
  `.simple();

  // Add keys & indexes after the load
  await db`ALTER TABLE demo_events ADD PRIMARY KEY (id)`;
  await db`CREATE INDEX demo_events_org_created_idx ON demo_events (org_id, created_at DESC)`;
  await db`CREATE INDEX demo_events_company_idx      ON demo_events (company_id)`;
  await db`
    ALTER TABLE demo_events
    ADD COLUMN tsv tsvector GENERATED ALWAYS AS
    (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(body,''))) STORED
  `;
  await db`CREATE INDEX demo_events_tsv_idx  ON demo_events USING GIN (tsv)`;
  await db`CREATE INDEX demo_events_meta_idx ON demo_events USING GIN (meta)`;

  await db`ALTER TABLE demo_events SET LOGGED`;
  await db`ANALYZE demo_events`;
}

async function chunked() {
  // Safer path on constrained instances: 10 × 100k
  await db`SET statement_timeout = 0`;
  await db`DROP TABLE IF EXISTS demo_events`;
  await db`
    CREATE TABLE demo_events (
      id           int PRIMARY KEY,
      org_id       int,
      search_id    int,
      company_id   int,
      created_at   timestamptz,
      company_name text,
      title        text,
      body         text,
      meta         jsonb
    )
  `;

  for (let s = 0; s < 10; s++) {
    const offset = s * 100_000;
    // One statement per batch, parameters allowed (no .simple() here)
    await db`
      INSERT INTO demo_events
      SELECT
        ${offset} + g AS id,
        (1 + (random()*999)::int),
        (1 + (random()*199)::int),
        (1 + (random()*9999)::int),
        now() - (random()*interval '365 days'),
        'Company ' || (1 + (random()*9999)::int),
        'Event '   || (${offset} + g),
        repeat(substr(md5(random()::text),1,32)||' ', 1 + (random()*5)::int),
        jsonb_build_object('score', round((random()*100)::numeric, 2), 'flag', (random() > 0.8))
      FROM generate_series(1, 100000) AS g
    `;
    console.log(`Inserted ${(s + 1) * 100_000} rows…`);
  }

  // Indexes after data
  await db`CREATE INDEX demo_events_org_created_idx ON demo_events (org_id, created_at DESC)`;
  await db`CREATE INDEX demo_events_company_idx      ON demo_events (company_id)`;
  await db`
    ALTER TABLE demo_events
    ADD COLUMN tsv tsvector GENERATED ALWAYS AS
    (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(body,''))) STORED
  `;
  await db`CREATE INDEX demo_events_tsv_idx  ON demo_events USING GIN (tsv)`;
  await db`CREATE INDEX demo_events_meta_idx ON demo_events USING GIN (meta)`;

  await db`ALTER TABLE demo_events SET LOGGED`;
  await db`ANALYZE demo_events`;
}

try {
  console.time("seed");
  try {
    console.log("Trying fast one-shot load…");
    await oneShot();
  } catch (e) {
    console.warn(
      "One-shot failed, falling back to chunked inserts:",
      (e as Error).message,
    );
    await chunked();
  }
  const [row] = await db`SELECT count(*)::bigint AS c FROM demo_events`;
  console.timeEnd("seed");
  console.log("demo_events rows:", row.c.toString());
} catch (e) {
  console.error("Seeding failed:", e);
  process.exit(1);
}

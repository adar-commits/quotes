#!/usr/bin/env node
/**
 * Run Supabase migrations using DATABASE_URL.
 * Usage: node scripts/run-migrations.mjs
 * Requires: DATABASE_URL in .env.local (or env)
 */

import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, "..", "supabase", "migrations");

function loadEnv() {
  try {
    const path = join(__dirname, "..", ".env.local");
    const content = readFileSync(path, "utf8");
    for (const line of content.split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) {
        const key = m[1].trim();
        const value = m[2].trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) process.env[key] = value;
      }
    }
  } catch (_) {}
}

loadEnv();

const DATABASE_URL =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL;

if (!DATABASE_URL) {
  console.error(
    "Missing DATABASE_URL. Set it in .env.local (Supabase Dashboard → Database → Connection string URI)."
  );
  process.exit(1);
}

const client = new pg.Client({ connectionString: DATABASE_URL });

async function run() {
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("No migration files found.");
    return;
  }

  await client.connect();
  console.log("Connected. Running", files.length, "migration(s)...\n");

  for (const file of files) {
    const path = join(migrationsDir, file);
    const sql = readFileSync(path, "utf8");
    process.stdout.write(`  ${file} ... `);
    try {
      await client.query(sql);
      console.log("ok");
    } catch (err) {
      console.log("error");
      console.error(err.message);
      throw err;
    }
  }

  console.log("\nDone.");
}

run()
  .then(() => client.end())
  .catch((e) => {
    console.error(e?.message || e);
    client.end().catch(() => {});
    process.exit(1);
  });

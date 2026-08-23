const { Client } = require('pg');

async function runSQL() {
  const connectionStrings = [
    "postgresql://postgres:Edwin%406398989@db.wlorxayesyfnsjvpwhjv.supabase.co:5432/postgres?sslmode=require",
    "postgresql://postgres.wlorxayesyfnsjvpwhjv:Edwin%406398989@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require",
    "postgresql://postgres.wlorxayesyfnsjvpwhjv:Edwin%406398989@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
  ];

  const sql = `
    -- 1. Create the drafts table for cross-device code sync
    create table if not exists drafts (
      student_id text not null,
      question_id text not null,
      code text not null,
      updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
      primary key (student_id, question_id)
    );

    -- 2. Allow anonymous read/write for the hackathon demo
    alter table drafts disable row level security;
    grant all on drafts to anon;
  `;

  let success = false;
  for (const conn of connectionStrings) {
    console.log("Trying connection to Supabase...");
    const client = new Client({
      connectionString: conn,
      ssl: { rejectUnauthorized: false }
    });

    try {
      await client.connect();
      console.log("Connected successfully! Executing SQL...");
      await client.query(sql);
      console.log("SQL executed successfully! Table 'drafts' is ready.");
      await client.end();
      success = true;
      break;
    } catch (err) {
      console.log("Attempt failed:", err.message);
      try { await client.end(); } catch (e) {}
    }
  }

  if (!success) {
    process.exit(1);
  }
}

runSQL();

const { Client } = require('pg');

const regions = [
  'ap-south-1', 'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2',
  'eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-north-1',
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 'ca-central-1', 'sa-east-1'
];

const sql = `
  create table if not exists drafts (
    student_id text not null,
    question_id text not null,
    code text not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (student_id, question_id)
  );
  alter table drafts disable row level security;
  grant all on drafts to anon;
`;

async function testRegion(reg) {
  const client = new Client({
    host: `aws-0-${reg}.pooler.supabase.com`,
    port: 6543,
    user: 'postgres.wlorxayesyfnsjvpwhjv',
    password: 'Edwin@6398989',
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });

  try {
    await client.connect();
    console.log(`\n🎉 MATCH FOUND! Connected to region: aws-0-${reg}.pooler.supabase.com`);
    await client.query(sql);
    console.log("SUCCESS: 'drafts' table created successfully and RLS disabled!");
    await client.end();
    process.exit(0);
  } catch (err) {
    try { await client.end(); } catch (e) {}
  }
}

async function run() {
  console.log("Scanning all Supabase AWS regions for your project pooler...");
  await Promise.all(regions.map(r => testRegion(r)));
  console.log("Scan complete.");
}

run();

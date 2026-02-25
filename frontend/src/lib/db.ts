import { Pool } from 'pg';

// Works with any PostgreSQL: Supabase, Neon, Vercel Postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 1, // Serverless: 1 connection per function instance
});

export async function query(text: string, params: unknown[] = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return { rows: result.rows, rowCount: result.rowCount ?? result.rows.length };
  } finally {
    client.release();
  }
}

export async function getClient() {
  const client = await pool.connect();
  return {
    query: async (text: string, params: unknown[] = []) => {
      const result = await client.query(text, params);
      return { rows: result.rows, rowCount: result.rowCount ?? result.rows.length };
    },
    release: () => client.release(),
  };
}

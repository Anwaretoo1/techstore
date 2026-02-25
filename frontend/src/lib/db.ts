import { sql } from '@vercel/postgres';

export async function query(text: string, params: unknown[] = []) {
  const result = await sql.query(text, params);
  return { rows: result.rows, rowCount: result.rowCount ?? result.rows.length };
}

export async function getClient() {
  const { db } = await import('@vercel/postgres');
  const client = await db.connect();
  return {
    query: async (text: string, params: unknown[] = []) => {
      const result = await client.query(text, params);
      return { rows: result.rows, rowCount: result.rowCount ?? result.rows.length };
    },
    release: () => client.release(),
  };
}

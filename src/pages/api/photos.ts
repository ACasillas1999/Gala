import type { APIRoute } from 'astro';
import pool from '../../lib/db';

export const GET: APIRoute = async () => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, path, guest_name, caption, type, created_at FROM photos ORDER BY created_at DESC'
    );
    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Error fetching photos' }), { status: 500 });
  }
};

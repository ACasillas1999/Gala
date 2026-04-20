import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import pool from '../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('photo') as File | null;
    const guestName = (formData.get('guest_name') as string) || null;
    const caption = (formData.get('caption') as string) || null;

    if (!file || file.size === 0) {
      return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
    }

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'video/mp4', 'video/quicktime', 'video/avi', 'video/x-msvideo'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ error: 'Tipo de archivo no permitido.' }), { status: 422 });
    }

    // Max 50MB
    if (file.size > 52428800) {
      return new Response(JSON.stringify({ error: 'El archivo es demasiado grande (máx 50MB).' }), { status: 422 });
    }

    const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads');

    await mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(join(uploadDir, fileName), buffer);

    const path = `uploads/${fileName}`;
    await pool.execute(
      'INSERT INTO photos (path, guest_name, caption, type, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [path, guestName, caption, mediaType]
    );

    return new Response(JSON.stringify({ 
      success: true,
      file: { path, type: mediaType, guest_name: guestName, caption }
    }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Error interno del servidor.' }), { status: 500 });
  }
};

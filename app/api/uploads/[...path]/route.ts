import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';

const UPLOADS_ROOT = path.join(process.cwd(), 'uploads');

const TIPOS_MIME: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.heic': 'image/heic',
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segmentos } = await params;

  // Resuelve y valida que el archivo quede dentro de `uploads/` (evita path traversal).
  const rutaAbsoluta = path.join(UPLOADS_ROOT, ...segmentos);
  if (!rutaAbsoluta.startsWith(UPLOADS_ROOT)) {
    return NextResponse.json({ message: 'Ruta inválida' }, { status: 400 });
  }

  try {
    const archivo = await fs.readFile(rutaAbsoluta);
    const extension = path.extname(rutaAbsoluta).toLowerCase();
    const tipoMime = TIPOS_MIME[extension] || 'application/octet-stream';
    return new NextResponse(new Uint8Array(archivo), {
      headers: {
        'Content-Type': tipoMime,
        'Content-Disposition': `inline; filename="${path.basename(rutaAbsoluta)}"`,
      },
    });
  } catch {
    return NextResponse.json({ message: 'Archivo no encontrado' }, { status: 404 });
  }
}

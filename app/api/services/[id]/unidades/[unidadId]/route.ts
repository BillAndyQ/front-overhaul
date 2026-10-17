import { NextRequest, NextResponse } from 'next/server';
import mongoose, { Types } from 'mongoose';
import { promises as fs } from 'fs';
import path from 'path';
import connectDB from '@/lib/mongodb';
import Servicio from '@/lib/servicio-model';
import { UnidadServicioActualizarSchema, UnidadServicioActualizarType } from '@/lib/models';
import { extraerObjectId, extraerDetalle } from '../../../route';

export const runtime = 'nodejs';

const CAMPOS_TEXTO = ['tipo_unidad', 'placa', 'ubicacion', 'tipo_servicio', 'inspector'] as const;
const CAMPOS_ARCHIVO_UNICO = ['informe_de_campo', 'informe_final', 'certificado'] as const;

// `ruta_local` es relativa a la carpeta `uploads/` (no la incluye), para poder
// construirse directamente como `/api/uploads/<ruta_local>` en el frontend.
async function guardarArchivo(servicioId: string, unidadId: string, file: File) {
  const carpetaRelativa = ['servicios', servicioId, unidadId].join('/');
  const carpeta = path.join(process.cwd(), 'uploads', carpetaRelativa);
  await fs.mkdir(carpeta, { recursive: true });
  const nombreArchivo = `${Date.now()}-${path.basename(file.name)}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(carpeta, nombreArchivo), bytes);
  return {
    nombre_original: file.name,
    ruta_local: `${carpetaRelativa}/${nombreArchivo}`,
  };
}

// Actualiza los datos `unidad_servicio` (propios de la asignación de una unidad
// a este servicio puntual) y sube los adjuntos recibidos. Se envía como
// multipart/form-data porque combina texto y archivos en un solo guardado.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; unidadId: string }> }
) {
  try {
    const { id, unidadId } = await params;
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(unidadId)) {
      return NextResponse.json({ message: 'ID inválido' }, { status: 400 });
    }

    const formData = await req.formData();

    const cambiosTexto: Record<string, string> = {};
    for (const campo of CAMPOS_TEXTO) {
      const valor = formData.get(campo);
      if (typeof valor === 'string' && valor.trim()) {
        cambiosTexto[campo] = valor.trim();
      }
    }

    const parsed = UnidadServicioActualizarSchema.safeParse(cambiosTexto);
    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();

    const servicio = await Servicio.findById(id).lean();
    if (!servicio) {
      return NextResponse.json({ message: 'Servicio no encontrado' }, { status: 404 });
    }

    const unidadesActuales: unknown[] = Array.isArray(servicio.unidades) ? servicio.unidades : [];
    const index = unidadesActuales.findIndex(
      (ref) => extraerObjectId(ref)?.toString() === unidadId
    );
    if (index === -1) {
      return NextResponse.json(
        { message: 'La unidad no está asignada a este servicio' },
        { status: 404 }
      );
    }

    const detalleActual: UnidadServicioActualizarType = extraerDetalle(unidadesActuales[index]) ?? {};
    const nuevoDetalle: UnidadServicioActualizarType = { ...detalleActual, ...parsed.data };

    for (const campo of CAMPOS_ARCHIVO_UNICO) {
      const archivo = formData.get(campo);
      if (archivo instanceof File && archivo.size > 0) {
        nuevoDetalle[campo] = await guardarArchivo(id, unidadId, archivo);
      }
    }

    const fotosNuevas = formData
      .getAll('fotos')
      .filter((valor): valor is File => valor instanceof File && valor.size > 0);
    if (fotosNuevas.length > 0) {
      const fotosGuardadas = await Promise.all(
        fotosNuevas.map((foto) => guardarArchivo(id, unidadId, foto))
      );
      nuevoDetalle.fotos = [...(detalleActual.fotos ?? []), ...fotosGuardadas];
    }

    const { DBRef } = mongoose.mongo;
    const nuevaReferencia = new DBRef('unidades', new Types.ObjectId(unidadId), undefined, {
      detalle: nuevoDetalle,
    });

    await Servicio.updateOne(
      { _id: id },
      { $set: { [`unidades.${index}`]: nuevaReferencia } }
    );

    return NextResponse.json({ _id: unidadId, detalle: nuevoDetalle });
  } catch (error) {
    console.error('Error al actualizar la unidad del servicio:', error);
    return NextResponse.json(
      { message: 'Error al actualizar la unidad del servicio' },
      { status: 500 }
    );
  }
}

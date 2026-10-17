import { NextRequest, NextResponse } from 'next/server';
import mongoose, { Types } from 'mongoose';
import connectDB from '@/lib/mongodb';
import Servicio from '@/lib/servicio-model';
import Unidad from '@/lib/unidad-model';
import { ServicioCrearSchema, UnidadServicioType } from '@/lib/models';

interface UnidadResuelta {
  _id: string;
  codigo_unidad: string;
  tipo?: string;
  detalle?: UnidadServicioType;
}

// Las unidades se guardan en `servicios.unidades` como DBRef hacia la
// colección `unidades` (formato { $ref, $id } / instancia bson.DBRef, no
// un ObjectId simple), así que hay que resolverlas a mano: mongoose no
// soporta populate() nativo sobre DBRefs.
export function extraerObjectId(ref: unknown): Types.ObjectId | undefined {
  return (ref as { oid?: Types.ObjectId } | null)?.oid;
}

// Los datos propios de la asignación (unidad_servicio) viajan como campo
// adicional del DBRef (cuarto argumento `fields` del constructor de bson.DBRef),
// que la librería bson serializa/deserializa junto a $ref/$id de forma transparente.
export function extraerDetalle(ref: unknown): UnidadServicioType | undefined {
  return (ref as { fields?: { detalle?: UnidadServicioType } } | null)?.fields?.detalle;
}

export async function resolverUnidades<T extends { unidades?: unknown[] }>(servicios: T[]) {
  const idsUnidades = new Set<string>();
  for (const servicio of servicios) {
    for (const ref of servicio.unidades ?? []) {
      const oid = extraerObjectId(ref);
      if (oid) idsUnidades.add(oid.toString());
    }
  }

  const unidades = await Unidad.find({ _id: { $in: [...idsUnidades] } }).lean();
  const unidadesPorId = new Map<string, UnidadResuelta>(
    unidades.map((u) => [
      u._id.toString(),
      { _id: u._id.toString(), codigo_unidad: u.codigo_unidad, tipo: u.tipo },
    ])
  );

  return servicios.map((servicio) => ({
    ...servicio,
    unidades: (servicio.unidades ?? [])
      .map((ref: unknown) => {
        const oid = extraerObjectId(ref);
        const base = oid ? unidadesPorId.get(oid.toString()) : undefined;
        if (!base) return undefined;
        const detalle = extraerDetalle(ref);
        return detalle ? { ...base, detalle } : base;
      })
      .filter((u: UnidadResuelta | undefined): u is UnidadResuelta => Boolean(u)),
  }));
}

export async function GET() {
  try {
    await connectDB();
    const servicios = await Servicio.find().sort({ createdAt: -1 }).lean();
    const serviciosConUnidades = await resolverUnidades(servicios);
    return NextResponse.json(serviciosConUnidades);
  } catch (error) {
    console.error('Error al obtener los servicios:', error);
    return NextResponse.json(
      { message: 'Error al obtener los servicios' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ServicioCrearSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();

    const { unidades, ...resto } = parsed.data;
    const { DBRef } = mongoose.mongo;
    const servicioCreado = await Servicio.create({
      ...resto,
      unidades: unidades.map((id) => new DBRef('unidades', new Types.ObjectId(id))),
    });

    const [servicioConUnidades] = await resolverUnidades([servicioCreado.toObject()]);
    return NextResponse.json(servicioConUnidades, { status: 201 });
  } catch (error) {
    console.error('Error al registrar el servicio:', error);
    return NextResponse.json(
      { message: 'Error al registrar el servicio' },
      { status: 500 }
    );
  }
}

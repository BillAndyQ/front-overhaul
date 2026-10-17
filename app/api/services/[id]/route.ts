import { NextRequest, NextResponse } from 'next/server';
import mongoose, { Types } from 'mongoose';
import connectDB from '@/lib/mongodb';
import Servicio from '@/lib/servicio-model';
import { ServicioActualizarSchema } from '@/lib/models';
import { resolverUnidades } from '../route';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'ID de servicio inválido' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = ServicioActualizarSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();

    const { unidades, ...resto } = parsed.data;
    const update: Record<string, unknown> = { ...resto };
    if (unidades) {
      const { DBRef } = mongoose.mongo;
      update.unidades = unidades.map((unidadId) => new DBRef('unidades', new Types.ObjectId(unidadId)));
    }

    const servicioActualizado = await Servicio.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!servicioActualizado) {
      return NextResponse.json({ message: 'Servicio no encontrado' }, { status: 404 });
    }

    const [servicioConUnidades] = await resolverUnidades([servicioActualizado]);
    return NextResponse.json(servicioConUnidades);
  } catch (error) {
    console.error('Error al actualizar el servicio:', error);
    return NextResponse.json(
      { message: 'Error al actualizar el servicio' },
      { status: 500 }
    );
  }
}

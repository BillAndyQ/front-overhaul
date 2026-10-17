import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ReclamoCrearSchema, formatearNumeroHoja } from '@/lib/reclamo-schema';

// Devuelve el número de hoja que se asignaría al siguiente reclamo.
// Es referencial: el número definitivo lo asigna la secuencia de Postgres en el POST.
export async function GET() {
  try {
    const { _max } = await prisma.reclamo.aggregate({ _max: { numero: true } });
    return NextResponse.json({ siguiente: formatearNumeroHoja((_max.numero ?? 0) + 1) });
  } catch (error) {
    console.error('Error al obtener el correlativo de reclamos:', error);
    return NextResponse.json({ message: 'Error al obtener el correlativo' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ReclamoCrearSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Datos inválidos', errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // `conformidad` solo se valida, no se persiste.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { conformidad: _, menor_edad, monto, fecha_incidente, apoderado_nombre, apoderado_documento, ...datos } =
      parsed.data;
    const esMenor = menor_edad === 'si';

    const reclamo = await prisma.reclamo.create({
      data: {
        ...datos,
        menor_edad: esMenor,
        apoderado_nombre: esMenor ? apoderado_nombre : null,
        apoderado_documento: esMenor ? apoderado_documento : null,
        monto,
        fecha_incidente: new Date(`${fecha_incidente}T00:00:00Z`),
      },
      select: { numero: true, fecha_emision: true },
    });

    return NextResponse.json(
      { numero: formatearNumeroHoja(reclamo.numero), fecha_emision: reclamo.fecha_emision },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al registrar el reclamo:', error);
    return NextResponse.json({ message: 'Error al registrar el reclamo' }, { status: 500 });
  }
}

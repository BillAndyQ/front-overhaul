import { z } from 'zod';

// Esquema compartido entre el formulario (cliente) y la API (servidor)
// del Libro de Reclamaciones.

export const TIPOS_DOCUMENTO = ['DNI', 'CE', 'Pasaporte', 'RUC'] as const;
export const TIPOS_CONSUMO = ['Producto', 'Servicio'] as const;
export const TIPOS_RECLAMO = ['Reclamo', 'Queja'] as const;

export const DEPARTAMENTOS = [
  'Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca',
  'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín', 'La Libertad',
  'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios', 'Moquegua', 'Pasco',
  'Piura', 'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali',
] as const;

const requerido = (campo: string) => z.string().trim().min(1, `${campo} es obligatorio`);

export const ReclamoCrearSchema = z
  .object({
    // 1. Identificación del consumidor reclamante
    nombres: requerido('Nombres'),
    apellidos: requerido('Apellidos'),
    tipo_documento: z.enum(TIPOS_DOCUMENTO, { error: 'Elige un tipo de documento' }),
    numero_documento: requerido('N° de documento').max(20),
    celular: z.string().trim().regex(/^\+?\d{6,15}$/, 'Ingresa un número válido'),
    departamento: z.enum(DEPARTAMENTOS, { error: 'Elige un departamento' }),
    provincia: requerido('Provincia'),
    distrito: requerido('Distrito'),
    direccion: requerido('Dirección'),
    referencia: requerido('Referencia'),
    correo: z.email('Ingresa un correo válido'),
    menor_edad: z.enum(['no', 'si']),
    apoderado_nombre: z.string().trim().optional(),
    apoderado_documento: z.string().trim().optional(),

    // 2. Identificación del bien contratado
    tipo_consumo: z.enum(TIPOS_CONSUMO, { error: 'Elige un tipo de consumo' }),
    numero_pedido: requerido('N° de pedido'),
    fecha_incidente: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ingresa una fecha válida')
      .refine((f) => f <= new Date().toISOString().slice(0, 10), 'La fecha no puede ser futura'),
    monto: z
      .string()
      .trim()
      .regex(/^\d+(\.\d{1,2})?$/, 'Ingresa un monto válido (ej. 150.00)'),
    descripcion_bien: requerido('Descripción').max(2000),

    // 3. Detalle de la reclamación
    tipo_reclamo: z.enum(TIPOS_RECLAMO, { error: 'Elige el tipo de reclamo' }),
    detalle: requerido('Detalle').max(5000),
    pedido: requerido('Pedido').max(5000),

    conformidad: z.literal(true, { error: 'Debes aceptar para enviar' }),
  })
  .superRefine((data, ctx) => {
    if (data.menor_edad !== 'si') return;
    if (!data.apoderado_nombre) {
      ctx.addIssue({ code: 'custom', path: ['apoderado_nombre'], message: 'Nombre del padre, madre o apoderado es obligatorio' });
    }
    if (!data.apoderado_documento) {
      ctx.addIssue({ code: 'custom', path: ['apoderado_documento'], message: 'Documento del apoderado es obligatorio' });
    }
  });

export type ReclamoCrearInput = z.input<typeof ReclamoCrearSchema>;
export type ReclamoCrearType = z.infer<typeof ReclamoCrearSchema>;

export const formatearNumeroHoja = (n: number) => String(n).padStart(6, '0');

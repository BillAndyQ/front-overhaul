import { z } from 'zod';

// ==========================================
// 1. ADJUNTO (Submodelo compartido)
// ==========================================
export const AdjuntoSchema = z.object({
  nombre_original: z.string(),
  ruta_local: z.string(),
});

export type AdjuntoType = z.infer;
    
// ==========================================
// 2. MODELOS PARA CORREO
// ==========================================
export const CorreoCrearSchema = z.object({
  id_interno: z.string().min(1),
  message_id: z.string().min(1),
  de: z.string().email('Debe ser un correo válido'),
  asunto: z.string().min(1),
  fecha: z.string(),
  cuerpo: z.string(),
  adjuntos: z.array(AdjuntoSchema).default([]),
});

export const CorreoActualizarSchema = CorreoCrearSchema.partial().extend({
  analizado_ia: z.boolean().optional(),
  intentos_ia: z.number().int().nonnegative().optional(),
});

export type CorreoCrearType = z.infer;
export type CorreoActualizarType = z.infer;


// ==========================================
// 3. MODELOS PARA UNIDAD
// ==========================================
export const UnidadCrearSchema = z.object({
  codigo_unidad: z.string().min(1, "Ej: 'APE-980'"),
  tipo: z.string().optional(),
});

export const UnidadActualizarSchema = UnidadCrearSchema.partial();

export type UnidadCrearType = z.infer;
export type UnidadActualizarType = z.infer;

// `unidad_servicio`: datos propios de la asignación de una unidad a un servicio
// puntual (a diferencia de `tipo` en Unidad, que es un atributo global del vehículo).
export const UnidadServicioSchema = z.object({
  tipo_unidad: z.string().optional(),
  placa: z.string().optional(),
  ubicacion: z.string().optional(),
  tipo_servicio: z.string().optional(),
  inspector: z.string().optional(),
  informe_de_campo: AdjuntoSchema.optional(),
  informe_final: AdjuntoSchema.optional(),
  certificado: AdjuntoSchema.optional(),
  fotos: z.array(AdjuntoSchema).default([]),
});

export const UnidadServicioActualizarSchema = UnidadServicioSchema.partial();

export type UnidadServicioType = z.infer<typeof UnidadServicioSchema>;
export type UnidadServicioActualizarType = z.infer<typeof UnidadServicioActualizarSchema>;


// ==========================================
// 4. MODELOS PARA SERVICIO
// ==========================================
export const ServicioCrearSchema = z.object({
  servicio: z.string().min(1, 'Descripción del servicio obligatoria'),
  tipo: z.string().optional(),
  unidades: z.array(z.string()).default([]), // IDs de las unidades
  anotaciones: z.string().optional(),
  estado: z.string().optional(),
  message_id: z.string().min(1),
  cliente: z.string().optional(),
  ruc: z.string().optional(),
  proyecto: z.string().optional(),
  message_ids_relacionados: z.array(z.string()).default([]),
});

export const ServicioActualizarSchema = ServicioCrearSchema.partial();

export type ServicioCrearType = z.infer;
export type ServicioActualizarType = z.infer;


// ==========================================
// 5. MODELOS PARA DOMINIOS EMAIL ANÁLISIS IA
// ==========================================
export const DominioCrearSchema = z.object({
  dominio: z.string().min(1, "Ej: 'cliente.com'"),
  activo: z.boolean().default(true),
});

export const DominioActualizarSchema = DominioCrearSchema.partial();

export type DominioCrearType = z.infer;
export type DominioActualizarType = z.infer;
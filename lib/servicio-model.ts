import type { ServicioCrearType } from '@/lib/models';
import mongoose, { Schema } from 'mongoose';

// `unidades` se guarda como DBRef (colección `unidades`), no como string plano:
// se resuelve manualmente en app/api/services/route.ts.
const ServicioSchema = new Schema<Omit<ServicioCrearType, 'unidades'>>(
  {
    codigo: { type: String, required: true, unique: true },
    servicio: { type: String, required: true },
    certificadora: { type: String, required: true },
    tipo: { type: String },
    unidades: { type: [Schema.Types.Mixed], default: [] },
    anotaciones: { type: String },
    estado: { type: String },
    message_id: { type: String, required: true },
    cliente: { type: String },
    ruc: { type: String },
    proyecto: { type: String },
    message_ids_relacionados: { type: [String], default: [] },
  },
  { timestamps: true, collection: 'servicios' }
);

export default mongoose.models.Servicio ||
  mongoose.model('Servicio', ServicioSchema);

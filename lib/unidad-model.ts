import mongoose, { Schema } from 'mongoose';
import type { UnidadCrearType } from '@/lib/models';

const UnidadSchema = new Schema<UnidadCrearType>(
  {
    codigo_unidad: { type: String, required: true },
    tipo: { type: String },
  },
  { timestamps: true, collection: 'unidades' }
);

export default mongoose.models.Unidad ||
  mongoose.model<UnidadCrearType>('Unidad', UnidadSchema);

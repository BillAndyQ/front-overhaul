"use client"
import { AlertCircle, Check, FilePlus2, Loader2, X } from 'lucide-react';
import React, { useState } from 'react';
import * as api from '../services/api';
import { ServicioApiItem } from '../types';

interface ServiceCreateViewProps {
  onCreated: (servicio: ServicioApiItem) => void;
  onCancel: () => void;
  onShowToast: (message: string, type?: 'info' | 'success' | 'warning') => void;
}

const parseLineas = (val: string): string[] =>
  val
    .split(/[\n,]/)
    .map((v) => v.trim())
    .filter(Boolean);

export const ServiceCreateView: React.FC<ServiceCreateViewProps> = ({
  onCreated,
  onCancel,
  onShowToast,
}) => {
  const [servicio, setServicio] = useState('');
  const [tipo, setTipo] = useState('');
  const [cliente, setCliente] = useState('');
  const [proyecto, setProyecto] = useState('');
  const [estado, setEstado] = useState('');
  const [anotaciones, setAnotaciones] = useState('');
  const [messageId, setMessageId] = useState('');
  const [unidadesInput, setUnidadesInput] = useState('');
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!servicio.trim()) {
      setFormError('La descripción del servicio es obligatoria');
      return;
    }
    if (!messageId.trim()) {
      setFormError('El Message-ID del correo asociado es obligatorio');
      return;
    }

    setIsSaving(true);
    try {
      const creado = await api.crearServicio({
        servicio: servicio.trim(),
        tipo: tipo.trim() || undefined,
        cliente: cliente.trim() || undefined,
        proyecto: proyecto.trim() || undefined,
        estado: estado.trim() || undefined,
        anotaciones: anotaciones.trim() || undefined,
        message_id: messageId.trim(),
        unidades: parseLineas(unidadesInput),
      });
      onShowToast(`Servicio "${creado.servicio}" registrado correctamente`, 'success');
      onCreated(creado);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo registrar el servicio');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="h-full overflow-y-auto p-4 md:p-6" id="viewServiceCreate">
      <div className="max-w-3xl mx-auto flex flex-col gap-4 pb-12">
        {/* Banner Superior */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-xs">
            <FilePlus2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Registrar Nuevo Servicio</h2>
            <p className="text-xs text-slate-500">
              Se guardará en la colección <span className="font-mono">servicios</span> de MongoDB.
            </p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Descripción del Servicio <span className="text-red-500">*</span>
            </label>
            <textarea
              value={servicio}
              onChange={(e) => setServicio(e.target.value)}
              placeholder="Ej: Evolución de la 5ta Rueda, tornamesa, king pin..."
              rows={2}
              autoFocus
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Tipo</label>
              <input
                type="text"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                placeholder="Ej: Inspección y Certificación"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Estado</label>
              <input
                type="text"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                placeholder="Ej: Proceder, Evaluación..."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Empresa / Cliente</label>
              <input
                type="text"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder="Ej: Ambipar"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Proyecto / Faena</label>
              <input
                type="text"
                value={proyecto}
                onChange={(e) => setProyecto(e.target.value)}
                placeholder="Ej: Yanacocha / Goldfield"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Message-ID del correo asociado <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={messageId}
              onChange={(e) => setMessageId(e.target.value)}
              placeholder="<CP5P284MB...@...OUTLOOK.COM>"
              className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              IDs de Unidades (colección <span className="font-mono">unidades</span>)
            </label>
            <textarea
              value={unidadesInput}
              onChange={(e) => setUnidadesInput(e.target.value)}
              placeholder="Un ObjectId por línea o separados por coma"
              rows={2}
              className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 transition-colors resize-none"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Opcional. Las unidades se pueden vincular más adelante desde el expediente del servicio.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Anotaciones</label>
            <textarea
              value={anotaciones}
              onChange={(e) => setAnotaciones(e.target.value)}
              placeholder="Notas internas, fechas programadas, confirmaciones..."
              rows={3}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 transition-colors resize-none"
            />
          </div>

          {formError && (
            <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {formError}
            </p>
          )}

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <span className="inline-flex items-center gap-1.5">
                <X className="w-3.5 h-3.5" />
                Cancelar
              </span>
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Registrar Servicio</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

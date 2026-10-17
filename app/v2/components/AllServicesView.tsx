"use client"
import { Activity, ExternalLink, Plus, Search, SlidersHorizontal } from 'lucide-react';
import React, { useState } from 'react';
import { ServicioApiItem } from '../types';

interface AllServicesViewProps {
  services: ServicioApiItem[];
  isLoading?: boolean;
  onOpenDirectService: (serviceCode: string) => void;
  onCreateService: () => void;
  onShowToast: (message: string, type?: 'info' | 'success' | 'warning') => void;
}

export const AllServicesView: React.FC<AllServicesViewProps> = ({
  services,
  isLoading = false,
  onOpenDirectService,
  onCreateService,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredServices = services.filter((srv) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      srv.servicio.toLowerCase().includes(term) ||
      (srv.cliente ?? '').toLowerCase().includes(term) ||
      (srv.proyecto ?? '').toLowerCase().includes(term) ||
      srv.unidades.some((u) => u.codigo_unidad.toLowerCase().includes(term));

    if (!matchSearch) return false;
    if (statusFilter !== 'all' && srv.estado !== statusFilter) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aprobado':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-block">
            Aprobado
          </span>
        );
      case 'Evaluación':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200 inline-block">
            Evaluación
          </span>
        );
      case 'Programado':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-200 inline-block">
            Programado
          </span>
        );
      case 'Asignado':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-800 border border-purple-200 inline-block">
            Asignado
          </span>
        );
      case 'Completado':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-block">
            Completado
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 inline-block">
            {status}
          </span>
        );
    }
  };

  return (
    <section className="h-full overflow-y-auto p-4 md:p-6" id="viewAllServices">
      <div className="max-w-6xl mx-auto flex flex-col gap-4 pb-12">
        {/* Banner Superior de Servicios */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  OT Equipos
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold border border-emerald-200">
                  {services.length} Servicios Registrados
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Haz clic en <strong>Ver Detalles</strong> en cualquier fila para abrir una pestaña de expediente dedicada.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por código, cliente o unidad..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
              />
            </div>
            <button
              onClick={() => {
                setStatusFilter((prev) => (prev === 'all' ? 'Aprobado' : 'all'));
                onShowToast(
                  statusFilter === 'all' ? 'Filtro aplicado: Solo Aprobados' : 'Filtro reiniciado: Todos los servicios',
                  'info'
                );
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Filtros {statusFilter !== 'all' ? `(${statusFilter})` : ''}</span>
            </button>
            <button
              onClick={onCreateService}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Servicio</span>
            </button>
          </div>
        </div>

        {/* TABLA DE TODOS LOS SERVICIOS */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs text-left min-w-[900px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="px-3.5 py-3 font-semibold">CODIGO</th>
                  <th className="px-3.5 py-3 font-semibold">SERVICIO / TIPO</th>
                  <th className="px-3.5 py-3 font-semibold">EMPRESA</th>
                  <th className="px-3.5 py-3 font-semibold">PROYECTO</th>
                  <th className="px-3.5 py-3 font-semibold">CERTIFICADORA</th>
                  <th className="px-3.5 py-3 font-semibold">FECHA DE SERVICIO</th>
                  <th className="px-3.5 py-3 font-semibold">UNIDADES ASIGNADAS</th>
                  <th className="px-3.5 py-3 font-semibold text-center">ESTADO</th>
                  <th className="px-3.5 py-3 font-semibold text-right">ACCIÓN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                      Cargando servicios...
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  filteredServices.map((srv) => (
                    <tr key={srv._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3.5 py-3 align-middle font-medium text-slate-800">{srv.codigo}</td>
                      <td className="px-3.5 py-3 align-middle">
                        <span className="font-semibold text-slate-900 block leading-tight">{srv.servicio}</span>
                        <span className="text-[10px] text-emerald-700 font-mono">{srv.tipo}</span>
                      </td>
                      <td className="px-3.5 py-3 align-middle font-medium text-slate-800">{srv.cliente}</td>
                      <td className="px-3.5 py-3 align-middle text-slate-600">{srv.proyecto}</td>
                      <td className="px-3.5 py-3 align-middle text-slate-600">{srv.certificadora}</td>
                      <td className="px-3.5 py-3 align-middle text-slate-600">{srv.fecha_servicio}</td>
                      <td className="px-3.5 py-3 align-middle">
                        <span className="font-mono font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300 shadow-2xs">
                          {srv.unidades.map((u) => u.codigo_unidad).join(', ') || '—'}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 align-middle text-center">
                        {getStatusBadge(srv.estado ?? '')}
                      </td>
                      <td className="px-3.5 py-3 align-middle text-right">
                        <button
                          onClick={() => onOpenDirectService(srv._id)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Ver</span>
                        </button>
                      </td>
                    </tr>
                  ))}

                {!isLoading && filteredServices.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                      No se encontraron servicios registrados con los criterios especificados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

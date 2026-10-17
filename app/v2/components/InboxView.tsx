"use client"
import { ArrowUpRight, Ban, CheckCircle2, Search, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { CorreoItem, DominioEmailAnalisisIA } from '../types';

interface InboxViewProps {
  emails: CorreoItem[];
  domains: DominioEmailAnalisisIA[];
  onOpenEmailDossier: (emailId: string) => void;
}

// Extrae el dominio del remitente: soporta "Nombre <user@dominio.com>" y "user@dominio.com"
const getSenderDomain = (de: string): string => {
  const address = de.match(/<([^>]+)>/)?.[1] ?? de;
  return address.split('@').pop()?.trim().toLowerCase() ?? '';
};

export const InboxView: React.FC<InboxViewProps> = ({ emails, domains, onOpenEmailDossier }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'analizado' | 'pendiente' | 'disponible' | 'no-disponible'>('disponible');

  // Un correo es analizable si el dominio del remitente está registrado y activo
  const activeDomains = new Set(
    domains.filter((d) => d.activo).map((d) => d.dominio.trim().toLowerCase())
  );
  const isAvailable = (item: CorreoItem) => activeDomains.has(getSenderDomain(item.de));

  const availableCount = emails.filter(isAvailable).length;
  const unavailableCount = emails.length - availableCount;

  const filteredEmails = emails.filter((item) => {
    const matchSearch =
      item.id_interno.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.de.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.asunto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cuerpo.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchSearch) return false;
    if (filter === 'analizado') return item.analizado_ia === true;
    if (filter === 'pendiente') return item.analizado_ia === false;
    if (filter === 'disponible') return isAvailable(item);
    if (filter === 'no-disponible') return !isAvailable(item);
    return true;
  });

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  return (
    <section className="h-full overflow-y-auto p-4 md:p-6" id="viewInbox">
      <div className="max-w-6xl mx-auto flex flex-col gap-4">
        {/* Banner Superior */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Bandeja de Entrada de Correos</span>
              <span className="bg-slate-100 text-slate-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-slate-200">
                {emails.length} registros
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Haz clic en cualquier correo para abrir su expediente vertical completo incluyendo el panel de correo recibido.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-64 md:w-72">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar correos por folio, emisor o asunto..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-colors"
              />
            </div>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilter('analizado')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filter === 'analizado' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Analizados
              </button>
              <button
                onClick={() => setFilter('disponible')}
                title="Correos cuyo dominio está activo para análisis con IA"
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filter === 'disponible' ? 'bg-white text-emerald-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Disponibles ({availableCount})
              </button>
              <button
                onClick={() => setFilter('no-disponible')}
                title="Correos cuyo dominio no está registrado o está pausado"
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filter === 'no-disponible' ? 'bg-white text-amber-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                No disponibles ({unavailableCount})
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de correos */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="grid grid-cols-12 px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase font-semibold gap-2 items-center">
            <div className="col-span-3">Folio / Remitente</div>
            <div className="col-span-5">Asunto &amp; Extracto</div>
            <div className="col-span-2">Fecha / Hora</div>
            <div className="col-span-2 text-right">Acción</div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredEmails.map((email) => (
              <div
                key={email.id_interno}
                id={`email-row-${email.id_interno}`}
                onClick={() => onOpenEmailDossier(email.id_interno)}
                className="grid grid-cols-12 px-4 py-3 items-center hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="col-span-3 min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="font-mono text-xs font-bold text-slate-900">{email.id_interno}</span>
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                      {email.status}
                    </span>
                  </div>
                  <span className="text-xs text-slate-600 block truncate mt-0.5">{email.de}</span>
                  {isAvailable(email) ? (
                    <span className="inline-flex items-center gap-0.5 mt-1 text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 rounded border border-emerald-200">
                      <Sparkles className="w-2.5 h-2.5" />
                      Disponible para análisis
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 mt-1 text-[9px] font-semibold text-amber-700 bg-amber-50 px-1.5 rounded border border-amber-200">
                      <Ban className="w-2.5 h-2.5" />
                      No disponible
                    </span>
                  )}
                </div>

                <div className="col-span-5 min-w-0 pr-2">
                  <span className="text-xs font-semibold text-slate-900 block truncate">{email.asunto}</span>
                  <span className="text-[11px] text-slate-500 block truncate">{email.cuerpo}</span>
                </div>

                <div className="col-span-2 text-xs font-mono text-slate-600">
                  <span>{email.fecha}</span>
                  {/* <span className="text-slate-400 text-[10px] block">{email.time}</span> */}
                </div>

                <div className="col-span-2 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenEmailDossier(email.id_interno);
                    }}
                    className="px-3 py-1 bg-slate-900 text-white rounded text-xs font-medium hover:bg-slate-800 transition-colors shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Abrir Expediente</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-300" />
                  </button>
                </div>
              </div>
            ))}

            {filteredEmails.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                No se encontraron correos con los filtros actuales.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

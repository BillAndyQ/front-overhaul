import {
  AlertCircle,
  Check,
  CheckCheck,
  Code,
  Copy,
  Database,
  FileCode2,
  Globe,
  Pencil,
  Plus,
  RefreshCw,
  Loader2,
  Search,
  ShieldCheck,
  Sliders,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { DominioEmailAnalisisIA } from '../types';

interface ConfigurationViewProps {
  domains: DominioEmailAnalisisIA[];
  isLoading?: boolean;
  onAddDomain: (dominio: string, activo: boolean) => Promise<void>;
  onUpdateDomain: (id: string, dominio: string, activo: boolean) => Promise<void>;
  onDeleteDomain: (id: string) => Promise<void>;
  onToggleDomainActive: (id: string) => Promise<void>;
  onReloadDomains: () => Promise<void>;
  onShowToast: (msg: string, type?: 'info' | 'success' | 'warning') => void;
}

type SubNavTab = 'dominios-ia' | 'reglas-ia' | 'mongodb-schema' | 'auditoria';

export const ConfigurationView: React.FC<ConfigurationViewProps> = ({
  domains,
  isLoading = false,
  onAddDomain,
  onUpdateDomain,
  onDeleteDomain,
  onToggleDomainActive,
  onReloadDomains,
  onShowToast,
}) => {
  // Sub-sidebar state
  const [activeSubNav, setActiveSubNav] = useState<SubNavTab>('dominios-ia');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal states for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<DominioEmailAnalisisIA | null>(null);
  const [inputDomain, setInputDomain] = useState('');
  const [inputActive, setInputActive] = useState(true);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirmation
  const [deletingDomain, setDeletingDomain] = useState<DominioEmailAnalisisIA | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Raw JSON Drawer
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [hasCopiedJson, setHasCopiedJson] = useState(false);

  // Filtered domains list
  const filteredDomains = domains.filter((item) => {
    const matchesSearch = item.dominio.toLowerCase().includes(searchTerm.toLowerCase().trim());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && item.activo) ||
      (statusFilter === 'inactive' && !item.activo);
    return matchesSearch && matchesStatus;
  });

  const activeCount = domains.filter((d) => d.activo).length;
  const inactiveCount = domains.filter((d) => !d.activo).length;

  const openCreateModal = () => {
    setEditingDomain(null);
    setInputDomain('');
    setInputActive(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: DominioEmailAnalisisIA) => {
    setEditingDomain(item);
    setInputDomain(item.dominio);
    setInputActive(item.activo);
    setFormError('');
    setIsModalOpen(true);
  };

  const cleanDomainString = (val: string): string => {
    let clean = val.trim().toLowerCase();
    clean = clean.replace(/^https?:\/\//, '');
    clean = clean.replace(/^@/, '');
    clean = clean.replace(/\/.*$/, '');
    return clean;
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = cleanDomainString(inputDomain);

    if (!clean) {
      setFormError('El dominio es requerido');
      return;
    }

    const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i;
    if (!domainRegex.test(clean)) {
      setFormError('Formato inválido. Ejemplo válido: cliente.com o minera.com.pe');
      return;
    }

    // Check duplicate
    const duplicate = domains.find(
      (d) => d.dominio.toLowerCase() === clean && (!editingDomain || d.id !== editingDomain.id)
    );
    if (duplicate) {
      setFormError(`El dominio "${clean}" ya se encuentra registrado`);
      return;
    }

    setIsSaving(true);
    try {
      if (editingDomain) {
        await onUpdateDomain(editingDomain.id, clean, inputActive);
        onShowToast(`Dominio ${clean} actualizado exitosamente`, 'success');
      } else {
        await onAddDomain(clean, inputActive);
        onShowToast(`Dominio ${clean} registrado en MongoDB`, 'success');
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo guardar el dominio');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingDomain) return;
    setIsDeleting(true);
    try {
      await onDeleteDomain(deletingDomain.id);
      onShowToast(`Dominio ${deletingDomain.dominio} eliminado`, 'info');
      setDeletingDomain(null);
    } catch (err) {
      onShowToast(
        `No se pudo eliminar ${deletingDomain.dominio}: ${err instanceof Error ? err.message : 'error desconocido'}`,
        'warning'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const jsonRepresentation = JSON.stringify(
    domains.map(({ dominio, activo }) => ({ dominio, activo })),
    null,
    2
  );

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonRepresentation);
    setHasCopiedJson(true);
    onShowToast('JSON copiado al portapapeles', 'info');
    setTimeout(() => setHasCopiedJson(false), 2000);
  };

  return (
    <div className="flex h-full w-full bg-slate-100 overflow-hidden select-none">
      {/* ========================================================= */}
      {/* SUB-SIDEBAR PEQUEÑO (Ajustes & Parámetros)                */}
      {/* ========================================================= */}
      <aside
        id="config-sub-sidebar"
        className="w-60 bg-slate-50 border-r border-slate-200 flex flex-col justify-between p-3 flex-shrink-0"
      >
        <div className="flex flex-col gap-4">
          {/* Header del Sub-Sidebar */}
          <div className="px-2 pt-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              Configuración Interna
            </span>
            <h2 className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1.5 mt-0.5">
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              Ingesta & Modelos IA
            </h2>
          </div>

          {/* Menú de Opciones del Sub-Sidebar */}
          <nav className="flex flex-col gap-1" id="configSubNav">
            <button
              id="subnav-btn-dominios-ia"
              onClick={() => setActiveSubNav('dominios-ia')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                activeSubNav === 'dominios-ia'
                  ? 'bg-white text-blue-900 font-bold shadow-xs border border-blue-200/90'
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Globe
                  className={`w-4 h-4 flex-shrink-0 ${
                    activeSubNav === 'dominios-ia' ? 'text-blue-600' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">Dominios Email IA</span>
              </div>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold ml-1 ${
                  activeSubNav === 'dominios-ia'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {domains.length}
              </span>
            </button>

            <button
              id="subnav-btn-reglas-ia"
              onClick={() => setActiveSubNav('reglas-ia')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                activeSubNav === 'reglas-ia'
                  ? 'bg-white text-blue-900 font-bold shadow-xs border border-blue-200/90'
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles
                  className={`w-4 h-4 flex-shrink-0 ${
                    activeSubNav === 'reglas-ia' ? 'text-amber-600' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">Reglas de Extracción</span>
              </div>
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                Activo
              </span>
            </button>

            <button
              id="subnav-btn-mongodb-schema"
              onClick={() => setActiveSubNav('mongodb-schema')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                activeSubNav === 'mongodb-schema'
                  ? 'bg-white text-blue-900 font-bold shadow-xs border border-blue-200/90'
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Database
                  className={`w-4 h-4 flex-shrink-0 ${
                    activeSubNav === 'mongodb-schema' ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">Modelo MongoDB</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Beanie</span>
            </button>

            <button
              id="subnav-btn-auditoria"
              onClick={() => setActiveSubNav('auditoria')}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                activeSubNav === 'auditoria'
                  ? 'bg-white text-blue-900 font-bold shadow-xs border border-blue-200/90'
                  : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <ShieldCheck
                  className={`w-4 h-4 flex-shrink-0 ${
                    activeSubNav === 'auditoria' ? 'text-purple-600' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">Auditoría & Logs</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">v2.4</span>
            </button>
          </nav>
        </div>

        {/* Info Box en la parte inferior del Sub-Sidebar */}
        <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Colección MongoDB
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-700 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
            <p className="font-mono text-[10px] text-slate-800 font-bold break-all">
              dominios_email_analisis_ia
            </p>
            <p className="text-[9px] text-slate-500 mt-1 leading-tight">
              Filtro estricto: Sólo correos de dominios activos son procesados por Gemini IA.
            </p>
          </div>

          <button
            onClick={() => setShowJsonModal(true)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md text-[11px] font-medium transition-colors cursor-pointer"
          >
            <FileCode2 className="w-3.5 h-3.5 text-slate-600" />
            <span>Ver Payload JSON</span>
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* PANEL RELACIONADO PRINCIPAL (CRUD Dominios IA)            */}
      {/* ========================================================= */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-100">
        {/* Cabecera del Panel */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  MongoDB Document: DominiosEmailAnalisisIA
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Settings.name = &quot;dominios_email_analisis_ia&quot;
                </span>
              </div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                Dominios de Correo Autorizados para Análisis con IA
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Define los dominios corporativos autorizados para la ingesta, análisis automático de
                mensajes y extracción de entidades logísticas.
              </p>
            </div>

            {/* Botones de acción principales */}
            <div className="flex items-center gap-2">
              <button
                id="btn-reload-domains"
                onClick={onReloadDomains}
                disabled={isLoading}
                title="Volver a consultar los dominios en el servidor"
                className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Recargar</span>
              </button>

              <button
                id="btn-add-domain"
                onClick={openCreateModal}
                className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-white" />
                <span>Nuevo Dominio</span>
              </button>
            </div>
          </div>

          {/* Tarjetas de métricas operativas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100">
            <div className="bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                Total Registrados
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-base font-bold font-mono text-slate-900">
                  {domains.length}
                </span>
                <span className="text-[10px] text-slate-400">dominios</span>
              </div>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-lg px-3 py-2">
              <span className="text-[10px] font-mono text-emerald-800 uppercase tracking-wider block">
                Habilitados (Activo: True)
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-base font-bold font-mono text-emerald-700">
                  {activeCount}
                </span>
                <span className="text-[10px] text-emerald-600">análisis activo</span>
              </div>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg px-3 py-2">
              <span className="text-[10px] font-mono text-amber-800 uppercase tracking-wider block">
                Pausados (Activo: False)
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-base font-bold font-mono text-amber-700">
                  {inactiveCount}
                </span>
                <span className="text-[10px] text-amber-600">bloqueados</span>
              </div>
            </div>

            <div className="bg-blue-50/70 border border-blue-200/80 rounded-lg px-3 py-2">
              <span className="text-[10px] font-mono text-blue-800 uppercase tracking-wider block">
                Colección MongoDB
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-[11px] font-mono font-bold text-blue-900 truncate">
                  dominios_email...
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Filtro y Búsqueda */}
        <div className="bg-slate-50/90 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                id="search-domain-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por dominio (ej: minera, .com, .pe)..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md placeholder-slate-400 text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500 mr-1 font-medium">Estado:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Todos ({domains.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Activos ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                statusFilter === 'inactive'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Inactivos ({inactiveCount})
            </button>
          </div>
        </div>

        {/* Lista de Registros (CRUD List Table) */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeSubNav === 'dominios-ia' ? (
            isLoading && domains.length === 0 ? (
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 py-12">
                <Loader2 className="w-4 h-4 animate-spin" />
                Cargando dominios...
              </div>
            ) : filteredDomains.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center max-w-md mx-auto my-8">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <Globe className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No se encontraron dominios</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {searchTerm
                    ? `No hay resultados para "${searchTerm}". Intenta con otro término.`
                    : 'Aún no has registrado ningún dominio para análisis con IA.'}
                </p>
                <button
                  onClick={openCreateModal}
                  className="mt-4 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-white" />
                  <span>Crear Primer Dominio</span>
                </button>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse" id="table-dominios-ia">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-4 font-semibold">Dominio Autorizado</th>
                      <th className="py-2.5 px-4 font-semibold">Estado (activo)</th>
                      <th className="py-2.5 px-4 font-semibold hidden md:table-cell">Descripción del Modelo</th>
                      <th className="py-2.5 px-4 font-semibold hidden sm:table-cell">Colección MongoDB</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredDomains.map((item) => (
                      <tr
                        key={item.id}
                        id={`domain-row-${item.id}`}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        {/* Dominio */}
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 transition-colors">
                              <Globe className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-600" />
                            </div>
                            <div>
                              <span className="text-slate-900 font-semibold">{item.dominio}</span>
                              <span className="text-[10px] text-slate-400 font-mono block">
                                @{item.dominio}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Estado con Toggle Switch */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={item.activo}
                              onClick={() => onToggleDomainActive(item.id)}
                              title={item.activo ? 'Desactivar dominio' : 'Activar dominio'}
                              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                item.activo ? 'bg-emerald-500' : 'bg-slate-300'
                              }`}
                            >
                              <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  item.activo ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>

                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                                item.activo
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.activo ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}
                              />
                              {item.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </td>

                        {/* Descripción Modelo */}
                        <td className="py-3 px-4 text-slate-500 hidden md:table-cell text-[11px]">
                          Dominio autorizado para análisis y extracción de entidades con IA
                        </td>

                        {/* Colección */}
                        <td className="py-3 px-4 font-mono text-[10px] text-slate-400 hidden sm:table-cell">
                          dominios_email_analisis_ia
                        </td>

                        {/* Acciones */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(item)}
                              title="Editar dominio"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingDomain(item)}
                              title="Eliminar dominio"
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : activeSubNav === 'reglas-ia' ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-2xl">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Reglas de Extracción de Entidades IA
              </h3>
              <p className="text-xs text-slate-600 mb-4">
                Parámetros aplicados al motor Gemini 2.5 para transcribir y clasificar correos entrantes de los dominios autorizados.
              </p>
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Patrón de Placas Vehiculares
                  </span>
                  <p className="text-slate-800 font-semibold">[A-Z0-9]{3}-[0-9]{3} (Ej: APE-980)</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Tipo de Operación Autodetectada
                  </span>
                  <p className="text-slate-800 font-semibold">Transporte Crítico, Granel, Carga Pesada</p>
                </div>
              </div>
            </div>
          ) : activeSubNav === 'mongodb-schema' ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-2xl">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-emerald-600" />
                Definición del Document Beanie / MongoDB
              </h3>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-2xl">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                Registro de Auditoría de Configuración
              </h3>
              <p className="text-xs text-slate-600 mb-4">
                Últimas modificaciones realizadas sobre la colección de dominios autorizados:
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-800 font-medium">Sincronización de esquema Beanie v2.4</span>
                  <span className="text-slate-400 font-mono text-[10px]">2026-09-20 20:25</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-800 font-medium">Verificación de dominio minera-ejemplo.com</span>
                  <span className="text-slate-400 font-mono text-[10px]">2026-09-18 10:30</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================= */}
      {/* MODAL PARA CREAR / EDITAR DOMINIO                         */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header del Modal */}
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <h3 className="text-xs font-bold tracking-tight">
                  {editingDomain ? 'Actualizar Dominio Autorizado' : 'Registrar Nuevo Dominio'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSaveForm} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Dominio de Correo <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
                    @
                  </span>
                  <input
                    id="input-dominio-field"
                    type="text"
                    value={inputDomain}
                    onChange={(e) => {
                      setInputDomain(e.target.value);
                      setFormError('');
                    }}
                    placeholder="cliente.com ó minera.com.pe"
                    className={`w-full pl-7 pr-3 py-2 text-xs font-mono bg-white border rounded-lg focus:outline-none transition-colors ${
                      formError
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-slate-300 focus:border-blue-600'
                    }`}
                    autoFocus
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  description: &quot;Dominio de correo autorizado para el análisis con IA (Ej: &apos;cliente.com&apos;)&quot;
                </p>
                {formError && (
                  <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formError}
                  </p>
                )}
              </div>

              {/* Checkbox / Switch: activo */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block">
                      Estado Activo (activo: bool)
                    </label>
                    <span className="text-[10px] text-slate-500 block leading-tight mt-0.5">
                      description: &quot;Indica si el dominio se encuentra habilitado actualmente&quot;
                    </span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={inputActive}
                    onClick={() => setInputActive(!inputActive)}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      inputActive ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        inputActive ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[10px] font-mono">
                  <span className="text-slate-400">Valor actual:</span>
                  <span
                    className={`font-bold ${inputActive ? 'text-emerald-700' : 'text-amber-700'}`}
                  >
                    {inputActive ? 'True (Habilitado)' : 'False (Pausado)'}
                  </span>
                </div>
              </div>

              {/* Footer de botones */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="btn-save-domain-modal"
                  disabled={isSaving}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>{editingDomain ? 'Guardar Cambios' : 'Registrar Dominio'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN                      */}
      {/* ========================================================= */}
      {deletingDomain && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden p-5">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 text-center">¿Eliminar Dominio?</h3>
            <p className="text-xs text-slate-600 text-center mt-1">
              Estás a punto de eliminar el dominio{' '}
              <span className="font-mono font-bold text-slate-900">
                {deletingDomain.dominio}
              </span>{' '}
              de la colección <span className="font-mono">dominios_email_analisis_ia</span>.
            </p>
            <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 mt-3 text-center leading-tight">
              Los correos entrantes de este dominio ya no serán procesados automáticamente por la IA.
            </p>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeletingDomain(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                id="btn-confirm-delete-domain"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL DE PAYLOAD JSON                                     */}
      {/* ========================================================= */}
      {showJsonModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold tracking-tight">
                  Payload JSON: dominios_email_analisis_ia
                </h3>
              </div>
              <button
                onClick={() => setShowJsonModal(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 bg-slate-950">
              <pre className="text-emerald-400 font-mono text-xs leading-relaxed">
                {jsonRepresentation}
              </pre>
            </div>

            <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500">
                {domains.length} registros en formato JSON
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyJson}
                  className="px-3 py-1.5 text-xs font-medium text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {hasCopiedJson ? (
                    <>
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-600" />
                      <span>Copiar JSON</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowJsonModal(false)}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
